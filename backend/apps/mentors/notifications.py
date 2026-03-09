from typing import Iterable
from threading import Thread
from django.conf import settings
from django.db import models
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from apps.messaging.models import Notification

User = get_user_model()


def _admin_recipients() -> Iterable[User]:
    return User.objects.filter(
        is_active=True
    ).filter(
        models.Q(user_type='admin') | models.Q(is_staff=True) | models.Q(is_superuser=True)
    )


def _send_email(to_email: str, subject: str, message: str) -> None:
    if not to_email:
        return
    from_email = settings.EMAIL_HOST_USER or "no-reply@bebrivus.com"
    send_mail(subject, message, from_email, [to_email], fail_silently=True)


def _send_email_async(to_email: str, subject: str, message: str) -> None:
    Thread(
        target=_send_email,
        args=(to_email, subject, message),
        daemon=True,
    ).start()


def _notify_user(user: User, title: str, body: str, notification_type: str, data: dict) -> None:
    Notification.objects.create(
        user=user,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data,
    )

    if getattr(user, 'email_notifications', True):
        _send_email_async(user.email, title, body)


def send_all_booking_emails(booking, student, mentor_obj, session_date, start_time, duration, session_type, notes):
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    from django.contrib.auth import get_user_model
    import logging
    logger = logging.getLogger(__name__)

    session_type_display = session_type.replace('_', ' ').title()

    def build_email_html(recipient_type, recipient_name, student_name, mentor_name):
        if recipient_type == 'student':
            heading = 'Booking Confirmed! ✅'
            color = '#10B981'
            greeting = f'Hello {recipient_name},'
            message = f'Your mentorship session with <strong>{mentor_name}</strong> has been successfully booked.'
            cta_text = 'View My Booking'
        elif recipient_type == 'mentor':
            heading = 'New Session Booked'
            color = '#3b82f6'
            greeting = f'Hello {recipient_name},'
            message = f'<strong>{student_name}</strong> has booked a mentorship session with you.'
            cta_text = 'View Booking Details'
        else:  # admin
            heading = 'New Mentorship Booking'
            color = '#8b5cf6'
            greeting = 'Hello Admin,'
            message = f'A new mentorship session has been booked between <strong>{student_name}</strong> and <strong>{mentor_name}</strong>.'
            cta_text = 'View in Admin Panel'

        return f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:{color};padding:28px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">beBrivus</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0 0;">Mentorship Platform</p>
          </div>
          <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
            <h2 style="color:#111827;margin:0 0 8px 0;">{heading}</h2>
            <p>{greeting}</p>
            <p>{message}</p>
            <div style="background:white;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
              <h3 style="color:{color};margin:0 0 14px 0;">📅 Session Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Student</td><td style="padding:6px 0;font-weight:600;">{student_name}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Mentor</td><td style="padding:6px 0;font-weight:600;">{mentor_name}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;font-weight:600;">{session_date}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;">{start_time}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;font-weight:600;">{duration} minutes</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Session Type</td><td style="padding:6px 0;font-weight:600;">{session_type_display}</td></tr>
                {'<tr><td style="padding:6px 0;color:#6b7280;">Notes</td><td style="padding:6px 0;">' + notes + '</td></tr>' if notes else ''}
              </table>
            </div>
            <div style="text-align:center;margin:20px 0;">
              <a href="http://localhost:5173/mentors"
                 style="background:{color};color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
                {cta_text}
              </a>
            </div>
            <p style="font-size:12px;color:#9ca3af;text-align:center;">beBrivus — Empowering African Students</p>
          </div>
        </div>
        """

    student_name = student.get_full_name() or student.username
    mentor_name = str(mentor_obj)
    mentor_user = mentor_obj.user

    recipients = [
        {
            'email': student.email,
            'type': 'student',
            'name': student_name,
            'subject': f'✅ Booking Confirmed — Session with {mentor_name}',
        },
        {
            'email': mentor_user.email,
            'type': 'mentor',
            'name': mentor_name,
            'subject': f'📅 New Session Booked — {student_name}',
        },
    ]

    # Add ALL active admins
    User = get_user_model()
    admins = User.objects.filter(is_staff=True, is_active=True)
    for admin in admins:
        if admin.email:
            recipients.append({
                'email': admin.email,
                'type': 'admin',
                'name': admin.get_full_name() or admin.username,
                'subject': f'📋 New Booking — {student_name} with {mentor_name}',
            })

    for recipient in recipients:
        try:
            html = build_email_html(
                recipient_type=recipient['type'],
                recipient_name=recipient['name'],
                student_name=student_name,
                mentor_name=mentor_name
            )
            plain = f"New mentorship booking.\nStudent: {student_name}\nMentor: {mentor_name}\nDate: {session_date}\nTime: {start_time}\nDuration: {duration} mins\nType: {session_type_display}"
            msg = EmailMultiAlternatives(
                subject=recipient['subject'],
                body=plain,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient['email']]
            )
            msg.attach_alternative(html, 'text/html')
            msg.send()
            logger.info(f'Booking email sent to {recipient["type"]}: {recipient["email"]}')
        except Exception as e:
            logger.error(f'Failed to send booking email to {recipient["email"]}: {e}')


def notify_booking_created(session) -> None:
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "New mentoring session booked"
    body = (
        f"{mentee_user.get_full_name()} booked a session with "
        f"{mentor_user.get_full_name()} on "
        f"{session.scheduled_start.strftime('%b %d, %Y at %H:%M')}"
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }

    _notify_user(mentor_user, title, body, "booking", data)

    for admin_user in _admin_recipients():
        _notify_user(admin_user, title, body, "booking", data)
    
    # User booking confirmation with HTML template
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.conf import settings
    import base64
    import os
    
    def get_logo_base64():
        try:
            logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'beBivus.png')
            logo_path = os.path.abspath(logo_path)
            print(f"Loading logo from: {logo_path}")
            print(f"File exists: {os.path.exists(logo_path)}")
            
            with open(logo_path, 'rb') as f:
                logo_data = base64.b64encode(f.read()).decode('utf-8')
            
            print(f"Base64 length: {len(logo_data)}")
            return f"data:image/png;base64,{logo_data}"
        except Exception as e:
            print(f"Logo error: {e}")
            return ""
    
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    duration = int((session.scheduled_end - session.scheduled_start).total_seconds() / 60)
    
    html_content = render_to_string('emails/booking_confirmed.html', {
        'user_name': mentee_user.get_full_name(),
        'mentor_name': mentor_user.get_full_name(),
        'session_date': session.scheduled_start.strftime('%b %d, %Y'),
        'session_time': session.scheduled_start.strftime('%H:%M'),
        'duration': f'{duration} minutes',
        'session_format': session.get_session_type_display(),
        'frontend_url': frontend_url,
        'dashboard_url': f'{frontend_url}/mentorship',
        'logo_base64': get_logo_base64(),
    })
    
    subject = f'✅ Session Confirmed — {mentor_user.get_full_name()} on {session.scheduled_start.strftime("%b %d")} at {session.scheduled_start.strftime("%H:%M")}'
    from_email = settings.EMAIL_HOST_USER or 'no-reply@bebrivus.com'
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=f'Your session with {mentor_user.get_full_name()} has been confirmed.',
        from_email=from_email,
        to=[mentee_user.email]
    )
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send(fail_silently=False)
        print(f"✓ Email sent to {mentee_user.email} — booking confirmation")
    except Exception as e:
        print(f"Failed to send booking confirmation: {e}")


def notify_booking_cancelled(session, cancelled_by: User) -> None:
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "Mentoring session cancelled"
    body = (
        f"Session on {session.scheduled_start.strftime('%b %d, %Y at %H:%M')} "
        f"was cancelled by {cancelled_by.get_full_name()}."
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }

    _notify_user(mentor_user, title, body, "cancellation", data)

    for admin_user in _admin_recipients():
        _notify_user(admin_user, title, body, "cancellation", data)


def notify_session_reminder(session) -> None:
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "Mentoring session reminder"
    body = (
        f"Reminder: session is scheduled for "
        f"{session.scheduled_start.strftime('%b %d, %Y at %H:%M')}"
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }

    _notify_user(mentor_user, title, body, "reminder", data)
    _notify_user(mentee_user, title, body, "reminder", data)


def notify_admin_escalation(session) -> None:
    mentee_user = session.mentee
    title = "Mentor response overdue"
    body = (
        f"Mentor has not responded to a booking from {mentee_user.get_full_name()} "
        f"scheduled for {session.scheduled_start.strftime('%b %d, %Y at %H:%M')}."
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }

    for admin_user in _admin_recipients():
        _notify_user(admin_user, title, body, "admin_escalation", data)


def notify_session_confirmed(session) -> None:
    """Notify user when mentor confirms session"""
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.conf import settings
    import base64
    import os
    
    def get_logo_base64():
        try:
            logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'beBivus.png')
            logo_path = os.path.abspath(logo_path)
            print(f"Loading logo from: {logo_path}")
            print(f"File exists: {os.path.exists(logo_path)}")
            
            with open(logo_path, 'rb') as f:
                logo_data = base64.b64encode(f.read()).decode('utf-8')
            
            print(f"Base64 length: {len(logo_data)}")
            return f"data:image/png;base64,{logo_data}"
        except Exception as e:
            print(f"Logo error: {e}")
            return ""
    
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    duration = int((session.scheduled_end - session.scheduled_start).total_seconds() / 60)
    
    html_content = render_to_string('emails/booking_confirmed.html', {
        'user_name': mentee_user.get_full_name(),
        'mentor_name': mentor_user.get_full_name(),
        'session_date': session.scheduled_start.strftime('%b %d, %Y'),
        'session_time': session.scheduled_start.strftime('%H:%M'),
        'duration': f'{duration} minutes',
        'session_format': session.get_session_type_display(),
        'frontend_url': frontend_url,
        'dashboard_url': f'{frontend_url}/mentorship',
        'logo_base64': get_logo_base64(),
    })
    
    title = "Session Confirmed"
    subject = f'✅ Session Confirmed — {mentor_user.get_full_name()} on {session.scheduled_start.strftime("%b %d")} at {session.scheduled_start.strftime("%H:%M")}'
    body = (
        f"Your session with {mentor_user.get_full_name()} has been confirmed for "
        f"{session.scheduled_start.strftime('%b %d, %Y')} at {session.scheduled_start.strftime('%H:%M')}.\n\n"
        f"Session Details:\n"
        f"Mentor: {mentor_user.get_full_name()}\n"
        f"Date: {session.scheduled_start.strftime('%b %d, %Y')}\n"
        f"Time: {session.scheduled_start.strftime('%H:%M')}\n"
        f"Duration: {duration} minutes\n"
        f"Session Type: {session.get_session_type_display()}"
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }
    
    # Create notification
    Notification.objects.create(
        user=mentee_user,
        title=title,
        body=body,
        notification_type="confirmation",
        data=data,
    )
    
    # Send HTML email
    if getattr(mentee_user, 'email_notifications', True):
        from_email = settings.EMAIL_HOST_USER or 'no-reply@bebrivus.com'
        email = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=from_email,
            to=[mentee_user.email]
        )
        email.attach_alternative(html_content, "text/html")
        
        try:
            email.send(fail_silently=False)
            print(f"✓ Email sent to {mentee_user.email} — session confirmed")
        except Exception as e:
            print(f"Failed to send session confirmation: {e}")


def notify_session_start_time_updated(session) -> None:
    """Notify user when mentor updates session start time"""
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "Session Time Updated"
    body = (
        f"Your upcoming session with {mentor_user.get_full_name()} is scheduled to start at "
        f"{session.scheduled_start.strftime('%H:%M')} on {session.scheduled_start.strftime('%b %d, %Y')}.\n\n"
        f"Please be online and ready at the scheduled time."
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }
    _notify_user(mentee_user, title, body, "time_update", data)
    print(f"✓ Email sent to {mentee_user.email} — session time updated")


def notify_session_rejected(session) -> None:
    """Notify user when mentor rejects session"""
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "Session Request Not Accepted"
    body = (
        f"Unfortunately your session request with {mentor_user.get_full_name()} was not accepted. "
        f"Please book another available slot."
    )
    data = {
        "session_id": session.id,
        "mentor_id": session.mentor.id,
        "mentee_id": mentee_user.id,
        "scheduled_start": session.scheduled_start.isoformat(),
    }
    _notify_user(mentee_user, title, body, "rejection", data)
    print(f"✓ Email sent to {mentee_user.email} — session rejected")

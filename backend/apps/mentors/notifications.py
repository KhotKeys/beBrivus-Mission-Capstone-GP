from typing import Iterable
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


def _notify_user(user: User, title: str, body: str, notification_type: str, data: dict) -> None:
    Notification.objects.create(
        user=user,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data,
    )

    if getattr(user, 'email_notifications', True):
        _send_email(user.email, title, body)


def notify_booking_created(session) -> None:
    mentor_user = session.mentor.user
    mentee_user = session.mentee
    title = "New mentoring session booked"
    body = (
        f"{mentee_user.get_full_name()} booked a session on "
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

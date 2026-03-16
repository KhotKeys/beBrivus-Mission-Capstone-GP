"""
Centralized Email Notification Service for beBrivus
Handles all email notifications for admins, mentors, and users
"""
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.conf import settings
from threading import Thread
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class EmailService:
    """Centralized email service for all notifications"""
    
    @staticmethod
    def get_admin_emails() -> List[str]:
        """Get list of admin emails from settings"""
        # Primary admin email
        admin_emails = [getattr(settings, 'MODERATION_EMAIL', 'ethxkeys@gmail.com')]
        
        # Additional admin emails if configured
        additional = getattr(settings, 'ADMIN_EMAIL_RECIPIENTS', [])
        if additional and isinstance(additional, list):
            admin_emails.extend(additional)
        
        return list(set(filter(None, admin_emails)))
    
    @staticmethod
    def get_mentor_emails(mentors) -> List[str]:
        """Extract mentor emails"""
        if isinstance(mentors, list):
            return [m.email for m in mentors if hasattr(m, 'email') and m.email]
        elif hasattr(mentors, 'email'):
            return [mentors.email]
        return []
    
    @staticmethod
    def send_html_email(
        subject: str,
        template_name: str,
        context: Dict,
        to_emails: List[str],
        from_email: Optional[str] = None,
        plain_text: Optional[str] = None,
        fail_silently: bool = True,
        async_send: bool = False
    ) -> bool:
        """
        Send HTML email with optional plain text fallback
        
        Args:
            subject: Email subject
            template_name: Path to HTML template (e.g., 'emails/password_reset.html')
            context: Context dict for template rendering
            to_emails: List of recipient emails
            from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
            plain_text: Plain text version (auto-generated if not provided)
            fail_silently: Don't raise exceptions on failure
            async_send: Send asynchronously (recommended for long operations)
            
        Returns:
            True if successful, False otherwise
        """
        if not to_emails or not all(to_emails):
            logger.warning(f"Attempted to send email to invalid recipients: {to_emails}")
            return False
        
        from_email = from_email or settings.DEFAULT_FROM_EMAIL or 'no-reply@bebrivus.com'
        to_emails = [e for e in to_emails if e]  # Filter empty
        
        if not to_emails:
            return False
        
        try:
            # Render HTML template
            html_message = render_to_string(template_name, context)
            
            # Send email
            if async_send:
                thread = Thread(
                    target=lambda: EmailService._send_html_email_sync(
                        subject, html_message, plain_text, from_email, to_emails, fail_silently
                    )
                )
                thread.daemon = True
                thread.start()
                return True
            else:
                return EmailService._send_html_email_sync(
                    subject, html_message, plain_text, from_email, to_emails, fail_silently
                )
        
        except Exception as e:
            logger.error(f"Failed to render email template {template_name}: {str(e)}")
            if not fail_silently:
                raise
            return False
    
    @staticmethod
    def _send_html_email_sync(
        subject: str,
        html_message: str,
        plain_text: Optional[str],
        from_email: str,
        to_emails: List[str],
        fail_silently: bool
    ) -> bool:
        """Internal method to send HTML email synchronously"""
        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text or strip_html(html_message),
                from_email=from_email,
                to=to_emails
            )
            email.attach_alternative(html_message, "text/html")
            email.send(fail_silently=fail_silently)
            
            logger.info(f"Email sent: {subject} to {', '.join(to_emails)}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send email {subject}: {str(e)}")
            if not fail_silently:
                raise
            return False
    
    @staticmethod
    def send_plain_text_email(
        subject: str,
        message: str,
        to_emails: List[str],
        from_email: Optional[str] = None,
        fail_silently: bool = True,
        async_send: bool = False
    ) -> bool:
        """
        Send plain text email
        
        Args:
            subject: Email subject
            message: Plain text message
            to_emails: List of recipient emails
            from_email: Sender email
            fail_silently: Don't raise exceptions
            async_send: Send asynchronously
            
        Returns:
            True if successful
        """
        if not to_emails or not all(to_emails):
            logger.warning(f"Attempted to send email to invalid recipients: {to_emails}")
            return False
        
        from_email = from_email or settings.DEFAULT_FROM_EMAIL or 'no-reply@bebrivus.com'
        to_emails = [e for e in to_emails if e]
        
        if not to_emails:
            return False
        
        if async_send:
            thread = Thread(
                target=lambda: send_mail(
                    subject, message, from_email, to_emails, fail_silently=fail_silently
                )
            )
            thread.daemon = True
            thread.start()
            return True
        else:
            try:
                send_mail(subject, message, from_email, to_emails, fail_silently=fail_silently)
                logger.info(f"Email sent: {subject} to {', '.join(to_emails)}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email {subject}: {str(e)}")
                if not fail_silently:
                    raise
                return False


# Notification Functions for Specific Events

def notify_moderation_violation_admin(violation: Dict) -> bool:
    """
    Notify admins of content violation flagged by AI
    
    Args:
        violation: Dict with keys:
            - content: Flagged content text
            - username: Author username
            - post_id: Content post ID
            - categories: List of violation categories
            - confidence: AI confidence score
            - reason: Reason for flag
            - content_type: Type (forum_post, chat_message, etc)
            - source_url: Optional URL to content
    
    Returns:
        True if email sent successfully
    """
    admin_emails = EmailService.get_admin_emails()
    
    if not admin_emails:
        logger.warning("No admin emails configured for moderation alerts")
        return False
    
    context = {
        'content': violation.get('content', '')[:500],
        'username': violation.get('username', 'Unknown'),
        'post_id': violation.get('post_id', 'N/A'),
        'categories': ', '.join(violation.get('categories', [])),
        'confidence': f"{violation.get('confidence', 0):.1%}",
        'reason': violation.get('reason', ''),
        'content_type': violation.get('content_type', 'forum post'),
        'source_url': violation.get('source_url', ''),
        'timestamp': violation.get('timestamp', '')
    }
    
    return EmailService.send_html_email(
        subject=f"Content Moderation Alert: {context['categories']}",
        template_name='emails/moderation_alert_admin.html',
        context=context,
        to_emails=admin_emails,
        async_send=True
    )


def notify_user_content_flagged(user_email: str, violation: Dict) -> bool:
    """
    Notify user that their content has been flagged
    
    Args:
        user_email: User's email address
        violation: Dict with violation details
    
    Returns:
        True if email sent
    """
    if not user_email:
        return False
    
    context = {
        'username': violation.get('username', 'User'),
        'categories': ', '.join(violation.get('categories', [])),
        'reason': violation.get('reason', ''),
        'content_preview': violation.get('content', '')[:200],
        'support_url': f"{getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com')}/help",
    }
    
    return EmailService.send_html_email(
        subject="Your Content Has Been Flagged",
        template_name='emails/content_flagged_user.html',
        context=context,
        to_emails=[user_email],
        async_send=True
    )


def notify_mentor_violation_alert(mentor_email: str, violation: Dict) -> bool:
    """
    Notify mentor that a mentee's content has been flagged
    
    Args:
        mentor_email: Mentor's email
        violation: Dict with violation details
    
    Returns:
        True if email sent
    """
    if not mentor_email:
        return False
    
    context = {
        'username': violation.get('username', 'User'),
        'categories': ', '.join(violation.get('categories', [])),
        'reason': violation.get('reason', ''),
        'content_type': violation.get('content_type', 'content'),
    }
    
    return EmailService.send_html_email(
        subject=f"Alert: Mentee Content Flagged",
        template_name='emails/violation_alert_mentor.html',
        context=context,
        to_emails=[mentor_email],
        async_send=True
    )


def notify_password_reset(user_email: str, user_name: str, reset_link: str) -> bool:
    """
    Send password reset email to user
    
    Args:
        user_email: User's email
        user_name: User's first name
        reset_link: Password reset link
    
    Returns:
        True if sent
    """
    context = {
        'user_name': user_name,
        'reset_link': reset_link,
        'expiry_hours': 24,
        'support_url': f"{getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com')}/help",
    }
    
    return EmailService.send_html_email(
        subject='Password Reset Request - beBrivus',
        template_name='emails/password_reset.html',
        context=context,
        to_emails=[user_email],
        async_send=True
    )


def notify_booking_confirmed(user_email: str, user_name: str, session_details: Dict) -> bool:
    """
    Send booking confirmation email
    
    Args:
        user_email: User's email
        user_name: User's name
        session_details: Dict with mentor, date, time, etc
    
    Returns:
        True if sent
    """
    context = {
        'user_name': user_name,
        'mentor_name': session_details.get('mentor_name', ''),
        'session_date': session_details.get('session_date', ''),
        'session_time': session_details.get('session_time', ''),
        'session_url': session_details.get('session_url', ''),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'support@bebrivus.com'),
    }
    
    return EmailService.send_html_email(
        subject='Booking Confirmed - beBrivus',
        template_name='emails/booking_confirmed.html',
        context=context,
        to_emails=[user_email],
        async_send=False
    )


def notify_application_status_change(
    user_email: str,
    user_name: str,
    opportunity_title: str,
    new_status: str,
    feedback: Optional[str] = None
) -> bool:
    """
    Send application status update email
    
    Args:
        user_email: User's email
        user_name: User's name
        opportunity_title: Opportunity/job title
        new_status: New status (accepted, rejected, under_review)
        feedback: Optional feedback from reviewers
    
    Returns:
        True if sent
    """
    # Validate status and get template
    status_templates = {
        'accepted': 'emails/application_accepted.html',
        'rejected': 'emails/application_rejected.html',
        'under_review': 'emails/application_under_review.html',
    }
    
    template_name = status_templates.get(new_status.lower())
    if not template_name:
        logger.warning(f"Unknown application status: {new_status}")
        return False
    
    context = {
        'user_name': user_name,
        'opportunity_title': opportunity_title,
        'status': new_status,
        'feedback': feedback or '',
        'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com')}/applications",
        'support_url': f"{getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com')}/help",
    }
    
    subject_map = {
        'accepted': 'Congratulations! Your Application Was Accepted',
        'rejected': 'Application Status Update',
        'under_review': 'Your Application is Under Review',
    }
    
    return EmailService.send_html_email(
        subject=subject_map.get(new_status.lower(), 'Application Status Update'),
        template_name=template_name,
        context=context,
        to_emails=[user_email],
        async_send=True
    )


def notify_session_cancellation(
    user_email: str,
    user_name: str,
    mentor_name: str,
    reason: Optional[str] = None
) -> bool:
    """
    Notify user that a booked session has been cancelled
    
    Args:
        user_email: User's email
        user_name: User's name
        mentor_name: Mentor's name
        reason: Cancellation reason
    
    Returns:
        True if sent
    """
    context = {
        'user_name': user_name,
        'mentor_name': mentor_name,
        'reason': reason or '',
        'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com')}/sessions",
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'support@bebrivus.com'),
    }
    
    return EmailService.send_html_email(
        subject='Session Cancelled - beBrivus',
        template_name='emails/session_cancelled.html',
        context=context,
        to_emails=[user_email],
        async_send=True
    )


def notify_mentor_invitation(mentor_email: str, mentor_name: str, invitation_data: Dict) -> bool:
    """
    Send mentor invitation email
    
    Args:
        mentor_email: Mentor's email
        mentor_name: Mentor's name
        invitation_data: Dict with invitation details
    
    Returns:
        True if sent
    """
    context = {
        'mentor_name': mentor_name,
        'student_name': invitation_data.get('student_name', ''),
        'topic': invitation_data.get('topic', ''),
        'description': invitation_data.get('description', ''),
        'accept_link': invitation_data.get('accept_link', ''),
        'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://bebrivus.com'),
    }
    
    return EmailService.send_html_email(
        subject='New Student Mentor Invitation',
        template_name='emails/mentor_invitation.html',
        context=context,
        to_emails=[mentor_email],
        async_send=False
    )


# Utility Functions

def strip_html(html_text: str) -> str:
    """Convert HTML to plain text (simple version)"""
    import re
    # Remove HTML tags
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', html_text)
    # Decode HTML entities
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")
    return text

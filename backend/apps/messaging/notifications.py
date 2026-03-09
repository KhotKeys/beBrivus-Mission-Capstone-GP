from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


def create_admin_notification(title, body, notification_type, link=None, data=None):
    """
    Create notifications for all admin users
    """
    admin_users = User.objects.filter(user_type='admin', is_active=True)
    
    notifications = []
    for admin in admin_users:
        notification = Notification.objects.create(
            user=admin,
            title=title,
            body=body,
            notification_type=notification_type,
            link=link,
            data=data or {}
        )
        notifications.append(notification)
    
    return notifications


def notify_moderation_flag(author_username, content_preview):
    """Notify admins of new AI-flagged content"""
    return create_admin_notification(
        title='🚨 New Content Flagged by AI',
        body=f'{author_username}: {content_preview[:100]}...',
        notification_type='moderation',
        link='/admin/forum/moderation'
    )


def notify_booking_created(user_name, mentor_name):
    """Notify admins of new booking"""
    return create_admin_notification(
        title='📅 New Session Booked',
        body=f'{user_name} booked a session with {mentor_name}',
        notification_type='booking',
        link='/admin/dashboard'
    )


def notify_booking_confirmed(user_name, mentor_name):
    """Notify admins of confirmed booking"""
    return create_admin_notification(
        title='📅 Session Confirmed',
        body=f'{mentor_name} confirmed session with {user_name}',
        notification_type='booking',
        link='/admin/dashboard'
    )


def notify_booking_rejected(user_name, mentor_name):
    """Notify admins of rejected booking"""
    return create_admin_notification(
        title='📅 Session Rejected',
        body=f'{mentor_name} rejected session request from {user_name}',
        notification_type='booking',
        link='/admin/dashboard'
    )


def notify_ai_coach_misuse(user_name):
    """Notify admins of AI coach misuse"""
    return create_admin_notification(
        title='🤖 AI Coach Flagged Harmful Input',
        body=f'AI Coach flagged harmful input from {user_name}',
        notification_type='ai_coach',
        link='/admin/dashboard'
    )


def notify_user_registration(user_name):
    """Notify admins of new user registration"""
    return create_admin_notification(
        title='👤 New User Registered',
        body=f'New user registered: {user_name}',
        notification_type='user_registration',
        link='/admin/users'
    )


def notify_application_submitted(user_name, opportunity_title):
    """Notify admins of new application"""
    return create_admin_notification(
        title='📋 New Application Submitted',
        body=f'{user_name} applied to {opportunity_title}',
        notification_type='application',
        link='/admin/applications'
    )

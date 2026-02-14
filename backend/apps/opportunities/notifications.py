from typing import Iterable
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.db import models
from apps.messaging.models import Notification

User = get_user_model()


def _admin_recipients() -> Iterable["User"]:
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


def _notify_user(user: User, title: str, body: str, data: dict) -> None:
    Notification.objects.create(
        user=user,
        title=title,
        body=body,
        notification_type="institution_activity",
        data=data,
    )

    if getattr(user, "email_notifications", True):
        _send_email(user.email, title, body)


def notify_institution_opportunity_published(opportunity) -> None:
    creator = opportunity.created_by
    title = "Institution opportunity published"
    body = (
        f"{creator.get_full_name() or creator.email} published "
        f"{opportunity.title} for {opportunity.organization}."
    )
    data = {
        "opportunity_id": opportunity.id,
        "organization": opportunity.organization,
        "status": opportunity.status,
    }

    for admin_user in _admin_recipients():
        _notify_user(admin_user, title, body, data)

from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.mentors.models import MentorshipSession
from apps.mentors.notifications import notify_admin_escalation
from apps.messaging.models import Notification


class Command(BaseCommand):
    help = "Notify admins about bookings awaiting mentor response"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timezone.timedelta(hours=24)

        sessions = MentorshipSession.objects.filter(
            status='scheduled',
            created_at__lte=cutoff,
        )

        sent_count = 0
        for session in sessions:
            already_sent = Notification.objects.filter(
                notification_type='admin_escalation',
                data__session_id=session.id
            ).exists()
            if already_sent:
                continue

            notify_admin_escalation(session)
            sent_count += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} admin escalation notifications"))

from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.mentors.models import MentorshipSession
from apps.mentors.notifications import notify_session_reminder
from apps.messaging.models import Notification


class Command(BaseCommand):
    help = "Send 24-hour session reminders to mentors and mentees"

    def handle(self, *args, **options):
        now = timezone.now()
        window_start = now
        window_end = now + timezone.timedelta(hours=24)

        sessions = MentorshipSession.objects.filter(
            status__in=['scheduled', 'confirmed'],
            scheduled_start__gte=window_start,
            scheduled_start__lte=window_end,
        )

        sent_count = 0
        for session in sessions:
            already_sent = Notification.objects.filter(
                notification_type='reminder',
                data__session_id=session.id
            ).exists()
            if already_sent:
                continue

            notify_session_reminder(session)
            sent_count += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} reminder notifications"))

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.mentors.models import MentorshipSession

print('=== DELETING GHOST SESSION 32 ===')
try:
    session = MentorshipSession.objects.get(id=32)
    print(f'Found: Session {session.id}')
    print(f'  Mentor: {session.mentor.user.get_full_name()}')
    print(f'  Mentee: {session.mentee.get_full_name()}')
    print(f'  Time: {session.scheduled_start}')
    print(f'  Status: {session.status}')
    
    session.delete()
    print('Session 32 deleted successfully')
except MentorshipSession.DoesNotExist:
    print('Session 32 not found')

print('=== VERIFYING GABRIEL\'S SCHEDULE ===')
from apps.mentors.models import MentorProfile
from django.utils import timezone
from datetime import datetime

mentor = MentorProfile.objects.get(id=17)
target_date = datetime(2026, 2, 23, 9, 0, 0)
target_start = timezone.make_aware(target_date)
target_end = target_start + timezone.timedelta(hours=1)

conflicts = MentorshipSession.objects.filter(
    mentor=mentor,
    scheduled_start__lt=target_end,
    scheduled_end__gt=target_start
).exclude(status__in=['cancelled', 'rejected', 'no_show', 'completed'])

print(f'Conflicts at 09:00 on 2026-02-23: {conflicts.count()}')
if conflicts.count() == 0:
    print('Slot is now available for booking')
else:
    for s in conflicts:
        print(f'  Still blocked by Session {s.id}: {s.status}')

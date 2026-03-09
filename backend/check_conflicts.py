import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.mentors.models import MentorProfile, MentorshipSession
from django.utils import timezone
from datetime import datetime

mentor = MentorProfile.objects.get(id=17)
print('=== GABRIEL PAWUOI (Mentor ID: 17) ===')
print(f'Mentor: {mentor.user.get_full_name()}')
print(f'Email: {mentor.user.email}')
print()

target_date = datetime(2026, 2, 23, 9, 0, 0)
target_start = timezone.make_aware(target_date)
target_end = target_start + timezone.timedelta(hours=1)
print(f'Target slot: {target_start} to {target_end}')
print()

sessions = MentorshipSession.objects.filter(
    mentor=mentor, 
    scheduled_start__date=target_date.date()
).order_by('scheduled_start')

print(f'ALL sessions on 2026-02-23 ({sessions.count()}):')
for s in sessions:
    print(f'  Session {s.id}: {s.scheduled_start} to {s.scheduled_end}')
    print(f'    Status: {s.status}')
    print(f'    Mentee: {s.mentee.get_full_name()}')
    print(f'    Created: {s.created_at}')
print()

conflicts = MentorshipSession.objects.filter(
    mentor=mentor,
    scheduled_start__lt=target_end,
    scheduled_end__gt=target_start
).exclude(status__in=['cancelled', 'rejected', 'no_show', 'completed'])

print(f'CONFLICTING sessions (current logic) ({conflicts.count()}):')
for s in conflicts:
    print(f'  Session {s.id}: {s.scheduled_start} to {s.scheduled_end} - Status: {s.status}')

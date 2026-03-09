import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.mentors.models import MentorProfile, MentorshipSession
from django.contrib.auth import get_user_model

User = get_user_model()

print('=== SESSION 32 DETAILS ===')
session = MentorshipSession.objects.get(id=32)
print(f'ID: {session.id}')
print(f'Mentor: {session.mentor.user.get_full_name()} ({session.mentor.user.email})')
print(f'Mentee: {session.mentee.get_full_name()} ({session.mentee.email})')
print(f'Scheduled: {session.scheduled_start} to {session.scheduled_end}')
print(f'Status: {session.status}')
print(f'Session Type: {session.session_type}')
print(f'Created: {session.created_at}')
print(f'Updated: {session.updated_at}')
print(f'Notes: {session.notes}')
print()

print('=== ALL SESSIONS FOR GABRIEL (Mentor ID: 17) ===')
mentor = MentorProfile.objects.get(id=17)
all_sessions = MentorshipSession.objects.filter(mentor=mentor).order_by('-created_at')
print(f'Total: {all_sessions.count()}')
for s in all_sessions:
    print(f'  {s.id}: {s.mentee.get_full_name()} - {s.scheduled_start} - {s.status}')

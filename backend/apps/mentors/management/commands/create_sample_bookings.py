from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from apps.mentors.models import MentorProfile, MentorshipSession

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample mentorship session bookings for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID to create bookings for (default: first user)',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of sample bookings to create (default: 5)',
        )

    def handle(self, *args, **options):
        # Get user
        if options['user_id']:
            try:
                user = User.objects.get(id=options['user_id'])
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with ID {options["user_id"]} not found')
                )
                return
        else:
            user = User.objects.first()
            if not user:
                self.stdout.write(
                    self.style.ERROR('No users found. Create a user first.')
                )
                return

        # Get mentors
        mentors = list(MentorProfile.objects.all()[:3])
        if not mentors:
            self.stdout.write(
                self.style.ERROR('No mentors found. Create mentors first.')
            )
            return

        # Session types and statuses for variety
        session_types = ['video', 'chat', 'email', 'in_person']
        statuses = ['scheduled', 'completed', 'requested']
        agendas = [
            'Career guidance and planning',
            'Technical interview preparation',
            'Portfolio review and feedback',
            'Industry insights and networking',
            'Skill development discussion'
        ]

        count = options['count']
        created_count = 0

        for i in range(count):
            # Create sessions at different times (past, present, future)
            if i < count // 3:
                # Past sessions
                scheduled_start = timezone.now() - timedelta(
                    days=30 + i * 5,
                    hours=10 + (i % 8)
                )
                status = 'completed'
                actual_start = scheduled_start
                actual_end = scheduled_start + timedelta(hours=1)
            elif i < 2 * count // 3:
                # Future sessions
                scheduled_start = timezone.now() + timedelta(
                    days=7 + i * 3,
                    hours=14 + (i % 6)
                )
                status = 'scheduled'
                actual_start = None
                actual_end = None
            else:
                # Requested sessions
                scheduled_start = timezone.now() + timedelta(
                    days=14 + i * 2,
                    hours=9 + (i % 8)
                )
                status = 'requested'
                actual_start = None
                actual_end = None

            scheduled_end = scheduled_start + timedelta(hours=1)
            mentor = mentors[i % len(mentors)]
            session_type = session_types[i % len(session_types)]
            agenda = agendas[i % len(agendas)]

            session = MentorshipSession.objects.create(
                mentor=mentor,
                mentee=user,
                session_type=session_type,
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                actual_start=actual_start,
                actual_end=actual_end,
                agenda=agenda,
                notes=f'Sample session {i + 1} with {mentor.user.get_full_name()}',
                mentee_notes=f'Looking forward to discussing {agenda.lower()}',
                status=status,
                meeting_link='https://meet.google.com/sample-meeting' if session_type == 'video' else '',
                meeting_id=f'meeting-{i + 1}' if session_type == 'video' else '',
                location='Conference Room A' if session_type == 'in_person' else ''
            )

            created_count += 1
            self.stdout.write(
                f'Created session: {session.mentee.get_full_name()} → '
                f'{session.mentor.user.get_full_name()} on '
                f'{session.scheduled_start.strftime("%Y-%m-%d %H:%M")} '
                f'({session.status})'
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} sample bookings for {user.get_full_name()}'
            )
        )

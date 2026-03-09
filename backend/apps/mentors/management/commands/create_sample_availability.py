from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, time, timedelta
from apps.mentors.models import MentorProfile, MentorAvailability, MentorSpecificAvailability


class Command(BaseCommand):
    help = 'Create sample mentor availability data for testing'

    def handle(self, *args, **options):
        """Create sample availability for all mentors"""
        mentors = MentorProfile.objects.all()
        
        if not mentors.exists():
            self.stdout.write(
                self.style.WARNING('No mentors found. Create mentors first.')
            )
            return
        
        for mentor in mentors:
            # Create weekly availability (Monday to Friday, 9 AM to 5 PM)
            for day in range(5):  # Monday to Friday
                availability, created = MentorAvailability.objects.get_or_create(
                    mentor=mentor,
                    day_of_week=day,
                    start_time=time(9, 0),  # 9 AM
                    defaults={
                        'end_time': time(17, 0),  # 5 PM
                        'timezone': 'UTC',
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(
                        f'Created weekly availability for {mentor.user.get_full_name()}: '
                        f'{availability.get_day_of_week_display()} 9:00-17:00'
                    )
            
            # Add some weekend availability
            weekend_availability, created = MentorAvailability.objects.get_or_create(
                mentor=mentor,
                day_of_week=5,  # Saturday
                start_time=time(10, 0),  # 10 AM
                defaults={
                    'end_time': time(14, 0),  # 2 PM
                    'timezone': 'UTC',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(
                    f'Created weekend availability for {mentor.user.get_full_name()}: '
                    f'Saturday 10:00-14:00'
                )
            
            # Add some specific date unavailability (next week)
            next_week = timezone.now().date() + timedelta(days=7)
            unavailability, created = MentorSpecificAvailability.objects.get_or_create(
                mentor=mentor,
                date=next_week,
                start_time=time(9, 0),
                defaults={
                    'end_time': time(12, 0),
                    'timezone': 'UTC',
                    'is_available': False,
                    'reason': 'Team meeting'
                }
            )
            if created:
                self.stdout.write(
                    f'Created unavailability for {mentor.user.get_full_name()}: '
                    f'{next_week} 9:00-12:00 (Team meeting)'
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created availability data for {mentors.count()} mentors'
            )
        )

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.opportunities.models import Opportunity, OpportunityCategory

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample opportunities for testing'

    def handle(self, *args, **options):
        # Get or create admin user for creating opportunities
        admin_user, created = User.objects.get_or_create(
            email='admin@bebrivus.com',
            defaults={'username': 'admin', 'is_staff': True, 'is_superuser': True}
        )

        # Get categories
        scholarships = OpportunityCategory.objects.get(name='Scholarships')
        internships = OpportunityCategory.objects.get(name='Internships')
        jobs = OpportunityCategory.objects.get(name='Jobs')
        fellowships = OpportunityCategory.objects.get(name='Fellowships')

        opportunities = [
            {
                'title': 'Global Excellence Scholarship 2025',
                'organization': 'International Education Foundation',
                'category': scholarships,
                'description': 'Full tuition scholarship for international students pursuing undergraduate degrees in STEM fields.',
                'short_description': 'Full tuition scholarship for STEM undergraduate students',
                'location': 'Global',
                'remote_allowed': False,
                'salary_min': 25000.00,
                'salary_max': 50000.00,
                'currency': 'USD',
                'requirements': 'GPA 3.5+, STEM major, International student status',
                'benefits': 'Full tuition coverage, Living stipend, Mentorship program',
                'difficulty_level': 'intermediate',
                'application_deadline': timezone.now() + timedelta(days=60),
                'status': 'published',
                'featured': True
            },
            {
                'title': 'Software Engineering Internship',
                'organization': 'TechCorp Solutions',
                'category': internships,
                'description': 'Summer internship program for computer science students to work on real-world projects.',
                'short_description': '12-week summer internship for CS students',
                'location': 'San Francisco, CA',
                'remote_allowed': True,
                'salary_min': 6000.00,
                'salary_max': 8000.00,
                'currency': 'USD',
                'requirements': 'CS major, Python/JavaScript knowledge, Junior/Senior standing',
                'benefits': 'Housing stipend, Mentorship, Full-time offer potential',
                'difficulty_level': 'beginner',
                'application_deadline': timezone.now() + timedelta(days=45),
                'start_date': timezone.now().date() + timedelta(days=90),
                'end_date': timezone.now().date() + timedelta(days=174),
                'status': 'published'
            },
            {
                'title': 'Senior Full Stack Developer',
                'organization': 'InnovateTech Inc.',
                'category': jobs,
                'description': 'Lead development of web applications using modern technologies. Work with cross-functional teams.',
                'short_description': 'Lead full stack developer role',
                'location': 'Austin, TX',
                'remote_allowed': True,
                'salary_min': 120000.00,
                'salary_max': 160000.00,
                'currency': 'USD',
                'requirements': '5+ years experience, React, Node.js, Python, Team leadership',
                'benefits': 'Health insurance, 401k, Stock options, Flexible PTO',
                'difficulty_level': 'advanced',
                'application_deadline': timezone.now() + timedelta(days=30),
                'status': 'published'
            },
            {
                'title': 'Research Fellowship in AI Ethics',
                'organization': 'Future Tech Institute',
                'category': fellowships,
                'description': 'One-year research fellowship focusing on ethical implications of artificial intelligence.',
                'short_description': '1-year AI ethics research fellowship',
                'location': 'Cambridge, MA',
                'remote_allowed': False,
                'salary_min': 55000.00,
                'salary_max': 55000.00,
                'currency': 'USD',
                'requirements': 'PhD in relevant field, Research experience, Publications preferred',
                'benefits': 'Research funding, Conference travel, Publication support',
                'difficulty_level': 'advanced',
                'application_deadline': timezone.now() + timedelta(days=75),
                'start_date': timezone.now().date() + timedelta(days=120),
                'end_date': timezone.now().date() + timedelta(days=485),
                'status': 'published',
                'featured': True
            }
        ]

        created_count = 0
        for opp_data in opportunities:
            opportunity, created = Opportunity.objects.get_or_create(
                title=opp_data['title'],
                organization=opp_data['organization'],
                defaults={
                    **opp_data,
                    'created_by': admin_user,
                    'external_url': 'https://example.com/apply',
                    'verified': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created opportunity: {opportunity.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Opportunity already exists: {opportunity.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new opportunities')
        )

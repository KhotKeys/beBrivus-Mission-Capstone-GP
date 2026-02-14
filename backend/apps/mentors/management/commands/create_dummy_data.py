from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.mentors.models import MentorProfile, MentorAvailability, MentorshipSession
from apps.opportunities.models import Opportunity, OpportunityCategory
from apps.applications.models import Application
import random
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create dummy data for testing'

    def create_mentorship_sessions(self, student_user):
        """Create dummy mentorship sessions for testing"""
        mentors = MentorProfile.objects.all()[:3]  # Get first 3 mentors
        
        session_data = [
            {
                'agenda': 'Career guidance and resume review',
                'status': 'requested',
                'session_type': 'video',
                'scheduled_start': timezone.now() + timedelta(days=1, hours=2),
                'scheduled_end': timezone.now() + timedelta(days=1, hours=3),
            },
            {
                'agenda': 'Technical interview preparation',
                'status': 'scheduled',
                'session_type': 'video',
                'scheduled_start': timezone.now() + timedelta(days=3, hours=10),
                'scheduled_end': timezone.now() + timedelta(days=3, hours=11),
                'mentor_notes': 'Looking forward to helping with interview prep!'
            },
            {
                'agenda': 'Portfolio review and feedback',
                'status': 'completed',
                'session_type': 'video',
                'scheduled_start': timezone.now() - timedelta(days=5),
                'scheduled_end': timezone.now() - timedelta(days=5, hours=-1),
                'actual_start': timezone.now() - timedelta(days=5),
                'actual_end': timezone.now() - timedelta(days=5, hours=-1),
                'mentor_notes': 'Great session! Student has good potential.',
                'mentee_notes': 'Very helpful feedback on my projects.'
            },
            {
                'agenda': 'Network architecture discussion',
                'status': 'in_progress',
                'session_type': 'video',
                'scheduled_start': timezone.now() - timedelta(minutes=30),
                'scheduled_end': timezone.now() + timedelta(minutes=30),
                'actual_start': timezone.now() - timedelta(minutes=30),
                'meeting_id': 'test123',
                'meeting_link': 'https://meet.google.com/test-meeting-123'
            },
            {
                'agenda': 'Startup advice and entrepreneurship',
                'status': 'cancelled',
                'session_type': 'chat',
                'scheduled_start': timezone.now() - timedelta(days=2),
                'scheduled_end': timezone.now() - timedelta(days=2, hours=-1),
                'mentor_notes': 'Had to cancel due to emergency. Will reschedule.'
            }
        ]
        
        for i, data in enumerate(session_data):
            mentor = mentors[i % len(mentors)]  # Cycle through mentors
            
            session, created = MentorshipSession.objects.get_or_create(
                mentor=mentor,
                mentee=student_user,
                scheduled_start=data['scheduled_start'],
                defaults=data
            )
            
            if created:
                self.stdout.write(f'Created session: {session.agenda} ({session.status})')
        
        self.stdout.write(f'Created {len(session_data)} mentorship sessions')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating dummy data...'))
        
        # Create admin user first
        admin_user = None
        try:
            admin_user = User.objects.get(email='admin@bebrivus.com')
            self.stdout.write('Admin user already exists')
        except User.DoesNotExist:
            try:
                admin_user = User.objects.create_user(
                    username='bebrivus_admin',
                    email='admin@bebrivus.com',
                    first_name='Admin',
                    last_name='User',
                    password='admin123'
                )
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.user_type = 'admin'
                admin_user.save()
                self.stdout.write('Created admin user')
            except Exception as e:
                # If admin creation fails, use any existing admin
                admin_user = User.objects.filter(is_superuser=True).first()
                if not admin_user:
                    # Create a simple admin without conflicts
                    admin_user = User.objects.create(
                        username=f'admin_{timezone.now().timestamp()}',
                        email=f'admin_{timezone.now().timestamp()}@bebrivus.com',
                        first_name='Admin',
                        last_name='User',
                        is_staff=True,
                        is_superuser=True,
                        user_type='admin'
                    )
                    admin_user.set_password('admin123')
                    admin_user.save()
                self.stdout.write('Using existing or created admin user')
        
        # Create opportunity categories first
        categories = [
            'Software Engineering',
            'Data Science',
            'Product Management',
            'Design',
            'Marketing',
            'Sales',
            'Finance',
            'Operations',
        ]
        
        category_objects = []
        for cat_name in categories:
            category, created = OpportunityCategory.objects.get_or_create(
                name=cat_name,
                defaults={'description': f'{cat_name} related opportunities'}
            )
            category_objects.append(category)
            if created:
                self.stdout.write(f'Created category: {cat_name}')
        
        # Create dummy users and mentors
        mentors_data = [
            {
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'email': 'sarah.johnson@techcorp.com',
                'current_position': 'Senior Software Engineer',
                'current_company': 'TechCorp',
                'industry': 'Technology',
                'expertise_level': 'senior',
                'years_of_experience': 8,
                'specializations': 'React, Node.js, Python, System Design',
                'hourly_rate': Decimal('120.00'),
                'rating': 4.9,
                'total_sessions': 156,
            },
            {
                'first_name': 'Michael',
                'last_name': 'Chen',
                'email': 'michael.chen@dataflow.com',
                'current_position': 'Data Science Manager',
                'current_company': 'DataFlow',
                'industry': 'Technology',
                'expertise_level': 'senior',
                'years_of_experience': 10,
                'specializations': 'Machine Learning, Python, SQL, Data Visualization',
                'hourly_rate': Decimal('150.00'),
                'rating': 4.8,
                'total_sessions': 203,
            },
            {
                'first_name': 'Emily',
                'last_name': 'Rodriguez',
                'email': 'emily.rodriguez@designstudio.com',
                'current_position': 'Product Design Lead',
                'current_company': 'Design Studio',
                'industry': 'Design',
                'expertise_level': 'senior',
                'years_of_experience': 7,
                'specializations': 'UX Design, UI Design, Figma, User Research',
                'hourly_rate': Decimal('110.00'),
                'rating': 4.7,
                'total_sessions': 98,
            },
            {
                'first_name': 'David',
                'last_name': 'Kim',
                'email': 'david.kim@productco.com',
                'current_position': 'Product Manager',
                'current_company': 'ProductCo',
                'industry': 'Technology',
                'expertise_level': 'mid',
                'years_of_experience': 5,
                'specializations': 'Product Strategy, Analytics, Roadmapping, Agile',
                'hourly_rate': Decimal('100.00'),
                'rating': 4.6,
                'total_sessions': 67,
            },
            {
                'first_name': 'Lisa',
                'last_name': 'Thompson',
                'email': 'lisa.thompson@marketingpro.com',
                'current_position': 'Marketing Director',
                'current_company': 'MarketingPro',
                'industry': 'Marketing',
                'expertise_level': 'senior',
                'years_of_experience': 12,
                'specializations': 'Digital Marketing, Content Strategy, SEO, Analytics',
                'hourly_rate': Decimal('130.00'),
                'rating': 4.8,
                'total_sessions': 142,
            },
            {
                'first_name': 'James',
                'last_name': 'Wilson',
                'email': 'james.wilson@fintech.com',
                'current_position': 'Senior Developer',
                'current_company': 'FinTech Solutions',
                'industry': 'Finance',
                'expertise_level': 'senior',
                'years_of_experience': 9,
                'specializations': 'Java, Spring Boot, Microservices, DevOps',
                'hourly_rate': Decimal('140.00'),
                'rating': 4.9,
                'total_sessions': 178,
            },
        ]
        
        for mentor_data in mentors_data:
            # Create user
            username = mentor_data['email'].split('@')[0]  # Use email prefix as username
            user, created = User.objects.get_or_create(
                email=mentor_data['email'],
                defaults={
                    'username': username,
                    'first_name': mentor_data['first_name'],
                    'last_name': mentor_data['last_name'],
                    'is_active': True,
                    'user_type': 'mentor',
                }
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'Created user: {user.get_full_name()}')
            
            # Create mentor profile
            mentor_profile, created = MentorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'current_position': mentor_data['current_position'],
                    'current_company': mentor_data['current_company'],
                    'industry': mentor_data['industry'],
                    'expertise_level': mentor_data['expertise_level'],
                    'years_of_experience': mentor_data['years_of_experience'],
                    'specializations': mentor_data['specializations'],
                    'hourly_rate': mentor_data['hourly_rate'],
                    'available_for_mentoring': True,
                    'verified_mentor': True,
                    'featured_mentor': random.choice([True, False]),
                    'total_sessions': mentor_data['total_sessions'],
                    'average_rating': mentor_data['rating'],
                    'mentoring_experience': f"I have {mentor_data['years_of_experience']} years of experience in {mentor_data['industry']} and love helping others grow in their careers.",
                    'languages_spoken': 'English',
                    'max_mentees': random.randint(3, 8),
                    'free_sessions_offered': random.randint(1, 3),
                }
            )
            
            if created:
                self.stdout.write(f'Created mentor profile: {mentor_profile}')
                
                # Create availability for the mentor (weekdays 9-5)
                for day in range(5):  # Monday to Friday
                    MentorAvailability.objects.create(
                        mentor=mentor_profile,
                        day_of_week=day,
                        start_time='09:00:00',
                        end_time='17:00:00',
                        timezone='UTC'
                    )
        
        # Create some dummy opportunities
        opportunities_data = [
            {
                'title': 'Frontend Developer Internship',
                'organization': 'TechStartup Inc',
                'location': 'San Francisco, CA',
                'category': 'Software Engineering',
                'description': 'Join our team to work on cutting-edge React applications.',
                'short_description': 'Frontend internship with React focus',
                'requirements': 'React, JavaScript, HTML/CSS',
                'salary_min': 20,
                'salary_max': 25,
            },
            {
                'title': 'Data Analyst Position',
                'organization': 'DataCorp',
                'location': 'New York, NY',
                'category': 'Data Science',
                'description': 'Analyze large datasets to drive business decisions.',
                'short_description': 'Data analysis role for business insights',
                'requirements': 'SQL, Python, Excel, Statistics',
                'salary_min': 70000,
                'salary_max': 90000,
            },
            {
                'title': 'UX Design Intern',
                'organization': 'Creative Agency',
                'location': 'Remote',
                'category': 'Design',
                'description': 'Work with our design team on user experience projects.',
                'short_description': 'Remote UX design internship',
                'requirements': 'Figma, Adobe Creative Suite, Design Thinking',
                'salary_min': 18,
                'salary_max': 22,
            },
            {
                'title': 'Product Manager - Junior Level',
                'organization': 'Innovation Labs',
                'location': 'Austin, TX',
                'category': 'Product Management',
                'description': 'Lead product development for our mobile applications.',
                'short_description': 'Junior PM role for mobile products',
                'requirements': 'Product Strategy, Analytics, Agile, Communication',
                'salary_min': 85000,
                'salary_max': 110000,
            },
            {
                'title': 'Marketing Coordinator',
                'organization': 'Growth Marketing Co',
                'location': 'Los Angeles, CA',
                'category': 'Marketing',
                'description': 'Support marketing campaigns and content creation.',
                'short_description': 'Marketing support role with growth focus',
                'requirements': 'Social Media, Content Creation, Analytics, SEO',
                'salary_min': 45000,
                'salary_max': 60000,
            },
        ]
        
        for opp_data in opportunities_data:
            # Find the category
            category = next((c for c in category_objects if c.name == opp_data['category']), None)
            
            opportunity, created = Opportunity.objects.get_or_create(
                title=opp_data['title'],
                organization=opp_data['organization'],
                defaults={
                    'location': opp_data['location'],
                    'category': category,
                    'description': opp_data['description'],
                    'short_description': opp_data['short_description'],
                    'requirements': opp_data['requirements'],
                    'salary_min': opp_data['salary_min'],
                    'salary_max': opp_data['salary_max'],
                    'status': 'published',
                    'application_deadline': timezone.now() + timedelta(days=30),
                    'created_by': admin_user,
                }
            )
            
            if created:
                self.stdout.write(f'Created opportunity: {opportunity.title}')
        
        # Create a test student user
        student_user, created = User.objects.get_or_create(
            email='student@example.com',
            defaults={
                'username': 'student',
                'first_name': 'John',
                'last_name': 'Student',
                'is_active': True,
                'user_type': 'student',
            }
        )
        
        if created:
            student_user.set_password('testpass123')
            student_user.save()
            self.stdout.write('Created test student user')
        
        # Create some applications for the student
        opportunities = Opportunity.objects.all()[:3]
        for opportunity in opportunities:
            application, created = Application.objects.get_or_create(
                user=student_user,
                opportunity=opportunity,
                defaults={
                    'status': random.choice(['submitted', 'under_review', 'accepted', 'rejected']),
                    'cover_letter': f"I am very interested in the {opportunity.title} position at {opportunity.organization}. I believe my skills align well with your requirements.",
                    'additional_info': 'I am a dedicated student looking to gain practical experience in this field.',
                }
            )
            
            if created:
                self.stdout.write(f'Created application: {application}')
        
        # Create mentorship sessions for testing mentor dashboard
        self.create_mentorship_sessions(student_user)
        
        self.stdout.write(self.style.SUCCESS('Successfully created dummy data!'))
        self.stdout.write('Test accounts created:')
        self.stdout.write('- Mentors: Check the created mentor emails above')
        self.stdout.write('- Student: student@example.com')
        self.stdout.write('- Password for all: testpass123')

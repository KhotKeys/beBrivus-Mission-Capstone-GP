"""
Comprehensive Feature Test Script for beBrivus Platform
Tests all major features and endpoints
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.opportunities.models import Opportunity, OpportunityCategory
from apps.applications.models import Application
from apps.mentors.models import MentorProfile, MentorshipSession
from apps.forum.models import Discussion, Reply, ForumCategory
from apps.gamification.models import Badge, UserBadge, PointTransaction
from apps.resources.models import Resource, ResourceCategory
from apps.ai_services.models import ChatSession, ChatMessage
from apps.messaging.models import Message, Notification
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class FeatureTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def test(self, name, func):
        """Run a test and record results"""
        try:
            func()
            self.results.append(f"[PASS] {name}")
            self.passed += 1
            return True
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc() if str(e) == "" else str(e)
            self.results.append(f"[FAIL] {name}: {error_detail}")
            self.failed += 1
            return False
    
    def print_results(self):
        """Print test results"""
        print("\n" + "="*60)
        print("BEBRIVUS PLATFORM FEATURE TEST RESULTS")
        print("="*60 + "\n")
        
        for result in self.results:
            print(result)
        
        print("\n" + "="*60)
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed+self.failed)*100):.1f}%")
        print("="*60 + "\n")

def test_user_authentication():
    """Test user model and authentication"""
    user = User.objects.filter(email='test@example.com').first()
    if not user:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            user_type='student'
        )
    assert user.email == 'test@example.com'
    assert user.check_password('testpass123')

def test_opportunities():
    """Test opportunity creation and retrieval"""
    category, _ = OpportunityCategory.objects.get_or_create(
        name='Internship',
        defaults={'description': 'Internship opportunities'}
    )
    
    user = User.objects.filter(email='test@example.com').first()
    if not user:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    opp = Opportunity.objects.filter(title='Test Opportunity').first()
    if not opp:
        opp = Opportunity.objects.create(
            title='Test Opportunity',
            description='Test description',
            short_description='Test short description',
            organization='Test Org',
            category=category,
            location='Remote',
            application_deadline=timezone.now() + timedelta(days=30),
            status='published',
            created_by=user
        )
    else:
        # Update deadline if opportunity exists
        opp.application_deadline = timezone.now() + timedelta(days=30)
        opp.status = 'published'
        opp.save()
    
    assert opp.title == 'Test Opportunity'
    assert opp.is_active

def test_applications():
    """Test application submission"""
    user = User.objects.filter(email='test@example.com').first()
    opp = Opportunity.objects.filter(title='Test Opportunity').first()
    
    if user and opp:
        app, created = Application.objects.get_or_create(
            user=user,
            opportunity=opp,
            defaults={
                'cover_letter': 'Test cover letter',
                'status': 'clicked'
            }
        )
        assert app.user == user
        assert app.opportunity == opp

def test_mentorship():
    """Test mentor profile and sessions"""
    user = User.objects.filter(user_type='mentor').first()
    if not user:
        user = User.objects.create_user(
            username='mentoruser',
            email='mentor@example.com',
            password='testpass123',
            first_name='Mentor',
            last_name='User',
            user_type='mentor'
        )
    
    profile, _ = MentorProfile.objects.get_or_create(
        user=user,
        defaults={
            'current_position': 'Senior Engineer',
            'current_company': 'Tech Corp',
            'industry': 'Technology',
            'expertise_level': 'senior',
            'years_of_experience': 5,
            'specializations': 'Software Engineering'
        }
    )
    assert profile.user == user

def test_forum():
    """Test forum discussions"""
    user = User.objects.filter(email='test@example.com').first()
    if user:
        category, _ = ForumCategory.objects.get_or_create(
            name='General',
            defaults={'description': 'General discussions'}
        )
        discussion, _ = Discussion.objects.get_or_create(
            title='Test Discussion',
            defaults={
                'content': 'Test content',
                'author': user,
                'category': category
            }
        )
        assert discussion.title == 'Test Discussion'

def test_gamification():
    """Test badges and points system"""
    badge, _ = Badge.objects.get_or_create(
        name='First Application',
        defaults={
            'slug': 'first-application',
            'description': 'Submit your first application',
            'category': 'achievement',
            'points_required': 10,
            'condition_type': 'application_count',
            'icon': 'trophy'
        }
    )
    assert badge.points_required == 10

def test_resources():
    """Test resource management"""
    user = User.objects.filter(email='test@example.com').first()
    if not user:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    category, _ = ResourceCategory.objects.get_or_create(
        name='Career Development',
        defaults={'slug': 'career-development', 'description': 'Career resources'}
    )
    
    resource, _ = Resource.objects.get_or_create(
        title='Test Resource',
        defaults={
            'slug': 'test-resource',
            'description': 'Test resource description',
            'resource_type': 'article',
            'category': category,
            'author': user
        }
    )
    assert resource.title == 'Test Resource'

def test_ai_services():
    """Test AI service integration"""
    from apps.ai_services.gemini_service import gemini_service
    
    # Check if AI service is available
    is_available = gemini_service.is_available()
    assert isinstance(is_available, bool)

def test_messaging():
    """Test messaging system"""
    user1 = User.objects.filter(email='test@example.com').first()
    user2 = User.objects.filter(email='mentor@example.com').first()
    
    if user1 and user2:
        message, _ = Message.objects.get_or_create(
            sender=user1,
            receiver=user2,
            defaults={'content': 'Test message'}
        )
        assert message.sender == user1

def test_notifications():
    """Test notification system"""
    user = User.objects.filter(email='test@example.com').first()
    if user:
        notif, _ = Notification.objects.get_or_create(
            user=user,
            defaults={
                'notification_type': 'booking',
                'title': 'Test Notification',
                'body': 'Test notification body'
            }
        )
        assert notif.user == user

def test_database_connections():
    """Test database connectivity"""
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
    assert result[0] == 1

def test_static_media_setup():
    """Test static and media file configuration"""
    from django.conf import settings
    assert hasattr(settings, 'MEDIA_ROOT')
    assert hasattr(settings, 'STATIC_ROOT')
    assert settings.MEDIA_ROOT.exists()

def test_cors_configuration():
    """Test CORS settings"""
    from django.conf import settings
    assert hasattr(settings, 'CORS_ALLOWED_ORIGINS')
    assert len(settings.CORS_ALLOWED_ORIGINS) > 0

def test_jwt_configuration():
    """Test JWT authentication setup"""
    from django.conf import settings
    assert hasattr(settings, 'SIMPLE_JWT')
    assert 'ACCESS_TOKEN_LIFETIME' in settings.SIMPLE_JWT

def test_email_configuration():
    """Test email settings"""
    from django.conf import settings
    assert hasattr(settings, 'EMAIL_HOST')
    assert hasattr(settings, 'EMAIL_HOST_USER')

def main():
    tester = FeatureTester()
    
    print("\nStarting comprehensive feature tests...\n")
    
    # Run all tests
    tester.test("Database Connection", test_database_connections)
    tester.test("User Authentication", test_user_authentication)
    tester.test("Opportunities Module", test_opportunities)
    tester.test("Applications Module", test_applications)
    tester.test("Mentorship Module", test_mentorship)
    tester.test("Forum Module", test_forum)
    tester.test("Gamification Module", test_gamification)
    tester.test("Resources Module", test_resources)
    tester.test("AI Services Module", test_ai_services)
    tester.test("Messaging Module", test_messaging)
    tester.test("Notifications Module", test_notifications)
    tester.test("Static/Media Setup", test_static_media_setup)
    tester.test("CORS Configuration", test_cors_configuration)
    tester.test("JWT Configuration", test_jwt_configuration)
    tester.test("Email Configuration", test_email_configuration)
    
    # Print results
    tester.print_results()
    
    # Exit with appropriate code
    sys.exit(0 if tester.failed == 0 else 1)

if __name__ == '__main__':
    main()

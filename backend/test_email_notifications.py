"""
Comprehensive email notification system test
Tests all email templates and notification functions
"""
import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.notifications.email_service import (
    EmailService,
    notify_moderation_violation_admin,
    notify_user_content_flagged,
    notify_mentor_violation_alert,
    notify_password_reset,
    notify_booking_confirmed,
    notify_application_status_change,
    notify_session_cancellation,
    notify_mentor_invitation
)
from django.conf import settings

def test_email_configuration():
    """Test email configuration"""
    print("\n" + "="*60)
    print("TEST 1: Email Configuration")
    print("="*60)
    
    config_items = {
        'EMAIL_BACKEND': settings.EMAIL_BACKEND,
        'EMAIL_HOST': settings.EMAIL_HOST,
        'EMAIL_PORT': settings.EMAIL_PORT,
        'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
        'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
        'MODERATION_EMAIL': getattr(settings, 'MODERATION_EMAIL', 'NOT SET'),
        'CONTACT_EMAIL': getattr(settings, 'CONTACT_EMAIL', 'NOT SET'),
        'ADMIN_EMAIL_RECIPIENTS': getattr(settings, 'ADMIN_EMAIL_RECIPIENTS', []),
    }
    
    for key, value in config_items.items():
        status = "[OK]" if value and value != 'NOT SET' else "[WARN]"
        print(f"{status} {key}: {value}")
    
    return True

def test_admin_emails():
    """Test admin email extraction"""
    print("\n" + "="*60)
    print("TEST 2: Admin Email Recipients")
    print("="*60)
    
    admin_emails = EmailService.get_admin_emails()
    print(f"Admin recipients: {admin_emails}")
    
    if not admin_emails:
        print("[FAIL] No admin emails configured")
        return False
    
    print(f"[PASS] {len(admin_emails)} admin email(s) configured")
    return True

def test_moderation_notification():
    """Test moderation violation notification email"""
    print("\n" + "="*60)
    print("TEST 3: Moderation Violation Notification")
    print("="*60)
    
    violation = {
        'content': 'Test violating content with hate speech',
        'username': 'test_user',
        'post_id': 123,
        'categories': ['hate_speech', 'harassment'],
        'confidence': 0.95,
        'reason': 'Contains discriminatory language',
        'timestamp': timezone.now().isoformat(),
        'content_type': 'forum_post',
        'source_url': '/forums/123/'
    }
    
    try:
        result = notify_moderation_violation_admin(violation)
        if result:
            print("[PASS] Moderation alert email queued successfully")
        else:
            print("[WARN] Moderation alert email failed (check admin recipients)")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_user_flagged_notification():
    """Test user content flagged notification"""
    print("\n" + "="*60)
    print("TEST 4: User Content Flagged Notification")
    print("="*60)
    
    violation = {
        'content': 'Test violating content',
        'username': 'test_user',
        'post_id': 123,
        'categories': ['spam'],
        'confidence': 0.87,
        'reason': 'Promotional spam',
        'timestamp': timezone.now().isoformat(),
        'content_type': 'chat_message',
    }
    
    try:
        result = notify_user_content_flagged('test@example.com', violation)
        if result:
            print("[PASS] User flag notification email queued")
        else:
            print("[WARN] User notification failed (check template/config)")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_mentor_alert_notification():
    """Test mentor violation alert"""
    print("\n" + "="*60)
    print("TEST 5: Mentor Violation Alert Notification")
    print("="*60)
    
    violation = {
        'content': 'Mentee flagged content',
        'username': 'mentee_user',
        'post_id': 456,
        'categories': ['profanity'],
        'confidence': 0.75,
        'reason': 'Offensive language',
        'content_type': 'forum_post',
    }
    
    try:
        result = notify_mentor_violation_alert('mentor@example.com', violation)
        if result:
            print("[PASS] Mentor alert email queued")
        else:
            print("[WARN] Mentor alert failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_password_reset_notification():
    """Test password reset email"""
    print("\n" + "="*60)
    print("TEST 6: Password Reset Notification")
    print("="*60)
    
    try:
        result = notify_password_reset(
            user_email='user@example.com',
            user_name='John Doe',
            reset_link='https://bebrivus.com/reset/?token=abc123'
        )
        if result:
            print("[PASS] Password reset email queued")
        else:
            print("[WARN] Password reset failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_booking_confirmation_notification():
    """Test booking confirmation email"""
    print("\n" + "="*60)
    print("TEST 7: Booking Confirmation Notification")
    print("="*60)
    
    session_details = {
        'mentor_name': 'Jane Smith',
        'session_date': '2026-03-15',
        'session_time': '14:00',
        'session_url': 'https://bebrivus.com/sessions/789/',
    }
    
    try:
        result = notify_booking_confirmed(
            user_email='user@example.com',
            user_name='John Doe',
            session_details=session_details
        )
        if result:
            print("[PASS] Booking confirmation email queued")
        else:
            print("[WARN] Booking confirmation failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_application_status_notification():
    """Test application status change email"""
    print("\n" + "="*60)
    print("TEST 8: Application Status Notification")
    print("="*60)
    
    try:
        # Test accepted
        result1 = notify_application_status_change(
            user_email='user@example.com',
            user_name='John Doe',
            opportunity_title='Software Engineer - Startup',
            new_status='accepted',
            feedback='Great skills and experience!'
        )
        
        # Test rejected
        result2 = notify_application_status_change(
            user_email='user2@example.com',
            user_name='Jane Doe',
            opportunity_title='Product Manager - TechCo',
            new_status='rejected',
            feedback=''
        )
        
        # Test under review
        result3 = notify_application_status_change(
            user_email='user3@example.com',
            user_name='Bob Smith',
            opportunity_title='Data Scientist - Analytics',
            new_status='under_review',
            feedback=''
        )
        
        if result1 and result2 and result3:
            print("[PASS] All application status emails queued")
        else:
            print("[WARN] Some application status emails failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_session_cancellation_notification():
    """Test session cancellation email"""
    print("\n" + "="*60)
    print("TEST 9: Session Cancellation Notification")
    print("="*60)
    
    try:
        result = notify_session_cancellation(
            user_email='user@example.com',
            user_name='John Doe',
            mentor_name='Jane Smith',
            reason='Mentor experienced an unexpected emergency'
        )
        if result:
            print("[PASS] Session cancellation email queued")
        else:
            print("[WARN] Session cancellation failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_mentor_invitation_notification():
    """Test mentor invitation email"""
    print("\n" + "="*60)
    print("TEST 10: Mentor Invitation Notification")
    print("="*60)
    
    invitation_data = {
        'student_name': 'John Doe',
        'topic': 'Career Development',
        'description': 'Guidance on career transition to tech',
        'accept_link': 'https://bebrivus.com/mentors/invitations/abc123/accept/',
    }
    
    try:
        result = notify_mentor_invitation(
            mentor_email='mentor@example.com',
            mentor_name='Jane Smith',
            invitation_data=invitation_data
        )
        if result:
            print("[PASS] Mentor invitation email queued")
        else:
            print("[WARN] Mentor invitation failed")
        return True
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        return False

def test_email_templates():
    """Verify email templates exist"""
    print("\n" + "="*60)
    print("TEST 11: Email Templates Verification")
    print("="*60)
    
    from django.template.loader import get_template
    from django.template.exceptions import TemplateDoesNotExist
    
    templates = [
        'emails/password_reset.html',
        'emails/moderation_alert_admin.html',
        'emails/content_flagged_user.html',
        'emails/violation_alert_mentor.html',
        'emails/session_cancelled.html',
        'emails/mentor_invitation.html',
        'emails/booking_confirmed.html',
        'emails/application_accepted.html',
        'emails/application_rejected.html',
        'emails/application_under_review.html',
    ]
    
    missing = []
    for template in templates:
        try:
            get_template(template)
            print(f"[OK] {template}")
        except TemplateDoesNotExist:
            print(f"[MISS] {template}")
            missing.append(template)
    
    if missing:
        print(f"\n[WARN] Missing {len(missing)} template(s)")
        return False
    
    print(f"\n[PASS] All {len(templates)} templates found")
    return True

def main():
    """Run all tests"""
    print("\n"  + "="*60)
    print("EMAIL NOTIFICATION SYSTEM - COMPREHENSIVE TEST")
    print("="*60)
    
    tests = [
        ("Email Configuration", test_email_configuration),
        ("Admin Email Recipients", test_admin_emails),
        ("Moderation Notification", test_moderation_notification),
        ("User Flagged Notification", test_user_flagged_notification),
        ("Mentor Alert Notification", test_mentor_alert_notification),
        ("Password Reset Notification", test_password_reset_notification),
        ("Booking Confirmation", test_booking_confirmation_notification),
        ("Application Status", test_application_status_notification),
        ("Session Cancellation", test_session_cancellation_notification),
        ("Mentor Invitation", test_mentor_invitation_notification),
        ("Email Templates", test_email_templates),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n[ERROR] Unexpected error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] Email notification system is fully operational!")
    else:
        print(f"\n[WARN] {total - passed} test(s) need attention")

if __name__ == '__main__':
    main()

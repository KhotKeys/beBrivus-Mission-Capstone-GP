"""
Test AI Moderation Email Alert System
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_service import send_violation_alert
from django.utils import timezone

def test_email_alert():
    """Send a test violation alert to ethxkeys@gmail.com"""
    
    test_violation = {
        'content': 'This is a test flagged message to verify the email alert system is working correctly.',
        'username': 'test_user',
        'post_id': 999,
        'categories': ['test', 'spam'],
        'confidence': 0.85,
        'reason': 'TEST ALERT - Verifying AI moderation email system',
        'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    print("[INFO] Sending test violation alert to ethxkeys@gmail.com...")
    print(f"[INFO] Test data: {test_violation['username']} - {test_violation['categories']}")
    
    try:
        send_violation_alert(test_violation)
        print("\n[SUCCESS] Test email sent successfully!")
        print("[INFO] Check ethxkeys@gmail.com inbox for the alert.")
    except Exception as e:
        print(f"\n[ERROR] Failed to send email: {e}")

if __name__ == '__main__':
    test_email_alert()

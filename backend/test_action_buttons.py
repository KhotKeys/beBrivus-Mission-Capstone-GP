"""
Test all 4 moderation action buttons
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_models import FlaggedContent, ModerationAction
from apps.forum.moderation_views import ModerationViewSet
from django.contrib.auth import get_user_model
from unittest.mock import Mock
from rest_framework.request import Request

User = get_user_model()

def test_action_button(action_type, notes=""):
    """Test a specific action button"""
    
    # Get admin user
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        print("[ERROR] No admin user found")
        return
    
    # Get a pending flagged content
    flagged = FlaggedContent.objects.filter(status='pending').first()
    if not flagged:
        print("[ERROR] No pending flagged content found")
        return
    
    print(f"\n{'='*60}")
    print(f"TESTING ACTION: {action_type.upper()}")
    print(f"{'='*60}")
    print(f"Flagged Content ID: {flagged.id}")
    print(f"Author: {flagged.author_username}")
    print(f"Post ID: {flagged.post_id}")
    
    # Create mock request
    mock_request = Mock()
    mock_request.user = admin
    mock_request.data = {
        'action_type': action_type,
        'notes': notes or f'Test {action_type} action from automated test'
    }
    
    # Create viewset and call action
    viewset = ModerationViewSet()
    viewset.request = mock_request
    
    response = viewset.take_action(mock_request, pk=flagged.id)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    # Check audit log
    latest_action = ModerationAction.objects.filter(flagged_content=flagged).order_by('-created_at').first()
    if latest_action:
        print(f"\n[SUCCESS] Action logged in audit trail:")
        print(f"  - Action Type: {latest_action.action_type}")
        print(f"  - Admin: {latest_action.admin_user.username}")
        print(f"  - Notes: {latest_action.notes}")
        print(f"  - Timestamp: {latest_action.created_at}")
    
    # Check flagged content status
    flagged.refresh_from_db()
    print(f"\n[INFO] Flagged content status updated to: {flagged.status}")
    
    print(f"\n[INFO] Check ethxkeys@gmail.com for confirmation email")
    print(f"{'='*60}\n")

def run_all_tests():
    """Test all 4 action buttons"""
    
    print("\n" + "="*60)
    print("MODERATION ACTION BUTTONS TEST SUITE")
    print("="*60)
    
    # Create 4 test flagged contents
    from apps.forum.models import Discussion
    
    discussions = Discussion.objects.all()[:4]
    if len(discussions) < 4:
        print("[WARNING] Not enough discussions to test all actions")
        print(f"[INFO] Found {len(discussions)} discussions")
    
    # Create flagged content for each test
    test_cases = [
        ('warn', 'First warning for policy violation'),
        ('remove', 'Content violates community guidelines'),
        ('suspend', 'Repeated violations - account suspended'),
        ('dismiss', 'False positive - content is acceptable')
    ]
    
    for i, (action, notes) in enumerate(test_cases):
        if i < len(discussions):
            # Create flagged content
            flagged = FlaggedContent.objects.create(
                post_id=discussions[i].id,
                content=discussions[i].content[:200],
                author_username=discussions[i].author.username,
                violation_categories=['test'],
                ai_confidence=0.75,
                reason=f'Test case for {action} action',
                status='pending'
            )
            print(f"[+] Created test flagged content ID {flagged.id} for {action} test")
    
    print(f"\n[INFO] Testing all 4 action buttons...")
    print(f"[INFO] Each action will send confirmation email to ethxkeys@gmail.com\n")
    
    # Test each action
    for action, notes in test_cases:
        flagged = FlaggedContent.objects.filter(status='pending').first()
        if flagged:
            test_action_button(action, notes)
        else:
            print(f"[WARNING] No pending content for {action} test")
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETE")
    print("="*60)
    print(f"\n[SUMMARY]")
    print(f"  - Total actions logged: {ModerationAction.objects.count()}")
    print(f"  - Pending flags: {FlaggedContent.objects.filter(status='pending').count()}")
    print(f"  - Reviewed flags: {FlaggedContent.objects.filter(status='reviewed').count()}")
    print(f"  - Dismissed flags: {FlaggedContent.objects.filter(status='dismissed').count()}")
    print(f"\n[NEXT STEP] Check ethxkeys@gmail.com for 4 confirmation emails")

if __name__ == '__main__':
    run_all_tests()

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_models import FlaggedContent, ModerationAction
from apps.forum.moderation_views import ModerationViewSet
from django.contrib.auth import get_user_model
from unittest.mock import Mock

User = get_user_model()

# Get admin and flagged content
admin = User.objects.filter(is_superuser=True).first()
flagged = FlaggedContent.objects.filter(status='pending').first()

if not flagged:
    print("[ERROR] No pending flagged content found")
    exit(1)

print(f"[INFO] Testing admin action on flagged content ID {flagged.id}")
print(f"[INFO] Author: {flagged.author_username}")
print(f"[INFO] Post ID: {flagged.post_id}")

# Get author's email
try:
    author = User.objects.get(username=flagged.author_username)
    print(f"[INFO] Author email: {author.email}")
except User.DoesNotExist:
    print(f"[ERROR] User {flagged.author_username} not found")
    exit(1)

# Create mock request
request = Mock()
request.user = admin
request.data = {
    'action_type': 'warn',
    'notes': 'Your post contains inappropriate content. Please review our community guidelines.'
}

# Execute action
viewset = ModerationViewSet()
response = viewset.take_action(request, pk=flagged.id)

print(f"\n[RESULT] Response: {response.status_code}")
print(f"[RESULT] Data: {response.data}")

# Check if action was logged
action = ModerationAction.objects.filter(flagged_content=flagged).order_by('-created_at').first()
if action:
    print(f"\n[SUCCESS] Action logged:")
    print(f"  - Type: {action.action_type}")
    print(f"  - Admin: {action.admin_user.username}")
    print(f"  - Notes: {action.notes}")
    print(f"\n[INFO] Check these emails:")
    print(f"  1. ethxkeys@gmail.com - Admin confirmation")
    print(f"  2. {author.email} - User warning notification")
else:
    print("[ERROR] Action not logged")

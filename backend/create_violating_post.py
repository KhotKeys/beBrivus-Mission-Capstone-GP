"""
Create a violating forum post to test AI moderation live flow
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.models import Discussion, ForumCategory
from django.contrib.auth import get_user_model

User = get_user_model()

def create_violating_post():
    """Create a forum post with violating content"""
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        username='test_violator',
        defaults={
            'email': 'test_violator@example.com',
            'first_name': 'Test',
            'last_name': 'Violator',
            'user_type': 'student'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"[+] Created test user: {user.username}")
    else:
        print(f"[-] Using existing user: {user.username}")
    
    # Get or create a category
    category = ForumCategory.objects.first()
    if not category:
        category = ForumCategory.objects.create(
            name='General Discussion',
            slug='general',
            description='General community discussions'
        )
        print(f"[+] Created category: {category.name}")
    
    # Create violating post
    violating_content = """
    This platform is absolutely terrible and everyone here is incompetent. 
    You people should all be ashamed of yourselves. What a waste of time!
    The moderators are useless and don't know what they're doing.
    """
    
    discussion = Discussion.objects.create(
        title='URGENT: Major Issues with This Platform',
        content=violating_content.strip(),
        discussion_type='discussion',
        author=user,
        category=category
    )
    
    print(f"\n[SUCCESS] Created violating post!")
    print(f"[INFO] Post ID: {discussion.id}")
    print(f"[INFO] Title: {discussion.title}")
    print(f"[INFO] Author: {discussion.author.username}")
    print(f"\n[NEXT STEP] Now trigger AI moderation by calling the moderation service...")
    
    # Manually trigger AI moderation
    from apps.forum.views import DiscussionViewSet
    from unittest.mock import Mock
    
    # Create mock request
    request = Mock()
    request.user = user
    
    viewset = DiscussionViewSet()
    viewset.request = request
    
    print(f"[INFO] Running AI moderation check...")
    viewset._moderate_content(discussion)
    
    # Refresh from DB
    discussion.refresh_from_db()
    
    print(f"\n[RESULT] Moderation Status: {discussion.moderation_status}")
    print(f"[RESULT] Is Flagged: {discussion.is_flagged}")
    print(f"[RESULT] AI Score: {discussion.ai_moderation_score}")
    
    if discussion.is_flagged:
        print(f"\n[SUCCESS] Post was flagged by AI!")
        print(f"[INFO] Check Pending Review tab in Admin Portal")
        print(f"[INFO] Check ethxkeys@gmail.com for violation alert email")
    else:
        print(f"\n[WARNING] Post was NOT flagged. AI may not have detected violation.")
    
    return discussion

if __name__ == '__main__':
    create_violating_post()

"""
Manually flag a forum post to test moderation flow (bypasses AI)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.models import Discussion
from apps.forum.moderation_models import FlaggedContent
from apps.forum.moderation_service import send_violation_alert
from django.utils import timezone

def manually_flag_post(post_id):
    """Manually flag a post for testing"""
    
    try:
        discussion = Discussion.objects.get(id=post_id)
    except Discussion.DoesNotExist:
        print(f"[ERROR] Post ID {post_id} not found")
        return
    
    # Create FlaggedContent record
    flagged = FlaggedContent.objects.create(
        post_id=discussion.id,
        content=f"{discussion.title}\\n\\n{discussion.content}"[:500],
        author_username=discussion.author.username,
        violation_categories=['harassment', 'abuse'],
        ai_confidence=0.89,
        reason='Contains aggressive language and personal attacks against community members',
        status='pending'
    )
    
    print(f"[SUCCESS] Manually flagged post ID {post_id}")
    print(f"[INFO] Flagged Content ID: {flagged.id}")
    print(f"[INFO] Author: {flagged.author_username}")
    print(f"[INFO] Confidence: {flagged.ai_confidence:.2%}")
    
    # Send email alert
    violation = {
        'content': flagged.content,
        'username': flagged.author_username,
        'post_id': flagged.post_id,
        'categories': flagged.violation_categories,
        'confidence': flagged.ai_confidence,
        'reason': flagged.reason,
        'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    print(f"\n[INFO] Sending violation alert email to ethxkeys@gmail.com...")
    send_violation_alert(violation)
    
    print(f"\n[SUCCESS] Complete! Check:")
    print(f"  1. Admin Portal > Forum Management > AI Moderation Center > Pending Review")
    print(f"  2. Email inbox: ethxkeys@gmail.com")
    
    return flagged

if __name__ == '__main__':
    # Get the most recent post
    latest_post = Discussion.objects.order_by('-id').first()
    if latest_post:
        print(f"[INFO] Flagging latest post: ID {latest_post.id} - '{latest_post.title}'")
        manually_flag_post(latest_post.id)
    else:
        print("[ERROR] No posts found in database")

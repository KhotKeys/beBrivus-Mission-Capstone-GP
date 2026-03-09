"""
AI Moderation Service - Listens and flags only, no autonomous actions
"""
from django.conf import settings
from apps.ai_services.gemini_service import gemini_service
from apps.notifications.email_service import notify_moderation_violation_admin, notify_user_content_flagged
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

def check_content_for_violations(content, author_username, post_id, content_type='forum_post'):
    """
    AI listens to content and flags violations - NO AUTONOMOUS ACTIONS
    Returns: dict with violation details or None
    """
    try:
        result = gemini_service.moderate_content(content, content_type)
        
        if not result.get('is_safe', True) and result.get('should_flag', False):
            violation = {
                'content': content[:500],
                'username': author_username,
                'post_id': post_id,
                'categories': result.get('categories', []),
                'confidence': result.get('toxicity_score', 0),
                'reason': result.get('reason', 'Policy violation detected'),
                'timestamp': timezone.now().isoformat(),
                'content_type': content_type,
                'source_url': f"/forums/{post_id}/" if content_type == 'forum_post' else ''
            }
            
            # Send alerts to admin and user
            notify_moderation_violation_admin(violation)
            
            # Get user email if available (from author_username)
            try:
                from apps.accounts.models import User
                user = User.objects.get(username=author_username)
                notify_user_content_flagged(user.email, violation)
                
                # Notify mentor if user has one
                if hasattr(user, 'mentor') and user.mentor and hasattr(user.mentor, 'email'):
                    from apps.notifications.email_service import notify_mentor_violation_alert
                    notify_mentor_violation_alert(user.mentor.email, violation)
            except:
                pass  # User might not exist yet
            
            return violation
        
        return None
        
    except Exception as e:
        logger.error(f"Moderation check failed: {e}")
        return None


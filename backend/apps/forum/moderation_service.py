"""
AI Moderation Service - Listens and flags only, no autonomous actions
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from apps.ai_services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)

MODERATION_EMAIL = "ethxkeys@gmail.com"

def check_content_for_violations(content, author_username, post_id):
    """
    AI listens to content and flags violations - NO AUTONOMOUS ACTIONS
    Returns: dict with violation details or None
    """
    try:
        result = gemini_service.moderate_content(content, "forum_post")
        
        if not result.get('is_safe', True) and result.get('should_flag', False):
            violation = {
                'content': content[:500],
                'username': author_username,
                'post_id': post_id,
                'categories': result.get('categories', []),
                'confidence': result.get('toxicity_score', 0),
                'reason': result.get('reason', 'Policy violation detected'),
                'timestamp': None  # Set by caller
            }
            
            # Send alert email - ONLY to ethxkeys@gmail.com
            send_violation_alert(violation)
            
            return violation
        
        return None
        
    except Exception as e:
        logger.error(f"Moderation check failed: {e}")
        return None


def send_violation_alert(violation):
    """
    Send formatted email alert to ethxkeys@gmail.com ONLY
    """
    try:
        subject = f"🚨 Forum Violation Alert - {', '.join(violation['categories'])}"
        
        message = f"""
AI MODERATION ALERT

FLAGGED CONTENT:
{violation['content']}

DETAILS:
- Username: {violation['username']}
- Post ID: {violation['post_id']}
- Violation Type: {', '.join(violation['categories'])}
- AI Confidence: {violation['confidence']:.2%}
- Reason: {violation['reason']}
- Timestamp: {violation.get('timestamp', 'N/A')}

ACTION REQUIRED:
Review this content in Admin Portal at /admin/forum/moderation
Select action: Warn User / Remove Content / Suspend Account / Dismiss

This is an automated alert. The AI has taken NO action.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[MODERATION_EMAIL],
            fail_silently=False,
        )
        
        logger.info(f"Violation alert sent to {MODERATION_EMAIL} for post {violation['post_id']}")
        
    except Exception as e:
        logger.error(f"Failed to send violation alert: {e}")

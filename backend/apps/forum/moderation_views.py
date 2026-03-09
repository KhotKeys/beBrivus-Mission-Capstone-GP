"""
AI Moderation API Views - Admin only
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .moderation_models import FlaggedContent, ModerationAction
from .models import Discussion
from django.contrib.auth import get_user_model

User = get_user_model()

class ModerationViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        """GET /api/forum/moderation/ - Get all flagged content pending review"""
        flagged = FlaggedContent.objects.filter(status='pending').order_by('-flagged_at')
        data = []
        for f in flagged:
            item = {
                'id': f.id,
                'content': f.content,
                'author_username': f.author_username,
                'violation_categories': f.violation_categories,
                'ai_confidence': f.ai_confidence,
                'reason': f.reason,
                'flagged_at': f.flagged_at,
                'post_id': f.post_id,
                'content_type': 'AI Coach' if f.post_id == 0 else 'Forum Post',
            }
            # Try to fetch discussion details only if post_id > 0
            if f.post_id > 0:
                try:
                    discussion = Discussion.objects.get(id=f.post_id)
                    item['ai_summary'] = discussion.ai_summary or ''
                    item['discussion_title'] = discussion.title
                except Discussion.DoesNotExist:
                    item['ai_summary'] = ''
                    item['discussion_title'] = 'Post not found'
            else:
                item['ai_summary'] = ''
                item['discussion_title'] = 'AI Coach Message'
            data.append(item)
        return Response(data)
    
    @action(detail=True, methods=['post'], url_path='action')
    def take_action(self, request, pk=None):
        """POST /api/forum/moderation/<id>/action/ - Admin takes action on flagged content"""
        try:
            flagged = FlaggedContent.objects.get(pk=pk)
        except FlaggedContent.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        action_type = request.data.get('action_type')
        notes = request.data.get('notes', '')
        
        if action_type not in ['warn', 'remove', 'suspend', 'dismiss']:
            return Response({'error': 'Invalid action'}, status=400)
        
        # Execute admin-approved action
        if action_type == 'warn':
            self._warn_user(flagged, notes)
        elif action_type == 'remove':
            self._remove_content(flagged)
        elif action_type == 'suspend':
            self._suspend_user(flagged, notes)
        
        # Log action in audit trail
        ModerationAction.objects.create(
            flagged_content=flagged,
            action_type=action_type,
            admin_user=request.user,
            notes=notes
        )
        
        flagged.status = 'reviewed' if action_type != 'dismiss' else 'dismissed'
        flagged.reviewed_at = timezone.now()
        flagged.reviewed_by = request.user
        flagged.save()
        
        # Send confirmation email to ethxkeys@gmail.com
        self._send_action_confirmation(flagged, action_type, notes, request.user)
        
        return Response({'message': 'Action completed'})
    
    def _warn_user(self, flagged, notes):
        """Send warning email to user"""
        try:
            user = User.objects.get(username=flagged.author_username)
            send_mail(
                subject='Warning: Forum Policy Violation',
                message=f'Your post has been flagged for policy violation.\n\nReason: {flagged.reason}\n\nAdmin notes: {notes}\n\nPlease review our community guidelines.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except:
            pass
    
    def _remove_content(self, flagged):
        """Remove the flagged post"""
        try:
            post = Discussion.objects.get(id=flagged.post_id)
            post.delete()
        except:
            pass
    
    def _suspend_user(self, flagged, notes):
        """Suspend user account"""
        try:
            user = User.objects.get(username=flagged.author_username)
            user.is_active = False
            user.save()
            send_mail(
                subject='Account Suspended',
                message=f'Your account has been suspended due to policy violations.\n\nReason: {notes}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except:
            pass
    
    @action(detail=False, methods=['get'])
    def audit_log(self, request):
        """GET /api/forum/moderation/audit_log/ - Get moderation audit log"""
        actions = ModerationAction.objects.select_related('admin_user', 'flagged_content').order_by('-created_at')[:100]
        data = [{
            'id': a.id,
            'action_type': a.action_type,
            'action_display': a.get_action_type_display(),
            'admin': a.admin_user.username if a.admin_user else 'System',
            'admin_email': a.admin_user.email if a.admin_user else '',
            'content_preview': a.flagged_content.content[:100],
            'author': a.flagged_content.author_username,
            'violation_categories': a.flagged_content.violation_categories,
            'notes': a.notes,
            'created_at': a.created_at,
        } for a in actions]
        return Response(data)
    
    def _send_action_confirmation(self, flagged, action_type, notes, admin_user):
        """Send confirmation email to ethxkeys@gmail.com after action is taken"""
        try:
            action_names = {
                'warn': 'User Warned',
                'remove': 'Content Removed',
                'suspend': 'Account Suspended',
                'dismiss': 'Flag Dismissed (False Positive)'
            }
            
            subject = f"✅ Moderation Action Completed: {action_names.get(action_type, action_type)}"
            
            message = f"""
MODERATION ACTION CONFIRMATION

ACTION TAKEN: {action_names.get(action_type, action_type)}
ADMIN: {admin_user.username}
TIMESTAMP: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}

ORIGINAL VIOLATION:
- Author: {flagged.author_username}
- Post ID: {flagged.post_id}
- Violation Type: {', '.join(flagged.violation_categories)}
- AI Confidence: {flagged.ai_confidence:.2%}
- Content: {flagged.content[:200]}...

ADMIN NOTES:
{notes if notes else 'No notes provided'}

This action has been logged in the audit trail.
"""
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['ethxkeys@gmail.com'],
                fail_silently=False,
            )
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send action confirmation email: {e}")

from django.shortcuts import render

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db.models import Q, F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from datetime import timedelta

from .models import (
    ForumCategory, Discussion, Reply, DiscussionLike, 
    DiscussionView, UserForumProfile, DiscussionFlag
)
from .serializers import (
    ForumCategorySerializer, ForumCategoryCreateUpdateSerializer,
    DiscussionListSerializer, DiscussionDetailSerializer, 
    DiscussionCreateSerializer, ReplySerializer, ReplyCreateSerializer
)
from rest_framework import serializers
from apps.ai_services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)
_email_logger = logging.getLogger(__name__)


def _safe_log(text):
    """Convert emoji/unicode to ASCII for Windows terminal compatibility."""
    return str(text).encode('ascii', 'replace').decode('ascii')


def get_admin_emails():
    """Returns all staff emails PLUS guaranteed primary admin."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    emails = list(
        User.objects.filter(is_staff=True, is_active=True)
        .exclude(email='').values_list('email', flat=True)
    )
    primary = 'ethxkeys@gmail.com'
    if primary not in emails:
        emails.append(primary)
    return emails


def send_admin_alert_email(subject, html_body, plain_body):
    """Send to all admins. Never raises. Always logs."""
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    import traceback
    try:
        admin_emails = get_admin_emails()
        if not admin_emails:
            _email_logger.warning('[EMAIL] No admin emails found')
            return
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=admin_emails,
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        _email_logger.info(_safe_log(f'[EMAIL OK] Admin alert: {subject}'))
    except Exception:
        _email_logger.error(_safe_log(f'[EMAIL FAILED] {subject}') + f'\n{traceback.format_exc()}')


def send_user_email(to_email, subject, html_body, plain_body, bcc_admin=True):
    """Send to user with optional BCC to ethxkeys@gmail.com."""
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    import traceback
    try:
        bcc = ['ethxkeys@gmail.com'] if bcc_admin else []
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
            bcc=bcc,
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        _email_logger.info(_safe_log(f'[EMAIL OK] User email to {to_email}: {subject}'))
    except Exception:
        _email_logger.error(_safe_log(f'[EMAIL FAILED] to {to_email}') + f'\n{traceback.format_exc()}')


class ForumCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for forum categories"""
    
    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            if user.is_staff or user.is_superuser or getattr(user, 'user_type', '') == 'admin':
                return ForumCategory.objects.all()
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Admin actions - show all categories
            return ForumCategory.objects.all()
        # Regular users - only active categories
        return ForumCategory.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        """Different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return ForumCategoryCreateUpdateSerializer
        return ForumCategorySerializer
    
    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admins can modify categories
            permission_classes = [permissions.IsAdminUser]
        else:
            # Regular users can view categories
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]


class DiscussionViewSet(viewsets.ModelViewSet):
    """ViewSet for forum discussions"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    filterset_fields = ['category', 'discussion_type', 'is_resolved', 'is_pinned']
    ordering_fields = ['created_at', 'last_activity', 'likes_count', 'replies_count']
    ordering = ['-is_pinned', '-last_activity']
    lookup_field = 'slug'
    
    def get_queryset(self):
        qs = Discussion.objects.filter(
            is_removed=False
        ).select_related('author', 'category').prefetch_related('tags')
        ordering = self.request.query_params.get('ordering', '-created_at')
        return qs.order_by(ordering)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DiscussionCreateSerializer
        elif self.action == 'retrieve':
            return DiscussionDetailSerializer
        return DiscussionListSerializer
    
    def perform_create(self, serializer):
        discussion = serializer.save(author=self.request.user)
        
        # AI misuse detection
        try:
            self._check_ai_misuse(discussion)
        except Exception as e:
            logger.error(f'AI misuse check failed: {e}', exc_info=True)
        
        # Create or update user forum profile
        profile, created = UserForumProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'discussions_count': 1}
        )
        if not created:
            profile.discussions_count = F('discussions_count') + 1
            profile.save()
    
    def _check_ai_misuse(self, discussion):
        """AI-powered content moderation — auto-flags harmful posts"""
        import json, os, traceback
        import google.generativeai as genai
        from django.conf import settings
        from django.db.models import F
        from apps.notifications.email_service import notify_moderation_violation_admin
        from .moderation_models import FlaggedContent
        try:
            api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
            if not api_key:
                logger.warning('[AI MODERATION] No GEMINI_API_KEY configured — skipping')
                return
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            prompt = f"""You are a content moderator for beBrivus, an African student platform.
Analyze this forum post for community violations:
Title: {discussion.title}
Content: {discussion.content[:1000]}

Check for: hate speech, harassment, spam, scams, threats, inappropriate content, discrimination.

Respond ONLY with valid JSON. No markdown. No backticks. No explanation:
{{"violation": true, "severity": "high", "reason": "brief explanation", "type": "spam"}}
OR
{{"violation": false, "severity": "none", "reason": null, "type": "none"}}"""

            response = model.generate_content(prompt)
            text = response.text.strip().replace('```json','').replace('```','').strip()
            result = json.loads(text)
            logger.info(_safe_log(f'[AI MODERATION] Post {discussion.id} result: {result}'))

            if result.get('violation') and result.get('severity') in ['medium', 'high']:
                flag, created = DiscussionFlag.objects.get_or_create(
                    discussion=discussion,
                    flagged_by=discussion.author,
                    defaults={
                        'reason': result.get('type', 'inappropriate')[:50],
                        'details': f"🤖 Auto-detected by AI: {result.get('reason', '')}",
                    }
                )
                if created:
                    Discussion.objects.filter(id=discussion.id).update(
                        is_flagged=True,
                        flag_count=F('flag_count') + 1,
                    )
                    logger.info(_safe_log(f'[AI MODERATION] Discussion {discussion.id} auto-flagged'))
                    
                    # Create FlaggedContent record for moderation center
                    FlaggedContent.objects.create(
                        post_id=discussion.id,
                        content=discussion.content[:500],
                        author_username=discussion.author.username,
                        violation_categories=[result.get('type', 'inappropriate')],
                        ai_confidence=0.85 if result.get('severity') == 'high' else 0.65,
                        reason=result.get('reason', 'Policy violation detected'),
                        status='pending'
                    )
                    
                    # Send notification using centralized email service
                    violation = {
                        'content': discussion.content[:500],
                        'username': discussion.author.username,
                        'post_id': discussion.id,
                        'categories': [result.get('type', 'inappropriate')],
                        'confidence': 0.85 if result.get('severity') == 'high' else 0.65,
                        'reason': result.get('reason', 'Policy violation detected'),
                        'timestamp': timezone.now().isoformat(),
                        'content_type': 'forum_post',
                        'source_url': f'/forum/{discussion.slug}/'
                    }
                    notify_moderation_violation_admin(violation)

        except json.JSONDecodeError as e:
            logger.warning(f'[AI MODERATION] JSON parse error: {e}')
        except Exception as e:
            logger.warning(f'[AI MODERATION] Check skipped (non-critical): {e}\n{traceback.format_exc()}')
    
    def retrieve(self, request, *args, **kwargs):
        try:
            discussion = self.get_object()
        except Discussion.DoesNotExist:
            return Response(
                {'error': 'Discussion not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Track view
        self._track_view(discussion, request)
        
        # Generate AI summary if not exists
        self._generate_ai_summary_if_needed(discussion)
        
        return super().retrieve(request, *args, **kwargs)
    
    def _track_view(self, discussion, request):
        """Track discussion view for analytics"""
        ip_address = self._get_client_ip(request)
        user = request.user if request.user.is_authenticated else None
        
        view, created = DiscussionView.objects.get_or_create(
            discussion=discussion,
            user=user,
            ip_address=ip_address,
            defaults={
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            }
        )
        
        if created:
            # Update view count
            Discussion.objects.filter(id=discussion.id).update(
                views_count=F('views_count') + 1
            )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _generate_ai_summary_if_needed(self, discussion):
        """Generate AI summary if discussion has many replies and no summary"""
        if discussion.replies_count > 5 and not discussion.ai_summary:
            try:
                # Get discussion posts for summary
                posts = []
                posts.append({
                    'author': discussion.author.get_full_name(),
                    'content': discussion.content
                })
                
                # Add recent replies
                recent_replies = discussion.replies.select_related('author')[:10]
                for reply in recent_replies:
                    posts.append({
                        'author': reply.author.get_full_name(),
                        'content': reply.content
                    })
                
                # Generate AI summary
                summary_data = gemini_service.summarize_forum_discussion(posts)
                
                # Update discussion
                discussion.ai_summary = summary_data.get('summary', '')
                discussion.ai_keywords = summary_data.get('key_points', [])
                discussion.save()
                
            except Exception as e:
                logger.error(f"Error generating AI summary for discussion {discussion.id}: {str(e)}")
    
    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        discussion = self.get_object()
        user = request.user

        like_exists = DiscussionLike.objects.filter(
            discussion=discussion, user=user
        ).exists()

        if like_exists:
            DiscussionLike.objects.filter(discussion=discussion, user=user).delete()
            # Only decrement if above 0 — prevents CHECK constraint violation
            Discussion.objects.filter(id=discussion.id, likes_count__gt=0).update(
                likes_count=F('likes_count') - 1
            )
            discussion.refresh_from_db()
            return Response({'liked': False, 'likes_count': discussion.likes_count})
        else:
            DiscussionLike.objects.create(discussion=discussion, user=user)
            Discussion.objects.filter(id=discussion.id).update(
                likes_count=F('likes_count') + 1
            )
            discussion.refresh_from_db()
            return Response({'liked': True, 'likes_count': discussion.likes_count})
    
    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        """Mark discussion as resolved (for questions)"""
        discussion = self.get_object()
        
        # Only author can mark as resolved
        if discussion.author != request.user:
            return Response(
                {'error': 'Only the author can mark this as resolved'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        discussion.is_resolved = not discussion.is_resolved
        discussion.save()
        
        return Response({'is_resolved': discussion.is_resolved})
    
    @action(detail=True, methods=['patch'])
    def moderate(self, request, pk=None):
        """Moderation actions (pin, lock, etc.)"""
        discussion = self.get_object()
        
        # Check if user can moderate
        if not (request.user.is_staff or request.user.is_superuser or request.user.user_type == 'admin'):
            try:
                profile = request.user.forum_profile
                if not profile.is_moderator:
                    return Response(
                        {'error': 'Permission denied'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except UserForumProfile.DoesNotExist:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        action_type = request.data.get('action')
        
        if action_type == 'pin':
            discussion.is_pinned = True
        elif action_type == 'unpin':
            discussion.is_pinned = False
        elif action_type == 'lock':
            discussion.is_locked = True
        elif action_type == 'unlock':
            discussion.is_locked = False
        elif action_type == 'approve':
            discussion.is_flagged = False
            discussion.moderation_status = 'approved'
            discussion.flag_reason = ''
        elif action_type == 'reject':
            discussion.moderation_status = 'rejected'
            discussion.flag_reason = request.data.get('reason', 'Rejected by moderator')
        else:
            return Response(
                {'error': 'Invalid moderation action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        discussion.save()
        
        # Log moderation action
        from .models import ForumModerationLog
        ForumModerationLog.objects.create(
            moderator=request.user,
            action=action_type,
            discussion=discussion,
            reason=request.data.get('reason', '')
        )
        
        return Response({
            'action': action_type,
            'is_pinned': discussion.is_pinned,
            'is_locked': discussion.is_locked,
            'is_flagged': discussion.is_flagged,
            'moderation_status': discussion.moderation_status
        })
    
    @action(detail=False, methods=['get'])
    def flagged(self, request):
        """Get all flagged discussions for moderation"""
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=403)

        # Get ALL flagged posts including auto-flagged by AI
        flagged_posts = Discussion.objects.filter(
            is_flagged=True,
            is_removed=False
        ).select_related('author').prefetch_related(
            'flags', 'flags__flagged_by'
        ).order_by('-flag_count', '-created_at')

        data = []
        for discussion in flagged_posts:
            flags = discussion.flags.filter(is_resolved=False)
            flag_details = []
            for f in flags:
                flag_details.append({
                    'flagged_by': f.flagged_by.username if f.flagged_by else 'AI System',
                    'reason': f.get_reason_display() if hasattr(f, 'get_reason_display') else f.reason,
                    'details': f.details,
                    'created_at': f.created_at.isoformat(),
                })

            data.append({
                'id': discussion.id,
                'slug': discussion.slug,
                'title': discussion.title,
                'content': discussion.content,
                'image': request.build_absolute_uri(discussion.image.url) if discussion.image else None,
                'author': {
                    'id': discussion.author.id,
                    'username': discussion.author.username,
                    'email': discussion.author.email,
                    'full_name': discussion.author.get_full_name() or discussion.author.username,
                },
                'flag_count': discussion.flag_count,
                'flags': flag_details,
                'is_ai_flagged': any('🤖' in f.get('details', '') or 'Auto-detected' in f.get('details', '') for f in flag_details),
                'created_at': discussion.created_at.isoformat(),
            })

        return Response(data)
    
    @action(detail=True, methods=['post'])
    def flag(self, request, slug=None):
        discussion = self.get_object()
        user = request.user

        if discussion.author == user:
            return Response({'error': 'You cannot flag your own post.'}, status=400)

        reason = request.data.get('reason', 'inappropriate')
        details = request.data.get('details', '')

        flag, created = DiscussionFlag.objects.get_or_create(
            discussion=discussion,
            flagged_by=user,
            defaults={'reason': reason, 'details': details}
        )

        if not created:
            return Response({'error': 'You have already flagged this post.'}, status=400)

        from django.db.models import F
        Discussion.objects.filter(id=discussion.id).update(
            flag_count=F('flag_count') + 1,
            is_flagged=True
        )
        discussion.refresh_from_db()

        # Send email to ALL admins on EVERY flag
        try:
            from django.core.mail import EmailMultiAlternatives
            from django.conf import settings

            admin_emails = get_admin_emails()

            if admin_emails:
                admin_login_url = getattr(settings, 'FRONTEND_ADMIN_LOGIN_URL', 'https://bebrivus.com/admin/login')
                reason_labels = {
                    'spam': 'Spam',
                    'hate_speech': 'Hate Speech',
                    'harassment': 'Harassment',
                    'misinformation': 'Misinformation',
                    'inappropriate': 'Inappropriate Content',
                    'violence': 'Violence or Threats',
                    'other': 'Other',
                }

                urgency = '🚨 URGENT —' if discussion.flag_count >= 3 else '⚠️'
                subject = f'{urgency} Forum Post Flagged ({discussion.flag_count} flag{"s" if discussion.flag_count > 1 else ""}) — beBrivus'

                html = f"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:{'#ef4444' if discussion.flag_count >= 3 else '#f59e0b'};padding:20px;border-radius:12px 12px 0 0;">
                    <h2 style="color:white;margin:0;">{'🚨 Urgent: ' if discussion.flag_count >= 3 else '⚠️ '}Forum Post Flagged</h2>
                  </div>
                  <div style="padding:24px;background:#f9fafb;border-radius:0 0 12px 12px;">
                    <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e5e7eb;margin-bottom:16px;">
                      <p><strong>Post Title:</strong> {discussion.title}</p>
                      <p><strong>Author:</strong> {discussion.author.get_full_name() or discussion.author.username} (@{discussion.author.username})</p>
                      <p><strong>Author Email:</strong> {discussion.author.email}</p>
                      <p><strong>Flag Count:</strong> {discussion.flag_count}</p>
                      <p><strong>Flagged By:</strong> {user.get_full_name() or user.username} (@{user.username})</p>
                      <p><strong>Reason:</strong> {reason_labels.get(reason, reason)}</p>
                      {'<p><strong>Details:</strong> ' + details + '</p>' if details else ''}
                    </div>
                    <div style="background:#fef2f2;border-radius:8px;padding:12px;margin-bottom:16px;border-left:4px solid #ef4444;">
                      <p style="margin:0;font-style:italic;color:#374151;">"{discussion.content[:300]}{'...' if len(discussion.content) > 300 else ''}"</p>
                    </div>
                    {'<div style="background:#fef2f2;border-radius:8px;padding:12px;margin-bottom:16px;"><p style="color:#ef4444;font-weight:700;margin:0;">⚠️ This post has been flagged 3+ times and requires immediate review.</p></div>' if discussion.flag_count >= 3 else ''}
                    <div style="text-align:center;">
                                                                                        <a href="{admin_login_url}"
                         style="background:#1f2937;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                        Review in Admin Panel
                      </a>
                    </div>
                    <p style="font-size:12px;color:#9ca3af;margin-top:16px;text-align:center;">beBrivus Moderation System</p>
                  </div>
                </div>
                """

                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=f'Post "{discussion.title}" flagged by {user.username} for {reason}. Flag count: {discussion.flag_count}. Review at {admin_login_url}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=admin_emails
                )
                msg.attach_alternative(html, 'text/html')
                msg.send()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f'Flag email failed: {e}')

        return Response({
            'message': 'Post reported. Our moderation team has been notified.',
            'flag_count': discussion.flag_count
        })
    
    @action(detail=True, methods=['post'])
    def resolve_flag(self, request, slug=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=403)

        from django.utils import timezone as tz
        current_time = tz.now().strftime('%Y-%m-%d %H:%M UTC')

        discussion = self.get_object()
        action_taken = request.data.get('action', 'none')
        note = request.data.get('note', '')
        author = discussion.author

        # Apply action to discussion
        if action_taken == 'removed':
            discussion.is_removed = True
            discussion.removal_reason = note or 'Removed for violating community guidelines.'
            discussion.is_flagged = False
            discussion.save()

        elif action_taken == 'warned':
            discussion.is_flagged = False
            discussion.save()

        elif action_taken == 'banned':
            discussion.is_removed = True
            discussion.removal_reason = 'Author account suspended.'
            discussion.is_flagged = False
            discussion.save()
            author.is_active = False
            author.save()

        elif action_taken in ['none', 'dismissed']:
            discussion.is_flagged = False
            discussion.flag_count = 0
            discussion.save()

        # Resolve all open flags
        DiscussionFlag.objects.filter(
            discussion=discussion, is_resolved=False
        ).update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=tz.now(),
            admin_action=action_taken,
        )

        # Action labels
        action_labels = {
            'warned': '⚠️ Warning Issued',
            'removed': '🗑️ Post Removed',
            'banned': '🚫 User Banned',
            'none': '✅ Flag Dismissed',
            'dismissed': '✅ Flag Dismissed',
        }

        # Email to affected user (not for dismiss)
        if action_taken not in ['none', 'dismissed']:
            subjects = {
                'warned': '⚠️ Warning — beBrivus Community Guidelines',
                'removed': '🗑️ Your Post Was Removed — beBrivus',
                'banned': '🚫 Your Account Has Been Suspended — beBrivus',
            }
            colors = {'warned': '#f59e0b', 'removed': '#ef4444', 'banned': '#1f2937'}
            messages = {
                'warned': f'Your post "<strong>{discussion.title}</strong>" was reviewed and issued a formal warning.',
                'removed': f'Your post "<strong>{discussion.title}</strong>" was removed for violating community guidelines.',
                'banned': f'Your account has been suspended due to severe violations. Post: "<strong>{discussion.title}</strong>".',
            }
            color = colors.get(action_taken, '#6b7280')
            user_html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:{color};padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;">beBrivus</h1>
              </div>
              <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
                <h2 style="color:#111827;">{action_labels.get(action_taken)}</h2>
                <p>Hello {author.get_full_name() or author.username},</p>
                <p>{messages.get(action_taken)}</p>
                {'<div style="background:#fef2f2;border-radius:8px;padding:12px;"><strong>Admin note:</strong> ' + note + '</div>' if note else ''}
                <p style="color:#6b7280;font-size:13px;margin-top:16px;">
                  {'Please review our community guidelines before posting again.' if action_taken == 'warned' else ''}
                  {'If you believe this was a mistake, contact support@bebrivus.com' if action_taken in ['removed','banned'] else ''}
                </p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
                <p style="font-size:12px;color:#9ca3af;text-align:center;">beBrivus — Empowering African Students</p>
              </div>
            </div>"""
            user_plain = f'Hello {author.username}, {messages.get(action_taken, "")} Note: {note}'
            send_user_email(
                to_email=author.email,
                subject=subjects.get(action_taken, 'Moderation Notice — beBrivus'),
                html_body=user_html,
                plain_body=user_plain,
                bcc_admin=True,
            )

        # Admin moderation log email
        admin_html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1f2937;padding:20px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;">🛡️ Moderation Log — beBrivus</h2>
          </div>
          <div style="padding:24px;background:#f9fafb;border-radius:0 0 12px 12px;">
            <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
              <p><strong>Action:</strong> {action_labels.get(action_taken)}</p>
              <p><strong>Post:</strong> "{discussion.title}"</p>
              <p><strong>Author:</strong> {author.get_full_name() or author.username} ({author.email})</p>
              <p><strong>Moderator:</strong> {request.user.get_full_name() or request.user.username} ({request.user.email})</p>
              <p><strong>Note:</strong> {note or 'No note provided'}</p>
              <p><strong>Time:</strong> {current_time}</p>
            </div>
            <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:16px;">beBrivus Moderation System</p>
          </div>
        </div>"""
        admin_plain = f'Moderation: {action_taken} | Post: {discussion.title} | Author: {author.username} | By: {request.user.username} | Note: {note} | Time: {current_time}'
        send_admin_alert_email(
            subject=f'✅ Moderation: {action_labels.get(action_taken)} — "{discussion.title[:40]}"',
            html_body=admin_html,
            plain_body=admin_plain,
        )

        return Response({
            'status': 'ok',
            'action': action_taken,
            'message': f'{action_labels.get(action_taken)} applied successfully.',
        })
    
    def update(self, request, slug=None, partial=False):
        discussion = self.get_object()

        # Only the author can edit their own discussion
        if discussion.author != request.user:
            return Response(
                {'error': 'You can only edit your own discussions.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DiscussionListSerializer(
            discussion, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(updated_at=timezone.now())
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, slug=None):
        discussion = self.get_object()

        # Only the author or admin can delete
        if discussion.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own discussions.'},
                status=status.HTTP_403_FORBIDDEN
            )

        discussion.delete()
        return Response({'message': 'Discussion deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class ReplyViewSet(viewsets.ModelViewSet):
    """ViewSet for forum replies"""
    permission_classes = [IsAuthenticated]

    def _get_discussion(self):
        discussion_key = self.kwargs.get('discussion_pk') or self.kwargs.get('discussion_slug')
        if not discussion_key:
            raise Http404("Discussion identifier not provided.")
        
        try:
            discussion_id = int(discussion_key)
            discussion = Discussion.objects.filter(Q(id=discussion_id) | Q(slug=discussion_key)).first()
        except (ValueError, TypeError):
            discussion = Discussion.objects.filter(slug=discussion_key).first()
        
        if not discussion:
            raise Http404("No Discussion matches the given query.")
        return discussion
    
    def get_queryset(self):
        discussion = self._get_discussion()
        return Reply.objects.filter(discussion=discussion).select_related('author')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReplyCreateSerializer
        return ReplySerializer
    
    def perform_create(self, serializer):
        from threading import Thread
        discussion = self._get_discussion()
        
        # Check if discussion is locked
        if discussion.is_locked:
            raise serializers.ValidationError({'error': 'Discussion is locked'})
        
        reply = serializer.save(
            author=self.request.user,
            discussion=discussion
        )
        
        # Update discussion counts and last activity immediately
        Discussion.objects.filter(id=discussion.id).update(
            replies_count=F('replies_count') + 1,
            last_activity=timezone.now()
        )
        
        # Update user forum profile
        profile, created = UserForumProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'replies_count': 1}
        )
        if not created:
            profile.replies_count = F('replies_count') + 1
            profile.save()
        
        # Run AI moderation asynchronously in background
        Thread(target=self._moderate_reply_content, args=(reply,), daemon=True).start()
    
    def _moderate_reply_content(self, reply):
        """AI-powered content moderation for replies"""
        try:
            moderation_result = gemini_service.moderate_content(
                reply.content,
                content_type="reply"
            )
            
            reply.ai_moderation_score = moderation_result.get('toxicity_score', 0.0)
            
            if moderation_result.get('should_flag', False):
                reply.is_flagged = True
                reply.moderation_status = 'auto_flagged'
                reply.flag_reason = moderation_result.get('reason', 'Flagged by AI')
                
                # Log moderation action
                from .models import ForumModerationLog
                ForumModerationLog.objects.create(
                    moderator=self.request.user,
                    action='ai_flag',
                    reply=reply,
                    reason=f"AI Moderation: {reply.flag_reason}"
                )
            
            reply.save()
        except Exception as e:
            logger.error(f"Error moderating reply content: {str(e)}")
    
    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None, **kwargs):
        """Like or unlike a reply (toggle)"""
        reply = self.get_object()
        
        if request.method == 'POST':
            # Check if already liked
            existing_like = DiscussionLike.objects.filter(
                user=request.user,
                reply=reply
            ).first()
            
            if existing_like:
                # Unlike - delete the like
                existing_like.delete()
                Reply.objects.filter(id=reply.id).update(
                    likes_count=F('likes_count') - 1
                )
                return Response({'liked': False, 'message': 'Unliked'})
            else:
                # Like - create the like
                DiscussionLike.objects.create(
                    user=request.user,
                    reply=reply
                )
                Reply.objects.filter(id=reply.id).update(
                    likes_count=F('likes_count') + 1
                )
                return Response({'liked': True, 'message': 'Liked'})
        
        elif request.method == 'DELETE':
            deleted_count = DiscussionLike.objects.filter(
                user=request.user,
                reply=reply
            ).delete()[0]
            
            if deleted_count > 0:
                Reply.objects.filter(id=reply.id).update(
                    likes_count=F('likes_count') - 1
                )
                return Response({'liked': False})
            else:
                return Response({'liked': False, 'message': 'Not liked'})
    
    @action(detail=True, methods=['post'])
    def report(self, request, pk=None, **kwargs):
        """Report a reply for moderation"""
        from threading import Thread
        reply = self.get_object()
        
        # Run Gemini scan on the reply
        def scan_and_flag():
            try:
                moderation_result = gemini_service.moderate_content(
                    reply.content,
                    content_type="reply"
                )
                
                if moderation_result.get('should_flag', False):
                    # Create FlaggedContent record
                    from .moderation_models import FlaggedContent
                    from .moderation_service import send_violation_alert
                    from django.utils import timezone
                    
                    flagged = FlaggedContent.objects.create(
                        post_id=reply.id,
                        content=reply.content[:500],
                        author_username=reply.author.username,
                        violation_categories=moderation_result.get('categories', []),
                        ai_confidence=moderation_result.get('toxicity_score', 0.0),
                        reason=moderation_result.get('reason', 'Reported by user'),
                        status='pending'
                    )
                    
                    # Send email alert
                    violation = {
                        'content': flagged.content,
                        'username': flagged.author_username,
                        'post_id': flagged.post_id,
                        'categories': flagged.violation_categories,
                        'confidence': flagged.ai_confidence,
                        'reason': flagged.reason,
                        'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'source': 'Forum Reply Report'
                    }
                    send_violation_alert(violation)
            except Exception as e:
                logger.error(f"Error scanning reported reply: {str(e)}")
        
        Thread(target=scan_and_flag, daemon=True).start()
        
        return Response({'message': 'Reply reported — our team will review it'})
    
    @action(detail=True, methods=['patch'])
    def mark_solution(self, request, pk=None, **kwargs):
        """Mark reply as solution to question"""
        reply = self.get_object()
        discussion = reply.discussion
        
        # Only discussion author can mark solutions
        if discussion.author != request.user:
            return Response(
                {'error': 'Only the question author can mark solutions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only questions can have solutions
        if discussion.discussion_type != 'question':
            return Response(
                {'error': 'Only questions can have solutions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove previous solution
        Reply.objects.filter(discussion=discussion).update(is_solution=False)
        
        # Mark this as solution
        reply.is_solution = True
        reply.save()
        
        # Mark discussion as resolved
        discussion.is_resolved = True
        discussion.save()
        
        # Update reply author's reputation
        profile, created = UserForumProfile.objects.get_or_create(
            user=reply.author,
            defaults={'solutions_count': 1, 'reputation_score': 10}
        )
        if not created:
            profile.solutions_count = F('solutions_count') + 1
            profile.reputation_score = F('reputation_score') + 10
            profile.save()
        
        return Response({'is_solution': True})
    
    def update(self, request, pk=None, partial=False):
        reply = self.get_object()

        if reply.author != request.user:
            return Response(
                {'error': 'You can only edit your own replies.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            reply, data=request.data, partial=partial
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        reply = self.get_object()

        if reply.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own replies.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reply.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        reply = self.get_object()

        if reply.author == request.user:
            return Response(
                {'error': 'You cannot flag your own reply.'},
                status=400
            )

        reason = request.data.get('reason', 'inappropriate')
        details = request.data.get('details', '')

        # Use existing ReplyFlag model
        from .models import ReplyFlag
        flag, created = ReplyFlag.objects.get_or_create(
            reply=reply,
            flagged_by=request.user,
            defaults={'reason': reason, 'details': details}
        )

        if not created:
            return Response(
                {'error': 'You have already flagged this reply.'},
                status=400
            )

        # Notify admin by email if flagged 3+ times
        flag_count = ReplyFlag.objects.filter(reply=reply).count()
        if flag_count >= 3:
            try:
                from django.core.mail import send_mail
                from django.conf import settings

                admin_emails = get_admin_emails()
                if admin_emails:
                    send_mail(
                        subject=f'⚠️ Reply flagged {flag_count} times — Needs Review',
                        message=f'Reply by {reply.author.username} has been flagged {flag_count} times.\n\nReason: {reason}\n\nContent:\n{reply.content}\n\nPlease review in admin forum management.',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=admin_emails,
                        fail_silently=True,
                    )
            except Exception:
                pass

        return Response({
            'message': 'Reply flagged. Our team will review it.',
            'flag_count': flag_count
        })


class ForumStatsView(APIView):
    """Get forum statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Basic stats
        stats = {
            'total_discussions': Discussion.objects.count(),
            'total_replies': Reply.objects.count(),
            'active_discussions': Discussion.objects.filter(
                last_activity__gte=timezone.now() - timedelta(days=7)
            ).count(),
            'resolved_questions': Discussion.objects.filter(
                discussion_type='question',
                is_resolved=True
            ).count(),
        }
        
        # Recent activity
        recent_discussions = Discussion.objects.select_related('author', 'category')[:5]
        stats['recent_discussions'] = DiscussionListSerializer(
            recent_discussions,
            many=True,
            context={'request': request}
        ).data
        
        return Response(stats)

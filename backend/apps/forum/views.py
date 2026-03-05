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
    DiscussionView, UserForumProfile
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
        return Discussion.objects.select_related('author', 'category').prefetch_related('tags')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DiscussionCreateSerializer
        elif self.action == 'retrieve':
            return DiscussionDetailSerializer
        return DiscussionListSerializer
    
    def perform_create(self, serializer):
        discussion = serializer.save(author=self.request.user)
        
        # AI content moderation
        self._moderate_content(discussion)
        
        # Create or update user forum profile
        profile, created = UserForumProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'discussions_count': 1}
        )
        if not created:
            profile.discussions_count = F('discussions_count') + 1
            profile.save()
    
    def _moderate_content(self, discussion):
        """AI-powered content moderation"""
        try:
            moderation_result = gemini_service.moderate_content(
                f"{discussion.title}\n\n{discussion.content}",
                content_type="discussion"
            )
            
            discussion.ai_moderation_score = moderation_result.get('toxicity_score', 0.0)
            
            if moderation_result.get('should_flag', False):
                discussion.is_flagged = True
                discussion.moderation_status = 'auto_flagged'
                discussion.flag_reason = moderation_result.get('reason', 'Flagged by AI')
                
                # Create FlaggedContent record for admin review
                from .moderation_models import FlaggedContent
                from .moderation_service import send_violation_alert
                from django.utils import timezone
                
                flagged = FlaggedContent.objects.create(
                    post_id=discussion.id,
                    content=f"{discussion.title}\n\n{discussion.content}"[:500],
                    author_username=discussion.author.username,
                    violation_categories=moderation_result.get('categories', []),
                    ai_confidence=moderation_result.get('toxicity_score', 0.0),
                    reason=moderation_result.get('reason', 'Flagged by AI'),
                    status='pending'
                )
                
                # Send email alert to ethxkeys@gmail.com
                violation = {
                    'content': flagged.content,
                    'username': flagged.author_username,
                    'post_id': flagged.post_id,
                    'categories': flagged.violation_categories,
                    'confidence': flagged.ai_confidence,
                    'reason': flagged.reason,
                    'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                send_violation_alert(violation)
                
                # Log moderation action
                from .models import ForumModerationLog
                ForumModerationLog.objects.create(
                    moderator=self.request.user,
                    action='ai_flag',
                    discussion=discussion,
                    reason=f"AI Moderation: {discussion.flag_reason}"
                )
            
            discussion.save()
        except Exception as e:
            logger.error(f"Error moderating discussion content: {str(e)}")
    
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
        if not (request.user.is_staff or request.user.is_superuser or request.user.user_type == 'admin'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        flagged_discussions = Discussion.objects.filter(
            Q(is_flagged=True) | Q(moderation_status='auto_flagged')
        ).select_related('author', 'category').order_by('-created_at')
        
        serializer = DiscussionListSerializer(flagged_discussions, many=True, context={'request': request})
        return Response(serializer.data)
    
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
                from django.contrib.auth import get_user_model
                from django.core.mail import send_mail
                from django.conf import settings
                User = get_user_model()
                admin_emails = list(
                    User.objects.filter(is_staff=True).values_list('email', flat=True)
                )
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

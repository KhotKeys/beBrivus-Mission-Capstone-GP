from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import Badge, UserBadge, Level, UserProfile, PointTransaction
from .serializers import (
    BadgeSerializer, UserBadgeSerializer, LevelSerializer, UserProfileSerializer,
    PointTransactionSerializer, LeaderboardEntrySerializer, UserStatsSerializer,
    GamificationSummarySerializer
)

User = get_user_model()


class BadgeListView(generics.ListAPIView):
    """List all available badges"""
    serializer_class = BadgeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        queryset = Badge.objects.filter(is_active=True)
        
        # Hide secret badges if not earned
        if user.is_authenticated:
            earned_badge_ids = UserBadge.objects.filter(
                user=user, earned=True
            ).values_list('badge_id', flat=True)
            queryset = queryset.filter(
                Q(is_hidden=False) | Q(id__in=earned_badge_ids)
            )
        else:
            queryset = queryset.filter(is_hidden=False)
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('display_order', 'name')


class UserBadgesView(generics.ListAPIView):
    """Get user's badges"""
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(
            user=self.request.user
        ).select_related('badge').order_by('-earned_at')


class LevelListView(generics.ListAPIView):
    """List all levels"""
    serializer_class = LevelSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Level.objects.all().order_by('level_number')


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update user's gamification profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class UserStatsView(APIView):
    """Get user's gamification statistics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Calculate rank
        higher_users = UserProfile.objects.filter(total_points__gt=profile.total_points).count()
        rank = higher_users + 1
        
        stats = {
            'total_points': profile.total_points,
            'current_level': profile.current_level.level_number if profile.current_level else 0,
            'badges_earned': profile.badges_earned,
            'rank': rank,
            'login_streak': profile.current_login_streak,
            'applications_count': profile.applications_submitted,
            'resources_completed': profile.resources_completed
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)


class PointTransactionListView(generics.ListAPIView):
    """Get user's point transaction history"""
    serializer_class = PointTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PointTransaction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class LeaderboardView(APIView):
    """Get leaderboard data"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        leaderboard_type = request.query_params.get('type', 'points')
        time_period = request.query_params.get('period', 'all_time')
        limit = int(request.query_params.get('limit', 10))
        
        # Base queryset
        profiles = UserProfile.objects.select_related('user', 'current_level')
        
        if leaderboard_type == 'points':
            top_profiles = profiles.order_by('-total_points')[:limit]
            leaderboard_data = []
            for i, profile in enumerate(top_profiles):
                leaderboard_data.append({
                    'rank': i + 1,
                    'user_id': profile.user.id,
                    'username': profile.user.username,
                    'score': profile.total_points,
                    'level': profile.current_level.level_number if profile.current_level else 0,
                    'badges_count': profile.badges_earned
                })
        
        elif leaderboard_type == 'level':
            top_profiles = profiles.exclude(current_level=None).order_by(
                '-current_level__level_number', '-total_points'
            )[:limit]
            leaderboard_data = []
            for i, profile in enumerate(top_profiles):
                leaderboard_data.append({
                    'rank': i + 1,
                    'user_id': profile.user.id,
                    'username': profile.user.username,
                    'score': profile.current_level.level_number,
                    'level': profile.current_level.level_number,
                    'badges_count': profile.badges_earned
                })
        
        elif leaderboard_type == 'badges':
            top_profiles = profiles.order_by('-badges_earned', '-total_points')[:limit]
            leaderboard_data = []
            for i, profile in enumerate(top_profiles):
                leaderboard_data.append({
                    'rank': i + 1,
                    'user_id': profile.user.id,
                    'username': profile.user.username,
                    'score': profile.badges_earned,
                    'level': profile.current_level.level_number if profile.current_level else 0,
                    'badges_count': profile.badges_earned
                })
        
        else:
            leaderboard_data = []
        
        serializer = LeaderboardEntrySerializer(leaderboard_data, many=True)
        return Response(serializer.data)


class AwardPointsView(APIView):
    """Award points to a user (admin only)"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        points = request.data.get('points', 0)
        reason = request.data.get('reason', 'Manual award')
        
        try:
            user = User.objects.get(id=user_id)
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            awarded_points = profile.add_points(points, reason)
            
            return Response({
                'message': f'Awarded {awarded_points} points to {user.username}',
                'new_total': profile.total_points,
                'level': profile.current_level.name if profile.current_level else 'No level'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CheckBadgeProgressView(APIView):
    """Check and update badge progress for a user"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Check all active badges for potential awards
        badges_earned = []
        badges = Badge.objects.filter(is_active=True)
        
        for badge in badges:
            user_badge, created = UserBadge.objects.get_or_create(
                user=user, badge=badge, defaults={'earned': False}
            )
            
            if not user_badge.earned:
                # Check badge conditions based on condition_type
                should_award = False
                
                if badge.condition_type == 'total_points':
                    should_award = profile.total_points >= badge.condition_value
                elif badge.condition_type == 'applications_submitted':
                    should_award = profile.applications_submitted >= badge.condition_value
                elif badge.condition_type == 'resources_completed':
                    should_award = profile.resources_completed >= badge.condition_value
                elif badge.condition_type == 'forum_posts':
                    should_award = profile.forum_posts >= badge.condition_value
                elif badge.condition_type == 'login_streak':
                    should_award = profile.current_login_streak >= badge.condition_value
                elif badge.condition_type == 'badges_earned':
                    should_award = profile.badges_earned >= badge.condition_value
                
                if should_award:
                    user_badge.earned = True
                    user_badge.progress = badge.condition_value
                    user_badge.save()
                    
                    profile.badges_earned += 1
                    if badge.rarity in ['rare', 'epic', 'legendary']:
                        profile.rare_badges_earned += 1
                    
                    # Award points if specified
                    if badge.points_required > 0:
                        profile.add_points(badge.points_required, f"Earned badge: {badge.name}")
                    
                    badges_earned.append(badge)
        
        profile.save()
        
        return Response({
            'badges_earned': [{'name': b.name, 'icon': b.icon, 'rarity': b.rarity} for b in badges_earned],
            'total_badges': profile.badges_earned
        })


class GamificationSummaryView(APIView):
    """Get gamification system overview"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_users = UserProfile.objects.count()
        total_badges = Badge.objects.filter(is_active=True).count()
        total_points = UserProfile.objects.aggregate(
            total=Sum('total_points')
        )['total'] or 0
        
        # Top 5 performers
        top_performers = UserProfile.objects.select_related('user', 'current_level').order_by(
            '-total_points'
        )[:5]
        
        top_performers_data = []
        for i, profile in enumerate(top_performers):
            top_performers_data.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'score': profile.total_points,
                'level': profile.current_level.level_number if profile.current_level else 0,
                'badges_count': profile.badges_earned
            })
        
        summary_data = {
            'total_users': total_users,
            'total_badges': total_badges,
            'total_points_distributed': total_points,
            'active_challenges': 0,  # TODO: Add when challenges are implemented
            'top_performers': top_performers_data
        }
        
        serializer = GamificationSummarySerializer(summary_data)
        return Response(serializer.data)

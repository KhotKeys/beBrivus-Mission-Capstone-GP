from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Badge, UserBadge, Level, UserProfile, PointTransaction

User = get_user_model()


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for badges"""
    earned_count = serializers.ReadOnlyField()
    user_earned = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'rarity',
            'icon', 'color', 'points_required', 'condition_type', 
            'condition_value', 'condition_data', 'is_active', 'is_hidden',
            'earned_count', 'user_earned', 'user_progress', 'created_at'
        ]

    def get_user_earned(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.user_badges.filter(user=user, earned=True).exists()
        return False

    def get_user_progress(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            user_badge = obj.user_badges.filter(user=user).first()
            return user_badge.progress if user_badge else 0
        return 0


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for user badges"""
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = [
            'id', 'badge', 'earned', 'earned_at', 'progress', 'notified'
        ]


class LevelSerializer(serializers.ModelSerializer):
    """Serializer for levels"""
    class Meta:
        model = Level
        fields = [
            'id', 'level_number', 'name', 'min_points', 'max_points',
            'icon', 'color', 'benefits'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user gamification profile"""
    current_level = LevelSerializer(read_only=True)
    next_level = serializers.SerializerMethodField()
    total_badges = serializers.SerializerMethodField()
    recent_badges = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'user', 'total_points', 'current_level', 'level_progress',
            'current_login_streak', 'longest_login_streak',
            'current_activity_streak', 'longest_activity_streak',
            'applications_submitted', 'opportunities_bookmarked',
            'resources_completed', 'forum_posts', 'forum_likes_received',
            'mentoring_sessions', 'workshops_attended', 'badges_earned',
            'rare_badges_earned', 'show_progress', 'public_profile',
            'next_level', 'total_badges', 'recent_badges', 'rank'
        ]
        read_only_fields = [
            'user', 'total_points', 'level_progress', 'current_login_streak',
            'longest_login_streak', 'current_activity_streak', 'longest_activity_streak',
            'applications_submitted', 'opportunities_bookmarked', 'resources_completed',
            'forum_posts', 'forum_likes_received', 'mentoring_sessions',
            'workshops_attended', 'badges_earned', 'rare_badges_earned'
        ]

    def get_next_level(self, obj):
        if obj.current_level:
            next_level = Level.objects.filter(
                level_number=obj.current_level.level_number + 1
            ).first()
            return LevelSerializer(next_level).data if next_level else None
        else:
            first_level = Level.objects.order_by('level_number').first()
            return LevelSerializer(first_level).data if first_level else None

    def get_total_badges(self, obj):
        return obj.user.badges.filter(earned=True).count()

    def get_recent_badges(self, obj):
        recent_badges = obj.user.badges.filter(earned=True).order_by('-earned_at')[:5]
        return UserBadgeSerializer(recent_badges, many=True).data

    def get_rank(self, obj):
        # Get user's rank based on total points
        higher_users = UserProfile.objects.filter(total_points__gt=obj.total_points).count()
        return higher_users + 1


class PointTransactionSerializer(serializers.ModelSerializer):
    """Serializer for point transactions"""
    user = serializers.StringRelatedField()

    class Meta:
        model = PointTransaction
        fields = [
            'id', 'user', 'points', 'transaction_type', 'reason',
            'description', 'created_at'
        ]


class LeaderboardEntrySerializer(serializers.Serializer):
    """Serializer for leaderboard entries"""
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    score = serializers.IntegerField()
    level = serializers.IntegerField(required=False)
    badges_count = serializers.IntegerField(required=False)


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user statistics"""
    total_points = serializers.IntegerField()
    current_level = serializers.IntegerField()
    badges_earned = serializers.IntegerField()
    rank = serializers.IntegerField()
    login_streak = serializers.IntegerField()
    applications_count = serializers.IntegerField()
    resources_completed = serializers.IntegerField()


class GamificationSummarySerializer(serializers.Serializer):
    """Serializer for gamification overview"""
    total_users = serializers.IntegerField()
    total_badges = serializers.IntegerField()
    total_points_distributed = serializers.IntegerField()
    active_challenges = serializers.IntegerField()
    top_performers = LeaderboardEntrySerializer(many=True)

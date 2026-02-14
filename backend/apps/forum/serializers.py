from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ForumCategory, Discussion, Reply, DiscussionLike, 
    UserForumProfile
)

User = get_user_model()


class ForumCategorySerializer(serializers.ModelSerializer):
    """Serializer for forum categories"""
    discussions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'slug', 'description', 'color', 'icon', 'is_active', 'order', 'discussions_count']
        read_only_fields = ['discussions_count']
    
    def get_discussions_count(self, obj):
        return obj.discussions.filter(is_locked=False).count()


class ForumCategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating forum categories"""
    
    class Meta:
        model = ForumCategory
        fields = ['name', 'description', 'color', 'icon', 'is_active', 'order']


class UserForumSerializer(serializers.ModelSerializer):
    """Serializer for user info in forum context"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    forum_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'profile_picture', 'forum_profile']
    
    def get_forum_profile(self, obj):
        try:
            profile = obj.forum_profile
            return {
                'reputation_score': profile.reputation_score,
                'discussions_count': profile.discussions_count,
                'replies_count': profile.replies_count,
                'solutions_count': profile.solutions_count,
                'is_moderator': profile.is_moderator,
            }
        except UserForumProfile.DoesNotExist:
            return {
                'reputation_score': 0,
                'discussions_count': 0,
                'replies_count': 0,
                'solutions_count': 0,
                'is_moderator': False,
            }


class ReplySerializer(serializers.ModelSerializer):
    """Serializer for forum replies"""
    author = UserForumSerializer(read_only=True)
    child_replies = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = [
            'id', 'content', 'author', 'parent', 'likes_count',
            'is_solution', 'is_edited', 'created_at', 'updated_at',
            'child_replies', 'is_liked_by_user', 'can_edit', 'can_delete'
        ]
        read_only_fields = ['likes_count', 'is_edited', 'created_at', 'updated_at']
    
    def get_child_replies(self, obj):
        if obj.child_replies.exists():
            return ReplySerializer(obj.child_replies.all(), many=True, context=self.context).data
        return []
    
    def get_is_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False
    
    def get_can_edit(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return obj.author == user or getattr(user.forum_profile, 'is_moderator', False)
    
    def get_can_delete(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return obj.author == user or getattr(user.forum_profile, 'is_moderator', False)


class DiscussionListSerializer(serializers.ModelSerializer):
    """Serializer for discussion list view"""
    author = UserForumSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    latest_reply = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    tag_list = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'slug', 'content', 'discussion_type', 'author', 'category',
            'views_count', 'likes_count', 'replies_count',
            'is_pinned', 'is_locked', 'is_resolved',
            'created_at', 'updated_at', 'last_activity',
            'latest_reply', 'is_liked_by_user', 'tag_list'
        ]
    
    def get_latest_reply(self, obj):
        latest_reply = obj.replies.last()
        if latest_reply:
            return {
                'author': latest_reply.author.get_full_name(),
                'created_at': latest_reply.created_at
            }
        return None
    
    def get_is_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False


class DiscussionDetailSerializer(serializers.ModelSerializer):
    """Serializer for discussion detail view with replies"""
    author = UserForumSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_moderate = serializers.SerializerMethodField()
    tag_list = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'slug', 'content', 'discussion_type', 'author', 'category',
            'views_count', 'likes_count', 'replies_count',
            'is_pinned', 'is_locked', 'is_resolved',
            'ai_summary', 'ai_keywords',
            'created_at', 'updated_at', 'last_activity',
            'replies', 'is_liked_by_user', 'can_edit', 'can_delete', 'can_moderate',
            'tag_list'
        ]
    
    def get_is_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False
    
    def get_can_edit(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return obj.author == user or getattr(user.forum_profile, 'is_moderator', False)
    
    def get_can_delete(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return obj.author == user or getattr(user.forum_profile, 'is_moderator', False)
    
    def get_can_moderate(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return getattr(user.forum_profile, 'is_moderator', False)


class DiscussionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating discussions"""
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True  # This is only for input, not output
    )
    tag_list = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Discussion
        fields = ['id', 'title', 'slug', 'content', 'discussion_type', 'category', 'tags', 'tag_list']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True}
        }
    
    def get_tag_list(self, obj):
        """Return tags as list of strings for output"""
        return [tag.name for tag in obj.tags.all()]
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        discussion = Discussion.objects.create(**validated_data)
        
        if tags_data:
            discussion.tags.set(tags_data)
        
        return discussion


class ReplyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating replies"""
    class Meta:
        model = Reply
        fields = ['content', 'parent']

from rest_framework import serializers
from django.contrib.auth import get_user_model
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import (
    ResourceCategory, Resource, Workshop, WorkshopRegistration,
    ResourceRating, ResourceBookmark, ResourceCollection, ResourceCollectionItem,
    ResourceComment, ResourceProgress, ResourceView, ResourceDownload
)

User = get_user_model()


class ResourceCategorySerializer(serializers.ModelSerializer):
    """Serializer for resource categories"""
    subcategories = serializers.SerializerMethodField()
    resource_count = serializers.SerializerMethodField()

    class Meta:
        model = ResourceCategory
        fields = [
            'id', 'name', 'description', 'slug', 'parent', 'icon',
            'is_active', 'display_order', 'subcategories', 'resource_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return ResourceCategorySerializer(obj.subcategories.filter(is_active=True), many=True).data
        return []

    def get_resource_count(self, obj):
        return obj.resources.filter(is_published=True).count()


class UserSerializer(serializers.ModelSerializer):
    """Simple user serializer for resource contexts"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class ResourceRatingSerializer(serializers.ModelSerializer):
    """Serializer for resource ratings"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = ResourceRating
        fields = ['id', 'user', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class ResourceCommentSerializer(serializers.ModelSerializer):
    """Serializer for resource comments"""
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = ResourceComment
        fields = [
            'id', 'user', 'parent', 'content', 'is_approved',
            'replies', 'reply_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return ResourceCommentSerializer(
                obj.replies.filter(is_approved=True)[:5], many=True
            ).data
        return []

    def get_reply_count(self, obj):
        return obj.replies.filter(is_approved=True).count()


class ResourceProgressSerializer(serializers.ModelSerializer):
    """Serializer for resource progress"""
    class Meta:
        model = ResourceProgress
        fields = [
            'id', 'status', 'progress_percentage', 'time_spent_minutes',
            'last_accessed', 'completed_at', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at', 'last_accessed']


class ResourceSerializer(TaggitSerializer, serializers.ModelSerializer):
    """Main serializer for resources"""
    category = ResourceCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    author = UserSerializer(read_only=True)
    tags = TagListSerializerField(required=False, allow_empty=True)
    
    # Computed fields
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    comments_preview = serializers.SerializerMethodField()
    
    # Workshop data if applicable
    workshop = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'description', 'content', 'resource_type',
            'category', 'category_id', 'difficulty_level', 'external_url', 
            'file', 'thumbnail', 'author', 'is_featured', 'is_premium', 
            'is_published', 'view_count', 'download_count', 'like_count',
            'estimated_duration_minutes', 'created_at', 'updated_at', 
            'published_at', 'tags', 'average_rating', 'rating_count',
            'is_bookmarked', 'user_rating', 'user_progress', 'comments_preview',
            'workshop'
        ]
        read_only_fields = [
            'author', 'view_count', 'download_count', 'like_count',
            'created_at', 'updated_at'
        ]

    def get_rating_count(self, obj):
        return obj.ratings.count()

    def get_is_bookmarked(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.bookmarks.filter(user=user).exists()
        return False

    def get_user_rating(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            rating = obj.ratings.filter(user=user).first()
            return rating.rating if rating else None
        return None

    def get_user_progress(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            progress = obj.user_progress.filter(user=user).first()
            return ResourceProgressSerializer(progress).data if progress else None
        return None

    def get_comments_preview(self, obj):
        comments = obj.comments.filter(is_approved=True, parent=None)[:3]
        return ResourceCommentSerializer(comments, many=True).data

    def get_workshop(self, obj):
        if obj.resource_type == 'workshop' and hasattr(obj, 'workshop'):
            return WorkshopSerializer(obj.workshop).data
        return None


class ResourceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for resource lists"""
    category = serializers.StringRelatedField()
    author = serializers.StringRelatedField()
    tags = TagListSerializerField()
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'description', 'resource_type',
            'category', 'difficulty_level', 'thumbnail', 'author', 'external_url', 'file',
            'is_featured', 'is_premium', 'view_count', 'download_count',
            'estimated_duration_minutes', 'created_at', 'tags',
            'average_rating', 'rating_count'
        ]

    def get_rating_count(self, obj):
        return obj.ratings.count()


class WorkshopRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for workshop registrations"""
    user = UserSerializer(read_only=True)
    workshop_title = serializers.CharField(source='workshop.resource.title', read_only=True)

    class Meta:
        model = WorkshopRegistration
        fields = [
            'id', 'user', 'workshop', 'workshop_title', 'registered_at',
            'is_active', 'attended', 'completion_certificate_issued'
        ]
        read_only_fields = ['user', 'registered_at']


class WorkshopSerializer(serializers.ModelSerializer):
    """Serializer for workshop details"""
    resource = ResourceSerializer(read_only=True)
    current_participants = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    user_registered = serializers.SerializerMethodField()

    class Meta:
        model = Workshop
        fields = [
            'resource', 'instructor_name', 'instructor_bio', 'instructor_photo',
            'start_date', 'end_date', 'is_recurring', 'max_participants',
            'current_participants', 'is_full', 'meeting_link', 'materials_link',
            'prerequisites', 'user_registered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user_registered(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.registrations.filter(user=user, is_active=True).exists()
        return False


class ResourceBookmarkSerializer(serializers.ModelSerializer):
    """Serializer for resource bookmarks"""
    resource = ResourceListSerializer(read_only=True)
    resource_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ResourceBookmark
        fields = ['id', 'resource', 'resource_id', 'created_at']
        read_only_fields = ['created_at']


class ResourceCollectionItemSerializer(serializers.ModelSerializer):
    """Serializer for collection items"""
    resource = ResourceListSerializer(read_only=True)
    resource_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ResourceCollectionItem
        fields = [
            'id', 'resource', 'resource_id', 'order', 'notes', 'added_at'
        ]
        read_only_fields = ['added_at']


class ResourceCollectionSerializer(serializers.ModelSerializer):
    """Serializer for resource collections"""
    user = UserSerializer(read_only=True)
    resources = ResourceCollectionItemSerializer(source='resourcecollectionitem_set', many=True, read_only=True)
    resource_count = serializers.SerializerMethodField()

    class Meta:
        model = ResourceCollection
        fields = [
            'id', 'name', 'description', 'user', 'is_public',
            'resources', 'resource_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_resource_count(self, obj):
        return obj.resources.count()


class ResourceViewSerializer(serializers.ModelSerializer):
    """Serializer for tracking resource views"""
    class Meta:
        model = ResourceView
        fields = [
            'id', 'resource', 'user', 'viewed_at', 'time_spent_seconds'
        ]
        read_only_fields = ['viewed_at']


class ResourceDownloadSerializer(serializers.ModelSerializer):
    """Serializer for tracking resource downloads"""
    class Meta:
        model = ResourceDownload
        fields = [
            'id', 'resource', 'user', 'downloaded_at', 'file_name', 'file_size_bytes'
        ]
        read_only_fields = ['downloaded_at']


class ResourceSearchSerializer(serializers.Serializer):
    """Serializer for resource search parameters"""
    q = serializers.CharField(required=False, help_text="Search query")
    resource_type = serializers.ChoiceField(choices=Resource.RESOURCE_TYPES, required=False)
    category = serializers.IntegerField(required=False, help_text="Category ID")
    difficulty_level = serializers.ChoiceField(choices=Resource.DIFFICULTY_LEVELS, required=False)
    is_featured = serializers.BooleanField(required=False)
    is_premium = serializers.BooleanField(required=False)
    tags = serializers.CharField(required=False, help_text="Comma-separated list of tags")
    min_rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    ordering = serializers.ChoiceField(
        choices=[
            'created_at', '-created_at',
            'title', '-title',
            'view_count', '-view_count',
            'rating', '-rating'
        ],
        required=False,
        default='-created_at'
    )


class ResourceStatsSerializer(serializers.Serializer):
    """Serializer for resource statistics"""
    total_resources = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    popular_categories = serializers.ListField()
    trending_resources = serializers.ListField()
    recent_resources = serializers.ListField()

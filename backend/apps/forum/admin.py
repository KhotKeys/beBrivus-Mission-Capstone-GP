from django.contrib import admin
from .models import (
    ForumCategory, Discussion, Reply, DiscussionView, 
    DiscussionLike, ForumModerationLog, UserForumProfile
)


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color', 'icon', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    list_editable = ['is_active', 'order']


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'discussion_type', 'is_pinned', 'is_locked', 'is_resolved', 'views_count', 'likes_count', 'replies_count', 'created_at']
    list_filter = ['discussion_type', 'category', 'is_pinned', 'is_locked', 'is_resolved', 'created_at']
    search_fields = ['title', 'content', 'author__email', 'author__first_name', 'author__last_name']
    readonly_fields = ['views_count', 'likes_count', 'replies_count', 'created_at', 'updated_at', 'last_activity']
    list_editable = ['is_pinned', 'is_locked', 'is_resolved']
    ordering = ['-created_at']
    raw_id_fields = ['author']


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['discussion', 'author', 'is_solution', 'likes_count', 'created_at']
    list_filter = ['is_solution', 'is_edited', 'created_at']
    search_fields = ['content', 'author__email', 'discussion__title']
    readonly_fields = ['likes_count', 'created_at', 'updated_at']
    list_editable = ['is_solution']
    ordering = ['-created_at']
    raw_id_fields = ['author', 'discussion', 'parent']


@admin.register(UserForumProfile)
class UserForumProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'discussions_count', 'replies_count', 'likes_received', 'solutions_count', 'reputation_score', 'is_moderator']
    list_filter = ['is_moderator', 'can_pin_discussions', 'can_lock_discussions', 'email_notifications']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['discussions_count', 'replies_count', 'likes_received', 'solutions_count', 'last_activity']
    list_editable = ['is_moderator']
    ordering = ['-reputation_score']
    raw_id_fields = ['user']


@admin.register(ForumModerationLog)
class ForumModerationLogAdmin(admin.ModelAdmin):
    list_display = ['moderator', 'action', 'discussion', 'reply', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['moderator__email', 'reason', 'discussion__title']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    raw_id_fields = ['moderator', 'discussion', 'reply']

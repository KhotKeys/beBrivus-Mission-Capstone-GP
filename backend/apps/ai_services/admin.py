from django.contrib import admin
from .models import (
    AIAnalysis, ChatSession, ChatMessage, AIInsight, AIFeedback,
    UserMemoryProfile, ContentModerationFlag
)


@admin.register(ContentModerationFlag)
class ContentModerationFlagAdmin(admin.ModelAdmin):
    list_display = ['id', 'content_type', 'violation_category', 'confidence_score', 'flagged_user', 'status', 'admin_notified', 'created_at']
    list_filter = ['status', 'content_type', 'admin_notified', 'created_at']
    search_fields = ['content_text', 'violation_category', 'flagged_user__email']
    readonly_fields = ['content_type', 'content_id', 'content_text', 'violation_category', 'confidence_score', 'reason', 'flagged_user', 'admin_notified', 'created_at']
    fields = ['content_type', 'content_id', 'content_text', 'violation_category', 'confidence_score', 'reason', 'flagged_user', 'status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'admin_notified', 'created_at']
    
    def save_model(self, request, obj, form, change):
        if change and obj.status != 'pending':
            obj.reviewed_by = request.user
            from django.utils import timezone
            obj.reviewed_at = timezone.now()
        super().save_model(request, obj, form, change)


@admin.register(UserMemoryProfile)
class UserMemoryProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_name', 'conversation_count', 'updated_at']
    search_fields = ['user__email', 'preferred_name', 'career_goals']
    readonly_fields = ['user', 'conversation_count', 'created_at', 'updated_at']


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'session_type', 'is_active', 'created_at']
    list_filter = ['session_type', 'is_active', 'created_at']
    search_fields = ['user__email', 'title']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'is_user', 'created_at']
    list_filter = ['is_user', 'created_at']
    search_fields = ['content', 'session__user__email']

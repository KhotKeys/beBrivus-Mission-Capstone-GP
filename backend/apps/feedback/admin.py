from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['subject', 'name', 'email', 'category', 'status', 'priority', 'created_at']
    list_filter = ['status', 'category', 'priority', 'created_at']
    search_fields = ['subject', 'message', 'name', 'email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

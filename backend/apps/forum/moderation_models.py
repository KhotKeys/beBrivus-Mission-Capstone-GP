"""
Moderation models for AI-flagged content
"""
from django.db import models
from django.conf import settings

class FlaggedContent(models.Model):
    """AI-flagged content awaiting admin review"""
    VIOLATION_TYPES = [
        ('hate_speech', 'Hate Speech'),
        ('harassment', 'Harassment'),
        ('spam', 'Spam'),
        ('abuse', 'Abuse'),
        ('misinformation', 'Misinformation'),
        ('explicit', 'Explicit Content'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed'),
        ('dismissed', 'Dismissed'),
    ]
    
    post_id = models.IntegerField()
    content = models.TextField()
    author_username = models.CharField(max_length=255)
    violation_categories = models.JSONField(default=list)
    ai_confidence = models.FloatField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    flagged_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'forum_flagged_content'
        ordering = ['-flagged_at']


class ModerationAction(models.Model):
    """Audit log of all admin moderation actions"""
    ACTION_TYPES = [
        ('warn', 'Warn User'),
        ('remove', 'Remove Content'),
        ('suspend', 'Suspend Account'),
        ('dismiss', 'Dismiss Flag'),
    ]
    
    flagged_content = models.ForeignKey(FlaggedContent, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_moderation_actions'
        ordering = ['-created_at']

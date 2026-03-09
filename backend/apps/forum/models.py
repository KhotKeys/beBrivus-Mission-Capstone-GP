from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from taggit.managers import TaggableManager


class ForumCategory(models.Model):
    """
    Categories for forum discussions
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    icon = models.CharField(max_length=50, blank=True)  # Icon name/class
    
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'Forum Categories'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Discussion(models.Model):
    """
    Forum discussions/topics
    """
    DISCUSSION_TYPES = [
        ('question', 'Question'),
        ('discussion', 'Discussion'),
        ('announcement', 'Announcement'),
        ('job_posting', 'Job Posting'),
        ('resource_sharing', 'Resource Sharing'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    content = models.TextField()
    discussion_type = models.CharField(max_length=20, choices=DISCUSSION_TYPES, default='discussion')
    
    # Relationships
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_discussions')
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='discussions')
    tags = TaggableManager()
    
    # Media
    image = models.ImageField(upload_to='forum/images/', blank=True, null=True)
    
    # Engagement
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    replies_count = models.PositiveIntegerField(default=0)
    
    # Status
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)  # For questions
    
    # AI features
    ai_summary = models.TextField(blank=True)
    ai_keywords = models.JSONField(default=list)
    
    # Content moderation
    is_flagged = models.BooleanField(default=False)
    flag_count = models.PositiveIntegerField(default=0)
    flag_reason = models.TextField(blank=True)
    ai_moderation_score = models.FloatField(default=0.0)  # 0-1 toxicity score
    moderation_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('auto_flagged', 'Auto Flagged by AI')
    ], default='approved')
    is_removed = models.BooleanField(default=False)
    removal_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_discussions'
        ordering = ['-is_pinned', '-last_activity']
        indexes = [
            models.Index(fields=['category', 'is_pinned']),
            models.Index(fields=['last_activity']),
            models.Index(fields=['created_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Discussion.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Reply(models.Model):
    """
    Replies to forum discussions
    """
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_replies')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='child_replies')
    
    content = models.TextField()
    
    # Engagement
    likes_count = models.PositiveIntegerField(default=0)
    
    # Status
    is_solution = models.BooleanField(default=False)  # For marking best answer
    is_edited = models.BooleanField(default=False)
    
    # Content moderation
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    ai_moderation_score = models.FloatField(default=0.0)
    moderation_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('auto_flagged', 'Auto Flagged by AI')
    ], default='approved')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_replies'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply to {self.discussion.title} by {self.author.email}"


class DiscussionView(models.Model):
    """
    Track discussion views for analytics
    """
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='discussion_views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_discussion_views'
        unique_together = ['discussion', 'user', 'ip_address']


class DiscussionLike(models.Model):
    """
    Likes for discussions and replies
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, blank=True, null=True, related_name='likes')
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, blank=True, null=True, related_name='likes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_likes'
        unique_together = [
            ['user', 'discussion'],
            ['user', 'reply'],
        ]
    
    def __str__(self):
        if self.discussion:
            return f"{self.user.email} likes {self.discussion.title}"
        else:
            return f"{self.user.email} likes reply"


class ForumModerationLog(models.Model):
    """
    Log of moderation actions
    """
    MODERATION_ACTIONS = [
        ('pin', 'Pin Discussion'),
        ('unpin', 'Unpin Discussion'),
        ('lock', 'Lock Discussion'),
        ('unlock', 'Unlock Discussion'),
        ('delete', 'Delete Content'),
        ('edit', 'Edit Content'),
        ('mark_solution', 'Mark as Solution'),
        ('unmark_solution', 'Unmark as Solution'),
        ('ai_flag', 'AI Flagged Content'),
        ('approve', 'Approve Content'),
        ('reject', 'Reject Content'),
    ]
    
    moderator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='moderation_actions')
    action = models.CharField(max_length=20, choices=MODERATION_ACTIONS)
    reason = models.TextField(blank=True)
    
    # Target content
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, blank=True, null=True)
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_moderation_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.moderator.email} - {self.get_action_display()}"


class UserForumProfile(models.Model):
    """
    Extended forum profile for users
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_profile')
    
    # Activity stats
    discussions_count = models.PositiveIntegerField(default=0)
    replies_count = models.PositiveIntegerField(default=0)
    likes_received = models.PositiveIntegerField(default=0)
    solutions_count = models.PositiveIntegerField(default=0)  # Best answers given
    
    # Reputation system
    reputation_score = models.IntegerField(default=0)
    
    # Forum settings
    email_notifications = models.BooleanField(default=True)
    show_online_status = models.BooleanField(default=True)
    
    # Moderation
    is_moderator = models.BooleanField(default=False)
    can_pin_discussions = models.BooleanField(default=False)
    can_lock_discussions = models.BooleanField(default=False)
    
    last_activity = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'user_forum_profiles'
    
    def __str__(self):
        return f"{self.user.email} Forum Profile"


class DiscussionFlag(models.Model):
    """Flags for discussions"""
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('hate_speech', 'Hate Speech'),
        ('harassment', 'Harassment'),
        ('misinformation', 'Misinformation'),
        ('inappropriate', 'Inappropriate Content'),
        ('violence', 'Violence or Threats'),
        ('other', 'Other'),
    ]
    
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='flags')
    flagged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default='inappropriate')
    details = models.TextField(blank=True)
    
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_discussion_flags')
    resolved_at = models.DateTimeField(null=True, blank=True)
    admin_action = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_discussion_flags'
        unique_together = ['discussion', 'flagged_by']
    
    def __str__(self):
        return f"Flag on {self.discussion.title} by {self.flagged_by.username}"


class ReplyFlag(models.Model):
    """Flags for replies"""
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('hate_speech', 'Hate Speech'),
        ('harassment', 'Harassment'),
        ('misinformation', 'Misinformation'),
        ('inappropriate', 'Inappropriate Content'),
        ('violence', 'Violence or Threats'),
        ('other', 'Other'),
    ]
    
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, related_name='flags')
    flagged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default='inappropriate')
    details = models.TextField(blank=True)
    
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reply_flags')
    resolved_at = models.DateTimeField(null=True, blank=True)
    admin_action = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_reply_flags'
        unique_together = ['reply', 'flagged_by']
    
    def __str__(self):
        return f"Flag on reply by {self.flagged_by.username}"

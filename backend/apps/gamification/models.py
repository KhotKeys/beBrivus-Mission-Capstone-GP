from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class Badge(models.Model):
    """Achievement badges users can earn"""
    BADGE_CATEGORIES = [
        ('activity', 'Activity'),
        ('achievement', 'Achievement'),
        ('milestone', 'Milestone'),
        ('special', 'Special'),
        ('community', 'Community'),
    ]
    
    RARITY_LEVELS = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=BADGE_CATEGORIES)
    rarity = models.CharField(max_length=20, choices=RARITY_LEVELS, default='common')
    icon = models.CharField(max_length=100, help_text="Icon class or path")
    color = models.CharField(max_length=7, default='#3B82F6', help_text="Hex color code")
    
    # Requirements
    points_required = models.PositiveIntegerField(default=0)
    condition_type = models.CharField(max_length=50, help_text="Type of condition to check")
    condition_value = models.IntegerField(default=1, help_text="Target value for condition")
    condition_data = models.JSONField(default=dict, blank=True, help_text="Additional condition parameters")
    
    # Metadata
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False, help_text="Hidden until earned")
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['rarity']),
        ]

    def __str__(self):
        return self.name

    @property
    def earned_count(self):
        return self.user_badges.filter(earned=True).count()


class UserBadge(models.Model):
    """Tracks badges earned by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned = models.BooleanField(default=True)
    earned_at = models.DateTimeField(auto_now_add=True)
    progress = models.PositiveIntegerField(default=0, help_text="Progress towards earning this badge")
    notified = models.BooleanField(default=False, help_text="Whether user was notified of earning this badge")

    class Meta:
        unique_together = ['user', 'badge']
        indexes = [
            models.Index(fields=['user', 'earned']),
            models.Index(fields=['earned_at']),
        ]

    def __str__(self):
        status = "earned" if self.earned else f"progress: {self.progress}"
        return f"{self.user.username} - {self.badge.name} ({status})"


class Level(models.Model):
    """User level system"""
    level_number = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=100)
    min_points = models.PositiveIntegerField(help_text="Minimum points required for this level")
    max_points = models.PositiveIntegerField(help_text="Maximum points for this level")
    icon = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=7, default='#10B981')
    benefits = models.JSONField(default=dict, blank=True, help_text="Level-specific benefits")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level_number']

    def __str__(self):
        return f"Level {self.level_number}: {self.name}"


class UserProfile(models.Model):
    """Extended user profile for gamification"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification_profile')
    
    # Points and Level
    total_points = models.PositiveIntegerField(default=0)
    current_level = models.ForeignKey(Level, on_delete=models.SET_NULL, null=True, blank=True)
    level_progress = models.PositiveIntegerField(default=0, help_text="Progress towards next level")
    
    # Streaks
    current_login_streak = models.PositiveIntegerField(default=0)
    longest_login_streak = models.PositiveIntegerField(default=0)
    current_activity_streak = models.PositiveIntegerField(default=0)
    longest_activity_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    last_login_date = models.DateField(null=True, blank=True)
    
    # Statistics
    applications_submitted = models.PositiveIntegerField(default=0)
    opportunities_bookmarked = models.PositiveIntegerField(default=0)
    resources_completed = models.PositiveIntegerField(default=0)
    forum_posts = models.PositiveIntegerField(default=0)
    forum_likes_received = models.PositiveIntegerField(default=0)
    mentoring_sessions = models.PositiveIntegerField(default=0)
    workshops_attended = models.PositiveIntegerField(default=0)
    
    # Achievements
    badges_earned = models.PositiveIntegerField(default=0)
    rare_badges_earned = models.PositiveIntegerField(default=0)
    
    # Preferences
    show_progress = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    public_profile = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['total_points']),
            models.Index(fields=['current_level']),
        ]

    def __str__(self):
        return f"{self.user.username} - Level {self.current_level.level_number if self.current_level else 0}"

    def add_points(self, points, reason="", save=True):
        """Add points to user profile"""
        self.total_points += points
        
        # Check for level up
        if self.current_level:
            if self.total_points >= self.current_level.max_points:
                next_level = Level.objects.filter(
                    level_number=self.current_level.level_number + 1
                ).first()
                if next_level:
                    self.current_level = next_level
        else:
            # First level
            first_level = Level.objects.filter(min_points__lte=self.total_points).order_by('-level_number').first()
            if first_level:
                self.current_level = first_level
        
        # Update level progress
        if self.current_level:
            progress_in_level = self.total_points - self.current_level.min_points
            level_range = self.current_level.max_points - self.current_level.min_points
            self.level_progress = min(100, int((progress_in_level / level_range) * 100)) if level_range > 0 else 100
        
        if save:
            self.save()
        
        # Log the point earning
        PointTransaction.objects.create(
            user=self.user,
            points=points,
            transaction_type='earn',
            reason=reason
        )
        
        return points

    def update_streak(self, activity_type='login'):
        """Update user streaks"""
        today = timezone.now().date()
        
        if activity_type == 'login':
            if self.last_login_date == today - timezone.timedelta(days=1):
                self.current_login_streak += 1
            elif self.last_login_date == today:
                pass  # Same day, no change
            else:
                self.current_login_streak = 1
            
            self.longest_login_streak = max(self.longest_login_streak, self.current_login_streak)
            self.last_login_date = today
            
        elif activity_type == 'activity':
            if self.last_activity_date == today - timezone.timedelta(days=1):
                self.current_activity_streak += 1
            elif self.last_activity_date == today:
                pass  # Same day, no change
            else:
                self.current_activity_streak = 1
            
            self.longest_activity_streak = max(self.longest_activity_streak, self.current_activity_streak)
            self.last_activity_date = today
        
        self.save()


class PointTransaction(models.Model):
    """Track point transactions"""
    TRANSACTION_TYPES = [
        ('earn', 'Earn'),
        ('spend', 'Spend'),
        ('bonus', 'Bonus'),
        ('penalty', 'Penalty'),
        ('adjustment', 'Adjustment'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='point_transactions')
    points = models.IntegerField(help_text="Positive for earning, negative for spending")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Related objects
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.points} points - {self.reason}"

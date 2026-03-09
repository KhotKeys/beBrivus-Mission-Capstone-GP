from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from taggit.managers import TaggableManager

User = get_user_model()


class ResourceCategory(models.Model):
    """Categories for organizing resources"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    icon = models.CharField(max_length=50, blank=True)  # Icon class name
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Resource Categories'

    def __str__(self):
        return self.name

    @property
    def full_name(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name


class Resource(models.Model):
    """Base model for all resources"""
    RESOURCE_TYPES = [
        ('guide', 'Guide'),
        ('template', 'Template'),
        ('workshop', 'Workshop'),
        ('video', 'Video'),
        ('article', 'Article'),
        ('tool', 'Tool'),
        ('checklist', 'Checklist'),
        ('webinar', 'Webinar'),
    ]

    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    content = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='beginner')
    
    # External links and files
    external_url = models.URLField(blank=True, help_text="Link to external resource")
    file = models.FileField(upload_to='resources/files/', blank=True)
    thumbnail = models.ImageField(upload_to='resources/thumbnails/', blank=True)
    
    # Metadata
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_resources')
    is_featured = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    
    # Engagement metrics
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Time tracking
    estimated_duration_minutes = models.PositiveIntegerField(null=True, blank=True, help_text="Estimated time to complete in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Tags for search and categorization
    tags = TaggableManager(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource_type', 'category']),
            models.Index(fields=['is_featured', 'is_published']),
            models.Index(fields=['created_at']),
            models.Index(fields=['view_count']),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('resource-detail', kwargs={'slug': self.slug})

    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum(r.rating for r in ratings) / len(ratings)
        return 0

    def increment_view_count(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])

    def increment_download_count(self):
        self.download_count += 1
        self.save(update_fields=['download_count'])


class Workshop(models.Model):
    """Extended model for workshop-specific data"""
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True)
    
    # Workshop specific fields
    instructor_name = models.CharField(max_length=100)
    instructor_bio = models.TextField(blank=True)
    instructor_photo = models.ImageField(upload_to='resources/instructors/', blank=True)
    
    # Scheduling
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    
    # Links
    meeting_link = models.URLField(blank=True)
    materials_link = models.URLField(blank=True)
    
    # Prerequisites
    prerequisites = models.TextField(blank=True, help_text="Required skills or knowledge")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Workshop: {self.resource.title}"

    @property
    def current_participants(self):
        return self.registrations.filter(is_active=True).count()

    @property
    def is_full(self):
        if self.max_participants:
            return self.current_participants >= self.max_participants
        return False


class WorkshopRegistration(models.Model):
    """Track workshop registrations"""
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshop_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    attended = models.BooleanField(default=False)
    completion_certificate_issued = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['workshop', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.workshop.resource.title}"


class ResourceRating(models.Model):
    """User ratings for resources"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['resource', 'user']

    def __str__(self):
        return f"{self.user.username} rated {self.resource.title}: {self.rating}/5"


class ResourceBookmark(models.Model):
    """User bookmarks for resources"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='bookmarks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['resource', 'user']

    def __str__(self):
        return f"{self.user.username} bookmarked {self.resource.title}"


class ResourceView(models.Model):
    """Track resource views for analytics"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='resource_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    time_spent_seconds = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['resource', 'viewed_at']),
            models.Index(fields=['user', 'viewed_at']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_str} viewed {self.resource.title}"


class ResourceCollection(models.Model):
    """User-created collections of resources"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_collections')
    resources = models.ManyToManyField(Resource, through='ResourceCollectionItem')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username}'s collection: {self.name}"


class ResourceCollectionItem(models.Model):
    """Items in a resource collection with ordering"""
    collection = models.ForeignKey(ResourceCollection, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['collection', 'resource']
        ordering = ['order', 'added_at']

    def __str__(self):
        return f"{self.resource.title} in {self.collection.name}"


class ResourceDownload(models.Model):
    """Track resource downloads"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='downloads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size_bytes = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['resource', 'downloaded_at']),
            models.Index(fields=['user', 'downloaded_at']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_str} downloaded {self.resource.title}"


class ResourceComment(models.Model):
    """Comments on resources"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.resource.title}"

    @property
    def is_reply(self):
        return self.parent is not None


class ResourceProgress(models.Model):
    """Track user progress through resources"""
    PROGRESS_STATUS = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('bookmarked', 'Bookmarked'),
    ]

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='user_progress')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_progress')
    status = models.CharField(max_length=20, choices=PROGRESS_STATUS, default='not_started')
    progress_percentage = models.PositiveIntegerField(
        default=0, 
        validators=[MaxValueValidator(100)],
        help_text="Percentage of completion"
    )
    time_spent_minutes = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Personal notes about the resource")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['resource', 'user']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['resource', 'status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.resource.title} ({self.status})"

    def mark_completed(self):
        self.status = 'completed'
        self.progress_percentage = 100
        self.completed_at = timezone.now()
        self.save()

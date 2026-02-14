from django.db import models
from django.conf import settings
from django.utils import timezone
from taggit.managers import TaggableManager


class OpportunityCategory(models.Model):
    """
    Categories for opportunities (Scholarships, Internships, Jobs, etc.)
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon class name
    color = models.CharField(max_length=7, default='#007bff')  # Hex color
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'opportunity_categories'
        verbose_name_plural = 'Opportunity Categories'
    
    def __str__(self):
        return self.name


class Opportunity(models.Model):
    """
    Core opportunity model for scholarships, internships, jobs, etc.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    category = models.ForeignKey(OpportunityCategory, on_delete=models.CASCADE, related_name='opportunities')
    
    # Organization/Company
    organization = models.CharField(max_length=200)
    organization_logo = models.ImageField(upload_to='organizations/', blank=True, null=True)
    organization_website = models.URLField(blank=True)
    
    # Details
    location = models.CharField(max_length=200, blank=True)
    remote_allowed = models.BooleanField(default=False)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=3, default='USD')
    
    # Requirements
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    application_process = models.TextField(blank=True)
    required_documents = models.TextField(blank=True)
    
    # Dates
    application_deadline = models.DateTimeField()
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Meta
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='intermediate')
    external_url = models.URLField(blank=True)
    ai_imported = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    
    # Engagement
    views_count = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)
    
    # Relations
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_opportunities')
    tags = TaggableManager()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'opportunities'
        ordering = ['-featured', '-created_at']
        indexes = [
            models.Index(fields=['status', 'application_deadline']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['featured', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.organization}"
    
    @property
    def is_active(self):
        return self.status == 'published' and self.application_deadline > timezone.now()
    
    @property
    def days_remaining(self):
        if self.application_deadline:
            delta = self.application_deadline - timezone.now()
            return delta.days if delta.days > 0 else 0
        return 0


class OpportunityView(models.Model):
    """
    Track opportunity views for analytics
    """
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'opportunity_views'
        unique_together = ['opportunity', 'user', 'ip_address']


class SavedOpportunity(models.Model):
    """
    Users can save opportunities for later
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_opportunities')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='saved_by')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'saved_opportunities'
        unique_together = ['user', 'opportunity']
    
    def __str__(self):
        return f"{self.user.email} saved {self.opportunity.title}"


class OpportunityRecommendation(models.Model):
    """
    AI-generated recommendations for users
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opportunity_recommendations')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField()  # Recommendation score (0-1)
    reasons = models.JSONField(default=list)  # List of reasons for recommendation
    clicked = models.BooleanField(default=False)
    applied = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'opportunity_recommendations'
        unique_together = ['user', 'opportunity']
        ordering = ['-score', '-created_at']

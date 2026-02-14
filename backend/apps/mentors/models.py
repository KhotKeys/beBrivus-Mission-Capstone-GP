from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class MentorProfile(models.Model):
    """
    Mentor profile extending User model
    """
    EXPERTISE_LEVELS = [
        ('junior', 'Junior (1-3 years)'),
        ('mid', 'Mid-level (3-7 years)'),
        ('senior', 'Senior (7-15 years)'),
        ('executive', 'Executive (15+ years)'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_profile')
    
    # Professional Info
    current_position = models.CharField(max_length=200)
    current_company = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    expertise_level = models.CharField(max_length=20, choices=EXPERTISE_LEVELS)
    years_of_experience = models.PositiveIntegerField()
    
    # Mentoring Info
    specializations = models.TextField(help_text="Areas of expertise")
    mentoring_experience = models.TextField(blank=True)
    languages_spoken = models.CharField(max_length=200, default='English')
    
    # Availability
    available_for_mentoring = models.BooleanField(default=True)
    max_mentees = models.PositiveIntegerField(default=5)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    free_sessions_offered = models.PositiveIntegerField(default=1)
    time_zone = models.CharField(max_length=50, default='UTC')
    
    # Preferences
    preferred_mentee_level = models.CharField(max_length=100, blank=True)
    communication_preferences = models.TextField(blank=True)
    
    # Status
    verified_mentor = models.BooleanField(default=False)
    featured_mentor = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    
    # Stats
    total_mentees = models.PositiveIntegerField(default=0)
    total_sessions = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentor_profiles'
    
    def __str__(self):
        return f"{self.user.full_name} - {self.current_position}"


class MentorshipRequest(models.Model):
    """
    Requests for mentorship from students to mentors
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    mentee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentorship_requests')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='mentorship_requests')
    
    subject = models.CharField(max_length=200)
    message = models.TextField()
    goals = models.TextField(help_text="What the mentee hopes to achieve")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    mentor_response = models.TextField(blank=True)
    
    # Session details
    preferred_session_type = models.CharField(max_length=20, choices=[
        ('video', 'Video Call'),
        ('chat', 'Text Chat'),
        ('email', 'Email'),
        ('in_person', 'In Person'),
    ], default='video')
    
    duration_requested = models.PositiveIntegerField(default=60)  # minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'mentorship_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.mentee.full_name} → {self.mentor.user.full_name}: {self.subject}"


class MentorshipSession(models.Model):
    """
    Individual mentoring sessions
    """
    SESSION_TYPES = [
        ('video', 'Video Call'),
        ('chat', 'Text Chat'),
        ('email', 'Email'),
        ('in_person', 'In Person'),
    ]
    
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('rejected', 'Rejected'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    # mentorship_request = models.ForeignKey(MentorshipRequest, on_delete=models.CASCADE, related_name='sessions')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='sessions')
    mentee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentorship_sessions')
    
    # Session details
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(blank=True, null=True)
    actual_end = models.DateTimeField(blank=True, null=True)
    
    # Meeting info
    meeting_link = models.URLField(blank=True)
    meeting_id = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Content
    agenda = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    mentor_notes = models.TextField(blank=True)
    mentee_notes = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorship_sessions'
        ordering = ['-scheduled_start']
    
    def __str__(self):
        return f"Session: {self.mentee} with {self.mentee}"


class MentorReview(models.Model):
    """
    Reviews for mentors from mentees
    """
    mentorship_request = models.OneToOneField(MentorshipRequest, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField()
    
    # Detailed ratings
    communication_rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    knowledge_rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    helpfulness_rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    would_recommend = models.BooleanField(default=True)
    public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentor_reviews'
    
    def __str__(self):
        return f"Review for {self.mentorship_request.mentor.user.full_name} by {self.mentorship_request.mentee.full_name}"


class MentorAvailability(models.Model):
    """
    Mentor general weekly availability schedule
    """
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='weekly_availability')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentor_availability'
        unique_together = ['mentor', 'day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.mentor.user.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class MentorSpecificAvailability(models.Model):
    """
    Mentor availability for specific dates (overrides weekly availability)
    """
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='specific_availability')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    is_available = models.BooleanField(default=True)  # False for unavailable times
    reason = models.CharField(max_length=200, blank=True, help_text="Reason for unavailability")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentor_specific_availability'
        unique_together = ['mentor', 'date', 'start_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        status = "Available" if self.is_available else "Unavailable"
        return f"{self.mentor.user.full_name} - {self.date} {self.start_time}-{self.end_time} ({status})"

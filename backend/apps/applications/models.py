from django.db import models
from django.conf import settings
from apps.opportunities.models import Opportunity


class Application(models.Model):
    """
    User applications to opportunities
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('clicked', 'Clicked'),
        ('under_review', 'Under Review'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    
    # Application content
    cover_letter = models.TextField(blank=True)
    additional_info = models.TextField(blank=True)
    
    # New application form fields
    phone = models.CharField(max_length=30, blank=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    university = models.CharField(max_length=200, blank=True)
    course = models.CharField(max_length=200, blank=True)
    year_of_study = models.CharField(max_length=50, blank=True)
    country_of_residence = models.CharField(max_length=100, blank=True)
    why_chosen = models.TextField(blank=True)
    career_goals = models.TextField(blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True, help_text="Private notes for the applicant")
    
    # Important dates
    submitted_at = models.DateTimeField(blank=True, null=True)
    last_updated_at = models.DateTimeField(auto_now=True)
    interview_date = models.DateTimeField(blank=True, null=True)
    decision_date = models.DateTimeField(blank=True, null=True)
    
    # AI assistance tracking
    ai_assistance_used = models.BooleanField(default=False)
    ai_suggestions = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        unique_together = ['user', 'opportunity']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} → {self.opportunity.title}"


class ApplicationDocument(models.Model):
    """
    Documents attached to applications (CV, portfolio, etc.)
    """
    DOCUMENT_TYPES = [
        ('cv', 'CV/Resume'),
        ('cover_letter', 'Cover Letter'),
        ('portfolio', 'Portfolio'),
        ('transcript', 'Academic Transcript'),
        ('certificate', 'Certificate'),
        ('recommendation', 'Letter of Recommendation'),
        ('other', 'Other'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='application_documents/')
    description = models.TextField(blank=True)
    
    # AI analysis
    ai_analyzed = models.BooleanField(default=False)
    ai_score = models.FloatField(blank=True, null=True)
    ai_feedback = models.TextField(blank=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'application_documents'
    
    def __str__(self):
        return f"{self.title} - {self.application.user.full_name}"


class ApplicationStatusHistory(models.Model):
    """
    Track status changes for applications
    """
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'application_status_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.application} status changed to {self.new_status}"


class ApplicationFeedback(models.Model):
    """
    Feedback from organizations on applications
    """
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='feedback')
    
    # Overall feedback
    overall_score = models.PositiveIntegerField(blank=True, null=True)
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    general_comments = models.TextField(blank=True)
    
    # Detailed scores
    technical_skills_score = models.PositiveIntegerField(blank=True, null=True)
    communication_score = models.PositiveIntegerField(blank=True, null=True)
    experience_score = models.PositiveIntegerField(blank=True, null=True)
    cultural_fit_score = models.PositiveIntegerField(blank=True, null=True)
    
    # Meta
    public = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'application_feedback'
    
    def __str__(self):
        return f"Feedback for {self.application}"


class InterviewSchedule(models.Model):
    """
    Interview scheduling for applications
    """
    INTERVIEW_TYPES = [
        ('phone', 'Phone Interview'),
        ('video', 'Video Interview'),
        ('in_person', 'In-Person Interview'),
        ('technical', 'Technical Interview'),
        ('panel', 'Panel Interview'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('no_show', 'No Show'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    
    # Interview details
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES)
    scheduled_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    location = models.CharField(max_length=200, blank=True)
    meeting_link = models.URLField(blank=True)
    
    # Participants
    interviewer_name = models.CharField(max_length=200)
    interviewer_email = models.EmailField(blank=True)
    interviewer_role = models.CharField(max_length=100, blank=True)
    
    # Status and notes
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    preparation_notes = models.TextField(blank=True)
    interview_notes = models.TextField(blank=True)
    
    # Reminders
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'interview_schedules'
        ordering = ['scheduled_date']
    
    def __str__(self):
        return f"Interview: {self.application.user.full_name} for {self.application.opportunity.title}"

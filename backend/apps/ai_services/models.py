from django.db import models
from django.conf import settings
from apps.opportunities.models import Opportunity
from apps.applications.models import Application


class AIAnalysis(models.Model):
    """
    Store AI analysis results for caching and tracking
    """
    ANALYSIS_TYPES = [
        ('opportunity_match', 'Opportunity Match'),
        ('document_review', 'Document Review'),
        ('interview_prep', 'Interview Preparation'),
        ('career_insights', 'Career Insights'),
        ('forum_summary', 'Forum Summary'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_analyses')
    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES)
    
    # Optional associations
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, blank=True, null=True)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, blank=True, null=True)
    
    # Analysis data
    input_data = models.JSONField(default=dict)  # Store input parameters
    results = models.JSONField(default=dict)     # Store AI results
    confidence_score = models.FloatField(blank=True, null=True)
    
    # Metadata
    model_version = models.CharField(max_length=50, default='gemini-2.5-flash')
    processing_time_ms = models.PositiveIntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_analyses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'analysis_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_analysis_type_display()}"


class ChatSession(models.Model):
    """
    AI chat sessions for application coaching
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=200)
    
    # Context
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, blank=True, null=True)
    application = models.ForeignKey(Application, on_delete=models.SET_NULL, blank=True, null=True)
    session_type = models.CharField(max_length=50, choices=[
        ('general', 'General Career Advice'),
        ('cv_review', 'CV/Resume Review'),
        ('cover_letter', 'Cover Letter Help'),
        ('interview_prep', 'Interview Preparation'),
        ('application_help', 'Application Assistance'),
    ], default='general')
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ChatMessage(models.Model):
    """
    Individual messages in AI chat sessions
    """
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    is_user = models.BooleanField()  # True if message from user, False if from AI
    content = models.TextField()
    
    # AI metadata
    model_version = models.CharField(max_length=50, blank=True)
    processing_time_ms = models.PositiveIntegerField(blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
    
    def __str__(self):
        sender = "User" if self.is_user else "AI"
        return f"{sender}: {self.content[:50]}..."


class AIInsight(models.Model):
    """
    Generated insights and recommendations for users
    """
    INSIGHT_TYPES = [
        ('opportunity', 'Opportunity Recommendation'),
        ('skill_development', 'Skill Development'),
        ('career_path', 'Career Path Suggestion'),
        ('application_strategy', 'Application Strategy'),
        ('market_trend', 'Market Trend'),
        ('networking', 'Networking Opportunity'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_insights')
    insight_type = models.CharField(max_length=30, choices=INSIGHT_TYPES)
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    action_items = models.JSONField(default=list)  # List of suggested actions
    
    # Engagement tracking
    viewed = models.BooleanField(default=False)
    dismissed = models.BooleanField(default=False)
    acted_upon = models.BooleanField(default=False)
    
    # Relevance scoring
    relevance_score = models.FloatField(default=0.5)
    priority = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ], default='medium')
    
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_insights'
        ordering = ['-relevance_score', '-created_at']
        indexes = [
            models.Index(fields=['user', 'viewed', 'dismissed']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class AIFeedback(models.Model):
    """
    User feedback on AI suggestions and analyses
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # What was rated
    analysis = models.ForeignKey(AIAnalysis, on_delete=models.CASCADE, blank=True, null=True)
    insight = models.ForeignKey(AIInsight, on_delete=models.CASCADE, blank=True, null=True)
    chat_message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, blank=True, null=True)
    
    # Rating
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    helpful = models.BooleanField(blank=True, null=True)
    accurate = models.BooleanField(blank=True, null=True)
    
    # Feedback text
    comments = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_feedback'
    
    def __str__(self):
        return f"{self.user.email} - Rating: {self.rating}"

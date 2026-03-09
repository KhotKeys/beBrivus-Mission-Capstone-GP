from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.opportunities.models import Opportunity
from apps.applications.models import Application


class Goal(models.Model):
    """
    User's career goals and objectives
    """
    GOAL_TYPES = [
        ('career_change', 'Career Change'),
        ('skill_development', 'Skill Development'),
        ('job_search', 'Job Search'),
        ('education', 'Education'),
        ('networking', 'Networking'),
        ('promotion', 'Promotion'),
        ('salary_increase', 'Salary Increase'),
        ('other', 'Other'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    
    # Timeline
    target_date = models.DateField(blank=True, null=True)
    started_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    
    # Progress tracking
    progress_percentage = models.PositiveIntegerField(default=0)  # 0-100
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tracker_goals'
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class Milestone(models.Model):
    """
    Milestones/sub-goals within a larger goal
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timeline
    due_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tracker_milestones'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.goal.title} - {self.title}"


class Activity(models.Model):
    """
    Daily activities and progress entries
    """
    ACTIVITY_TYPES = [
        ('application_submitted', 'Application Submitted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interview_completed', 'Interview Completed'),
        ('networking_event', 'Networking Event'),
        ('skill_practice', 'Skill Practice'),
        ('course_completed', 'Course Completed'),
        ('mentor_session', 'Mentor Session'),
        ('job_research', 'Job Research'),
        ('resume_update', 'Resume Update'),
        ('linkedin_activity', 'LinkedIn Activity'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='activities', blank=True, null=True)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, related_name='activities', blank=True, null=True)
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    
    # Optional associations
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, blank=True, null=True)
    application = models.ForeignKey(Application, on_delete=models.SET_NULL, blank=True, null=True)
    
    # Activity details
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    activity_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tracker_activities'
        ordering = ['-activity_date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title} ({self.activity_date.date()})"


class Habit(models.Model):
    """
    Daily/weekly habits for career development
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('bi_weekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    target_count = models.PositiveIntegerField(default=1)  # how many times per frequency period
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tracker_habits'
        ordering = ['title']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class HabitEntry(models.Model):
    """
    Daily habit completion tracking
    """
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='entries')
    date = models.DateField(default=timezone.now)
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tracker_habit_entries'
        unique_together = ['habit', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.habit.title} - {self.date} ({'✓' if self.completed else '✗'})"


class ProgressSnapshot(models.Model):
    """
    Weekly/monthly progress snapshots for analytics
    """
    PERIOD_TYPES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_snapshots')
    period_type = models.CharField(max_length=10, choices=PERIOD_TYPES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Metrics
    goals_active = models.PositiveIntegerField(default=0)
    goals_completed = models.PositiveIntegerField(default=0)
    milestones_completed = models.PositiveIntegerField(default=0)
    activities_count = models.PositiveIntegerField(default=0)
    habits_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # percentage
    applications_submitted = models.PositiveIntegerField(default=0)
    interviews_attended = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tracker_progress_snapshots'
        unique_together = ['user', 'period_type', 'period_start']
        ordering = ['-period_start']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.period_type} {self.period_start}"

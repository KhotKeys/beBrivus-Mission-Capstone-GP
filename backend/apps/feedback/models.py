from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Feedback(models.Model):
    CATEGORY_CHOICES = [
        # Original student categories
        ('bug',                 'Bug Report'),
        ('feature',             'Feature Request'),
        ('complaint',           'Complaint'),
        ('compliment',          'Compliment'),
        ('general',             'General Feedback'),
        ('other',               'Other'),
        # Institution categories
        ('student_quality',     'Student Application Quality'),
        ('platform_posting',    'Opportunity Posting Issue'),
        ('application_process', 'Application Process Problem'),
        ('student_conduct',     'Student Conduct Report'),
        ('partnership',         'Partnership Inquiry'),
        ('platform_bug',        'Platform Bug'),
        ('billing_admin',       'Billing / Admin Issue'),
        # Mentor categories
        ('session_issue',       'Session / Booking Problem'),
        ('student_behaviour',   'Student Behaviour Report'),
        ('payment_payout',      'Payment / Payout Issue'),
        ('profile_visibility',  'Profile or Visibility Issue'),
        ('scheduling',          'Scheduling Problem'),
        ('communication',       'Communication Issue'),
        # Shared
        ('feature_request',     'Feature Request'),
    ]
    STATUS_CHOICES = [
        ('open',      'Open'),
        ('in_review', 'In Review'),
        ('resolved',  'Resolved'),
        ('closed',    'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
        ('urgent', 'Urgent'),
    ]

    user        = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='feedbacks'
    )
    name        = models.CharField(max_length=120)
    email       = models.EmailField()
    category    = models.CharField(
        max_length=30, choices=CATEGORY_CHOICES, default='general'
    )
    subject     = models.CharField(max_length=200)
    message     = models.TextField()
    rating      = models.PositiveSmallIntegerField(null=True, blank=True)
    status      = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open'
    )
    priority    = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium'
    )
    admin_note  = models.TextField(blank=True, default='')
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='resolved_feedbacks'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} — {self.name} ({self.status})'

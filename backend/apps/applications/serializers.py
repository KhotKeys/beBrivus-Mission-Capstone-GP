from rest_framework import serializers
from django.utils import timezone
from .models import Application
from apps.opportunities.serializers import OpportunitySerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for application list and basic operations"""
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_username = serializers.SerializerMethodField()
    opportunity_title = serializers.SerializerMethodField()
    opportunity_organization = serializers.SerializerMethodField()
    
    # Legacy fields for compatibility
    opportunity_title_legacy = serializers.CharField(source='opportunity.title', read_only=True)
    company_name = serializers.CharField(source='opportunity.organization', read_only=True)
    company_logo = serializers.ImageField(source='opportunity.organization_logo', read_only=True)
    location = serializers.CharField(source='opportunity.location', read_only=True)
    employment_type = serializers.CharField(source='opportunity.difficulty_level', read_only=True)
    salary_range = serializers.SerializerMethodField()
    days_since_applied = serializers.SerializerMethodField()
    next_action_date = serializers.SerializerMethodField()
    is_upcoming_action = serializers.SerializerMethodField()
    
    # User fields
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    
    # CV field
    cv_url = serializers.SerializerMethodField()
    
    # Opportunity details for admin
    opportunity_data = serializers.SerializerMethodField()
    
    def get_applicant_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_applicant_email(self, obj):
        return obj.user.email

    def get_applicant_username(self, obj):
        return obj.user.username

    def get_opportunity_title(self, obj):
        return obj.opportunity.title if obj.opportunity else ''

    def get_opportunity_organization(self, obj):
        return obj.opportunity.organization if obj.opportunity else ''
    
    def get_user_name(self, obj):
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name or obj.user.username
        return 'Unknown User'
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'No email'
    
    def get_user_phone(self, obj):
        return getattr(obj.user, 'phone_number', None) if obj.user else None
    
    def get_cv_url(self, obj):
        # Get CV from related documents
        cv_doc = obj.documents.filter(document_type='cv').first()
        if cv_doc and cv_doc.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cv_doc.file.url)
            return cv_doc.file.url
        return None
    
    def get_opportunity_data(self, obj):
        if obj.opportunity:
            return {
                'id': obj.opportunity.id,
                'title': obj.opportunity.title,
                'organization': getattr(obj.opportunity, 'organization', 'Unknown'),
                'application_type': getattr(obj.opportunity, 'application_type', 'external')
            }
        return None
    
    def get_salary_range(self, obj):
        if obj.opportunity and obj.opportunity.salary_min and obj.opportunity.salary_max:
            return f"{obj.opportunity.currency}{obj.opportunity.salary_min:,} - {obj.opportunity.currency}{obj.opportunity.salary_max:,}"
        return "Not specified"
    
    def get_days_since_applied(self, obj):
        if obj.submitted_at:
            delta = timezone.now().date() - obj.submitted_at.date()
            return delta.days
        elif obj.created_at:
            delta = timezone.now().date() - obj.created_at.date()
            return delta.days
        return 0
    
    def get_next_action_date(self, obj):
        # Simple logic for next action - can be enhanced
        if obj.status == 'clicked' and obj.submitted_at:
            # Follow up after 1 week if no response
            next_action = obj.submitted_at.date() + timezone.timedelta(days=7)
            return next_action
        elif obj.status == 'interview_scheduled' and obj.interview_date:
            return obj.interview_date.date() if obj.interview_date else None
        return None
    
    def get_is_upcoming_action(self, obj):
        next_action = self.get_next_action_date(obj)
        if next_action:
            days_until = (next_action - timezone.now().date()).days
            return 0 <= days_until <= 7
        return False

    class Meta:
        model = Application
        fields = [
            'id',
            'opportunity', 'opportunity_title', 'opportunity_organization', 'opportunity_title_legacy',
            'user', 'applicant_name', 'applicant_email', 'applicant_username',
            'user_name', 'user_email', 'user_phone',
            'company_name', 'company_logo', 'location', 'employment_type', 'salary_range',
            'opportunity_data', 'cv_url',
            'cover_letter', 'status', 'submitted_at', 'interview_date', 'notes',
            'age', 'university', 'course', 'year_of_study', 'country_of_residence', 'why_chosen', 'career_goals',
            'days_since_applied', 'next_action_date', 'is_upcoming_action',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'days_since_applied']


class ApplicationDetailSerializer(ApplicationSerializer):
    """Detailed serializer for application with full opportunity details"""
    opportunity = OpportunitySerializer(read_only=True)
    user = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    feedback_data = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return {
                'id': obj.user.id,
                'full_name': full_name or obj.user.username,
                'email': obj.user.email,
                'phone_number': getattr(obj.user, 'phone_number', None)
            }
        return {
            'id': None,
            'full_name': 'Unknown User',
            'email': 'No email',
            'phone_number': None
        }
    
    def get_status_history(self, obj):
        from .models import ApplicationStatusHistory
        history = ApplicationStatusHistory.objects.filter(application=obj).order_by('-created_at')[:10]
        return [{
            'old_status': h.old_status,
            'new_status': h.new_status,
            'changed_by': h.changed_by.get_full_name() if h.changed_by else 'System',
            'notes': h.notes,
            'created_at': h.created_at
        } for h in history]
    
    def get_feedback_data(self, obj):
        from .models import ApplicationFeedback
        try:
            feedback = obj.feedback
            return {
                'general_comments': feedback.general_comments,
                'strengths': feedback.strengths,
                'areas_for_improvement': feedback.areas_for_improvement,
                'overall_score': feedback.overall_score,
                'public': feedback.public
            }
        except ApplicationFeedback.DoesNotExist:
            return None

    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + [
            'user', 'status_history', 'feedback_data'
        ]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new applications"""
    
    class Meta:
        model = Application
        fields = [
            'opportunity', 'status', 'submitted_at',
            'interview_date', 'notes', 'cover_letter'
        ]


class ApplicationStatsSerializer(serializers.Serializer):
    """Serializer for application statistics"""
    total_applications = serializers.IntegerField()
    recent_applications = serializers.IntegerField()
    interview_rate = serializers.FloatField()
    offer_rate = serializers.FloatField()
    status_breakdown = serializers.DictField()
    upcoming_actions = serializers.DictField()

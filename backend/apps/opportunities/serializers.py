from rest_framework import serializers
from django.utils import timezone
from .models import Opportunity, OpportunityCategory
from apps.applications.models import Application


class OpportunityCategorySerializer(serializers.ModelSerializer):
    """Serializer for opportunity categories"""
    
    class Meta:
        model = OpportunityCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'active']


class OpportunitySerializer(serializers.ModelSerializer):
    """Serializer for opportunity details"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    match_score = serializers.IntegerField(read_only=True, default=75)
    days_remaining = serializers.SerializerMethodField()
    
    def get_days_remaining(self, obj):
        if obj.application_deadline:
            delta = obj.application_deadline.date() - timezone.now().date()
            return delta.days if delta.days > 0 else 0
        return None

    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'short_description', 'organization', 'organization_logo', 'location', 'remote_allowed',
            'category', 'category_name', 'difficulty_level', 'description', 'requirements',
            'salary_min', 'salary_max', 'currency', 'benefits', 'application_process', 'required_documents',
            'application_deadline', 'start_date', 'end_date', 'application_type', 'external_url',
            'match_score', 'days_remaining', 'is_active', 'status', 'featured', 'posted_by_type',
            'views_count', 'applications_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_active', 'views_count', 'applications_count']


class OpportunitySearchSerializer(OpportunitySerializer):
    """Serializer for opportunity search results with user-specific data"""
    is_saved = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    
    def get_is_saved(self, obj):
        user_saved = self.context.get('user_saved', set())
        return obj.id in user_saved
    
    def get_is_applied(self, obj):
        user_applications = self.context.get('user_applications', set())
        return obj.id in user_applications

    class Meta(OpportunitySerializer.Meta):
        fields = OpportunitySerializer.Meta.fields + ['is_saved', 'is_applied']


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for job applications"""
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    company_name = serializers.CharField(source='opportunity.company', read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'opportunity', 'opportunity_title', 'company_name',
            'status', 'submitted_at', 'cover_letter', 'notes',
            'interview_date', 'feedback', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SavedOpportunitySerializer(serializers.Serializer):
    """Serializer for saved opportunities"""
    opportunity = OpportunitySerializer(read_only=True)
    saved_date = serializers.DateTimeField(read_only=True)

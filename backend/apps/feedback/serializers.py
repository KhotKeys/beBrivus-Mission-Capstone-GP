from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    user_display     = serializers.SerializerMethodField()
    status_display   = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()

    class Meta:
        model  = Feedback
        fields = [
            'id', 'user', 'user_display', 'name', 'email',
            'category', 'category_display', 'subject', 'message',
            'rating', 'status', 'status_display', 'priority',
            'priority_display', 'admin_note', 'resolved_by',
            'resolved_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'name', 'email', 'status', 'priority', 'admin_note',
            'resolved_by', 'resolved_at', 'created_at', 'updated_at',
        ]

    def get_user_display(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return obj.name

    def get_status_display(self, obj):
        return dict(Feedback.STATUS_CHOICES).get(obj.status, obj.status)

    def get_category_display(self, obj):
        return dict(Feedback.CATEGORY_CHOICES).get(obj.category, obj.category)

    def get_priority_display(self, obj):
        return dict(Feedback.PRIORITY_CHOICES).get(obj.priority, obj.priority)

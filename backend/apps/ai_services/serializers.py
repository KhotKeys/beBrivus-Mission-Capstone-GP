from rest_framework import serializers
from .models import AIAnalysis, ChatSession, ChatMessage, AIInsight, AIFeedback


class AIAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for AI analysis results"""
    class Meta:
        model = AIAnalysis
        fields = [
            'id', 'analysis_type', 'opportunity', 'application',
            'results', 'confidence_score', 'model_version',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'model_version']


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'is_user', 'content', 'confidence_score',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'confidence_score']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions with recent messages"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    recent_messages = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'title', 'session_type', 'opportunity', 'application',
            'is_active', 'created_at', 'updated_at', 'messages', 'recent_messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_recent_messages(self, obj):
        """Get last 10 messages for preview"""
        recent = obj.messages.all()[:10]
        return ChatMessageSerializer(recent, many=True).data


class ChatSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat sessions"""
    class Meta:
        model = ChatSession
        fields = ['title', 'session_type', 'opportunity', 'application']


class AIInsightSerializer(serializers.ModelSerializer):
    """Serializer for AI insights"""
    class Meta:
        model = AIInsight
        fields = [
            'id', 'insight_type', 'title', 'content', 'action_items',
            'viewed', 'dismissed', 'acted_upon', 'relevance_score',
            'priority', 'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'relevance_score']


class AIFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for AI feedback"""
    class Meta:
        model = AIFeedback
        fields = [
            'id', 'analysis', 'insight', 'chat_message',
            'rating', 'helpful', 'accurate', 'comments', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OpportunityMatchRequestSerializer(serializers.Serializer):
    """Serializer for opportunity match analysis request"""
    opportunity_id = serializers.IntegerField()


class DocumentReviewRequestSerializer(serializers.Serializer):
    """Serializer for document review request"""
    document_type = serializers.CharField()
    content = serializers.CharField()
    opportunity_id = serializers.IntegerField(required=False)


class InterviewPrepRequestSerializer(serializers.Serializer):
    """Serializer for interview preparation request"""
    opportunity_id = serializers.IntegerField()
    difficulty_level = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium'
    )

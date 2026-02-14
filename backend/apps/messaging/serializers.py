from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageRead, Notification
from apps.mentors.models import MentorProfile

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for messaging"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender = UserBasicSerializer(read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 
            'message_type', 'created_at', 'is_read'
        ]
        read_only_fields = ['id', 'sender', 'created_at']

    def get_is_read(self, obj):
        """Check if current user has read this message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_read_by(request.user)
        return False

    def create(self, validated_data):
        """Create a new message"""
        request = self.context.get('request')
        validated_data['sender'] = request.user
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    participants = UserBasicSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'mentor', 'last_message',
            'unread_count', 'other_participant', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(
                read_by=request.user
            ).exclude(
                sender=request.user
            ).count()
        return 0

    def get_other_participant(self, obj):
        """Get the other participant in conversation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return UserBasicSerializer(other_user).data
        return None


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    participant_id = serializers.IntegerField(
        write_only=True,
        help_text="User ID to start conversation with"
    )
    initial_message = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Optional initial message to send"
    )

    class Meta:
        model = Conversation
        fields = ['participant_id', 'initial_message']

    def create(self, validated_data):
        """Create conversation with participant"""
        participant_id = validated_data.pop('participant_id')
        initial_message = validated_data.pop('initial_message', None)
        
        request = self.context.get('request')
        current_user = request.user
        
        # Check if conversation already exists between these users
        existing_conversation = Conversation.objects.filter(
            participants=current_user
        ).filter(
            participants__id=participant_id
        ).first()
        
        if existing_conversation:
            # If message provided, send it to existing conversation
            if initial_message:
                Message.objects.create(
                    conversation=existing_conversation,
                    sender=current_user,
                    content=initial_message
                )
            return existing_conversation
        
        # Create new conversation
        conversation = Conversation.objects.create()
        
        # Add both users as participants
        conversation.participants.add(current_user)
        
        try:
            other_user = User.objects.get(id=participant_id)
            conversation.participants.add(other_user)
            
            # Check if other user is a mentor and link
            try:
                mentor_profile = MentorProfile.objects.get(user=other_user)
                conversation.mentor = mentor_profile
                conversation.save()
            except MentorProfile.DoesNotExist:
                pass
                
        except User.DoesNotExist:
            conversation.delete()
            raise serializers.ValidationError({'participant_id': 'User not found'})
        
        # Send initial message if provided
        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=current_user,
                content=initial_message
            )
        
        return conversation


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'body', 'notification_type', 'data',
            'read_at', 'created_at'
        ]
        read_only_fields = fields

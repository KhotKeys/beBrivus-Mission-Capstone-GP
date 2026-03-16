from django.db import models
from django.conf import settings
from apps.mentors.models import MentorProfile


class ConversationManager(models.Manager):
    """Custom manager for Conversation model"""
    
    def get_or_create_between(self, user1, user2):
        """
        Get or create a conversation between two users.
        Returns (conversation, created) tuple.
        """
        # Find existing conversation between both users
        conversation = self.filter(
            participants=user1
        ).filter(
            participants=user2
        ).annotate(
            participant_count=models.Count('participants')
        ).filter(
            participant_count=2
        ).first()
        
        if conversation:
            return conversation, False
        
        # Create new conversation
        conversation = self.create()
        conversation.participants.add(user1, user2)
        return conversation, True


class Conversation(models.Model):
    """
    A conversation between users (typically mentee and mentor)
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='conversations',
        help_text="Users participating in this conversation"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional: link to mentor profile if this is mentor-related
    mentor = models.ForeignKey(
        MentorProfile, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='conversations',
        help_text="Mentor involved in this conversation"
    )
    
    # Use custom manager
    objects = ConversationManager()

    class Meta:
        db_table = 'messaging_conversations'
        ordering = ['-updated_at']

    def __str__(self):
        participant_names = ", ".join([
            f"{p.first_name} {p.last_name}" for p in self.participants.all()[:2]
        ])
        return f"Conversation: {participant_names}"

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()

    def get_other_participant(self, user):
        """Get the other participant in a 2-person conversation"""
        return self.participants.exclude(id=user.id).first()


class Message(models.Model):
    """
    Individual messages within a conversation
    """
    MESSAGE_TYPES = [
        ('text', 'Text Message'),
        ('system', 'System Message'),
        ('booking_confirmation', 'Booking Confirmation'),
        ('session_reminder', 'Session Reminder'),
    ]

    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    message_type = models.CharField(
        max_length=20, 
        choices=MESSAGE_TYPES, 
        default='text'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Track which users have read this message
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='MessageRead',
        related_name='read_messages'
    )

    class Meta:
        db_table = 'messaging_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.first_name}: {self.content[:50]}..."

    def mark_as_read(self, user):
        """Mark this message as read by a user"""
        MessageRead.objects.get_or_create(
            message=self,
            user=user,
            defaults={'read_at': models.F('created_at')}
        )

    def is_read_by(self, user):
        """Check if message has been read by user"""
        return self.read_by.filter(id=user.id).exists()


class MessageRead(models.Model):
    """
    Track when users read messages
    """
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messaging_message_reads'
        unique_together = ['message', 'user']

    def __str__(self):
        return f"{self.user.first_name} read message {self.message.id}"


class Notification(models.Model):
    """
    Lightweight in-app notifications for users
    """
    NOTIFICATION_TYPES = [
        ('booking', 'Session Booking'),
        ('cancellation', 'Session Cancellation'),
        ('reminder', 'Session Reminder'),
        ('admin_escalation', 'Admin Escalation'),
        ('institution_activity', 'Institution Activity'),
        ('moderation', 'Content Moderation'),
        ('ai_coach', 'AI Coach Alert'),
        ('user_registration', 'User Registration'),
        ('application', 'Application Submitted'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    data = models.JSONField(blank=True, null=True)
    link = models.CharField(max_length=500, blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messaging_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"


# ── E2E Encrypted Messaging Models ──────────────────────────────────────────

class UserPublicKey(models.Model):
    """
    Stores each user's NaCl public key for E2E encryption.
    Private key NEVER leaves the client browser.
    """
    user       = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='public_key',
    )
    public_key = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messaging_user_public_keys'

    def __str__(self):
        return f'PublicKey for {self.user.email}'


class E2EMessage(models.Model):
    """
    End-to-end encrypted message.
    Server stores ciphertext only — plaintext never touches server.
    """
    conversation      = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='e2e_messages',
    )
    sender            = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='e2e_sent_messages',
    )
    encrypted_content          = models.TextField()                                  # recipient's copy
    nonce                      = models.CharField(max_length=64, blank=True, default='')
    recipient_pub_key          = models.CharField(max_length=64, blank=True, default='')
    sender_encrypted_content   = models.TextField(blank=True, default='')            # sender's copy
    sender_nonce               = models.CharField(max_length=64, blank=True, default='')
    sender_public_key          = models.CharField(max_length=64, blank=True, default='')  # sender's pub key for recipient decryption
    is_encrypted               = models.BooleanField(default=True)
    is_read                    = models.BooleanField(default=False)
    is_edited                  = models.BooleanField(default=False)
    is_deleted                 = models.BooleanField(default=False)
    read_at           = models.DateTimeField(null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'messaging_e2e_messages'
        ordering  = ['created_at']

    def __str__(self):
        return f'E2EMessage {self.id} in conv {self.conversation_id}'

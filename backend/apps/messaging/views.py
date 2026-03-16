from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageRead, Notification, UserPublicKey, E2EMessage
from .serializers import (
    ConversationSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    NotificationSerializer
)
import logging
import traceback

User = get_user_model()
logger = logging.getLogger(__name__)


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        """Get conversations for current user"""
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related(
            'participants',
            'mentor',
            Prefetch('messages', queryset=Message.objects.order_by('-created_at'))
        ).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        """Create a new conversation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        
        # Return the created conversation with full data
        response_serializer = ConversationSerializer(
            conversation, 
            context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a specific conversation"""
        conversation = self.get_object()
        messages = conversation.messages.order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        offset = (page - 1) * page_size
        
        paginated_messages = messages[offset:offset + page_size]
        serializer = MessageSerializer(
            paginated_messages, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'results': serializer.data,
            'has_more': messages.count() > offset + page_size
        })

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to the conversation"""
        conversation = self.get_object()
        
        serializer = MessageSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        message = serializer.save(
            conversation=conversation,
            sender=request.user
        )
        
        # Update conversation timestamp
        conversation.save(update_fields=['updated_at'])
        
        return Response(
            MessageSerializer(message, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark all messages in conversation as read"""
        conversation = self.get_object()
        
        # Get all unread messages in this conversation
        unread_messages = conversation.messages.exclude(sender=request.user)
        
        # Create read receipts for unread messages
        for message in unread_messages:
            MessageRead.objects.get_or_create(
                message=message,
                user=request.user
            )
        
        return Response({'status': 'marked_read'})

    @action(detail=False, methods=['post'])
    def send_to_mentor(self, request):
        """Send a message to a mentor"""
        mentor_id = request.data.get('mentor_id')
        content = request.data.get('content')
        
        if not mentor_id or not content:
            return Response(
                {'error': 'mentor_id and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            mentor = User.objects.get(id=mentor_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Mentor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get or create conversation between current user and mentor
        conversation, created = Conversation.objects.get_or_create_between(
            request.user, mentor
        )
        
        # Create the message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
            message_type='text'
        )
        
        # Update conversation timestamp
        conversation.save(update_fields=['updated_at'])
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for reading messages (mostly read-only)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get messages from user's conversations"""
        user_conversations = Conversation.objects.filter(
            participants=self.request.user
        ).values_list('id', flat=True)
        
        return Message.objects.filter(
            conversation__in=user_conversations
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific message as read"""
        message = self.get_object()
        
        # Only allow marking messages from conversations user is part of
        if not message.conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'Not authorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create read receipt
        read_receipt, created = MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        return Response({
            'status': 'marked_read',
            'already_read': not created
        })


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        status_filter = self.request.query_params.get('status')
        if status_filter == 'unread':
            queryset = queryset.filter(read_at__isnull=True)
        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if notification.read_at is None:
            notification.read_at = timezone.now()
            notification.save(update_fields=['read_at'])
        return Response({'status': 'read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(
            user=request.user,
            read_at__isnull=True
        ).update(read_at=timezone.now())
        return Response({'status': 'all_read'})


# ── E2E Encrypted Messaging Views ─────────────────────────────────────────────

def _initials(user):
    name = user.get_full_name() or user.username
    parts = name.strip().split()
    if len(parts) >= 2:
        return f'{parts[0][0]}{parts[-1][0]}'.upper()
    return name[:2].upper()


class UserPublicKeyView(APIView):
    """
    GET  /api/messaging/keys/           — get own public key
    GET  /api/messaging/keys/<user_id>/ — get any user's public key
    POST /api/messaging/keys/           — register/update own public key
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id=None):
        if not user_id:
            try:
                key = UserPublicKey.objects.get(user=request.user)
                return Response({'public_key': key.public_key, 'user_id': request.user.id})
            except UserPublicKey.DoesNotExist:
                return Response({'public_key': None, 'user_id': request.user.id})
        try:
            key = UserPublicKey.objects.get(user_id=user_id)
            return Response({'public_key': key.public_key, 'user_id': user_id})
        except UserPublicKey.DoesNotExist:
            return Response({'error': 'Public key not found.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        public_key = request.data.get('public_key', '').strip()
        if not public_key or len(public_key) < 40 or len(public_key) > 50:
            return Response({'error': 'Invalid public key format.'}, status=status.HTTP_400_BAD_REQUEST)
        key_obj, created = UserPublicKey.objects.update_or_create(
            user=request.user,
            defaults={'public_key': public_key},
        )
        logger.info(f'[E2E] Public key {"registered" if created else "updated"} for {request.user.username}')
        return Response(
            {'public_key': key_obj.public_key, 'created': created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class E2EConversationView(APIView):
    """
    GET  /api/messaging/e2e/conversations/ — list conversations
    POST /api/messaging/e2e/conversations/ — get or create conversation
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        convs = (
            Conversation.objects
            .filter(participants=request.user)
            .prefetch_related('participants')
            .order_by('-updated_at')
        )
        results = []
        for conv in convs:
            other = conv.get_other_participant(request.user)
            if not other:
                continue
            last_msg = conv.e2e_messages.last()
            unread = conv.e2e_messages.filter(is_read=False).exclude(sender=request.user).count()
            try:
                other_pub_key = other.public_key.public_key
            except Exception:
                other_pub_key = None
            results.append({
                'id': conv.id,
                'other_participant': {
                    'id': other.id,
                    'full_name': other.get_full_name() or other.username,
                    'email': other.email,
                    'avatar_initials': _initials(other),
                    'public_key': other_pub_key,
                },
                'last_message': {
                    'encrypted_content': last_msg.encrypted_content,
                    'nonce': last_msg.nonce,
                    'sender_id': last_msg.sender_id,
                    'created_at': last_msg.created_at.isoformat(),
                    'is_read': last_msg.is_read,
                } if last_msg else None,
                'unread_count': unread,
                'updated_at': conv.updated_at.isoformat(),
            })
        return Response(results)

    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        if not recipient_id:
            return Response({'error': 'recipient_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(recipient_id) == request.user.id:
            return Response({'error': 'You cannot message yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recipient = User.objects.get(id=recipient_id, is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = (
            Conversation.objects
            .filter(participants=request.user)
            .filter(participants=recipient)
        ).first()

        if existing:
            conv = existing
        else:
            conv = Conversation.objects.create()
            conv.participants.add(request.user, recipient)
            logger.info(f'[E2E] New conversation {conv.id}: {request.user.username} <-> {recipient.username}')

        try:
            other_pub_key = recipient.public_key.public_key
        except Exception:
            other_pub_key = None

        return Response({
            'id': conv.id,
            'other_participant': {
                'id': recipient.id,
                'full_name': recipient.get_full_name() or recipient.username,
                'email': recipient.email,
                'avatar_initials': _initials(recipient),
                'public_key': other_pub_key,
            },
            'unread_count': 0,
            'last_message': None,
            'updated_at': conv.updated_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class E2EMessagesView(APIView):
    """
    GET  /api/messaging/e2e/conversations/<id>/messages/ — load history
    POST /api/messaging/e2e/conversations/<id>/send/     — send encrypted message
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_conv(self, conv_id, user):
        try:
            conv = Conversation.objects.get(id=conv_id)
        except Conversation.DoesNotExist:
            return None, Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not conv.participants.filter(id=user.id).exists():
            return None, Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return conv, None

    def get(self, request, conv_id):
        conv, err = self._get_conv(conv_id, request.user)
        if err:
            return err
        conv.e2e_messages.filter(is_read=False).exclude(sender=request.user).update(
            is_read=True, read_at=timezone.now()
        )
        msgs = conv.e2e_messages.select_related('sender').all()
        data = [{
            'id': m.id,
            'sender_id': m.sender_id,
            'sender_name': (m.sender.get_full_name() or m.sender.username) if m.sender else 'Deleted',
            'encrypted_content': m.encrypted_content,
            'nonce': m.nonce,
            'recipient_pub_key': m.recipient_pub_key,
            'sender_encrypted_content': m.sender_encrypted_content,
            'sender_nonce': m.sender_nonce,
            'sender_public_key': m.sender_public_key,
            'is_encrypted': m.is_encrypted,
            'is_edited': m.is_edited,
            'is_deleted': m.is_deleted,
            'is_read': m.is_read,
            'created_at': m.created_at.isoformat(),
            'is_mine': m.sender_id == request.user.id,
        } for m in msgs]
        return Response(data)

    def post(self, request, conv_id):
        conv, err = self._get_conv(conv_id, request.user)
        if err:
            return err

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        msg = E2EMessage.objects.create(
            conversation=conv,
            sender=request.user,
            encrypted_content=content,
            nonce='',
            recipient_pub_key='',
            sender_encrypted_content='',
            sender_nonce='',
            sender_public_key='',
            is_encrypted=False,
        )
        conv.updated_at = timezone.now()
        conv.save(update_fields=['updated_at'])

        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'e2e_conv_{conv.id}',
                {
                    'type': 'new_e2e_message',
                    'message_id': msg.id,
                    'conversation_id': conv.id,
                    'sender_id': request.user.id,
                    'sender_name': request.user.get_full_name() or request.user.username,
                    'encrypted_content': content,
                    'nonce': '',
                    'recipient_pub_key': '',
                    'sender_encrypted_content': '',
                    'sender_nonce': '',
                    'sender_public_key': '',
                    'is_encrypted': False,
                    'created_at': msg.created_at.isoformat(),
                }
            )
        except Exception as e:
            logger.warning(f'[E2E] WebSocket broadcast failed (offline delivery via REST): {e}')

        return Response({
            'id': msg.id,
            'sender_id': request.user.id,
            'sender_name': request.user.get_full_name() or request.user.username,
            'encrypted_content': content,
            'nonce': '',
            'recipient_pub_key': '',
            'sender_encrypted_content': '',
            'sender_nonce': '',
            'sender_public_key': '',
            'is_encrypted': False,
            'is_edited': False,
            'is_deleted': False,
            'is_read': False,
            'created_at': msg.created_at.isoformat(),
            'is_mine': True,
        }, status=status.HTTP_201_CREATED)


class E2EMessageEditView(APIView):
    """PATCH /api/messaging/e2e/messages/<id>/edit/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, msg_id):
        try:
            msg = E2EMessage.objects.get(id=msg_id, sender=request.user)
        except E2EMessage.DoesNotExist:
            return Response({'error': 'Message not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        encrypted_content        = request.data.get('encrypted_content', '').strip()
        nonce                    = request.data.get('nonce', '').strip()
        sender_encrypted_content = request.data.get('sender_encrypted_content', '').strip()
        sender_nonce             = request.data.get('sender_nonce', '').strip()

        if not encrypted_content:
            return Response({'error': 'Content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        msg.encrypted_content        = encrypted_content
        msg.nonce                    = nonce or msg.nonce
        msg.sender_encrypted_content = sender_encrypted_content or msg.sender_encrypted_content
        msg.sender_nonce             = sender_nonce or msg.sender_nonce
        msg.is_edited                = True
        msg.save(update_fields=['encrypted_content', 'nonce', 'sender_encrypted_content', 'sender_nonce', 'is_edited'])

        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'e2e_conv_{msg.conversation_id}',
                {
                    'type': 'message_edited',
                    'message_id': msg.id,
                    'encrypted_content': encrypted_content,
                    'nonce': nonce,
                    'sender_encrypted_content': sender_encrypted_content,
                    'sender_nonce': sender_nonce,
                    'is_edited': True,
                }
            )
        except Exception as e:
            logger.warning(f'[E2E] Edit WS broadcast failed: {e}')

        return Response({'id': msg.id, 'is_edited': True})


class E2EMessageDeleteView(APIView):
    """DELETE /api/messaging/e2e/messages/<id>/delete/"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, msg_id):
        try:
            msg = E2EMessage.objects.get(id=msg_id, sender=request.user)
        except E2EMessage.DoesNotExist:
            return Response({'error': 'Message not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        msg.is_deleted               = True
        msg.encrypted_content        = ''
        msg.nonce                    = ''
        msg.sender_encrypted_content = ''
        msg.sender_nonce             = ''
        msg.save(update_fields=['is_deleted', 'encrypted_content', 'nonce', 'sender_encrypted_content', 'sender_nonce'])

        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'e2e_conv_{msg.conversation_id}',
                {'type': 'message_deleted', 'message_id': msg.id}
            )
        except Exception as e:
            logger.warning(f'[E2E] Delete WS broadcast failed: {e}')

        return Response({'deleted': True, 'message_id': msg.id})


class E2EConversationDeleteView(APIView):
    """DELETE /api/messaging/e2e/conversations/<id>/delete/"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, conv_id):
        try:
            conv = Conversation.objects.get(id=conv_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not conv.participants.filter(id=request.user.id).exists():
            return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        conv.participants.remove(request.user)
        if conv.participants.count() == 0:
            conv.delete()
        return Response({'deleted': True})


class UserSearchView(APIView):
    """GET /api/messaging/users/search/?q=name"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response({'results': []})
        users = (
            User.objects
            .filter(
                Q(username__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q),
                is_active=True,
            )
            .exclude(id=request.user.id)[:10]
        )
        results = []
        for u in users:
            try:
                pub_key = u.public_key.public_key
            except Exception:
                pub_key = None
            results.append({
                'id': u.id,
                'full_name': u.get_full_name() or u.username,
                'email': u.email,
                'avatar_initials': _initials(u),
                'public_key': pub_key,
            })
        return Response({'results': results})


class UnreadCountView(APIView):
    """GET /api/messaging/unread/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = E2EMessage.objects.filter(
            conversation__participants=request.user,
            is_read=False,
        ).exclude(sender=request.user).count()
        return Response({'unread_count': count})

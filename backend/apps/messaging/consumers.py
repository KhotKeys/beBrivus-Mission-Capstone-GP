import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class E2EConversationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time E2E encrypted messaging.
    Server forwards encrypted messages — never decrypts.
    """

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_name = f'e2e_conv_{self.conversation_id}'
        self.user = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            logger.warning(f'[E2E-WS] Rejected unauthenticated connection to {self.room_name}')
            await self.close(code=4001)
            return

        is_participant = await self.check_participant()
        if not is_participant:
            logger.warning(f'[E2E-WS] Rejected non-participant {self.user.username} from {self.room_name}')
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        logger.info(f'[E2E-WS] {self.user.username} connected to {self.room_name}')

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'conversation_id': self.conversation_id,
            'user_id': self.user.id,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')

            if msg_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
                return

            if msg_type == 'typing':
                await self.channel_layer.group_send(self.room_name, {
                    'type': 'typing_indicator',
                    'user_id': self.user.id,
                    'user_name': self.user.get_full_name() or self.user.username,
                    'is_typing': data.get('is_typing', False),
                })
                return

        except json.JSONDecodeError:
            logger.error(f'[E2E-WS] Invalid JSON from {self.user.username}')
        except Exception as e:
            logger.error(f'[E2E-WS] receive error: {e}')

    async def new_e2e_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message_id': event['message_id'],
            'conversation_id': event['conversation_id'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'encrypted_content': event['encrypted_content'],
            'nonce': event['nonce'],
            'recipient_pub_key': event.get('recipient_pub_key', ''),
            'sender_encrypted_content': event.get('sender_encrypted_content', ''),
            'sender_nonce': event.get('sender_nonce', ''),
            'sender_public_key': event.get('sender_public_key', ''),
            'is_encrypted': event.get('is_encrypted', True),
            'created_at': event['created_at'],
        }))

    async def typing_indicator(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing'],
            }))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'encrypted_content': event['encrypted_content'],
            'nonce': event['nonce'],
            'sender_encrypted_content': event['sender_encrypted_content'],
            'sender_nonce': event['sender_nonce'],
            'is_edited': True,
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
        }))

    @database_sync_to_async
    def check_participant(self):
        from .models import Conversation
        try:
            return Conversation.objects.filter(
                id=self.conversation_id,
                participants=self.user,
            ).exists()
        except Exception:
            return False

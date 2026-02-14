import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.mentors.models import MentorshipSession

logger = logging.getLogger(__name__)


class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get session ID from URL route
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'video_call_{self.session_id}'
        
        # Check if user is authenticated and authorized for this session
        # if isinstance(self.scope['user'], AnonymousUser):
        #     await self.close(code=4001)  # Unauthorized
        #     print(f"Connecting to video call session {self.session_id} {self.scope['user']}")
        #     return
            
        # # Verify user has access to this session
        # has_access = await self.check_session_access()
        # if not has_access:
        #     await self.close(code=4003)  # Forbidden
        #     return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.scope['user'].id,
                'username': self.scope['user'].username
            }
        )
        
        logger.info(f"User {self.scope['user'].username} joined video call {self.session_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Notify others that user left
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.scope['user'].id if self.scope['user'] else None,
                    'username': self.scope['user'].username if self.scope['user'] else None
                }
            )
            
        logger.info(f"User disconnected from video call {self.session_id}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            # Handle different types of signaling messages
            if message_type in ['offer', 'answer', 'ice-candidate', 'chat']:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'signaling_message',
                        'message': text_data_json,
                        'sender_id': self.scope['user'].id,
                        'sender_username': self.scope['user'].username
                    }
                )
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")

    # Handler for signaling messages
    async def signaling_message(self, event):
        message = event['message']
        sender_id = event['sender_id']
        
        # Don't send message back to sender
        if sender_id != self.scope['user'].id:
            await self.send(text_data=json.dumps(message))

    # Handler for user joined event
    async def user_joined(self, event):
        user_id = event['user_id']
        username = event['username']
        
        # Don't send to the user who just joined
        if user_id != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'user-joined',
                'user_id': user_id,
                'username': username
            }))

    # Handler for user left event
    async def user_left(self, event):
        user_id = event['user_id']
        username = event['username']
        
        # Don't send to the user who left (they're already disconnected)
        if user_id != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'user-left',
                'user_id': user_id,
                'username': username
            }))

    @database_sync_to_async
    def check_session_access(self):
        """Check if the current user has access to this session"""
        try:
            session = MentorshipSession.objects.get(id=self.session_id)
            user = self.scope['user']
            
            # User has access if they are either the mentor or the mentee
            return (
                (hasattr(user, 'mentor_profile') and session.mentor == user.mentor_profile) or
                session.mentee == user
            )
        except MentorshipSession.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error checking session access: {str(e)}")
            return False

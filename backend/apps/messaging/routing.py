from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r'^ws/messaging/(?P<conversation_id>\d+)/$',
        consumers.E2EConversationConsumer.as_asgi(),
    ),
]

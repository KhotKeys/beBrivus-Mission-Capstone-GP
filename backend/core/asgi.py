"""
ASGI config for core project.
"""

import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.video.routing import websocket_urlpatterns as video_patterns
from apps.messaging.routing import websocket_urlpatterns as messaging_patterns
from apps.messaging.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(
                video_patterns + messaging_patterns
            )
        )
    ),
})

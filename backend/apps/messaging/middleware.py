import logging
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_key):
    if not token_key:
        return AnonymousUser()
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        User = get_user_model()
        token = AccessToken(token_key)
        user_id = token.get('user_id')
        if not user_id:
            return AnonymousUser()
        user = User.objects.get(id=user_id, is_active=True)
        logger.info(f'[WS-AUTH] JWT authenticated: {user.username}')
        return user
    except Exception:
        pass
    logger.warning('[WS-AUTH] Token validation failed')
    return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Authenticates WebSocket connections via JWT token in query string.
    Usage: ws://.../?token=<access_token>
    Required because browsers cannot set custom headers on WebSocket connections.
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        params = parse_qs(query_string)
        token_list = params.get('token', [])
        token_key = token_list[0] if token_list else None

        if token_key:
            scope['user'] = await get_user_from_token(token_key)
        else:
            headers = dict(scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode('utf-8')
            if auth_header.startswith('Bearer '):
                scope['user'] = await get_user_from_token(auth_header.split(' ')[1])
            else:
                scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)

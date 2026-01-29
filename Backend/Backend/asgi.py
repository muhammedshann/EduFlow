import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.accounts.middleware import JWTAuthMiddleware

# --- IMPORTS FROM YOUR APPS ---
from apps.groups.routing import websocket_urlpatterns as chat_wb
from apps.transcription_notes.routing import websocket_urlpatterns as live_transcription_ws
from apps.chat_bot.routing import websocket_urlpatterns as chat_bot_ws

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")
django_asgi_app = get_asgi_application()

# --- DEBUG MIDDLEWARE (Add this class) ---
class DebugMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # This will print the EXACT path Daphne receives
        if scope['type'] == 'websocket':
            print(f"🕵️ DEBUG: Incoming Path is -> '{scope['path']}'")
        return await self.inner(scope, receive, send)

# --- ROUTER SETUP ---
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": DebugMiddleware(  # Wrap everything in the Spy
        JWTAuthMiddleware(
            URLRouter(chat_wb + live_transcription_ws + chat_bot_ws)
        )
    ),
})
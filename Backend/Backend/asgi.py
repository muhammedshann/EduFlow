import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.security.websocket import OriginValidator


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")

django_asgi_app = get_asgi_application()

from apps.groups.routing import websocket_urlpatterns as chat_wb
from apps.transcription_notes.routing import websocket_urlpatterns as live_transcription_ws
from apps.chat_bot.routing import websocket_urlpatterns as chat_bot_ws
from apps.accounts.middleware import JWTAuthMiddleware
print("CHAT BOT WS:", chat_bot_ws)


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": OriginValidator(
        JWTAuthMiddleware(
            URLRouter(chat_wb + live_transcription_ws + chat_bot_ws)
        ),
        [
            "https://fresheasy.online",
            "https://www.fresheasy.online",
            "https://eduflow-ivory.vercel.app",
        ]
    )
})

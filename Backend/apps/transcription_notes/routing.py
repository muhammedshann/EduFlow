from django.urls import re_path
from .consumers import LiveTranscriptionConsumer

websocket_urlpatterns = [
    re_path(r"^ws/live-transcribe/$", LiveTranscriptionConsumer.as_asgi()),
]

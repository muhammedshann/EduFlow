from rest_framework import serializers
from .models import ChatBotMessage

class ChatBotMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBotMessage
        fields = ["question", "answer", "created_at"]

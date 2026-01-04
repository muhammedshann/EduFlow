from rest_framework import serializers
from .models import Transcription


class TranscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcription
        fields = [
            "id",
            "type",
            "title",
            "transcript_text",
            "credits_used",
            "created_at",
        ]
        read_only_fields = ["id", "credits_used", "created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        return Transcription.objects.create(
            user=user,
            **validated_data
        )
    
class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcription
        fields = [
            "id",
            "type",
            "title",
            "transcript_text",
            "credits_used",
            "created_at",
        ]
        read_only_fields = ["id", "credits_used", "created_at"]
    

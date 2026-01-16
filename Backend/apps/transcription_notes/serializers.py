from rest_framework import serializers
from .models import Notes, UploadTranscription


class TranscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
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
        return Notes.objects.create(
            user=user,
            **validated_data
        )
    
class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = [
            "id",
            "type",
            "title",
            "upload_source",
            "transcript_text",
            "credits_used",
            "created_at",
        ]
        read_only_fields = ["id", "credits_used", "created_at"]
    
class NoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = ["type", "title", "transcript_text", "upload_source"]

    def create(self, validated_data):
        # Automatically assign the authenticated user to the note
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
class MediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadTranscription
        fields = ["id", "file", "status", "created_at", "transcript"] 
        read_only_fields = ["status"]

    def validate_file(self, file):
        if file.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("Max file size is 100MB")
        return file
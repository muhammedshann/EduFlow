from django.db import models
from django.conf import settings
import uuid

class UploadTranscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="upload_Transcription" 
    )
    file = models.FileField(upload_to="upload_transcription_files/")
    transcript = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("done", "Done")],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

class Notes(models.Model):
    TRANSCRIPTION_TYPE_CHOICES = (
        ("file", "File"),
        ("live", "Live"),
    
    )
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="transcription_notes")
    type = models.CharField(max_length=20,choices=TRANSCRIPTION_TYPE_CHOICES)
    upload_source = models.ForeignKey(
        UploadTranscription, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="note_entry"
    )
    title = models.CharField(max_length=225, default="Untitled Note")
    transcript_text = models.TextField()
    credits_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.type} - {self.created_at}"

class LiveTranscription(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="live_transcription")
    count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.count}"
    
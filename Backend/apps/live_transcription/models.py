from django.db import models
from django.conf import settings
import uuid


class Transcription(models.Model):
    TRANSCRIPTION_TYPE_CHOICES = (
        ("file", "File"),
        ("live", "Live"),
    
    )
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="transcriptions")
    type = models.CharField(max_length=20,choices=TRANSCRIPTION_TYPE_CHOICES)
    source_file = models.FileField(upload_to="transcriptions/",null=True,blank=True)
    title = models.CharField(max_length=225, default="Untitled Note")
    transcript_text = models.TextField()
    credits_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transcriptions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.type} - {self.created_at}"

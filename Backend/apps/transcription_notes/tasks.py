import whisper
from celery import shared_task
from .models import UploadTranscription

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, retry_kwargs={'max_retries': 3})
def transcribe_media(self, media_id):
    media = UploadTranscription.objects.get(id=media_id)
    print("🚀 Transcription started")

    # ✅ load model INSIDE task
    model = whisper.load_model("tiny")  # 🔥 IMPORTANT

    print("📦 Model loaded")

    result = model.transcribe(
        media.file.path,
        fp16=False,
        language="en"
    )

    print("✅ Transcription finished")

    media.transcript = result["text"]
    media.status = "done"
    media.save()

import os
import json
import tempfile
import asyncio
import whisper
from channels.generic.websocket import AsyncWebsocketConsumer

model = whisper.load_model("base")


class LiveTranscriptionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.audio_buffer = bytearray()
        self.chunk_counter = 0

        # ~6 seconds rolling window
        self.MAX_BUFFER = 5 * 1024 * 1024

        print("WS connected")

    async def disconnect(self, close_code):
        print("WS disconnected")

    async def receive(self, text_data=None, bytes_data=None):
        if not bytes_data:
            return

        self.audio_buffer.extend(bytes_data)
        self.chunk_counter += 1

        # Trim buffer (keep last ~75%)
        if len(self.audio_buffer) > self.MAX_BUFFER:
            self.audio_buffer = self.audio_buffer[-int(self.MAX_BUFFER * 0.75):]

        # Transcribe every 3 chunks (stable)
        if self.chunk_counter % 3 != 0:
            return

        await self.transcribe_snapshot()

    async def transcribe_snapshot(self):
        if len(self.audio_buffer) < 80_000:
            return

        loop = asyncio.get_event_loop()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
            f.write(self.audio_buffer)
            path = f.name

        try:
            text = await loop.run_in_executor(None, self.run_whisper, path)

            if text:
                # 🔥 SEND FULL SNAPSHOT (NOT DIFF)
                await self.send(json.dumps({
                    "text": text
                }))

        finally:
            os.remove(path)

    def run_whisper(self, path):
        try:
            result = model.transcribe(
                path,
                fp16=False,
                language="en",
                no_speech_threshold=0.6,
            )
            return result.get("text", "").strip()
        except Exception as e:
            print("Whisper error:", e)
            return ""

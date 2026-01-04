import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .gemini_service import call_gemini

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        print("✅ WebSocket Connected")

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data.get("message")
        context = data.get("context")
        note_title = data.get("note_title")

        if not message:
            return

        print("USER MESSAGE:", message)
        print("HAS CONTEXT:", context)

        # 🔑 MERGE NOTE + QUESTION
        if context:
            final_prompt = f"""
You are a helpful AI assistant.

Use the following note titled "{note_title}" to answer the user's question.
Answer clearly and simply.
If the answer is not in the note, say you cannot find it in the note.

NOTE CONTENT:
{context}

USER QUESTION:
{message}
"""
        else:
            final_prompt = message

        reply = await sync_to_async(
            call_gemini,
            thread_sensitive=False
        )(final_prompt)

        await self.send(text_data=json.dumps({
            "reply": reply
        }))

import json
from datetime import date
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatBot, ChatBotMessage
from .gemini_service import call_gemini

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        await self.accept()
        print("✅ WebSocket Connected")

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data.get("message")
        context = data.get("context")
        note_title = data.get("note_title")

        if not message:
            return

        # ✅ GET TODAY CHATBOT ROW + INCREMENT COUNT
        self.chatbot_obj = await self.get_or_create_today_chatbot()

        # 🔑 BUILD PROMPT
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

        # 🤖 CALL GEMINI
        reply = await sync_to_async(
            call_gemini,
            thread_sensitive=False
        )(final_prompt)

        # 💾 SAVE REQUEST + REPLY
        await self.save_request_reply(message, reply)

        # 📤 SEND RESPONSE
        await self.send(text_data=json.dumps({
            "reply": reply
        }))

    # ================= DAILY CHATBOT =================
    @sync_to_async
    def get_or_create_today_chatbot(self):
        today = date.today()

        obj = ChatBot.objects.filter(
            user=self.user,
            created_at__date=today
        ).first()

        if obj:
            obj.request_count += 1
            obj.save(update_fields=["request_count"])
            return obj

        return ChatBot.objects.create(
            user=self.user,
            request_count=1
        )

    # ================= SAVE MESSAGE =================
    @sync_to_async
    def save_request_reply(self, request_text, reply_text):
        ChatBotMessage.objects.create(
            chat_bot_Count=self.chatbot_obj,
            user=self.user,
            question=request_text,
            answer=reply_text
        )

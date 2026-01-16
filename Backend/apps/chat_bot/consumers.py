import json
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatBot, ChatBotMessage
from .gemini_service import call_gemini
from apps.accounts.models import UserCredits

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message")
        context = data.get("context", "")
        note_title = data.get("note_title", "")

        if not message:
            return
        
        # --- 1. PRE-CHECK (Read Only) ---
        check_result = await self.check_can_ask()
        
        if not check_result['allowed']:
            await self.send(text_data=json.dumps({
                "type": "limit_reached",
                "message": "Daily limit reached. Please purchase credits."
            }))
            return

        # --- 2. CALL GEMINI ---
        prompt = f"Note: {note_title}\nContext: {context}\nQuestion: {message}" if context else message
        
        reply = await sync_to_async(call_gemini, thread_sensitive=False)(prompt)

        # --- 3. VALIDATION & COMMITMENT ---
        # Only deduct credits if the reply is successful (doesn't start with error emojis)
        if "❌" not in reply and "⚠️" not in reply:
            # AI responded correctly, now we "charge" the user
            self.chatbot_obj = await self.finalise_transaction(check_result['mode'])
            
            # Save the message to history
            await self.save_request_reply(message, reply)

            await self.send(text_data=json.dumps({
                "reply": reply,
                "mode": check_result['mode']
            }))
        else:
            # AI failed or was rate-limited; send the error but do NOT deduct credits
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": reply # This will be the "AI service unavailable" message
            }))

    # ================= DATABASE HELPERS =================

    @sync_to_async
    def check_can_ask(self):
        """ Checks if the user has a right to ask a question. """
        today = timezone.now().date()
        obj, _ = ChatBot.objects.get_or_create(user=self.user, created_at__date=today)

        if obj.request_count < 3:
            return {'allowed': True, 'mode': 'free'}

        try:
            credits_obj = UserCredits.objects.get(user=self.user)
            if credits_obj.remaining_credits > 0:
                return {'allowed': True, 'mode': 'paid'}
        except UserCredits.DoesNotExist:
            pass

        return {'allowed': False, 'mode': 'blocked'}

    @sync_to_async
    def finalise_transaction(self, mode):
        """ Deducts credits and increments count ONLY on AI success. """
        today = timezone.now().date()
        obj = ChatBot.objects.get(user=self.user, created_at__date=today)
        
        if mode == 'paid':
            credits_obj = UserCredits.objects.get(user=self.user)
            credits_obj.used_credits += 1
            credits_obj.save()
        
        obj.request_count += 1
        obj.save(update_fields=["request_count"])
        return obj

    @sync_to_async
    def save_request_reply(self, request_text, reply_text):
        ChatBotMessage.objects.create(
            chat_bot_Count=self.chatbot_obj,
            user=self.user,
            question=request_text,
            answer=reply_text
        )
import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Group, GroupMember, GroupMessage
from apps.accounts.models import User


class GroupChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.room_group_name = f"chat_{self.group_id}"
        self.user = self.scope["user"]

        print("WS USER:", self.user)

        if not await self.group_exists():
            await self.close()
            return

        if not await self.is_member():
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print("WebSocket connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "").strip()

        if not message:
            return

        # AUTH username ALWAYS from backend, not frontend
        username = self.user.username

        saved = await self.save_message(message)

        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": saved["id"],
                "message": message,
                "username": username,
                "timestamp": saved["timestamp"],
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "image": event.get("image"),
            "username": event["username"],
            "timestamp": event["timestamp"],
        }))

    @database_sync_to_async
    def group_exists(self):
        return Group.objects.filter(id=self.group_id).exists()

    @database_sync_to_async
    def is_member(self):
        if not self.user or not getattr(self.user, "id", None):
            return False

        return GroupMember.objects.filter(
            group_id=self.group_id,
            user_id=self.user.id
        ).exists()

    @database_sync_to_async
    def save_message(self, message):
        msg = GroupMessage.objects.create(
            id=str(uuid.uuid4()),
            group_id=self.group_id,
            user_id=self.user.id,
            message=message,
        )

        return {
            "id": msg.id,
            "timestamp": msg.created_at.isoformat(),
        }

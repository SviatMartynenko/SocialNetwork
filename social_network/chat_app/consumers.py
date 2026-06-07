import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Chat, Message

from channels.db import database_sync_to_async
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]

        self.group_name = f"chat_{self.chat_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        await self.send(
            text_data= json.dumps({
                'action' : 'connection',
                'message': "Встановлення з'єднання по WebSocket було успішне!"
                }
            )
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        dict_data = json.loads(text_data)
        message_text = dict_data.get("messageText", None)
        sender = self.scope['user']
        if message_text:
            message = await self.save_message(message_text)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message_text': message_text,
                    'sender': sender.username,
                    'created_at': message["created_at"]
                }
            )
  

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'action': 'chat_message',
            'message_text': event['message_text'],
            'sender': event['sender'],
            'created_at': event["created_at"]
            }))
        
    
    @database_sync_to_async
    def save_message(self, text):
        user = self.scope['user']
        message = Message.objects.create(chat_id=self.chat_id, sender=user, text=text)
        created_at = timezone.localtime(message.created_at)
        return {"id": message.id, "text": message.text, "sender": user.username, "created_at": created_at.isoformat()}
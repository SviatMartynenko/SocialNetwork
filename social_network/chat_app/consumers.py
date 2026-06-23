import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Chat, Message
from user_app.models import Friendship

from channels.db import database_sync_to_async
from django.template.loader import render_to_string
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

            await self.send_unread_updates()
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'text': message_text,
                    'sender': sender.username,
                    'created_at': message["created_at"],
                    'images': message['images']
                }
            )

    async def send_unread_updates(self):
        user_ids = await self.get_chat_user_ids()

        for user_id in user_ids:
            await self.channel_layer.group_send(
                f"unread_{user_id}",
                {
                    "type": "unread_update"
                }
            )
    
    @database_sync_to_async
    def get_chat_user_ids(self):
        chat = Chat.objects.get(id=self.chat_id)
        return list(chat.users.values_list("id", flat=True))

    async def chat_message(self, event):

        await self.send(text_data=json.dumps({
            'action': 'chat_message',
            'text': event['text'],
            'sender': event['sender'],
            'created_at': event["created_at"],
            'images': event.get("images", [])
            }))
        
    
    @database_sync_to_async
    def save_message(self, text):
        user = self.scope['user']
        message = Message.objects.create(chat_id=self.chat_id, sender=user, text=text)
        image_urls = [img_obj.image.url for img_obj in message.images.all()]
        created_at = timezone.localtime(message.created_at)
        return {"id": message.id, "text": message.text, "sender": user.username, "created_at": created_at.isoformat(), 'images': image_urls}

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    online_users = set()

    async def connect(self):
        self.user = self.scope['user']
        self.user_id = str(self.user.id)
        self.group_name = "online_users"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self.online_users.add(self.user_id)
        # Відправляємо інформацію про статус кожного юзера поточному юзеру
        for user_id in self.online_users:
            await self.send_status(user_id, "online")
        # Поточний юзер відправляє інформацію про свій статус іншим юзерам
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'online_status',
                'user_id': self.user_id,
                'status': "online"
            }
        )

    async def disconnect(self, code):
        self.online_users.discard(self.user_id)
        await self.channel_layer.group_send(self.group_name, {
            'type': 'online_status',
            "user_id": self.user_id,
            "status": "offline"
        })


    async def online_status(self, event):
        await self.send_status(event['user_id'], event['status'])

    async def send_status(self, user_id, status):
        await self.send(text_data=json.dumps({
            'user_id': user_id,
            'status': status
        }))

class UnreadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.group_name = f"unread_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_unread_data()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
    
    async def receive(self, text_data = None):
        await self.send_unread_data()

    async def unread_update(self, event):
        await self.send_unread_data()

    async def send_unread_data(self):
        data = await self.get_unread_data()
        await self.send(text_data=json.dumps(data))
        
    
    @database_sync_to_async
    def get_unread_data(self):
        personal_total = 0
        group_total = 0
        chat_data = []
        chats = Chat.objects.filter(users = self.user)
        for chat in chats:
            last_message = chat.messages.order_by('-created_at','-id').first()
            last_text = ''
            if last_message:
                last_text = last_message.text[:20]
            else:
                last_text = ''
                
            unread = chat.messages.exclude(sender = self.user).exclude(readers = self.user).count()  

            if chat.is_group:
                group_total += unread   
            else:
                personal_total += unread 
            
            chat_data.append({'id': chat.id, 'unread': unread, 'last': last_text})

        friend_requests_total = Friendship.objects.filter(to_user=self.user, status="pending").count()
        return {
            'personal_total': personal_total,
            'group_total': group_total,
            'total': personal_total + group_total,
            'friend_requests_total': friend_requests_total,
            'chats': chat_data
        }
    
       
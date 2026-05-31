import json
from channels.generic.websocket import AsyncWebsocketConsumer

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

    async def receive(self, text_data):
        dict_data = json.loads(text_data)
        message_text = dict_data.get("messageText", None)
        print(message_text)
        sender = self.scope['user']
        if message_text:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message_text': message_text,
                    'sender': sender.email 
                }
            )
  

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'action': 'chat_message',
            'message_text': event['message_text'],
            'sender':event['sender']
            }))
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

        await self.send(
            text_data = json.dumps({
                'message': "Встановлення з'єднання по WebSocket було успішне!"
            })
        )
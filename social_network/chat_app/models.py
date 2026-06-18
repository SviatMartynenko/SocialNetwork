from django.db import models

from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name="chats")
    name = models.CharField(max_length=50, blank=True, null=True)
    is_group = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='images/chat_avatars/', blank=True, null=True)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        if self.name:
            return self.name
        return f'Chat {self.id}'

# Описуємо модель одного повідомлення в чаті.
class Message(models.Model):
    # Зберігаємо текст повідомлення.
    text = models.TextField()
    # Зберігаємо чат, у якому написали повідомлення.
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    # Зберігаємо автора повідомлення.
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    # Зберігаємо користувачів, які прочитали повідомлення.
    readers = models.ManyToManyField(User, blank=True, related_name="read_messages")
    # Зберігаємо дату й час створення повідомлення.
    created_at = models.DateTimeField(auto_now_add=True)

    # Повертаємо короткий текст повідомлення для адмінки.
    def __str__(self):
        # Показуємо перші 30 символів повідомлення.
        return self.text[:30]
    

class MessageImage(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='images/chat_images/')


class ChatGroupImage(models.Model):
    avatar = models.ImageField(upload_to='images/group_avatars/', blank=True)
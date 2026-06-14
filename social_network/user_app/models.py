from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    username = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )
    email = models.EmailField(
        unique=True
    )
    email_confirmed = False
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.id}"


class Friendship(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_friendships")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_friendships")
    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_user", "to_user")
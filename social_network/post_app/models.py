from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.

User = get_user_model()

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name= "posts")
    title = models.CharField(max_length = 255)
    content = models.TextField()
    topic = models.CharField(max_length = 100, null = True, blank = True)
    tags = models.ManyToManyField('PostTag', blank = True, related_name= "posts")

    def __str__(self):
        return self.title


class PostTag(models.Model):
    name = models.CharField(max_length = 50, unique = True)
    
    def __str__(self):
        return self.name
    
class PostLink(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name= "links")
    url = models.URLField(max_length = 500)

    def __str__(self):
        return self.url
    
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name= "images")
    original = models.ImageField(upload_to = 'post_images/originals/')
    compressed = models.ImageField(upload_to = 'post_images/compressed/')
    
    def __str__(self):
        return self.original.name

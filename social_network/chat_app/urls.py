from django.urls import path
from .views import *


urlpatterns = [
    path(route='', view=ChatView.as_view(), name="chat"),
    path(route='chat_with/<int:user_id>/', view=ChatWithView.as_view(), name="chat_with"),
    path(route='create_group/', view=CreateGroupView.as_view(), name="create_group"),
    path("<int:chat_id>/messages/", MessageHistoryView.as_view(), name="message_history"),
]
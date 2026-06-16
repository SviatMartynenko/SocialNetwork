from django.urls import path
from .views import *


urlpatterns = [
    path(route='', view=ChatView.as_view(), name="chat"),
    path(route='chat_with/<int:user_id>/', view=ChatWithView.as_view(), name="chat_with"),
    path(route='create_group/', view=CreateGroupView.as_view(), name="create_group"),
    path("<int:chat_id>/messages/", MessageHistoryView.as_view(), name="message_history"),
    path(route = "filter_chats/", view = FilterUserChats.as_view(), name = "filter_chats"),
    path(route="upload_images/<int:chat_id>/", view=MessageImagesUploadView.as_view(), name='message_images_upload'),
    path(route = 'group_members/<int:chat_id>/', view = GroupMembers.as_view(), name = "group_members"),
    path('chat/group_members/<int:chat_id>/<int:user_id>/', GroupMembers.as_view(), name='group_members_delete')
]
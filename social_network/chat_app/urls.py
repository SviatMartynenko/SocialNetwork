from django.urls import path
from .views import *


urlpatterns = [
    path(route='', view=ChatView.as_view(), name="chat"),
    path(route='chat_with/<int:user_id>/', view=ChatWithView.as_view(), name="chat_with"),
    path(route='create_group/', view=CreateGroupView.as_view(), name="create_group"),
    path(route='edit_group/<int:chat_id>/', view=EditGroupView.as_view(), name='edit_group'),
    path(route='group_add_participants/<int:chat_id>/', view=GroupAddParticipantsView.as_view(), name='group_add_participants'),
    path(route='add_group_participants/<int:chat_id>/', view=GroupAddParticipantsView.as_view(), name='add_group_participants'),
    path(route='delete_group/<int:chat_id>/', view=DeleteGroupView.as_view(), name='delete_group'),
    path("<int:chat_id>/messages/", MessageHistoryView.as_view(), name="message_history"),
    path(route = "filter_chats/", view = FilterUserChats.as_view(), name = "filter_chats"),
    path(route="upload_images/<int:chat_id>/", view=MessageImagesUploadView.as_view(), name='message_images_upload'),
    path(route = 'group_members/<int:chat_id>/', view = GroupMembers.as_view(), name = "group_members"),
    path('group_members/<int:chat_id>/<int:user_id>/', GroupMembers.as_view(), name='group_members_delete')
]
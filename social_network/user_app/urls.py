from django.urls import path
from .views import *


urlpatterns = [
    path('auth/', AuthTemplateView.as_view(), name = 'auth'),
    path('register/', RegisterView.as_view(), name = 'register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('confirm_email/', ConfirmEmailView.as_view(), name = 'confirm_email'),
    path('friends/', FriendsView.as_view(), name = 'friends'),
    path("friends/<str:section>/", FriendSectionView.as_view(), name="friend_section"),
    path(route="friends/action/<int:other_user_id>/<str:action>/", view = FriendActionView.as_view(), name="friend_action"),
    path(route="friends/profile", view = FriendListView.as_view(), name="friend_profile")
]
from django. urls import path
from .views import *
from django.contrib.auth.decorators import login_not_required


urlpatterns = [
    path('auth/', login_not_required(AuthTemplateView.as_view()), name = 'auth'),
    path('register/', login_not_required(RegisterView.as_view()), name = 'register'),
    path('login/', login_not_required(LoginView.as_view()), name = 'login'),
    path('confirm_email/', login_not_required(ConfirmEmailView.as_view()), name = 'confirm_email'),
    path('friends/', FriendsView.as_view(), name = 'friends'),
    path("friends/<str:section>/", FriendSectionView.as_view(), name="friend_section"),
    path(route="friends/action/<int:other_user_id>/<str:action>/", view = FriendActionView.as_view(), name="friend_action"),
    path(route="friends/profile", view = FriendListView.as_view(), name="friend_profile")
]


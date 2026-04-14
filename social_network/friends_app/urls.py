from django.urls import path
from .views import FriendsPageView

urlpatterns = [
    path('', FriendsPageView.as_view(), name='friends')
]
from django.urls import path
from .views import HomePageView,FirstLoginView

urlpatterns = [
    path('', HomePageView.as_view(), name = 'home'),
    path('first_login/', FirstLoginView.as_view(), name = 'first_login')
]
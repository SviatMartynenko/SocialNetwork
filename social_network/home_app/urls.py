from django.urls import path
from .views import HomePageView,FirstLoginView
from post_app.views import PostCreateView

urlpatterns = [
    path('', HomePageView.as_view(), name = 'home'),
    path('first_login/', FirstLoginView.as_view(), name = 'first_login'),
    path(route= 'create/', view= PostCreateView.as_view(), name= 'create_post')
]
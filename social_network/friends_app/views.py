from django.shortcuts import render
from django.views.generic.base import TemplateView


class FriendsPageView(TemplateView):
    template_name = "friends_app/friends.html"
from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.services.friend_queries import get_friends
from django.urls import reverse_lazy
from .models import Chat
from django.http import JsonResponse
from .services.chat_actions import get_or_create_chat

class ChatView(LoginRequiredMixin, TemplateView):
    template_name = 'chat_app/chat.html'
    login_url = reverse_lazy('auth')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['friends'] = get_friends(self.request.user)
        context['personal_chats'] = Chat.objects.filter(
            users = self.request.user,
            is_group = False
        ).order_by('id')
        return context
    
class ChatWithView(LoginRequiredMixin, View):
    login_url = reverse_lazy('auth')

    def post(self, request, user_id):
        response = get_or_create_chat(request, user_id)
        return JsonResponse(response)
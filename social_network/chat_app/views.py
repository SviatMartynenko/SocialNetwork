from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.services.friend_queries import get_friends
from django.urls import reverse_lazy
from .models import Chat, Message
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from .services.chat_actions import *
from django.core.paginator import Paginator
from django.utils import timezone


User = get_user_model()

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
        context['group_chats'] = Chat.objects.filter(
            users=self.request.user,
            is_group=True
        ).order_by('id')
        return context
    

class ChatWithView(LoginRequiredMixin, View):
    login_url = reverse_lazy('auth')

    def post(self, request, user_id):
        response_dict = get_or_create_chat(request, user_id)
        return JsonResponse(response_dict)
    
# Віддаємо історію чату сторінками по 10 повідомлень.
class MessageHistoryView(LoginRequiredMixin, View):
    # Вказуємо URL входу для неавторизованих користувачів.
    login_url = "auth"

    # Обробляємо GET-запит на чергову сторінку історії.
    def get(self, request, chat_id):
        # Перевіряємо, що користувач є учасником цього чату.
        if not Chat.objects.filter(id=chat_id, users=request.user).exists():
            # Забороняємо читати чужі повідомлення.
            return JsonResponse({"success": False}, status=403)

        # Новіші повідомлення йдуть першими, щоб page=1 була останньою історією.
        query = Message.objects.filter(chat_id=chat_id).select_related("sender").order_by("-created_at", "-id")
        page_obj = Paginator(query, 10).get_page(request.GET.get("page", 1))
        # Розвертаємо сторінку назад, щоб у чаті повідомлення йшли зверху вниз за часом.
        messages = list(page_obj.object_list)[::-1]

        return JsonResponse(
            {
                "messages": [
                    {
                        "id": message.id, 
                        "text": message.text, 
                        "sender": message.sender.username,
                        "created_at": timezone.localtime(message.created_at).isoformat()
                    } 
                    for message in messages
                ],
                "has_next": page_obj.has_next(),
            }
        )
    

class CreateGroupView(LoginRequiredMixin, View):
    login_url = reverse_lazy('auth')

    def post(self, request):
        response_dict = create_group(request)
        return JsonResponse(response_dict)
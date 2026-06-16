from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.services.friend_queries import get_friends
from django.urls import reverse_lazy
from .models import *
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.template.loader import render_to_string
from .services.chat_actions import *
from django.core.paginator import Paginator
from django.utils import timezone
from django.http import HttpRequest
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer



User = get_user_model()

class ChatView(LoginRequiredMixin, TemplateView):
    template_name = 'chat_app/chat.html'
    login_url = reverse_lazy('auth')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['friends'] = get_friends(self.request.user).order_by('username')
        context['personal_chats'] = Chat.objects.filter(
            users = self.request.user,
            is_group = False
        ).order_by('id')
        context['group_chats'] = Chat.objects.filter(
            users=self.request.user,
            is_group=True
        ).order_by('id')

        last_messages_data = []

        for chat in context['personal_chats']:
            last_massage = chat.messages.order_by('-created_at').first()
            
            if last_massage:
                last_messages_data.append({
                    'chat_id': chat.id,
                    'message_id': last_massage.id,
                    'text': last_massage.text[:20],
                    'created_at': timezone.localtime(last_massage.created_at).strftime("%H:%M")
                })

        context['last_user_messages'] = last_messages_data

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
                        "created_at": timezone.localtime(message.created_at).isoformat(),
                        "images": [image_obj.image.url for image_obj in message.images.all()]
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

class FilterUserChats(View):
    def get_queryset(self):
        return get_friends(current_user = self.request.user)
    
    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            queryset = self.get_queryset()     
            
            query_value = request.GET.get('value',"")
            if query_value and query_value != "":
                friends = queryset.filter(username__icontains = query_value)
            else:
                friends = queryset

            return JsonResponse({
                'success': True,
                'html_1': render_to_string("chat_app/particles/chat_profiles.html", {'friends': friends}),
                'html_2': render_to_string("chat_app/particles/group_friends.html", {'friends': friends}),
            })
        

class MessageImagesUploadView(LoginRequiredMixin, View):
    login_url = reverse_lazy('auth')

    def post(self, request: HttpRequest, chat_id):
        if not Chat.objects.filter(id=chat_id, users=request.user).exists():
            return JsonResponse({'success': False}, status=403)
        
        text = request.POST.get("text", "").strip()
        images = request.FILES.getlist('images')
        if not text and not images:
            return JsonResponse({'success': False, 'error': "empty_message"}, status=400)
        
        message = Message.objects.create(chat_id=chat_id, sender=request.user, text=text)

        for img in images:
            MessageImage.objects.create(message=message, image=img)

        image_urls = [image_obj.image.url for image_obj in message.images.all()]

       

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"chat_{chat_id}",
            {
                "type": "chat_message",
                'text': message.text,
                'sender': message.sender.username,
                "created_at": timezone.localtime(message.created_at).isoformat(),
                "images": image_urls
            }
        )

        return JsonResponse({'success': True})

  
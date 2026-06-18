from django.urls import reverse, reverse_lazy
from django.shortcuts import redirect
from django.views.generic import TemplateView, View, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.db.models import Max

from post_app.models import Post
from post_app.forms import PostForm, AddTagForm
from chat_app.models import Chat, Message
from .forms import FirstLoginForm
from user_app.services.friend_queries import get_friends, get_friendship_requests


class HomePageView(LoginRequiredMixin, ListView):
    model = Post
    template_name = "home_app/home.html"
    context_object_name = 'posts'
    paginate_by = 5
    login_url = 'auth'

    def dispatch(self, request, *args, **kwargs):
        user = request.user
        
        if user.username == "" and request.GET.get('tab') != 'first_login': 
            return redirect(reverse('home') + '?tab=first_login')
        
        if user.username != "" and request.GET.get('tab') == 'first_login':
            return redirect('home')
        
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_create_post'] = PostForm()
        context['form_add_tag'] = AddTagForm()
        context["first_login_form"] = FirstLoginForm()
        context['posts'] = Post.objects.all().order_by('-id')
        context['friends'] = get_friends(self.request.user)
        context['personal_chats'] = Chat.objects.filter(
            users = self.request.user,
            is_group = False
        ).order_by('id').annotate(
            last_message_at=Max('messages__created_at')
        ).order_by('-last_message_at')[:3]

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

        context["friendship_requests"] = get_friendship_requests(self.request.user)[:3]

        return context
    
    def get_queryset(self):
        return Post.objects.all()
    
    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            queryset = self.get_queryset()        
            paginator = Paginator(queryset, self.paginate_by)
            page_number = request.GET.get('page')
            page_obj = paginator.get_page(page_number)
            if int(page_number) > paginator.num_pages:
                return JsonResponse({'success': False})
            return JsonResponse({
                'success': True,
                'html': render_to_string('particles/show_post.html', {'posts': page_obj.object_list})
            })
        
        return super().get(request, *args, **kwargs)

class FirstLoginView(View):
    def post(self, request, *args, **kwargs):
        form = FirstLoginForm(request.POST, instance = request.user)
        if form.is_valid():
            form.save()
            return JsonResponse({
                    "success": True,
                    "message": "Інформація додана успішно",
                    "redirect_url": reverse('home')
                })
        
        return JsonResponse(
            {
                "success": False,
                "errors": form.errors.get_json_data()
            },
            status = 400
            )
    
from django.views.generic import TemplateView, View, ListView
from django.shortcuts import redirect
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponse
from .forms import RegisterForm, LoginForm, ConfirmEmailForm
from django.urls import reverse
from django.core.mail import send_mail
from social_network.settings import EMAIL_HOST_USER
import random
from django.urls import reverse_lazy
from django.template.loader import render_to_string
from django.core.paginator import Paginator
from .services.friend_queries import *
from .services.friend_actions import *  
from post_app.models import Post


class AuthTemplateView(TemplateView):
    template_name = "user_app/auth.html"

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        
        context["form_register"] = RegisterForm()
        context["form_login"] = LoginForm()
        context["form_confirm"] = ConfirmEmailForm()

        return context

class RegisterView(View):
    def post(self, request, *args, **kwargs):
        form = RegisterForm(request.POST)
        if form.is_valid():
            confirmation_code = f"{random.randint(100000, 999999)}"
            request.session['user_register_data'] = request.POST
            email = form.cleaned_data.get('email')
            request.session['confirmation_code'] = confirmation_code
            print(EMAIL_HOST_USER)
            send_mail(
                    'Верифікація електронної пошти',
                    f'Ваш код {confirmation_code}',
                    EMAIL_HOST_USER,
                    [email]
                )
            return JsonResponse({
                    "success": True,
                    "message": "Реєстрація успішна",
                    "email" : email
                })
        
        return JsonResponse(
            {
                "success": False,
                "errors": form.errors.get_json_data(),
            },
            status = 400
            )

class LoginView(View):
    def post(self, request, *args, **kwargs):
        form = LoginForm(request, data = request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            if user.username == '':
               return JsonResponse({
                        "success": True,
                        "message": "Авторизація успішна",
                        "redirect_url": reverse('home') + "?tab=first_login"
                    }) 
            return JsonResponse({
                        "success": True,
                        "message": "Авторизація успішна",
                        "redirect_url": reverse('home')
                    })
        
        return JsonResponse(
            {
                "success": False,
                "errors": form.errors.get_json_data(),
            },
            status = 400
            )

class ConfirmEmailView(View):
    def post(self, request, *args, **kwargs):
        form = ConfirmEmailForm(data = request.POST)
        user_register_data = request.session.pop('user_register_data', None)

        if form.is_valid():
            if form.cleaned_data.get('code') == request.session['confirmation_code']:
                if user_register_data:
                    register_form = RegisterForm(data = user_register_data) 
                    register_form.save()
                    
                return JsonResponse({
                        "success": True,
                        "message": "Код підтвержено",
                        "redirect_url": reverse('auth') + "?tab=login"
                    })
            return JsonResponse(
                {
                    "success": False,
                    "errors": "Невірний код",
                },
                status = 400
                )
        return JsonResponse(
            {
                "success": False,
                "errors": form.errors.get_json_data(),
            },
            status = 400
            )


class FriendsView(TemplateView):
    template_name = "user_app/friends.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        current_user = self.request.user
        context["sections"] = {
            "requests": {"title": "Запити", "users": get_friendship_requests(current_user)[:6]},
            "recommendations": {"title": "Рекомендації", "users": get_friends_recommendations(current_user)[:6]},
            "friends": {"title": "Всі друзі", "users": get_friends(current_user)[:6]}
        }
        return context
    
class FriendSectionView(View):
    def get(self, request, section, *args, **kwargs):
        if section == "requests":
            users = get_friendship_requests(request.user)
        elif section == "recommendations":
            users = get_friends_recommendations(request.user)
        else:
            users = get_friends(request.user)

        page_obj = Paginator(users, 6).get_page(request.GET.get("page", 1))           
        html = render_to_string("user_app/particles/friends/friends_cards.html",
                                {"users": page_obj.object_list, "section": section},
                                request=request
                                )
        
        return JsonResponse({"html": html, "has_next_page": page_obj.has_next()})
                    
class FriendActionView(View):

    def post(self, request, other_user_id, action, *args, **kwargs):
        other_user = User.objects.get(id=other_user_id)
        current_user = request.user

        if action == "add":
            return JsonResponse(add_friend_request(current_user, other_user))
        
        if action == "dismiss":
            return JsonResponse(dismiss_recommendation(current_user, other_user))
        
        if action == "delete":
            return JsonResponse(delete_friendship(current_user, other_user))
        
        if action == "accept":
            action_result = accept_friend_request(current_user, other_user)
            action_result["friend_html"] = render_to_string(
                "user_app/particles/friends/friends_cards.html",
                {"users": [action_result["friend"]], "section": "friends"},
                request=request
            )
            del action_result["friend"]
            return JsonResponse(action_result)

class FriendListView(ListView):
    template_name = 'user_app/person_page.html'
   
    paginate_by = 5

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        person_id = self.request.GET.get("person_id")
        current_user = self.request.user
        other_user = User.objects.get(id = person_id)
        context['posts'] = Post.objects.filter(author_id = person_id).order_by('-id')
        context['person'] = other_user
        context['status'] = get_friendship_status(current_user, other_user)
        return context
    
    def get_queryset(self):
        person_id = self.request.GET.get("person_id")
        if not person_id:
            return self.get_queryset()
        return Post.objects.filter(author_id = person_id)
    
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
                'html': render_to_string("particles/show_post.html", {'posts': page_obj.object_list})
            })
        
        return super().get(request, *args, **kwargs)
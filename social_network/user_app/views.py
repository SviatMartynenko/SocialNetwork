from django.views.generic.base import TemplateView, View
from django.shortcuts import redirect
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponse
from .forms import RegisterForm, LoginForm, ConfirmEmailForm
from django.urls import reverse
from django.core.mail import send_mail
from social_network.settings import EMAIL_HOST_USER
import random

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
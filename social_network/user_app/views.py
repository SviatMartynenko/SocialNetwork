from django.views.generic.base import TemplateView, View
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponse
from .forms import RegisterForm, LoginForm, ConfirmEmailForm
from django.urls import reverse
from django.core.mail import send_mail
from social_network.settings import EMAIL_HOST_USER
import random

class AuthTemplateView(TemplateView):
    template_name = "user_app/auth.html"

    
    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        register_data = self.request.session.pop('register_form_data', None)
        login_data = self.request.session.pop('login_form_data', None)
        if register_data:
            form_register = RegisterForm(register_data)
            context["form_register"] = form_register
        else:
            context["form_register"] = RegisterForm()
        
        if login_data:
            form_login = LoginForm(login_data)
            context["form_login"] = form_login
        else:
            context["form_login"] = LoginForm()
        
        context["form_confirm"] = ConfirmEmailForm()
        return context

class RegisterView(View):
    def post(self, request, *args, **kwargs):
        form = RegisterForm(request.POST)
        if form.is_valid():
            code = f'{random.randint(100000,999999)}'
            request.session['code'] = code
            email = form.cleaned_data.get('email')
            form.save()
            send_mail(
                    'Верифікація електронної пошти',
                    f'Ваш код {code}',
                    EMAIL_HOST_USER,
                    [email]
                )
            return JsonResponse({
                    "success": True,
                    "message": "Реєстрація успішна"
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
        form = LoginForm(data = request.POST)
        if form.is_valid():
            user = form.get_user() 
            login(request, user)
            return JsonResponse({
                        "success": True,
                        "message": "Реєстрація успішна",
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
        if form.is_valid():
            if form.cleaned_data.get('code') == request.session['code']:
                
                return JsonResponse({
                        "success": True,
                        "message": "Реєстрація успішна",
                        "redirect_url": reverse('auth') + "?tab=login"
                    })
            return JsonResponse(
            {
                "success": False,
                "errors": 'Невірний код',
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
from django.shortcuts import render
from django.views.generic.base import TemplateView, View
from django.shortcuts import redirect
from django.contrib.auth import login
from .forms import RegisterForm, LoginForm


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
        
        context["form_confirm"] = ''
        return context

class RegisterView(View):
    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    
        request.session['register_form_data'] = request.POST
        return redirect('auth')

class LoginView(View):
    def post(self, request):
        form = LoginForm(data = request.POST)
        if form.is_valid():
            user = form.get_user() # Получаем объект пользователя
            login(request, user)
            return redirect('home')
        
        request.session['login_form_data'] = request.POST
        return redirect('auth')
    
# class ConfirmEmailView(View):
#     def post(self, request):
#         form = RegisterForm(request.POST)
#         if form.is_valid():
#             form.save()
#             return redirect('home')
        
#         return redirect('auth')
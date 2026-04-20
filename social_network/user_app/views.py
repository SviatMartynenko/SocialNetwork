from django.shortcuts import render
from django.views.generic.base import TemplateView
from .forms import RegisterForm

class AuthTemplateView(TemplateView):
    template_name = "user_app/auth.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form_register"] = RegisterForm()
        context["form_login"] = ''
        context["form_confirm"] = ''
        return context

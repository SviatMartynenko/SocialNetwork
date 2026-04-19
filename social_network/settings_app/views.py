from django.shortcuts import render
from django.views.generic.base import TemplateView

class SettingsPageView(TemplateView):
    template_name = "settings_app/settings.html"
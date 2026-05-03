from django.urls import reverse, reverse_lazy
from django.shortcuts import redirect
from django.views.generic.base import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse

from .forms import FirstLoginForm


class HomePageView(TemplateView):
    template_name = "home_app/home.html"

    def dispatch(self, request, *args, **kwargs):
        user = request.user
        
        if user.username == "" and request.GET.get('tab') != 'first_login': 
            return redirect(reverse('home') + '?tab=first_login')
        
        if user.username != "" and request.GET.get('tab') == 'first_login':
            return redirect('home')
        
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        
        context["first_login_form"] = FirstLoginForm()

        return context

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
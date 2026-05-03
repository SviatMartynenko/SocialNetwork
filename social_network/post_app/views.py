from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views.generic import FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .forms import PostForm

# class PostPageView(TemplateView):
#     template_name = "post_app/my_posts.html"

class PostCreateView(FormView):
    template_name = "post_app/my_posts.html"
    form_class = PostForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method == 'POST':
            kwargs['links'] = self.request.POST.getlist('links')
            kwargs['images'] = self.request.POST.getlist('links')
        return kwargs
        
    def form_valid(self, form: PostForm):
        post = form.save()
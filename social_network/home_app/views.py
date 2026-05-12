from django.urls import reverse, reverse_lazy
from django.shortcuts import redirect
from django.views.generic import TemplateView, View, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string

from post_app.models import Post
from post_app.forms import PostForm, AddTagForm
from .forms import FirstLoginForm


class HomePageView(ListView):
    model = Post
    template_name = "home_app/home.html"
    context_object_name = 'posts'
    paginate_by = 5

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
        context["first_login_form"] = FirstLoginForm()
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
                'html': render_to_string('post_app/particles/show_post.html', {'posts': page_obj.object_list})
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
    
from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views.generic import FormView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.urls import reverse
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.core.paginator import Paginator

from .forms import PostForm
from .models import Post


class PostListView(ListView, LoginRequiredMixin):
    # model = Post
    template_name = 'post_app/my_posts.html'
    # context_object_name = 'posts'
    paginate_by = 5
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_create_post'] = PostForm()
        context['posts'] = Post.objects.filter(author_id = self.request.user)[:self.paginate_by]
        return context
    def get_queryset(self):
        return Post.objects.filter(author_id = self.request.user)
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
    
class PostCreateView(LoginRequiredMixin, FormView):
    form_class = PostForm
    success_url = reverse_lazy('my_posts')
    login_url = reverse_lazy('auth')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method == 'POST':
            kwargs['links'] = self.request.POST.getlist('links')
            kwargs['images'] = self.request.FILES.getlist('images')
            
        return kwargs
    def form_valid(self, form: PostForm):
        post = form.save(author= self.request.user)
        print(post)
        return JsonResponse(
            {
                'success': True,
                'message': 'Публікацію створено успішно',
                'redirect_url': reverse('my_posts'),
                'post_id': post.id
            }
        )
    def form_invalid(self, form: PostForm):
        return JsonResponse(
            {
                "success" : False,
                'errors': form.errors.get_json_data()
            },
            status = 400
        )
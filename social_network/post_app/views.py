from django.views.generic import FormView, ListView
from django.urls import reverse_lazy
from django.urls import reverse
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.core.paginator import Paginator

from .forms import PostForm, AddTagForm
from .models import Post


class PostListView(ListView):
    # model = Post
    template_name = 'post_app/my_posts.html'
    # context_object_name = 'posts'
    paginate_by = 5
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_create_post'] = PostForm()
        context['form_add_tag'] = AddTagForm()
        context['posts'] = Post.objects.filter(author_id = self.request.user).order_by('-id')
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
    
class PostCreateView(FormView):
    form_class = PostForm
    success_url = reverse_lazy('my_posts')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method == 'POST':
            kwargs['links'] = self.request.POST.getlist('links')
            kwargs['images'] = self.request.FILES.getlist('images')
            
        return kwargs
    def form_valid(self, form: PostForm):
        post = form.save(author= self.request.user)
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

class AddTagView(FormView):
    form_class = AddTagForm

    def form_valid(self, form: AddTagForm):
        tag = form.save()
        return JsonResponse(
            {
                'success': True,
                'message': 'Тег створено успішно',
                "id": tag.id,
                "name": tag.name
            }
        )
    def form_invalid(self, form: AddTagForm):
        return JsonResponse(
            {
                "success" : False,
                'errors': form.errors.get_json_data()
            },
            status = 400
        )
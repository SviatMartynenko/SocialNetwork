from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from user_app.models import User

class ChatView(LoginRequiredMixin, TemplateView):
    template_name = 'chat_app/chat.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['friends'] = User.objects.exclude(id=self.request.user.id)
        return context
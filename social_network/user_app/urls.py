from django. urls import path
from .views import AuthTemplateView, RegisterView, LoginView, ConfirmEmailView

urlpatterns = [
    path('', AuthTemplateView.as_view(), name = 'auth'),
    path('register/', RegisterView.as_view(), name = 'register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('confirm_email/', ConfirmEmailView.as_view(), name = 'confirm_email')
]


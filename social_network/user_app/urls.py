from django. urls import path
from .views import AuthTemplateView

urlpatterns = [
    path('', AuthTemplateView.as_view(), name = 'auth')
]


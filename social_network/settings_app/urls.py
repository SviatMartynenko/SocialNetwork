from django. urls import path
from .views import SettingsPageView

urlpatterns = [
    path('', SettingsPageView.as_view(), name='settings'),
]
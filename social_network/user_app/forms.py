from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class RegisterForm(UserCreationForm):
    password1 = forms.CharField(label="Пароль")
    password2 = forms.CharField(label="Підтвердити пароль")
    class Meta:
        model = User
        fields = ['email']
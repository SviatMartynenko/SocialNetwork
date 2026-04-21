from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User

class RegisterForm(UserCreationForm):
    password1 = forms.CharField(
            label="Пароль",
            widget = forms.PasswordInput(attrs = {'class': 'form-field'})
        )
    password2 = forms.CharField(
            label="Підтвердити пароль",
            widget = forms.PasswordInput(attrs = {'class': 'form-field'})
        )
    class Meta:
        model = User
        fields = ['email','password1', 'password2']
        widgets = {
            'email': forms.EmailInput(attrs = {'class': 'form-field'})
        }

class LoginForm(AuthenticationForm):
    username = forms.CharField(widget = forms.TextInput(attrs = {'class': 'form-field'}))
    password = forms.CharField(widget = forms.PasswordInput(attrs = {'class': 'form-field'}))
        
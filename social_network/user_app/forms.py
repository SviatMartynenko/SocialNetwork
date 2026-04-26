from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model, authenticate
from .models import User
user = get_user_model()

class RegisterForm(forms.ModelForm):
    password1 = forms.CharField(
            label="Пароль",
            widget = forms.PasswordInput(attrs = {
                    'class': 'form-field',
                    'placeholder': 'Введи пароль'
                })
        )
    password2 = forms.CharField(
            label="Підтвердити пароль",
            widget = forms.PasswordInput(attrs = {
                'class': 'form-field',
                'placeholder': 'Повтори пароль'
                })
        )
    class Meta:
        model = user
        fields = ['email']
        labels = {
            'email': "Електронна пошта"
        }
        widgets = {
            'email': forms.EmailInput(attrs = {
                'class': 'form-field',
                'placeholder': 'you@example.com'
            })
        }
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if user.objects.filter(email = email).exists():
            raise forms.ValidationError('Користувач з такою електронною поштою вже існує')
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Паролі не співпадають')
        return cleaned_data
    
    def save(self, commit = True):
        user : User = super().save(commit = False) 
        user.username = ''
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()

class LoginForm(AuthenticationForm):
    username = forms.EmailField(
        label = "Електронна пошта",
        widget = forms.TextInput(attrs = {
        'class': 'form-field',
        'placeholder': 'you@example.com'
        }))
    password = forms.CharField(
        label="Пароль",
        widget = forms.PasswordInput(attrs = {
        'class': 'form-field',
        'placeholder': 'Введи пароль'
        }))


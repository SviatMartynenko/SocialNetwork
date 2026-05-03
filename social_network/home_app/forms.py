from django import forms
from django.contrib.auth import get_user_model

user = get_user_model()

class FirstLoginForm(forms.ModelForm):
    username = forms.CharField(
            max_length = 255, 
            min_length = 1,
            label = "Ім’я користувача",
            widget = forms.TextInput(attrs = {
                'class': 'form-field',
                'placeholder': '@'
            })
        )
    first_name = forms.CharField(
            max_length = 255, 
            min_length = 1,
            label = "Псевдонім автора",
            widget = forms.TextInput(attrs = {
                'class': 'form-field',
                'placeholder': 'Введіть Псевдонім автора'
            })
        )
    
    class Meta:
        model = user
        fields = ('username', 'first_name')

    def clean_username(self):
        username = self.cleaned_data['username']
        if user.objects.filter(username = username).exists():
            raise forms.ValidationError("Користувач з таким ім'ям вже існує")
        return username
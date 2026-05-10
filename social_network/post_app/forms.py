from django import forms
from io import BytesIO
from django.core.files.base import ContentFile
from .models import *
from PIL import Image

MAX_COMPRESSED_IMAGE_SIZE = 5 * 1024 * 1024

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def clean(self, data, initial = None):
        single_file_clean = super().clean

        if isinstance(data, (list, tuple)):
            return [single_file_clean(data= file, initial= initial) for file in data]
        return single_file_clean(data= data, initial= initial)
    

class PostForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        required = False,
        queryset = PostTag.objects.all(),
        widget = forms.CheckboxSelectMultiple
    )

    images = MultipleFileField(
        label = "",
        required = False,
        widget = MultipleFileInput(attrs={"multiple": True, "accept": "image/*","class": "images-input"})
    )

    class Meta:
        model = Post
        fields = ("title", "topic", "tags", "content")
        labels = {
            "title": "Заголовок публікації",
            "topic": "Тема публікації",
        }
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Напишіть заголовок публікації',"class": "text-input"}),
            'topic': forms.TextInput(attrs={'placeholder': 'Напишіть тему публікації',"class": "text-input"}),
            'content': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Текст посту'})
        }

    def __init__(self, *args, links = None, images = None, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super().__init__(*args, **kwargs)

        self.fields['tags'].queryset = PostTag.objects.all()

        self.links_list = []
        self.images_list = []

        if links:
            for link in links:
                clean_link = link.strip()
                
                if clean_link:
                    self.links_list.append(clean_link)
                
        if images:
            self.images_list = list(images)
            
    def clean(self):
        cleaned_data = super().clean()
        
        url_field =  forms.URLField()
        image_field = forms.ImageField()
        
        for link in self.links_list:
            try:
                url_field.clean(link)
            except forms.ValidationError:
                self.add_error('links', f"Некоректне посилання: {link}")
        
        for image in self.images_list:
            try:
                image_field.clean(image)
            except forms.ValidationError:
                self.add_error('images', f"Завантажте коректне зображення")
        
        return cleaned_data
    
    def save(self, author, commit= True):
        post: Post = super().save(commit= False)
        post.author = author
        
        if commit:
            post.save()
            
            post.tags.set(self.cleaned_data['tags'])
            
            for url in self.links_list:
                PostLink.objects.create(post= post, url= url)
            for image in self.images_list:
                PostImage.objects.create(
                    post= post,
                    original = image,
                    compressed = self._compressed_image(image)
                )
                
        return post
    
    def _compressed_image(self, image):
        
        image.seek(0)
        compressed_image = Image.open(image)
        compressed_image = compressed_image.convert("RGB")
        
        quality = 85
        width, height = compressed_image.size
        
        while True:
            buffer = BytesIO()
            compressed_image.save(fp= buffer, format= 'JPEG', quality= quality, optimize= True)
            
            if buffer.tell() <= MAX_COMPRESSED_IMAGE_SIZE:
                break
            
            if quality > 35:
                quality -= 10
            else:
                if width <= 1 or height <= 1:
                    break
                # Якщо якість вже низька, зменшуємо зображення на 10%
                width = int(width * 0.9)
                height = int(height * 0.9)
                compressed_image = compressed_image.resize((width, height), Image.Resampling.LANCZOS)
                
        image.seek(0)
        
        compressed_name = f'compressed_{image.name.rsplit('.', 1)[0]}.jpg'
        
        return ContentFile(buffer.getvalue(), name= compressed_name)
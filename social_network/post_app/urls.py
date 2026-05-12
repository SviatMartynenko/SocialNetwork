from django. urls import path
from .views import PostCreateView, PostListView, AddTagView

urlpatterns = [
    path(route= '', view= PostListView.as_view(), name= 'my_posts'),
    path(route= 'create/', view= PostCreateView.as_view(), name= 'create_post'),
    path(route = 'add_tag', view = AddTagView.as_view(), name = 'add_tag')
]

from chat_app.models import Chat
from django.contrib.auth import get_user_model
from user_app.services.friend_queries import get_friends


User = get_user_model()

def get_or_create_chat(request, user_id):
        current_user = request.user
        other_user = User.objects.get(id=user_id)

        friends = get_friends(current_user) 
        if other_user not in friends:
            print(0)
            return {"success": False}
        current_user_chat_ids = Chat.objects.filter(
            users=current_user,
            is_group = False,
            ).values_list("id", flat=True)
        
        chat = Chat.objects.filter(
            id__in=current_user_chat_ids,
            users=other_user, 
            is_group=False
            ).first()
        
        if chat is None:
            chat = Chat.objects.create(is_group=False)
            chat.users.add(current_user, other_user)
            
        return {'success': True, 'chat_id': chat.id}
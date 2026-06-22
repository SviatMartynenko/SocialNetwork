from chat_app.models import Chat
from django.contrib.auth import get_user_model
from user_app.services.friend_queries import get_friends
from django.http import HttpRequest


User = get_user_model()



def get_or_create_chat(request, user_id):
    current_user = request.user
    other_user = User.objects.get(id=user_id)

    friends = get_friends(current_user) 
    if other_user not in friends:
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


def create_group(request: HttpRequest):
    name = request.POST.get("name", "").strip()
    user_ids  = request.POST.getlist("users")
    avatar = request.FILES.get("avatar", "")
    if not name:
        return {"success": False, "error": "name required"}
    
    friend_ids = get_friends(request.user).filter(id__in=user_ids).values_list("id", flat=True)

    if len(friend_ids) < 2:
        return {"success": False, "error": "group_minimum_participants"}

    chat = Chat.objects.create(name=name, is_group=True, admin=request.user, avatar = avatar)

    chat.users.add(request.user)

    chat.users.add(*User.objects.filter(id__in=friend_ids) )

    return {
        "success": True,
        'chat_id': chat.id,
        "name": name,
        "members_amount": chat.users.count(),
    }
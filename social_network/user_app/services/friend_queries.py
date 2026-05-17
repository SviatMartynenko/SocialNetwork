from user_app.models import User


def get_friendship_requests(current_user):
    return (User.objects.
            filter(
                sent_friendships__to_user=current_user,
                sent_friendships__status = "pending"
                ).
            order_by("-id"))

def get_friends(current_user):
    sent_friend_ids = list(current_user.sent_friendships.filter(status="accepted").values_list("to_user_id", flat=True))
    received_friend_ids = list(current_user.received_friendships.filter(status="accepted").values_list("from_user_id", flat=True))
    friends_ids = sent_friend_ids + received_friend_ids
    friends = User.objects.filter(id__in=friends_ids).order_by("-id")
    return friends

def get_friends_recommendations(current_user):
    sent_busy_ids = list(current_user.sent_friendships.values_list("to_user_id", flat=True))
    received_busy_ids = list(current_user.received_friendships.values_list("from_user_id", flat=True))
    busy_ids = sent_busy_ids + received_busy_ids + [current_user.id]
    recommendation_users = User.objects.exclude(id__in=busy_ids).order_by("-id")
    return recommendation_users
const headerUnreadCount = document.getElementById("total-badge");
const homeUnreadCount = document.getElementById("total-badge-home");
const friendsHeaderCount = document.getElementById("friends-badge");
const friendsHomeCount = document.getElementById("friends-home-badge");
const personalUnreadCount = document.getElementById("personal-badge");
const groupUnreadCount = document.getElementById("group-badge");

let personalUnread = 0;
let groupUnread = 0;
let friendRequestsTotal = 0;

function updateHeaderBadges() {
    const total = personalUnread + groupUnread;

    renderBadge(headerUnreadCount, total);
    renderBadge(homeUnreadCount, total);

    renderBadge(friendsHeaderCount, friendRequestsTotal);
    renderBadge(friendsHomeCount, friendRequestsTotal);

    renderBadge(personalUnreadCount, personalUnread);
    renderBadge(groupUnreadCount, groupUnread);
}

function renderBadge(el, value) {
    if (!el) return;

    if (value > 0) {
        el.classList.add("badge--count");
        el.classList.remove("badge--dot");

        el.textContent = value > 99 ? "99+" : value;
    } else {
        el.classList.remove("badge--count");
        el.classList.remove("badge--dot");
        el.textContent = "";
    }
}

function updateChatButton(chat) {

    const button = document.querySelector(
        `.chat-user-button[data-chat-id="${chat.id}"],
         .chat-group-button[data-chat-id="${chat.id}"]`
    );

    if (!button) return;

    const lastMessage = button.querySelector(".last-message-text");

    if (lastMessage) {
        lastMessage.textContent = chat.last;
    }

    if (chat.unread > 0) {
        button.classList.add("chat-has-unread");
    } else {
        button.classList.remove("chat-has-unread");
    }
}

function showUnreadData(data) {
    console.log(data);

    personalUnread = data.personal_total;
    groupUnread = data.group_total;
    friendRequestsTotal = data.friend_requests_total || 0;

    updateHeaderBadges();

    data.chats.forEach((chat) => {
        updateChatButton(chat);
    });
}

const unreadSocket = new WebSocket(`ws://${window.location.host}/chat/unread/`);

unreadSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    showUnreadData(data);
};

function updateUnreadData() {
    unreadSocket.send("{}");
}

window.updateUnreadData = updateUnreadData;
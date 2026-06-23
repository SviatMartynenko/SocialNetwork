const onlineSocket = new WebSocket(`ws://${window.location.host}/chat/online/`);
window.chatOnlineUsers = window.chatOnlineUsers || new Set();

function setUserOnlineStatus(userId, status) {
    const userIdStr = String(userId);
    const indicators = document.querySelectorAll(`.status-indicator[data-user-id="${userIdStr}"]`);

    if (status === "online") {
        window.chatOnlineUsers.add(userIdStr);
        indicators.forEach((indicator) => indicator.classList.add("status-indicator--online"));
    } else {
        window.chatOnlineUsers.delete(userIdStr);
        indicators.forEach((indicator) => indicator.classList.remove("status-indicator--online"));
    }

    if (typeof window.updateChatHeaderStatus === "function") {
        window.updateChatHeaderStatus();
    }
}

onlineSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.user_id && data.status) {
        setUserOnlineStatus(data.user_id, data.status);
    }
};
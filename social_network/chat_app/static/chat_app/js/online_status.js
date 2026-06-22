const onlineSocket = new WebSocket(`ws://${window.location.host}/chat/online/`);

onlineSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const userButtons = document.querySelector(".chat-list").querySelectorAll(`[data-chat-user="${data.user_id}"]`);
    userButtons.forEach((button) => {
        const username = button.dataset.chatUsername;

        const lastMessageHeader = button.querySelector(".last-message-header");
        const createdAt = lastMessageHeader.querySelector(".created-at");
        const usernameText = data.status == "online" ? `${username} (у мережі)` : username;

        if (createdAt) {
            lastMessageHeader.innerHTML = `${usernameText}${createdAt.outerHTML}`;
        } else {
            lastMessageHeader.textContent = usernameText;
        }
    });
    
};
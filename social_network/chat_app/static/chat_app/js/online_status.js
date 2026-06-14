const onlineSocket = new WebSocket(`ws://${window.location.host}/chat/online/`);

onlineSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const userButtons = document.querySelector(".chat-list").querySelectorAll(`[data-chat-user="${data.user_id}"]`);
    userButtons.forEach((button) => {
        const username = button.dataset.chatUsername;

        if (data.status == "online") {
            button.querySelector(".last-message-header").textContent = `${username} (у мережі)`;
        } else{
            button.querySelector(".last-message-header").textContent = username;
        }
    });
    
};
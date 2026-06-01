let chatSocket = null;
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const chatTitle = document.querySelector("#chatTitle");
const chatStatus = document.querySelector("#chatStatus");
const chatButtons = document.querySelectorAll(".chat-person-profile");
const chatWindow = document.getElementById("chatWindow");
const messages = document.getElementById("messages");
const messageForm= document.getElementById("messageForm");
const messageInput= document.getElementById("messageInput");

async function openChatWithUser(userId, username) {
    const response = await fetch(`/chat/chat_with/${userId}/`, {
        method: "POST",
        headers: {"X-CSRFToken": csrfToken },
    });
    const data = await response.json();

    if (data.success) {
        chatTitle.textContent = `Чат з ${username}`;
        chatWindow.classList.add("is-open");
        chatStatus.hidden = true;
        messages.innerHTML = "";
        connectWebsocket(data.chat_id);
    }
}

function createMessage(){

}

function connectWebsocket(chatId) {
    console.log("Підключаємося до чату")
    chatSocket = new WebSocket(`ws://${window.location.host}/chat/${chatId}/`);
    chatSocket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        console.log(data);
        if (data.action == "chat_message") {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.textContent = `${data.sender}: ${data.message_text}`;
            messages.appendChild(messageElement);
        }
    };
}

chatButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        await openChatWithUser(
            button.dataset.chatUser,
            button.dataset.chatUsername,
        );
        chatWindow.style.display = 'flex';
    });
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText) {
        chatSocket.send(JSON.stringify({ messageText: messageText }));
    }
});
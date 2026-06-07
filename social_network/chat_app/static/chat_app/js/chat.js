let chatSocket = null;
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const chatTitle = document.querySelector("#chatTitle");
const chatStatus = document.querySelector("#chatStatus");
const chatButtons = document.querySelectorAll(".chat-person-profile");
const chatWindow = document.getElementById("chatWindow");
const messages = document.getElementById("messages");
const messageForm= document.getElementById("messageForm");
const messageInput= document.getElementById("messageInput");

function padDateNumber(number) {
  return String(number).padStart(2, "0");
}

function getMessageDate(createdAt) {
  if (!createdAt) {
    return new Date();
  }
  return new Date(createdAt);
}

function formatMessageTime(createdAt) {
  const date = getMessageDate(createdAt);
  return `${padDateNumber(date.getHours())}:${padDateNumber(date.getMinutes())}`;
}

window.formatMessageTime = formatMessageTime;

function formatMessageDate(createdAt) {
  const date = getMessageDate(createdAt);
  return `${padDateNumber(date.getDate())}:${padDateNumber(date.getMonth()+ 1)}:${padDateNumber(date.getFullYear())}`;
}

window.formatMessageDate = formatMessageDate;

function renderDateSeparator(dateText) {
  const separator = document.createElement("div");
  separator.classList.add("message-date-separator");
  const dateContainer = document.createElement("div");
  dateContainer.classList.add("message-date-separator-content");
  dateContainer.textContent = dateText;
  separator.appendChild(dateContainer);
  return separator;
}

function updateDateSeparators() {
  const dateSeparators = document.querySelectorAll(".message-date-separator");
  dateSeparators.forEach((separator) => {
    separator.remove();
  });

  let previousDate = "";
  const allMessages = document.querySelectorAll(".message");

  allMessages.forEach((message) => {
    const messageDate = message.dataset.messageDate;
    if (messageDate !== previousDate) {
      message.before(renderDateSeparator(messageDate));
      previousDate = messageDate;
    }
  });
}

window.updateDateSeparators = updateDateSeparators;

async function openChatById(chatId, title) {
    chatTitle.textContent = `Чат з ${title}`;
    chatWindow.classList.add("is-open");
    chatStatus.hidden = true;
    messages.innerHTML = "";
    connectWebsocket(chatId);
    window.resetMessages(chatId);
    await loadMessages();
    startObserver();
}

async function openChatWithUser(userId, username) {
    const response = await fetch(`/chat/chat_with/${userId}/`, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
    });
    const data = await response.json();

    if (data.success) {
        openChatById(data.chat_id, username);
    }
}

function bindGroupChatButtons() {
    const groupButtons = document.querySelectorAll(".chat-group-button");

    groupButtons.forEach((button) => {
        if (button.dataset.groupButtons == "true") return;

        button.dataset.groupButtons = "true";
        button.addEventListener("click", () => {
            openChatById(button.dataset.chatId, button.dataset.chatTitle); 
        });
    });
}

bindGroupChatButtons();
window.openChatById = openChatById;
window.bindGroupChatButtons = bindGroupChatButtons;

function connectWebsocket(chatId) {
    console.log("Підключаємося до чату");
    if (chatSocket) {
        chatSocket.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    chatSocket = new WebSocket(
        `${protocol}://${window.location.host}/chat/${chatId}/`,
    );
    chatSocket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        console.log(data);
        if (data.action == "chat_message") {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");

            const messageBody = document.createElement("div");
            messageBody.classList.add("message-body");
            
            const messageSender = document.createElement("p");
            messageSender.classList.add("message-sender");
            
            const messageContent = document.createElement("div");
            messageContent.classList.add("message-content");

            const messageMeta = document.createElement("div");
            messageMeta.classList.add("message-meta");

            const messageMetaTime = document.createElement("p");
            messageMetaTime.classList.add("message-meta-time");

            const messageMetaStatus = document.createElement("div");
            messageMetaStatus.classList.add("message-meta-status");
            
            messageSender.textContent = `${data.sender}`;   
            messageMetaTime.textContent = `${formatMessageTime(data.created_at)}`;
            messageContent.textContent = `${data.message_text}`

            messageBody.appendChild(messageSender);
            messageBody.appendChild(messageContent);
            messageElement.appendChild(messageBody);
            messageMeta.appendChild(messageMetaTime);
            messageMeta.appendChild(messageMetaStatus);
            messageElement.appendChild(messageMeta);
            messages.appendChild(messageElement);
        }
        window.updateDateSeparators()
    };
}

chatButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        await openChatWithUser(
            button.dataset.chatUser,
            button.dataset.chatUsername,
        );
    });
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText && chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({ messageText: messageText }));
        messageInput.value = "";
    }
});

let chatSocket = null;
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const chatTitle = document.querySelector("#chatTitle");
const chatStatus = document.querySelector("#chatStatus");
const profileButtons = document.querySelectorAll(".chat-person-profile");
const chatButtons = document.querySelectorAll(".chat-user-button");
const chatWindow = document.getElementById("chatWindow");
const messages = document.getElementById("messages");
const messageForm= document.getElementById("messageForm");
const messageInput= document.getElementById("messageInput");
const messageProfiles = document.querySelector(".message-profile");
const filterUserChat = document.getElementById("FilterUserChat");
const sideBlockList = document.querySelector(".chat-profiles");
const searchUsers = document.querySelector(".search-users");
const groupFriends = document.querySelector(".group-friends");
const chatHeader = document.querySelector(".chat-header-div");
const chatTextDiv = document.querySelector(".chat-text-div");
const months = [
    { value: 1, name: "Січня" },
    { value: 2, name: "Лютого" },
    { value: 3, name: "Березня" },
    { value: 4, name: "Квітня" },
    { value: 5, name: "Травня" },
    { value: 6, name: "Червня" },
    { value: 7, name: "Липня" },
    { value: 8, name: "Серпня" },
    { value: 9, name: "Вересня" },
    { value: 10, name: "Жовтня" },
    { value: 11, name: "Листопада" },
    { value: 12, name: "Грудня" }
];

filterUserChat.addEventListener('input', async (event) => {
    const queryValue = event.target.value;
    const response = await fetch(`/chat/filter_chats/?value=${queryValue}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'method': "GET"
            }
        });

        const data = await response.json();

        if (data.success) {
            sideBlockList.innerHTML = data.html_1;
        }
});

searchUsers.addEventListener('input', async (event) => {
    const queryValue = event.target.value;
    const response = await fetch(`/chat/filter_chats/?value=${queryValue}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'method': "GET"
            }
        });

        const data = await response.json();

        if (data.success) {
            groupFriends.innerHTML = data.html_2;
        }
});

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
  const month = months.find(item => item.value === (date.getMonth()+ 1))?.name
  return `${padDateNumber(date.getDate())} ${month} ${padDateNumber(date.getFullYear())}`;
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

async function openChatById(chatId, title, members = 0) {

    chatTextDiv.classList.add("hide");
    chatHeader.classList.add("show");
    chatHeader.dataset.chatId = chatId;

    let groupStatus = ""
    if (members > 0){
        groupStatus = `${members} учасників`;
    }

    chatHeader.innerHTML = `
    <div class = "chat-header-left">
        <div class = "chat-header-back-btn">
            <img class = "img-cover chat-header-back-btn-img">
        </div>
        <div class= "chat-header-meta">
            <div class = "chat-header-meta-img-container">
                <img class = "chat-header-meta-img img-cover">
            </div>
            <div class = "chat-header-text">
                <p class = "chat-name"></p>
                <p class = "chat-status">${groupStatus}</p>
            </div>
        </div>
    </div>
    <div class = "chat-header-action-btn">
        <img class = "img-cover chat-header-action-btn-img">
    </div>
    `;
    chatHeader.querySelector(".chat-header-back-btn-img").src = chatHeader.dataset.back;
    chatHeader.querySelector(".chat-header-action-btn-img").src = chatHeader.dataset.action;
    chatHeader.querySelector(".chat-header-meta-img").src = chatHeader.dataset.defaultAvatar;
    chatHeader.querySelector(".chat-name").textContent = title;
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
            openChatById(button.dataset.chatId, button.dataset.chatTitle, button.dataset.membersAmount); 

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
            const userUsername= chatWindow.dataset.userUsername;

            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            if(data.sender === userUsername){
                messageElement.classList.add("sender");
            }

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
            messageContent.textContent = `${data.message_text}`;

            messageBody.appendChild(messageSender);
            messageBody.appendChild(messageContent);
            messageElement.appendChild(messageBody);
            messageMeta.appendChild(messageMetaTime);
            messageMeta.appendChild(messageMetaStatus);
            messageElement.appendChild(messageMeta);
            messages.appendChild(messageElement);
            
            const userMessagesBlock = messageProfiles.querySelector(`[data-chat-id = "${chatId}"]`);
            if(userMessagesBlock){
                userMessagesBlock.querySelector(".last-message-text").textContent = `${data.message_text}`;
                userMessagesBlock.querySelector(".created-at").textContent = `${formatMessageTime(data.created_at)}`;
            }
            
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

profileButtons.forEach((button) => {
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


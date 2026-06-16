let chatSocket = null;
const urlParams = new URLSearchParams(window.location.search);
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
            }
        });

        const data = await response.json();

        if (data.success) {
            sideBlockList.innerHTML = data.html_1;
        }
});

async function getGroupMembers(chatId){
    const response = await fetch(`/chat/group_members/${chatId}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (data.success) {
            document.querySelector(".group-members").innerHTML = data.html;
            const deleteGroupMemberButtons = document.querySelectorAll(".delete-group-member");
            deleteGroupMemberButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    console.log(1)
                    deleteGroupMember(button.dataset.chatId, button.dataset.memberId)
                });
            });
        }
}

async function deleteGroupMember(chatId,userId){
    const response = await fetch(`/chat/group_members/${chatId}/${userId}/`, {
            method: "DELETE", 
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                "X-CSRFToken": csrfToken
            }
        });

        const data = await response.json();

        if (data.success) {
            document.querySelector(".group-members").innerHTML = data.html;
            const deleteGroupMemberButtons = document.querySelectorAll(".delete-group-member");
            deleteGroupMemberButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    console.log(1)
                    deleteGroupMember(button.dataset.chatId, button.dataset.memberId)
                });
            });
        }
}

searchUsers.addEventListener('input', async (event) => {
    const queryValue = event.target.value;
    const response = await fetch(`/chat/filter_chats/?value=${queryValue}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
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

    document.querySelectorAll('.chat-group-button, .chat-user-button').forEach(btn => {
        btn.classList.remove('active-chat');
    });

    const activeGroupBtn = document.querySelector(`.chat-group-button[data-chat-id="${chatId}"]`);
    const activeUserBtn = document.querySelector(`.chat-user-button[data-chat-id="${chatId}"]`);

    if (activeGroupBtn) {
        activeGroupBtn.classList.add('active-chat');
    }

    if (activeUserBtn) {
        activeUserBtn.classList.add('active-chat');
    }

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

    document.querySelectorAll('.chat-group-button, .chat-user-button').forEach(btn => {
    btn.classList.remove('active-chat');
    });

    const activeUserBtn = document.querySelector(`.chat-user-button[data-chat-user="${userId}"]`);
    if (activeUserBtn) {
        activeUserBtn.classList.add('active-chat');
    }

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
            getGroupMembers(button.dataset.chatId);
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
            messages.appendChild(window.renderMessage(data));
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

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = messageInput.value.trim();
  if (!messageText && !window.hasSelectedImages()) return;

  if (window.hasSelectedImages()) {
    const data = await window.sendMessageWithImages(messageText);
    if (!data.success) return;
    messageInput.value = "";
    window.clearSelectedImages();
    return;
  }

  chatSocket.send(JSON.stringify({ messageText: messageText }));
  messageInput.value = "";
});

chatHeader.addEventListener("click", (event) => {
    if (event.target.closest(".chat-header-action-btn")) {
        openSettingsModal();
    }
});


if (urlParams.has('userId') && urlParams.has('username')) {
    const userId = urlParams.get('userId').trim();
    const username = urlParams.get('username').trim();
    
    wiopenChatWithUser(usertId, username);
}
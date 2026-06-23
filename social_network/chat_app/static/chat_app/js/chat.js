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

function getOnlineCountForMembers(memberList) {
    if (!memberList) {
        return 0;
    }

    return memberList
        .split(',')
        .filter(Boolean)
        .filter((id) => window.chatOnlineUsers && window.chatOnlineUsers.has(String(id)))
        .length;
}

function updateChatHeaderStatus() {
    const chatHeader = document.querySelector(".chat-header-div");
    if (!chatHeader) {
        return;
    }

    const statusElement = chatHeader.querySelector(".chat-status");
    if (!statusElement) {
        return;
    }

    if (chatHeader.dataset.isGroup === "true") {
        const membersCount = Number(chatHeader.dataset.membersAmount) || 0;
        const onlineCount = getOnlineCountForMembers(chatHeader.dataset.groupMembers);
        statusElement.textContent = `${membersCount} учасників, ${onlineCount} в мережі`;
    } else if (chatHeader.dataset.chatUser) {
        const isOnline = window.chatOnlineUsers && window.chatOnlineUsers.has(String(chatHeader.dataset.chatUser));
        statusElement.textContent = isOnline ? "в мережі" : "не в мережі";
    } else {
        statusElement.textContent = "";
    }
}

window.updateChatHeaderStatus = updateChatHeaderStatus;

document.addEventListener('click', function(event) {
   
    const button = event.target.closest('#leaveGroupButton');
    if (button) {
        const chatHeader = document.querySelector(".chat-header-div");
        const chatButton = document.querySelector(`.chat-group-button[data-chat-id='${chatHeader.dataset.chatId}']`)
        const modal = document.querySelector(".modal-overlay");
        const textMessage = document.querySelector(".chat-text-div"); 
        deleteGroupMember(chatHeader.dataset.chatId, chatHeader.dataset.currentUserId);
        modal.style.display = "none";
        chatHeader.classList.remove("show");
        chatWindow.classList.remove("is-open");
        chatButton.remove();
        textMessage.classList.remove("hide");
    }
});

// filterUserChat.addEventListener('input', async (event) => {
//     const queryValue = event.target.value;
//     const response = await fetch(`/chat/filter_chats/?value=${queryValue}`, {
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest',
//             }
//         });

//         const data = await response.json();

//         if (data.success) {
//             sideBlockList.innerHTML = data.html_1;
//             bindUserChatButtons();
//         }
// });

window.pendingRemovedGroupMembers = new Set();

function attachGroupMemberRemovalButtons() {
    const deleteGroupMemberButtons = document.querySelectorAll(".delete-group-member");
    deleteGroupMemberButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            togglePendingGroupMemberRemoval(button);
        });
    });
}

function togglePendingGroupMemberRemoval(button) {
    const row = button.closest(".group-member-container");
    if (!row) {
        return;
    }

    const userId = button.dataset.memberId;
    if (window.pendingRemovedGroupMembers.has(userId)) {
        window.pendingRemovedGroupMembers.delete(userId);
        row.classList.remove("pending-remove");
        button.style.opacity = "1";
    } else {
        window.pendingRemovedGroupMembers.add(userId);
        row.classList.add("pending-remove");
        button.style.opacity = "0.35";
    }
}

async function getGroupMembers(chatId){
    const response = await fetch(`/chat/group_members/${chatId}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (data.success) {
            window.pendingRemovedGroupMembers.clear();
            document.querySelector(".group-members").innerHTML = data.html;
            attachGroupMemberRemovalButtons();
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

        if (!data.success) {
            return data;
        }

        if (data.chat_deleted) {
            const groupButton = document.querySelector(`.chat-group-button[data-chat-id="${chatId}"]`);
            if (groupButton) {
                groupButton.remove();
            }
            closeEditModal();
            closeSettingsModal();
            closeGroupAddModal();
            closeGroupModal();
            return data;
        }

        document.querySelector(".group-members").innerHTML = data.html;
        attachGroupMemberRemovalButtons();
        return data;
}
window.deleteGroupMember = deleteGroupMember;

window.saveGroupMemberRemovals = async function(chatId) {
    if (!chatId) {
        return;
    }

    const removedIds = Array.from(window.pendingRemovedGroupMembers);
    for (const userId of removedIds) {
        const data = await deleteGroupMember(chatId, userId);
        if (data && data.chat_deleted) {
            break;
        }
    }
    window.pendingRemovedGroupMembers.clear();
    if (chatId && document.querySelector(".group-members")) {
        await getGroupMembers(chatId);
    }
};

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
            bindUserChatButtons();
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

async function openChatById(chatId, title, members = 0, chatUserId = "", groupMembers = "") {

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
    chatHeader.dataset.chatUser = chatUserId;
    chatHeader.dataset.groupMembers = groupMembers;
    chatHeader.dataset.membersAmount = members;

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
                <p class = "chat-status"></p>
            </div>
        </div>
    </div>
    <div class = "chat-header-action-btn">
        <img class = "img-cover chat-header-action-btn-img">
    </div>
    `;
    chatHeader.dataset.chatTitle = title;
    const headerBackImg = chatHeader.querySelector(".chat-header-back-btn-img");
    const headerActionBtn = chatHeader.querySelector(".chat-header-action-btn");
    chatHeader.querySelector(".chat-header-action-btn-img").src = chatHeader.dataset.action;
    chatHeader.querySelector(".chat-header-meta-img").src = chatHeader.dataset.defaultAvatar;
    chatHeader.querySelector(".chat-name").textContent = title;

    if (members > 0) {
        headerActionBtn.hidden = false;
        chatHeader.dataset.isGroup = "true";
    } else {
        headerActionBtn.hidden = true;
        chatHeader.dataset.isGroup = "false";
    }

    headerBackImg.src = chatHeader.dataset.back;
    chatWindow.classList.add("is-open");
    chatStatus.hidden = true;
    messages.innerHTML = "";
    connectWebsocket(chatId);
    window.resetMessages(chatId);

    await loadMessages();
    
    if (window.updateUnreadData) {
        window.updateUnreadData();
    }
    updateChatHeaderStatus();
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
        openChatById(data.chat_id, username, 0, userId, "");
    }
}

function bindGroupChatButtons() {
    const groupButtons = document.querySelectorAll(".chat-group-button");

    groupButtons.forEach((button) => {
        if (button.dataset.groupButtons == "true") return;

        button.dataset.groupButtons = "true";
        button.addEventListener("click", () => {
            const chatHeader = document.querySelector(".chat-header-div");
            openChatById(
                button.dataset.chatId,
                button.dataset.chatTitle,
                button.dataset.membersAmount,
                "",
                button.dataset.groupMembers
            );
            getGroupMembers(button.dataset.chatId);
            chatHeader.dataset.groupMembers = button.dataset.groupMembers;
            chatHeader.dataset.adminId = button.dataset.adminId;
        });
    });
}

bindGroupChatButtons();
window.openChatById = openChatById;
window.bindGroupChatButtons = bindGroupChatButtons;

function bindUserChatButtons() {
    document.querySelectorAll(".chat-user-button").forEach((button) => {
        if (button.dataset.userButtons == "true") return;

        button.dataset.userButtons = "true";

        button.addEventListener("click", () => {
            openChatWithUser(
                button.dataset.chatUser,
                button.dataset.chatUsername,
            );
        });
    });
}

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
    if (event.target.closest(".chat-header-action-btn") && chatHeader.dataset.isGroup === "true") {
        openSettingsModal();
    }
});


if (urlParams.has('userId') && urlParams.has('username')) {
    const userId = urlParams.get('userId').trim();
    const username = urlParams.get('username').trim();
    
    wiopenChatWithUser(usertId, username);
}

function markChatAsRead(chatId, isGroup = false) {
    const button = document.querySelector(
        `.chat-user-button[data-chat-id="${chatId}"],
         .chat-group-button[data-chat-id="${chatId}"]`
    );

    if (button) {
        button.classList.remove("chat-has-unread");
    }

    unreadSocket.send(JSON.stringify({
        type: "mark_read",
        chat_id: chatId,
        is_group: isGroup
    }));

    updateUnreadData();
}
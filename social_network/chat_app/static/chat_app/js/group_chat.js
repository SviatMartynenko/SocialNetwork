// Знаходимо кнопку, яка відкриває модальне вікно створення групи.
const openGroupModalButton = document.querySelector("#open-group-modal");
// Знаходимо саме модальне вікно.
const groupModal = document.querySelector("#group-modal");
// Знаходимо перший крок модального вікна з вибором друзів.
const groupStepUsers = document.querySelector("#group-step-users");
// Знаходимо другий крок модального вікна з введенням назви.
const groupStepName = document.querySelector("#group-step-name");
// Знаходимо кнопку закриття на першому кроці.
const closeGroupModalButton = document.querySelector("#close-group-modal");
// Знаходимо кнопку закриття на другому кроці.
const closeGroupNameModalButton = document.querySelector(
  "#close-group-name-modal",
);
// Знаходимо кнопку скасування створення групи.
const cancelGroupModalButton = document.querySelector("#cancel-group-modal");
// Знаходимо кнопку переходу до другого кроку.
const nextGroupStepButton = document.querySelector("#next-group-step");
// Знаходимо кнопку повернення до вибору друзів.
const backGroupStepButton = document.querySelector("#back-group-step");
// Знаходимо кнопку фінального створення групи.
const createGroupButton = document.querySelector("#create-group");

const backGroupEditStepButton = document.querySelector("#back-group-edit-step");
const createGroupEditButton = document.querySelector("#create-edit-group");

// Знаходимо поле назви групового чату.
const createGroupNameInput = document.querySelector("#group-name");
const editGroupNameInput = document.querySelector("#group-edit-name");
// Знаходимо лічильник вибраних друзів.
const selectedCount = document.querySelector("#selected-count");
const groupError = document.querySelector("#group-error");
// Знаходимо блок, куди показуємо вибраних учасників на другому кроці.
const selectedUsersList = document.querySelector("#selected-users-list");
const editSelectedUsersList = document.querySelector("#selected-users-list");
// Знаходимо всі чекбокси друзів у модальному вікні.
const groupUserCheckboxes = document.querySelectorAll(".group-user-checkbox");

// Знаходимо список груп у правому блоці сторінки.
function getGroupList() {
  return document.querySelector("#group-list") || document.querySelector(".chat-list #group-list");
}

const modalOverlay = document.querySelector(".modal-overlay");

const groupSettingsModal = document.querySelector("#group-settings-modal");
const closeSettingsModalButton = document.querySelector("#close-settings-modal");
const deleteGroupChatButton = document.querySelector(".group-delete-div");

const groupSettingsAdmin = document.querySelector("#group-settings-admin");
const groupSettingsUser = document.querySelector("#group-settings-user");

const groupEditModal = document.querySelector("#group-edit-modal");
const openEditModalButton = document.querySelector("#open-group-edit-modal");
const closeEditModalButton = document.querySelector("#close-group-edit-modal");

function bindChatHeaderActionButton() {
  const headerActionBtn = chatHeader.querySelector(".chat-header-action-btn");
  if (!headerActionBtn || headerActionBtn.dataset.bound === "true") {
    return;
  }

  headerActionBtn.addEventListener("click", openSettingsModal);
  headerActionBtn.dataset.bound = "true";
}

const groupAddModal = document.querySelector("#group-add-modal");
const openGroupAddModalButton = document.querySelector("#group-add-participants-modal");
const cancelGroupAddModalButton = document.querySelector("#cancel-group-add-modal");
const closeGroupAddModalButton = document.querySelector("#close-group-add-modal");
const groupAddSearchInput = document.querySelector("#group-add-search");
const groupAddFriendsList = document.querySelector("#group-add-friends-list");
const selectedAddCount = document.querySelector("#selected-add-count");
const groupAddSaveButton = document.querySelector("#group-add-save-btn");

const addGroupEditPhotoButton = document.querySelector(".add-group-edit-photo");
const selectGroupEditPhotoButton = document.querySelector(".select-group-edit-photo");
const groupEditImg = document.querySelector(".group-edit-img");
let groupEditAvatarFile = null;

let groupEditAvatarInput = document.querySelector("#groupEditAvatarInput");
if (!groupEditAvatarInput) {
    groupEditAvatarInput = document.createElement("input");
    groupEditAvatarInput.id = "groupEditAvatarInput";
    groupEditAvatarInput.type = "file";
    groupEditAvatarInput.accept = "image/*";
    groupEditAvatarInput.style.display = "none";
    document.body.appendChild(groupEditAvatarInput);
}

async function loadGroupAddParticipants(chatId) {
    if (!groupAddFriendsList) {
        return;
    }

    const response = await fetch(`/chat/group_add_participants/${chatId}/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const data = await response.json();
    if (!data.success) {
        return;
    }

    groupAddFriendsList.innerHTML = data.html;
    bindGroupAddFriendCheckboxes();
    updateSelectedAddCount();
}

function openGroupAddModal() {
    modalOverlay.style.display = "flex";
    groupAddModal.hidden = false;
    groupEditModal.hidden = true;
    const chatId = getCurrentChatId();
    if (chatId) {
        loadGroupAddParticipants(chatId);
    }
}

function closeGroupAddModal() {
    modalOverlay.style.display = "none";
    groupAddModal.hidden = true;
}


function bindGroupAddFriendCheckboxes() {
  const groupAddCheckboxes = document.querySelectorAll('.group-add-user-checkbox');
  groupAddCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateSelectedAddCount);
  });
}

function updateSelectedAddCount() {
  if (!selectedAddCount) {
    return;
  }
  const count = document.querySelectorAll('.group-add-user-checkbox:checked').length;
  selectedAddCount.textContent = count;
}

async function saveGroupAddParticipants(chatId) {
  if (!chatId || !groupAddFriendsList) {
    return;
  }

  const selectedCheckboxes = document.querySelectorAll('.group-add-user-checkbox:checked');
  if (selectedCheckboxes.length === 0) {
    return;
  }

  const formData = new FormData();
  selectedCheckboxes.forEach((checkbox) => {
    formData.append('users', checkbox.value);
  });

  const response = await fetch(`/chat/add_group_participants/${chatId}/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: formData,
  });

  const data = await response.json();
  if (!data.success) {
    return;
  }

  if (data.html) {
    const membersContainer = document.querySelector('.group-members');
    if (membersContainer) {
      membersContainer.innerHTML = data.html;
      
      attachGroupMemberRemovalButtons();
    }
  }

  if (data.members_amount !== undefined) {
    const chatButton = document.querySelector(`.chat-group-button[data-chat-id="${chatId}"]`);
    if (chatButton) {
      chatButton.dataset.membersAmount = data.members_amount;
    }
    if (chatHeader && chatHeader.dataset.chatId === String(chatId)) {
      const chatStatusElement = chatHeader.querySelector('.chat-status');
      if (chatStatusElement) {
        chatStatusElement.textContent = `${data.members_amount} учасників`;
      }
    }
  }

  loadGroupAddParticipants(chatId);
  closeGroupAddModal();
  if (groupEditModal) {
    groupEditModal.hidden = false;
    modalOverlay.style.display = 'flex';
  }
}

function getCurrentChatId() {
    const header = document.querySelector(".chat-header-div");
    return header ? header.dataset.chatId : null;
}

function openEditModal() {
    if (chatHeader?.dataset.isGroup !== "true") {
        return;
    }

    closeSettingsModal();
    closeGroupAddModal();

    const chatId = getCurrentChatId();
    if (chatId && window.getGroupMembers) {
        window.getGroupMembers(chatId);
    }

    const currentGroupName = chatHeader.dataset.chatTitle || chatHeader.querySelector(".chat-name")?.textContent.trim() || "";
    if (editGroupNameInput) {
        editGroupNameInput.value = currentGroupName;
    }

    modalOverlay.style.display = "flex";
    groupEditModal.hidden = false;
}

function closeEditModal() {
    modalOverlay.style.display = "none";
    groupEditModal.hidden = true;
    if (window.pendingRemovedGroupMembers) {
        window.pendingRemovedGroupMembers.clear();
    }
}


function openSettingsModal() {
    modalOverlay.style.display = "flex";

    const currentUserId = chatHeader.dataset.currentUserId;
    const adminId = chatHeader.dataset.adminId;

    console.log("currentUserId:", currentUserId);
    console.log("adminId:", adminId);

    if (currentUserId === adminId) {
        groupSettingsAdmin.hidden = false;
        groupSettingsUser.hidden = true;
    } else {
        groupSettingsAdmin.hidden = true;
        groupSettingsUser.hidden = false;
    }

    groupSettingsModal.hidden = false;
    groupEditModal.hidden = true;
    modalOverlay.style.backgroundColor = "transparent";
}

groupSettingsModal.addEventListener("click", (event) => {
    if (event.target === groupSettingsModal) {
        closeSettingsModal();
    }
});

function closeSettingsModal() {
    modalOverlay.style.display = "none";
    groupSettingsModal.hidden = true;
    modalOverlay.style.backgroundColor = "";
}


function openGroupModal() {
    clearGroupError();
    if (createGroupNameInput) {
      createGroupNameInput.value = "";
    }
    groupUserCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    updateSelectedCount();
    selectedUsersList.innerHTML = "";

    modalOverlay.style.display = "flex";
    groupModal.hidden = false;
    groupStepUsers.hidden = false;
    groupStepName.hidden = true;
}

function closeGroupModal() {
    modalOverlay.style.display = "none";
    groupModal.hidden = true;
    clearGroupError();
}

function updateSelectedCount() {
  const count = document.querySelectorAll(
    ".group-user-checkbox:checked",
  ).length;
  selectedCount.textContent = count;
  if (count >= 2) {
    clearGroupError();
  }
}

function showGroupError(message) {
  if (!groupError) {
    return;
  }
  groupError.textContent = message;
  groupError.hidden = false;
}

function clearGroupError() {
  if (!groupError) {
    return;
  }
  groupError.textContent = "";
  groupError.hidden = true;
}

function hasMinimumParticipants() {
  const selectedCountValue = document.querySelectorAll(
    ".group-user-checkbox:checked",
  ).length;
  if (selectedCountValue < 2) {
    showGroupError("Виберіть принаймні 2 друзів для створення групи.");
    return false;
  }
  return true;
}

function removeSelectedUser(userId) {
  const checkbox = document.querySelector(`.group-user-checkbox[value="${userId}"]`);
  if (!checkbox) {
    return;
  }
  checkbox.checked = false;
  updateSelectedCount();
  renderSelectedUsers();
}

function renderSelectedUsers() {
  selectedUsersList.innerHTML = "";
  groupUserCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const userRow = document.createElement("div");
      userRow.classList.add("participant-row");

      const img1 = document.createElement("img");
      img1.src = "/static/home_app/images/person_4.svg";

      const user = document.createElement("p");
      user.textContent = checkbox.dataset.userName;

      const img2 = document.createElement("img");
      img2.src = "/static/chat_app/images/delete-group-member.svg";
      img2.dataset.removeUserId = checkbox.value;
      img2.addEventListener("click", () => {
        removeSelectedUser(checkbox.value);
      });
      
      userRow.appendChild(img1);
      userRow.appendChild(user);
      userRow.appendChild(img2);

      selectedUsersList.appendChild(userRow);
    }
  });
}

function showNameStep() {
  renderSelectedUsers();
  groupStepUsers.hidden = true;
  groupStepName.hidden = false;
}

function showUsersStep() {
  groupStepUsers.hidden = false;
  groupStepName.hidden = true;
}

function addGroupButton(chatId, groupName, membersAmount = 0, avatarUrl = "") {
  const groupList = getGroupList();
  if (!groupList) {
    return;
  }

  const groupEmpty = document.querySelector("#group-empty");
  if (groupEmpty) {
    groupEmpty.remove();
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-group-button";
  button.dataset.chatId = chatId;
  button.dataset.chatTitle = groupName;
  button.dataset.adminId = chatHeader?.dataset.currentUserId || "";
  button.dataset.membersAmount = String(membersAmount);
  button.dataset.groupMembers = "";

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "profile-img-wrapper";
  const img = document.createElement("img");
  img.className = "img-cover";
  img.src = avatarUrl || "/static/home_app/images/person_4.svg";
  img.alt = "";
  imgWrapper.appendChild(img);

  const personProfile = document.createElement("div");
  personProfile.className = "person-profile";

  const lastMessageHeader = document.createElement("div");
  lastMessageHeader.className = "last-message-header";
  lastMessageHeader.textContent = groupName;

  const lastMessageText = document.createElement("p");
  lastMessageText.className = "last-message-text";
  lastMessageText.textContent = "";

  personProfile.appendChild(lastMessageHeader);
  personProfile.appendChild(lastMessageText);

  button.appendChild(imgWrapper);
  button.appendChild(personProfile);

  const messageInfo = document.createElement("div");
  messageInfo.className = "message-info";
  messageInfo.appendChild(button);

  const groupItem = document.createElement("div");
  groupItem.className = "group-item";
  groupItem.dataset.chatId = chatId;
  groupItem.appendChild(messageInfo);

  groupList.appendChild(groupItem);
  window.bindGroupChatButtons();
}

async function createGroup() {
  if (!hasMinimumParticipants()) {
    return;
  }
  const groupAvatarInput = document.getElementById('groupAvatarInput');
  const formData = new FormData();
  formData.append("name", createGroupNameInput.value);
  if (groupAvatarInput.files.length > 0){
    formData.append("avatar", groupAvatarInput.files[0]);
  }
  groupUserCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      formData.append("users", checkbox.value);
    }
  });

  const response = await fetch("/chat/create_group/", {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    if (data.error === "group_minimum_participants") {
      showGroupError("Виберіть принаймні 2 друзів для створення групи.");
    }
    return;
  }
  
  addGroupButton(
    data.chat_id,
    data.name,
    data.members_amount ?? 0,
    data.avatar_url
  );
  closeGroupModal();
};

async function saveGroupEdits(chatId) {
  if (!chatId || !editGroupNameInput) {
    return { success: false };
  }

  const removedIds = Array.from(window.pendingRemovedGroupMembers);
  const groupAvatarInput = document.getElementById('changeAvatarInput');
  
  const formData = new FormData();
  formData.append("name", editGroupNameInput.value.trim());
  formData.append("removed_users", JSON.stringify(removedIds));
  
  if (groupAvatarInput.files.length > 0){
    formData.append("avatar", groupAvatarInput.files[0]);
  }

  const response = await fetch(`/chat/edit_group/${chatId}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: formData,
  });

  const data = await response.json();
  if (!data.success) {
    return data;
  }

  const groupButton = document.querySelector(`.chat-group-button[data-chat-id="${chatId}"]`);
  if (groupButton) {
    const titleElement = groupButton.querySelector(".last-message-header");
    if (titleElement) {
      titleElement.textContent = data.chat_name;
    }
    groupButton.dataset.chatTitle = data.chat_name;
    if (typeof data.members_amount !== "undefined") {
      groupButton.dataset.membersAmount = data.members_amount;
    }
    if (data.avatar_url && groupButton.querySelector(".group-avatar")) {
      groupButton.querySelector(".group-avatar").src = data.avatar_url;
    }
  }

  if (chatHeader && chatHeader.dataset.isGroup === "true") {
    const chatNameElement = chatHeader.querySelector(".chat-name");
    const chatStatusElement = chatHeader.querySelector(".chat-status");
    if (chatNameElement) {
      chatNameElement.textContent = data.chat_name;
    }
    chatHeader.dataset.chatTitle = data.chat_name;
    if (chatStatusElement && typeof data.members_amount !== "undefined") {
      chatStatusElement.textContent = `${data.members_amount} учасників`;
    }
    if (data.avatar_url && chatHeader.querySelector(".chat-header-meta-img")) {
      chatHeader.querySelector(".chat-header-meta-img").src = data.avatar_url;
    }
  }

  if (data.html) {
    const membersContainer = document.querySelector(".group-members");
    if (membersContainer) {
      membersContainer.innerHTML = data.html;
      attachGroupMemberRemovalButtons();
    }
  }

  window.pendingRemovedGroupMembers.clear();
  groupEditAvatarFile = null;
  
  return data;
}

closeGroupAddModalButton.addEventListener("click", closeGroupAddModal);
groupAddSaveButton.addEventListener('click', async () => {
  const chatId = getCurrentChatId();
  if (!chatId) {
    return;
  }
  await saveGroupAddParticipants(chatId);
});
cancelGroupAddModalButton.addEventListener("click", openEditModal);
openGroupAddModalButton.addEventListener("click", openGroupAddModal);
backGroupEditStepButton.addEventListener("click", openSettingsModal);
openEditModalButton.addEventListener("click", openEditModal);
closeEditModalButton.addEventListener("click", closeEditModal);
openGroupModalButton.addEventListener("click", openGroupModal);
closeGroupModalButton.addEventListener("click", closeGroupModal);
closeGroupNameModalButton.addEventListener("click", closeGroupModal);
cancelGroupModalButton.addEventListener("click", closeGroupModal);

nextGroupStepButton.addEventListener("click", () => {
  if (hasMinimumParticipants()) {
    showNameStep();
  }
});

backGroupStepButton.addEventListener("click", () => {
  clearGroupError();
  showUsersStep();
});

createGroupButton.addEventListener("click", createGroup);

createGroupEditButton.addEventListener("click", async () => {
  const chatId = getCurrentChatId();
  if (!chatId) {
    return;
  }

  const data = await saveGroupEdits(chatId);
  if (!data.success) {
    return;
  }

  if (data.chat_deleted) {
    const groupItem = document.querySelector(`.group-item[data-chat-id="${chatId}"]`);
    if (groupItem) {
      groupItem.remove();
    }
    closeSettingsModal();
    closeGroupAddModal();
    closeEditModal();
    return;
  }

  closeEditModal();
  closeSettingsModal();
});

if (deleteGroupChatButton) {
  deleteGroupChatButton.addEventListener("click", async () => {
    const chatId = getCurrentChatId();
    if (!chatId) {
      return;
    }

    const response = await fetch(`/chat/delete_group/${chatId}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    const data = await response.json();
    if (!data.success) {
      return;
    }

    const groupItem = document.querySelector(`.group-item[data-chat-id="${chatId}"]`);
    if (groupItem) {
      groupItem.remove();
    } else {
      const groupButton = document.querySelector(`.chat-group-button[data-chat-id="${chatId}"]`);
      if (groupButton) {
        groupButton.closest('.message-info')?.remove();
      }
    }

    closeSettingsModal();
    closeEditModal();
    closeGroupAddModal();

    chatWindow.classList.remove("is-open");
    chatTextDiv.classList.remove("hide");
    chatHeader.classList.remove("show");
    if (chatHeader) {
      chatHeader.dataset.chatId = "";
      chatHeader.dataset.isGroup = "false";
      chatHeader.dataset.chatTitle = "";
    }
    if (chatStatus) {
      chatStatus.hidden = false;
    }
  });
}

groupUserCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateSelectedCount);
});


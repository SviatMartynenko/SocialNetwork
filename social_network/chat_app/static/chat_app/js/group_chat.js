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
// Знаходимо поле назви групового чату.
const groupNameInput = document.querySelector("#group-name");
// Знаходимо лічильник вибраних друзів.
const selectedCount = document.querySelector("#selected-count");
// Знаходимо блок, куди показуємо вибраних учасників на другому кроці.
const selectedUsersList = document.querySelector("#selected-users-list");
// Знаходимо всі чекбокси друзів у модальному вікні.
const groupUserCheckboxes = document.querySelectorAll(".group-user-checkbox");
// Знаходимо список груп у правому блоці сторінки.
const groupList = document.querySelector("#group-list");

function openGroupModal() {
  groupModal.hidden = false;
  groupStepUsers.hidden = false;
  groupStepName.hidden = true;
}

function closeGroupModal() {
  groupModal.hidden = true;
  groupNameInput.value = "";
  selectedUsersList.innerHTML = "";
  groupUserCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateSelectedCount();
}

function updateSelectedCount() {
  const count = document.querySelectorAll(
    ".group-user-checkbox:checked",
  ).length;
  selectedCount.textContent = count;
}

function renderSelectedUsers() {
  selectedUsersList.innerHTML = "";
  groupUserCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const user = document.createElement("p");
      user.textContent = checkbox.dataset.userName;
      selectedUsersList.appendChild(user);
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

function addGroupButton(chatId, groupName) {
  const groupEmpty = document.querySelector("#group-empty");
  if (groupEmpty) {
    groupEmpty.remove();
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-group-button";
  button.dataset.chatId = chatId;
  button.dataset.chatTitle = groupName;
  button.textContent = groupName;
  groupList.appendChild(button);
  window.bindGroupChatButtons();
}

async function createGroup() {
  const formData = new FormData();
  formData.append("name", groupNameInput.value);
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

  if (data.success) {
    addGroupButton(data.chat_id, data.name);
    closeGroupModal();
  }
}

openGroupModalButton.addEventListener("click", openGroupModal);
closeGroupModalButton.addEventListener("click", closeGroupModal);
closeGroupNameModalButton.addEventListener("click", closeGroupModal);
nextGroupStepButton.addEventListener("click", showNameStep);
backGroupStepButton.addEventListener("click", showUsersStep);
createGroupButton.addEventListener("click", createGroup);

groupUserCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateSelectedCount);
});

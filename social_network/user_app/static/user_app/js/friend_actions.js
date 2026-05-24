const csrfToken = document.querySelector("meta[name='csrf-token']").content;

const titles = document.querySelectorAll(".section-title");
const friendsTitle = Array.from(titles).find(el => el.textContent.trim() === "Всі друзі");
const sectionDiv = friendsTitle.closest(".section");
const friendsList = sectionDiv.querySelector(".section-users");


async function handleFriendAction(actionButton) {
  const response = await fetch(actionButton.dataset.url, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken }
  });
  const data = await response.json();

  if (data.friend_html) {
    addFriendToMain(data.friend_html);
  }
  
  if (data.label) {
    actionButton.textContent = data.label;
  }
  
  if (data.remove) {
    actionButton.closest(".friend-card").remove();
  }
}

async function openFriendPage(friendCard){
  const personId = friendCard.dataset.id; 
  const response = await fetch(`${friendCard.dataset.url}?person_id=${personId}`, {
    method: "GET",
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });
  const data = await response.json();
}

function addFriendToMain(friendHtml) {
  
  const friendsCount = friendsList.querySelectorAll(".friend-card").length;
  if (friendsCount < 6) {
    friendsList.insertAdjacentHTML("beforeend", friendHtml);
    connectFriendActionButtons(friendsList);
  }
}

function connectFriendActionButtons(parent = document) {
  const actionButtons = parent.querySelectorAll(".action-btn");
  actionButtons.forEach((actionButton) => {
    if (!actionButton.dataset.eventConnected) {
      actionButton.dataset.eventConnected = true;
      actionButton.addEventListener("click", async () => {
        await handleFriendAction(actionButton);
      });
    }
  });
}

function connectFriendCards(parent = document) {
  const friendCards = parent.querySelectorAll(".friend-card");
  friendCards.forEach((friendCard) => {
    if (!friendCard.dataset.eventConnected) {
      friendCard.dataset.eventConnected = true;
      friendCard.addEventListener("click", async () => {
        await openFriendPage(friendCard);
      });
    }
  });
}

connectFriendActionButtons();
connectFriendCards();
window.connectFriendActionButtons = connectFriendActionButtons;
window.connectFriendCards = connectFriendCards;
const csrfToken = document.querySelector("meta[name='csrf-token']").content;
// const modal = document.querySelector('.modal-overlay');
// const cancelButton = document.querySelector('.conf-action-button1');
// const confirmButton = document.querySelector('.conf-action-button2');
let titles;
let friendsTitle;
let sectionDiv;
let friendsList;
let currentFriendCard;

if(!window.location.pathname.includes('/profile')){
  titles = document.querySelectorAll(".section-title");
  friendsTitle = Array.from(titles).find(el => el.textContent.trim() === "Всі друзі");
  sectionDiv = friendsTitle.closest(".section");
  friendsList = sectionDiv.querySelector(".section-users");
}

async function handleFriendAction(actionButton) {
  const response = await fetch(actionButton.dataset.url, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken }
  });
  const data = await response.json();

  if (data.friend_html && !window.location.pathname.includes('/profile')) {
    addFriendToMain(data.friend_html);
  }
  
  if (data.label) {
    actionButton.textContent = data.label;
  }
  
  if (data.remove && !window.location.pathname.includes('/profile')) {
    actionButton.closest(".friend-card").remove();
  }
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
      actionButton.addEventListener("click", async (event) => {
        event.stopPropagation(); 
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
      const personId = friendCard.dataset.id; 
      friendCard.addEventListener("click", async () => {
        window.location.replace(`${friendCard.dataset.url}?person_id=${personId}`);
      });
    }
  });
}

connectFriendActionButtons();
connectFriendCards();
window.connectFriendActionButtons = connectFriendActionButtons;
window.connectFriendCards = connectFriendCards;
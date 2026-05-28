const csrfToken = document.querySelector("meta[name='csrf-token']").content;

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
  
  if (data.label) {
    actionButton.textContent = data.label;
  }
  
  if (data.remove && !window.location.pathname.includes('/profile')) {
    actionButton.closest(".friend-card").remove();
  }
  if (actionButton.dataset.redirect){
    window.location.replace(actionButton.dataset.redirect);
  }
}


function connectFriendActionButtons(parent = document) {
  const actionButtons = parent.querySelectorAll(".action-btn");
  actionButtons.forEach((actionButton) => {
    if (!actionButton.dataset.eventConnected) {
      actionButton.dataset.eventConnected = true;
      actionButton.addEventListener("click", async (event) => {
        
        if (actionButton.dataset.id) {
          window.location.replace(`${actionButton.dataset.redirect}?person_id=${actionButton.dataset.id}`);
        }
        else if (actionButton.dataset.redirect && actionButton.dataset.redirect.includes('/chat')){
          window.location.replace(actionButton.dataset.redirect);
        }
        else{
          await handleFriendAction(actionButton);
        } 
      });
    }
  });
}



connectFriendActionButtons();
window.connectFriendActionButtons = connectFriendActionButtons;
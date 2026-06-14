const headerUnreadCount = document.getElementById("headerUnreadCount");
const pesronalUnreadCount = document.getElementById("pesronalUnreadCount");
const groupUnreadCount = document.getElementById("groupUnreadCount");

function unreadText(count) {
    if (count == 0) {
        return "";
    }

    return `(${count})`;
}

function setUnreadCount(element, count) {
    if (element) {
        element.textContent = unreadText(count);
    }
}

function updateChatButton(chat) {
    
}
messageButtons = document.querySelectorAll(".chat-user-button");

messageButtons.forEach(button => {
    button.addEventListener("click", () =>{
        window.location.href = `/chat?userId=${button.dataset.chatUser}&username=${button.dataset.chatUsername}`;
    });
});
const addChatAvatarButton = document.querySelector(".add-group-photo");
const groupAvatarInput = document.getElementById('groupAvatarInput');
const changeAvatarInput = document.getElementById('changeAvatarInput');
const changeChatAvatarButton = document.querySelector(".add-group-edit-photo");

addChatAvatarButton.addEventListener("click", () => {
    groupAvatarInput.click();
});

changeChatAvatarButton.addEventListener("click", () => {
    changeAvatarInput.click();
});

changeAvatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        document.querySelector(".group-edit-img").src = event.target.result;
    };

    reader.readAsDataURL(file);
});

groupAvatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        document.querySelector(".group-img").src = event.target.result;
    };

    reader.readAsDataURL(file);
});

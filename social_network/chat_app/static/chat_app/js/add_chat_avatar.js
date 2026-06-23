const addChatAvatarButton = document.querySelector(".add-group-photo");
const groupAvatarInput = document.getElementById('groupAvatarInput');

addChatAvatarButton.addEventListener("click", () => {
    groupAvatarInput.click();
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

groupEditAvatarInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    groupEditAvatarFile = file;

    const reader = new FileReader();

    reader.onload = function(event) {
        document.querySelector(".group-img").src = event.target.result;
    };

    reader.readAsDataURL(file);
});

document.querySelector(".add-group-edit-photo").addEventListener("click", () => {
    groupEditAvatarInput.click();
});
const addChatAvatarButton= document.querySelector(".add-group-photo");
addChatAvatarButton.addEventListener("click", () =>{
    const groupAvatarInput = document.getElementById('groupAvatarInput');
    groupAvatarInput.click();

    groupAvatarInput.addEventListener(
    'change', 
    function() {
        const file = this.files[0];

        const reader = new FileReader();

        reader.onload = function(event) {
            const groupAvatarPreview = document.querySelector(".group-img");
            groupAvatarPreview.src= event.target.result;
        };

        reader.readAsDataURL(file);
    });
});
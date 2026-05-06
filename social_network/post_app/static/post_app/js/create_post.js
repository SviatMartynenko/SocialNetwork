const createPostBtn = document.querySelector(".Go-to-design")
const modalOverlay = document.querySelector(".modal-overlay")
const cross = document.getElementById('close-modal')

createPostBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
});
cross.addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

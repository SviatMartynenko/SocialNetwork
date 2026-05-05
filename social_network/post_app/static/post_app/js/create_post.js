const createPostBtn = document.querySelector(".Go-to-design")
const modalOverlay = document.querySelector(".modal-overlay")

createPostBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
});

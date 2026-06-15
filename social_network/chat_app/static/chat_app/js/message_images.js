const messageImagesInput = document.querySelector("#messageImages");
const messageImageButton = document.querySelector("#messageImageButton");

function getSelectedImages() {
  return Array.from(messageImagesInput.files);
}

function hasSelectedImages() {
  return getSelectedImages().length > 0;
}

function clearSelectedImages() {
  messageImagesInput.value = "";
}

async function sendMessageWithImages(messageText) {
  const formData = new FormData();
  formData.append("text", messageText);
  getSelectedImages().forEach((image) => {
    formData.append("images", image);
  });
  const response = await fetch(`/chat/upload_images/${activeChatId}/`, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken },
    body: formData,
  });
  return response.json();
}

messageImageButton.addEventListener("click", () => {
  messageImagesInput.click();
});

window.hasSelectedImages = hasSelectedImages;
window.clearSelectedImages = clearSelectedImages;
window.sendMessageWithImages = sendMessageWithImages;

function hasMessageImages(data) {
  return Array.isArray(data.images) && data.images.length > 0;
}

function renderMessageImages(images) {
  const imagesList = document.createElement("div");

  imagesList.classList.add("message-images");

  images.forEach((imageUrl) => {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("message-img-container");
    const image = document.createElement("img");
    image.classList.add("img-cover");
    image.src = imageUrl;
    imageContainer.appendChild(image);
    imagesList.appendChild(imageContainer);
  });

  return imagesList;
}

window.hasMessageImages = hasMessageImages;
window.renderMessageImages = renderMessageImages;
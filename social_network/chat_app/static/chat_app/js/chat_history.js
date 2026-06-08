// Логіка підгрузки повідомлень
// Створюємо HTML для одного повідомлення.
let activeChatId = null;
let currentPage = 1;
let hasNext = false;
let isLoading = false;
let observer = null;

function renderMessage(data) {

  const userUsername= chatWindow.dataset.userUsername;
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  if(data.sender === userUsername){
    messageElement.classList.add("sender");
  }
  messageElement.dataset.messageDate = window.formatMessageDate(data.created_at);
  // Записуємо автора і текст.

  const messageBody = document.createElement("div");
  messageBody.classList.add("message-body");
  
  const messageSender = document.createElement("p");
  messageSender.classList.add("message-sender");
  
  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  const messageMeta = document.createElement("div");
  messageMeta.classList.add("message-meta");

  const messageMetaTime = document.createElement("p");
  messageMetaTime.classList.add("message-meta-time");

  const messageMetaStatus = document.createElement("div");
  messageMetaStatus.classList.add("message-meta-status");
  
  messageSender.textContent = `${data.sender}`;   
  messageMetaTime.textContent = `${formatMessageTime(data.created_at)}`;
  messageContent.textContent = `${data.text}`

  messageBody.appendChild(messageSender);
  messageBody.appendChild(messageContent);
  messageElement.appendChild(messageBody);
  messageMeta.appendChild(messageMetaTime);
  messageMeta.appendChild(messageMetaStatus);
  messageElement.appendChild(messageMeta);
  messages.appendChild(messageElement);
  // Повертаємо готовий блок.
  return messageElement;
}

// Готуємо блок повідомлень до нового чату.
function resetMessages(chatId) {
  // Запам'ятовуємо активний чат.
  activeChatId = chatId;
  // Починаємо з першої сторінки.
  currentPage = 1;
  // Дозволяємо перше завантаження.
  hasNext = true;
  // Скидаємо прапорець завантаження.
  isLoading = false;
  // Вимикаємо старий observer.
  if (observer) observer.disconnect();
  // Очищаємо попередній чат.
  messages.innerHTML = "";
  // Створюємо верхній sentinel.
  const sentinel = document.createElement("div");
  // Даємо sentinel id.
  sentinel.id = "message-load-sentinel";
  // Додаємо sentinel на початок.
  messages.prepend(sentinel);
}


// Завантажуємо одну сторінку історії.
async function loadMessages(prepend = false) {
  // Не запускаємо друге завантаження паралельно.
  if (isLoading || !hasNext) return;
  // Позначаємо початок завантаження.
  isLoading = true;
  // Запам'ятовуємо стару висоту списку.
  const oldHeight = messages.scrollHeight;
  // Запитуємо сторінку історії.
  const response = await fetch(
    `/chat/${activeChatId}/messages/?page=${currentPage}`,
    {
      // Позначаємо AJAX-запит.
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );
  // Читаємо JSON-відповідь.
  const data = await response.json();
  // Створюємо тимчасовий контейнер для повідомлень.
  const fragment = document.createDocumentFragment();
  // Додаємо повідомлення у контейнер.
  data.messages.forEach((message) =>
    fragment.appendChild(renderMessage(message)),
);
window.updateDateSeparators()
// Знаходимо верхній sentinel.
const sentinel = document.querySelector("#message-load-sentinel");
// Перевіряємо, чи треба вставити повідомлення зверху.
if (prepend) {
  // Вставляємо старі повідомлення після sentinel.
  sentinel.after(fragment);
  // Інакше це перше завантаження історії.
} else {
  // Вставляємо останні повідомлення в кінець списку.
  messages.appendChild(fragment);
}
// Запам'ятовуємо, чи є наступна сторінка.
hasNext = data.has_next;
// Переходимо до наступної сторінки.
currentPage++;
// Перевіряємо, чи повідомлення вставлялися зверху.
if (prepend) {
  // Зберігаємо позицію після вставки старої історії.
  messages.scrollTop = messages.scrollHeight - oldHeight;
  // Інакше це перше завантаження історії.
} else {
  // Прокручуємо чат до останнього повідомлення.
  messages.scrollTop = messages.scrollHeight;
}
// Зупиняємо observer, якщо сторінок більше немає.
if (!hasNext && observer) observer.disconnect();
// Дозволяємо наступне завантаження.
isLoading = false;
}

// Вмикаємо observer для підвантаження старих повідомлень.
function startObserver() {
  // Знаходимо верхній sentinel.
  const sentinel = document.querySelector("#message-load-sentinel");
  // Створюємо observer як у підвантаженні постів.
  observer = new IntersectionObserver(
    async (entries) => {
      // Перевіряємо, що sentinel видно.
      if (entries[0].isIntersecting && isLoading == false) {
        // Завантажуємо старішу сторінку.
        await loadMessages(true);
      }
      // Обмежуємо observer блоком повідомлень.
    },
    { root: messages, rootMargin: "20px" },
  );
  // Починаємо стежити за sentinel.
  observer.observe(sentinel);
}

window.resetMessages = resetMessages;
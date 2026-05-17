const mainBlock = document.getElementById("friendsMain");
const sectionBlock = document.getElementById("section");
const sectionTitle = document.getElementById("sectionTitle");
const sectionList = document.getElementById("sectionList");
const sectionSentinel = document.getElementById("loadSentinel");
const backMainButtons = document.querySelectorAll(".back-main");
const sectionButtons = document.querySelectorAll("[data-section-link]");
const sectionTitles = {
  requests: "Запити",
  recommendations: "Рекомендації",
  friends: "Всі Друзі",
};
let currentSection = "";
let currentPage = 1;
let hasNextPage = false;
let isLoading = false;

async function loadSectionPage(section, page) {
  isLoading = true;
  const response = await fetch(`/auth/friends/${section}/?${page}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  const data = await response.json();
  sectionList.insertAdjacentHTML("beforeend", data.html);
  hasNextPage = data.has_next_page;
  isLoading = false;
}

async function openSection(section) {
  currentSection = section;
  currentPage = 1;
  hasNextPage = false;
  sectionTitle.textContent = sectionTitles[section];
  sectionList.innerHTML = "";
  mainBlock.style.display = "none";
  sectionBlock.style.display = "block";
  await loadSectionPage(section, currentPage);
}

function openMain() {
  sectionBlock.style.display = "none";
  sectionList.innerHTML = "";
  currentSection = "";
  hasNextPage = false;
  mainBlock.style.display = "block";
}

const observer = new IntersectionObserver(
  async (entries) => {
    if (entries[0].isIntersecting && hasNextPage && isLoading == false) {
      currentPage++;
      await loadSectionPage(currentSection, currentPage);
    }
  },
  { rootMargin: "50px" },
);

observer.observe(sectionSentinel);

backMainButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openMain();
  });
});

sectionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await openSection(button.dataset.sectionLink);
  });
});
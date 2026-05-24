const mainBlock = document.getElementById("friendsMain");
const sectionBlock = document.getElementById("section");
const sectionTitle = document.getElementById("sectionTitle");
const sectionList = document.getElementById("sectionList");
const sectionSentinel = document.getElementById("loadSentinel");
const backMainButton = document.getElementById("back-main");
const sectionButtons = document.querySelectorAll("[data-section-link]");
const mainNavButtons = document.querySelector('.main-nav').querySelectorAll('span');
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
  const response = await fetch(`/user/friends/${section}/?${page}`, {
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
  sectionBlock.style.display = "flex";
  await loadSectionPage(section, currentPage);
}

function openMain() {
  sectionBlock.style.display = "none";
  sectionList.innerHTML = "";
  currentSection = "";
  hasNextPage = false;
  mainBlock.style.display = "flex";
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

backMainButton.addEventListener("click", () => {
  openMain();
  navButtonClick(backMainButton);
  });


sectionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await openSection(button.dataset.sectionLink);
    navButtonClick(button);
  });
});

function navButtonClick(button){
    button.classList.add('selected-item');
    const otherButtons = Array.from(mainNavButtons).filter(span => span !== button);

    otherButtons.forEach(button => {
      if (button && button.classList) {
        button.classList.remove('selected-item');
      }
    });
  };





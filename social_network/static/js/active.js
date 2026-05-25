navItems = document.querySelectorAll(".nav-item")
navItems.forEach(item => {
    const urlPath = new URL(item.href, "http://localhost").pathname;
    const currentPath = window.location.pathname; 
    if (currentPath.includes(urlPath)) {
        item.classList.add('active-nav-item');
    }
});
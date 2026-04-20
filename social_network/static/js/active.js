navItems = document.querySelectorAll(".nav-item")
navItems.forEach(item => {
    if (item.href == window.location.href) {
        item.classList.add('active-nav-item');
    }
});
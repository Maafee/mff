
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-label");
  const menu = document.querySelector(".menu-items");

  // Toggle menu on hamburger click
  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  // Chiudi menu se clicchi fuori o su un link
  document.addEventListener("click", (e) => {
    const isClickInside = menu.contains(e.target) || menuBtn.contains(e.target);
    if (!isClickInside) {
      menu.classList.remove("active");
    }
  });

  // Chiudi menu al click su un link
  document.querySelectorAll(".menu-link").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });
});

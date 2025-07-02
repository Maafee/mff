let titles = ["Matteo Mosti", "Portfolio"];
let index = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
  const span = document.getElementById("typed-text");
  if (!span) return;

  const currentTitle = titles[index];

  if (!deleting) {
    span.textContent = currentTitle.substring(0, charIndex++);
    if (charIndex > currentTitle.length) {
      deleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    span.textContent = currentTitle.substring(0, Math.max(charIndex--, 0));
    if (charIndex === 0) {
      deleting = false;
      index = (index + 1) % titles.length;
    }
  }

  setTimeout(typeEffect, deleting ? 100 : 150);
}

document.addEventListener("DOMContentLoaded", typeEffect);

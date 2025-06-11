let titles = [
    "Matteo",
    "Mosti"
];

let index = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
    let h1Element = document.getElementById("dynamic-title");
    if (!h1Element) return;
    
    let currentTitle = titles[index];
    
    if (!deleting) {
        h1Element.textContent = currentTitle.substring(0, charIndex++);
        if (charIndex > currentTitle.length) {
            deleting = true;
            setTimeout(typeEffect, 1000); // Tempo di attesa prima della cancellazione
            return;
        }
    } else {
        h1Element.textContent = currentTitle.substring(0, Math.max(charIndex--, 1)); // Mantiene almeno una lettera
        if (charIndex === 1) { // Cambia titolo quando resta solo la prima lettera
            deleting = false;
            index = (index + 1) % titles.length;
        }
    }
    setTimeout(typeEffect, deleting ? 100 : 150);
}

document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
});

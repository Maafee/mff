/* ==========================================================================
   Typewriter effect for the hero role line
   ========================================================================== */

(function () {
    const target = document.getElementById("typed-text");
    if (!target) return;

    const roles = ["Web Developer", "Tecnico Hardware", "Operatore CNC"];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        target.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = null;

    target.textContent = "";

    function tick() {
        const role = roles[roleIndex];

        charIndex += deleting ? -1 : 1;
        target.textContent = role.slice(0, Math.max(charIndex, 0));

        let delay = deleting ? 45 : 85;

        if (!deleting && charIndex === role.length) {
            // Pause with the full word visible
            deleting = true;
            delay = 1900;
        } else if (deleting && charIndex === 0) {
            // Move on to the next role
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 420;
        }

        timer = window.setTimeout(tick, delay);
    }

    // Respect the reduced-motion preference if it changes while the page is open
    if (typeof window.matchMedia === "function") {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = (event) => {
            if (event.matches) {
                window.clearTimeout(timer);
                target.textContent = roles[0];
            }
        };
        if (typeof query.addEventListener === "function") {
            query.addEventListener("change", onChange);
        }
    }

    timer = window.setTimeout(tick, 450);
})();

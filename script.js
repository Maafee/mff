/* ==========================================================================
   Matteo Mosti — Portfolio
   UI behaviour: navigation, scroll progress, scroll spy, reveal animations
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("primary-menu");
    const overlay = document.getElementById("menu-overlay");
    const menuLinks = Array.from(document.querySelectorAll(".menu-link"));
    const progressBar = document.getElementById("scroll-progress-bar");
    const year = document.getElementById("year");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------
       Mobile menu
       --------------------------------------------------------------- */
    const isMenuOpen = () => body.classList.contains("menu-open");

    function setMenu(open, { returnFocus = false } = {}) {
        body.classList.toggle("menu-open", open);
        if (overlay) overlay.classList.toggle("is-visible", open);

        if (toggle) {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
            if (returnFocus) toggle.focus();
        }
    }

    if (toggle) {
        toggle.addEventListener("click", () => setMenu(!isMenuOpen()));
    }

    if (overlay) {
        overlay.addEventListener("click", () => setMenu(false));
    }

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen()) {
            setMenu(false, { returnFocus: true });
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 860 && isMenuOpen()) setMenu(false);
    });

    /* ---------------------------------------------------------------
       Preloader
       --------------------------------------------------------------- */
    const preloader = document.getElementById("preloader");
    const preloaderCount = document.getElementById("preloader-count");
    const preloaderBar = document.getElementById("preloader-bar");

    if (preloader) {
        let preloaderDone = false;

        const finishPreloader = () => {
            if (preloaderDone) return;
            preloaderDone = true;
            preloader.classList.add("is-done");
            window.setTimeout(() => {
                preloader.hidden = true;
            }, 1000);
        };

        if (reduceMotion) {
            finishPreloader();
        } else {
            const duration = 1100;
            const startedAt = performance.now();

            const step = (now) => {
                const t = Math.min((now - startedAt) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const percent = Math.round(eased * 100);

                if (preloaderCount) preloaderCount.textContent = `${percent}%`;
                if (preloaderBar) preloaderBar.style.transform = `scaleX(${eased})`;

                if (t < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    window.setTimeout(finishPreloader, 180);
                }
            };

            window.requestAnimationFrame(step);
            // Never let a slow frame keep the page covered.
            window.setTimeout(finishPreloader, 2400);
        }
    }

    /* ---------------------------------------------------------------
       Custom cursor (fine pointers only)
       --------------------------------------------------------------- */
    const cursor = document.getElementById("cursor");
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (cursor && finePointer && !reduceMotion) {
        const dot = cursor.querySelector(".cursor-dot");
        const ring = cursor.querySelector(".cursor-ring");
        const hoverSelector = "a, button, [data-magnetic], [role='button']";
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let hovering = false;
        let visible = false;
        let cursorFrame = null;

        document.addEventListener(
            "pointermove",
            (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;

                if (!visible) {
                    visible = true;
                    ringX = mouseX;
                    ringY = mouseY;
                    document.body.classList.add("has-cursor");
                }

                if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                hovering = Boolean(event.target.closest(hoverSelector));

                if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
            },
            { passive: true }
        );

        document.addEventListener("pointerdown", () => {
            if (ring) ring.style.opacity = "1";
        });

        document.addEventListener("pointerup", () => {
            if (ring) ring.style.opacity = "";
        });

        document.addEventListener("mouseleave", () => {
            document.body.classList.remove("has-cursor");
            visible = false;
        });

        function renderCursor() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            if (ring) {
                ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${hovering ? 1.65 : 1})`;
                ring.style.backgroundColor = hovering ? "rgba(255, 192, 203, 0.1)" : "";
                ring.style.borderColor = hovering ? "rgba(255, 192, 203, 0.85)" : "";
            }

            if (Math.abs(mouseX - ringX) > 0.15 || Math.abs(mouseY - ringY) > 0.15) {
                cursorFrame = window.requestAnimationFrame(renderCursor);
            } else {
                cursorFrame = null;
            }
        }
    }

    /* ---------------------------------------------------------------
       Magnetic buttons
       --------------------------------------------------------------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll("[data-magnetic]").forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect = element.getBoundingClientRect();
                const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.22;
                const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.22;
                element.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`;
            });

            element.addEventListener("pointerleave", () => {
                element.style.transform = "";
            });
        });
    }

    /* ---------------------------------------------------------------
       Hero: CNC readout + avatar tilt
       --------------------------------------------------------------- */
    const hero = document.querySelector(".hero");
    const hudX = document.getElementById("hud-x");
    const hudY = document.getElementById("hud-y");

    if (hero && hudX && hudY && finePointer && !reduceMotion) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let hudFrame = null;

        const formatAxis = (value) => {
            const sign = value < 0 ? "-" : "+";
            return sign + Math.abs(value).toFixed(3).padStart(7, "0");
        };

        const renderHud = () => {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            hudX.textContent = formatAxis(currentX);
            hudY.textContent = formatAxis(currentY);

            if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
                hudFrame = window.requestAnimationFrame(renderHud);
            } else {
                hudFrame = null;
            }
        };

        const moveHud = (event) => {
            const rect = hero.getBoundingClientRect();
            targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 240;
            targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 160;
            if (!hudFrame) hudFrame = window.requestAnimationFrame(renderHud);
        };

        hero.addEventListener("pointermove", moveHud, { passive: true });
        hero.addEventListener("pointerleave", () => {
            targetX = 0;
            targetY = 0;
            if (!hudFrame) hudFrame = window.requestAnimationFrame(renderHud);
        });
    }

    const heroVisual = document.querySelector(".hero-visual");
    const avatarFrame = heroVisual ? heroVisual.querySelector(".avatar-frame") : null;

    if (heroVisual && avatarFrame && finePointer && !reduceMotion) {
        heroVisual.addEventListener(
            "pointermove",
            (event) => {
                const rect = heroVisual.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width - 0.5;
                const py = (event.clientY - rect.top) / rect.height - 0.5;

                heroVisual.classList.add("is-tilting");
                avatarFrame.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
                avatarFrame.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
                avatarFrame.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
                avatarFrame.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
            },
            { passive: true }
        );

        heroVisual.addEventListener("pointerleave", () => {
            heroVisual.classList.remove("is-tilting");
            avatarFrame.style.setProperty("--rx", "0deg");
            avatarFrame.style.setProperty("--ry", "0deg");
            avatarFrame.style.setProperty("--gx", "50%");
            avatarFrame.style.setProperty("--gy", "40%");
        });
    }

    /* ---------------------------------------------------------------
       Timeline scroll progress
       --------------------------------------------------------------- */
    const timeline = document.getElementById("timeline");
    const timelineBar = document.getElementById("timeline-bar");

    function updateTimeline() {
        if (!timeline || !timelineBar) return;

        const rect = timeline.getBoundingClientRect();
        const anchor = window.innerHeight * 0.6;
        const progress = Math.min(Math.max((anchor - rect.top) / rect.height, 0), 1);
        timelineBar.style.transform = `scaleY(${progress})`;
    }

    window.addEventListener("resize", updateTimeline, { passive: true });
    window.addEventListener("scroll", updateTimeline, { passive: true });
    updateTimeline();

    /* ---------------------------------------------------------------
       Count-up numbers
       --------------------------------------------------------------- */
    const counters = Array.from(document.querySelectorAll("[data-count]"));

    if (counters.length) {
        const setFinalValues = () => {
            counters.forEach((el) => {
                el.textContent = el.dataset.count;
            });
        };

        if (reduceMotion || !("IntersectionObserver" in window)) {
            setFinalValues();
        } else {
            const counterObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        const el = entry.target;
                        const targetValue = Number(el.dataset.count) || 0;
                        const startTime = performance.now();
                        const duration = 900;

                        const animate = (now) => {
                            const t = Math.min((now - startTime) / duration, 1);
                            const eased = 1 - Math.pow(1 - t, 3);
                            el.textContent = Math.round(targetValue * eased);
                            if (t < 1) window.requestAnimationFrame(animate);
                        };

                        window.requestAnimationFrame(animate);
                        counterObserver.unobserve(el);
                    });
                },
                { threshold: 0.6 }
            );

            counters.forEach((el) => counterObserver.observe(el));
        }
    }

    /* ---------------------------------------------------------------
       Typewriter helper (cancellable)
       --------------------------------------------------------------- */
    const typingTimers = new WeakMap();

    function stopTyping(element) {
        if (!element) return;
        const timers = typingTimers.get(element);
        if (timers) timers.forEach((timer) => window.clearTimeout(timer));
        typingTimers.delete(element);
    }

    function typeWhenVisible(element, getText, baseDelay = 10) {
        if (!element) return;

        stopTyping(element);
        const text = getText();

        if (reduceMotion || !("IntersectionObserver" in window)) {
            element.textContent = text;
            return;
        }

        let started = false;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || started) return;
                    started = true;
                    observer.disconnect();

                    let index = 0;
                    const timers = [];
                    typingTimers.set(element, timers);

                    const type = () => {
                        element.textContent = text.slice(0, index);
                        index += 1;
                        if (index <= text.length) {
                            timers.push(window.setTimeout(type, baseDelay + Math.random() * 8));
                        }
                    };

                    type();
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(element);
    }

    /* ---------------------------------------------------------------
       Web: HTML + CSS editor with live preview
       --------------------------------------------------------------- */
    const webPreview = document.getElementById("web-preview");
    const previewFrame = document.getElementById("web-preview-frame");
    const codeEditor = document.getElementById("web-editor");
    const webPre = document.getElementById("web-typer");
    const webInput = document.getElementById("web-input");
    const webEditBtn = document.getElementById("web-edit");
    const webResetBtn = document.getElementById("web-reset");
    const codeTabs = Array.from(document.querySelectorAll(".code-tab"));
    const viewButtons = Array.from(document.querySelectorAll("[data-view]"));
    const swatches = Array.from(document.querySelectorAll("[data-accent]"));

    const webDefaults = {
        html: [
            '<nav class="nav">',
            '  <span class="logo">mff</span>',
            '  <span class="links">web · cnc · contatti</span>',
            "</nav>",
            "",
            '<section class="hero">',
            '  <p class="eyebrow">Massa, Toscana</p>',
            "  <h1>Matteo<br>Mosti</h1>",
            "  <p class=\"copy\">Siti web, reti e macchine CNC.</p>",
            "",
            '  <div class="actions">',
            '    <a class="btn" href="#">Scrivimi</a>',
            '    <a class="btn ghost" href="#">CV</a>',
            "  </div>",
            "</section>",
        ].join("\n"),
        css: [
            ":root {",
            "  --accent: #ffc0cb;",
            "  --muted: #8d8d9b;",
            "}",
            "",
            "body {",
            "  position: relative;",
            "  min-height: 100vh;",
            "  padding: 26px 24px;",
            "  background: linear-gradient(160deg, #111118, #0a0a0d);",
            "  overflow: hidden;",
            "}",
            "",
            "body::before {",
            '  content: "";',
            "  position: absolute;",
            "  inset: 0;",
            "  background-image:",
            "    linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),",
            "    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);",
            "  background-size: 34px 34px;",
            "  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 18%, #000, transparent 80%);",
            "  mask-image: radial-gradient(ellipse 90% 80% at 50% 18%, #000, transparent 80%);",
            "  pointer-events: none;",
            "}",
            "",
            "body::after {",
            '  content: "";',
            "  position: absolute;",
            "  top: -90px;",
            "  right: -70px;",
            "  width: 240px;",
            "  height: 240px;",
            "  border-radius: 50%;",
            "  background: var(--accent);",
            "  opacity: .22;",
            "  filter: blur(70px);",
            "  pointer-events: none;",
            "}",
            "",
            ".nav {",
            "  position: relative;",
            "  z-index: 1;",
            "  display: flex;",
            "  align-items: center;",
            "  justify-content: space-between;",
            "  gap: 12px;",
            "}",
            "",
            ".logo {",
            '  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;',
            "  font-size: 1rem;",
            "  font-weight: 700;",
            "  letter-spacing: -.06em;",
            "  color: var(--accent);",
            "}",
            "",
            ".links {",
            '  font-family: "JetBrains Mono", ui-monospace, monospace;',
            "  font-size: .48rem;",
            "  letter-spacing: .12em;",
            "  text-transform: uppercase;",
            "  color: var(--muted);",
            "}",
            "",
            ".hero {",
            "  position: relative;",
            "  z-index: 1;",
            "  margin-top: 40px;",
            "}",
            "",
            ".eyebrow {",
            "  margin: 0;",
            '  font-family: "JetBrains Mono", ui-monospace, monospace;',
            "  font-size: .5rem;",
            "  letter-spacing: .16em;",
            "  text-transform: uppercase;",
            "  color: var(--accent);",
            "}",
            "",
            ".hero h1 {",
            "  margin: 10px 0 8px;",
            '  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;',
            "  font-size: clamp(2rem, 9vw, 3rem);",
            "  font-weight: 700;",
            "  line-height: .9;",
            "  letter-spacing: -.05em;",
            "  background: linear-gradient(110deg, #fff, #ffe3e8 40%, var(--accent));",
            "  -webkit-background-clip: text;",
            "  background-clip: text;",
            "  -webkit-text-fill-color: transparent;",
            "}",
            "",
            ".copy {",
            "  max-width: 28ch;",
            "  margin: 0;",
            "  color: #c3c3cd;",
            "  font-size: .72rem;",
            "  line-height: 1.5;",
            "}",
            "",
            ".actions {",
            "  display: flex;",
            "  flex-wrap: wrap;",
            "  gap: 8px;",
            "  margin-top: 16px;",
            "}",
            "",
            ".btn {",
            "  padding: 7px 14px;",
            "  border-radius: 999px;",
            "  background: var(--accent);",
            "  color: #1b0f13;",
            "  font-size: .66rem;",
            "  font-weight: 700;",
            "}",
            "",
            ".btn.ghost {",
            "  border: 1px solid rgba(255,255,255,.18);",
            "  background: transparent;",
            "  color: #f3f3f6;",
            "}",
            "",
            "@media (max-width: 320px) {",
            "  .links { display: none; }",
            "  .hero { margin-top: 30px; }",
            "}",
        ].join("\n"),
    };

    const webState = {
        html: webDefaults.html,
        css: webDefaults.css,
        file: "html",
        accent: "#ffc0cb",
        editing: false,
    };

    let previewReady = false;
    let previewTimer = 0;

    const previewBaseCss = [
        "*, *::before, *::after { box-sizing: border-box; }",
        "html { color-scheme: dark; }",
        "body {",
        "  margin: 0;",
        "  min-height: 100%;",
        "  background: #0b0b0f;",
        "  color: #f3f3f6;",
        '  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;',
        "  -webkit-font-smoothing: antialiased;",
        "  overflow: auto;",
        "}",
        "a { color: inherit; text-decoration: none; }",
    ].join("\n");

    const previewShell = [
        "<!DOCTYPE html>",
        '<html lang="it">',
        "<head>",
        '<meta charset="utf-8">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">',
        `<style>${previewBaseCss}</style>`,
        '<style id="pv-user"></style>',
        "</head>",
        "<body></body>",
        "</html>",
    ].join("\n");

    function renderPreview() {
        if (!previewReady || !webPreview) return;

        const doc = webPreview.contentDocument;
        if (!doc || !doc.body) return;

        let parsed;
        try {
            parsed = new DOMParser().parseFromString(webState.html, "text/html");
        } catch (error) {
            return;
        }

        const extraStyles = Array.from(parsed.head.querySelectorAll("style"))
            .map((style) => style.textContent)
            .join("\n");
        const userStyle = doc.getElementById("pv-user");

        if (userStyle) userStyle.textContent = `${webState.css}\n${extraStyles}`;
        doc.body.innerHTML = parsed.body.innerHTML;
        doc.documentElement.style.setProperty("--accent", webState.accent);
    }

    function schedulePreview() {
        window.clearTimeout(previewTimer);
        previewTimer = window.setTimeout(renderPreview, 80);
    }

    if (webPreview) {
        webPreview.srcdoc = previewShell;
        webPreview.addEventListener("load", () => {
            previewReady = true;
            renderPreview();
        });
    }

    function syncCodeTabs() {
        codeTabs.forEach((tab) => {
            const isActive = tab.dataset.file === webState.file;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-pressed", String(isActive));
        });
    }

    function setCodeFile(file) {
        if (!webState[file] || file === webState.file) return;
        if (webState.editing && webInput) webState[webState.file] = webInput.value;
        webState.file = file;
        syncCodeTabs();

        if (webInput) {
            webInput.value = webState[file];
            webInput.setAttribute("aria-label", `Editor del codice ${file === "html" ? "HTML" : "CSS"}`);
        }

        if (!webState.editing && webPre) {
            stopTyping(webPre);
            webPre.textContent = webState[file];
        }
    }

    function setCodeEditing(on) {
        if (!codeEditor || !webInput || !webPre || !webEditBtn) return;

        webState.editing = on;

        if (on) {
            stopTyping(webPre);
            webPre.hidden = true;
            webInput.value = webState[webState.file];
            webInput.hidden = false;
            webInput.focus();
            webInput.setSelectionRange(webInput.value.length, webInput.value.length);
        } else {
            webState[webState.file] = webInput.value;
            webPre.textContent = webInput.value;
            webInput.hidden = true;
            webPre.hidden = false;
            webEditBtn.focus();
        }

        webEditBtn.setAttribute("aria-pressed", String(on));
        webEditBtn.setAttribute(
            "aria-label",
            on ? "Chiudi la modifica del codice" : "Modifica il codice"
        );
        webEditBtn.title = on ? "Chiudi la modifica" : "Modifica il codice";
        codeEditor.classList.toggle("is-editing", on);
        schedulePreview();
    }

    function resetCodeExample() {
        if (!window.confirm("Ripristinare HTML e CSS di esempio?")) return;

        webState.html = webDefaults.html;
        webState.css = webDefaults.css;
        webState.file = "html";
        syncCodeTabs();

        if (webInput) {
            webInput.value = webState.html;
            webInput.setAttribute("aria-label", "Editor del codice HTML");
        }

        if (webPre) {
            stopTyping(webPre);
            webPre.textContent = webState.html;
        }

        schedulePreview();
    }

    if (codeTabs.length) {
        codeTabs.forEach((tab) => {
            tab.addEventListener("click", () => setCodeFile(tab.dataset.file));
        });
    }

    if (webEditBtn) webEditBtn.addEventListener("click", () => setCodeEditing(!webState.editing));
    if (webResetBtn) webResetBtn.addEventListener("click", resetCodeExample);

    if (webInput) {
        webInput.addEventListener("input", () => {
            webState[webState.file] = webInput.value;
            schedulePreview();
        });

        webInput.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
                const start = webInput.selectionStart;
                const end = webInput.selectionEnd;
                webInput.setRangeText("  ", start, end, "end");
                webState[webState.file] = webInput.value;
                schedulePreview();
            } else if (event.key === "Escape") {
                setCodeEditing(false);
            }
        });
    }

    const setPressedGroup = (group, activeItem) => {
        group.forEach((item) => {
            const isActive = item === activeItem;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });
    };

    viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (previewFrame) previewFrame.classList.toggle("is-mobile", button.dataset.view === "mobile");
            setPressedGroup(viewButtons, button);
        });
    });

    swatches.forEach((swatch) => {
        swatch.addEventListener("click", () => {
            webState.accent = swatch.dataset.accent;
            setPressedGroup(swatches, swatch);
            schedulePreview();
        });
    });

    if (webPre) typeWhenVisible(webPre, () => webState.html, 7);

    /* ---------------------------------------------------------------
       CNC: G-code editor with live toolpath
       --------------------------------------------------------------- */
    const cncEditor = document.getElementById("cnc-editor");
    const gcodePre = document.getElementById("gcode-typer");
    const gcodeInput = document.getElementById("gcode-input");
    const gcodeEditBtn = document.getElementById("gcode-edit");
    const gcodeResetBtn = document.getElementById("gcode-reset");
    const toolpathPaths = document.getElementById("toolpath-paths");
    const toolpathStart = document.getElementById("toolpath-start");
    const toolpathTool = document.getElementById("toolpath-tool");
    const toolpathEmpty = document.getElementById("toolpath-empty");
    const gcodePos = document.getElementById("gcode-pos");
    const gcodeStats = document.getElementById("gcode-stats");

    const gcodeDefault = [
        "G21 ; millimetri",
        "G90 ; coordinate assolute",
        "G00 X0 Y0 Z5",
        "M03 S12000",
        "G01 Z-1.5 F200",
        "G01 X40 Y0",
        "G01 X40 Y30",
        "G01 X0 Y30",
        "G01 X0 Y0",
        "G00 Z5",
        "M05",
        "M30",
    ].join("\n");

    const gcodeState = {
        text: gcodeDefault,
        editing: false,
    };

    const SVG_NS = "http://www.w3.org/2000/svg";
    let gcodeTimer = 0;

    const formatAxisValue = (value) => {
        const rounded = Math.round(value * 10) / 10;
        return Object.is(rounded, -0) ? "0" : String(rounded);
    };

    function parseToolpath(source) {
        let x = 0;
        let y = 0;
        let motion = null;
        let absolute = true;
        let blocks = 0;
        const points = [{ x: 0, y: 0 }];
        const segments = [];

        source.split(/\r?\n/).forEach((rawLine) => {
            const line = rawLine.split(";")[0].trim();
            if (!line) return;
            blocks += 1;

            const words = Array.from(
                line.matchAll(/([A-Za-z])\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/g)
            );
            if (!words.length) return;

            let nextX = x;
            let nextY = y;
            let hasX = false;
            let hasY = false;
            let lineMotion = motion;

            words.forEach(([, letterRaw, valueRaw]) => {
                const letter = letterRaw.toUpperCase();
                const value = Number(valueRaw);
                if (!Number.isFinite(value)) return;

                if (letter === "G") {
                    const code = Math.trunc(value);
                    if (code === 0) lineMotion = "rapid";
                    else if (code === 1 || code === 2 || code === 3) lineMotion = "cut";
                    else if (code === 90) absolute = true;
                    else if (code === 91) absolute = false;
                } else if (letter === "X") {
                    nextX = absolute ? value : x + value;
                    hasX = true;
                } else if (letter === "Y") {
                    nextY = absolute ? value : y + value;
                    hasY = true;
                }
            });

            if (hasX || hasY) {
                if (nextX !== x || nextY !== y) {
                    segments.push({
                        from: { x, y },
                        to: { x: nextX, y: nextY },
                        rapid: lineMotion !== "cut",
                    });
                }
                x = nextX;
                y = nextY;
                points.push({ x, y });
                motion = lineMotion;
            } else if (lineMotion) {
                motion = lineMotion;
            }
        });

        return { blocks, points, segments, position: { x, y } };
    }

    function renderToolpath() {
        if (!toolpathPaths) return;

        const { blocks, points, segments, position } = parseToolpath(gcodeState.text);

        if (gcodePos) {
            gcodePos.textContent = `X${formatAxisValue(position.x)} · Y${formatAxisValue(position.y)}`;
        }

        if (!segments.length) {
            toolpathPaths.replaceChildren();
            if (toolpathStart) toolpathStart.style.display = "none";
            if (toolpathTool) toolpathTool.style.display = "none";
            if (toolpathEmpty) toolpathEmpty.style.display = "";
            if (gcodeStats) gcodeStats.textContent = `${blocks} blocchi`;
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        points.forEach((point) => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });

        const width = 320;
        const height = 220;
        const pad = 26;
        const spanX = Math.max(maxX - minX, 0.001);
        const spanY = Math.max(maxY - minY, 0.001);
        const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
        const offsetX = (width - spanX * scale) / 2;
        const offsetY = (height - spanY * scale) / 2;
        const mapX = (value) => offsetX + (value - minX) * scale;
        const mapY = (value) => height - offsetY - (value - minY) * scale;

        toolpathPaths.replaceChildren();

        [
            { className: "toolpath-rapid", rapid: true },
            { className: "toolpath-cut", rapid: false },
        ].forEach(({ className, rapid }) => {
            const d = segments
                .filter((segment) => segment.rapid === rapid)
                .map(
                    (segment) =>
                        `M${mapX(segment.from.x).toFixed(1)} ${mapY(segment.from.y).toFixed(1)}` +
                        `L${mapX(segment.to.x).toFixed(1)} ${mapY(segment.to.y).toFixed(1)}`
                )
                .join("");

            if (!d) return;

            const path = document.createElementNS(SVG_NS, "path");
            path.setAttribute("d", d);
            path.setAttribute("class", className);
            toolpathPaths.appendChild(path);
        });

        const start = points[0];
        const end = points[points.length - 1];

        if (toolpathStart) {
            toolpathStart.style.display = "";
            toolpathStart.setAttribute("cx", mapX(start.x).toFixed(1));
            toolpathStart.setAttribute("cy", mapY(start.y).toFixed(1));
        }

        if (toolpathTool) {
            toolpathTool.style.display = "";
            toolpathTool.setAttribute("cx", mapX(end.x).toFixed(1));
            toolpathTool.setAttribute("cy", mapY(end.y).toFixed(1));
        }

        if (toolpathEmpty) toolpathEmpty.style.display = "none";

        const cutLength = segments
            .filter((segment) => !segment.rapid)
            .reduce(
                (total, segment) =>
                    total +
                    Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y),
                0
            );

        if (gcodeStats) {
            gcodeStats.textContent = `${blocks} blocchi · ${Math.round(cutLength)} mm`;
        }
    }

    function scheduleToolpath() {
        window.clearTimeout(gcodeTimer);
        gcodeTimer = window.setTimeout(renderToolpath, 70);
    }

    function setGcodeEditing(on) {
        if (!cncEditor || !gcodeInput || !gcodePre || !gcodeEditBtn) return;

        gcodeState.editing = on;

        if (on) {
            stopTyping(gcodePre);
            gcodePre.hidden = true;
            gcodeInput.value = gcodeState.text;
            gcodeInput.hidden = false;
            gcodeInput.focus();
            gcodeInput.setSelectionRange(gcodeInput.value.length, gcodeInput.value.length);
        } else {
            gcodeState.text = gcodeInput.value;
            gcodePre.textContent = gcodeState.text;
            gcodeInput.hidden = true;
            gcodePre.hidden = false;
            gcodeEditBtn.focus();
        }

        gcodeEditBtn.setAttribute("aria-pressed", String(on));
        gcodeEditBtn.setAttribute(
            "aria-label",
            on ? "Chiudi la modifica del programma G-code" : "Modifica il programma G-code"
        );
        gcodeEditBtn.title = on ? "Chiudi la modifica" : "Modifica il programma";
        cncEditor.classList.toggle("is-editing", on);
        scheduleToolpath();
    }

    function resetGcodeExample() {
        if (!window.confirm("Ripristinare il programma G-code di esempio?")) return;

        gcodeState.text = gcodeDefault;

        if (gcodeInput) gcodeInput.value = gcodeDefault;
        if (gcodePre) {
            stopTyping(gcodePre);
            gcodePre.textContent = gcodeDefault;
        }

        renderToolpath();
    }

    if (gcodeEditBtn) gcodeEditBtn.addEventListener("click", () => setGcodeEditing(!gcodeState.editing));
    if (gcodeResetBtn) gcodeResetBtn.addEventListener("click", resetGcodeExample);

    if (gcodeInput) {
        gcodeInput.addEventListener("input", () => {
            gcodeState.text = gcodeInput.value;
            scheduleToolpath();
        });

        gcodeInput.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
                const start = gcodeInput.selectionStart;
                const end = gcodeInput.selectionEnd;
                gcodeInput.setRangeText("  ", start, end, "end");
                gcodeState.text = gcodeInput.value;
                scheduleToolpath();
            } else if (event.key === "Escape") {
                setGcodeEditing(false);
            }
        });
    }

    renderToolpath();
    if (gcodePre) typeWhenVisible(gcodePre, () => gcodeState.text, 11);

    /* ---------------------------------------------------------------
       Header state, scroll progress & active nav link
       --------------------------------------------------------------- */
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    function updateScrollUI() {
        const y = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;

        if (header) header.classList.toggle("scrolled", y > 10);
        if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;

        // Scroll spy: last section whose top passed ~35% of the viewport
        let current = sections.length ? sections[0].id : "home";
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
                current = section.id;
            }
        }

        // At the very bottom, always highlight the last section
        if (maxScroll > 0 && y >= maxScroll - 4) {
            current = sections[sections.length - 1].id;
        }

        menuLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${current}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    let ticking = false;
    window.addEventListener(
        "scroll",
        () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                updateScrollUI();
                ticking = false;
            });
        },
        { passive: true }
    );

    updateScrollUI();

    /* ---------------------------------------------------------------
       Reveal on scroll
       --------------------------------------------------------------- */
    const revealItems = Array.from(document.querySelectorAll(".reveal, .entry"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((el) => {
            el.classList.add("is-visible", "animate");
            el.classList.remove("reveal");
        });
    } else {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    if (el.classList.contains("entry")) {
                        el.classList.add("animate");
                    } else {
                        el.classList.add("is-visible");
                        // Free the element from the reveal transition so that
                        // hover styles on cards behave normally afterwards.
                        window.setTimeout(() => el.classList.remove("reveal"), 850);
                    }

                    observer.unobserve(el);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
        );

        revealItems.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------------
       CV preview dialog
       --------------------------------------------------------------- */
    const cvModal = document.getElementById("cv-modal");
    const cvFrame = document.getElementById("cv-frame");
    const cvOpeners = Array.from(document.querySelectorAll("[data-cv-open]"));
    const cvClose = document.querySelector("[data-cv-close]");

    function openCvModal() {
        if (!cvModal) return;

        if (typeof cvModal.showModal !== "function") {
            window.location.href = "cv.html";
            return;
        }

        if (cvFrame && !cvFrame.getAttribute("src")) {
            cvFrame.src = cvFrame.dataset.src || "cv.html";
        }

        if (!cvModal.open) cvModal.showModal();
        body.classList.add("modal-open");
    }

    function closeCvModal() {
        if (cvModal && cvModal.open) cvModal.close();
    }

    cvOpeners.forEach((button) => button.addEventListener("click", openCvModal));

    if (cvClose) cvClose.addEventListener("click", closeCvModal);

    if (cvModal) {
        // Click on the backdrop (the dialog itself, outside its inner wrapper)
        cvModal.addEventListener("click", (event) => {
            if (event.target === cvModal) closeCvModal();
        });

        cvModal.addEventListener("close", () => body.classList.remove("modal-open"));
    }

    /* ---------------------------------------------------------------
       Footer year
       --------------------------------------------------------------- */
    if (year) year.textContent = new Date().getFullYear();
});

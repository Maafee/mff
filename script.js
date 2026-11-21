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
       Web preview controls
       --------------------------------------------------------------- */
    const miniSite = document.getElementById("mini-site");

    if (miniSite) {
        const viewButtons = Array.from(document.querySelectorAll("[data-view]"));
        const swatches = Array.from(document.querySelectorAll("[data-accent]"));

        const setActive = (group, activeItem) => {
            group.forEach((item) => {
                const isActive = item === activeItem;
                item.classList.toggle("is-active", isActive);
                item.setAttribute("aria-pressed", String(isActive));
            });
        };

        viewButtons.forEach((button) => {
            button.addEventListener("click", () => {
                miniSite.classList.toggle("is-mobile", button.dataset.view === "mobile");
                setActive(viewButtons, button);
            });
        });

        swatches.forEach((swatch) => {
            swatch.addEventListener("click", () => {
                miniSite.style.setProperty("--mini-accent", swatch.dataset.accent);
                setActive(swatches, swatch);
            });
        });
    }

    /* ---------------------------------------------------------------
       Code / G-code typewriters
       --------------------------------------------------------------- */
    const typeWhenVisible = (element, text, baseDelay = 10) => {
        if (!element) return;

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

                    let index = 0;
                    const type = () => {
                        element.textContent = text.slice(0, index);
                        index += 1;
                        if (index <= text.length) {
                            window.setTimeout(type, baseDelay + Math.random() * 8);
                        }
                    };

                    type();
                    observer.disconnect();
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(element);
    };

    const webCode = [
        "<!DOCTYPE html>",
        '<html lang="it">',
        "  <head>",
        "    <title>mff</title>",
        '    <link rel="stylesheet" href="mff.css">',
        "  </head>",
        "  <body>",
        '    <section class="hero">',
        '      <p class="eyebrow">Massa, Toscana</p>',
        "      <h1>Matteo Mosti</h1>",
        "      <p>Siti web, reti e macchine CNC.</p>",
        '      <a href="#contact">Scrivimi</a>',
        "    </section>",
        "  </body>",
        "</html>",
    ].join("\n");

    const gcode = [
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

    typeWhenVisible(document.getElementById("web-typer"), webCode, 8);
    typeWhenVisible(document.getElementById("gcode-typer"), gcode, 12);

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
       Footer year
       --------------------------------------------------------------- */
    if (year) year.textContent = new Date().getFullYear();
});

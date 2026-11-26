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
    let attachCursorFrame = () => {};

    if (cursor && finePointer && !reduceMotion) {
        const dot = cursor.querySelector(".cursor-dot");
        const ring = cursor.querySelector(".cursor-ring");
        const hoverSelector =
            "a, button, [data-magnetic], [role='button'], .code-tab, .swatch, .view-btn, .custom-scrollbar-thumb";
        const cursorDocs = new WeakSet();
        const cursorDocsList = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let hovering = false;
        let visible = false;
        let cursorFrame = null;

        const press = () => {
            if (ring) ring.style.opacity = "1";
        };

        const release = () => {
            if (ring) ring.style.opacity = "";
        };

        const isHoverTarget = (target) =>
            Boolean(target && typeof target.closest === "function" && target.closest(hoverSelector));

        function hideCursor() {
            visible = false;
            hovering = false;
            release();
            if (cursorFrame) {
                window.cancelAnimationFrame(cursorFrame);
                cursorFrame = null;
            }
            document.body.classList.remove("has-cursor");
            cursorDocsList.forEach((doc) => {
                if (doc.documentElement) doc.documentElement.classList.remove("has-cursor");
            });
        }

        function moveCursor(x, y, hover) {
            mouseX = x;
            mouseY = y;

            if (!visible) {
                visible = true;
                ringX = x;
                ringY = y;
                document.body.classList.add("has-cursor");
                cursorDocsList.forEach((doc) => {
                    if (doc.documentElement) doc.documentElement.classList.add("has-cursor");
                });
            }

            if (dot) dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            hovering = hover;

            if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
        }

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

        // An iframe owns its document: it never forwards pointer moves to the
        // page, which used to leave the custom cursor stuck on its border.
        // Same-origin frames (preview) forward moves and hide the native cursor.
        attachCursorFrame = (frame) => {
            const doc = frame && frame.contentDocument;
            if (!doc || !doc.head || cursorDocs.has(doc)) return;
            cursorDocs.add(doc);
            cursorDocsList.push(doc);

            const hideNative = doc.createElement("style");
            hideNative.textContent = "html.has-cursor, html.has-cursor body, html.has-cursor body * { cursor: none !important; }";
            doc.head.appendChild(hideNative);
            if (visible && doc.documentElement) doc.documentElement.classList.add("has-cursor");

            doc.addEventListener(
                "pointermove",
                (event) => {
                    const rect = frame.getBoundingClientRect();
                    moveCursor(
                        rect.left + event.clientX,
                        rect.top + event.clientY,
                        isHoverTarget(event.target)
                    );
                },
                { passive: true }
            );

            doc.addEventListener("pointerdown", press, true);
            doc.addEventListener("pointerup", release, true);
            doc.addEventListener("pointercancel", hideCursor);
            doc.addEventListener("pointerleave", hideCursor);
            doc.addEventListener("pointerout", (event) => {
                if (!event.relatedTarget) hideCursor();
            });
        };

        document.addEventListener(
            "pointermove",
            (event) => {
                moveCursor(event.clientX, event.clientY, isHoverTarget(event.target));
            },
            { passive: true }
        );

        document.addEventListener("pointerdown", press, true);
        document.addEventListener("pointerup", release, true);
        document.addEventListener("pointercancel", hideCursor);
        document.addEventListener("pointerleave", hideCursor);
        document.addEventListener("pointerout", (event) => {
            if (!event.relatedTarget) hideCursor();
        });
        window.addEventListener("blur", hideCursor);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) hideCursor();
        });
    }

    /* ---------------------------------------------------------------
       Custom interactive scrollbars (keeps custom cursor alive on drag)
       --------------------------------------------------------------- */
    const panelScrollbarUpdaters = [];
    let updatePageScrollbar = () => {};

    if (finePointer && !reduceMotion) {
        document.documentElement.classList.add("has-custom-scroll");

        const createRail = (className, label) => {
            const rail = document.createElement("div");
            rail.className = className;
            rail.setAttribute("aria-hidden", "true");
            rail.setAttribute("role", "presentation");
            rail.title = label;
            const thumb = document.createElement("div");
            thumb.className = "custom-scrollbar-thumb";
            rail.appendChild(thumb);
            return { rail, thumb };
        };

        // Page-level vertical scrollbar
        const { rail: pageRail, thumb: pageThumb } = createRail("custom-scrollbar", "");
        pageRail.id = "page-scrollbar";
        document.body.appendChild(pageRail);

        let pageDragStartY = 0;
        let pageDragStartScroll = 0;
        let pageDragging = false;

        updatePageScrollbar = () => {
            const docEl = document.documentElement;
            const maxScroll = docEl.scrollHeight - window.innerHeight;
            if (maxScroll <= 4) {
                pageRail.classList.remove("is-visible");
                return;
            }

            pageRail.classList.add("is-visible");
            const trackHeight = Math.max(1, pageRail.clientHeight - 4);
            const ratio = window.innerHeight / docEl.scrollHeight;
            const thumbHeight = Math.max(36, Math.round(trackHeight * ratio));
            const maxThumbY = Math.max(1, trackHeight - thumbHeight);
            const scrollRatio = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

            pageThumb.style.height = `${thumbHeight}px`;
            pageThumb.style.transform = `translate3d(0, ${(scrollRatio * maxThumbY).toFixed(1)}px, 0)`;
        };

        pageThumb.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            pageDragging = true;
            pageDragStartY = event.clientY;
            pageDragStartScroll = window.scrollY;
            pageRail.classList.add("is-dragging");
            try {
                pageThumb.setPointerCapture(event.pointerId);
            } catch (e) {}
        });

        window.addEventListener("pointermove", (event) => {
            if (!pageDragging) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const trackHeight = Math.max(1, pageRail.clientHeight - 4);
            const maxThumbY = Math.max(1, trackHeight - pageThumb.offsetHeight);
            const deltaY = event.clientY - pageDragStartY;
            const nextScroll = Math.min(Math.max(pageDragStartScroll + (deltaY / maxThumbY) * maxScroll, 0), maxScroll);
            window.scrollTo({ top: nextScroll, behavior: "instant" });
        });

        const endPageDrag = (event) => {
            if (!pageDragging) return;
            pageDragging = false;
            try {
                if (pageThumb.hasPointerCapture(event.pointerId)) {
                    pageThumb.releasePointerCapture(event.pointerId);
                }
            } catch (e) {}
            pageRail.classList.remove("is-dragging");
        };

        window.addEventListener("pointerup", endPageDrag);
        window.addEventListener("pointercancel", endPageDrag);

        pageRail.addEventListener("pointerdown", (event) => {
            if (event.target === pageThumb) return;
            event.preventDefault();
            const rect = pageRail.getBoundingClientRect();
            const trackHeight = Math.max(1, rect.height - 4);
            const thumbH = pageThumb.offsetHeight || 40;
            const clickY = event.clientY - rect.top - 2 - thumbH / 2;
            const ratio = Math.min(Math.max(clickY / Math.max(1, trackHeight - thumbH), 0), 1);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: ratio * maxScroll, behavior: "instant" });
        });

        if ("ResizeObserver" in window) {
            const bodyResizeObserver = new ResizeObserver(updatePageScrollbar);
            bodyResizeObserver.observe(document.body);
        }
        window.addEventListener("resize", updatePageScrollbar, { passive: true });
        updatePageScrollbar();

        // Panel scrollbars (Web code editor & CNC G-code editor)
        const attachPanelScrollbar = (container, getTarget) => {
            if (!container) return;
            const { rail, thumb } = createRail("panel-scrollbar", "");
            container.appendChild(rail);

            let dragStartY = 0;
            let dragStartTop = 0;
            let dragging = false;

            const sync = () => {
                const target = getTarget();
                if (!target || target.hidden) {
                    rail.classList.remove("is-visible");
                    return;
                }
                const maxScroll = target.scrollHeight - target.clientHeight;
                if (maxScroll <= 4) {
                    rail.classList.remove("is-visible");
                    return;
                }
                rail.classList.add("is-visible");
                const trackHeight = Math.max(1, rail.clientHeight - 2);
                const thumbHeight = Math.max(28, Math.round(trackHeight * (target.clientHeight / target.scrollHeight)));
                const maxThumbY = Math.max(1, trackHeight - thumbHeight);
                const scrollRatio = Math.min(Math.max(target.scrollTop / maxScroll, 0), 1);
                thumb.style.height = `${thumbHeight}px`;
                thumb.style.transform = `translate3d(0, ${(scrollRatio * maxThumbY).toFixed(1)}px, 0)`;
            };

            thumb.addEventListener("pointerdown", (event) => {
                const target = getTarget();
                if (!target) return;
                event.preventDefault();
                event.stopPropagation();
                dragging = true;
                dragStartY = event.clientY;
                dragStartTop = target.scrollTop;
                rail.classList.add("is-dragging");
                try {
                    thumb.setPointerCapture(event.pointerId);
                } catch (e) {}
            });

            window.addEventListener("pointermove", (event) => {
                if (!dragging) return;
                const target = getTarget();
                if (!target) return;
                const maxScroll = target.scrollHeight - target.clientHeight;
                const trackHeight = Math.max(1, rail.clientHeight - 2);
                const maxThumbY = Math.max(1, trackHeight - thumb.offsetHeight);
                const deltaY = event.clientY - dragStartY;
                target.scrollTop = Math.min(Math.max(dragStartTop + (deltaY / maxThumbY) * maxScroll, 0), maxScroll);
            });

            const endDrag = (event) => {
                if (!dragging) return;
                dragging = false;
                try {
                    if (thumb.hasPointerCapture(event.pointerId)) {
                        thumb.releasePointerCapture(event.pointerId);
                    }
                } catch (e) {}
                rail.classList.remove("is-dragging");
            };

            window.addEventListener("pointerup", endDrag);
            window.addEventListener("pointercancel", endDrag);

            rail.addEventListener("pointerdown", (event) => {
                if (event.target === thumb) return;
                const target = getTarget();
                if (!target) return;
                event.preventDefault();
                const rect = rail.getBoundingClientRect();
                const trackHeight = Math.max(1, rect.height - 2);
                const thumbH = thumb.offsetHeight || 28;
                const clickY = event.clientY - rect.top - 1 - thumbH / 2;
                const ratio = Math.min(Math.max(clickY / Math.max(1, trackHeight - thumbH), 0), 1);
                target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
            });

            container.addEventListener("scroll", sync, true);
            container.addEventListener("input", sync, true);
            if ("MutationObserver" in window) {
                const mo = new MutationObserver(sync);
                mo.observe(container, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ["hidden"],
                });
            }
            if ("ResizeObserver" in window) {
                const ro = new ResizeObserver(sync);
                ro.observe(container);
            }
            window.addEventListener("resize", sync, { passive: true });
            panelScrollbarUpdaters.push(sync);
            sync();
        };

        const webEditorBox = document.getElementById("web-editor");
        const webTyperEl = document.getElementById("web-typer");
        const webInputEl = document.getElementById("web-input");
        attachPanelScrollbar(webEditorBox, () => (webInputEl && !webInputEl.hidden ? webInputEl : webTyperEl));

        const gcodePaneEl = document.querySelector(".gcode-pane");
        const gcodeTyperEl = document.getElementById("gcode-typer");
        const gcodeInputEl = document.getElementById("gcode-input");
        attachPanelScrollbar(gcodePaneEl, () => (gcodeInputEl && !gcodeInputEl.hidden ? gcodeInputEl : gcodeTyperEl));
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
       Timeline scroll progress (vertical spine & active step)
       --------------------------------------------------------------- */
    const timeline = document.getElementById("timeline");
    const timelineStage = timeline ? timeline.querySelector(".timeline-stage") : null;
    const timelineBar = document.getElementById("timeline-bar");
    const timelineStep = document.getElementById("timeline-step");
    const timelineTotal = document.getElementById("timeline-total");
    const timelineEntries = timeline ? Array.from(timeline.querySelectorAll(".entry")) : [];

    if (timelineTotal && timelineEntries.length) {
        timelineTotal.textContent = String(timelineEntries.length).padStart(2, "0");
    }

    function updateTimeline() {
        if (!timelineStage || !timelineBar || !timelineEntries.length) return;

        const rect = timelineStage.getBoundingClientRect();
        const triggerY = window.innerHeight * 0.55;
        const span = Math.max(1, rect.height - 60);
        const progress = Math.min(Math.max((triggerY - rect.top) / span, 0.06), 1);
        timelineBar.style.transform = `scaleY(${progress.toFixed(4)})`;

        let activeIdx = 0;
        timelineEntries.forEach((entry, idx) => {
            const eRect = entry.getBoundingClientRect();
            const passed = eRect.top <= triggerY;
            if (passed) activeIdx = idx;
            entry.classList.toggle("is-active", passed);
        });

        if (timelineStep) {
            timelineStep.textContent = String(activeIdx + 1).padStart(2, "0");
        }
    }

    if (timelineStage) {
        window.addEventListener("resize", updateTimeline, { passive: true });
        updateTimeline();
    }

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
        // Long snippets (the CSS file) type faster so the panel never feels stuck.
        const delay = Math.max(1, Math.min(baseDelay, 5200 / Math.max(text.length, 1)));

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
                    // Type a few characters per tick on long files: the panel
                    // stays under ~4s even when timers get throttled.
                    const step = Math.max(1, Math.ceil(text.length / 420));
                    const timers = [];
                    typingTimers.set(element, timers);

                    const type = () => {
                        index = Math.min(index + step, text.length);
                        element.textContent = text.slice(0, index);

                        if (element.scrollHeight > element.clientHeight) {
                            element.scrollTop = index >= text.length ? 0 : element.scrollHeight;
                        }

                        if (index < text.length) {
                            timers.push(window.setTimeout(type, delay + Math.random() * 4));
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
        "a, button, [role='button'], .btn { pointer-events: none !important; cursor: default !important; }",
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
        doc.body.querySelectorAll("a, button, [role='button']").forEach((el) => {
            el.setAttribute("tabindex", "-1");
            el.setAttribute("aria-disabled", "true");
        });
        doc.documentElement.style.setProperty("--accent", webState.accent);
    }

    function schedulePreview() {
        window.clearTimeout(previewTimer);
        previewTimer = window.setTimeout(renderPreview, 80);
    }

    if (webPreview) {
        const guardedDocs = new WeakSet();
        webPreview.srcdoc = previewShell;
        webPreview.addEventListener("load", () => {
            previewReady = true;
            const doc = webPreview.contentDocument;
            if (doc && !guardedDocs.has(doc)) {
                guardedDocs.add(doc);
                doc.addEventListener(
                    "click",
                    (event) => {
                        if (event.target && event.target.closest("a, button, [role='button'], form")) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    },
                    true
                );
                doc.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    },
                    true
                );
            }
            renderPreview();
            attachCursorFrame(webPreview);
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
            webPre.scrollTop = 0;
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
            webPre.scrollTop = 0;
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
            webPre.scrollTop = 0;
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
    const toolpathProgress = document.getElementById("toolpath-progress");
    const toolpathStart = document.getElementById("toolpath-start");
    const toolpathRing = document.getElementById("toolpath-ring");
    const toolpathTool = document.getElementById("toolpath-tool");
    const toolpathEmpty = document.getElementById("toolpath-empty");
    const gcodePos = document.getElementById("gcode-pos");
    const gcodeStats = document.getElementById("gcode-stats");

    const gcodeDefault = [
        "G21 ; millimetri",
        "G90 ; coordinate assolute",
        "G00 X8 Y0 Z5",
        "M03 S12000",
        "G01 Z-1.5 F200",
        "G01 X32 Y0",
        "G03 X40 Y8 I0 J8 ; raccordo R8",
        "G01 X40 Y22",
        "G03 X32 Y30 I-8 J0 ; raccordo R8",
        "G01 X8 Y30",
        "G03 X0 Y22 I0 J-8 ; raccordo R8",
        "G01 X0 Y8",
        "G03 X8 Y0 I8 J0 ; raccordo R8",
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

    // Circular interpolation (G02/G03). I and J are offsets from the start
    // point, R is the arc radius; the result is sampled into small line steps.
    function buildArc(x0, y0, x1, y1, { iOffset, jOffset, hasI, hasJ, radius, clockwise }) {
        const TAU = Math.PI * 2;
        let cx;
        let cy;

        if (hasI || hasJ) {
            cx = x0 + (hasI ? iOffset : 0);
            cy = y0 + (hasJ ? jOffset : 0);
        } else if (radius !== null && radius !== 0) {
            const arcRadius = Math.abs(radius);
            const dx = (x1 - x0) / 2;
            const dy = (y1 - y0) / 2;
            const half = Math.hypot(dx, dy);
            if (half < 1e-6 || half > arcRadius) return null;

            const h = Math.sqrt(arcRadius * arcRadius - half * half);
            const mx = (x0 + x1) / 2;
            const my = (y0 + y1) / 2;
            const nx = -dy / half;
            const ny = dx / half;
            const largeArc = radius < 0;
            const candidates = [
                { x: mx + nx * h, y: my + ny * h },
                { x: mx - nx * h, y: my - ny * h },
            ];

            cx = candidates[0].x;
            cy = candidates[0].y;

            for (const candidate of candidates) {
                const startAngle = Math.atan2(y0 - candidate.y, x0 - candidate.x);
                const endAngle = Math.atan2(y1 - candidate.y, x1 - candidate.x);
                let candidateSpan = clockwise ? startAngle - endAngle : endAngle - startAngle;
                candidateSpan = ((candidateSpan % TAU) + TAU) % TAU;
                if (candidateSpan < 1e-9) candidateSpan = TAU;

                if (largeArc ? candidateSpan >= Math.PI : candidateSpan <= Math.PI) {
                    cx = candidate.x;
                    cy = candidate.y;
                    break;
                }
            }
        } else {
            return null;
        }

        const r = Math.hypot(x0 - cx, y0 - cy);
        if (r < 1e-6 || !Number.isFinite(r)) return null;

        const a0 = Math.atan2(y0 - cy, x0 - cx);
        const a1 = Math.atan2(y1 - cy, x1 - cx);
        let span = clockwise ? a0 - a1 : a1 - a0;
        span = ((span % TAU) + TAU) % TAU;
        if (span < 1e-9) span = TAU; // full circle

        const sweep = clockwise ? -span : span;
        const steps = Math.max(8, Math.ceil(span / (Math.PI / 32)));
        const samples = [];

        for (let step = 1; step <= steps; step += 1) {
            const angle = a0 + (sweep * step) / steps;
            samples.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }

        samples[steps - 1] = { x: x1, y: y1 };

        return { samples, length: r * span };
    }

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
            let clockwise = false;
            let iOffset = 0;
            let jOffset = 0;
            let hasI = false;
            let hasJ = false;
            let radius = null;

            words.forEach(([, letterRaw, valueRaw]) => {
                const letter = letterRaw.toUpperCase();
                const value = Number(valueRaw);
                if (!Number.isFinite(value)) return;

                if (letter === "G") {
                    const code = Math.trunc(value);
                    if (code === 0) {
                        lineMotion = "rapid";
                        clockwise = false;
                    } else if (code === 1) {
                        lineMotion = "cut";
                        clockwise = false;
                    } else if (code === 2 || code === 3) {
                        lineMotion = "arc";
                        clockwise = code === 2;
                    } else if (code === 90) {
                        absolute = true;
                    } else if (code === 91) {
                        absolute = false;
                    }
                } else if (letter === "X") {
                    nextX = absolute ? value : x + value;
                    hasX = true;
                } else if (letter === "Y") {
                    nextY = absolute ? value : y + value;
                    hasY = true;
                } else if (letter === "I") {
                    iOffset = value;
                    hasI = true;
                } else if (letter === "J") {
                    jOffset = value;
                    hasJ = true;
                } else if (letter === "R") {
                    radius = value;
                }
            });

            if (!hasX && !hasY) {
                if (lineMotion) motion = lineMotion;
                return;
            }

            if (lineMotion === "arc") {
                const arc = buildArc(x, y, nextX, nextY, {
                    iOffset,
                    jOffset,
                    hasI,
                    hasJ,
                    radius,
                    clockwise,
                });

                if (arc) {
                    segments.push({
                        from: { x, y },
                        to: { x: nextX, y: nextY },
                        rapid: false,
                        arc,
                    });
                    arc.samples.forEach((point) => points.push(point));
                } else if (nextX !== x || nextY !== y) {
                    segments.push({
                        from: { x, y },
                        to: { x: nextX, y: nextY },
                        rapid: false,
                    });
                }
            } else if (nextX !== x || nextY !== y) {
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
        });

        return { blocks, points, segments, position: { x, y } };
    }

    let cncVisible = false;
    let toolpathRaf = 0;
    let toolpathAnim = null;

    function stopToolpathAnimation() {
        if (toolpathRaf) {
            window.cancelAnimationFrame(toolpathRaf);
            toolpathRaf = 0;
        }
    }

    function applyToolpathAt(elapsed) {
        if (!toolpathAnim || !toolpathAnim.steps.length) return;
        const { steps, motionDuration, totalDuration, endPos } = toolpathAnim;
        const t = elapsed % totalDuration;

        let curX = endPos.sx;
        let curY = endPos.sy;
        let curWX = endPos.wx;
        let curWY = endPos.wy;
        let curRapid = true;
        let activeIdx = steps.length - 1;
        let segAlpha = 1;

        if (t < motionDuration) {
            for (let i = 0; i < steps.length; i += 1) {
                const step = steps[i];
                if (t <= step.endT || i === steps.length - 1) {
                    activeIdx = i;
                    const dur = Math.max(step.endT - step.startT, 1e-4);
                    segAlpha = Math.min(Math.max((t - step.startT) / dur, 0), 1);
                    curX = step.x0 + (step.x1 - step.x0) * segAlpha;
                    curY = step.y0 + (step.y1 - step.y0) * segAlpha;
                    curWX = step.wx0 + (step.wx1 - step.wx0) * segAlpha;
                    curWY = step.wy0 + (step.wy1 - step.wy0) * segAlpha;
                    curRapid = step.rapid;
                    break;
                }
            }
        } else {
            curRapid = false;
        }

        if (toolpathTool) {
            toolpathTool.setAttribute("cx", curX.toFixed(1));
            toolpathTool.setAttribute("cy", curY.toFixed(1));
        }

        if (toolpathRing) {
            toolpathRing.setAttribute("cx", curX.toFixed(1));
            toolpathRing.setAttribute("cy", curY.toFixed(1));
            toolpathRing.classList.toggle("is-rapid", curRapid);
        }

        if (toolpathProgress) {
            let cutD = "";
            let penDown = false;
            for (let i = 0; i <= activeIdx; i += 1) {
                const step = steps[i];
                if (step.rapid) {
                    penDown = false;
                    continue;
                }
                const ex = i === activeIdx ? curX : step.x1;
                const ey = i === activeIdx ? curY : step.y1;
                if (!penDown) {
                    cutD += `M${step.x0.toFixed(1)} ${step.y0.toFixed(1)}`;
                    penDown = true;
                }
                cutD += `L${ex.toFixed(1)} ${ey.toFixed(1)}`;
            }
            toolpathProgress.setAttribute("d", cutD);
        }

        if (gcodePos) {
            gcodePos.textContent = `X${formatAxisValue(curWX)} · Y${formatAxisValue(curWY)}`;
        }
    }

    function startToolpathAnimation() {
        if (reduceMotion || !toolpathAnim || !toolpathAnim.steps.length || !cncVisible || document.hidden) return;
        if (toolpathRaf) return;
        const startedAt = performance.now();
        const loop = (now) => {
            if (!cncVisible || document.hidden || !toolpathAnim) {
                toolpathRaf = 0;
                return;
            }
            applyToolpathAt((now - startedAt) / 1000);
            toolpathRaf = window.requestAnimationFrame(loop);
        };
        toolpathRaf = window.requestAnimationFrame(loop);
    }

    function renderToolpath() {
        if (!toolpathPaths) return;

        stopToolpathAnimation();
        const { blocks, points, segments, position } = parseToolpath(gcodeState.text);

        if (gcodePos) {
            gcodePos.textContent = `X${formatAxisValue(position.x)} · Y${formatAxisValue(position.y)}`;
        }

        if (!segments.length) {
            toolpathAnim = null;
            toolpathPaths.replaceChildren();
            if (toolpathProgress) toolpathProgress.setAttribute("d", "");
            if (toolpathStart) toolpathStart.style.display = "none";
            if (toolpathRing) toolpathRing.style.display = "none";
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
            { className: reduceMotion ? "toolpath-cut" : "toolpath-guide", rapid: false },
        ].forEach(({ className, rapid }) => {
            const d = segments
                .filter((segment) => segment.rapid === rapid)
                .map((segment) => {
                    let commands =
                        `M${mapX(segment.from.x).toFixed(1)} ${mapY(segment.from.y).toFixed(1)}`;
                    const nodes = segment.arc ? segment.arc.samples : [segment.to];

                    nodes.forEach((point) => {
                        commands += `L${mapX(point.x).toFixed(1)} ${mapY(point.y).toFixed(1)}`;
                    });

                    return commands;
                })
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

        if (toolpathRing) {
            toolpathRing.style.display = reduceMotion ? "none" : "";
            toolpathRing.setAttribute("cx", mapX(end.x).toFixed(1));
            toolpathRing.setAttribute("cy", mapY(end.y).toFixed(1));
        }

        if (toolpathTool) {
            toolpathTool.style.display = "";
            toolpathTool.setAttribute("cx", mapX(end.x).toFixed(1));
            toolpathTool.setAttribute("cy", mapY(end.y).toFixed(1));
        }

        if (toolpathProgress) {
            toolpathProgress.setAttribute("d", "");
        }

        if (toolpathEmpty) toolpathEmpty.style.display = "none";

        const cutLength = segments
            .filter((segment) => !segment.rapid)
            .reduce(
                (total, segment) =>
                    total +
                    (segment.arc
                        ? segment.arc.length
                        : Math.hypot(
                              segment.to.x - segment.from.x,
                              segment.to.y - segment.from.y
                          )),
                0
            );

        if (gcodeStats) {
            gcodeStats.textContent = `${blocks} blocchi · ${Math.round(cutLength)} mm`;
        }

        // Build animation steps across all rapid, linear, and sampled arc moves.
        const steps = [];
        let accTime = 0;
        segments.forEach((segment) => {
            const nodes = segment.arc ? segment.arc.samples : [segment.to];
            const speed = segment.rapid ? 230 : 92;
            let prev = segment.from;

            nodes.forEach((next) => {
                const x0 = mapX(prev.x);
                const y0 = mapY(prev.y);
                const x1 = mapX(next.x);
                const y1 = mapY(next.y);
                const dist = Math.hypot(x1 - x0, y1 - y0);
                if (dist > 0.01) {
                    const dur = dist / speed;
                    steps.push({
                        x0,
                        y0,
                        x1,
                        y1,
                        wx0: prev.x,
                        wy0: prev.y,
                        wx1: next.x,
                        wy1: next.y,
                        rapid: segment.rapid,
                        startT: accTime,
                        endT: accTime + dur,
                    });
                    accTime += dur;
                }
                prev = next;
            });
        });

        toolpathAnim = {
            steps,
            motionDuration: accTime,
            totalDuration: accTime + 0.85,
            endPos: { sx: mapX(end.x), sy: mapY(end.y), wx: position.x, wy: position.y },
        };

        if (!reduceMotion && cncVisible) {
            startToolpathAnimation();
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

    if (cncEditor && !reduceMotion && "IntersectionObserver" in window) {
        const cncObserver = new IntersectionObserver(
            (entries) => {
                cncVisible = entries.some((entry) => entry.isIntersecting);
                if (cncVisible) {
                    startToolpathAnimation();
                } else {
                    stopToolpathAnimation();
                }
            },
            { threshold: 0.15 }
        );
        cncObserver.observe(cncEditor);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopToolpathAnimation();
            } else if (cncVisible) {
                startToolpathAnimation();
            }
        });
    }

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
        updateTimeline();
        updatePageScrollbar();

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

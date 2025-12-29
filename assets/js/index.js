/**
 * Prime Automotive - Index (Hub) Page JavaScript
 *
 * This module exposes window.PrimeHub.init() for manual re-initialization.
 * Safe to load on non-hub pages (it no-ops if hub DOM isn't present).
 */

(function () {
    function init() {
        const splitHero = document.getElementById("splitHero");
        if (!splitHero) return; // Not on hub

        // Avoid duplicate bindings for the same DOM instance
        if (splitHero.dataset.hubInit === "1") return;
        splitHero.dataset.hubInit = "1";

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const canHover = window.matchMedia("(hover: hover)").matches;

        const preloader = document.getElementById("preloader");
        const panelLeft = document.getElementById("panelLeft");
        const panelRight = document.getElementById("panelRight");
        const diagonalLine = document.getElementById("diagonalLine");

        // ═══════════════════════════════════════════════════════════
        // UPDATE DIAGONAL LINE POSITION - PIXEL MATH
        // Converts CSS variable to actual pixel positions for SVG
        // ═══════════════════════════════════════════════════════════
        function updateDiagonalLine() {
            if (!splitHero || !diagonalLine) return;

            const rect = splitHero.getBoundingClientRect();
            const style = getComputedStyle(splitHero);
            const splitXPercent = parseFloat(style.getPropertyValue("--split-x"));
            const offsetPercent = parseFloat(style.getPropertyValue("--diagonal-offset"));

            if (isNaN(splitXPercent) || isNaN(offsetPercent)) return;

            // Convert to actual pixels
            const x = rect.width * (splitXPercent / 100);
            const o = rect.width * (offsetPercent / 100);

            diagonalLine.setAttribute("x1", x + o);
            diagonalLine.setAttribute("x2", x - o);
        }

        // ═══════════════════════════════════════════════════════════
        // FORCE INITIAL SYNC
        // ═══════════════════════════════════════════════════════════
        if (typeof gsap !== "undefined") {
            gsap.set(splitHero, { "--split-x": "50%" });
            updateDiagonalLine();
        }

        // ═══════════════════════════════════════════════════════════
        // PRELOADER
        // ═══════════════════════════════════════════════════════════
        // ═══════════════════════════════════════════════════════════
        // LOGO COLOR SWITCH ON HOVER
        // ═══════════════════════════════════════════════════════════
        function initLogoSwitch() {
            const leftPanel = document.getElementById("panelLeft");
            const rightPanel = document.getElementById("panelRight");

            if (leftPanel) {
                leftPanel.addEventListener("mouseenter", () => {
                    console.log("Left panel hover - removing blue");
                    splitHero.classList.remove("hovering-right");
                });
            }

            if (rightPanel) {
                rightPanel.addEventListener("mouseenter", () => {
                    console.log("Right panel hover - adding blue");
                    splitHero.classList.add("hovering-right");
                });
            }

            splitHero.addEventListener("mouseleave", () => {
                console.log("Split hero leave - resetting to red");
                splitHero.classList.remove("hovering-right");
            });
        }

        function startIntro() {
            // Guard: GSAP is required for the hub
            if (typeof gsap === "undefined") return;

            // If there's a preloader (hard load on hub), fade it out.
            // Otherwise, just run the intro immediately.
            if (!preloader) {
                initIntroAnimation();
                return;
            }

            setTimeout(() => {
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        if (preloader) preloader.style.display = "none";
                        initIntroAnimation();
                    },
                });
            }, 2200);
        }

        // ═══════════════════════════════════════════════════════════
        // INTRO ANIMATION
        // ═══════════════════════════════════════════════════════════
        function initIntroAnimation() {
            if (prefersReducedMotion) {
                gsap.set(
                    ["#topBar", "#bottomBar", "#contentLeft", "#contentRight", "#cornerTL", "#cornerBR", "#version"],
                    {
                        opacity: 1,
                        y: 0,
                    }
                );
                return;
            }

            const tl = gsap.timeline();

            tl.to("#topBar", { opacity: 1, duration: 0.8, ease: "power2.out" })
                .to("#bottomBar", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
                .to("#contentLeft", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
                .to("#contentRight", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
                .to(["#cornerTL", "#cornerBR"], { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.4")
                .to("#version", { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.3");
        }

        // ═══════════════════════════════════════════════════════════
        // PAGE TRANSITION - Handled by CSS transitions
        // Links use GSAP for smooth animated transitions
        // ═══════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════════════════════
        // HOVER STATE - GSAP animates --split-x for reliable smoothness
        // CSS transitions can't be trusted across all hardware
        // ═══════════════════════════════════════════════════════════
        if (canHover && panelLeft && panelRight) {
            // GSAP animation config - smooth and intentional
            const splitConfig = {
                duration: 1.2,
                ease: "power2.inOut",
                overwrite: "auto",
                onUpdate: updateDiagonalLine,
            };

            panelLeft.addEventListener("mouseenter", () => {
                document.body.classList.add("hovering");
                splitHero.classList.add("hover-left");
                splitHero.classList.remove("hover-right");
                gsap.to(splitHero, { "--split-x": "75%", ...splitConfig });
            });

            panelRight.addEventListener("mouseenter", () => {
                document.body.classList.add("hovering");
                splitHero.classList.add("hover-right");
                splitHero.classList.remove("hover-left");
                gsap.to(splitHero, { "--split-x": "25%", ...splitConfig });
            });

            splitHero.addEventListener("mouseleave", () => {
                document.body.classList.remove("hovering");
                splitHero.classList.remove("hover-left", "hover-right");
                gsap.to(splitHero, { "--split-x": "50%", ...splitConfig });
            });

            // Subtle parallax on content
            document.querySelectorAll(".panel").forEach((panel) => {
                const content = panel.querySelector(".panel-content");
                if (!content) return;

                panel.addEventListener("mousemove", (e) => {
                    const rect = panel.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;

                    gsap.to(content, {
                        x: x * 20,
                        y: y * 20,
                        duration: 0.5,
                        ease: "power2.out",
                    });
                });

                panel.addEventListener("mouseleave", () => {
                    gsap.to(content, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: "power2.out",
                    });
                });
            });
        }

        // ═══════════════════════════════════════════════════════════
        // MOBILE TAP FEEDBACK
        // ═══════════════════════════════════════════════════════════
        if (!canHover && !prefersReducedMotion) {
            document.querySelectorAll(".panel").forEach((panel) => {
                panel.addEventListener(
                    "touchstart",
                    function () {
                        const content = this.querySelector(".panel-content");
                        if (!content) return;
                        gsap.to(content, {
                            scale: 0.98,
                            duration: 0.15,
                            ease: "power2.out",
                        });
                    },
                    { passive: true }
                );

                panel.addEventListener(
                    "touchend",
                    function () {
                        const content = this.querySelector(".panel-content");
                        if (!content) return;
                        gsap.to(content, {
                            scale: 1,
                            duration: 0.4,
                            ease: "elastic.out(1, 0.5)",
                        });
                    },
                    { passive: true }
                );
            });
        }

        // Resize handling now covered by GSAP ticker (fires every frame)
        // No need for debounced resize handler

        // Initial sync + intro
        updateDiagonalLine();
        startIntro();
        initLogoSwitch();
    }

    window.PrimeHub = window.PrimeHub || {};
    window.PrimeHub.init = init;

    document.addEventListener("DOMContentLoaded", init);
})();

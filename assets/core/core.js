/**
 * Prime Automotive - Core Shared JavaScript
 * =========================================
 * Unified logic for all three sites (Hub, Mechanical, Collision)
 *
 * FEATURES:
 * - Device detection (hover capability, not just screen width)
 * - GSAP helpers with standardized easing/durations
 * - Page transition handling
 * - Section reveal animations
 * - Navigation context awareness
 */

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL RESTORATION - Let browser handle it naturally
// ═══════════════════════════════════════════════════════════════════════════
// Removed: history.scrollRestoration = "manual" - was causing mobile scroll-to-top issues

(function () {
	"use strict";

	const PrimeCore = {
		// ----------------------------------------------------------------------
		// DEVICE + CAPABILITY DETECTION
		// ----------------------------------------------------------------------
		canHover: window.matchMedia("(hover: hover)").matches,
		isMobile: window.innerWidth <= 768,
		prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
		isLowPowerDevice: false,

		// ----------------------------------------------------------------------
		// ANIMATION SYSTEM
		// ----------------------------------------------------------------------
		durations: {
			micro: 0.25,
			ui: 0.5,
			hero: 1,
		},

		easings: {
			out: "expo.out",
			power3: "power3.out",
			elastic: "elastic.out(1, 0.75)",
			smooth: "power2.inOut",
		},

		// ----------------------------------------------------------------------
		// INIT
		// ----------------------------------------------------------------------
		init() {
			this.detectLowPowerDevice();
			this.setupNavigationContext();
			this.initPageTransitions();
			this.initSectionReveals();
			this.makePhoneNumbersClickable();
			this.initMobileScrollTop();

			console.log("PrimeCore initialized:", {
				canHover: this.canHover,
				isMobile: this.isMobile,
				prefersReducedMotion: this.prefersReducedMotion,
				isLowPowerDevice: this.isLowPowerDevice,
			});
		},

		// ----------------------------------------------------------------------
		// LOW POWER DEVICE DETECTION
		// ----------------------------------------------------------------------
		detectLowPowerDevice() {
			const lowMemory =
				navigator.deviceMemory && navigator.deviceMemory < 4;

			const slowConnection =
				navigator.connection &&
				(navigator.connection.saveData ||
					navigator.connection.effectiveType === "2g");

			this.isLowPowerDevice =
				lowMemory || slowConnection || this.prefersReducedMotion;
		},

		// ----------------------------------------------------------------------
		// NAVIGATION CONTEXT
		// ----------------------------------------------------------------------
		setupNavigationContext() {
			const path = window.location.pathname;

			if (path.includes("auto.html")) {
				sessionStorage.setItem("lastSite", "mechanical");
			} else if (path.includes("collision.html")) {
				sessionStorage.setItem("lastSite", "collision");
			}
		},

		// ----------------------------------------------------------------------
		// PAGE TRANSITIONS (LEGACY FALLBACK)
		// ----------------------------------------------------------------------
		initPageTransitions() {
			const transitionIn = document.getElementById("pageTransitionIn");
			if (transitionIn) {
				transitionIn.style.opacity = "0";
				transitionIn.remove();
			}
		},

		// ----------------------------------------------------------------------
		// SECTION REVEALS (GSAP) - SMOOTH CINEMATIC SCROLL ANIMATIONS
		// ----------------------------------------------------------------------
		initSectionReveals() {
			if (this.prefersReducedMotion || typeof gsap === "undefined") return;
			if (typeof ScrollTrigger === "undefined") return;

			gsap.registerPlugin(ScrollTrigger);

			ScrollTrigger.config({ ignoreMobileResize: true });

			// Set GSAP defaults for smoother GPU-accelerated animations
			gsap.defaults({
				force3D: true,
				overwrite: "auto",
			});

			const mm = gsap.matchMedia();

			// ══════════════════════════════════════════════════════════════════
			// SMOOTH TITLE REVEALS - Clean rise effect
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".sec-title, .hero-title, h2").forEach(title => {
				if (!title || title.closest(".th-carousel")) return;

				gsap.fromTo(
					title,
					{
						autoAlpha: 0,
						y: 50,
					},
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.8,
						ease: "power2.out",
						scrollTrigger: {
							trigger: title,
							start: "top 90%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// SUBTITLE / BADGE SMOOTH SLIDE-IN
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".sub-title, .insurance-hero-badge").forEach(el => {
				if (!el || el.closest(".th-carousel")) return;

				gsap.fromTo(
					el,
					{
						autoAlpha: 0,
						x: -40,
					},
					{
						autoAlpha: 1,
						x: 0,
						duration: 0.7,
						ease: "power2.out",
						scrollTrigger: {
							trigger: el,
							start: "top 90%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// SERVICE CARDS - SMOOTH STAGGER RISE
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".row.gy-4").forEach(row => {
				const cards = row.querySelectorAll(".collision-service-card, .process-box, .feature-card");
				if (!cards.length) return;

				gsap.fromTo(
					cards,
					{
						autoAlpha: 0,
						y: 60,
						scale: 0.95,
					},
					{
						autoAlpha: 1,
						y: 0,
						scale: 1,
						duration: 0.9,
						stagger: 0.15,
						ease: "expo.out",
						scrollTrigger: {
							trigger: row,
							start: "top 85%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// BEFORE/AFTER COMPARISON CARDS - SMOOTH ALTERNATE SLIDE
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".comparison-card").forEach((card, i) => {
				const direction = i % 2 === 0 ? -1 : 1;

				gsap.fromTo(
					card,
					{
						autoAlpha: 0,
						y: 50,
						x: direction * 30,
					},
					{
						autoAlpha: 1,
						y: 0,
						x: 0,
						duration: 0.8,
						ease: "power2.out",
						scrollTrigger: {
							trigger: card,
							start: "top 90%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// TRUST ITEMS - SMOOTH STAGGER
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".trust-bar, .trust-proof").forEach(bar => {
				const items = bar.querySelectorAll(".trust-item, .trust-proof__item");
				if (!items.length) return;

				gsap.fromTo(
					items,
					{
						autoAlpha: 0,
						y: 30,
						scale: 0.5,
					},
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.6,
						stagger: 0.08,
						ease: "power2.out",
						scrollTrigger: {
							trigger: bar,
							start: "top 90%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// ABOUT SECTION IMAGE - SMOOTH REVEAL
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".img-box3, .img-box-3").forEach(box => {
				if (!box) return;

				gsap.fromTo(
					box,
					{
						autoAlpha: 0,
						x: -60,
						scale: 0.95,
					},
					{
						autoAlpha: 1,
						x: 0,
						scale: 1,
						duration: 0.9,
						ease: "power2.out",
						scrollTrigger: {
							trigger: box,
							start: "top 85%",
							once: true,
						},
					}
				);

				// Counter badge smooth pop
				const counter = box.querySelector(".about-counter");
				if (counter) {
					gsap.fromTo(
						counter,
						{
							autoAlpha: 0,
							scale: 0.8,
						},
						{
							autoAlpha: 1,
							scale: 1,
							duration: 0.5,
							delay: 0.3,
							ease: "power2.out",
							scrollTrigger: {
								trigger: box,
								start: "top 85%",
								once: true,
							},
						}
					);
				}
			});

			// ══════════════════════════════════════════════════════════════════
			// FEATURE SECTION (WHY CHOOSE US) - SMOOTH SPLIT
			// ══════════════════════════════════════════════════════════════════
			const featureSection = document.querySelector(".bg-title2, #why");
			if (featureSection) {
				const featureImg = featureSection.querySelector(".feature-img-wrap, .feature-img");
				const featureContent = featureSection.querySelector(".feature-media-wrap");

				if (featureImg) {
					gsap.fromTo(
						featureImg,
						{
							autoAlpha: 0,
							x: -60,
						},
						{
							autoAlpha: 1,
							x: 0,
							duration: 0.9,
							ease: "power2.out",
							scrollTrigger: {
								trigger: featureSection,
								start: "top 75%",
								once: true,
							},
						}
					);
				}

				if (featureContent) {
					gsap.fromTo(
						featureContent,
						{
							autoAlpha: 0,
							x: 40,
						},
						{
							autoAlpha: 1,
							x: 0,
							duration: 0.8,
							delay: 0.15,
							ease: "power2.out",
							scrollTrigger: {
								trigger: featureSection,
								start: "top 75%",
								once: true,
							},
						}
					);

					// Stagger the feature items
					const featureItems = featureContent.querySelectorAll(".feature-media");
					if (featureItems.length) {
						gsap.fromTo(
							featureItems,
							{
								autoAlpha: 0,
								y: 25,
							},
							{
								autoAlpha: 1,
								y: 0,
								duration: 0.6,
								stagger: 0.1,
								delay: 0.25,
								ease: "power2.out",
								scrollTrigger: {
									trigger: featureSection,
									start: "top 75%",
									once: true,
								},
							}
						);
					}
				}
			}

			// ══════════════════════════════════════════════════════════════════
			// INSURANCE LIST - SMOOTH CHECKLIST REVEAL
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".insurance-list, .checklist").forEach(list => {
				const items = list.querySelectorAll(".insurance-item, li");
				if (!items.length) return;

				gsap.fromTo(
					items,
					{
						autoAlpha: 0,
						x: -25,
					},
					{
						autoAlpha: 1,
						x: 0,
						duration: 0.5,
						stagger: 0.06,
						ease: "power2.out",
						scrollTrigger: {
							trigger: list,
							start: "top 85%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// CONTACT/FORM SECTION - SMOOTH ENTRANCE
			// ══════════════════════════════════════════════════════════════════
			const contactSection = document.querySelector(".request-area, #contact");
			if (contactSection) {
				const contentCol = contactSection.querySelector(".request-content");
				const formCol = contactSection.querySelector(".request-quote-form");

				if (contentCol) {
					gsap.fromTo(
						contentCol,
						{
							autoAlpha: 0,
							x: -50,
						},
						{
							autoAlpha: 1,
							x: 0,
							duration: 0.8,
							ease: "power2.out",
							scrollTrigger: {
								trigger: contactSection,
								start: "top 80%",
								once: true,
							},
						}
					);
				}

				if (formCol) {
					gsap.fromTo(
						formCol,
						{
							autoAlpha: 0,
							x: 50,
							y: 30,
						},
						{
							autoAlpha: 1,
							x: 0,
							y: 0,
							duration: 0.8,
							delay: 0.15,
							ease: "power2.out",
							scrollTrigger: {
								trigger: contactSection,
								start: "top 80%",
								once: true,
							},
						}
					);
				}
			}

			// ══════════════════════════════════════════════════════════════════
			// BUTTONS - SMOOTH FADE UP
			// ══════════════════════════════════════════════════════════════════
			gsap.utils.toArray(".th-btn, .btn-group a").forEach(btn => {
				if (!btn || btn.closest(".th-carousel")) return;

				gsap.fromTo(
					btn,
					{
						autoAlpha: 0,
						y: 20,
					},
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.6,
						ease: "power2.out",
						scrollTrigger: {
							trigger: btn,
							start: "top 95%",
							once: true,
						},
					}
				);
			});

			// ══════════════════════════════════════════════════════════════════
			// FOOTER - SMOOTH RISE
			// ══════════════════════════════════════════════════════════════════
			const footer = document.querySelector(".footer-wrapper");
			if (footer) {
				gsap.fromTo(
					footer,
					{
						autoAlpha: 0,
						y: 40,
					},
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.7,
						ease: "power2.out",
						scrollTrigger: {
							trigger: footer,
							start: "top 95%",
							once: true,
						},
					}
				);
			}

			// ══════════════════════════════════════════════════════════════════
			// PARALLAX EFFECTS (DESKTOP ONLY) - Smooth scrub values
			// ══════════════════════════════════════════════════════════════════
			mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {

				// HERO PARALLAX - Gentle movement
				if (document.querySelector(".hero-cinematic__bg")) {
					gsap.to(".hero-cinematic__bg", {
						y: 80,
						ease: "none",
						scrollTrigger: {
							trigger: "#hero",
							start: "top top",
							end: "bottom top",
							scrub: 1,
						},
					});
				}

				if (document.querySelector(".hero-cinematic__overlay")) {
					gsap.to(".hero-cinematic__overlay", {
						opacity: 0.85,
						ease: "none",
						scrollTrigger: {
							trigger: "#hero",
							start: "top top",
							end: "bottom top",
							scrub: 1.2,
						},
					});
				}

				// Collision page hero
				if (document.querySelector(".th-hero-bg")) {
					gsap.to(".th-hero-bg", {
						backgroundPosition: "50% 70%",
						ease: "none",
						scrollTrigger: {
							trigger: "#hero",
							start: "top top",
							end: "bottom top",
							scrub: 1,
						},
					});
				}

				// Feature images - subtle parallax
				gsap.utils.toArray(".feature-img, .feature-img-wrap img").forEach(img => {
					if (!img || img.closest(".th-carousel")) return;

					gsap.fromTo(
						img,
						{ y: -30 },
						{
							y: 30,
							ease: "none",
							scrollTrigger: {
								trigger: img.closest(".feature-img-wrap") || img.closest("section") || img,
								start: "top bottom",
								end: "bottom top",
								scrub: 1,
							},
						}
					);
				});

				// Background sections - gentle parallax
				gsap.utils.toArray(".bg-title2, [data-bg-src].background-image").forEach(section => {
					if (!section || section.closest(".th-carousel")) return;

					gsap.fromTo(
						section,
						{ backgroundPosition: "50% 30%" },
						{
							backgroundPosition: "50% 50%",
							ease: "none",
							scrollTrigger: {
								trigger: section,
								start: "top bottom",
								end: "bottom top",
								scrub: 1,
							},
						}
					);
				});

				// Scroll-linked rotation on decorative shapes - subtle
				gsap.utils.toArray(".shape-mockup img").forEach(shape => {
					if (!shape) return;

					gsap.to(shape, {
						rotation: 8,
						y: 50,
						ease: "none",
						scrollTrigger: {
							trigger: shape.closest("section") || shape,
							start: "top bottom",
							end: "bottom top",
							scrub: 1,
						},
					});
				});
			});

			// ══════════════════════════════════════════════════════════════════
			// MOBILE-SPECIFIC ANIMATIONS - Touch-optimized scroll effects
			// ══════════════════════════════════════════════════════════════════
			mm.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {

				// HERO CONTENT - Fade & rise on scroll
				const heroContent = document.querySelector(".hero-content, .th-hero-wrapper");
				if (heroContent) {
					gsap.fromTo(
						heroContent,
						{ autoAlpha: 0, y: 40 },
						{
							autoAlpha: 1,
							y: 0,
							duration: 0.8,
							ease: "power2.out",
							scrollTrigger: {
								trigger: heroContent,
								start: "top 85%",
								once: true,
							},
						}
					);
				}

				// HERO BADGE - Slide in from left
				const heroBadge = document.querySelector(".hero-badge, .insurance-hero-badge");
				if (heroBadge) {
					gsap.fromTo(
						heroBadge,
						{ autoAlpha: 0, x: -30, scale: 0.9 },
						{
							autoAlpha: 1,
							x: 0,
							scale: 1,
							duration: 0.6,
							delay: 0.2,
							ease: "power2.out",
							scrollTrigger: {
								trigger: heroBadge,
								start: "top 90%",
								once: true,
							},
						}
					);
				}

				// SECTION HEADERS - Dramatic entrance
				gsap.utils.toArray("section .title-area, section .section__head").forEach(header => {
					if (!header) return;

					gsap.fromTo(
						header,
						{ autoAlpha: 0, y: 50, scale: 0.98 },
						{
							autoAlpha: 1,
							y: 0,
							scale: 1,
							duration: 0.7,
							ease: "power2.out",
							scrollTrigger: {
								trigger: header,
								start: "top 88%",
								once: true,
							},
						}
					);
				});

				// SERVICE/PROCESS CARDS - Staggered pop-in
				gsap.utils.toArray(".collision-service-card, .process-box, .service-card").forEach((card, i) => {
					if (!card) return;

					gsap.fromTo(
						card,
						{
							autoAlpha: 0,
							y: 60,
							scale: 0.92,
						},
						{
							autoAlpha: 1,
							y: 0,
							scale: 1,
							duration: 0.6,
							delay: (i % 3) * 0.1, // Stagger within viewport
							ease: "power2.out",
							scrollTrigger: {
								trigger: card,
								start: "top 90%",
								once: true,
							},
						}
					);
				});

				// COMPARISON SLIDER CARDS - Alternating slide
				gsap.utils.toArray(".comparison-card").forEach((card, i) => {
					const fromX = i % 2 === 0 ? -40 : 40;

					gsap.fromTo(
						card,
						{
							autoAlpha: 0,
							x: fromX,
							scale: 0.95,
						},
						{
							autoAlpha: 1,
							x: 0,
							scale: 1,
							duration: 0.7,
							ease: "power2.out",
							scrollTrigger: {
								trigger: card,
								start: "top 88%",
								once: true,
							},
						}
					);
				});

				// IMAGES - Scale & fade reveal
				gsap.utils.toArray(".img-box3 img, .about-img img, .feature-img img").forEach(img => {
					if (!img || img.closest(".th-carousel")) return;

					gsap.fromTo(
						img,
						{
							autoAlpha: 0,
							scale: 1.08,
						},
						{
							autoAlpha: 1,
							scale: 1,
							duration: 0.8,
							ease: "power2.out",
							scrollTrigger: {
								trigger: img,
								start: "top 90%",
								once: true,
							},
						}
					);
				});

				// STATS/COUNTERS - Pop with slight bounce
				gsap.utils.toArray(".about-counter, .counter-card, .odometer").forEach(counter => {
					if (!counter) return;

					gsap.fromTo(
						counter,
						{
							autoAlpha: 0,
							scale: 0.8,
							y: 20,
						},
						{
							autoAlpha: 1,
							scale: 1,
							y: 0,
							duration: 0.5,
							ease: "back.out(1.4)",
							scrollTrigger: {
								trigger: counter,
								start: "top 92%",
								once: true,
							},
						}
					);
				});

				// INSURANCE/CHECKLIST ITEMS - Cascade reveal
				gsap.utils.toArray(".insurance-list li, .checklist li, .insurance-item").forEach((item, i) => {
					if (!item) return;

					gsap.fromTo(
						item,
						{
							autoAlpha: 0,
							x: -20,
						},
						{
							autoAlpha: 1,
							x: 0,
							duration: 0.4,
							delay: (i % 6) * 0.05,
							ease: "power2.out",
							scrollTrigger: {
								trigger: item,
								start: "top 92%",
								once: true,
							},
						}
					);
				});

				// WHY CHOOSE US / FEATURE ITEMS - Staggered slide
				gsap.utils.toArray(".feature-media, .why-item, .checklist-item").forEach((item, i) => {
					if (!item) return;

					gsap.fromTo(
						item,
						{
							autoAlpha: 0,
							y: 30,
							x: 15,
						},
						{
							autoAlpha: 1,
							y: 0,
							x: 0,
							duration: 0.5,
							delay: (i % 4) * 0.08,
							ease: "power2.out",
							scrollTrigger: {
								trigger: item,
								start: "top 90%",
								once: true,
							},
						}
					);
				});

				// CTA BUTTONS - Pulse entrance
				gsap.utils.toArray(".th-btn, .cta-btn, .btn-group a").forEach(btn => {
					if (!btn || btn.closest(".th-carousel")) return;

					gsap.fromTo(
						btn,
						{
							autoAlpha: 0,
							scale: 0.9,
							y: 15,
						},
						{
							autoAlpha: 1,
							scale: 1,
							y: 0,
							duration: 0.5,
							ease: "back.out(1.2)",
							scrollTrigger: {
								trigger: btn,
								start: "top 94%",
								once: true,
							},
						}
					);
				});

				// CONTACT FORM - Dramatic reveal
				const contactForm = document.querySelector(".request-quote-form, .contact-form");
				if (contactForm) {
					gsap.fromTo(
						contactForm,
						{
							autoAlpha: 0,
							y: 50,
							scale: 0.96,
						},
						{
							autoAlpha: 1,
							y: 0,
							scale: 1,
							duration: 0.8,
							ease: "power2.out",
							scrollTrigger: {
								trigger: contactForm,
								start: "top 85%",
								once: true,
							},
						}
					);
				}

				// TRUST BADGES - Staggered bounce
				gsap.utils.toArray(".trust-item, .trust-proof__item, .brand-logo").forEach((item, i) => {
					if (!item) return;

					gsap.fromTo(
						item,
						{
							autoAlpha: 0,
							scale: 0.7,
							y: 20,
						},
						{
							autoAlpha: 1,
							scale: 1,
							y: 0,
							duration: 0.4,
							delay: (i % 5) * 0.06,
							ease: "back.out(1.3)",
							scrollTrigger: {
								trigger: item,
								start: "top 92%",
								once: true,
							},
						}
					);
				});

				// FOOTER - Rise up
				const footer = document.querySelector(".footer-wrapper, footer");
				if (footer) {
					gsap.fromTo(
						footer,
						{
							autoAlpha: 0,
							y: 30,
						},
						{
							autoAlpha: 1,
							y: 0,
							duration: 0.6,
							ease: "power2.out",
							scrollTrigger: {
								trigger: footer,
								start: "top 95%",
								once: true,
							},
						}
					);
				}

				// SCROLL-LINKED HEADER SHRINK (mobile sticky header)
				const stickyHeader = document.querySelector(".sticky-wrapper .th-header, .th-menu-wrapper");
				if (stickyHeader) {
					ScrollTrigger.create({
						start: "top -80",
						onUpdate: self => {
							if (self.direction === 1) {
								gsap.to(stickyHeader, { y: -5, duration: 0.3 });
							} else {
								gsap.to(stickyHeader, { y: 0, duration: 0.3 });
							}
						},
					});
				}
			});

			// Refresh after images load
			window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
		},

		// ----------------------------------------------------------------------
		// PHONE NUMBER AUTO-LINKING
		// ----------------------------------------------------------------------
		makePhoneNumbersClickable() {
			const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
			const phoneNumber = "6184544075";

			document.querySelectorAll("p, span, div, td, li").forEach(el => {
				if (el.tagName === "A" || el.querySelector("a")) return;

				const text = el.textContent;
				if (!phoneRegex.test(text)) return;

				el.innerHTML = el.innerHTML.replace(phoneRegex, match => {
					return `<a href="tel:+1${phoneNumber}" class="clickable-phone">${match}</a>`;
				});
			});
		},

		// ----------------------------------------------------------------------
		// GSAP HELPER
		// ----------------------------------------------------------------------
		animate(target, props = {}, type = "ui") {
			if (typeof gsap === "undefined") return null;

			return gsap.to(
				target,
				Object.assign({}, props, {
					duration: this.durations[type] || this.durations.ui,
					ease: props.ease || this.easings.out,
				})
			);
		},

		supportsHover() {
			return this.canHover;
		},

		shouldAnimate() {
			return !this.prefersReducedMotion && !this.isLowPowerDevice;
		},

		// ----------------------------------------------------------------------
		// MOBILE SCROLL-TO-TOP FAB
		// ----------------------------------------------------------------------
		initMobileScrollTop() {
			const btn = document.getElementById("mobileScrollTop");
			if (btn) {
				btn.remove();
			}
		},
	};

	// ----------------------------------------------------------------------
	// GLOBAL EXPORT + INIT
	// ----------------------------------------------------------------------
	window.PrimeCore = PrimeCore;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => PrimeCore.init());
	} else {
		PrimeCore.init();
	}
})();

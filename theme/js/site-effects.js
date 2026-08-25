(function () {
    "use strict";

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    root.classList.add("js");

    function initReveal() {
        const items = document.querySelectorAll(".reveal:not([data-reveal-ready])");
        if (!items.length) return;

        if (reducedMotion.matches || !("IntersectionObserver" in window)) {
            items.forEach((item) => {
                item.dataset.revealReady = "true";
                item.classList.add("is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -7%" });

        items.forEach((item, index) => {
            item.dataset.revealReady = "true";
            item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
            observer.observe(item);
        });
    }

    function initCounters() {
        const counters = document.querySelectorAll("[data-counter-target]:not([data-counter-ready])");
        if (!counters.length) return;

        const animate = (element) => {
            const target = Number(element.dataset.counterTarget);
            const duration = 900;
            const startTime = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                element.textContent = String(Math.round(target * eased));
                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        if (reducedMotion.matches || !("IntersectionObserver" in window)) {
            counters.forEach((counter) => {
                counter.dataset.counterReady = "true";
                counter.textContent = counter.dataset.counterTarget;
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.65 });

        counters.forEach((counter) => {
            counter.dataset.counterReady = "true";
            counter.textContent = "0";
            observer.observe(counter);
        });
    }

    function initHeroImage() {
        document.querySelectorAll(".site-hero:not([data-hero-ready])").forEach((hero) => {
            hero.dataset.heroReady = "true";
            const imagePath = hero.dataset.heroImage;
            if (imagePath) {
                const imageUrl = new URL(imagePath, document.baseURI).href;
                hero.style.setProperty("--hero-image", `url("${imageUrl}")`);
            }

            if (reducedMotion.matches || !finePointer.matches) return;

            let frame = 0;
            let offsetX = 0;
            let offsetY = 0;

            const render = () => {
                hero.style.setProperty("--hero-x", `${offsetX}px`);
                hero.style.setProperty("--hero-y", `${offsetY}px`);
                frame = 0;
            };

            hero.addEventListener("pointermove", (event) => {
                const bounds = hero.getBoundingClientRect();
                offsetX = ((event.clientX - bounds.left) / bounds.width - .5) * -14;
                offsetY = ((event.clientY - bounds.top) / bounds.height - .5) * -10;
                if (!frame) frame = requestAnimationFrame(render);
            });

            hero.addEventListener("pointerleave", () => {
                offsetX = 0;
                offsetY = 0;
                if (!frame) frame = requestAnimationFrame(render);
            });
        });
    }

    function initSiteEffects() {
        initReveal();
        initCounters();
        initHeroImage();
    }

    initSiteEffects();

    if (typeof document$ !== "undefined") {
        document$.subscribe(initSiteEffects);
    } else {
        document.addEventListener("DOMContentLoaded", initSiteEffects, { once: true });
    }
})();

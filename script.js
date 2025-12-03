// script.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var menuToggle = document.getElementById("menu-toggle");
    var primaryNav = document.getElementById("primary-nav");
    var siteHeader = document.querySelector(".site-header");

    if (!menuToggle || !primaryNav) {
      return;
    }

    var lastFocusBeforeOpen = null;

    function getHeaderOffset() {
      if (!siteHeader) return 0;
      return siteHeader.offsetHeight || 0;
    }

    function openMenu() {
      lastFocusBeforeOpen = document.activeElement;
      body.classList.add("nav-open");
      primaryNav.classList.add("is-open");
      menuToggle.classList.add("is-active");
      menuToggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu(options) {
      var opts = options || {};
      body.classList.remove("nav-open");
      primaryNav.classList.remove("is-open");
      menuToggle.classList.remove("is-active");
      menuToggle.setAttribute("aria-expanded", "false");

      if (opts.returnFocus !== false && menuToggle) {
        menuToggle.focus();
      }
    }

    function isMenuOpen() {
      return body.classList.contains("nav-open");
    }

    // Toggle button click
    menuToggle.addEventListener("click", function () {
      if (isMenuOpen()) {
        closeMenu({ returnFocus: true });
      } else {
        openMenu();
      }
    });

    // Close menu when a nav link is activated
    primaryNav.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      var link = target.closest("a");
      if (!link) return;

      // Close menu and return focus to toggle
      if (isMenuOpen()) {
        closeMenu({ returnFocus: true });
      }
    });

    // Close on Escape and return focus to toggle
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" || event.key === "Esc") {
        if (isMenuOpen()) {
          event.preventDefault();
          closeMenu({ returnFocus: true });
        }
      }
    });

    // Smooth scroll for same-page anchors with offset for fixed header
    var anchorLinks = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    anchorLinks.forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        var targetId = href.slice(1);
        var targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        event.preventDefault();

        var headerOffset = getHeaderOffset() + 8; // small extra offset
        var rect = targetEl.getBoundingClientRect();
        var targetY = rect.top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });

        // Optionally move focus to the target for accessibility
        targetEl.setAttribute("tabindex", "-1");
        targetEl.focus({ preventScroll: true });
      });
    });
  });
      // ----------------------------
  // Fullscreen Lightbox
  // ----------------------------
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.querySelector(".lightbox-close");

  // Only set up if the markup exists on this page
  if (lightbox && lightboxImg && lightboxClose) {
    function openLightbox(src, alt = "") {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.src = "";
      lightboxImg.alt = "";
    }

    // Click-to-open: any image with .js-lightbox on ANY page
    document.addEventListener("click", function (e) {
      const img = e.target.closest(".js-lightbox");
      if (!img) return;
      openLightbox(img.src, img.alt || "");
    });

    // Close button
    lightboxClose.addEventListener("click", closeLightbox);

    // Click outside image closes
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // ESC closes
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();
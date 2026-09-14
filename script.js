/* ==========================================================================
   ROSHONA — site behaviour
   Sections: language toggle · navigation · hero animation · stats count-up
             menu tabs · review carousel · reservation form · scroll helpers
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------- language toggle ----------------------------- */
  var currentLang = "bn";
  var langToggleBtn = document.getElementById("langToggle");
  var translatable = document.querySelectorAll("[data-bn][data-en]");

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);

    translatable.forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });

    langToggleBtn.querySelectorAll(".lang-opt").forEach(function (opt) {
      opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
    });
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function () {
      applyLanguage(currentLang === "bn" ? "en" : "bn");
    });
  }

  /* ----------------------------- mobile navigation ----------------------------- */
  var hamburger = document.getElementById("hamburger");
  var mainNav = document.getElementById("mainNav");

  function closeMobileNav() {
    mainNav.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileNav);
  });

  /* ----------------------------- header on scroll + scrollspy ----------------------------- */
  var header = document.getElementById("siteHeader");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("section[id]")
  );
  var backToTopBtn = document.getElementById("backToTop");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    if (backToTopBtn) backToTopBtn.hidden = y < 500;
    if (backToTopBtn) backToTopBtn.classList.toggle("is-visible", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ----------------------------- hero vine draw-in ----------------------------- */
  var vinePath = document.getElementById("vinePath");
  var heroVine = document.getElementById("heroVine");
  if (vinePath) {
    var len = vinePath.getTotalLength();
    vinePath.style.strokeDasharray = len;
    vinePath.style.strokeDashoffset = prefersReducedMotion ? 0 : len;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        vinePath.style.strokeDashoffset = 0;
        heroVine.classList.add("is-drawn");
      });
    });
  }

  /* ----------------------------- stats count-up ----------------------------- */
  var statNums = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }

  var statsBlock = document.getElementById("statsBlock");
  if (statsBlock && "IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            statNums.forEach(animateCount);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    statsObserver.observe(statsBlock);
  }

  /* ----------------------------- menu tabs ----------------------------- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".menu-list");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var cat = tab.getAttribute("data-cat");

      tabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-panel") === cat);
      });
    });
  });

  /* ----------------------------- review carousel ----------------------------- */
  var reviewCards = document.querySelectorAll(".review-card");
  var dots = document.querySelectorAll(".dot");
  var prevBtn = document.getElementById("reviewPrev");
  var nextBtn = document.getElementById("reviewNext");
  var reviewIndex = 0;
  var reviewTimer = null;

  function showReview(index) {
    reviewIndex = (index + reviewCards.length) % reviewCards.length;
    reviewCards.forEach(function (card, i) {
      card.classList.toggle("active", i === reviewIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === reviewIndex);
    });
  }

  function startAutoRotate() {
    if (prefersReducedMotion || reviewCards.length < 2) return;
    stopAutoRotate();
    reviewTimer = setInterval(function () { showReview(reviewIndex + 1); }, 6000);
  }
  function stopAutoRotate() {
    if (reviewTimer) clearInterval(reviewTimer);
  }

  if (reviewCards.length) {
    if (prevBtn) prevBtn.addEventListener("click", function () { showReview(reviewIndex - 1); startAutoRotate(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showReview(reviewIndex + 1); startAutoRotate(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { showReview(i); startAutoRotate(); });
    });
    var carousel = document.getElementById("reviewCarousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAutoRotate);
      carousel.addEventListener("mouseleave", startAutoRotate);
    }
    startAutoRotate();
  }

  /* ----------------------------- reservation form ----------------------------- */
  var reservationForm = document.getElementById("reservationForm");
  var formSuccess = document.getElementById("formSuccess");

  if (reservationForm) {
    reservationForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!reservationForm.checkValidity()) {
        reservationForm.reportValidity();
        return;
      }

      formSuccess.textContent = formSuccess.getAttribute("data-" + currentLang);
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
      reservationForm.reset();

      setTimeout(function () { formSuccess.hidden = true; }, 8000);
    });
  }
})();

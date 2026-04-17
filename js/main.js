/* ═══════════════════════════════════════════
   P'TRADERS — Main Application v5.0
   Premium animations, bottom nav, particles
   ═══════════════════════════════════════════ */

(() => {
  "use strict";

  // ── State ────────────────────────────────
  let currentLang = localStorage.getItem("pt_lang") || "es";

  // ── DOM Ready ────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initLanguage();
    initUnifiedScroll();
    initScrollReveal();
    initStatCounters();
    initFAQ();
    initToolCards();
    initModal();
    initDemoButton();
    initMobileMenu();
    handleReturnScroll();
    initAppToast();
    initBottomNav();
    initCursorGlow();
    initCardGlow();
    initMagneticButtons();
    initActiveNavHighlight();
    initAppGallery();
  });

  // ═══ PARTICLE CANVAS ═══════════════════════
  function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor((w * h) / 15000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.3,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();
      }
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });
  }

  // ═══ LANGUAGE SYSTEM ═══════════════════════
  function initLanguage() {
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach((btn) => {
      if (btn.dataset.lang === currentLang) btn.classList.add("active");
      else btn.classList.remove("active");
      btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem("pt_lang", currentLang);
        langBtns.forEach((b) => b.classList.toggle("active", b.dataset.lang === currentLang));
        applyLanguage();
      });
    });
    applyLanguage();
  }

  function applyLanguage() {
    const strings = i18n[currentLang];
    if (!strings) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (strings[key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          // skip — handled by placeholder
        } else {
          el.innerHTML = strings[key];
        }
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (strings[key]) el.placeholder = strings[key];
    });
    document.documentElement.lang = currentLang;
  }

  // ═══ TOPBAR SCROLL (now part of unified handler) ══
  // Consolidated into initUnifiedScroll()

  // ═══ UNIFIED SCROLL HANDLER ═════════════
  function initUnifiedScroll() {
    const topbar = document.getElementById("topbar");
    const bottomNav = document.getElementById("bottom-nav");
    let bottomNavShown = false;

    function onScroll() {
      const scrollY = window.scrollY;
      // Topbar scrolled state
      if (topbar) topbar.classList.toggle("scrolled", scrollY > 60);
      // Scroll progress bar
      if (topbar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        topbar.style.setProperty("--scroll-progress", progress + "%");
      }
      // Bottom nav visibility
      if (bottomNav) {
        const shouldShow = scrollY > window.innerHeight * 0.5;
        if (shouldShow && !bottomNavShown) {
          bottomNav.classList.add("visible");
          bottomNavShown = true;
        } else if (!shouldShow && bottomNavShown) {
          bottomNav.classList.remove("visible");
          bottomNavShown = false;
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ═══ SCROLL REVEAL ═════════════════════════
  function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  // ═══ STAT COUNTERS ═════════════════════════
  function initStatCounters() {
    const statNumbers = document.querySelectorAll(".stat-number[data-target]");
    if (!statNumbers.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach((el) => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();
    const suffix = target >= 100 ? "+" : target === 24 ? "/7" : "";

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ═══ FAQ ACCORDION ═════════════════════════
  function initFAQ() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.contains("open");
        // Close all
        document.querySelectorAll(".faq-item.open").forEach((i) => {
          i.classList.remove("open");
          i.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  // ═══ TOOL CARDS ════════════════════════════
  function initToolCards() {
    updateToolStates();
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (Auth.isUnlocked()) {
          navigateToTool(card.dataset.tool);
        } else {
          openModal();
        }
      });
    });
  }

  function updateToolStates() {
    const unlocked = Auth.isUnlocked();
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.classList.toggle("locked", !unlocked);
    });
  }

  function navigateToTool(toolSlug) {
    if (!toolSlug) return;
    const toolRoutes = {
      "test-mental": "herramientas/test-mental/index.html",
      "inventario-miedos": "herramientas/inventario-miedos/index.html",
      "detector-saboteadores": "herramientas/detector-saboteadores/index.html",
      "diario-emocional": "herramientas/diario-emocional/index.html",
      "respiracion-box": "herramientas/respiracion-box/index.html",
      "ancla-mental": "herramientas/ancla-mental/index.html",
      "checklist-premercado": "herramientas/checklist-premercado/index.html",
      "plan-contingencia": "herramientas/plan-contingencia/index.html",
      "simulador-escenarios": "herramientas/simulador-escenarios/index.html",
      "tracker-progreso": "herramientas/tracker-progreso/index.html",
      "contrato-compromiso": "herramientas/contrato-compromiso/index.html",
    };
    const route = toolRoutes[toolSlug];
    if (route) {
      window.location.href = route;
    } else {
      // Tool not yet built — show coming soon
      const card = document.querySelector(`[data-tool="${toolSlug}"]`);
      if (card) {
        const name = card.querySelector(".tool-name");
        if (name) {
          const original = name.textContent;
          name.textContent = currentLang === "es" ? "🚧 Próximamente..." : "🚧 Coming soon...";
          name.style.color = "var(--amber)";
          setTimeout(() => {
            name.textContent = original;
            name.style.color = "";
          }, 2000);
        }
      }
    }
  }

  // ═══ MODAL ═════════════════════════════════
  function initModal() {
    const overlay = document.getElementById("modal-overlay");
    const input = document.getElementById("modal-input");
    const submit = document.getElementById("modal-submit");
    const cancel = document.getElementById("modal-cancel");
    const error = document.getElementById("modal-error");

    if (!overlay) return;

    submit.addEventListener("click", async () => {
      const code = input.value.trim();
      if (!code) return;

      // Show validating state
      submit.disabled = true;
      error.textContent = i18n[currentLang]?.modal_validating || "Validando...";
      error.style.color = "var(--muted)";

      const result = await Auth.unlock(code);
      submit.disabled = false;

      if (result) {
        input.classList.remove("error");
        input.classList.add("success");
        error.textContent = i18n[currentLang]?.modal_success || "¡Acceso concedido!";
        error.style.color = "var(--emerald)";
        setTimeout(() => {
          closeModal();
          updateToolStates();
        }, 800);
      } else {
        input.classList.add("error");
        error.textContent = i18n[currentLang]?.modal_error || "Código incorrecto.";
        error.style.color = "";
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit.click();
    });

    cancel.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        closeModal();
      }
    });
  }

  function openModal() {
    const overlay = document.getElementById("modal-overlay");
    const input = document.getElementById("modal-input");
    const error = document.getElementById("modal-error");
    if (!overlay) return;
    overlay.classList.add("active");
    input.value = "";
    input.classList.remove("error", "success");
    error.textContent = "";
    error.style.color = "";
    document.body.style.overflow = "hidden";
    setTimeout(() => input.focus(), 300);
  }

  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ═══ DEMO BUTTON ═══════════════════════════
  function initDemoButton() {
    const btn = document.getElementById("btn-demo");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ═══ MOBILE MENU ═══════════════════════════
  function initMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener("click", () => {
      const isActive = hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active", isActive);
      document.body.style.overflow = isActive ? "hidden" : "";
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });

    // Close on resize if desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // ═══ RETURN SCROLL ═════════════════════════
  function handleReturnScroll() {
    // Only scroll when returning from a tool page via "Volver al inicio"
    if (window.location.hash !== "#return-tools") return;
    const target = document.getElementById("tools");
    if (!target) return;

    // Make ALL reveal elements visible so sections have real height
    // (needed for accurate scroll position calculation)
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });

    // Clean up hash from URL
    history.replaceState(null, "", window.location.pathname);

    // Use requestAnimationFrame + timeout for mobile browser compatibility
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Calculate position manually as fallback (more reliable on mobile)
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const topbarHeight = 60; // approximate topbar height
        const targetY = rect.top + scrollTop - topbarHeight;

        // Try smooth scroll, with instant fallback
        try {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        } catch (e) {
          window.scrollTo(0, targetY);
        }
      }, 300);
    });
  }

  // ═══ FLOATING APP TOAST ════════════════════
  function initAppToast() {
    const toast = document.getElementById("app-toast");
    const closeBtn = document.getElementById("app-toast-close");
    if (!toast || !closeBtn) return;

    // Respect previous dismissal this session
    if (sessionStorage.getItem("pt_toast_dismissed")) return;

    const FIRST_DELAY = 12000;
    const VISIBLE_TIME = 10000;
    let timer = null;

    function isAppSectionVisible() {
      const appSection = document.getElementById("app");
      if (!appSection) return false;
      const rect = appSection.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function showToast() {
      if (isAppSectionVisible()) {
        timer = setTimeout(showToast, 8000);
        return;
      }
      toast.classList.remove("hiding");
      toast.classList.add("visible");
      timer = setTimeout(hideToast, VISIBLE_TIME);
    }

    function hideToast() {
      toast.classList.add("hiding");
      toast.classList.remove("visible");
    }

    closeBtn.addEventListener("click", () => {
      clearTimeout(timer);
      hideToast();
      sessionStorage.setItem("pt_toast_dismissed", "1");
    });

    toast.querySelectorAll(".app-toast-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTimeout(timer);
        hideToast();
        sessionStorage.setItem("pt_toast_dismissed", "1");
      });
    });

    timer = setTimeout(showToast, FIRST_DELAY);
  }

  // ═══ BOTTOM NAVIGATION ═════════════════════
  function initBottomNav() {
    const nav = document.getElementById("bottom-nav");
    if (!nav) return;

    // Visibility now handled by initUnifiedScroll

    // Active section tracking
    const items = nav.querySelectorAll(".bottom-nav-item[data-section]");
    const sections = [];
    items.forEach((item) => {
      const id = item.dataset.section;
      const el = document.getElementById(id);
      if (el) sections.push({ el, item, id });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            items.forEach((i) => i.classList.remove("active"));
            const match = sections.find((s) => s.el === entry.target);
            if (match) match.item.classList.add("active");
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s.el));

    // Smooth scroll on click
    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        const id = item.dataset.section;
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ═══ CURSOR GLOW ═══════════════════════════
  function initCursorGlow() {
    const glow = document.getElementById("cursor-glow");
    if (!glow || window.innerWidth < 1024) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let active = false;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        glow.classList.add("active");
        animate();
      }
    });

    document.addEventListener("mouseleave", () => {
      active = false;
      glow.classList.remove("active");
    });

    function animate() {
      if (!active) return;
      // Lerp for smooth trailing
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + "px";
      glow.style.top = glowY + "px";
      requestAnimationFrame(animate);
    }
  }

  // ═══ CARD GLOW (mouse position tracking) ═══
  function initCardGlow() {
    const cards = document.querySelectorAll(".product-card, .outcome-card, .app-feat-card, .tool-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", x + "px");
        card.style.setProperty("--mouse-y", y + "px");
      });
    });
  }

  // ═══ MAGNETIC BUTTONS ══════════════════════
  function initMagneticButtons() {
    if (window.innerWidth < 1024) return;
    const btns = document.querySelectorAll(".btn-primary, .btn-gold, .topbar-cta");
    btns.forEach((btn) => {
      let rafId = null;
      btn.addEventListener("mousemove", (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
          rafId = null;
        });
      });
      btn.addEventListener("mouseleave", () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        btn.style.transform = "";
      });
    });
  }

  // ═══ ACTIVE NAV HIGHLIGHT ══════════════════
  function initActiveNavHighlight() {
    const navLinks = document.querySelectorAll(".topbar-nav a[href^='#']");
    if (!navLinks.length) return;

    const sectionMap = [];
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) sectionMap.push({ link, section });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("nav-active"));
            const match = sectionMap.find((s) => s.section === entry.target);
            if (match) match.link.classList.add("nav-active");
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -40% 0px" }
    );
    sectionMap.forEach((s) => observer.observe(s.section));
  }

  // ═══ APP SCREENSHOTS GALLERY ═══════════════
  function initAppGallery() {
    const track = document.getElementById("gallery-track");
    const dotsContainer = document.getElementById("gallery-dots");
    if (!track || !dotsContainer) return;

    const allSlides = Array.from(track.querySelectorAll(".gallery-slide"));
    const filters = document.querySelectorAll(".gallery-filter");
    const prevBtn = document.querySelector(".gallery-prev");
    const nextBtn = document.querySelector(".gallery-next");
    let activeFilter = "all";
    let visibleSlides = allSlides;

    function getVisibleSlides() {
      return allSlides.filter((s) => !s.classList.contains("hidden"));
    }

    function buildDots() {
      visibleSlides = getVisibleSlides();
      const groupSize = window.innerWidth < 768 ? 2 : 3;
      const dotCount = Math.ceil(visibleSlides.length / groupSize);
      dotsContainer.innerHTML = "";
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement("button");
        dot.className = "gallery-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Page " + (i + 1));
        dot.addEventListener("click", () => scrollToGroup(i));
        dotsContainer.appendChild(dot);
      }
    }

    function scrollToGroup(index) {
      const groupSize = window.innerWidth < 768 ? 2 : 3;
      const target = visibleSlides[index * groupSize];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
      updateDots(index);
    }

    function updateDots(activeIndex) {
      dotsContainer.querySelectorAll(".gallery-dot").forEach((d, i) => {
        d.classList.toggle("active", i === activeIndex);
      });
    }

    function getCurrentGroup() {
      const groupSize = window.innerWidth < 768 ? 2 : 3;
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let closest = 0;
      let minDist = Infinity;
      visibleSlides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      return Math.floor(closest / groupSize);
    }

    // Scroll listener for dot sync
    let scrollTimer;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        updateDots(getCurrentGroup());
      }, 100);
    }, { passive: true });

    // Arrows
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const g = getCurrentGroup();
        if (g > 0) scrollToGroup(g - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const g = getCurrentGroup();
        const groupSize = window.innerWidth < 768 ? 2 : 3;
        const maxGroup = Math.ceil(visibleSlides.length / groupSize) - 1;
        if (g < maxGroup) scrollToGroup(g + 1);
      });
    }

    // Filters
    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((f) => f.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;

        allSlides.forEach((slide) => {
          if (activeFilter === "all" || slide.dataset.category === activeFilter) {
            slide.classList.remove("hidden");
          } else {
            slide.classList.add("hidden");
          }
        });

        track.scrollLeft = 0;
        buildDots();
      });
    });

    buildDots();
    window.addEventListener("resize", buildDots);

    // Video play/pause
    track.querySelectorAll(".gallery-video-frame").forEach((frame) => {
      const video = frame.querySelector("video");
      const playBtn = frame.querySelector(".gallery-video-play");
      if (!video || !playBtn) return;

      function togglePlay() {
        if (video.paused) {
          // Pause all other videos first
          track.querySelectorAll("video").forEach((v) => {
            if (v !== video && !v.paused) {
              v.pause();
              v.closest(".gallery-video-frame")?.querySelector(".gallery-video-play")?.classList.remove("is-playing");
            }
          });
          video.play();
          playBtn.classList.add("is-playing");
        } else {
          video.pause();
          playBtn.classList.remove("is-playing");
        }
      }

      playBtn.addEventListener("click", togglePlay);
      frame.addEventListener("click", (e) => {
        if (e.target !== playBtn && !playBtn.contains(e.target)) togglePlay();
      });
      video.addEventListener("ended", () => {
        playBtn.classList.remove("is-playing");
      });
    });
  }
})();

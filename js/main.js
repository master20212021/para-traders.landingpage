/* ═══════════════════════════════════════════
   P'TRADERS — Main Application v2.0
   Particles, counters, FAQ, tools
   ═══════════════════════════════════════════ */

(() => {
  "use strict";

  // ── State ────────────────────────────────
  let currentLang = localStorage.getItem("pt_lang") || "es";

  // ── DOM Ready ────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initLanguage();
    initTopbarScroll();
    initScrollReveal();
    initStatCounters();
    initFAQ();
    initToolCards();
    initModal();
    initDemoButton();
    initMobileMenu();
    handleReturnScroll();
    initAppToast();
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

  // ═══ TOPBAR SCROLL ═════════════════════════
  function initTopbarScroll() {
    const topbar = document.getElementById("topbar");
    if (!topbar) return;
    const check = () => topbar.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", check, { passive: true });
    check();
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
        document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
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

    const FIRST_DELAY = 12000;   // 12s after page load
    const VISIBLE_TIME = 10000;  // stay visible 10s
    const INTERVAL = 45000;      // re-appear every 45s
    const AFTER_CLOSE = 60000;   // re-appear 60s after user closes it

    let timer = null;

    function isAppSectionVisible() {
      const appSection = document.getElementById("app");
      if (!appSection) return false;
      const rect = appSection.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function showToast() {
      // Skip if user is already viewing the app section
      if (isAppSectionVisible()) {
        timer = setTimeout(showToast, 8000);
        return;
      }
      toast.classList.remove("hiding");
      toast.classList.add("visible");
      // Auto-hide after visible time
      timer = setTimeout(hideToast, VISIBLE_TIME);
    }

    function hideToast() {
      toast.classList.add("hiding");
      toast.classList.remove("visible");
      // Schedule next appearance
      timer = setTimeout(showToast, INTERVAL);
    }

    closeBtn.addEventListener("click", () => {
      clearTimeout(timer);
      toast.classList.add("hiding");
      toast.classList.remove("visible");
      // Come back after a longer delay when manually closed
      timer = setTimeout(showToast, AFTER_CLOSE);
    });

    // Open app on store button click
    toast.querySelectorAll(".app-toast-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTimeout(timer);
        toast.classList.add("hiding");
        toast.classList.remove("visible");
        // Still come back later
        timer = setTimeout(showToast, AFTER_CLOSE);
      });
    });

    // First show
    timer = setTimeout(showToast, FIRST_DELAY);
  }
})();

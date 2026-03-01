/* ═══════════════════════════════════════════
   P'TRADERS — Main Application v2.0
   Particles, counters, FAQ, analyzer, tools
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
    initAnalyzer();
    initDemoButton();
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

    submit.addEventListener("click", () => {
      const code = input.value.trim();
      if (!code) return;
      if (Auth.unlock(code)) {
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

  // ═══ EMOTION ANALYZER ═════════════════════
  function initAnalyzer() {
    const btn = document.getElementById("analyzer-btn");
    const input = document.getElementById("analyzer-input");
    const result = document.getElementById("analyzer-result");
    if (!btn || !input || !result) return;

    btn.addEventListener("click", async () => {
      const text = input.value.trim();
      if (!text || text.length < 10) return;

      const strings = i18n[currentLang] || {};
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner" style="animation:spin 1s linear infinite"></i> ${strings.analyzer_loading || "Analizando..."}`;
      result.classList.add("hidden");

      try {
        const lang = currentLang === "en" ? "English" : "Spanish";
        const prompt = `You are a trading psychology expert. Analyze this trader's emotional state written in ${lang}. Respond ONLY in ${lang} with this exact format:

EMOTIONS: [list 2-3 dominant emotions]
BIASES: [list 1-2 cognitive biases detected]
RISK: [Low/Medium/High]
RECOMMENDATION: [2-3 sentences of practical advice]

Text: "${text}"`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDebuUKPwhlHqkBMfTxYF6oM_WSYbs6QEI`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!raw) throw new Error("No response");

        // Parse
        const emotions = raw.match(/EMOCIONES?:(.+)/i)?.[1]?.trim() || raw.match(/EMOTIONS?:(.+)/i)?.[1]?.trim() || "";
        const biases = raw.match(/SESGOS?:(.+)/i)?.[1]?.trim() || raw.match(/BIASES?:(.+)/i)?.[1]?.trim() || "";
        const risk = raw.match(/RIESGO:(.+)/i)?.[1]?.trim() || raw.match(/RISK:(.+)/i)?.[1]?.trim() || "";
        const rec = raw.match(/RECOMENDACI[ÓO]N:(.+)/is)?.[1]?.trim() || raw.match(/RECOMMENDATION:(.+)/is)?.[1]?.trim() || "";

        const riskColor = risk.toLowerCase().includes("alto") || risk.toLowerCase().includes("high") ? "tag-orange" : risk.toLowerCase().includes("medio") || risk.toLowerCase().includes("medium") ? "tag-cyan" : "tag-mint";

        result.innerHTML = `
          <div style="margin-bottom:1rem">
            <strong style="color:var(--text);font-size:0.85rem;">${currentLang === "es" ? "Emociones detectadas" : "Detected emotions"}:</strong><br/>
            ${emotions.split(/[,·]/).map((e) => `<span class="tag tag-cyan">${e.trim()}</span>`).join("")}
          </div>
          <div style="margin-bottom:1rem">
            <strong style="color:var(--text);font-size:0.85rem;">${currentLang === "es" ? "Sesgos cognitivos" : "Cognitive biases"}:</strong><br/>
            ${biases.split(/[,·]/).map((b) => `<span class="tag tag-orange">${b.trim()}</span>`).join("")}
          </div>
          <div style="margin-bottom:1rem">
            <strong style="color:var(--text);font-size:0.85rem;">${currentLang === "es" ? "Nivel de riesgo" : "Risk level"}:</strong>
            <span class="tag ${riskColor}">${risk}</span>
          </div>
          <div>
            <strong style="color:var(--text);font-size:0.85rem;">${currentLang === "es" ? "Recomendación" : "Recommendation"}:</strong>
            <p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.65;margin-top:0.3rem;">${rec}</p>
          </div>
        `;
        result.classList.remove("hidden");
      } catch (err) {
        result.innerHTML = `<p style="color:var(--rose);font-size:0.88rem;">${strings.analyzer_error || "Error al analizar."}</p>`;
        result.classList.remove("hidden");
      }

      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span data-i18n="analyzer_btn">${strings.analyzer_btn || "Analizar mis Emociones"}</span>`;
    });
  }

  // ═══ DEMO BUTTON ═══════════════════════════
  function initDemoButton() {
    const btn = document.getElementById("btn-demo");
    if (!btn) return;
    btn.addEventListener("click", () => {
      document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" });
    });
  }
})();

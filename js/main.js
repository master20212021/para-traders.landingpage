/* ═══════════════════════════════════════════
   P'TRADERS — Main Application JS
   ═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // ── Language System ─────────────────────
  let currentLang = localStorage.getItem("pt_lang") || "es";

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("pt_lang", lang);
    document.documentElement.lang = lang;

    // Update all [data-i18n] elements
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = i18n[lang]?.[key];
      if (text) el.innerHTML = text;
    });

    // Update all [data-i18n-placeholder]
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = i18n[lang]?.[key];
      if (text) el.placeholder = text;
    });

    // Toggle lang buttons
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  // Init language
  setLang(currentLang);

  // Lang button clicks
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  // ── Access Code Modal ───────────────────
  const modal = document.getElementById("access-modal");
  const modalInput = document.getElementById("modal-code-input");
  const modalError = document.getElementById("modal-error");
  const modalBtn = document.getElementById("modal-unlock-btn");

  function openModal() {
    if (modal) {
      modal.classList.add("active");
      setTimeout(() => modalInput?.focus(), 300);
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("active");
      if (modalInput) modalInput.value = "";
      if (modalError) modalError.textContent = "";
      if (modalInput) modalInput.classList.remove("error", "success");
    }
  }

  // Open modal triggers
  document.querySelectorAll("[data-open-modal]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close modal
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  // Click outside to close
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Unlock button
  modalBtn?.addEventListener("click", () => {
    const code = modalInput?.value || "";
    if (Auth.unlock(code)) {
      modalInput.classList.remove("error");
      modalInput.classList.add("success");
      modalError.textContent = "";

      // Show success message
      const successText = i18n[currentLang]?.modalSuccess || "Unlocked!";
      modalError.style.color = "var(--mint)";
      modalError.textContent = successText;

      setTimeout(() => {
        closeModal();
        updateToolsState();
        modalError.style.color = "";
      }, 1200);
    } else {
      modalInput.classList.add("error");
      const errorText = i18n[currentLang]?.modalError || "Invalid code.";
      modalError.textContent = errorText;
      setTimeout(() => modalInput.classList.remove("error"), 400);
    }
  });

  // Enter key on input
  modalInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") modalBtn?.click();
  });

  // ── Tools State ─────────────────────────
  function updateToolsState() {
    const unlocked = Auth.isUnlocked();
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.classList.toggle("locked", !unlocked);
    });

    // Show/hide unlock button vs access label
    const unlockBtns = document.querySelectorAll("[data-show-locked]");
    const accessLabels = document.querySelectorAll("[data-show-unlocked]");

    unlockBtns.forEach((el) => el.classList.toggle("hidden", unlocked));
    accessLabels.forEach((el) => el.classList.toggle("hidden", !unlocked));

    // Update tool card links
    document.querySelectorAll(".tool-card").forEach((card) => {
      if (unlocked) {
        card.style.cursor = "pointer";
      } else {
        card.style.cursor = "default";
      }
    });
  }

  updateToolsState();

  // Tool card clicks
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!Auth.isUnlocked()) return;
      const href = card.dataset.toolHref;
      if (href) window.location.href = href;
    });
  });

  // ── Scroll Reveal ───────────────────────
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ── Emotion Analyzer ────────────────────
  const analyzeBtn = document.getElementById("analyze-btn");
  const analyzerText = document.getElementById("analyzer-text");
  const analyzerResult = document.getElementById("analyzer-result");
  const analyzerLoader = document.getElementById("analyzer-loader");
  const analyzerTool = document.getElementById("analyzer-tool");
  const analyzerLocked = document.getElementById("analyzer-locked-msg");

  const MAX_USES = 1;
  const USES_KEY = "pt_analyzer_used";

  function getAnalyzerUses() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(USES_KEY + "_date");
    if (stored !== today) {
      localStorage.setItem(USES_KEY + "_date", today);
      localStorage.setItem(USES_KEY, "0");
      return 0;
    }
    return parseInt(localStorage.getItem(USES_KEY) || "0", 10);
  }

  function checkAnalyzerState() {
    const uses = getAnalyzerUses();
    if (uses >= MAX_USES && !Auth.isUnlocked()) {
      analyzerTool?.classList.add("hidden");
      analyzerLocked?.classList.remove("hidden");
    }
  }

  checkAnalyzerState();

  analyzeBtn?.addEventListener("click", async () => {
    const uses = getAnalyzerUses();
    if (uses >= MAX_USES && !Auth.isUnlocked()) {
      checkAnalyzerState();
      return;
    }

    const text = analyzerText?.value?.trim();
    if (!text) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "...";
    analyzerResult?.classList.add("hidden");
    analyzerLoader?.classList.remove("hidden");

    try {
      const prompt = `Analiza el siguiente texto de un trader e identifica las emociones dominantes (ej: miedo, avaricia, frustración, confianza), los posibles sesgos cognitivos (ej: aversión a la pérdida, FOMO, sesgo de confirmación) y ofrece una sugerencia corta y accionable. Responde en ${currentLang === "es" ? "español" : "inglés"}. El texto es: "${text}"`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              emociones: { type: "ARRAY", items: { type: "STRING" } },
              sesgos: { type: "ARRAY", items: { type: "STRING" } },
              sugerencia: { type: "STRING" },
            },
          },
        },
      };

      const apiKey = "AIzaSyDebuUKPwhlHqkBMfTxYF6oM_WSYbs6QEI";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      const data = JSON.parse(result.candidates[0].content.parts[0].text);

      // Render results
      const t = i18n[currentLang];
      let html = "";

      if (data.emociones?.length) {
        html += `<h4 class="text-cyan" style="margin-bottom:0.5rem">${t.analyzerEmotions}:</h4>
          <div class="flex flex-wrap gap-1 mb-3">${data.emociones.map((e) => `<span class="tag tag-cyan">${e}</span>`).join("")}</div>`;
      }

      if (data.sesgos?.length) {
        html += `<h4 class="text-cyan" style="margin-bottom:0.5rem;color:var(--orange)">${t.analyzerBiases}:</h4>
          <div class="flex flex-wrap gap-1 mb-3">${data.sesgos.map((s) => `<span class="tag tag-orange">${s}</span>`).join("")}</div>`;
      }

      if (data.sugerencia) {
        html += `<h4 style="margin-bottom:0.5rem;color:var(--mint)">${t.analyzerSuggestion}:</h4>
          <p class="text-muted" style="font-style:italic">"${data.sugerencia}"</p>`;
      }

      analyzerResult.innerHTML = html;
      analyzerResult.classList.remove("hidden");

      // Increment uses
      const newUses = uses + 1;
      localStorage.setItem(USES_KEY, newUses.toString());

      if (newUses >= MAX_USES && !Auth.isUnlocked()) {
        setTimeout(checkAnalyzerState, 5000);
      }
    } catch (err) {
      console.error("Analyzer error:", err);
      analyzerResult.innerHTML = `<p style="color:var(--red)">Error: ${err.message}</p>`;
      analyzerResult.classList.remove("hidden");
    } finally {
      analyzerLoader?.classList.add("hidden");
      const t = i18n[currentLang];
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = t.analyzerBtn;
    }
  });

  // ── Smooth Scroll for anchor links ──────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

/* ═══════════════════════════════════════════
   P'TRADERS — Auth Guard for Tool Pages
   Redirects to landing page if not unlocked
   ═══════════════════════════════════════════ */

(() => {
  if (typeof Auth === "undefined" || !Auth.isUnlocked()) {
    // Not authenticated — redirect to landing page
    window.location.replace("../../index.html");
  }
})();

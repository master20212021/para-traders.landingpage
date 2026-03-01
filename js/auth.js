/* ═══════════════════════════════════════════
   P'TRADERS — Access Code System
   ═══════════════════════════════════════════ */

const Auth = (() => {
  // Access code — change this to update the code students receive
  const VALID_CODE = "PTRADERS2026";
  const STORAGE_KEY = "pt_access";

  function isUnlocked() {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  function unlock(code) {
    if (code.trim().toUpperCase() === VALID_CODE) {
      localStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
    return false;
  }

  function lock() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { isUnlocked, unlock, lock };
})();

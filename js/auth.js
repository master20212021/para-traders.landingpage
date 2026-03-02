/* ═══════════════════════════════════════════
   P'TRADERS — Access Code System v2.0
   Validates against Supabase
   ═══════════════════════════════════════════ */

const Auth = (() => {
  const SUPABASE_URL = "https://taxokgvwudsjkqgxxntx.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheG9rZ3Z3dWRzamtxZ3h4bnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjczMTcsImV4cCI6MjA3MzIwMzMxN30.CeaYJ82UzV1AiOOfxSFhFBEJvtJKH9eAAEryzwwi-Qg";

  const STORAGE_KEY = "pt_access";
  const CODE_KEY = "pt_code";

  function isUnlocked() {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  async function unlock(code) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return false;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/validate_course_code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON,
          "Authorization": `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({ code_input: trimmed })
      });

      if (!res.ok) return false;
      const valid = await res.json();

      if (valid === true) {
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.setItem(CODE_KEY, trimmed);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Auth validation error:", err);
      return false;
    }
  }

  function lock() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CODE_KEY);
  }

  function getCode() {
    return localStorage.getItem(CODE_KEY) || "";
  }

  return { isUnlocked, unlock, lock, getCode };
})();

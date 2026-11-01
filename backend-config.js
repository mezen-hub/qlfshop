/* QLF SHOP — Supabase configuration
   1) Create a project at https://supabase.com
   2) Copy Project URL + anon/public key from Project Settings > API
   3) Paste them below. Never put a service_role key in frontend code.
*/
window.QLF_CONFIG = {
  SUPABASE_URL: "https://hvoefhdbblxepgvbwbbr.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_lXt2cwUQ4YYua0sbmdjbwg_MbHJ65wZ"
};

window.qlfSupabase = null;
(function initQLFSupabase() {
  const cfg = window.QLF_CONFIG;
  const ready = cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  if (ready && window.supabase?.createClient) {
    window.qlfSupabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
})();

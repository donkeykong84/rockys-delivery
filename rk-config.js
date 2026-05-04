// rk-config.js — white-label configuration. Persisted in localStorage.
// IT Dashboard reads/writes; every other surface reads only.
// Defaults below are sensible placeholders; the buyer overrides pre-launch.

const RK_CONFIG_DEFAULTS = {
  // Identity
  brand_name:        "Rocky's",
  brand_tagline:     "Your corner shop, delivered.",
  brand_logo_letter: "R",
  brand_color_ink:   "#1d1a14",
  brand_color_olive: "#4a5436",
  brand_color_persimmon: "#c4541d",
  brand_color_paper: "#f4efe6",

  // Shop info
  shop_address:  "21 Mott Street, London E1 6QL",
  shop_lat:      51.5155,
  shop_lng:      -0.0922,
  shop_phone:    "+44 20 7946 0123",
  shop_email:    "hello@rockys.shop",
  shop_hours:    "Mon–Sat 8am–10pm · Sun 10am–6pm",
  shop_about:    "A tiny corner shop with a sharp eye for the everyday. Family run since 2019.",

  // Commerce
  currency_symbol:    "£",
  currency_code:      "GBP",
  tax_rate:           0.08,
  delivery_fee:       4.95,
  free_delivery_over: 35,

  // Tech
  ollama_url:    "http://localhost:11434",
  ollama_model:  "qwen3:4b",
  ai_backend:    "claude",      // "claude" | "ollama"
  stock_backend: "in-memory",   // "in-memory" | "<droplet-url>"
  stripe_pk:     "pk_test_placeholder",
  domain:        "rockys.local",

  // Legal
  privacy_url: "/privacy",
  terms_url:   "/terms",
};

const RK_CONFIG = {
  _cache: null,
  load() {
    if (this._cache) return this._cache;
    try {
      const stored = JSON.parse(localStorage.getItem('rk-config') || '{}');
      this._cache = { ...RK_CONFIG_DEFAULTS, ...stored };
    } catch (e) { this._cache = { ...RK_CONFIG_DEFAULTS }; }
    return this._cache;
  },
  get(key) { return this.load()[key]; },
  set(patch) {
    const next = { ...this.load(), ...patch };
    localStorage.setItem('rk-config', JSON.stringify(next));
    this._cache = next;
    document.documentElement.dispatchEvent(new CustomEvent('rk-config-change', { detail: next }));
    return next;
  },
  reset() {
    localStorage.removeItem('rk-config');
    this._cache = null;
    return this.load();
  },
  exportJson() { return JSON.stringify(this.load(), null, 2); },
};
window.RK_CONFIG = RK_CONFIG;
window.RK_CONFIG_DEFAULTS = RK_CONFIG_DEFAULTS;

// Apply colors on load
(function applyBrandCss() {
  const c = RK_CONFIG.load();
  const root = document.documentElement;
  root.style.setProperty('--ink', c.brand_color_ink);
  root.style.setProperty('--olive', c.brand_color_olive);
  root.style.setProperty('--persimmon', c.brand_color_persimmon);
  root.style.setProperty('--paper', c.brand_color_paper);
})();
document.documentElement.addEventListener('rk-config-change', e => {
  const c = e.detail;
  document.documentElement.style.setProperty('--ink', c.brand_color_ink);
  document.documentElement.style.setProperty('--olive', c.brand_color_olive);
  document.documentElement.style.setProperty('--persimmon', c.brand_color_persimmon);
  document.documentElement.style.setProperty('--paper', c.brand_color_paper);
});

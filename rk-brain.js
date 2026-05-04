// rk-brain.js — pluggable LLM client.
//
// The customer never sees this. It powers:
//   • substitution suggestions when picker hits an out-of-stock
//   • route ordering for the driver (multi-stop)
//   • auto-categorize a freshly-scanned product into an aisle
//
// Two backends:
//   1. window.claude.complete  (default, works in this prototype)
//   2. fetch('http://<your-droplet>:11434/api/chat')  (your real qwen3:4b)
// Switch via the dropdown in the Owner screen — value persists in localStorage.

const BRAIN_DEFAULT_OLLAMA = 'http://localhost:11434';

const BRAIN = {
  get backend() { return localStorage.getItem('rk-brain-backend') || 'claude'; },
  set backend(v) { localStorage.setItem('rk-brain-backend', v); },
  get ollamaUrl() { return localStorage.getItem('rk-ollama-url') || BRAIN_DEFAULT_OLLAMA; },
  set ollamaUrl(v) { localStorage.setItem('rk-ollama-url', v); },
  get model() { return localStorage.getItem('rk-ollama-model') || 'qwen3:4b'; },
  set model(v) { localStorage.setItem('rk-ollama-model', v); },

  async ask(prompt, { json = true } = {}) {
    const sys = 'You are the back-of-house brain for a small grocery delivery app. Reply concisely. ' +
      (json ? 'Reply ONLY with valid minified JSON, no prose, no code fences.' : '');

    if (this.backend === 'ollama') {
      try {
        const r = await fetch(`${this.ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model, stream: false,
            messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
            format: json ? 'json' : undefined,
          }),
        });
        const d = await r.json();
        return d.message?.content ?? '';
      } catch (e) {
        console.warn('ollama unreachable, falling back to claude', e);
      }
    }
    // claude fallback
    return await window.claude.complete({
      messages: [{ role: 'user', content: sys + '\n\n' + prompt }],
    });
  },

  async categorizeAisle(name, variant) {
    const aisles = (window.AISLE_ORDER || []).join(', ');
    const out = await this.ask(
      `Pick the best aisle from this list: ${aisles}.\n` +
      `Product: "${name}" (${variant || ''}).\n` +
      `Reply: {"aisle":"<one of the list>"}`,
    );
    try { return JSON.parse(out).aisle; } catch { return 'Pantry'; }
  },

  async suggestSubstitute(missingItem, candidates) {
    const list = candidates.map(c => `- ${c.id}: ${c.name} (${c.variant}) £${c.price}`).join('\n');
    const out = await this.ask(
      `Customer ordered "${missingItem.name} (${missingItem.variant})" but it's out of stock.\n` +
      `Suggest the single best substitute from these in-stock items:\n${list}\n` +
      `Reply: {"id":"<sk-id>","reason":"<short reason, <12 words>"}`,
    );
    try { return JSON.parse(out); } catch { return null; }
  },

  async orderRoute(stops) {
    const list = stops.map((s, i) => `${i+1}. ${s.label} — ${s.address}`).join('\n');
    const out = await this.ask(
      `Driver has these stops, leaving from the shop. Order them for shortest reasonable total drive ` +
      `assuming a small city. Reply: {"order":[<1-indexed numbers>]}.\n${list}`,
    );
    try { return JSON.parse(out).order; } catch { return stops.map((_, i) => i + 1); }
  },
};

window.BRAIN = BRAIN;

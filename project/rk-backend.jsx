// rk-backend.jsx — Mock backend for Rocky's.
// Pretends to be a real server. In production, swap fetch URLs for your API.
//
// Exposes (on window.RKApi):
//   listItems()                  → all stock items
//   getItem(id)                  → single item
//   updateStock(id, delta)       → mutate count
//   lowStock()                   → items below lowAt threshold
//   outOfStock()                 → items with stock <= 0
//   lookupBarcode(barcode)       → fetch from Open Food Facts (real API)
//   askLLM(prompt, system)       → calls window.claude (mock for Ollama qwen3:4b)
//   suggestSubstitution(itemId)  → LLM-driven swap when out of stock
//   categorizeNew({name, brand}) → LLM-driven aisle assignment
//   organizePickerList(orderItems) → LLM groups by aisle, in walking order
//   optimizeRoute(stops)         → LLM-driven driver order
//
// Persistence: in-memory snapshot of stock.json. Reset on reload.

(function() {
  let _stock = null;
  let _loadPromise = null;

  async function loadStock() {
    if (_stock) return _stock;
    if (_loadPromise) return _loadPromise;
    _loadPromise = fetch('stock.json').then(r => r.json()).then(j => { _stock = j; return j; });
    return _loadPromise;
  }

  // ─── stock CRUD ───────────────────────────────────────────
  async function listItems() {
    const s = await loadStock(); return s.items;
  }
  async function listAisles() {
    const s = await loadStock(); return s.shop.aisles;
  }
  async function getItem(id) {
    const s = await loadStock(); return s.items.find(i => i.id === id);
  }
  async function updateStock(id, delta) {
    const s = await loadStock();
    const it = s.items.find(i => i.id === id);
    if (!it) return null;
    it.stock = Math.max(0, it.stock + delta);
    _emit('stock-changed', { id, stock: it.stock });
    return it;
  }
  async function setStock(id, value) {
    const s = await loadStock();
    const it = s.items.find(i => i.id === id);
    if (!it) return null;
    it.stock = Math.max(0, value);
    _emit('stock-changed', { id, stock: it.stock });
    return it;
  }
  async function addItem(item) {
    const s = await loadStock();
    const id = 'sku-' + String(s.items.length + 1).padStart(3, '0');
    const full = { id, stock: 0, lowAt: 6, aisle: 'pantry', ...item };
    s.items.unshift(full);
    _emit('items-changed', null);
    return full;
  }
  async function lowStock() {
    const s = await loadStock();
    return s.items.filter(i => i.stock > 0 && i.stock <= i.lowAt);
  }
  async function outOfStock() {
    const s = await loadStock();
    return s.items.filter(i => i.stock <= 0);
  }

  // ─── Open Food Facts ──────────────────────────────────────
  // Real API. Returns {name, brand, image, size} or null.
  async function lookupBarcode(barcode) {
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const j = await r.json();
      if (j.status !== 1) return null;
      const p = j.product || {};
      return {
        barcode,
        name: p.product_name || p.product_name_en || 'Unknown product',
        brand: (p.brands || '').split(',')[0].trim(),
        size: p.quantity || '',
        image: p.image_front_url || p.image_url || null,
        categories: p.categories_tags || [],
        // raw keeps the door open
        _raw: p,
      };
    } catch (e) {
      console.warn('OFF lookup failed', e);
      return null;
    }
  }

  // ─── LLM bridge ───────────────────────────────────────────
  // Today: window.claude (Anthropic Haiku, free for demos).
  // Tomorrow: same fn signature, swap to fetch('http://your-droplet:11434/api/generate', ...)
  // for ollama/qwen3:4b. Keep system prompts short — qwen3:4b is small.
  async function askLLM(prompt, { system, expectJson = false } = {}) {
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });
    try {
      const text = await window.claude.complete({ messages });
      if (!expectJson) return text;
      // Try to extract JSON from the response
      const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!m) throw new Error('no json in response');
      return JSON.parse(m[0]);
    } catch (e) {
      console.warn('LLM call failed', e);
      return null;
    }
  }

  // Same shape, but talks to your real Ollama. Not used yet — wire up when ready.
  async function _askOllama(prompt, { system, model = 'qwen3:4b', host = 'http://YOUR-DROPLET:11434' } = {}) {
    const r = await fetch(`${host}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ model, prompt, system, stream: false }),
    });
    const j = await r.json();
    return j.response;
  }

  // ─── LLM-powered helpers ─────────────────────────────────
  async function suggestSubstitution(itemId) {
    const s = await loadStock();
    const it = s.items.find(i => i.id === itemId);
    if (!it) return null;
    const candidates = s.items
      .filter(i => i.id !== itemId && i.stock > 0 && i.aisle === it.aisle)
      .map(i => ({ id: i.id, name: i.name, size: i.size, price: i.price }));
    if (candidates.length === 0) return null;

    const sys = 'You are a helpful corner-shop assistant. Pick the closest substitute for an out-of-stock item. Reply ONLY with JSON: {"id":"sku-XXX","reason":"<one short sentence>"}.';
    const prompt = `Out of stock: ${it.name} (${it.size}).\nAvailable in same aisle:\n${candidates.map(c => `- ${c.id}: ${c.name} ${c.size} $${c.price}`).join('\n')}\n\nPick the best swap.`;
    const result = await askLLM(prompt, { system: sys, expectJson: true });
    if (!result || !result.id) return { id: candidates[0].id, reason: 'Same aisle, in stock.' };
    return result;
  }

  async function categorizeNew({ name, brand, categories }) {
    const aisles = (await listAisles()).map(a => a.id);
    const sys = `You are a stock-room organizer. Choose ONE aisle from this list: ${aisles.join(', ')}. Reply ONLY with JSON: {"aisle":"<id>","reason":"<one short sentence>"}.`;
    const prompt = `Product: ${name}${brand ? ' by ' + brand : ''}\nCategories: ${(categories||[]).slice(0,5).join(', ')}\n\nWhich aisle?`;
    const result = await askLLM(prompt, { system: sys, expectJson: true });
    if (!result || !aisles.includes(result.aisle)) return { aisle: 'pantry', reason: 'Defaulted to pantry.' };
    return result;
  }

  async function organizePickerList(orderItems) {
    // orderItems: [{id, qty}]
    const s = await loadStock();
    const enriched = orderItems.map(o => {
      const it = s.items.find(i => i.id === o.id);
      return it ? { ...o, name: it.name, size: it.size, aisle: it.aisle } : null;
    }).filter(Boolean);

    // Group by aisle order — deterministic, no LLM needed for the bones.
    const byAisle = {};
    enriched.forEach(e => { (byAisle[e.aisle] ||= []).push(e); });
    const ordered = s.shop.aisles
      .filter(a => byAisle[a.id])
      .map(a => ({ aisle: a, items: byAisle[a.id] }));

    return ordered;
  }

  async function optimizeRoute(stops) {
    // stops: [{address, lat, lng}]
    if (stops.length <= 1) return stops;
    const sys = 'You are a delivery dispatcher. Reorder stops for shortest total drive time. Reply ONLY with JSON: {"order":[<original indices in best order>]}.';
    const prompt = `Stops:\n${stops.map((s, i) => `[${i}] ${s.address} (${s.lat}, ${s.lng})`).join('\n')}\n\nReturn best order.`;
    const result = await askLLM(prompt, { system: sys, expectJson: true });
    if (!result || !result.order) return stops;
    return result.order.map(i => stops[i]).filter(Boolean);
  }

  // ─── pub/sub ──────────────────────────────────────────────
  const _subs = {};
  function _emit(evt, data) { (_subs[evt] || []).forEach(f => f(data)); }
  function on(evt, fn) {
    (_subs[evt] ||= []).push(fn);
    return () => { _subs[evt] = _subs[evt].filter(f => f !== fn); };
  }

  window.RKApi = {
    listItems, listAisles, getItem, updateStock, setStock, addItem,
    lowStock, outOfStock,
    lookupBarcode,
    askLLM,
    suggestSubstitution, categorizeNew, organizePickerList, optimizeRoute,
    on,
  };
})();

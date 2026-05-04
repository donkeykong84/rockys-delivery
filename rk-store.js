// rk-store.js — hybrid store: localStorage + BroadcastChannel (always works) + Supabase (cross-device).

const RK_STORE = (() => {
  const KEY = 'rk-orders';
  const BC = ('BroadcastChannel' in window) ? new BroadcastChannel('rk-store') : null;
  const _subs = new Set();

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  function _save(orders) {
    localStorage.setItem(KEY, JSON.stringify(orders));
    if (BC) BC.postMessage({ type: 'update' });
    _notify(orders);
  }
  function _notify(orders) { _subs.forEach(fn => fn(orders)); }

  // Cross-tab sync via BroadcastChannel and storage events
  if (BC) BC.addEventListener('message', () => _notify(_load()));
  window.addEventListener('storage', e => { if (e.key === KEY) _notify(_load()); });

  // Supabase helpers — wrapped in try/catch so failures are silent
  function _fromRow(r) {
    return { id: r.id, customer: r.customer || {}, lines: r.lines || [], stage: r.stage,
      picked: r.picked || {}, subs: r.subs || {}, address: r.address, lat: r.lat, lng: r.lng,
      cancelled: r.cancelled, placedAt: r.placed_at, handedOffAt: r.handed_off_at, deliveredAt: r.delivered_at };
  }
  function _toRow(o) {
    return { id: o.id, customer: o.customer, lines: o.lines, stage: o.stage,
      picked: o.picked || {}, subs: o.subs || {}, address: o.address, lat: o.lat, lng: o.lng,
      cancelled: o.cancelled || false, placed_at: o.placedAt,
      handed_off_at: o.handedOffAt || null, delivered_at: o.deliveredAt || null };
  }

  // Pull from Supabase and merge into localStorage (non-blocking)
  async function _sbPull() {
    if (typeof _SB === 'undefined') return;
    try {
      const { data, error } = await _SB.from('orders').select('*').order('placed_at', { ascending: true });
      if (error || !data) return;
      const sbOrders = data.map(_fromRow);
      // Merge: keep local orders not yet in Supabase, add Supabase orders
      const local = _load();
      const localIds = new Set(local.map(o => o.id));
      const sbIds = new Set(sbOrders.map(o => o.id));
      // Use Supabase as source of truth for orders that exist there
      const merged = [
        ...sbOrders,
        ...local.filter(o => !sbIds.has(o.id)), // local-only orders
      ];
      merged.sort((a, b) => a.placedAt - b.placedAt);
      localStorage.setItem(KEY, JSON.stringify(merged));
      _notify(merged);
    } catch {}
  }

  // Subscribe to Supabase realtime (non-blocking)
  function _sbRealtime() {
    if (typeof _SB === 'undefined') return;
    try {
      _SB.channel('orders-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => _sbPull())
        .subscribe();
    } catch {}
  }

  // Boot: pull from Supabase then start realtime
  _sbPull().then(_sbRealtime);

  return {
    loadOrders() { return _load(); },

    subscribe(fn) {
      _subs.add(fn);
      fn(_load());
      return () => _subs.delete(fn);
    },

    placeOrder(lines, customer = {}) {
      const orders = _load();
      const id = 'R-' + (4800 + orders.length + 1);
      const order = {
        id, lines, customer,
        stage: 0, placedAt: Date.now(),
        subs: {}, picked: {},
        address: customer.address || '21 Mott Street, 4F',
        lat: customer.lat || (51.5155 + (Math.random() - 0.5) * 0.012),
        lng: customer.lng || (-0.0922 + (Math.random() - 0.5) * 0.012),
        cancelled: false,
      };
      orders.push(order);
      _save(orders);
      // Decrement stock
      lines.forEach(l => window.STOCK_API.decrement(l.item.id, l.qty));
      // Push to Supabase in background
      if (typeof _SB !== 'undefined') {
        _SB.from('orders').insert(_toRow(order)).then().catch();
      }
      return order;
    },

    updateOrder(id, patch) {
      const orders = _load().map(o => o.id === id ? { ...o, ...patch } : o);
      _save(orders);
      if (typeof _SB !== 'undefined') {
        const dbPatch = {};
        if (patch.stage !== undefined)       dbPatch.stage = patch.stage;
        if (patch.picked !== undefined)      dbPatch.picked = patch.picked;
        if (patch.subs !== undefined)        dbPatch.subs = patch.subs;
        if (patch.cancelled !== undefined)   dbPatch.cancelled = patch.cancelled;
        if (patch.handedOffAt !== undefined) dbPatch.handed_off_at = patch.handedOffAt;
        if (patch.deliveredAt !== undefined) dbPatch.delivered_at = patch.deliveredAt;
        _SB.from('orders').update(dbPatch).eq('id', id).then().catch();
      }
    },

    cancelOrder(id) { this.updateOrder(id, { cancelled: true }); },

    reset() {
      _save([]);
      if (typeof _SB !== 'undefined') {
        _SB.from('orders').delete().neq('id', '').then().catch();
      }
    },
  };
})();

window.RK_STORE = RK_STORE;

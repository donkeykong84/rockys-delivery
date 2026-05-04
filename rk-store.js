// rk-store.js — Supabase-backed order store. Same public API as localStorage version.

const RK_STORE = (() => {
  let _cache = [];
  let _subs = new Set();
  let _channel = null;
  let _ready = false;

  async function _fetchAll() {
    const { data } = await _SB.from('orders').select('*').order('placed_at', { ascending: true });
    _cache = (data || []).map(_fromRow);
    _subs.forEach(fn => fn(_cache));
  }

  function _fromRow(row) {
    return {
      id: row.id,
      customer: row.customer || {},
      lines: row.lines || [],
      stage: row.stage,
      picked: row.picked || {},
      subs: row.subs || {},
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      cancelled: row.cancelled,
      placedAt: row.placed_at,
      handedOffAt: row.handed_off_at,
      deliveredAt: row.delivered_at,
    };
  }

  function _toRow(o) {
    return {
      id: o.id,
      customer: o.customer,
      lines: o.lines,
      stage: o.stage,
      picked: o.picked || {},
      subs: o.subs || {},
      address: o.address,
      lat: o.lat,
      lng: o.lng,
      cancelled: o.cancelled || false,
      placed_at: o.placedAt,
      handed_off_at: o.handedOffAt || null,
      delivered_at: o.deliveredAt || null,
    };
  }

  function _startRealtime() {
    if (_channel) return;
    _channel = _SB.channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => _fetchAll())
      .subscribe();
  }

  async function _init() {
    if (_ready) return;
    _ready = true;
    await _fetchAll();
    _startRealtime();
  }

  _init();

  return {
    loadOrders() { return _cache; },

    subscribe(fn) {
      _subs.add(fn);
      fn(_cache);
      return () => _subs.delete(fn);
    },

    async placeOrder(lines, customer = {}) {
      const id = 'R-' + (4800 + _cache.length + 1);
      const order = {
        id, lines, customer,
        stage: 0,
        placedAt: Date.now(),
        subs: {}, picked: {},
        address: customer.address || '21 Mott Street, 4F',
        lat: customer.lat || (51.5155 + (Math.random() - 0.5) * 0.012),
        lng: customer.lng || (-0.0922 + (Math.random() - 0.5) * 0.012),
        cancelled: false,
      };
      await _SB.from('orders').insert(_toRow(order));
      for (const l of lines) { await window.STOCK_API.decrement(l.item.id, l.qty); }
      return order;
    },

    async updateOrder(id, patch) {
      const dbPatch = {};
      if (patch.stage !== undefined) dbPatch.stage = patch.stage;
      if (patch.picked !== undefined) dbPatch.picked = patch.picked;
      if (patch.subs !== undefined) dbPatch.subs = patch.subs;
      if (patch.cancelled !== undefined) dbPatch.cancelled = patch.cancelled;
      if (patch.handedOffAt !== undefined) dbPatch.handed_off_at = patch.handedOffAt;
      if (patch.deliveredAt !== undefined) dbPatch.delivered_at = patch.deliveredAt;
      await _SB.from('orders').update(dbPatch).eq('id', id);
    },

    async cancelOrder(id) {
      await _SB.from('orders').update({ cancelled: true }).eq('id', id);
    },

    async reset() {
      await _SB.from('orders').delete().neq('id', '');
      await window.STOCK_API.reset();
    },
  };
})();

window.RK_STORE = RK_STORE;

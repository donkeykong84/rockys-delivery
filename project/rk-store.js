// rk-store.js — shared order store across role pages.
// localStorage-backed, with a BroadcastChannel so multiple tabs sync live.
// Used by every role page; everyone reads/writes the same orders array.

const RK_STORE = {
  _channel: ('BroadcastChannel' in window) ? new BroadcastChannel('rk-store') : null,
  _subs: new Set(),

  loadOrders() {
    try { return JSON.parse(localStorage.getItem('rk-orders') || '[]'); }
    catch (e) { return []; }
  },
  saveOrders(orders) {
    localStorage.setItem('rk-orders', JSON.stringify(orders));
    this._broadcast();
  },
  _broadcast() {
    if (this._channel) this._channel.postMessage({ type: 'orders' });
    this._subs.forEach(fn => fn(this.loadOrders()));
  },
  subscribe(fn) {
    this._subs.add(fn);
    const onMsg = () => fn(this.loadOrders());
    if (this._channel) this._channel.addEventListener('message', onMsg);
    const onStorage = (e) => { if (e.key === 'rk-orders') fn(this.loadOrders()); };
    window.addEventListener('storage', onStorage);
    return () => {
      this._subs.delete(fn);
      if (this._channel) this._channel.removeEventListener('message', onMsg);
      window.removeEventListener('storage', onStorage);
    };
  },

  placeOrder(lines, customer = {}) {
    const orders = this.loadOrders();
    const id = 'R-' + (4800 + orders.length + 1);
    const order = {
      id, lines, customer,
      stage: 0, // 0 received · 1 picking · 2 out · 3 delivered
      placedAt: Date.now(),
      subs: {}, picked: {},
      address: customer.address || '21 Mott Street, 4F',
      lat: customer.lat || (51.5155 + (Math.random() - 0.5) * 0.012),
      lng: customer.lng || (-0.0922 + (Math.random() - 0.5) * 0.012),
      cancelled: false,
    };
    orders.push(order);
    this.saveOrders(orders);
    lines.forEach(l => window.STOCK_API.decrement(l.item.id, l.qty));
    return order;
  },
  updateOrder(id, patch) {
    const orders = this.loadOrders().map(o => o.id === id ? { ...o, ...patch } : o);
    this.saveOrders(orders);
  },
  advanceOrder(id) {
    const orders = this.loadOrders().map(o => o.id === id ? { ...o, stage: Math.min(3, o.stage + 1) } : o);
    this.saveOrders(orders);
  },
  cancelOrder(id) {
    const orders = this.loadOrders().map(o => o.id === id ? { ...o, cancelled: true } : o);
    this.saveOrders(orders);
  },
  removeOrder(id) {
    this.saveOrders(this.loadOrders().filter(o => o.id !== id));
  },
  reset() { this.saveOrders([]); },
};
window.RK_STORE = RK_STORE;

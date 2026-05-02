// rk-auth.js — staff registry + auth shim.
// Roles: customer · picker · driver · stock · manager · it
// All persisted in localStorage. Demo-grade.

// Address shape: { id, label, line1, line2, city, postcode, lat, lng, note }
const RK_DEFAULT_USERS = [
  { email: 'mara@rockys.shop',   role: 'stock',    name: 'Mara Okafor',   landing: 'scan',      created: 0 },
  { email: 'theo@rockys.shop',   role: 'picker',   name: 'Theo Bramwell', landing: 'queue',     created: 0 },
  { email: 'sam@rockys.shop',    role: 'driver',   name: 'Sam Reyes',     landing: 'drops',     created: 0 },
  { email: 'rocky@rockys.shop',  role: 'manager',  name: 'Rocky Hall',    landing: 'overview',  created: 0 },
  { email: 'admin@rockys.shop',  role: 'it',       name: 'IT Admin',      landing: 'dashboard', created: 0 },
  { email: 'demo@customer.com',  role: 'customer', name: 'Demo Customer', landing: 'home',      created: 0,
    addresses: [
      { id: 'a1', label: 'Home',   line1: '21 Mott Street', line2: 'Apt 4F', city: 'London', postcode: 'E1 6QL', lat: 51.5155, lng: -0.0922, note: 'Buzzer 4F · Leave at door' },
      { id: 'a2', label: 'Office', line1: '108 Brick Lane',  line2: 'Floor 3', city: 'London', postcode: 'E1 6RL', lat: 51.5212, lng: -0.0716, note: 'Ask reception for Demo' },
    ],
    defaultAddressId: 'a1',
  },
];

const RK_AUTH = {
  _users: null,
  loadUsers() {
    if (this._users) return this._users;
    try {
      const stored = JSON.parse(localStorage.getItem('rk-users') || 'null');
      this._users = stored || RK_DEFAULT_USERS.slice();
      if (!stored) this.persist();
    } catch (e) { this._users = RK_DEFAULT_USERS.slice(); }
    return this._users;
  },
  persist() { localStorage.setItem('rk-users', JSON.stringify(this._users)); },

  list() { return this.loadUsers().slice(); },
  staffOnly() { return this.loadUsers().filter(u => u.role !== 'customer'); },
  byRole(role) { return this.loadUsers().filter(u => u.role === role); },

  signIn(email, _password) {
    const u = this.loadUsers().find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, error: 'No account found for that email.' };
    sessionStorage.setItem('rk-current-user', JSON.stringify(u));
    return { ok: true, user: u };
  },
  signUp({ email, name, role = 'customer', landing, address }) {
    const users = this.loadUsers();
    if (users.find(x => x.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Email already registered.' };
    }
    if (role === 'customer') {
      if (!address || !address.line1 || !address.city || !address.postcode) {
        return { ok: false, error: 'A delivery address is required for customer accounts.' };
      }
    }
    const u = { email, name, role, landing: landing || (role === 'customer' ? 'home' : 'overview'), created: Date.now() };
    if (role === 'customer') {
      const a = { id: 'a' + Date.now().toString(36), label: address.label || 'Home', line1: address.line1, line2: address.line2 || '', city: address.city, postcode: address.postcode, lat: address.lat || null, lng: address.lng || null, note: address.note || '' };
      u.addresses = [a];
      u.defaultAddressId = a.id;
    }
    users.push(u);
    this._users = users;
    this.persist();
    sessionStorage.setItem('rk-current-user', JSON.stringify(u));
    return { ok: true, user: u };
  },

  // Update the currently-signed-in user (and persist into the registry)
  updateCurrent(patch) {
    const cur = this.current();
    if (!cur) return null;
    const next = { ...cur, ...patch };
    sessionStorage.setItem('rk-current-user', JSON.stringify(next));
    this._users = this.loadUsers().map(x => x.email === cur.email ? next : x);
    this.persist();
    return next;
  },
  // Address helpers
  addAddress(addr) {
    const cur = this.current();
    if (!cur) return null;
    const a = { id: 'a' + Date.now().toString(36), label: addr.label || 'Address', line1: addr.line1 || '', line2: addr.line2 || '', city: addr.city || '', postcode: addr.postcode || '', lat: addr.lat || null, lng: addr.lng || null, note: addr.note || '' };
    const list = (cur.addresses || []).slice();
    list.push(a);
    return this.updateCurrent({ addresses: list, defaultAddressId: cur.defaultAddressId || a.id });
  },
  updateAddress(id, patch) {
    const cur = this.current(); if (!cur) return null;
    const list = (cur.addresses || []).map(x => x.id === id ? { ...x, ...patch } : x);
    return this.updateCurrent({ addresses: list });
  },
  removeAddress(id) {
    const cur = this.current(); if (!cur) return null;
    const list = (cur.addresses || []).filter(x => x.id !== id);
    const def = cur.defaultAddressId === id ? (list[0]?.id || null) : cur.defaultAddressId;
    return this.updateCurrent({ addresses: list, defaultAddressId: def });
  },
  setDefaultAddress(id) {
    return this.updateCurrent({ defaultAddressId: id });
  },
  addStaff({ email, name, role, landing }) {
    const users = this.loadUsers();
    if (users.find(x => x.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'Email exists.' };
    const u = { email, name, role, landing: landing || 'overview', created: Date.now() };
    users.push(u);
    this._users = users;
    this.persist();
    return { ok: true, user: u };
  },
  removeStaff(email) {
    this._users = this.loadUsers().filter(x => x.email.toLowerCase() !== email.toLowerCase());
    this.persist();
  },
  updateStaff(email, patch) {
    this._users = this.loadUsers().map(x => x.email === email ? { ...x, ...patch } : x);
    this.persist();
  },
  current() {
    try { return JSON.parse(sessionStorage.getItem('rk-current-user') || 'null'); } catch (e) { return null; }
  },
  signOut() { sessionStorage.removeItem('rk-current-user'); },

  // landing route map
  landingFor(user) {
    if (!user) return 'Login.html';
    return ({
      customer: 'Customer.html',
      picker:   'Picker.html',
      driver:   'Driver.html',
      stock:    'StockHandler.html',
      manager:  'Manager.html',
      it:       'ITDashboard.html',
    })[user.role] || 'Customer.html';
  },
};
window.RK_AUTH = RK_AUTH;

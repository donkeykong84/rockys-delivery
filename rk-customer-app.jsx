// rk-customer-app.jsx — full customer shop, used by Customer.html
// Fixes the Market/Aisles bug: each tab maps to its own screen.

function aisleIcon(a) {
  return ({ Greengrocer: '🥬', Bakery: '🥖', Dairy: '🧀', 'Meat & Fish': '🥩', Pantry: '🥫', Frozen: '🧊', Snacks: '🍪', Drinks: '🥤', Alcohol: '🍷', Household: '🧴', 'Baby & Pet': '🍼' })[a] || '🛒';
}

function CustomerApp({ inDeviceFrame = true }) {
  const cfg = window.RK_CONFIG.load();
  const [screen, setScreen] = React.useState('home');     // home | aisles | aisleDetail | search | product | cart | checkout | orders | track | account
  const [openItem, setOpenItem] = React.useState(null);
  const [openAisle, setOpenAisle] = React.useState(null);
  const [cart, setCart] = React.useState(() => JSON.parse(localStorage.getItem('rk-cart') || '[]'));
  const [orders, setOrders] = React.useState(window.RK_STORE ? window.RK_STORE.loadOrders() : []);
  const [user, setUser] = React.useState(window.RK_AUTH ? window.RK_AUTH.current() : null);
  const [selectedAddrId, setSelectedAddrId] = React.useState(() => user?.defaultAddressId || user?.addresses?.[0]?.id || null);
  const [pickerNote, setPickerNote] = React.useState('');

  React.useEffect(() => {
    if (!user && window.RK_AUTH) { const u = window.RK_AUTH.current(); if (u) setUser(u); }
  }, []);
  React.useEffect(() => {
    // keep selection valid as the user adds/removes addresses
    if (user && user.addresses && user.addresses.length && !user.addresses.find(a => a.id === selectedAddrId)) {
      setSelectedAddrId(user.defaultAddressId || user.addresses[0].id);
    }
  }, [user]);

  React.useEffect(() => { localStorage.setItem('rk-cart', JSON.stringify(cart)); }, [cart]);
  React.useEffect(() => {
    if (!window.RK_STORE) return;
    return window.RK_STORE.subscribe(setOrders);
  }, []);

  const myOrders = orders.filter(o => !user || o.customer?.email === user?.email || o.customer?.email === undefined);
  const activeOrder = myOrders.filter(o => o.stage < 3 && !o.cancelled).slice(-1)[0];
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const addToCart = (item, qty = 1) => setCart(p => {
    const i = p.findIndex(l => l.item.id === item.id);
    if (i >= 0) { const n = [...p]; n[i] = { ...n[i], qty: n[i].qty + qty }; return n; }
    return [...p, { item, qty }];
  });
  const setQty = (id, q) => setCart(p => p.map(l => l.item.id === id ? { ...l, qty: q } : l).filter(l => l.qty > 0));
  const removeLine = (id) => setCart(p => p.filter(l => l.item.id !== id));

  const goNav = (id) => {
    if (id === 'home')    setScreen('home');
    if (id === 'browse')  setScreen('aisles');
    if (id === 'cart')    setScreen('cart');
    if (id === 'orders')  setScreen(activeOrder ? 'track' : 'orders');
    if (id === 'account') setScreen('account');
  };

  const [placing, setPlacing] = React.useState(false);
  const place = async () => {
    if (!cart.length || placing) return;
    const addr = user?.addresses?.find(a => a.id === selectedAddrId) || user?.addresses?.[0];
    if (user && !addr) { alert('Please add a delivery address first.'); return; }
    const fmtAddr = addr ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city} ${addr.postcode}` : '21 Mott St, London E1 6QL';
    const customer = user
      ? { email: user.email, name: user.name, address: fmtAddr, addressId: addr?.id, note: pickerNote }
      : { email: 'guest@local', name: 'Guest', address: fmtAddr, note: pickerNote };
    const extra = addr?.lat && addr?.lng ? { lat: addr.lat, lng: addr.lng } : {};
    setPlacing(true);
    try {
      await window.RK_STORE.placeOrder(cart, { ...customer, ...extra });
      setCart([]);
      setPickerNote('');
      setScreen('track');
    } catch (e) {
      alert('Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleAddAddress = (draft) => {
    if (!window.RK_AUTH) return null;
    const next = window.RK_AUTH.addAddress(draft);
    if (next) {
      setUser(next);
      const newest = next.addresses[next.addresses.length - 1];
      setSelectedAddrId(newest.id);
      return newest;
    }
    return null;
  };

  let body, hideTabs = false;
  if (screen === 'home') {
    body = <window.RKHomeStock onAdd={addToCart} cartCount={cartCount}
             onNavTab={goNav}
             onOpenProduct={it => { setOpenItem(it); setScreen('product'); }}/>;
  } else if (screen === 'aisles') {
    body = <CAislesIndex onPick={(a) => { setOpenAisle(a); setScreen('aisleDetail'); }} onSearch={() => setScreen('search')}/>;
  } else if (screen === 'aisleDetail') {
    body = <CAisleDetail aisle={openAisle} onBack={() => setScreen('aisles')}
             onAdd={addToCart} onOpen={it => { setOpenItem(it); setScreen('product'); }}/>;
  } else if (screen === 'search') {
    body = <CSearch onBack={() => setScreen('aisles')} onAdd={addToCart}
             onOpen={it => { setOpenItem(it); setScreen('product'); }}/>;
  } else if (screen === 'product') {
    body = <window.RKProduct item={openItem} qty={1}
             onBack={() => setScreen('home')}
             onAdd={(it, q) => { addToCart(it, q); setScreen('cart'); }}/>;
  } else if (screen === 'cart') {
    body = <window.RKCart lines={cart} onQty={setQty} onRemove={removeLine}
             onBack={() => setScreen('home')} onCheckout={() => setScreen('checkout')}/>;
  } else if (screen === 'checkout') {
    hideTabs = true;
    const sub = cart.reduce((s, l) => s + l.item.price * l.qty, 0);
    const fee = sub > cfg.free_delivery_over ? 0 : cfg.delivery_fee;
    const tax = sub * cfg.tax_rate;
    body = <window.RKCheckout total={sub + fee + tax}
             addresses={user?.addresses || []}
             selectedAddressId={selectedAddrId}
             onSelectAddress={setSelectedAddrId}
             onAddAddress={handleAddAddress}
             note={pickerNote}
             onNote={setPickerNote}
             onBack={() => setScreen('cart')} onPlace={place}/>;
  } else if (screen === 'orders') {
    body = <COrdersList orders={myOrders} onOpen={() => setScreen('track')}/>;
  } else if (screen === 'track') {
    body = <CTrack order={activeOrder} onBack={() => setScreen('home')} onChat={() => {}}/>;
  } else if (screen === 'account') {
    body = <CAccount user={user} onSignOut={() => { window.RK_AUTH?.signOut(); window.location.href = 'Login.html'; }}
             onAddressesChanged={(u) => setUser(u)}/>;
  }

  const showTabs = !hideTabs && screen !== 'product';
  const activeTab = ['cart'].includes(screen) ? 'cart' : ['orders','track'].includes(screen) ? 'orders' : ['aisles','aisleDetail','search'].includes(screen) ? 'browse' : screen === 'account' ? 'account' : 'home';

  const inner = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>{body}</div>
      {showTabs && <window.RKTabBar active={activeTab} cartCount={cartCount} onNav={goNav}/>}
    </div>
  );

  if (!inDeviceFrame) return <div style={{ width: 430, height: 800, margin: '0 auto', background: 'var(--paper)', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>{inner}</div>;
  return <window.IOSDevice width={390} height={780}>{inner}</window.IOSDevice>;
}

// ─── Aisles index ─────
function CAislesIndex({ onPick, onSearch }) {
  const [aisles, setAisles] = React.useState([]);
  React.useEffect(() => { window.STOCK_API.aisles().then(setAisles); }, []);
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 24 }}>
      <div style={{ padding: '54px 22px 14px' }}>
        <div className="rk-eyebrow">Browse</div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 36, lineHeight: 1, marginTop: 4, fontWeight: 400 }}>The <em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>aisles.</em></div>
        <div onClick={onSearch} style={{ marginTop: 16, padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 8, color: 'var(--ink-3)', fontFamily: 'Geist', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.6 }}>🔍</span> Search the whole shop…
        </div>
      </div>
      <div style={{ padding: '0 22px' }}>
        {aisles.map((g, i) => (
          <div key={g.aisle} onClick={() => onPick(g)} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--paper-3)', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 32, width: 50, height: 50, background: 'var(--paper-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{aisleIcon(g.aisle)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 18 }}>0{i+1} · {g.aisle}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{g.items.length} items</div>
            </div>
            <span style={{ fontSize: 18, color: 'var(--ink-3)' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function CAisleDetail({ aisle, onBack, onAdd, onOpen }) {
  if (!aisle) return null;
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 24 }}>
      <div style={{ padding: '54px 22px 14px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, color: 'var(--ink)' }}>← Aisles</button>
        <div className="rk-eyebrow" style={{ marginTop: 12 }}>{aisleIcon(aisle.aisle)} Aisle</div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 32, lineHeight: 1, marginTop: 2, fontWeight: 400 }}>{aisle.aisle}<em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>.</em></div>
        <div style={{ fontFamily: 'DM Serif Display', fontStyle: 'italic', color: 'var(--ink-3)', marginTop: 4 }}>{aisle.items.length} items</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 22px' }}>
        {aisle.items.map(it => <window.RKStockCard key={it.id} item={it} onAdd={onAdd} onOpen={onOpen}/>)}
      </div>
    </div>
  );
}
function CSearch({ onBack, onAdd, onOpen }) {
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState('');
  React.useEffect(() => { window.STOCK_API.list().then(setItems); }, []);
  const filtered = q ? items.filter(i => (i.name + ' ' + i.brand).toLowerCase().includes(q.toLowerCase())) : items.slice(0, 12);
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 24 }}>
      <div style={{ padding: '54px 22px 12px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, color: 'var(--ink)' }}>←</button>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
          style={{ width: '100%', marginTop: 10, padding: '14px 16px', border: '1px solid var(--paper-3)', borderRadius: 10, fontFamily: 'Geist', fontSize: 15, background: 'var(--paper-2)', boxSizing: 'border-box' }}/>
      </div>
      <div style={{ padding: '0 22px' }}>
        {filtered.map(it => (
          <div key={it.id} onClick={() => onOpen(it)} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--paper-3)', cursor: 'pointer', alignItems: 'center' }}>
            <div style={{ width: 50, height: 50, background: '#fff', borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--paper-3)' }}>
              {it.image && <img src={it.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" onError={e => e.target.style.display='none'}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 14 }}>{it.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{it.aisle} · £{it.price.toFixed(2)}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onAdd(it); }} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontSize: 14 }}>+</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders / track ─────
function COrdersList({ orders, onOpen }) {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', padding: '54px 22px 24px' }}>
      <div className="rk-eyebrow">My orders</div>
      <div style={{ fontFamily: 'DM Serif Display', fontSize: 36, fontWeight: 400 }}>History<em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>.</em></div>
      {orders.length === 0 && <div style={{ marginTop: 18, color: 'var(--ink-3)', fontFamily: 'DM Serif Display', fontStyle: 'italic' }}>No orders yet — go to the Market.</div>}
      {orders.slice().reverse().map(o => (
        <div key={o.id} onClick={onOpen} style={{ marginTop: 12, padding: 14, background: 'var(--paper-2)', borderRadius: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'DM Serif Display', fontSize: 16 }}>#{o.id}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{o.lines.length} items</div>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: o.cancelled ? 'var(--persimmon)' : 'var(--olive)' }}>
            {o.cancelled ? 'Cancelled' : ['Received','Picking','Out for delivery','Delivered'][o.stage]}
          </div>
        </div>
      ))}
    </div>
  );
}
function CTrack({ order, onBack, onChat }) {
  if (!order) return (
    <div style={{ padding: 60, color: 'var(--ink-3)', fontFamily: 'DM Serif Display', fontStyle: 'italic' }}>No active order.</div>
  );
  const stages = ['Received', 'Picking your basket', 'Out for delivery', 'Delivered'];
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      <div style={{ padding: '54px 22px 16px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#d9b13a', textTransform: 'uppercase' }}>Order · {order.id}</div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 28, marginTop: 4 }}>{stages[order.stage]}<em style={{ color: '#d9b13a', fontStyle: 'italic' }}>.</em></div>
        <div style={{ fontSize: 12, color: '#c9bfa8', marginTop: 4 }}>To {order.address}</div>
      </div>
      {order.stage >= 2 && window.RKMap && (
        <window.RKMap shop={{ lat: window.RK_CONFIG.get('shop_lat'), lng: window.RK_CONFIG.get('shop_lng') }}
                      dest={{ lat: order.lat, lng: order.lng }}
                      stage={order.stage} height={220}/>
      )}
      {order.stage < 2 && (
        <div style={{ height: 200, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontFamily: 'DM Serif Display', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
          {order.stage === 0 ? 'Waiting for the picker to start your basket.' : 'A picker is putting your basket together right now.'}
        </div>
      )}
      <div style={{ padding: 22 }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', alignItems: 'center', opacity: order.stage >= i ? 1 : 0.35 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: order.stage >= i ? 'var(--olive)' : 'var(--paper-3)', color: order.stage >= i ? '#fff8ec' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
              {order.stage > i ? '✓' : i + 1}
            </div>
            <div style={{ fontFamily: 'DM Serif Display', fontSize: 16 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function CAccount({ user, onSignOut, onAddressesChanged }) {
  const [u, setU] = React.useState(user);
  React.useEffect(() => setU(user), [user]);
  const [adding, setAdding] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  const [draft, setDraft] = React.useState({ label: 'Home', line1: '', line2: '', city: '', postcode: '', note: '' });
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const refresh = () => { const nx = window.RK_AUTH.current(); setU(nx); onAddressesChanged && onAddressesChanged(nx); };

  const startAdd = () => { setDraft({ label: 'Home', line1: '', line2: '', city: '', postcode: '', note: '' }); setEditId(null); setAdding(true); };
  const startEdit = (a) => { setDraft({ ...a }); setEditId(a.id); setAdding(true); };
  const save = () => {
    if (!draft.line1 || !draft.city || !draft.postcode) return alert('Address line, city and postcode are required.');
    if (editId) window.RK_AUTH.updateAddress(editId, draft);
    else window.RK_AUTH.addAddress(draft);
    setAdding(false); setEditId(null); refresh();
  };
  const remove = (id) => { if (confirm('Remove this address?')) { window.RK_AUTH.removeAddress(id); refresh(); } };
  const setDefault = (id) => { window.RK_AUTH.setDefaultAddress(id); refresh(); };

  const addresses = u?.addresses || [];

  return (
    <div style={{ padding: '54px 22px', minHeight: '100%' }}>
      <div className="rk-eyebrow">Account</div>
      <div style={{ fontFamily: 'DM Serif Display', fontSize: 32, marginTop: 4 }}>{u?.name || 'Guest'}<em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>.</em></div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u?.email || 'Browsing as guest'}</div>

      {u && (
        <>
          <div className="rk-rule" style={{ margin: '24px 0 14px' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="rk-eyebrow">Saved addresses</div>
            {!adding && <span onClick={startAdd} style={{ fontSize: 11, color: 'var(--persimmon)', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase' }}>+ Add</span>}
          </div>

          {!adding && addresses.length === 0 && (
            <div style={{ marginTop: 12, fontFamily: 'DM Serif Display', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 13 }}>No saved addresses yet.</div>
          )}
          {!adding && addresses.map(a => (
            <div key={a.id} style={{ padding: 14, border: '1px solid ' + (a.id === u.defaultAddressId ? 'var(--ink)' : 'var(--paper-3)'), borderRadius: 10, marginTop: 10, background: a.id === u.defaultAddressId ? 'var(--paper-2)' : 'var(--paper)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'DM Serif Display', fontSize: 18 }}>{a.label}</div>
                {a.id === u.defaultAddressId && <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--olive)', textTransform: 'uppercase' }}>✓ Default</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{a.line1}{a.line2 ? ', ' + a.line2 : ''}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.city} {a.postcode}</div>
              {a.note && <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--ink-3)', marginTop: 4 }}>“{a.note}”</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {a.id !== u.defaultAddressId && <button onClick={() => setDefault(a.id)} style={accBtn}>Make default</button>}
                <button onClick={() => startEdit(a)} style={accBtn}>Edit</button>
                {addresses.length > 1 && <button onClick={() => remove(a.id)} style={{ ...accBtn, color: 'var(--persimmon)' }}>Remove</button>}
              </div>
            </div>
          ))}

          {adding && (
            <div style={{ marginTop: 12, padding: 14, border: '1px solid var(--paper-3)', borderRadius: 10, background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 18 }}>{editId ? 'Edit' : 'New'} <em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>address.</em></div>
              <input style={accInput} placeholder="Label" value={draft.label} onChange={e => setD('label', e.target.value)}/>
              <input style={accInput} placeholder="Address line 1*" value={draft.line1} onChange={e => setD('line1', e.target.value)}/>
              <input style={accInput} placeholder="Address line 2" value={draft.line2} onChange={e => setD('line2', e.target.value)}/>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...accInput, flex: 2 }} placeholder="City*" value={draft.city} onChange={e => setD('city', e.target.value)}/>
                <input style={{ ...accInput, flex: 1 }} placeholder="Postcode*" value={draft.postcode} onChange={e => setD('postcode', e.target.value)}/>
              </div>
              <input style={accInput} placeholder="Delivery note" value={draft.note} onChange={e => setD('note', e.target.value)}/>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setAdding(false); setEditId(null); }} style={{ ...accBtn, flex: 1 }}>Cancel</button>
                <button onClick={save} style={{ ...accBtn, flex: 2, background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}>Save</button>
              </div>
            </div>
          )}
        </>
      )}

      <button onClick={onSignOut} style={{ marginTop: 30, padding: '12px 18px', background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderRadius: 999, fontFamily: 'Geist', fontWeight: 600, cursor: 'pointer' }}>
        {u ? 'Sign out' : 'Sign in →'}
      </button>
    </div>
  );
}
const accInput = { padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13, background: 'var(--paper)', boxSizing: 'border-box', width: '100%' };
const accBtn = { padding: '8px 14px', background: 'var(--paper)', border: '1px solid var(--paper-3)', borderRadius: 999, fontFamily: 'Geist', fontWeight: 500, fontSize: 11, cursor: 'pointer', color: 'var(--ink)' };

window.CustomerApp = CustomerApp;

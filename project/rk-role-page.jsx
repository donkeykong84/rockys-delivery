// rk-role-page.jsx — header used by every staff role page (top bar w/ user + sign out + nav)
function RKRoleHeader({ pageColor = 'var(--ink)', pageEmoji = '·' }) {
  const cfg = window.RK_CONFIG.load();
  const u = window.RK_AUTH.current();
  if (!u) { window.location.href = 'Login.html'; return null; }
  const signOut = () => { window.RK_AUTH.signOut(); window.location.href = 'Login.html'; };

  const links = {
    customer: [],
    picker:   [['Picker.html', 'My queue'], ['Customer.html', 'See shop']],
    driver:   [['Driver.html', 'My drops']],
    stock:    [['StockHandler.html', 'Stock room']],
    manager:  [['Manager.html', 'Overview'], ['Picker.html', 'Picker'], ['Driver.html', 'Driver'], ['StockHandler.html', 'Stock'], ['Customer.html', 'Customer']],
    it:       [['ITDashboard.html', 'Dashboard'], ['Manager.html', 'Manager view']],
  }[u.role] || [];

  return (
    <div style={{ background: pageColor, color: 'var(--paper)', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href={u.role === 'customer' ? 'Customer.html' : (u.role === 'manager' ? 'Manager.html' : '#')} style={{ color: 'var(--paper)', textDecoration: 'none', fontFamily: 'DM Serif Display', fontSize: 22 }}>
          {cfg.brand_name}<em style={{ color: '#d9b13a', fontStyle: 'italic' }}>.</em>
        </a>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', color: '#d9b13a', textTransform: 'uppercase' }}>{pageEmoji} {u.role}</span>
        {links.length > 0 && <div style={{ display: 'flex', gap: 8 }}>{links.map(([href, lbl]) => <a key={href} href={href} style={{ fontSize: 12, color: 'rgba(244,239,230,0.7)', textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(244,239,230,0.15)' }}>{lbl}</a>)}</div>}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
        <span style={{ color: '#c9bfa8' }}>{u.name}</span>
        <button onClick={signOut} style={{ background: 'transparent', border: '1px solid rgba(244,239,230,0.2)', color: 'var(--paper)', padding: '4px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontFamily: 'Geist' }}>Sign out</button>
      </div>
    </div>
  );
}
window.RKRoleHeader = RKRoleHeader;

// Hook used by every role to subscribe to live orders from Supabase
function useOrders() {
  const [orders, setOrders] = React.useState(() => window.RK_STORE.loadOrders());
  React.useEffect(() => window.RK_STORE.subscribe(setOrders), []);
  return [orders, setOrders];
}
window.useOrders = useOrders;

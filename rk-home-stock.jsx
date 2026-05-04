// rk-home-stock.jsx — alternate Home that uses real STOCK_API + OFF images.
// Same layout as RKHome but lists real-products from the stock catalog.

function RKHomeStock({ onAdd, cartCount = 0, onNavTab, onOpenProduct }) {
  const [items, setItems] = React.useState([]);
  const [aisles, setAisles] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      setItems(await window.STOCK_API.list());
      setAisles(await window.STOCK_API.aisles());
    })();
  }, []);
  const hero = items.find(i => i.id === 'sk014') || items[0]; // Nutella as hero

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="rk-eyebrow">Vol. iv · Tue, May 5</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <RKIcon k="search" color="var(--ink)" />
            <RKIcon k="user" color="var(--ink)" />
          </div>
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 56, lineHeight: 0.92, color: 'var(--ink)', letterSpacing: '-0.02em', marginTop: 14, fontWeight: 400 }}>
          Rocky&rsquo;s<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>Market.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontSize: 13 }}>
          <RKIcon k="pin" size={14} color="var(--olive)" />
          <span>Delivering to <b style={{ color: 'var(--ink)' }}>21 Mott St.</b></span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <RKIcon k="clock" size={14} color="var(--olive)" />
          <span>Today, 4–5 pm</span>
        </div>
        <div className="rk-rule" style={{ marginTop: 18 }} />
      </div>

      {/* Hero — real product photo */}
      {hero && (
        <div style={{ padding: '20px 22px 0' }}>
          <RKEyebrow accent="persimmon">Pick of the Day</RKEyebrow>
          <div onClick={() => onOpenProduct?.(hero)}
            style={{ marginTop: 8, padding: 18, background: '#2a2419', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden', cursor: 'pointer', minHeight: 200 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(196,84,29,0.18), transparent 60%)' }} />
            <div style={{ position: 'relative', maxWidth: '60%' }}>
              <div className="rk-eyebrow" style={{ color: '#d9b13a' }}>Feature</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 30, lineHeight: 0.95, color: '#f4efe6', marginTop: 6, fontWeight: 400 }}>{hero.name}</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: '#c9bfa8', marginTop: 4 }}>{hero.variant}</div>
              <button onClick={(e) => { e.stopPropagation(); onAdd?.(hero); }}
                style={{ marginTop: 14, background: 'var(--persimmon)', color: '#fff8ec', border: 'none', borderRadius: 999, padding: '10px 16px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer' }}>
                Add · £{hero.price.toFixed(2)}
              </button>
            </div>
            <div style={{ position: 'absolute', right: 8, bottom: 8, top: 8, width: '38%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={hero.image} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.4))' }} alt="" onError={(e) => e.target.style.display='none'}/>
            </div>
          </div>
        </div>
      )}

      {/* Aisles with real products */}
      {aisles.slice(0, 5).map(g => (
        <div key={g.aisle} style={{ padding: '24px 0 0' }}>
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <RKEyebrow>{g.aisle}</RKEyebrow>
              <div style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink)', marginTop: 2, fontWeight: 400 }}>
                {g.items.length} {g.items.length === 1 ? 'item' : 'items'}.
              </div>
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-3)' }}>See all</span>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '12px 22px 0', overflowX: 'auto' }}>
            {g.items.slice(0, 6).map(it => (
              <RKStockCard key={it.id} item={it} onAdd={onAdd} onOpen={onOpenProduct}/>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: 24 }}/>
    </div>
  );
}

function RKStockCard({ item, onAdd, onOpen }) {
  const oos = item.qty <= 0;
  const low = item.qty > 0 && item.qty <= item.low;
  return (
    <div onClick={() => onOpen?.(item)}
      style={{ flexShrink: 0, width: 158, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 12, cursor: 'pointer', position: 'relative' }}>
      {low && !oos && <span className="rk-eyebrow" style={{ position: 'absolute', top: 10, right: 10, color: 'var(--persimmon)' }}>Low</span>}
      <div style={{ background: '#fff', borderRadius: 6, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 }}>
        <img src={item.image} alt={item.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', opacity: oos ? 0.4 : 1 }} onError={(e) => { e.target.style.display = 'none'; }}/>
      </div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 14, lineHeight: 1.15, color: 'var(--ink)', minHeight: 32 }}>{item.name}</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{item.variant}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)' }}>£{item.price.toFixed(2)}</div>
        <button onClick={(e) => { e.stopPropagation(); !oos && onAdd?.(item); }}
          disabled={oos}
          style={{ width: 30, height: 30, borderRadius: '50%', background: oos ? 'var(--paper-3)' : 'var(--ink)', color: 'var(--paper)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: oos ? 'default' : 'pointer' }}>
          <RKIcon k="plus" size={14} color="var(--paper)" strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { RKHomeStock, RKStockCard });

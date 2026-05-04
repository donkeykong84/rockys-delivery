// rk-home.jsx — The Market (home/browse) screen.
// Editorial cover: masthead, hero feature, "Today's edit" rail, collections.

function RKHome({ onAdd, cartCount = 0, onNavTab, onOpenProduct }) {
  const cat = ROCKY_CATALOG;
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Masthead ─────────────────────────── */}
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="rk-eyebrow">Vol. iv · Tue, May 5</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <RKIcon k="search" color="var(--ink)" />
            <RKIcon k="user" color="var(--ink)" />
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--display)', fontSize: 56, lineHeight: 0.92,
          color: 'var(--ink)', letterSpacing: '-0.02em',
          marginTop: 14, fontWeight: 400,
        }}>
          Rocky&rsquo;s<br />
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

      {/* ─── Hero feature ──────────────────────── */}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <RKEyebrow accent="persimmon">The Cover · In Season</RKEyebrow>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)' }}>no. 01</span>
        </div>
        <div onClick={() => onOpenProduct?.(cat.hero)}
          style={{
            marginTop: 8, padding: 18,
            background: '#2a2419',
            borderRadius: 'var(--r-lg)',
            position: 'relative', overflow: 'hidden',
            cursor: 'pointer',
          }}>
          {/* faint texture */}
          <div style={{ position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(196,84,29,0.18), transparent 60%)' }} />
          <div style={{ position: 'relative' }}>
            <div className="rk-eyebrow" style={{ color: '#d9b13a' }}>Feature</div>
            <div style={{
              fontFamily: 'var(--display)', fontSize: 38, lineHeight: 0.95,
              color: '#f4efe6', marginTop: 6, fontWeight: 400,
            }}>{cat.hero.name.split(' ').slice(0,-1).join(' ')}<br />
              <span style={{ fontStyle: 'italic' }}>{cat.hero.name.split(' ').slice(-1)}.</span>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: '#c9bfa8',
              maxWidth: 230, marginTop: 10, lineHeight: 1.4 }}>
              {cat.hero.note}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <button onClick={(e) => { e.stopPropagation(); onAdd?.(cat.hero); }}
                style={{
                  background: 'var(--persimmon)', color: '#fff8ec',
                  border: 'none', borderRadius: 999,
                  padding: '10px 18px',
                  fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13,
                  letterSpacing: '0.04em', cursor: 'pointer',
                }}>Add to basket · {fmtPrice(cat.hero.price)}</button>
              <span className="rk-eyebrow" style={{ color: '#a89e8b' }}>per {cat.hero.unit}</span>
            </div>
          </div>
          <div style={{ position: 'absolute', right: -10, bottom: -14, opacity: 0.95 }}>
            <RKProduce kind={cat.hero.kind} size={180} tint={cat.hero.tint} />
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <div className="rk-seal rk-seal-sm" style={{ background: '#d9b13a', color: '#2a2419', transform: 'rotate(8deg)' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 11, lineHeight: 1, textAlign: 'center' }}>Pick<br/>of the<br/>day</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Today's edit (horizontal rail) ─── */}
      <div style={{ padding: '28px 0 0' }}>
        <div style={{ padding: '0 22px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <RKEyebrow>Today&rsquo;s Edit</RKEyebrow>
            <div style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink)', marginTop: 2, fontWeight: 400 }}>
              Six things, hand-picked.
            </div>
          </div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 3 }}>See all</span>
        </div>
        <div style={{ display: 'flex', gap: 12, padding: '14px 22px 0', overflowX: 'auto' }}>
          {cat.picks.slice(0, 6).map((it, i) => (
            <RKProductCard key={it.id} item={it} idx={i+1} onAdd={onAdd} onOpen={onOpenProduct} />
          ))}
        </div>
      </div>

      {/* ─── Collections grid ────────────────── */}
      <div style={{ padding: '32px 22px 28px' }}>
        <RKEyebrow>Aisles</RKEyebrow>
        <div style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink)', marginTop: 2, marginBottom: 14, fontWeight: 400 }}>
          Browse the shop.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {cat.collections.map((c, i) => (
            <div key={c.id} style={{
              background: i % 3 === 0 ? '#3a3a26' : i % 3 === 1 ? 'var(--paper-2)' : '#5b2a3a',
              color: i % 3 === 1 ? 'var(--ink)' : 'var(--paper)',
              borderRadius: 'var(--r-md)',
              padding: '14px 14px 12px',
              minHeight: 132, position: 'relative', overflow: 'hidden',
              cursor: 'pointer',
            }}>
              <div className="rk-eyebrow" style={{ color: i % 3 === 1 ? 'var(--ink-3)' : 'rgba(255,255,255,0.55)' }}>No. 0{i+1}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 20, lineHeight: 1, marginTop: 6, fontWeight: 400 }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11,
                color: i % 3 === 1 ? 'var(--ink-3)' : 'rgba(255,255,255,0.6)', marginTop: 4 }}>{c.sub}</div>
              <div style={{ position: 'absolute', right: -6, bottom: -10, opacity: 0.95 }}>
                <RKProduce kind={c.kind} size={84} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Editorial note ─────────────────── */}
      <div style={{ padding: '0 22px 28px' }}>
        <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 18 }}>
          <RKEyebrow accent="olive">From the Shopkeeper</RKEyebrow>
          <p className="rk-dropcap" style={{
            fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)',
            marginTop: 8, marginBottom: 0,
          }}>
            Figs landed this morning from Sal&rsquo;s orchard. We&rsquo;ll be honest — they bruise looking at them, so we&rsquo;ve only got eighty pints. Pair with the Comté and a glass of the Broc.
          </p>
          <div style={{ marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>
            — R.M., shopkeeper
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── product card (used in rail + grids) ──────────────────────
function RKProductCard({ item, idx, onAdd, onOpen, wide = false }) {
  return (
    <div onClick={() => onOpen?.(item)}
      style={{
        flexShrink: 0, width: wide ? '100%' : 168,
        background: 'var(--paper-2)', borderRadius: 'var(--r-md)',
        padding: 12, position: 'relative',
        cursor: 'pointer',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {idx && <span className="rk-eyebrow" style={{ color: 'var(--ink-3)' }}>{String(idx).padStart(2,'0')}</span>}
        {item.sale && <span className="rk-eyebrow" style={{ color: 'var(--persimmon)' }}>Sale</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 4px', height: 96 }}>
        <RKProduce kind={item.kind} size={92} />
      </div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1.1, color: 'var(--ink)', fontWeight: 400 }}>
        {item.name}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
        {item.producer}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink)' }}>
            {fmtPrice(item.price)}
            {item.was && <span style={{ marginLeft: 6, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-4)', textDecoration: 'line-through' }}>{fmtPrice(item.was)}</span>}
          </div>
          <div className="rk-eyebrow" style={{ color: 'var(--ink-4)' }}>per {item.unit}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAdd?.(item); }}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <RKIcon k="plus" size={16} color="var(--paper)" strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { RKHome, RKProductCard });

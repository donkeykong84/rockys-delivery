// rk-shared.jsx — shared atoms used across all Rocky's screens.
// Exposes: RKLogo, RKProduce (illustrated produce placeholder), RKIcon,
//          RKSeal, RKEyebrow, RKTabBar, fmtPrice, ROCKY_CATALOG.

// ─── tiny logomark (a nestled R inside a circle, editorial) ────
function RKLogo({ size = 28, color = 'var(--ink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="1.4" fill="none" />
      <text x="20" y="27" textAnchor="middle" fontFamily="DM Serif Display, serif"
            fontSize="22" fill={color}>R</text>
      <circle cx="32" cy="9" r="1.6" fill={color} />
    </svg>
  );
}

// ─── produce illustration — simple, hand-drawn, premium feel ────
// kind chooses the silhouette; tint layers the paint.
function RKProduce({ kind = 'apple', size = 120, tint }) {
  const palette = {
    apple:     { fill: '#c4541d', leaf: '#4a5436', stem: '#3a3429' },
    pear:      { fill: '#a89e36', leaf: '#4a5436', stem: '#3a3429' },
    lemon:     { fill: '#d9b13a', leaf: '#4a5436', stem: '#3a3429' },
    tomato:    { fill: '#b03f1e', leaf: '#4a5436', stem: '#3a3429' },
    bread:     { fill: '#c8965a', leaf: '#8a6232', stem: '#3a3429' },
    egg:       { fill: '#f0e5cc', leaf: '#a89e8b', stem: '#3a3429' },
    milk:      { fill: '#f4efe6', leaf: '#5b2a3a', stem: '#1d1a14' },
    leaf:      { fill: '#6c7a4f', leaf: '#4a5436', stem: '#3a3429' },
    grape:     { fill: '#5b2a3a', leaf: '#4a5436', stem: '#3a3429' },
    olive:     { fill: '#4a5436', leaf: '#6c7a4f', stem: '#3a3429' },
    cheese:    { fill: '#d9b13a', leaf: '#b8893a', stem: '#3a3429' },
    fish:      { fill: '#7a8896', leaf: '#5b6a76', stem: '#3a3429' },
    coffee:    { fill: '#3a2418', leaf: '#6c4a30', stem: '#1d1a14' },
    wine:      { fill: '#5b2a3a', leaf: '#3a1a26', stem: '#1d1a14' },
    pasta:     { fill: '#e0c878', leaf: '#b8893a', stem: '#3a3429' },
  };
  const p = { ...palette[kind] || palette.apple, ...(tint || {}) };

  const shape = {
    apple: (
      <>
        <path d="M50 22 C30 22, 20 38, 22 60 C24 82, 38 92, 50 92 C62 92, 76 82, 78 60 C80 38, 70 22, 50 22 Z"
              fill={p.fill} />
        <path d="M50 22 C50 18, 52 12, 56 10 C60 8, 64 10, 62 14" stroke={p.stem} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M55 14 Q66 8, 72 14 Q66 20, 55 18 Z" fill={p.leaf} />
      </>
    ),
    pear: (
      <>
        <path d="M50 26 C40 26, 36 34, 38 44 C30 50, 22 64, 28 80 C34 92, 50 94, 50 94 C50 94, 66 92, 72 80 C78 64, 70 50, 62 44 C64 34, 60 26, 50 26 Z" fill={p.fill}/>
        <path d="M50 26 V18" stroke={p.stem} strokeWidth="2" strokeLinecap="round"/>
        <path d="M50 22 Q60 16, 64 20 Q56 24, 50 24 Z" fill={p.leaf}/>
      </>
    ),
    lemon: (
      <>
        <ellipse cx="50" cy="55" rx="32" ry="26" fill={p.fill} transform="rotate(-15 50 55)"/>
        <path d="M22 48 Q18 46, 16 48" stroke={p.fill} strokeWidth="3" strokeLinecap="round"/>
        <path d="M78 60 Q82 60, 84 64" stroke={p.fill} strokeWidth="3" strokeLinecap="round"/>
        <path d="M52 32 Q56 28, 62 30" stroke={p.leaf} strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>
    ),
    tomato: (
      <>
        <circle cx="50" cy="58" r="32" fill={p.fill}/>
        <path d="M50 28 L40 22 M50 28 L60 22 M50 28 L50 18 M50 28 L34 26 M50 28 L66 26" stroke={p.leaf} strokeWidth="3" strokeLinecap="round"/>
      </>
    ),
    bread: (
      <>
        <path d="M16 50 Q20 30, 50 30 Q80 30, 84 50 Q86 80, 50 82 Q14 80, 16 50 Z" fill={p.fill}/>
        <path d="M30 46 Q50 38, 70 46" stroke={p.stem} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M28 56 Q50 48, 72 56" stroke={p.stem} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M30 66 Q50 58, 70 66" stroke={p.stem} strokeWidth="1.5" fill="none" opacity="0.4"/>
      </>
    ),
    egg: (
      <ellipse cx="50" cy="55" rx="26" ry="32" fill={p.fill} stroke="#d9cfb5" strokeWidth="1"/>
    ),
    milk: (
      <>
        <path d="M30 22 H70 V32 L74 38 V86 H26 V38 L30 32 Z" fill={p.fill} stroke={p.stem} strokeWidth="1.5"/>
        <rect x="34" y="48" width="32" height="22" fill={p.leaf} opacity="0.15"/>
        <text x="50" y="62" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="11" fill={p.leaf}>milk</text>
      </>
    ),
    leaf: (
      <>
        <path d="M50 18 C30 24, 18 50, 26 78 C30 90, 42 92, 50 88 C58 92, 70 90, 74 78 C82 50, 70 24, 50 18 Z" fill={p.fill}/>
        <path d="M50 18 V90" stroke={p.leaf} strokeWidth="1.5" opacity="0.5"/>
        <path d="M50 36 L34 42 M50 50 L30 58 M50 64 L34 72 M50 36 L66 42 M50 50 L70 58 M50 64 L66 72" stroke={p.leaf} strokeWidth="1" opacity="0.5"/>
      </>
    ),
    grape: (
      <>
        {[[40,40],[60,40],[50,52],[34,52],[66,52],[44,64],[56,64],[50,76]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="8.5" fill={p.fill} opacity={0.85+0.04*((i*3)%4)}/>
        ))}
        <path d="M50 38 Q52 28, 60 22" stroke={p.stem} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M58 24 Q66 18, 72 22" fill={p.leaf}/>
      </>
    ),
    olive: (
      <>
        <ellipse cx="42" cy="48" rx="9" ry="13" fill={p.fill} transform="rotate(-15 42 48)"/>
        <ellipse cx="58" cy="58" rx="9" ry="13" fill={p.fill} transform="rotate(20 58 58)"/>
        <ellipse cx="50" cy="72" rx="9" ry="13" fill={p.fill}/>
        <path d="M30 30 Q38 36, 42 44 M70 36 Q60 42, 56 50 M50 60 V70" stroke={p.leaf} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M22 22 Q34 22, 36 32 Q26 30, 22 22 Z" fill={p.leaf}/>
        <path d="M78 28 Q66 30, 64 40 Q74 36, 78 28 Z" fill={p.leaf}/>
      </>
    ),
    cheese: (
      <>
        <path d="M16 70 L84 70 L78 38 L22 38 Z" fill={p.fill} stroke={p.leaf} strokeWidth="1.5"/>
        <path d="M16 70 L84 70" stroke={p.stem} strokeWidth="1" opacity="0.3"/>
        <circle cx="38" cy="56" r="3" fill={p.leaf} opacity="0.4"/>
        <circle cx="56" cy="50" r="2.5" fill={p.leaf} opacity="0.4"/>
        <circle cx="64" cy="60" r="2" fill={p.leaf} opacity="0.4"/>
      </>
    ),
    fish: (
      <>
        <path d="M14 54 L28 38 L72 38 L86 28 L82 54 L86 80 L72 70 L28 70 L14 54 Z" fill={p.fill}/>
        <circle cx="34" cy="50" r="2" fill={p.stem}/>
        <path d="M40 50 Q56 48, 70 54" stroke={p.leaf} strokeWidth="1" fill="none" opacity="0.5"/>
      </>
    ),
    coffee: (
      <>
        <ellipse cx="50" cy="60" rx="28" ry="10" fill={p.fill}/>
        <path d="M22 60 Q22 88, 50 88 Q78 88, 78 60" fill={p.fill} stroke={p.stem} strokeWidth="1"/>
        <path d="M76 64 Q90 66, 90 76 Q90 84, 76 82" stroke={p.stem} strokeWidth="2" fill="none"/>
        <ellipse cx="50" cy="58" rx="22" ry="6" fill={p.leaf} opacity="0.4"/>
      </>
    ),
    wine: (
      <>
        <path d="M40 18 H60 L62 28 Q62 48, 58 52 Q56 56, 56 64 V82 H44 V64 Q44 56, 42 52 Q38 48, 38 28 Z" fill={p.fill} stroke={p.stem} strokeWidth="1"/>
        <rect x="42" y="34" width="16" height="14" fill={p.leaf} opacity="0.25"/>
      </>
    ),
    pasta: (
      <>
        <ellipse cx="50" cy="62" rx="32" ry="20" fill={p.leaf} opacity="0.35"/>
        <g stroke={p.fill} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M22 56 Q34 44, 50 50 Q66 56, 78 50"/>
          <path d="M22 64 Q40 52, 56 60 Q70 66, 78 60"/>
          <path d="M26 70 Q40 60, 54 66 Q68 72, 78 68"/>
        </g>
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {shape[kind] || shape.apple}
    </svg>
  );
}

// ─── price seal (round stamp) ───────────────────────────────────
function RKSeal({ price, sale, size = 'md' }) {
  const [whole, dec] = String(price.toFixed(2)).split('.');
  const small = size === 'sm';
  return (
    <div className={small ? 'rk-seal rk-seal-sm' : 'rk-seal'}>
      <div className="rk-seal-num" style={{ fontSize: small ? 16 : 22 }}>
        ${whole}<span className="rk-seal-cents">.{dec}</span>
      </div>
      {sale && !small && (
        <div style={{ fontFamily: 'var(--sans)', fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.9, marginTop: 1 }}>SALE</div>
      )}
    </div>
  );
}

// ─── eyebrow label ──────────────────────────────────────────────
function RKEyebrow({ children, accent = 'olive', style }) {
  return (
    <div className={`rk-eyebrow rk-eyebrow-${accent}`} style={style}>{children}</div>
  );
}

// ─── tab bar (paper, with serif numerals on the cart badge) ────
function RKTabBar({ active = 'home', cartCount = 0, onNav }) {
  const items = [
    { id: 'home',   label: 'Market',  icon: 'home' },
    { id: 'browse', label: 'Aisles',  icon: 'browse' },
    { id: 'cart',   label: 'Basket',  icon: 'cart' },
    { id: 'orders', label: 'Orders',  icon: 'orders' },
    { id: 'account',label: 'Me',      icon: 'account' },
  ];
  const Icon = ({ k, on }) => {
    const stroke = on ? 'var(--olive)' : 'var(--ink-3)';
    if (k === 'home') return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>
      </svg>
    );
    if (k === 'browse') return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 6h16M4 12h16M4 18h10"/>
      </svg>
    );
    if (k === 'cart') return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h3l2.5 11h10l2-8H7"/>
        <circle cx="9" cy="20" r="1.4" fill={stroke} stroke="none"/>
        <circle cx="17" cy="20" r="1.4" fill={stroke} stroke="none"/>
      </svg>
    );
    if (k === 'account') return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
      </svg>
    );
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="1.5"/>
        <path d="M8 9h8M8 13h8M8 17h5"/>
      </svg>
    );
  };
  return (
    <div style={{
      borderTop: '1px solid var(--paper-3)',
      background: 'var(--paper)',
      padding: '8px 8px 22px',
      display: 'flex', justifyContent: 'space-around',
      fontFamily: 'var(--sans)',
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <button key={it.id} onClick={() => onNav?.(it.id)}
            style={{
              background: 'none', border: 'none', padding: '6px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer', position: 'relative',
            }}>
            <Icon k={it.icon} on={on}/>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: on ? 'var(--olive)' : 'var(--ink-3)', fontWeight: on ? 600 : 500 }}>{it.label}</span>
            {it.id === 'cart' && cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 6,
                minWidth: 18, height: 18, borderRadius: 9,
                background: 'var(--persimmon)', color: '#fff8ec',
                fontFamily: 'var(--display)', fontSize: 12, lineHeight: '18px',
                padding: '0 5px', textAlign: 'center',
              }}>{cartCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── tiny utility icons ────────────────────────────────────────
function RKIcon({ k, size = 18, color = 'currentColor', strokeWidth = 1.5 }) {
  const c = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search:   <><circle cx="11" cy="11" r="6" {...c}/><path d="M16 16l4 4" {...c}/></>,
    plus:     <path d="M12 5v14M5 12h14" {...c}/>,
    minus:    <path d="M5 12h14" {...c}/>,
    close:    <path d="M6 6l12 12M18 6L6 18" {...c}/>,
    chevron:  <path d="M9 6l6 6-6 6" {...c}/>,
    chev_d:   <path d="M6 9l6 6 6-6" {...c}/>,
    bag:      <><path d="M5 8h14l-1 12H6z" {...c}/><path d="M9 8a3 3 0 016 0" {...c}/></>,
    clock:    <><circle cx="12" cy="12" r="8" {...c}/><path d="M12 8v4l3 2" {...c}/></>,
    pin:      <><path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" {...c}/><circle cx="12" cy="9" r="2.5" {...c}/></>,
    heart:    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" {...c}/>,
    sparkle:  <><path d="M12 4v6M12 14v6M4 12h6M14 12h6" {...c}/></>,
    leaf:     <path d="M5 19c10 0 14-4 14-14C9 5 5 9 5 19zM5 19l8-8" {...c}/>,
    star:     <path d="M12 4l2.5 5 5.5.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-.8z" {...c}/>,
    check:    <path d="M5 12l4 4 10-10" {...c}/>,
    info:     <><circle cx="12" cy="12" r="8" {...c}/><path d="M12 11v5M12 8h.01" {...c}/></>,
    truck:    <><rect x="2" y="7" width="12" height="9" {...c}/><path d="M14 10h4l3 3v3h-7z" {...c}/><circle cx="6" cy="18" r="1.6" {...c}/><circle cx="17" cy="18" r="1.6" {...c}/></>,
    basket:   <><path d="M3 9h18l-2 11H5z" {...c}/><path d="M8 9l3-5M16 9l-3-5" {...c}/></>,
    receipt:  <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" {...c}/><path d="M9 8h6M9 12h6M9 16h4" {...c}/></>,
    user:     <><circle cx="12" cy="8" r="3.5" {...c}/><path d="M5 20a7 7 0 0114 0" {...c}/></>,
    filter:   <path d="M4 5h16M7 12h10M10 19h4" {...c}/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[k]}</svg>;
}

const fmtPrice = (n) => `$${n.toFixed(2)}`;

// ─── catalog ───────────────────────────────────────────────────
const ROCKY_CATALOG = {
  hero: {
    id: 'hero-figs', name: 'Black Mission Figs',
    subtitle: 'Sun-ripened · CA', price: 6.50, unit: 'pint',
    kind: 'grape', tint: { fill: '#3d1f2a', leaf: '#4a5436' },
    note: 'Honey-sweet, jam-ready. From a third-generation orchard in Fresno.',
  },
  collections: [
    { id: 'cellar',  name: 'The Cellar',    sub: 'Natural wines & aperitivi', kind: 'wine' },
    { id: 'pantry',  name: 'The Pantry',    sub: 'Olive oil, vinegar, salt',  kind: 'olive' },
    { id: 'bakery',  name: 'Bakery',        sub: 'Daily levain & viennoiserie', kind: 'bread' },
    { id: 'green',   name: 'The Greengrocer', sub: 'Picked this morning',     kind: 'leaf' },
    { id: 'dairy',   name: 'Dairy & Cheese', sub: 'Small-batch creameries',   kind: 'cheese' },
    { id: 'fish',    name: 'Fishmonger',    sub: 'Day-boat catch',            kind: 'fish' },
  ],
  picks: [
    { id: 'p1', name: 'Heirloom Tomatoes',   producer: 'Bellwether Farm',  price: 7.25, unit: 'lb', kind: 'tomato' },
    { id: 'p2', name: 'Country Sourdough',   producer: 'Tartine, daily',    price: 9.00, unit: 'loaf', kind: 'bread' },
    { id: 'p3', name: 'Castelvetrano Olives',producer: 'Sicily',             price: 8.50, unit: '8oz', kind: 'olive', sale: true, was: 11.00 },
    { id: 'p4', name: 'Comté, 18 mo.',       producer: 'Marcel Petite',     price: 14.00, unit: '¼ lb', kind: 'cheese' },
    { id: 'p5', name: 'Meyer Lemons',        producer: 'Frog Hollow',        price: 4.75, unit: 'lb', kind: 'lemon' },
    { id: 'p6', name: 'Bronze-Cut Bucatini', producer: 'Rustichella',        price: 6.00, unit: '500g', kind: 'pasta' },
    { id: 'p7', name: 'Whole Milk',          producer: 'Straus, glass btl.', price: 5.50, unit: 'qt', kind: 'milk' },
    { id: 'p8', name: 'Pinot Noir, 2022',    producer: 'Broc Cellars',       price: 28.00, unit: '750ml', kind: 'wine' },
  ],
};

Object.assign(window, { RKLogo, RKProduce, RKSeal, RKEyebrow, RKTabBar, RKIcon, fmtPrice, ROCKY_CATALOG });

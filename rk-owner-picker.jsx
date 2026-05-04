// rk-owner-picker.jsx — Shop Owner stock manager + Picker app screens.

// ───────────────────────────────────────────────
// SHOP OWNER — stock dashboard
// ───────────────────────────────────────────────
function RKOwner() {
  const [items, setItems] = React.useState([]);
  const [low, setLow] = React.useState([]);
  const [oos, setOos] = React.useState([]);
  const [tab, setTab] = React.useState('all'); // all | low | oos
  const [scanOpen, setScanOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setItems(await window.RKApi.listItems());
    setLow(await window.RKApi.lowStock());
    setOos(await window.RKApi.outOfStock());
  }, []);

  React.useEffect(() => {
    refresh();
    const off = window.RKApi.on('stock-changed', refresh);
    const off2 = window.RKApi.on('items-changed', refresh);
    return () => { off(); off2(); };
  }, [refresh]);

  const list = tab === 'low' ? low : tab === 'oos' ? oos : items;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="rk-eyebrow">Rocky&rsquo;s · Shopkeeper</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a8c5a' }}/>
            <span className="rk-eyebrow" style={{ color: 'var(--ink-3)' }}>Live</span>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 0.95, color: 'var(--ink)', marginTop: 10, fontWeight: 400 }}>
          The <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>shop</span>, today.
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          <StatCard label="In stock" value={items.length} accent="ink" />
          <StatCard label="Low" value={low.length} accent="gold" alert={low.length > 0} />
          <StatCard label="Out" value={oos.length} accent="persimmon" alert={oos.length > 0} />
        </div>

        {/* Low stock alert */}
        {low.length > 0 && (
          <div style={{ marginTop: 12, background: '#fff4d6', border: '1px solid var(--gold)',
            borderRadius: 'var(--r-md)', padding: '10px 12px', display: 'flex', gap: 10 }}>
            <RKIcon k="info" size={18} color="var(--gold)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, color: 'var(--ink)' }}>{low.length} item{low.length !== 1 ? 's' : ''} running low</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>
                {low.slice(0, 2).map(i => i.name).join(' · ')}{low.length > 2 ? ` · +${low.length - 2} more` : ''}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16, borderBottom: '1px solid var(--paper-3)' }}>
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'low', label: `Low (${low.length})` },
            { id: 'oos', label: `Out (${oos.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: 'transparent', border: 'none', padding: '8px 4px',
                fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.06em',
                textTransform: 'uppercase', cursor: 'pointer',
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: tab === t.id ? 600 : 500,
                borderBottom: '2px solid ' + (tab === t.id ? 'var(--ink)' : 'transparent'),
                marginBottom: -1,
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 90px' }}>
        {list.map(it => (
          <StockRow key={it.id} item={it}
            onPlus={() => window.RKApi.updateStock(it.id, +1)}
            onMinus={() => window.RKApi.updateStock(it.id, -1)}/>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>
            Nothing here. Tidy shop.
          </div>
        )}
      </div>

      {/* Scan FAB */}
      <button onClick={() => setScanOpen(true)}
        style={{
          position: 'absolute', right: 18, bottom: 30, zIndex: 5,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--persimmon)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff8ec', boxShadow: '0 6px 20px rgba(196,84,29,0.4)',
          cursor: 'pointer',
        }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2M21 7V5a2 2 0 00-2-2h-2M21 17v2a2 2 0 01-2 2h-2"/>
          <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
        </svg>
      </button>

      {scanOpen && <ScanModal onClose={() => setScanOpen(false)} onAdded={refresh} />}
    </div>
  );
}

function StatCard({ label, value, accent, alert }) {
  const accentColor = accent === 'gold' ? 'var(--gold)' : accent === 'persimmon' ? 'var(--persimmon)' : 'var(--ink)';
  return (
    <div style={{
      background: 'var(--paper-2)',
      borderRadius: 'var(--r-md)', padding: '10px 12px',
      borderLeft: alert ? `3px solid ${accentColor}` : '3px solid transparent',
    }}>
      <div className="rk-eyebrow" style={{ color: accentColor }}>{label}</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--ink)', lineHeight: 1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function StockRow({ item, onPlus, onMinus }) {
  const status = item.stock <= 0 ? 'out' : item.stock <= item.lowAt ? 'low' : 'ok';
  const statusColor = status === 'out' ? 'var(--persimmon)' : status === 'low' ? 'var(--gold)' : 'var(--olive)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--paper-3)' }}>
      <div style={{ width: 56, height: 56, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {item.image
          ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} onError={(e) => { e.target.style.display = 'none'; }}/>
          : <RKIcon k="basket" size={20} color="var(--ink-3)"/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>{item.size}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: statusColor, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{status === 'out' ? 'Out' : status === 'low' ? 'Low' : 'Stocked'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--paper-2)', borderRadius: 999, padding: 3 }}>
        <button onClick={onMinus} style={{ width: 26, height: 26, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <RKIcon k="minus" size={12} color="var(--ink)"/>
        </button>
        <span style={{ fontFamily: 'var(--display)', fontSize: 15, minWidth: 22, textAlign: 'center', color: status === 'out' ? 'var(--persimmon)' : 'var(--ink)' }}>{item.stock}</span>
        <button onClick={onPlus} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ink)', border: 'none', cursor: 'pointer' }}>
          <RKIcon k="plus" size={12} color="var(--paper)" strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

// Barcode scan modal — paste/type, hit OFF, fetch image + name, AI categorize
function ScanModal({ onClose, onAdded }) {
  const [barcode, setBarcode] = React.useState('');
  const [step, setStep] = React.useState('scan'); // scan | found | adding | done
  const [product, setProduct] = React.useState(null);
  const [aisleSuggestion, setAisleSuggestion] = React.useState(null);
  const [stockQty, setStockQty] = React.useState(12);
  const [price, setPrice] = React.useState('');
  const [variation, setVariation] = React.useState('');
  const [err, setErr] = React.useState(null);

  const lookup = async (bc) => {
    setStep('adding'); setErr(null);
    const p = await window.RKApi.lookupBarcode(bc || barcode);
    if (!p) { setErr('Not found in Open Food Facts. Add manually.'); setStep('scan'); return; }
    setProduct(p);
    // ask LLM for aisle
    const a = await window.RKApi.categorizeNew({ name: p.name, brand: p.brand, categories: p.categories });
    setAisleSuggestion(a);
    setStep('found');
  };

  const save = async () => {
    setStep('adding');
    await window.RKApi.addItem({
      barcode: product.barcode,
      name: product.name + (variation ? ` (${variation})` : ''),
      size: product.size || '—',
      price: parseFloat(price) || 0,
      stock: stockQty,
      lowAt: Math.max(4, Math.floor(stockQty / 4)),
      aisle: aisleSuggestion?.aisle || 'pantry',
      image: product.image,
    });
    setStep('done');
    onAdded?.();
    setTimeout(onClose, 900);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: 'var(--paper)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '14px 22px 26px', maxHeight: '85%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--paper-3)', borderRadius: 2, margin: '0 auto 14px' }}/>

        {step === 'scan' && (
          <>
            <div className="rk-eyebrow">Add new item</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--ink)', lineHeight: 0.95, marginTop: 4, fontWeight: 400 }}>Scan a <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>barcode.</span></div>
            <div style={{ marginTop: 16, background: 'var(--ink)', borderRadius: 'var(--r-md)', padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 100 }}>
              <svg width="160" height="50" viewBox="0 0 160 50">
                {Array.from({length: 30}).map((_, i) => (
                  <rect key={i} x={i*5+4} y="6" width={2 + (i % 3)} height="38" fill="#f4efe6"/>
                ))}
              </svg>
              <div style={{ position: 'absolute', left: 14, right: 14, top: '50%', height: 2, background: 'var(--persimmon)', boxShadow: '0 0 12px var(--persimmon)' }}/>
            </div>
            <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="…or type a barcode (e.g. 5449000000996)"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 12, padding: '12px 14px', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--sans)', fontSize: 14, background: 'var(--paper-2)', color: 'var(--ink)' }}/>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {['5449000000996','3017620422003','7622210449283','5000159484695'].map(b => (
                <button key={b} onClick={() => { setBarcode(b); lookup(b); }} style={{ background: 'var(--paper-2)', border: 'none', borderRadius: 999, padding: '5px 10px', fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer' }}>{b}</button>
              ))}
            </div>
            {err && <div style={{ marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--persimmon)' }}>{err}</div>}
            <button onClick={() => lookup()} disabled={!barcode}
              style={{ width: '100%', marginTop: 14, background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 999, padding: 14, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: barcode ? 1 : 0.4 }}>
              Look up
            </button>
          </>
        )}

        {step === 'adding' && (
          <div style={{ padding: 30, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>
            Looking up…
          </div>
        )}

        {step === 'found' && product && (
          <>
            <div className="rk-eyebrow rk-eyebrow-olive">Found · Open Food Facts</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
              <div style={{ width: 70, height: 70, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {product.image ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}/> : <RKIcon k="basket" size={26} color="var(--ink-3)"/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.1 }}>{product.name}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>{product.brand} · {product.size || '—'}</div>
              </div>
            </div>

            {aisleSuggestion && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <RKIcon k="sparkle" size={18} color="var(--olive)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Auto-shelved</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)', textTransform: 'capitalize' }}>{aisleSuggestion.aisle} aisle</div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>{aisleSuggestion.reason}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <Field label="Quantity">
                <input type="number" value={stockQty} onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--display)', fontSize: 18, background: 'var(--paper)', color: 'var(--ink)' }}/>
              </Field>
              <Field label="Price ($)">
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--display)', fontSize: 18, background: 'var(--paper)', color: 'var(--ink)' }}/>
              </Field>
            </div>
            <Field label="Variation note (optional)">
              <input value={variation} onChange={(e) => setVariation(e.target.value)} placeholder="e.g. multipack, glass bottle"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--sans)', fontSize: 13, background: 'var(--paper)', color: 'var(--ink)' }}/>
            </Field>

            <button onClick={save} disabled={!price}
              style={{ width: '100%', marginTop: 14, background: 'var(--persimmon)', color: '#fff8ec', border: 'none', borderRadius: 999, padding: 14, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: price ? 1 : 0.4 }}>
              Add {stockQty} to shelf
            </button>
          </>
        )}

        {step === 'done' && (
          <div style={{ padding: 30, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--olive)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RKIcon k="check" size={26} color="#fff8ec" strokeWidth={2.5}/>
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink)', marginTop: 14 }}>Added to the shelf.</div>
          </div>
        )}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginTop: 10 }}>
      <div className="rk-eyebrow">{label}</div>
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}

// ───────────────────────────────────────────────
// PICKER — AI-organized shopping list, aisle by aisle
// ───────────────────────────────────────────────
function RKPicker() {
  const [groups, setGroups] = React.useState([]);
  const [done, setDone] = React.useState({}); // id -> bool
  const [oosId, setOosId] = React.useState(null);
  const [sub, setSub] = React.useState(null);

  const orderItems = [
    { id: 'sku-001', qty: 6 },
    { id: 'sku-006', qty: 1 }, // out of stock — Penne, low
    { id: 'sku-013', qty: 2 }, // out of stock — Fanta
    { id: 'sku-008', qty: 1 },
    { id: 'sku-016', qty: 1 },
    { id: 'sku-018', qty: 1 },
    { id: 'sku-014', qty: 1 },
    { id: 'sku-011', qty: 2 },
  ];

  React.useEffect(() => {
    (async () => {
      const g = await window.RKApi.organizePickerList(orderItems);
      setGroups(g);
    })();
  }, []);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  const handleOOS = async (item) => {
    setOosId(item.id);
    setSub(null);
    const s = await window.RKApi.suggestSubstitution(item.id);
    setSub(s);
  };
  const acceptSub = async () => {
    setOosId(null);
    setSub(null);
    // mark done in real implementation
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="rk-eyebrow">Order #R-04821 · Pick</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--persimmon)', animation: 'rk-pulse 1.5s ease-in-out infinite' }}/>
            <span className="rk-eyebrow rk-eyebrow-persimmon">14:32</span>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 28, lineHeight: 0.95, color: 'var(--ink)', marginTop: 8, fontWeight: 400 }}>
          Walk the <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>shop.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1, height: 4, background: 'var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: total ? `${doneCount/total*100}%` : 0, background: 'var(--olive)', transition: 'width 0.3s' }}/>
          </div>
          <span style={{ fontFamily: 'var(--display)', fontSize: 14, color: 'var(--ink)' }}>{doneCount}/{total}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px 30px' }}>
        {groups.map((g, gi) => (
          <div key={g.aisle.id} style={{ marginTop: gi === 0 ? 0 : 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 13 }}>{g.aisle.order}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink)', flex: 1 }}>{g.aisle.name}</div>
              <span className="rk-eyebrow">{g.items.length} item{g.items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="rk-rule-thin"/>
            {g.items.map((it, i) => (
              <PickerRow key={it.id + i} order={it} done={!!done[it.id]}
                onDone={() => setDone(d => ({ ...d, [it.id]: true }))}
                onOOS={() => handleOOS(it)}/>
            ))}
          </div>
        ))}
      </div>

      {/* Substitution sheet */}
      {oosId && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => { setOosId(null); setSub(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: 'var(--paper)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '14px 22px 26px' }}>
            <div style={{ width: 40, height: 4, background: 'var(--paper-3)', borderRadius: 2, margin: '0 auto 14px' }}/>
            <div className="rk-eyebrow rk-eyebrow-persimmon">Out of stock</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink)', marginTop: 4, fontWeight: 400 }}>
              Suggest a <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>swap?</span>
            </div>
            {!sub ? (
              <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>Thinking…</div>
            ) : (
              <SubstitutionSuggestion suggestion={sub} onAccept={acceptSub} onReject={() => { setOosId(null); setSub(null); }}/>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes rk-pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
    </div>
  );
}

function PickerRow({ order, done, onDone, onOOS }) {
  const [item, setItem] = React.useState(null);
  React.useEffect(() => { window.RKApi.getItem(order.id).then(setItem); }, [order.id]);
  if (!item) return null;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--paper-3)', opacity: done ? 0.4 : 1 }}>
      <button onClick={onDone} style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        border: '1.5px solid ' + (done ? 'var(--olive)' : 'var(--paper-3)'),
        background: done ? 'var(--olive)' : 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done && <RKIcon k="check" size={14} color="#fff8ec" strokeWidth={2.5}/>}
      </button>
      <div style={{ width: 50, height: 50, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {item.image
          ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', textDecoration: done ? 'line-through' : 'none' }}/>
          : <RKIcon k="basket" size={20} color="var(--ink-3)"/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.15, textDecoration: done ? 'line-through' : 'none' }}>{item.name}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>{item.size}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink)' }}>×{order.qty}</div>
        {item.stock <= 0 && (
          <button onClick={onOOS} style={{ background: 'var(--persimmon)', color: '#fff8ec', border: 'none', borderRadius: 999, padding: '4px 10px', fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Out · Sub</button>
        )}
        {item.stock > 0 && item.stock <= item.lowAt && (
          <span className="rk-eyebrow" style={{ color: 'var(--gold)' }}>only {item.stock} left</span>
        )}
      </div>
    </div>
  );
}

function SubstitutionSuggestion({ suggestion, onAccept, onReject }) {
  const [item, setItem] = React.useState(null);
  React.useEffect(() => { window.RKApi.getItem(suggestion.id).then(setItem); }, [suggestion.id]);
  if (!item) return null;
  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginTop: 14, padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', alignItems: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--paper)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}/> : <RKIcon k="basket" size={24} color="var(--ink-3)"/>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 17, color: 'var(--ink)' }}>{item.name}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>{item.size} · ${item.price.toFixed(2)}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--olive)', marginTop: 4 }}>&ldquo;{suggestion.reason}&rdquo;</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onReject} style={{ flex: 1, background: 'var(--paper-2)', border: 'none', borderRadius: 999, padding: 14, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>Skip item</button>
        <button onClick={onAccept} style={{ flex: 2, background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 999, padding: 14, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Ask customer to swap</button>
      </div>
    </>
  );
}

Object.assign(window, { RKOwner, RKPicker });

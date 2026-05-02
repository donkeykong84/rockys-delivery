// rk-screens.jsx — Product detail, Cart, Checkout, Order tracking.

// ───────────────────────────────────────────────
// PRODUCT DETAIL
// ───────────────────────────────────────────────
function RKProduct({ item, onBack, onAdd, qty = 1, onQty }) {
  const it = item || ROCKY_CATALOG.picks[2];
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 0' }}>
        <button onClick={onBack} style={{ background: 'var(--paper-2)', border: 'none', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <RKIcon k="chevron" size={16} color="var(--ink)" />
          <span style={{ display: 'none' }}>back</span>
        </button>
        <div className="rk-eyebrow">No. 0{(it.id || '3').toString().slice(-1)}</div>
        <button style={{ background: 'var(--paper-2)', border: 'none', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RKIcon k="heart" size={16} color="var(--ink)" />
        </button>
      </div>

      {/* hero illustration on paper */}
      <div style={{ padding: '20px 22px 0', textAlign: 'center', position: 'relative' }}>
        <div className="rk-eyebrow rk-eyebrow-olive">{it.sale ? 'On Sale · This week only' : 'In season'}</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 38, lineHeight: 0.95, color: 'var(--ink)', marginTop: 6, fontWeight: 400, letterSpacing: '-0.01em' }}>
          {it.name.split(' ').slice(0,-1).join(' ')}<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>{it.name.split(' ').slice(-1)}.</span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>
          from <u>{it.producer}</u>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', position: 'relative' }}>
          <RKProduce kind={it.kind} size={210} />
          <div style={{ position: 'absolute', right: 12, top: 0 }}>
            <RKSeal price={it.price} sale={it.sale} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 22px' }}>
        <div className="rk-rule" />
      </div>

      {/* notes — like a tasting card */}
      <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { l: 'Origin',   v: 'Sicily' },
          { l: 'Weight',   v: it.unit },
          { l: 'Storage',  v: 'Cool, dry' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
            <div className="rk-eyebrow">{s.l}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)', marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <RKEyebrow>Tasting Note</RKEyebrow>
        <p className="rk-dropcap" style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', marginTop: 8 }}>
          Buttery, mild, and the bright green of a perfect August leaf. We brine ours in the back, twice a week. Best with cold martinis, salted almonds, or simply a hunk of bread.
        </p>
      </div>

      <div style={{ padding: '12px 22px 0' }}>
        <RKEyebrow>Pairs With</RKEyebrow>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto' }}>
          {ROCKY_CATALOG.picks.slice(0, 3).filter(p => p.id !== it.id).map(p => (
            <div key={p.id} style={{ flexShrink: 0, width: 120, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 10 }}>
              <RKProduce kind={p.kind} size={70} />
              <div style={{ fontFamily: 'var(--display)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.1, marginTop: 4 }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 13, color: 'var(--olive)', marginTop: 2 }}>{fmtPrice(p.price)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 110 }} />

      {/* sticky add bar */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--paper)',
        borderTop: '1px solid var(--paper-3)',
        padding: '14px 18px 22px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--paper-2)', borderRadius: 999, padding: 4 }}>
          <button onClick={() => onQty?.(Math.max(1, qty - 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <RKIcon k="minus" size={16} color="var(--ink)" />
          </button>
          <span style={{ fontFamily: 'var(--display)', fontSize: 18, minWidth: 16, textAlign: 'center' }}>{qty}</span>
          <button onClick={() => onQty?.(qty + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', border: 'none', cursor: 'pointer' }}>
            <RKIcon k="plus" size={16} color="var(--paper)" strokeWidth={2}/>
          </button>
        </div>
        <button onClick={() => onAdd?.(it, qty)}
          style={{
            flex: 1, background: 'var(--persimmon)', color: '#fff8ec', border: 'none',
            borderRadius: 999, padding: '14px 18px',
            fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          Add to basket <span style={{ opacity: 0.6 }}>·</span> {fmtPrice(it.price * qty)}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// CART
// ───────────────────────────────────────────────
function RKCart({ lines = [], onQty, onRemove, onCheckout, onBack }) {
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const delivery = subtotal > 35 ? 0 : 4.95;
  const total = subtotal + delivery;
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '60px 22px 0' }}>
        <div className="rk-eyebrow">Your basket · {lines.length} item{lines.length !== 1 ? 's' : ''}</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 44, color: 'var(--ink)', lineHeight: 0.95, marginTop: 6, fontWeight: 400 }}>
          The <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>basket</span>.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--sans)' }}>
          <RKIcon k="clock" size={13} color="var(--olive)" />
          <span>Delivers <b style={{ color: 'var(--ink)' }}>today, 4–5 pm</b></span>
          <span style={{ color: 'var(--ink-4)' }}>· change</span>
        </div>
        <div className="rk-rule" style={{ marginTop: 16 }} />
      </div>

      <div style={{ padding: '6px 22px', flex: 1 }}>
        {lines.map((l, i) => (
          <div key={l.item.id}>
            <div style={{ display: 'flex', gap: 12, padding: '14px 0', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RKProduce kind={l.item.kind} size={56} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.1 }}>{l.item.name}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{l.item.producer || 'Rocky\u2019s'}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-4)', marginTop: 4, letterSpacing: '0.03em' }}>{fmtPrice(l.item.price)} / {l.item.unit}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)' }}>{fmtPrice(l.item.price * l.qty)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--paper-2)', borderRadius: 999, padding: 2 }}>
                  <button onClick={() => l.qty <= 1 ? onRemove?.(l.item.id) : onQty?.(l.item.id, l.qty - 1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <RKIcon k={l.qty <= 1 ? 'close' : 'minus'} size={12} color="var(--ink)" />
                  </button>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 13, minWidth: 14, textAlign: 'center' }}>{l.qty}</span>
                  <button onClick={() => onQty?.(l.item.id, l.qty + 1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)', border: 'none', cursor: 'pointer' }}>
                    <RKIcon k="plus" size={12} color="var(--paper)" strokeWidth={2}/>
                  </button>
                </div>
              </div>
            </div>
            {i < lines.length - 1 && <div className="rk-rule-hair" />}
          </div>
        ))}

        {/* Substitution note — invisible AI in plain language */}
        <div style={{ marginTop: 18, padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'flex', gap: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <RKIcon k="leaf" size={20} color="var(--olive)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)' }}>If something&rsquo;s sold out</div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              We&rsquo;ll suggest the closest swap and ask before charging.
            </div>
          </div>
          <RKIcon k="chevron" size={14} color="var(--ink-3)" />
        </div>

        <div style={{ marginTop: 18, padding: '12px 0' }}>
          <RKLine label="Subtotal" value={fmtPrice(subtotal)} />
          <RKLine label="Delivery" value={delivery === 0 ? <span style={{ color: 'var(--olive)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>Free over $35</span> : fmtPrice(delivery)} />
          <RKLine label="Tax" value={fmtPrice(subtotal * 0.08)} />
          <div className="rk-rule-thin" style={{ margin: '10px 0' }}/>
          <RKLine label="Total" value={fmtPrice(total + subtotal * 0.08)} big />
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--paper)', borderTop: '1px solid var(--paper-3)', padding: '14px 18px 22px' }}>
        <button onClick={onCheckout}
          style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 999, padding: '16px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ paddingLeft: 4 }}>Proceed to checkout</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {fmtPrice(total + subtotal * 0.08)} <RKIcon k="chevron" size={14} color="var(--paper)" strokeWidth={2}/>
          </span>
        </button>
      </div>
    </div>
  );
}
function RKLine({ label, value, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0' }}>
      <span style={{ fontFamily: 'var(--sans)', fontSize: big ? 13 : 12, color: big ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: big ? '0.06em' : '0.04em', textTransform: big ? 'uppercase' : 'none', fontWeight: big ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: 'var(--display)', fontSize: big ? 22 : 14, color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

// ───────────────────────────────────────────────
// CHECKOUT
// ───────────────────────────────────────────────
function RKCheckout({ total = 47.85, onPlace, onBack, addresses = [], selectedAddressId, onSelectAddress, onAddAddress, note, onNote }) {
  const [picking, setPicking] = React.useState(false);
  const [adding, setAdding]   = React.useState(false);
  const [draft, setDraft] = React.useState({ label: 'Home', line1: '', line2: '', city: '', postcode: '', note: '' });
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const sel = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const saveNew = () => {
    if (!draft.line1 || !draft.city || !draft.postcode) return alert('Address line, city and postcode are required.');
    const a = onAddAddress && onAddAddress(draft);
    setAdding(false);
    setDraft({ label: 'Home', line1: '', line2: '', city: '', postcode: '', note: '' });
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'var(--paper-2)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RKIcon k="chevron" size={14} color="var(--ink)" />
          </button>
          <div className="rk-eyebrow">Step 02 / 03</div>
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 40, color: 'var(--ink)', lineHeight: 0.95, marginTop: 14, fontWeight: 400 }}>
          Almost <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>delivered.</span>
        </div>
        <div className="rk-rule" style={{ marginTop: 14 }} />
      </div>

      <div style={{ padding: '14px 22px', flex: 1 }}>
        {/* address */}
        <RKSection eyebrow="01 · Delivery address">
          {sel && !picking && !adding && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 17, color: 'var(--ink)' }}>{sel.label} — {sel.line1}{sel.line2 ? ', ' + sel.line2 : ''}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>{sel.city} {sel.postcode}{sel.note ? ' · ' + sel.note : ''}</div>
              </div>
              <span onClick={() => setPicking(true)} className="rk-eyebrow" style={{ color: 'var(--persimmon)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Change</span>
            </div>
          )}
          {!sel && !adding && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 13 }}>No saved address yet.</div>
              <span onClick={() => setAdding(true)} className="rk-eyebrow" style={{ color: 'var(--persimmon)', cursor: 'pointer' }}>+ Add</span>
            </div>
          )}
          {picking && !adding && (
            <div>
              {addresses.map(a => (
                <div key={a.id} onClick={() => { onSelectAddress && onSelectAddress(a.id); setPicking(false); }}
                  style={{ padding: 12, borderRadius: 8, border: '1px solid ' + (a.id === selectedAddressId ? 'var(--ink)' : 'var(--paper-3)'), marginBottom: 8, cursor: 'pointer', background: a.id === selectedAddressId ? 'var(--paper-2)' : 'var(--paper)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 15 }}>{a.label}</div>
                    {a.id === selectedAddressId && <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--olive)', textTransform: 'uppercase' }}>✓ Selected</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.line1}{a.line2 ? ', ' + a.line2 : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{a.city} {a.postcode}</div>
                </div>
              ))}
              <button onClick={() => { setAdding(true); setPicking(false); }} style={{ width: '100%', padding: 12, background: 'var(--paper-2)', border: '1px dashed var(--paper-3)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>+ Add new address</button>
              <button onClick={() => setPicking(false)} style={{ width: '100%', marginTop: 6, padding: 8, background: 'transparent', border: 'none', fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer' }}>cancel</button>
            </div>
          )}
          {adding && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input style={ckInput} placeholder="Label (Home, Office...)" value={draft.label} onChange={e => setD('label', e.target.value)}/>
              <input style={ckInput} placeholder="Address line 1*" value={draft.line1} onChange={e => setD('line1', e.target.value)}/>
              <input style={ckInput} placeholder="Address line 2" value={draft.line2} onChange={e => setD('line2', e.target.value)}/>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...ckInput, flex: 2 }} placeholder="City*" value={draft.city} onChange={e => setD('city', e.target.value)}/>
                <input style={{ ...ckInput, flex: 1 }} placeholder="Postcode*" value={draft.postcode} onChange={e => setD('postcode', e.target.value)}/>
              </div>
              <input style={ckInput} placeholder="Delivery note (e.g. buzzer 4F)" value={draft.note} onChange={e => setD('note', e.target.value)}/>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setAdding(false); setPicking(addresses.length > 0); }} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid var(--paper-3)', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Cancel</button>
                <button onClick={saveNew} style={{ flex: 2, padding: 10, background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Save address</button>
              </div>
            </div>
          )}
        </RKSection>

        {/* delivery window */}
        <RKSection eyebrow="02 · Delivery Window">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { t: 'Today', s: '4–5 pm', tag: 'Earliest', on: true },
              { t: 'Today', s: '6–7 pm', tag: '+ $1.95' },
              { t: 'Tomorrow', s: '8–9 am', tag: 'Free' },
              { t: 'Tomorrow', s: '10–11 am', tag: 'Free' },
            ].map((w, i) => (
              <div key={i} style={{
                padding: 10,
                background: w.on ? 'var(--ink)' : 'var(--paper)',
                color: w.on ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid ' + (w.on ? 'var(--ink)' : 'var(--paper-3)'),
                borderRadius: 'var(--r-sm)',
              }}>
                <div className="rk-eyebrow" style={{ color: w.on ? 'rgba(244,239,230,0.7)' : 'var(--ink-3)' }}>{w.t}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, marginTop: 2 }}>{w.s}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: w.on ? '#d9b13a' : 'var(--olive)', marginTop: 2 }}>{w.tag}</div>
              </div>
            ))}
          </div>
        </RKSection>

        {/* payment */}
        <RKSection eyebrow="03 · Payment">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 30, borderRadius: 4, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', fontFamily: 'var(--display)', fontSize: 11, letterSpacing: '0.1em' }}>
              VISA
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)' }}>•••• 4823</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>Default</div>
            </div>
            <RKIcon k="chevron" size={14} color="var(--ink-3)"/>
          </div>
        </RKSection>

        {/* picker note */}
        <RKSection eyebrow="04 · Note for the shopkeeper">
          <textarea value={note || ''} onChange={e => onNote && onNote(e.target.value)}
            placeholder="e.g. Please pick the figs the riper end — thank you!"
            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 14, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.4, border: '1px solid var(--paper-3)', resize: 'vertical', minHeight: 50 }}/>
        </RKSection>
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--paper)', borderTop: '1px solid var(--paper-3)', padding: '14px 18px 22px' }}>
        <button onClick={onPlace} disabled={!sel}
          style={{ width: '100%', background: sel ? 'var(--persimmon)' : 'var(--paper-3)', color: sel ? '#fff8ec' : 'var(--ink-3)', border: 'none', borderRadius: 999, padding: '16px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em', cursor: sel ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ paddingLeft: 4 }}>{sel ? 'Place order' : 'Add an address to continue'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{fmtPrice(total)} <RKIcon k="chevron" size={14} color="var(--paper)" strokeWidth={2}/></span>
        </button>
      </div>
    </div>
  );
}
const ckInput = { padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13, background: 'var(--paper)', boxSizing: 'border-box', width: '100%' };
function RKSection({ eyebrow, children }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <RKEyebrow>{eyebrow}</RKEyebrow>
      <div style={{ marginTop: 8, padding: '14px 0', borderTop: '1px solid var(--paper-3)', borderBottom: '1px solid var(--paper-3)' }}>
        {children}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// ORDER TRACKING — 3 roles invisible (no AI/picker/driver as personae)
// Surfaces as a single live timeline
// ───────────────────────────────────────────────
function RKTrack({ stage = 1, onBack, onContact }) {
  // 0 received · 1 picking · 2 with rider · 3 delivered
  const steps = [
    { key: 0, eyebrow: 'Received', title: 'Order placed',
      detail: 'Your order is at the shop.', time: '3:42 pm' },
    { key: 1, eyebrow: 'In the aisles', title: 'Being picked',
      detail: 'Your basket is being put together by hand.', time: '3:48 pm' },
    { key: 2, eyebrow: 'On the way', title: 'Out for delivery',
      detail: 'Leaving the shop now &mdash; ETA 12 minutes.', time: '4:14 pm' },
    { key: 3, eyebrow: 'Arrived', title: 'Delivered',
      detail: 'Left at your door, as requested.', time: '4:26 pm' },
  ];
  const cur = steps[stage];
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="rk-eyebrow">Order #R-04821</div>
          <button onClick={onContact} className="rk-eyebrow" style={{ color: 'var(--persimmon)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Contact shop</button>
        </div>

        <div style={{ fontFamily: 'var(--display)', fontSize: 38, color: 'var(--ink)', lineHeight: 0.95, marginTop: 12, fontWeight: 400 }}>
          {stage < 2 ? 'Coming together,' : stage < 3 ? 'On the way,' : 'Delivered,'}<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>
            {stage < 2 ? 'beautifully.' : stage < 3 ? 'on time.' : 'with care.'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
          Estimated arrival between <b style={{ color: 'var(--ink)', fontStyle: 'normal' }}>4:20 – 4:35 pm</b>
        </div>
      </div>

      {/* live "scene" hero — stage-aware vignette, no roles named */}
      <div style={{ margin: '20px 22px 0', borderRadius: 'var(--r-lg)', background: '#2a2419', overflow: 'hidden', position: 'relative', minHeight: 180 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(196,84,29,0.18), transparent 60%)' }}/>
        <div style={{ position: 'relative', padding: 18, color: '#f4efe6' }}>
          <div className="rk-eyebrow" style={{ color: '#d9b13a' }}>Now</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26, marginTop: 4, lineHeight: 1.05 }}>{cur.title}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: '#c9bfa8', marginTop: 6, maxWidth: 220 }}
               dangerouslySetInnerHTML={{ __html: cur.detail }} />
          {/* progress band */}
          <div style={{ display: 'flex', gap: 4, marginTop: 18 }}>
            {[0,1,2,3].map(s => (
              <div key={s} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: s <= stage ? '#d9b13a' : 'rgba(244,239,230,0.18)',
                position: 'relative', overflow: 'hidden',
              }}>
                {s === stage && stage < 3 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    animation: 'rk-shimmer 1.6s linear infinite',
                  }}/>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* moving dot map for stage 2 */}
        {stage === 2 && (
          <svg width="100%" height="80" viewBox="0 0 320 80" style={{ display: 'block' }}>
            <path d="M20 60 Q90 30, 160 50 T 300 30" stroke="rgba(244,239,230,0.18)" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
            <circle cx="20" cy="60" r="5" fill="#d9b13a"/>
            <circle cx="300" cy="30" r="5" fill="#c4541d"/>
            <g style={{ transform: 'translate(180px, 42px)' }}>
              <circle r="7" fill="#f4efe6"/>
              <circle r="4" fill="#c4541d"/>
            </g>
          </svg>
        )}
      </div>

      {/* timeline */}
      <div style={{ padding: '24px 22px 0' }}>
        <RKEyebrow>Timeline</RKEyebrow>
        <div style={{ marginTop: 12 }}>
          {steps.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div key={s.key} style={{ display: 'flex', gap: 14, paddingBottom: i === steps.length - 1 ? 0 : 18, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: done ? 'var(--olive)' : active ? 'var(--persimmon)' : 'var(--paper)',
                    border: '1.5px solid ' + (done || active ? 'transparent' : 'var(--paper-3)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <RKIcon k="check" size={12} color="#fff8ec" strokeWidth={2.5} />}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff8ec' }}/>}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, width: 1.5, background: i < stage ? 'var(--olive)' : 'var(--paper-3)', minHeight: 30, marginTop: 2 }}/>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <RKEyebrow accent={active ? 'persimmon' : 'olive'} style={{ opacity: done || active ? 1 : 0.5 }}>{s.eyebrow}</RKEyebrow>
                    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)' }}>
                      {done || active ? s.time : '—'}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--display)', fontSize: 17, marginTop: 2,
                    color: done || active ? 'var(--ink)' : 'var(--ink-4)',
                  }}>{s.title}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12,
                    color: done || active ? 'var(--ink-3)' : 'var(--ink-4)', marginTop: 2 }}
                    dangerouslySetInnerHTML={{ __html: s.detail }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* basket summary */}
      <div style={{ padding: '24px 22px 28px' }}>
        <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <RKEyebrow>Basket · 6 items</RKEyebrow>
            <span style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)' }}>$47.85</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['grape','olive','cheese','bread','milk','wine'].map(k => (
              <div key={k} style={{ width: 38, height: 38, background: 'var(--paper)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RKProduce kind={k} size={32}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes rk-shimmer { from { transform: translateX(-100%) } to { transform: translateX(100%) } }`}</style>
    </div>
  );
}

Object.assign(window, { RKProduct, RKCart, RKCheckout, RKTrack });

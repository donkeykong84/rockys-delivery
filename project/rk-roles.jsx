// rk-roles.jsx — new richer Picker, Stock Handler, Driver UIs.
// All three include the staff ChatBubble (customer excluded).

// ════════════════════════════════════════════════════════════
// PICKER — illustrated menu, skip/cancel/restart, damage report, undo
// ════════════════════════════════════════════════════════════
function PickerApp({ order, onPicked, onAdvance, onCancel, onRestart, pushLog }) {
  const [groups, setGroups] = React.useState([]);
  const [subs, setSubs] = React.useState({});
  const [thinking, setThinking] = React.useState(null);
  const [skipped, setSkipped] = React.useState({});
  const [damageFor, setDamageFor] = React.useState(null);
  const [history, setHistory] = React.useState([]); // {kind,lineId,prev}
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const flat = order.lines.map(l => ({ id: l.item.id, qty: l.qty }));
      const g = await window.STOCK_API.organizePickerList(flat);
      setGroups(g);
    })();
  }, [order.id]);

  const total = order.lines.length;
  const doneCount = order.lines.filter(l => order.picked[l.item.id]).length;
  const skippedCount = Object.values(skipped).filter(Boolean).length;

  const togglePicked = (lineId) => {
    const prev = !!order.picked[lineId];
    onPicked(lineId, !prev);
    setHistory(h => [...h, { kind: 'pick', lineId, prev }]);
  };
  const skip = (lineId) => {
    setSkipped(s => ({ ...s, [lineId]: true }));
    setHistory(h => [...h, { kind: 'skip', lineId, prev: false }]);
    pushLog?.(`Picker skipped line for later`, 'warn');
  };
  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    if (last.kind === 'pick') onPicked(last.lineId, last.prev);
    if (last.kind === 'skip') setSkipped(s => ({ ...s, [last.lineId]: false }));
    if (last.kind === 'sub')  setSubs(s => { const n = { ...s }; delete n[last.lineId]; return n; });
    setHistory(h => h.slice(0, -1));
    pushLog?.('Picker: undo', 'ok');
  };

  const markOOS = async (line) => {
    setThinking(line.id);
    pushLog?.(`OOS: ${line.item.name} — asking brain`, 'warn');
    const all = await window.STOCK_API.list();
    const cands = all.filter(x => x.aisle === line.item.aisle && x.id !== line.id && x.qty > 0).slice(0, 6);
    const sub = await window.BRAIN.suggestSubstitute(line.item, cands).catch(() => null);
    const fallback = sub || { id: cands[0]?.id, reason: 'closest in same aisle' };
    setSubs(s => ({ ...s, [line.id]: fallback }));
    setHistory(h => [...h, { kind: 'sub', lineId: line.id }]);
    pushLog?.(`Sub: ${fallback.id} — ${fallback.reason}`, 'ok');
    setThinking(null);
  };

  const reportDamage = (qty, note) => {
    if (!damageFor) return;
    window.STOCK_API.adjust(damageFor.item.id, -qty, 'damage: ' + note);
    pushLog?.(`Damage reported: ${damageFor.item.name} ×${qty} — "${note}"`, 'warn');
    if (window.STAFF_CHAT) window.STAFF_CHAT.send('picker', 'Theo (Picker)', `⚠ Damage on ${damageFor.item.name} ×${qty}: ${note}`);
    setDamageFor(null);
  };

  const allDone = doneCount + skippedCount === total;

  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Geist', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '54px 16px 12px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d9b13a' }}>Picking · #{order.id}</div>
            <div style={{ fontFamily: 'DM Serif Display', fontSize: 26, marginTop: 2 }}>{doneCount}<span style={{ opacity: 0.5 }}>/{total}</span></div>
          </div>
          <button onClick={() => setMenuOpen(true)}
            style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(244,239,230,0.1)', border: 'none', color: 'var(--paper)', fontSize: 22, cursor: 'pointer' }}>☰</button>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
          {groups.map((g, i) => {
            const gd = g.lines.filter(l => order.picked[l.id]).length;
            return <div key={i} style={{ flex: g.lines.length, height: 4, borderRadius: 2, background: gd === g.lines.length ? '#d9b13a' : gd > 0 ? 'var(--persimmon)' : 'rgba(244,239,230,0.18)' }}/>;
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((g, gi) => (
          <div key={g.aisle}>
            <div style={{ position: 'sticky', top: 0, background: 'var(--paper-2)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--paper-3)', zIndex: 2 }}>
              <span style={{ fontFamily: 'DM Serif Display', fontSize: 16 }}>{aisleIcon(g.aisle)} 0{gi+1} · {g.aisle}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{g.lines.length} item{g.lines.length>1?'s':''}</span>
            </div>
            {g.lines.map(line => {
              const isDone = !!order.picked[line.id];
              const isSkipped = !!skipped[line.id];
              const sub = subs[line.id];
              return (
                <div key={line.id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--paper-3)', alignItems: 'center', opacity: isDone || isSkipped ? 0.55 : 1, background: isDone ? 'var(--paper-2)' : isSkipped ? '#fff4dc' : 'var(--paper)' }}>
                  <div style={{ width: 50, height: 50, background: '#fff', borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--paper-3)' }}>
                    {line.item?.image && <img src={line.item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" onError={(e) => e.target.style.display='none'}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'DM Serif Display', fontSize: 14, lineHeight: 1.15, textDecoration: isDone ? 'line-through' : 'none' }}>{line.item?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{line.item?.variant} · qty {line.qty}</div>
                    {sub && <div style={{ marginTop: 4, padding: 4, background: '#fff4dc', borderRadius: 4, fontSize: 10 }}><b>Sub:</b> {sub.id} · <i>{sub.reason}</i></div>}
                    {isSkipped && <div style={{ fontSize: 10, color: 'var(--persimmon)', marginTop: 2, fontStyle: 'italic' }}>Skipped — return later</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => markOOS(line)} disabled={thinking === line.id}
                        title="Out of stock — request sub"
                        style={iconBtn}>{thinking === line.id ? '…' : '✕'}</button>
                      <button onClick={() => skip(line.id)} title="Skip — pick later" style={iconBtn}>↷</button>
                      <button onClick={() => setDamageFor(line)} title="Damaged" style={iconBtn}>⚠</button>
                    </div>
                    <button onClick={() => togglePicked(line.id)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none', background: isDone ? 'var(--olive)' : 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>
                      {isDone ? '✓ Got' : 'Got it'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: '1px solid var(--paper-3)', display: 'flex', gap: 6 }}>
        <button onClick={undo} disabled={!history.length}
          style={{ padding: '10px 12px', border: '1px solid var(--paper-3)', background: 'var(--paper)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: history.length ? 'pointer' : 'default', opacity: history.length ? 1 : 0.4 }}>
          ↶ Undo
        </button>
        <button onClick={onAdvance} disabled={!allDone}
          style={{ flex: 1, padding: 10, border: 'none', borderRadius: 999, background: allDone ? 'var(--persimmon)' : 'var(--paper-3)', color: allDone ? '#fff8ec' : 'var(--ink-3)', fontWeight: 600, fontSize: 13, cursor: allDone ? 'pointer' : 'default' }}>
          {allDone ? 'Hand to driver →' : `${total - doneCount - skippedCount} to go`}
        </button>
      </div>

      {/* Slide-in menu */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 240, background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 18, background: 'var(--ink)', color: 'var(--paper)' }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 22 }}>Picker <em style={{ color: '#d9b13a', fontStyle: 'italic' }}>menu.</em></div>
              <div style={{ fontSize: 11, color: 'rgba(244,239,230,0.6)', marginTop: 4 }}>Theo · Shift 09:00–17:00</div>
            </div>
            <div style={{ flex: 1, padding: 12 }}>
              <MenuItem icon="↶" label="Undo last action" onClick={() => { undo(); setMenuOpen(false); }} disabled={!history.length}/>
              <MenuItem icon="↺" label="Restart this order" onClick={() => { onRestart?.(); setMenuOpen(false); }}/>
              <MenuItem icon="✕" label="Cancel order" onClick={() => { if (confirm('Cancel order?')) { onCancel?.(); setMenuOpen(false); } }} danger/>
              <div style={{ height: 1, background: 'var(--paper-3)', margin: '12px 0' }}/>
              <MenuItem icon="⚠" label="Report shop issue" onClick={() => { window.STAFF_CHAT?.send('picker', 'Theo (Picker)', '⚠ Reporting shop issue.'); setMenuOpen(false); }}/>
              <MenuItem icon="☎" label="Call stock handler" onClick={() => setMenuOpen(false)}/>
              <MenuItem icon="🚪" label="End shift" onClick={() => setMenuOpen(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* Damage modal */}
      {damageFor && <DamageModal item={damageFor.item} onCancel={() => setDamageFor(null)} onSubmit={reportDamage}/>}

      <ChatBubble role="picker"/>
    </div>
  );
}
const iconBtn = { width: 30, height: 30, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper)', cursor: 'pointer', fontSize: 13 };
function MenuItem({ icon, label, onClick, disabled, danger }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', border: 'none', background: 'transparent', textAlign: 'left', borderRadius: 8, cursor: disabled ? 'default' : 'pointer', fontFamily: 'Geist', fontSize: 13, color: danger ? 'var(--persimmon)' : 'var(--ink)', opacity: disabled ? 0.4 : 1 }}>
      <span style={{ fontSize: 16, width: 20 }}>{icon}</span>{label}
    </button>
  );
}
function aisleIcon(a) {
  return ({ Greengrocer: '🥬', Bakery: '🥖', Dairy: '🧀', 'Meat & Fish': '🥩', Pantry: '🥫', Frozen: '🧊', Snacks: '🍪', Drinks: '🥤', Alcohol: '🍷', Household: '🧴', 'Baby & Pet': '🐾' }[a] || '·');
}
function DamageModal({ item, onCancel, onSubmit }) {
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState('');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', background: 'var(--paper)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 20 }}>Report damage</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{item.name} · {item.variant}</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Units damaged</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper)', cursor: 'pointer', fontSize: 16 }}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'DM Serif Display', fontSize: 26 }}>{qty}</div>
            <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontSize: 16 }}>+</button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>What happened?</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Crushed in transit, leaking, expired…"
            style={{ width: '100%', marginTop: 6, padding: 10, border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'Geist', fontSize: 12, minHeight: 60, resize: 'none', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, border: '1px solid var(--paper-3)', background: 'var(--paper)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSubmit(qty, note)} style={{ flex: 2, padding: 12, border: 'none', background: 'var(--persimmon)', color: '#fff8ec', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Report &amp; deduct</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STOCK HANDLER — formerly Shop Owner. Camera scan + simpler menu.
// ════════════════════════════════════════════════════════════
function StockHandlerApp() {
  const [tab, setTab] = React.useState('scan');
  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Geist', position: 'relative' }}>
      <div style={{ padding: '54px 18px 12px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#d9b13a', textTransform: 'uppercase' }}>Stock Handler · Mara</div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 26, marginTop: 2 }}>Stock <em style={{ color: '#d9b13a', fontStyle: 'italic' }}>room.</em></div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--paper-3)', background: 'var(--paper-2)' }}>
        {[['scan', '📷 Scan'], ['inventory', '📦 Inventory'], ['alerts', '⚠ Alerts'], ['orders', '📋 Orders']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '12px 4px', border: 'none', background: tab === k ? 'var(--paper)' : 'transparent', borderBottom: tab === k ? '2px solid var(--persimmon)' : '2px solid transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: tab === k ? 'var(--ink)' : 'var(--ink-3)', fontFamily: 'Geist' }}>{l}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'scan'      && <SHScan/>}
        {tab === 'inventory' && <SHInventory/>}
        {tab === 'alerts'    && <SHAlerts/>}
        {tab === 'orders'    && <SHOrders/>}
      </div>

      <ChatBubble role="stock"/>
    </div>
  );
}
function SHScan() {
  const [scan, setScan] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [qty, setQty] = React.useState(12);
  const [cameraOn, setCameraOn] = React.useState(false);

  const doLookup = async (ean) => {
    setBusy(true); setResult(null);
    const off = await window.STOCK_API.scan(ean);
    if (!off) { setResult({ error: 'Not found in Open Food Facts' }); setBusy(false); return; }
    const aisle = await window.BRAIN.categorizeAisle(off.name, off.variant).catch(() => 'Pantry');
    setResult({ ...off, aisle, price: 1.50 });
    setBusy(false);
  };
  const save = async () => {
    if (!result || result.error) return;
    await window.STOCK_API.add({ ...result, qty });
    if (window.STAFF_CHAT) window.STAFF_CHAT.send('stock', 'Mara (Stock)', `Added ${result.name} ×${qty} to ${result.aisle}`);
    setResult(null); setScan(''); setQty(12);
  };

  return (
    <div style={{ padding: 18 }}>
      {/* Camera viewport (mocked) */}
      <div style={{ background: '#0f0d09', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {cameraOn ? (
          <>
            <div style={{ position: 'absolute', inset: 20, border: '2px solid #d9b13a', borderRadius: 6 }}/>
            <div style={{ position: 'absolute', top: '50%', left: 24, right: 24, height: 2, background: 'rgba(217,177,58,0.7)', boxShadow: '0 0 10px #d9b13a', animation: 'sh-scan 1.6s ease-in-out infinite' }}/>
            <div style={{ color: '#d9b13a', fontSize: 11, position: 'absolute', bottom: 14, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>Scanning…</div>
            <style>{`@keyframes sh-scan { 0%,100% { transform: translateY(-60px); } 50% { transform: translateY(60px); } }`}</style>
          </>
        ) : (
          <div style={{ color: '#6b6253', textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 38 }}>📷</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Tap to start camera</div>
          </div>
        )}
        <button onClick={() => {
          setCameraOn(c => !c);
          // simulate a scan resolving after 1.6s
          if (!cameraOn) setTimeout(() => { setCameraOn(false); setScan('5449000000996'); doLookup('5449000000996'); }, 1800);
        }} style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer' }}/>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <input value={scan} onChange={e => setScan(e.target.value)} placeholder="Or type EAN-13"
          style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, fontSize: 13, background: 'var(--paper)' }}/>
        <button onClick={() => doLookup(scan.trim())} disabled={busy || !scan.trim()}
          style={{ padding: '10px 14px', border: 'none', borderRadius: 6, background: 'var(--ink)', color: 'var(--paper)', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
          {busy ? '…' : 'Lookup'}
        </button>
      </div>

      {result && !result.error && (
        <div style={{ marginTop: 14, padding: 14, background: 'var(--paper-2)', borderRadius: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--paper-3)', flexShrink: 0 }}>
              <img src={result.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt=""/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 16 }}>{result.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{result.brand} · {result.variant}</div>
              <div style={{ marginTop: 4, fontSize: 11 }}>
                <span style={{ padding: '2px 6px', background: 'var(--olive)', color: '#fff8ec', borderRadius: 3, marginRight: 6 }}>{result.aisle}</span>
                <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>aisle by qwen3:4b</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Quantity</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper)', cursor: 'pointer', fontSize: 16 }}>−</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'DM Serif Display', fontSize: 26 }}>{qty}</div>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontSize: 16 }}>+</button>
              <button onClick={() => setQty(qty + 12)} style={{ padding: '0 10px', height: 36, border: '1px solid var(--paper-3)', borderRadius: 6, background: 'var(--paper)', cursor: 'pointer', fontSize: 11 }}>+ case</button>
            </div>
          </div>
          <button onClick={save} style={{ width: '100%', marginTop: 12, padding: 12, border: 'none', background: 'var(--persimmon)', color: '#fff8ec', borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add {qty} to stock</button>
        </div>
      )}
      {result?.error && <div style={{ marginTop: 12, padding: 10, background: '#fff4dc', borderRadius: 6, fontSize: 12, color: 'var(--persimmon)' }}>{result.error}</div>}

      <div style={{ marginTop: 16, fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', fontFamily: 'DM Serif Display' }}>Try EANs 5449000000996, 8001505005707, 3017620422003</div>
    </div>
  );
}
function SHInventory() {
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState('');
  React.useEffect(() => { window.STOCK_API.list().then(setItems); }, []);
  const filtered = q ? items.filter(i => (i.name + ' ' + i.brand).toLowerCase().includes(q.toLowerCase())) : items;
  return (
    <div style={{ padding: 14 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, fontSize: 13, marginBottom: 10, boxSizing: 'border-box', background: 'var(--paper)' }}/>
      {filtered.map(it => (
        <div key={it.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--paper-3)', alignItems: 'center' }}>
          <div style={{ width: 38, height: 38, background: '#fff', border: '1px solid var(--paper-3)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
            {it.image && <img src={it.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.opacity=0.2} alt=""/>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{it.aisle} · £{it.price.toFixed(2)}</div>
          </div>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 16, color: it.qty <= it.low ? 'var(--persimmon)' : 'var(--ink)' }}>{it.qty}</div>
        </div>
      ))}
    </div>
  );
}
function SHAlerts() {
  const [low, setLow] = React.useState([]);
  React.useEffect(() => { window.STOCK_API.lowStock().then(setLow); }, []);
  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--persimmon)', textTransform: 'uppercase' }}>⚠ Low stock · {low.length}</div>
      {low.length === 0 && <div style={{ marginTop: 12, padding: 14, background: 'var(--paper-2)', borderRadius: 8, fontFamily: 'DM Serif Display', fontStyle: 'italic', color: 'var(--ink-3)' }}>All good. Shelves are full.</div>}
      {low.map(it => (
        <div key={it.id} style={{ marginTop: 10, padding: 12, background: '#fff4dc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{it.aisle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'DM Serif Display', fontSize: 22, color: 'var(--persimmon)' }}>{it.qty}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>of {it.low} min</div>
          </div>
        </div>
      ))}
    </div>
  );
}
function SHOrders() {
  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Active</div>
      <div style={{ marginTop: 8, padding: 14, background: 'var(--paper-2)', borderRadius: 8, fontFamily: 'DM Serif Display', fontStyle: 'italic', color: 'var(--ink-3)' }}>
        Live orders show here when customers place them.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DRIVER — accepts handoff, GPS map, multi-stop list
// ════════════════════════════════════════════════════════════
function DriverApp({ orders, onAdvance }) {
  const driverOrders = orders.filter(o => o.stage === 2);
  const [active, setActive] = React.useState(driverOrders[0]?.id);
  React.useEffect(() => {
    if (!active && driverOrders[0]) setActive(driverOrders[0].id);
  }, [driverOrders.length]);
  const order = driverOrders.find(o => o.id === active) || driverOrders[0];

  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Geist', position: 'relative' }}>
      <div style={{ padding: '54px 18px 12px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#d9b13a', textTransform: 'uppercase' }}>Driver · Sam</div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 26, marginTop: 2 }}>{driverOrders.length} <em style={{ color: '#d9b13a', fontStyle: 'italic' }}>{driverOrders.length === 1 ? 'drop' : 'drops'}.</em></div>
      </div>

      {!order ? (
        <div style={{ padding: 24, color: 'var(--ink-3)', fontFamily: 'DM Serif Display', fontStyle: 'italic', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Waiting for the picker to hand off an order.
        </div>
      ) : (
        <>
          <FakeMap address="21 Mott St, Apt 4F" order={order}/>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Now delivering · #{order.id}</div>
            <div style={{ fontFamily: 'DM Serif Display', fontSize: 22, marginTop: 4 }}>21 Mott Street, 4F</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>0.8 mi · ETA 6 min · Buzzer 4F</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ flex: 1, padding: 12, border: '1px solid var(--paper-3)', background: 'var(--paper)', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>📞 Call</button>
              <button style={{ flex: 1, padding: 12, border: '1px solid var(--paper-3)', background: 'var(--paper)', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>🧭 Navigate</button>
            </div>
            <button onClick={() => onAdvance(order.id)} style={{ width: '100%', marginTop: 8, padding: 14, border: 'none', background: 'var(--persimmon)', color: '#fff8ec', borderRadius: 999, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Mark delivered</button>
          </div>
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Basket · {order.lines.length} items</div>
            <div style={{ marginTop: 8, padding: 10, background: 'var(--paper-2)', borderRadius: 8, fontSize: 11, color: 'var(--ink-3)' }}>
              {order.lines.slice(0, 4).map(l => l.item.name).join(' · ')}{order.lines.length > 4 ? ` +${order.lines.length - 4} more` : ''}
            </div>
          </div>
        </>
      )}
      <ChatBubble role="driver"/>
    </div>
  );
}
function FakeMap({ address, customer = false, stage = 2, order }) {
  const cfg = window.RK_CONFIG ? window.RK_CONFIG.load() : { shop_lat: 51.5155, shop_lng: -0.0922 };
  const shop = { lat: cfg.shop_lat, lng: cfg.shop_lng };
  const dest = { lat: order?.lat ?? (cfg.shop_lat + 0.005), lng: order?.lng ?? (cfg.shop_lng + 0.006) };
  if (window.RKMap) return <window.RKMap shop={shop} dest={dest} stage={stage} height={220}/>;
  return <div style={{ height: 220, background: '#d4cdb8' }}/>;
}

window.PickerApp = PickerApp;
window.StockHandlerApp = StockHandlerApp;
window.DriverApp = DriverApp;
window.FakeMap = FakeMap;

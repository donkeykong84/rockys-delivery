// rk-ops.jsx — operator-facing screens: Picker app, Shop Owner, Flow Diagram.
// Same brand vocab as customer app but more utilitarian (less editorial).

// ───────────────────────────────────────────────
// PICKER — aisle-by-aisle ordered list, big tap targets
// ───────────────────────────────────────────────
function RKPicker({ orderId = 'R-04821' }) {
  const [groups, setGroups] = React.useState([]);
  const [done, setDone] = React.useState({});
  const [subs, setSubs] = React.useState({});
  const [thinking, setThinking] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      // sample basket
      const lines = [
        { id: 'sk001', qty: 6 }, { id: 'sk011', qty: 2 }, { id: 'sk021', qty: 1 },
        { id: 'sk032', qty: 1 }, { id: 'sk041', qty: 1 }, { id: 'sk050', qty: 2 },
        { id: 'sk012', qty: 1 }, { id: 'sk051', qty: 1 },
      ];
      const g = await window.STOCK_API.organizePickerList(lines);
      setGroups(g);
    })();
  }, []);

  const total = groups.reduce((s, g) => s + g.lines.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  const markOOS = async (line) => {
    setThinking(line.id);
    const candidates = (await window.STOCK_API.list())
      .filter(x => x.aisle === line.item.aisle && x.id !== line.id && x.qty > 0).slice(0, 6);
    const sub = await window.BRAIN.suggestSubstitute(line.item, candidates).catch(() => null);
    setSubs(s => ({ ...s, [line.id]: sub || { id: candidates[0]?.id, reason: 'similar item, in stock' } }));
    setThinking(null);
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>
      <div style={{ padding: '54px 18px 12px', borderBottom: '1px solid var(--paper-3)', background: 'var(--paper-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="rk-eyebrow">Picking · #{orderId}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--ink)', marginTop: 2 }}>{doneCount} of {total}</div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--olive)', color: '#fff8ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 18 }}>
            {Math.round((doneCount / Math.max(total,1)) * 100)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
          {groups.map((g, i) => {
            const gd = g.lines.filter(l => done[l.id]).length;
            return <div key={i} style={{ flex: g.lines.length, height: 4, borderRadius: 2, background: gd === g.lines.length ? 'var(--olive)' : gd > 0 ? 'var(--persimmon)' : 'var(--paper-3)' }}/>;
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((g, gi) => (
          <div key={g.aisle}>
            <div style={{ position: 'sticky', top: 0, background: 'var(--ink)', color: 'var(--paper)', padding: '8px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--display)', fontSize: 20 }}>0{gi+1}</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 18 }}>{g.aisle}</span>
              </div>
              <span className="rk-eyebrow" style={{ color: '#d9b13a' }}>{g.lines.length} items</span>
            </div>
            {g.lines.map(line => {
              const isDone = !!done[line.id];
              const sub = subs[line.id];
              return (
                <div key={line.id} style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--paper-3)', alignItems: 'center', opacity: isDone ? 0.5 : 1, background: isDone ? 'var(--paper-2)' : 'var(--paper)' }}>
                  <div style={{ width: 48, height: 48, background: '#fff', borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--paper-3)' }}>
                    {line.item?.image && <img src={line.item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" onError={(e) => e.target.style.display='none'}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)', textDecoration: isDone ? 'line-through' : 'none' }}>{line.item?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{line.item?.variant} · qty {line.qty}</div>
                    {sub && (
                      <div style={{ marginTop: 6, padding: 6, background: '#fff4dc', borderRadius: 4, fontSize: 11, color: 'var(--ink-2)' }}>
                        <b>Sub:</b> {sub.id} <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>— {sub.reason}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => markOOS(line)} disabled={thinking === line.id}
                      style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--paper-3)', background: 'var(--paper)', cursor: 'pointer', fontSize: 16 }}>
                      {thinking === line.id ? '…' : '✕'}
                    </button>
                    <button onClick={() => setDone(d => ({ ...d, [line.id]: !d[line.id] }))}
                      style={{ width: 56, height: 40, borderRadius: 8, border: 'none', background: isDone ? 'var(--olive)' : 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13 }}>
                      {isDone ? '✓' : 'Got'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 18px 22px', borderTop: '1px solid var(--paper-3)', background: 'var(--paper)' }}>
        <button style={{ width: '100%', padding: 16, background: 'var(--persimmon)', color: '#fff8ec', border: 'none', borderRadius: 999, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Hand off to driver →
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// SHOP OWNER — barcode add, low stock, brain config
// ───────────────────────────────────────────────
function RKOwner() {
  const [items, setItems] = React.useState([]);
  const [low, setLow] = React.useState([]);
  const [scan, setScan] = React.useState('');
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState(null);
  const [backend, setBackend] = React.useState(window.BRAIN.backend);

  const refresh = async () => {
    setItems(await window.STOCK_API.list());
    setLow(await window.STOCK_API.lowStock());
  };
  React.useEffect(() => { refresh(); }, []);

  const doScan = async () => {
    if (!scan.trim()) return;
    setScanning(true); setScanResult(null);
    const off = await window.STOCK_API.scan(scan.trim());
    if (!off) { setScanResult({ error: 'Not found in Open Food Facts' }); setScanning(false); return; }
    const aisle = await window.BRAIN.categorizeAisle(off.name, off.variant).catch(() => 'Pantry');
    setScanResult({ ...off, aisle, qty: 12, price: 1.50 });
    setScanning(false);
  };
  const saveScan = async () => {
    if (!scanResult || scanResult.error) return;
    await window.STOCK_API.add(scanResult);
    setScan(''); setScanResult(null);
    refresh();
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 22px 16px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div className="rk-eyebrow" style={{ color: '#d9b13a' }}>Shop · Rocky&rsquo;s Mott Street</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 30, marginTop: 4 }}>Stock <span style={{ fontStyle: 'italic', color: '#d9b13a' }}>room.</span></div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <Stat n={items.length} l="SKUs"/>
          <Stat n={low.length} l="Low" alert/>
          <Stat n={items.reduce((s, i) => s + i.qty, 0)} l="Units"/>
        </div>
      </div>

      <div style={{ padding: 18, borderBottom: '1px solid var(--paper-3)' }}>
        <div className="rk-eyebrow rk-eyebrow-persimmon">Add stock · scan barcode</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input value={scan} onChange={e => setScan(e.target.value)} placeholder="EAN-13, e.g. 5449000000996"
            style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'var(--sans)', fontSize: 13, background: 'var(--paper)' }}/>
          <button onClick={doScan} disabled={scanning} style={{ padding: '10px 14px', border: 'none', borderRadius: 6, background: 'var(--ink)', color: 'var(--paper)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {scanning ? 'Looking…' : 'Lookup'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>Try 5449000000996 (Coke), 8001505005707 (Barilla), 3017620422003 (Nutella)</div>
        {scanResult && !scanResult.error && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--paper-2)', borderRadius: 8, display: 'flex', gap: 12 }}>
            <div style={{ width: 64, height: 64, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--paper-3)', flexShrink: 0 }}>
              <img src={scanResult.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt=""/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 16 }}>{scanResult.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{scanResult.brand} · {scanResult.variant}</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
                <span style={{ padding: '2px 6px', background: 'var(--olive)', color: '#fff8ec', borderRadius: 3 }}>{scanResult.aisle}</span>
                <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>aisle picked by qwen3:4b</span>
              </div>
              <button onClick={saveScan} style={{ marginTop: 8, padding: '6px 14px', border: 'none', borderRadius: 999, background: 'var(--persimmon)', color: '#fff8ec', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Add to stock</button>
            </div>
          </div>
        )}
        {scanResult?.error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--persimmon)' }}>{scanResult.error}</div>}
      </div>

      {low.length > 0 && (
        <div style={{ padding: 18, borderBottom: '1px solid var(--paper-3)', background: '#fff4dc' }}>
          <div className="rk-eyebrow rk-eyebrow-persimmon">⚠ Low stock</div>
          <div style={{ marginTop: 8 }}>
            {low.map(it => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span>{it.name}</span>
                <span style={{ color: 'var(--persimmon)', fontWeight: 600 }}>{it.qty} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 18, flex: 1, overflowY: 'auto' }}>
        <div className="rk-eyebrow">All stock · {items.length} SKUs</div>
        <div style={{ marginTop: 10 }}>
          {items.map(it => (
            <div key={it.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--paper-3)', alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, background: '#fff', border: '1px solid var(--paper-3)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                {it.image && <img src={it.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.opacity = 0.2} alt=""/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{it.variant} · {it.aisle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, color: it.qty <= it.low ? 'var(--persimmon)' : 'var(--ink)' }}>{it.qty}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>£{it.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 18px 22px', borderTop: '1px solid var(--paper-3)', background: 'var(--paper-2)' }}>
        <div className="rk-eyebrow">Brain</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          <select value={backend} onChange={e => { window.BRAIN.backend = e.target.value; setBackend(e.target.value); }}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 4, border: '1px solid var(--paper-3)', fontFamily: 'var(--sans)', fontSize: 12, background: 'var(--paper)' }}>
            <option value="claude">Claude (in-browser, for testing)</option>
            <option value="ollama">Ollama qwen3:4b (your droplet)</option>
          </select>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--olive)' }}/>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, fontStyle: 'italic' }}>Set droplet URL in localStorage: <code>rk-ollama-url</code></div>
      </div>
    </div>
  );
}
function Stat({ n, l, alert }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: alert ? '#e26a32' : '#d9b13a' }}>{n}</div>
      <div className="rk-eyebrow" style={{ color: 'rgba(244,239,230,0.6)' }}>{l}</div>
    </div>
  );
}

// ───────────────────────────────────────────────
// FLOW DIAGRAM — architecture overview
// ───────────────────────────────────────────────
function RKFlowDiagram() {
  return (
    <div style={{ width: 1100, height: 720, background: 'var(--paper)', padding: 36, fontFamily: 'var(--sans)', position: 'relative', boxSizing: 'border-box' }}>
      <div className="rk-eyebrow">System Architecture · v0.1</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 38, color: 'var(--ink)', marginTop: 4 }}>How <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>Rocky&rsquo;s</span> works.</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', marginTop: 4, maxWidth: 600 }}>
        Three apps, one shop database, one local LLM (qwen3:4b on your 8GB droplet) coordinating between them.
      </div>

      {/* Three columns: customer | brain | operators */}
      <svg width="1028" height="540" viewBox="0 0 1028 540" style={{ position: 'absolute', left: 36, top: 140 }}>
        {/* connector lines (drawn first so nodes overlay) */}
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#1d1a14"/>
          </marker>
        </defs>
        <g stroke="#1d1a14" strokeWidth="1.5" fill="none" markerEnd="url(#arr)">
          {/* Customer → Backend */}
          <path d="M260 90 L420 100" />
          {/* Backend → Brain */}
          <path d="M620 130 L700 130" />
          {/* Brain → Backend */}
          <path d="M700 200 L620 200" strokeDasharray="4 3"/>
          {/* Backend → Picker */}
          <path d="M620 280 L780 280" />
          {/* Picker → Backend */}
          <path d="M780 330 L620 330" strokeDasharray="4 3"/>
          {/* Backend → Driver */}
          <path d="M620 420 L780 420" />
          {/* Owner ↔ Backend */}
          <path d="M260 470 L420 460" />
          <path d="M420 500 L260 510" strokeDasharray="4 3"/>
          {/* OFF → Backend (top) */}
          <path d="M520 30 L520 70" />
        </g>
        {/* labels on lines */}
        <g fontFamily="Geist" fontSize="9" fill="#6b6253" letterSpacing="0.08em">
          <text x="290" y="86" textTransform="uppercase">orders, browse</text>
          <text x="630" y="124" textTransform="uppercase">prompts</text>
          <text x="620" y="218" textTransform="uppercase" fontStyle="italic">json reply</text>
          <text x="630" y="276" textTransform="uppercase">organized list</text>
          <text x="620" y="350" textTransform="uppercase" fontStyle="italic">picked / oos</text>
          <text x="630" y="416" textTransform="uppercase">route + drops</text>
          <text x="290" y="456" textTransform="uppercase">stock add / scan</text>
          <text x="290" y="528" textTransform="uppercase" fontStyle="italic">low-stock alerts</text>
          <text x="430" y="22" textTransform="uppercase">barcode lookup</text>
        </g>
      </svg>

      {/* Open Food Facts (top) */}
      <Node x={420} y={140} w={200} h={56} bg="#ebe4d6" title="Open Food Facts" sub="public API · 2.6M products" eyebrow="external"/>
      {/* Customer */}
      <Node x={36} y={210} w={224} h={120} bg="#2a2419" fg="#f4efe6" title="Customer App" sub="iPhone / Android" eyebrow="public" lines={['Browse · Cart · Checkout','Live order tracking','AI invisible']}/>
      {/* Backend / stock DB */}
      <Node x={420} y={210} w={200} h={144} bg="#4a5436" fg="#f4efe6" title="Stock DB + API" sub="REST · stock.json mock today" eyebrow="server" lines={['/stock · /aisles','/orders · /alerts','/off/<barcode>']}/>
      {/* Brain */}
      <Node x={700} y={270} w={290} h={94} bg="#5b2a3a" fg="#f4efe6" title="qwen3:4b on Ollama" sub="8GB droplet · CPU · ~3s/req" eyebrow="brain"
        lines={['→ categorize new SKU into aisle','→ suggest substitute when OOS','→ order driver stops by route']}/>
      {/* Picker */}
      <Node x={760} y={400} w={224} h={84} bg="#ebe4d6" title="Picker App" sub="store-side · big tap targets" eyebrow="staff" lines={['AI-organized aisle list']}/>
      {/* Driver */}
      <Node x={760} y={510} w={224} h={56} bg="#ebe4d6" title="Driver App" sub="map + AI-routed stops" eyebrow="staff"/>
      {/* Owner */}
      <Node x={36} y={420} w={224} h={120} bg="#ebe4d6" title="Shop Owner" sub="iPad / desktop" eyebrow="back-of-house" lines={['Scan barcode → auto-fetch','Low-stock alerts','Brain backend toggle']}/>
    </div>
  );
}
function Node({ x, y, w, h, bg, fg = 'var(--ink)', title, sub, eyebrow, lines = [] }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, minHeight: h, background: bg, color: fg, borderRadius: 10, padding: '12px 14px', boxSizing: 'border-box', boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}>
      <div className="rk-eyebrow" style={{ color: fg === 'var(--ink)' ? 'var(--ink-3)' : 'rgba(244,239,230,0.55)' }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 18, marginTop: 2 }}>{title}</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: fg === 'var(--ink)' ? 'var(--ink-3)' : 'rgba(244,239,230,0.6)', marginTop: 2 }}>{sub}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 11, marginTop: i === 0 ? 8 : 3, opacity: 0.85 }}>{l}</div>
      ))}
    </div>
  );
}

Object.assign(window, { RKPicker, RKOwner, RKFlowDiagram });

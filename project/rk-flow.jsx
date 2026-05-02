// rk-flow.jsx — Architecture flow diagram. SVG-based, editorial styling.

function RKFlow() {
  // Three lanes: customer (top), shop floor (middle), driver (bottom)
  // Ollama in the center, Stock DB to the side.
  const W = 1200, H = 720;

  return (
    <div data-screen-label="Flow Diagram" style={{ background: 'var(--paper)', width: W, height: H, padding: 32, boxSizing: 'border-box', position: 'relative', fontFamily: 'var(--sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="rk-eyebrow rk-eyebrow-olive">Architecture</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 36, color: 'var(--ink)', lineHeight: 0.95, marginTop: 4, fontWeight: 400 }}>How <span style={{ fontStyle: 'italic', color: 'var(--olive)' }}>Rocky&rsquo;s</span> works.</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>One LLM in the middle, three roles around it. Customer never sees it.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="rk-eyebrow">Stack</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)' }}>8 GB CPU droplet · Ollama · qwen3:4b</div>
        </div>
      </div>
      <div className="rk-rule" style={{ marginTop: 14 }}/>

      <svg viewBox="0 0 1140 580" style={{ width: '100%', height: 580, marginTop: 16 }} fontFamily="Geist, sans-serif">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#3a3429"/>
          </marker>
          <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#c4541d"/>
          </marker>
          <marker id="arrow-olive" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#4a5436"/>
          </marker>
        </defs>

        {/* ═══ Center: OLLAMA brain ═══ */}
        <g transform="translate(440, 200)">
          <rect width="260" height="180" rx="8" fill="#2a2419" stroke="#1d1a14"/>
          <rect x="6" y="6" width="248" height="168" rx="6" fill="none" stroke="#d9b13a" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5"/>
          <text x="130" y="34" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="2" fill="#d9b13a">THE BRAIN</text>
          <text x="130" y="68" textAnchor="middle" fontSize="26" fontFamily="DM Serif Display" fill="#f4efe6">Ollama</text>
          <text x="130" y="92" textAnchor="middle" fontSize="14" fontStyle="italic" fontFamily="DM Serif Text" fill="#c9bfa8">qwen3:4b</text>
          <line x1="40" y1="108" x2="220" y2="108" stroke="#6b6253" strokeWidth="0.5"/>
          <text x="130" y="126" textAnchor="middle" fontSize="11" fill="#c9bfa8">8 GB CPU droplet</text>
          <text x="130" y="146" textAnchor="middle" fontSize="10" fill="#a89e8b">~2–4s per call</text>
          <text x="130" y="164" textAnchor="middle" fontSize="9" letterSpacing="1.5" fill="#d9b13a">JSON IN / JSON OUT</text>
        </g>

        {/* ═══ Stock DB ═══ */}
        <g transform="translate(900, 230)">
          <rect width="180" height="120" rx="6" fill="#5b2a3a" stroke="#3a1a26"/>
          <text x="90" y="28" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="2" fill="#d9b13a">DATABASE</text>
          <text x="90" y="60" textAnchor="middle" fontSize="22" fontFamily="DM Serif Display" fill="#f4efe6">Stock</text>
          <text x="90" y="82" textAnchor="middle" fontSize="12" fontStyle="italic" fontFamily="DM Serif Text" fill="#c9bfa8">SKU · qty · aisle</text>
          <text x="90" y="104" textAnchor="middle" fontSize="10" fill="#a89e8b">Live inventory</text>
        </g>

        {/* ═══ Open Food Facts ═══ */}
        <g transform="translate(900, 80)">
          <rect width="180" height="100" rx="6" fill="#ebe4d6" stroke="#ddd2bd"/>
          <text x="90" y="26" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="2" fill="#6b6253">EXTERNAL · FREE API</text>
          <text x="90" y="54" textAnchor="middle" fontSize="18" fontFamily="DM Serif Display" fill="#1d1a14">Open Food Facts</text>
          <text x="90" y="76" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="DM Serif Text" fill="#6b6253">barcode → name + photo</text>
        </g>

        {/* ═══ Customer (top-left) ═══ */}
        <g transform="translate(60, 60)">
          <rect width="260" height="120" rx="6" fill="#ebe4d6" stroke="#ddd2bd"/>
          <text x="20" y="28" fontSize="9" fontWeight="600" letterSpacing="2" fill="#c4541d">01 · CUSTOMER</text>
          <text x="20" y="58" fontSize="22" fontFamily="DM Serif Display" fill="#1d1a14">The Market app</text>
          <text x="20" y="80" fontSize="11" fontStyle="italic" fontFamily="DM Serif Text" fill="#6b6253">Browses · adds · checks out</text>
          <text x="20" y="102" fontSize="10" fill="#a89e8b">never sees the LLM</text>
        </g>

        {/* ═══ Picker (middle-left) ═══ */}
        <g transform="translate(60, 270)">
          <rect width="260" height="120" rx="6" fill="#ebe4d6" stroke="#ddd2bd"/>
          <text x="20" y="28" fontSize="9" fontWeight="600" letterSpacing="2" fill="#4a5436">02 · PICKER</text>
          <text x="20" y="58" fontSize="22" fontFamily="DM Serif Display" fill="#1d1a14">Aisle-by-aisle list</text>
          <text x="20" y="80" fontSize="11" fontStyle="italic" fontFamily="DM Serif Text" fill="#6b6253">Walks · ticks · subs OOS items</text>
          <text x="20" y="102" fontSize="10" fill="#a89e8b">tablet on a shelf-clip</text>
        </g>

        {/* ═══ Driver (bottom-left) ═══ */}
        <g transform="translate(60, 460)">
          <rect width="260" height="100" rx="6" fill="#ebe4d6" stroke="#ddd2bd"/>
          <text x="20" y="28" fontSize="9" fontWeight="600" letterSpacing="2" fill="#b8893a">03 · DRIVER</text>
          <text x="20" y="58" fontSize="22" fontFamily="DM Serif Display" fill="#1d1a14">Routed deliveries</text>
          <text x="20" y="80" fontSize="11" fontStyle="italic" fontFamily="DM Serif Text" fill="#6b6253">Optimized stop order</text>
        </g>

        {/* ═══ Shopkeeper (bottom-center) ═══ */}
        <g transform="translate(440, 460)">
          <rect width="260" height="100" rx="6" fill="#ebe4d6" stroke="#ddd2bd"/>
          <text x="20" y="28" fontSize="9" fontWeight="600" letterSpacing="2" fill="#5b2a3a">00 · SHOPKEEPER</text>
          <text x="20" y="58" fontSize="22" fontFamily="DM Serif Display" fill="#1d1a14">Scans · stocks · alerts</text>
          <text x="20" y="80" fontSize="11" fontStyle="italic" fontFamily="DM Serif Text" fill="#6b6253">Barcode in → AI shelves it</text>
        </g>

        {/* ═══ Arrows: Customer ↔ Stock & Brain ═══ */}
        {/* Customer → Brain (order goes in) */}
        <path d="M 320 110 Q 380 130, 440 230" stroke="#3a3429" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
        <text x="335" y="155" fontSize="10" fontStyle="italic" fontFamily="DM Serif Text" fill="#3a3429">order placed</text>

        {/* Customer ↔ Stock (live availability) */}
        <path d="M 320 90 Q 600 50, 900 110" stroke="#4a5436" strokeWidth="1" fill="none" strokeDasharray="3 3"/>
        <text x="600" y="58" fontSize="10" textAnchor="middle" fontStyle="italic" fill="#4a5436">availability check</text>

        {/* Stock ↔ Brain */}
        <line x1="900" y1="290" x2="700" y2="280" stroke="#4a5436" strokeWidth="1.5" markerEnd="url(#arrow-olive)" markerStart="url(#arrow-olive)"/>
        <text x="800" y="270" fontSize="10" textAnchor="middle" fontStyle="italic" fill="#4a5436">queries</text>

        {/* Brain → Picker (organized list) */}
        <path d="M 440 320 Q 380 320, 320 320" stroke="#c4541d" strokeWidth="1.8" fill="none" markerEnd="url(#arrow-orange)"/>
        <text x="335" y="312" fontSize="10" fontStyle="italic" fill="#c4541d">aisle-organized list</text>

        {/* Picker → Brain (OOS request) */}
        <path d="M 320 350 Q 380 360, 440 360" stroke="#3a3429" strokeWidth="1.2" fill="none" strokeDasharray="2 2" markerEnd="url(#arrow)"/>
        <text x="335" y="378" fontSize="10" fontStyle="italic" fill="#6b6253">"out of stock?"</text>

        {/* Brain → Driver (route) */}
        <path d="M 540 380 Q 400 440, 320 490" stroke="#c4541d" strokeWidth="1.8" fill="none" markerEnd="url(#arrow-orange)"/>
        <text x="365" y="440" fontSize="10" fontStyle="italic" fill="#c4541d">optimized route</text>

        {/* Shopkeeper → OFF (barcode) */}
        <path d="M 700 490 Q 820 470, 900 180" stroke="#3a3429" strokeWidth="1.2" fill="none" strokeDasharray="3 3" markerEnd="url(#arrow)"/>
        <text x="850" y="380" fontSize="10" fontStyle="italic" fill="#6b6253">barcode lookup</text>

        {/* Shopkeeper → Brain (categorize) */}
        <path d="M 570 460 Q 570 420, 570 380" stroke="#c4541d" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-orange)"/>
        <text x="580" y="430" fontSize="10" fontStyle="italic" fill="#c4541d">"which aisle?"</text>

        {/* Shopkeeper → Stock */}
        <path d="M 700 510 Q 800 510, 900 350" stroke="#4a5436" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-olive)"/>
        <text x="830" y="500" fontSize="10" fontStyle="italic" fill="#4a5436">writes inventory</text>
      </svg>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 28, left: 32, right: 32, display: 'flex', gap: 24, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 18, height: 2, background: '#c4541d' }}/> AI / LLM call</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 18, height: 2, background: '#4a5436' }}/> Database read/write</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 18, height: 2, background: '#3a3429' }}/> User action</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 18, height: 2, background: '#3a3429', borderTop: '1px dashed #3a3429', background: 'none' }}/> Optional / async</span>
      </div>
    </div>
  );
}

Object.assign(window, { RKFlow });

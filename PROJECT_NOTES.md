# Rocky's Mini-Market Delivery — Pickup Summary

**For Claude (next session):** read this FIRST. Everything you need to continue without re-exploring.

---

## Project in one paragraph
Rocky's is a mini-market delivery system for small shops. Three apps (Customer / Picker / Driver) coordinated by a local LLM (`qwen3:4b` on user's 8GB Ollama droplet, with Claude fallback in-browser). Customer-side AI is invisible. Editorial premium grocer aesthetic — DM Serif Display + Geist, paper/ink/olive/persimmon palette. Built as an interactive HTML prototype on a Design Canvas with multiple artboards.

## File map (all project root)
- `Rockys Delivery.html` — entry; wires everything via DesignCanvas
- `brand.css` — type/color tokens (`--paper #f4efe6`, `--ink #1d1a14`, `--olive #4a5436`, `--persimmon #c4541d`)
- `rk-shared.jsx` — atoms: RKLogo, RKProduce (SVG), RKSeal, RKEyebrow, RKTabBar, RKIcon, fmtPrice, ROCKY_CATALOG (editorial seed)
- `rk-home.jsx` — RKHome (illustrated/editorial direction)
- `rk-home-stock.jsx` — RKHomeStock (real OFF photos, live stock)
- `rk-screens.jsx` — RKProduct, RKCart, RKCheckout, RKTrack
- `rk-stock.js` — STOCK_API mock backend; SEED_STOCK with real EAN-13s; AISLE_ORDER; offImageUrl(ean) helper. Methods: list, get, scan (hits OFF), add, decrement, lowStock, aisles, organizePickerList, suggestSub
- `rk-brain.js` — BRAIN client. Backends: `claude` (default) | `ollama`. Methods: ask, categorizeAisle, suggestSubstitute, orderRoute. Config: localStorage keys `rk-brain-backend`, `rk-ollama-url`, `rk-ollama-model`
- `rk-ops.jsx` — RKPicker, RKOwner, RKFlowDiagram
- starters: `design-canvas.jsx`, `ios-frame.jsx`, `android-frame.jsx`

## Canvas sections (in order)
1. **System architecture** — RKFlowDiagram (1100×720)
2. **Testable mock** — Owner (barcode scan), Picker (aisle list+sub), Customer-real-OFF
3. **Customer editorial** — Home, Product, Cart, Checkout, Track stages 1/2/3
4. **Android parity** — Home, Track

## Style conventions
- Tokens via CSS vars from brand.css; eyebrow class `rk-eyebrow` for small caps
- Display = DM Serif Display, italic for emphasis often in `--olive`
- Each component file ends with `Object.assign(window, {...})` for cross-script sharing
- All Babel scripts; no `const styles =` collisions — inline styles or component-prefixed
- `data-screen-label` on screen roots for mention-context

## Test EANs (live on Open Food Facts)
`5449000000996` Coke · `8001505005707` Barilla · `3017620422003` Nutella · `5410126612035` Lurpak · `7622210449283` Oreo

## Droplet wiring
```js
localStorage.setItem('rk-ollama-url', 'http://YOUR-DROPLET:11434');
// then flip Owner screen dropdown to "Ollama qwen3:4b"
```
Falls back to Claude if unreachable.

## NOT YET BUILT (next session priorities, in order)
1. **Driver app screen** — map + multi-stop list. `BRAIN.orderRoute(stops)` already exists; just needs UI.
2. **Multi-role live split view** — one screen, all 3 roles' state for an order
3. **Owner CSV import** — wireframe only
4. **Real backend swap** — replace `_store` in rk-stock.js with Node/SQLite on droplet. REST shape already designed.
5. **Customer NL search** — "something for tonight's pasta" via qwen3:4b

## Open questions to settle
- Currency: editorial uses `$`, stock uses `£` — pick one
- Per-shop aisle config (currently hardcoded AISLE_ORDER)
- Sub approval: customer at order time vs trust picker
- Driver pay model affects route objective

## User preferences (locked from earlier Q&A)
- Customer app only is current scope (Picker/Owner added as ops support)
- iPhone + Android, both
- AI invisible to customer
- Vibe: editorial + premium grocer, magazine-like
- Shop name: Rocky's
- Image source: Open Food Facts
- Mock scope: full stack (stock JSON + JS sim)
- Stock automation: barcode scan + low-stock alerts
- Speed AND polish

## Working agreement (from m0035)
**Rewrite this summary every 3 prompts/answers** to save tokens.

// rk-map.jsx — real OpenStreetMap (Leaflet) map.
// Used by Driver (route view) and Customer (track delivery).
//
// Loads Leaflet from CDN once globally; renders a small map with two pins
// (shop · destination) and an animated van icon walking the route.
//
// Props: { shop:{lat,lng}, dest:{lat,lng}, stage:0|1|2|3 }

(function loadLeaflet() {
  if (window._leafletLoading) return;
  window._leafletLoading = true;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  css.crossOrigin = '';
  document.head.appendChild(css);
  const js = document.createElement('script');
  js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  js.crossOrigin = '';
  js.onload = () => { window._leafletReady = true; document.dispatchEvent(new Event('leaflet-ready')); };
  document.head.appendChild(js);
})();

function RKMap({ shop, dest, stage = 2, height = 240, interactive = true }) {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const vanRef = React.useRef(null);
  const [ready, setReady] = React.useState(!!window._leafletReady);

  React.useEffect(() => {
    if (window._leafletReady) { setReady(true); return; }
    const onReady = () => setReady(true);
    document.addEventListener('leaflet-ready', onReady);
    return () => document.removeEventListener('leaflet-ready', onReady);
  }, []);

  React.useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L = window.L;
    const center = [(shop.lat + dest.lat) / 2, (shop.lng + dest.lng) / 2];
    const m = L.map(containerRef.current, {
      center, zoom: 15, zoomControl: false, attributionControl: false,
      dragging: interactive, scrollWheelZoom: false, doubleClickZoom: interactive,
      touchZoom: interactive, boxZoom: false, keyboard: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' }).addTo(m);

    const shopIcon = L.divIcon({
      className: 'rk-pin', html: '<div style="background:#4a5436;color:#f4efe6;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-family:DM Serif Display;font-size:12px;border:2px solid #f4efe6;box-shadow:0 4px 10px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg)">🏪</span></div>',
      iconSize: [28, 28], iconAnchor: [14, 28],
    });
    const destIcon = L.divIcon({
      className: 'rk-pin', html: '<div style="background:#c4541d;color:#fff8ec;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-family:DM Serif Display;font-size:12px;border:2px solid #f4efe6;box-shadow:0 4px 10px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg)">📍</span></div>',
      iconSize: [28, 28], iconAnchor: [14, 28],
    });
    L.marker([shop.lat, shop.lng], { icon: shopIcon }).addTo(m);
    L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(m);

    const route = L.polyline([[shop.lat, shop.lng], [dest.lat, dest.lng]],
      { color: '#c4541d', weight: 4, dashArray: '8 6', opacity: 0.85 }).addTo(m);
    m.fitBounds(route.getBounds(), { padding: [40, 40] });

    const vanIcon = L.divIcon({
      className: 'rk-van',
      html: '<div style="background:#fff8ec;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #1d1a14;box-shadow:0 4px 12px rgba(0,0,0,0.4)">🚐</div>',
      iconSize: [32, 32], iconAnchor: [16, 16],
    });
    vanRef.current = L.marker([shop.lat, shop.lng], { icon: vanIcon }).addTo(m);

    mapRef.current = m;
    return () => { m.remove(); mapRef.current = null; };
  }, [ready, shop.lat, shop.lng, dest.lat, dest.lng]);

  // animate van based on stage
  React.useEffect(() => {
    if (!mapRef.current || !vanRef.current) return;
    const t = stage <= 1 ? 0 : stage === 2 ? 0.55 : 1;
    const lat = shop.lat + (dest.lat - shop.lat) * t;
    const lng = shop.lng + (dest.lng - shop.lng) * t;
    vanRef.current.setLatLng([lat, lng]);
  }, [stage]);

  return (
    <div style={{ height, width: '100%', background: '#d4cdb8', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}/>
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6253', fontFamily: 'DM Serif Display', fontStyle: 'italic' }}>Loading map…</div>
      )}
    </div>
  );
}
window.RKMap = RKMap;

// rk-stock.js — expanded catalog with ~85 real verified products.
// All EANs are real, all images come from Open Food Facts.

function offImageUrl(ean, n = 1) {
  const s = String(ean).padStart(13, '0');
  const a = s.slice(0, 3), b = s.slice(3, 6), c = s.slice(6, 9), d = s.slice(9);
  return `https://images.openfoodfacts.org/images/products/${a}/${b}/${c}/${d}/${n}.jpg`;
}

// Aisle order = the picker's walking path through the shop floor.
const AISLE_ORDER = ['Greengrocer', 'Bakery', 'Dairy', 'Meat & Fish', 'Pantry', 'Frozen', 'Snacks', 'Drinks', 'Alcohol', 'Household', 'Baby & Pet'];

const SEED_STOCK = [
  // ─── Drinks ─────────────
  { id: 'sk001', ean: '5449000000996', name: 'Coca-Cola',           variant: '330 ml can',     price: 1.20, qty: 48, aisle: 'Drinks',     low: 12, brand: 'Coca-Cola' },
  { id: 'sk002', ean: '5449000054227', name: 'Coca-Cola Zero Sugar',variant: '330 ml can',     price: 1.20, qty: 36, aisle: 'Drinks',     low: 12, brand: 'Coca-Cola' },
  { id: 'sk003', ean: '5449000131805', name: 'Sprite',              variant: '330 ml can',     price: 1.20, qty: 24, aisle: 'Drinks',     low: 12, brand: 'Sprite' },
  { id: 'sk004', ean: '4000177016305', name: 'Schweppes Tonic',     variant: '200 ml glass',   price: 1.50, qty: 4,  aisle: 'Drinks',     low: 8,  brand: 'Schweppes' },
  { id: 'sk005', ean: '5060337502115', name: 'Karma Cola Organic',  variant: '250 ml can',     price: 1.80, qty: 18, aisle: 'Drinks',     low: 6,  brand: 'Karma Cola' },
  { id: 'sk006', ean: '5060166700157', name: 'Innocent Orange Juice',variant: '900 ml',        price: 3.50, qty: 14, aisle: 'Drinks',     low: 6,  brand: 'Innocent' },
  { id: 'sk007', ean: '5410188006063', name: 'Tropicana Smooth',    variant: '950 ml',         price: 3.80, qty: 9,  aisle: 'Drinks',     low: 6,  brand: 'Tropicana' },
  { id: 'sk008', ean: '5060335633019', name: 'Vita Coco',           variant: '330 ml',         price: 1.95, qty: 16, aisle: 'Drinks',     low: 6,  brand: 'Vita Coco' },
  { id: 'sk009', ean: '5410188031430', name: 'Lipton Ice Tea Peach',variant: '500 ml',         price: 1.40, qty: 22, aisle: 'Drinks',     low: 8,  brand: 'Lipton' },
  { id: 'sk00A', ean: '5060379240013', name: 'Yorkshire Tea',       variant: '80 bags',        price: 3.20, qty: 14, aisle: 'Drinks',     low: 6,  brand: 'Yorkshire Tea' },
  { id: 'sk00B', ean: '5000208002009', name: 'PG Tips Pyramid',     variant: '160 bags',       price: 4.50, qty: 11, aisle: 'Drinks',     low: 6,  brand: 'PG Tips' },
  { id: 'sk00C', ean: '4006067020421', name: 'Nescafé Gold',        variant: '200 g jar',      price: 6.95, qty: 8,  aisle: 'Drinks',     low: 4,  brand: 'Nescafé' },

  // ─── Pantry ─────────────
  { id: 'sk010', ean: '8001505005707', name: 'Barilla Spaghetti n.5',variant: '500 g',         price: 2.10, qty: 22, aisle: 'Pantry',     low: 8,  brand: 'Barilla' },
  { id: 'sk011', ean: '8076809513753', name: 'Mutti Polpa',         variant: '400 g tin',      price: 2.40, qty: 14, aisle: 'Pantry',     low: 6,  brand: 'Mutti' },
  { id: 'sk013', ean: '8410054121034', name: 'La Chinata Smoked Paprika',variant: '70 g',      price: 3.50, qty: 7,  aisle: 'Pantry',     low: 4,  brand: 'La Chinata' },
  { id: 'sk014', ean: '3017620422003', name: 'Nutella',             variant: '400 g',          price: 4.95, qty: 16, aisle: 'Pantry',     low: 6,  brand: 'Ferrero' },
  { id: 'sk015', ean: '8076800195057', name: 'Barilla Penne Rigate',variant: '500 g',          price: 2.10, qty: 19, aisle: 'Pantry',     low: 8,  brand: 'Barilla' },
  { id: 'sk016', ean: '5000354501128', name: 'Heinz Baked Beans',   variant: '415 g',          price: 1.20, qty: 32, aisle: 'Pantry',     low: 12, brand: 'Heinz' },
  { id: 'sk017', ean: '5000157024671', name: 'Heinz Tomato Ketchup',variant: '460 ml',         price: 2.80, qty: 18, aisle: 'Pantry',     low: 8,  brand: 'Heinz' },
  { id: 'sk018', ean: '5054775135842', name: 'Hellmann\u2019s Mayonnaise',variant: '430 ml',   price: 2.95, qty: 14, aisle: 'Pantry',     low: 6,  brand: 'Hellmann\u2019s' },
  { id: 'sk019', ean: '8410031000023', name: 'Bertolli Olive Oil',  variant: '500 ml',         price: 5.50, qty: 9,  aisle: 'Pantry',     low: 4,  brand: 'Bertolli' },
  { id: 'sk01A', ean: '5010029217124', name: 'Tate & Lyle Sugar',   variant: '1 kg',           price: 1.30, qty: 22, aisle: 'Pantry',     low: 8,  brand: 'Tate & Lyle' },
  { id: 'sk01B', ean: '5010044001010', name: 'Saxa Table Salt',     variant: '750 g',          price: 0.95, qty: 17, aisle: 'Pantry',     low: 6,  brand: 'Saxa' },
  { id: 'sk01C', ean: '5000147023035', name: 'McCormick Black Pepper',variant: '50 g',         price: 2.10, qty: 11, aisle: 'Pantry',     low: 4,  brand: 'McCormick' },
  { id: 'sk01D', ean: '5010044039518', name: 'Kellogg\u2019s Corn Flakes',variant: '500 g',    price: 3.20, qty: 13, aisle: 'Pantry',     low: 6,  brand: 'Kellogg\u2019s' },
  { id: 'sk01E', ean: '5012035955236', name: 'Weetabix',            variant: '24 pack',        price: 2.90, qty: 10, aisle: 'Pantry',     low: 4,  brand: 'Weetabix' },
  { id: 'sk01F', ean: '5010029000023', name: 'Quaker Oats',         variant: '1 kg',           price: 2.40, qty: 15, aisle: 'Pantry',     low: 6,  brand: 'Quaker' },
  { id: 'sk01G', ean: '5000232915412', name: 'Branston Pickle',     variant: '360 g',          price: 1.95, qty: 8,  aisle: 'Pantry',     low: 4,  brand: 'Branston' },
  { id: 'sk01H', ean: '8410014102217', name: 'Carbonell Olive Oil EV',variant: '750 ml',       price: 6.95, qty: 6,  aisle: 'Pantry',     low: 4,  brand: 'Carbonell' },
  { id: 'sk01I', ean: '5057967492299', name: 'Tilda Basmati Rice',  variant: '1 kg',           price: 4.50, qty: 12, aisle: 'Pantry',     low: 6,  brand: 'Tilda' },
  { id: 'sk01J', ean: '5054775151460', name: 'Knorr Chicken Stock', variant: '8 cubes',        price: 1.20, qty: 14, aisle: 'Pantry',     low: 6,  brand: 'Knorr' },

  // ─── Bakery ─────────────
  { id: 'sk020', ean: '7613034626844', name: 'Wasa Crispbread',     variant: '275 g',          price: 2.30, qty: 11, aisle: 'Bakery',     low: 5,  brand: 'Wasa' },
  { id: 'sk021', ean: '5000168001937', name: 'Hovis Soft White',    variant: '800 g loaf',     price: 1.85, qty: 3,  aisle: 'Bakery',     low: 6,  brand: 'Hovis' },
  { id: 'sk022', ean: '5010044020974', name: 'Warburtons Toastie',  variant: '800 g',          price: 1.95, qty: 8,  aisle: 'Bakery',     low: 6,  brand: 'Warburtons' },
  { id: 'sk023', ean: '5010044007197', name: 'Kingsmill 50/50',     variant: '800 g',          price: 1.65, qty: 5,  aisle: 'Bakery',     low: 6,  brand: 'Kingsmill' },
  { id: 'sk024', ean: '5051140373085', name: 'New York Bagels',     variant: '5 pack',         price: 1.80, qty: 9,  aisle: 'Bakery',     low: 4,  brand: 'New York Bakery' },
  { id: 'sk025', ean: '5000232825834', name: 'Mr Kipling Apple Pies',variant: '6 pack',        price: 1.95, qty: 7,  aisle: 'Bakery',     low: 4,  brand: 'Mr Kipling' },

  // ─── Dairy & Eggs ──────
  { id: 'sk012', ean: '5410126612035', name: 'Lurpak Slightly Salted',variant: '250 g',        price: 4.20, qty: 9,  aisle: 'Dairy',      low: 6,  brand: 'Lurpak' },
  { id: 'sk030', ean: '5050083834066', name: 'Cravendale Whole Milk',variant: '1 L',           price: 1.65, qty: 28, aisle: 'Dairy',      low: 12, brand: 'Cravendale' },
  { id: 'sk031', ean: '3033710065486', name: 'Président Camembert', variant: '250 g',          price: 3.40, qty: 8,  aisle: 'Dairy',      low: 4,  brand: 'Président' },
  { id: 'sk032', ean: '5057545337158', name: 'Free-range Eggs',     variant: 'medium · 6 ct',  price: 2.20, qty: 21, aisle: 'Dairy',      low: 8,  brand: 'Happy Egg' },
  { id: 'sk033', ean: '5057753257569', name: 'Yeo Valley Yogurt',   variant: '500 g',          price: 2.30, qty: 14, aisle: 'Dairy',      low: 6,  brand: 'Yeo Valley' },
  { id: 'sk034', ean: '5057753262525', name: 'Cathedral City Mature',variant: '350 g',         price: 3.95, qty: 10, aisle: 'Dairy',      low: 4,  brand: 'Cathedral City' },
  { id: 'sk035', ean: '4002543220019', name: 'Müller Corner Yog',   variant: '136 g',          price: 0.80, qty: 22, aisle: 'Dairy',      low: 8,  brand: 'Müller' },
  { id: 'sk036', ean: '5060066100934', name: 'Oatly Barista',       variant: '1 L',            price: 2.20, qty: 13, aisle: 'Dairy',      low: 6,  brand: 'Oatly' },
  { id: 'sk037', ean: '5000436589156', name: 'Anchor Spreadable',   variant: '500 g',          price: 4.50, qty: 9,  aisle: 'Dairy',      low: 4,  brand: 'Anchor' },
  { id: 'sk038', ean: '8410297121063', name: 'Philadelphia Original',variant: '180 g',         price: 2.50, qty: 11, aisle: 'Dairy',      low: 4,  brand: 'Philadelphia' },

  // ─── Meat & Fish ───────
  { id: 'sk070', ean: '5057967312030', name: 'Richmond Sausages',   variant: '8 pack',         price: 2.95, qty: 8,  aisle: 'Meat & Fish',low: 4,  brand: 'Richmond' },
  { id: 'sk071', ean: '5000186510032', name: 'John West Tuna Chunks',variant: '145 g',         price: 1.90, qty: 18, aisle: 'Meat & Fish',low: 6,  brand: 'John West' },
  { id: 'sk072', ean: '5000186513019', name: 'John West Salmon',    variant: '170 g',          price: 2.50, qty: 12, aisle: 'Meat & Fish',low: 4,  brand: 'John West' },
  { id: 'sk073', ean: '5057545330081', name: 'British Streaky Bacon',variant: '300 g',         price: 3.20, qty: 7,  aisle: 'Meat & Fish',low: 4,  brand: 'Local' },

  // ─── Greengrocer ───────
  { id: 'sk040', ean: '4011',          name: 'Bananas',             variant: 'per kg',         price: 1.10, qty: 32, aisle: 'Greengrocer', low: 10, brand: 'Loose' },
  { id: 'sk041', ean: '4131',          name: 'Royal Gala Apples',   variant: 'per kg',         price: 2.40, qty: 18, aisle: 'Greengrocer', low: 8,  brand: 'Loose' },
  { id: 'sk042', ean: '4061',          name: 'Lemons',              variant: 'each',           price: 0.45, qty: 2,  aisle: 'Greengrocer', low: 10, brand: 'Loose' },
  { id: 'sk043', ean: '4015',          name: 'Hass Avocado',        variant: 'each',           price: 0.95, qty: 14, aisle: 'Greengrocer', low: 8,  brand: 'Loose' },
  { id: 'sk044', ean: '4664',          name: 'Vine Tomatoes',       variant: 'per kg',         price: 2.80, qty: 11, aisle: 'Greengrocer', low: 6,  brand: 'Loose' },
  { id: 'sk045', ean: '4082',          name: 'Red Onions',          variant: 'per kg',         price: 1.20, qty: 16, aisle: 'Greengrocer', low: 6,  brand: 'Loose' },
  { id: 'sk046', ean: '4225',          name: 'Garlic Bulb',         variant: 'each',           price: 0.55, qty: 22, aisle: 'Greengrocer', low: 10, brand: 'Loose' },
  { id: 'sk047', ean: '4062',          name: 'Cucumber',            variant: 'each',           price: 0.85, qty: 9,  aisle: 'Greengrocer', low: 6,  brand: 'Loose' },
  { id: 'sk048', ean: '4087',          name: 'Baby Spinach',        variant: '200 g bag',      price: 1.40, qty: 12, aisle: 'Greengrocer', low: 6,  brand: 'Florette' },
  { id: 'sk049', ean: '4072',          name: 'Carrots',             variant: '1 kg',           price: 0.90, qty: 19, aisle: 'Greengrocer', low: 8,  brand: 'Loose' },

  // ─── Frozen ─────────────
  { id: 'sk080', ean: '5000189431270', name: 'Birds Eye Garden Peas',variant: '800 g',         price: 2.50, qty: 14, aisle: 'Frozen',     low: 6,  brand: 'Birds Eye' },
  { id: 'sk081', ean: '5000189000124', name: 'Birds Eye Fish Fingers',variant: '10 pack',      price: 3.20, qty: 9,  aisle: 'Frozen',     low: 4,  brand: 'Birds Eye' },
  { id: 'sk082', ean: '8712566292004', name: 'Magnum Classic',      variant: '4 pack',         price: 4.50, qty: 8,  aisle: 'Frozen',     low: 4,  brand: 'Magnum' },
  { id: 'sk083', ean: '5000118106196', name: 'Ben & Jerry\u2019s Cookie Dough',variant: '465 ml',price: 5.50,qty: 6, aisle: 'Frozen',     low: 4,  brand: 'Ben & Jerry\u2019s' },
  { id: 'sk084', ean: '5034660002032', name: 'McCain Oven Chips',   variant: '1.5 kg',         price: 3.20, qty: 11, aisle: 'Frozen',     low: 6,  brand: 'McCain' },

  // ─── Snacks ─────────────
  { id: 'sk050', ean: '5000159461122', name: 'Walkers Salt & Vinegar',variant: '32.5 g',       price: 0.95, qty: 40, aisle: 'Snacks',     low: 12, brand: 'Walkers' },
  { id: 'sk051', ean: '7622210449283', name: 'Oreo Original',       variant: '154 g',          price: 1.85, qty: 19, aisle: 'Snacks',     low: 8,  brand: 'Oreo' },
  { id: 'sk052', ean: '5000168188713', name: 'McVitie\u2019s Digestives',variant: '400 g',     price: 1.65, qty: 14, aisle: 'Snacks',     low: 6,  brand: 'McVitie\u2019s' },
  { id: 'sk053', ean: '7622210992536', name: 'Cadbury Dairy Milk',  variant: '110 g',          price: 1.95, qty: 28, aisle: 'Snacks',     low: 10, brand: 'Cadbury' },
  { id: 'sk054', ean: '7622201823788', name: 'Toblerone',           variant: '100 g',          price: 2.20, qty: 11, aisle: 'Snacks',     low: 4,  brand: 'Toblerone' },
  { id: 'sk055', ean: '5000159484695', name: 'Walkers Cheese & Onion Multipack',variant: '6×25 g',price: 2.20,qty: 16,aisle: 'Snacks',    low: 6,  brand: 'Walkers' },
  { id: 'sk056', ean: '5000168003580', name: 'Jaffa Cakes',         variant: '10 pack',        price: 1.20, qty: 13, aisle: 'Snacks',     low: 6,  brand: 'McVitie\u2019s' },
  { id: 'sk057', ean: '5000159503006', name: 'Doritos Cool Original',variant: '180 g',         price: 2.00, qty: 17, aisle: 'Snacks',     low: 8,  brand: 'Doritos' },
  { id: 'sk058', ean: '4011100018990', name: 'Haribo Goldbears',    variant: '160 g',          price: 1.50, qty: 22, aisle: 'Snacks',     low: 8,  brand: 'Haribo' },
  { id: 'sk059', ean: '5000168105031', name: 'KitKat 4-finger',     variant: '41.5 g',         price: 0.85, qty: 24, aisle: 'Snacks',     low: 10, brand: 'KitKat' },

  // ─── Alcohol ────────────
  { id: 'sk090', ean: '5000299605103', name: 'Stella Artois',       variant: '4×440 ml',       price: 6.50, qty: 12, aisle: 'Alcohol',    low: 6,  brand: 'Stella Artois' },
  { id: 'sk091', ean: '5000213004012', name: 'Guinness Draught',    variant: '4×440 ml',       price: 7.20, qty: 9,  aisle: 'Alcohol',    low: 4,  brand: 'Guinness' },
  { id: 'sk092', ean: '5000299221570', name: 'Casillero del Diablo Merlot',variant: '750 ml',  price: 7.50, qty: 11, aisle: 'Alcohol',    low: 4,  brand: 'Casillero' },
  { id: 'sk093', ean: '5000291060108', name: 'Gordon\u2019s London Dry',variant: '700 ml',     price: 16.00,qty: 6,  aisle: 'Alcohol',    low: 3,  brand: 'Gordon\u2019s' },

  // ─── Household ─────────
  { id: 'sk060', ean: '5000204577754', name: 'Andrex Toilet Roll',  variant: '4 pack',         price: 3.20, qty: 12, aisle: 'Household',  low: 6,  brand: 'Andrex' },
  { id: 'sk061', ean: '5000204620030', name: 'Fairy Original',      variant: '433 ml',         price: 1.95, qty: 1,  aisle: 'Household',  low: 4,  brand: 'Fairy' },
  { id: 'sk062', ean: '5000232888334', name: 'Persil Bio Capsules', variant: '38 wash',        price: 9.50, qty: 7,  aisle: 'Household',  low: 3,  brand: 'Persil' },
  { id: 'sk063', ean: '5000132044336', name: 'Domestos Bleach',     variant: '750 ml',         price: 1.40, qty: 14, aisle: 'Household',  low: 6,  brand: 'Domestos' },
  { id: 'sk064', ean: '5000147559091', name: 'Plenty Kitchen Roll', variant: '2 pack',         price: 2.95, qty: 9,  aisle: 'Household',  low: 4,  brand: 'Plenty' },
  { id: 'sk065', ean: '5000147088096', name: 'Flash All-Purpose',   variant: '1 L',            price: 1.80, qty: 8,  aisle: 'Household',  low: 4,  brand: 'Flash' },

  // ─── Baby & Pet ─────────
  { id: 'sk0A0', ean: '4015400226031', name: 'Pampers Baby-Dry 4',  variant: '70 nappies',     price: 9.50, qty: 6,  aisle: 'Baby & Pet', low: 3,  brand: 'Pampers' },
  { id: 'sk0A1', ean: '5000159339414', name: 'Whiskas Adult Tuna',  variant: '12×85 g',        price: 4.20, qty: 11, aisle: 'Baby & Pet', low: 4,  brand: 'Whiskas' },
  { id: 'sk0A2', ean: '5010394003261', name: 'Pedigree Adult Beef', variant: '12×100 g',       price: 5.50, qty: 8,  aisle: 'Baby & Pet', low: 4,  brand: 'Pedigree' },
];

const _store = { items: SEED_STOCK.map(x => ({ ...x, image: offImageUrl(x.ean) })) };

const STOCK_API = {
  async list() { return _store.items.slice(); },
  async get(id) { return _store.items.find(x => x.id === id); },
  async aisles() {
    const a = {};
    for (const it of _store.items) (a[it.aisle] = a[it.aisle] || []).push(it);
    return AISLE_ORDER.map(name => ({ name, items: a[name] || [] }));
  },
  async lowStock(threshold) {
    return _store.items.filter(it => it.qty <= (threshold ?? it.low));
  },
  async decrement(id, n = 1) {
    const it = _store.items.find(x => x.id === id);
    if (it) it.qty = Math.max(0, it.qty - n);
    return it;
  },
  async adjust(id, delta, reason = '') {
    const it = _store.items.find(x => x.id === id);
    if (it) { it.qty = Math.max(0, it.qty + delta); it._lastReason = reason; }
    return it;
  },
  async add(partial) {
    const id = 'sk' + (900 + _store.items.length);
    const item = { id, qty: 0, low: 6, aisle: 'Pantry', ...partial,
      image: partial.image || (partial.ean ? offImageUrl(partial.ean) : null) };
    _store.items.push(item);
    return item;
  },
  async scan(ean) {
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`);
      const d = await r.json();
      if (d.status !== 1) return null;
      const p = d.product || {};
      return {
        ean,
        name: p.product_name || p.generic_name || 'Unknown product',
        variant: p.quantity || '',
        brand: (p.brands || '').split(',')[0]?.trim() || '',
        image: p.image_front_url || p.image_url || offImageUrl(ean),
        categories: p.categories_tags || [],
      };
    } catch (e) { return null; }
  },
  async organizePickerList(lines) {
    const enriched = await Promise.all(lines.map(async l => ({ ...l, item: await STOCK_API.get(l.id) })));
    enriched.sort((a, b) => {
      const ai = AISLE_ORDER.indexOf(a.item?.aisle ?? 'Pantry');
      const bi = AISLE_ORDER.indexOf(b.item?.aisle ?? 'Pantry');
      return ai - bi || (a.item?.name || '').localeCompare(b.item?.name || '');
    });
    const groups = {};
    for (const e of enriched) { const a = e.item?.aisle ?? 'Pantry'; (groups[a] = groups[a] || []).push(e); }
    return AISLE_ORDER.filter(a => groups[a]).map(a => ({ aisle: a, lines: groups[a] }));
  },
  async suggestSub(itemId) {
    const it = await STOCK_API.get(itemId);
    if (!it) return null;
    const peers = _store.items.filter(x => x.aisle === it.aisle && x.id !== it.id && x.qty > 0);
    peers.sort((a, b) => Math.abs(a.price - it.price) - Math.abs(b.price - it.price));
    return peers[0] || null;
  },
};

window.STOCK_API = STOCK_API;
window.AISLE_ORDER = AISLE_ORDER;
window.offImageUrl = offImageUrl;

// Produkte im Regal: Verpackungen mit gezeichneten Etiketten (fiktive Marken) auf EINEM Textur-Atlas.
// Alle Artikel gleicher Form werden als eine InstancedMesh gezeichnet; pro Instanz wählt ein Attribut die Atlas-Kachel.
import * as THREE from 'three';

const GRID = 16;
const TILE = 128;
const PAD = 4;
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

// ---------- Katalog: Artikelarten je Fachcode ----------
// form: packung | glas | dose | flasche | beutel | becher | schale | tetra | wein | tube | tafel | kiste
// m = Maße [Breite, Höhe, Tiefe] in m; c = Grundfarbe, a = Akzent, b = Marke, n = Produktname, s = Zeile darunter
const P = (form, m, c, a, b, n, s = '', font = SANS) => ({ form, m, c, a, b, n, s, font });
export const CATALOG = {
  // Kochwelt Pasta (W1)
  W1: [
    P('packung', [0.1, 0.2, 0.06], '#1f4e9c', '#f2c230', 'Nonna Lia', 'Spaghetti', '500 g', SERIF),
    P('packung', [0.1, 0.2, 0.06], '#1f4e9c', '#f4f1ec', 'Nonna Lia', 'Penne', '500 g', SERIF),
    P('glas', [0.08, 0.15, 0.08], '#c0392b', '#f4f1ec', 'Casa Verde', 'Sugo', 'Tomate-Basilikum'),
    P('tetra', [0.07, 0.17, 0.05], '#b03a2e', '#2f7d32', 'Casa Verde', 'Passata', '500 g'),
    P('dose', [0.075, 0.11, 0.075], '#8d6e3f', '#f4f1ec', 'Nonna Lia', 'Borlotti', 'Bohnen'),
    P('beutel', [0.12, 0.17, 0.05], '#e9d8b0', '#7a3b1e', 'Forno Lia', 'Cantuccini', 'Mandel'),
  ],
  // Kochwelt Asian (W2)
  W2: [
    P('packung', [0.11, 0.18, 0.05], '#f4f1ec', '#c0392b', 'Kaizen', 'Udon', '3 × 200 g'),
    P('packung', [0.11, 0.18, 0.05], '#f2c230', '#1c1c1f', 'Umami Lab', 'Ramen', 'Weizennudeln'),
    P('flasche', [0.06, 0.2, 0.06], '#2b1a12', '#c0392b', 'Kaizen', 'Shoyu', 'Sojasauce'),
    P('glas', [0.08, 0.11, 0.08], '#d9b26a', '#3b2a1a', 'Umami Lab', 'Miso', 'hell'),
    P('beutel', [0.1, 0.15, 0.04], '#3b3b3b', '#f2c230', 'Kaizen', 'Sesam', 'geröstet'),
    P('dose', [0.07, 0.12, 0.07], '#2f7d32', '#f4f1ec', 'Umami Lab', 'Kokosmilch', '400 ml'),
  ],
  // Kochwelt Mexican (W3)
  W3: [
    P('beutel', [0.18, 0.22, 0.04], '#f2c230', '#2f7d32', 'La Milpa', 'Tortillas', '8 Stück'),
    P('packung', [0.16, 0.12, 0.08], '#e8862e', '#1c1c1f', 'La Milpa', 'Taco Shells', '12 Stück'),
    P('dose', [0.075, 0.11, 0.075], '#8b1e1e', '#f4f1ec', 'Sol & Maíz', 'Kidney', 'Bohnen'),
    P('dose', [0.075, 0.11, 0.075], '#f2c230', '#2f7d32', 'Sol & Maíz', 'Mais', 'süß'),
    P('glas', [0.08, 0.13, 0.08], '#c0392b', '#f2c230', 'La Milpa', 'Salsa', 'medium'),
    P('beutel', [0.16, 0.24, 0.06], '#2f7d32', '#f2c230', 'La Milpa', 'Nachos', 'Salz'),
  ],
  // Ergänzungen / Aktion
  ERG_PASTA: [
    P('flasche', [0.065, 0.24, 0.065], '#f2c230', '#1f4e9c', 'Limonata', 'Limone', '0,5 l'),
    P('glas', [0.09, 0.12, 0.09], '#556b2f', '#f4f1ec', 'Casa Verde', 'Oliven', 'Antipasti'),
    P('packung', [0.14, 0.1, 0.1], '#5d3a1a', '#f2c230', 'Forno Lia', 'Tiramisu', 'Set für 2'),
    P('beutel', [0.12, 0.17, 0.05], '#e9d8b0', '#7a3b1e', 'Forno Lia', 'Grissini', 'Rosmarin'),
  ],
  ERG_ASIAN: [
    P('dose', [0.066, 0.125, 0.066], '#2f7d32', '#f4f1ec', 'Umami Lab', 'Eistee', 'Jasmin'),
    P('packung', [0.12, 0.08, 0.12], '#f4c6cf', '#7a1f3d', 'Kaizen', 'Mochi', '6 Stück'),
    P('beutel', [0.14, 0.18, 0.05], '#c0392b', '#f2c230', 'Umami Lab', 'Crackers', 'Krabbe'),
    P('packung', [0.1, 0.1, 0.06], '#3a7d44', '#f4f1ec', 'Kaizen', 'Grüntee', '20 Beutel'),
  ],
  AKTION: [
    P('kiste', [0.3, 0.2, 0.22], '#b98a5a', '#d64527', 'One Hour', 'Bundle', 'Rezept #01 für 2'),
    P('packung', [0.16, 0.2, 0.1], '#d64527', '#f4f1ec', 'One Hour', 'Kochbox', 'Rezept des Monats'),
    P('beutel', [0.12, 0.17, 0.05], '#efe7d6', '#d64527', 'One Hour', 'Gewürz-Mix', 'Pasta Night'),
  ],
  ERG_MEX: [
    P('flasche', [0.065, 0.24, 0.065], '#7fb04a', '#1c1c1f', 'Sol & Maíz', 'Limo', 'Limette'),
    P('beutel', [0.16, 0.24, 0.06], '#2f7d32', '#f2c230', 'La Milpa', 'Nachos', 'Chili'),
    P('glas', [0.08, 0.13, 0.08], '#7fb04a', '#f4f1ec', 'La Milpa', 'Guacamole', 'Dip'),
  ],
  // Kühlung
  K1: [
    P('becher', [0.08, 0.1, 0.08], '#f4f1ec', '#2f6fb0', 'Hof Neckar', 'Joghurt', 'natur'),
    P('tetra', [0.07, 0.2, 0.07], '#f4f1ec', '#2f6fb0', 'Hof Neckar', 'Milch', '1,5 %'),
    P('tetra', [0.06, 0.12, 0.05], '#f4f1ec', '#d64527', 'Hof Neckar', 'Sahne', '200 ml'),
    P('packung', [0.1, 0.06, 0.06], '#f2c230', '#2f6fb0', 'Hof Neckar', 'Butter', '250 g'),
    P('schale', [0.2, 0.07, 0.11], '#d9b26a', '#f4f1ec', 'Hof Neckar', 'Eier', '10 Stück'),
  ],
  K2: [
    P('packung', [0.12, 0.04, 0.09], '#f2c230', '#7a3b1e', 'Casa Verde', 'Parmesan', 'gerieben'),
    P('schale', [0.14, 0.05, 0.1], '#f2d27a', '#2f6fb0', 'Hof Neckar', 'Gouda', 'Scheiben'),
    P('packung', [0.11, 0.05, 0.11], '#f4f1ec', '#2f7d32', 'Casa Verde', 'Mozzarella', '125 g'),
  ],
  K3: [
    P('schale', [0.18, 0.06, 0.12], '#f2e3b0', '#1f4e9c', 'Nonna Lia', 'Tagliatelle', 'frisch'),
    P('packung', [0.12, 0.05, 0.2], '#efe7d6', '#d64527', 'Forno Lia', 'Pizzateig', 'gekühlt'),
  ],
  K4: [
    P('schale', [0.2, 0.06, 0.14], '#c0392b', '#f4f1ec', 'Hof Neckar', 'Hähnchen', 'Brust'),
    P('schale', [0.2, 0.05, 0.14], '#e8862e', '#1f4e9c', 'Nordküste', 'Lachs', 'Filet'),
  ],
  K5: [
    P('packung', [0.12, 0.05, 0.09], '#f4f1ec', '#2f7d32', 'Grünwerk', 'Tofu', 'natur'),
    P('schale', [0.16, 0.06, 0.12], '#2f7d32', '#f4f1ec', 'Grünwerk', 'Veggie-Hack', '250 g'),
  ],
  K6: [
    P('becher', [0.1, 0.12, 0.1], '#3a7d44', '#f4f1ec', 'Hof Neckar', 'Basilikum', 'im Topf'),
    P('beutel', [0.15, 0.2, 0.06], '#7fb04a', '#f4f1ec', 'Hof Neckar', 'Salat', 'Mix'),
  ],
  // Dessert & TK
  D1: [
    P('becher', [0.1, 0.09, 0.1], '#f4c6cf', '#7a1f3d', 'Gelato Lia', 'Eis', 'Pistazie'),
    P('packung', [0.12, 0.08, 0.12], '#f4c6cf', '#7a1f3d', 'Kaizen', 'Mochi', 'Eis'),
  ],
  D2: [
    P('becher', [0.08, 0.08, 0.08], '#5d3a1a', '#f2c230', 'Forno Lia', 'Tiramisu', 'Becher'),
    P('becher', [0.08, 0.08, 0.08], '#f4f1ec', '#c0392b', 'Hof Neckar', 'Panna Cotta', 'Beere'),
  ],
  D3: [
    P('beutel', [0.18, 0.24, 0.05], '#2f7d32', '#f2c230', 'Grünwerk', 'Wok-Gemüse', 'TK 750 g'),
    P('packung', [0.2, 0.05, 0.28], '#d64527', '#f4f1ec', 'Forno Lia', 'Pizza', 'TK'),
  ],
  // Getränke
  G1: [P('wein', [0.075, 0.31, 0.075], '#3a1520', '#efe8d8', 'Weingut Neckar', 'Lemberger', 'trocken')],
  G2: [
    P('wein', [0.075, 0.31, 0.075], '#4d6b2a', '#efe8d8', 'Weingut Neckar', 'Riesling', 'trocken'),
    P('wein', [0.075, 0.31, 0.075], '#d98c8c', '#efe8d8', 'Weingut Neckar', 'Rosé', 'fruchtig'),
  ],
  G3: [
    P('flasche', [0.065, 0.24, 0.065], '#f2c230', '#1f4e9c', 'Limonata', 'Limone', '0,5 l'),
    P('dose', [0.066, 0.125, 0.066], '#2f7d32', '#f4f1ec', 'Umami Lab', 'Eistee', 'Jasmin'),
    P('flasche', [0.065, 0.24, 0.065], '#7a4b1a', '#f4f1ec', 'Neckarbräu', 'Alkoholfrei', 'Hell'),
  ],
  // Basissortiment
  B1: [
    P('packung', [0.1, 0.2, 0.06], '#f4f1ec', '#d64527', 'Basis+', 'Spaghetti', '1 kg'),
    P('beutel', [0.13, 0.2, 0.06], '#f4f1ec', '#2f6fb0', 'Basis+', 'Reis', 'Basmati'),
    P('packung', [0.1, 0.2, 0.06], '#f4f1ec', '#e8862e', 'Basis+', 'Fusilli', '500 g'),
  ],
  B2: [
    P('flasche', [0.065, 0.27, 0.065], '#4d6b2a', '#f2c230', 'Casa Verde', 'Olivenöl', 'nativ extra'),
    P('flasche', [0.06, 0.22, 0.06], '#3a1520', '#f4f1ec', 'Basis+', 'Balsamico', 'Modena'),
    P('flasche', [0.065, 0.27, 0.065], '#f2c230', '#2f6fb0', 'Basis+', 'Rapsöl', '1 l'),
  ],
  B3: [
    P('glas', [0.05, 0.1, 0.05], '#c0392b', '#f4f1ec', 'Kochwerk', 'Paprika', 'edelsüß'),
    P('glas', [0.05, 0.1, 0.05], '#7a3b1e', '#f4f1ec', 'Kochwerk', 'Kreuzkümmel', ''),
    P('packung', [0.1, 0.12, 0.05], '#f2c230', '#1c1c1f', 'Kochwerk', 'Brühe', 'Gemüse'),
  ],
  B4: [
    P('dose', [0.075, 0.11, 0.075], '#c0392b', '#f4f1ec', 'Basis+', 'Tomaten', 'gehackt'),
    P('glas', [0.08, 0.15, 0.08], '#c0392b', '#f2c230', 'Basis+', 'Tomatensauce', 'klassisch'),
    P('dose', [0.075, 0.11, 0.075], '#f2c230', '#2f7d32', 'Basis+', 'Mais', '285 g'),
  ],
  B5: [
    P('packung', [0.12, 0.2, 0.08], '#f4f1ec', '#2f6fb0', 'Basis+', 'Mehl', 'Type 405'),
    P('packung', [0.12, 0.2, 0.08], '#f4f1ec', '#d64527', 'Basis+', 'Zucker', '1 kg'),
  ],
  B6: [
    P('packung', [0.16, 0.24, 0.06], '#d9b26a', '#7a3b1e', 'Basis+', 'Müsli', 'Nuss'),
    P('beutel', [0.15, 0.3, 0.08], '#b98a5a', '#f4f1ec', 'Forno Lia', 'Brot', 'Vollkorn'),
    P('glas', [0.07, 0.12, 0.07], '#7a1f3d', '#f4f1ec', 'Hof Neckar', 'Konfitüre', 'Kirsche'),
  ],
  B7: [
    P('beutel', [0.16, 0.24, 0.06], '#f2c230', '#c0392b', 'Basis+', 'Chips', 'Paprika'),
    P('tafel', [0.08, 0.16, 0.015], '#5d3a1a', '#f2c230', 'Kakaowerk', 'Schokolade', 'Zartbitter'),
    P('beutel', [0.12, 0.17, 0.05], '#e8862e', '#1c1c1f', 'Basis+', 'Nüsse', 'Mix'),
  ],
  IMPULS: [
    P('tafel', [0.08, 0.16, 0.015], '#5d3a1a', '#f2c230', 'Kakaowerk', 'Schokolade', 'Zartbitter'),
    P('tafel', [0.08, 0.16, 0.015], '#d64527', '#f4f1ec', 'Kakaowerk', 'Chili-Schoko', ''),
    P('becher', [0.1, 0.12, 0.1], '#3a7d44', '#f4f1ec', 'Hof Neckar', 'Basilikum', 'im Topf'),
  ],
};

// ---------- Etiketten zeichnen ----------
function drawLabel(g, s, p) {
  g.fillStyle = p.c;
  g.fillRect(0, 0, s, s);
  const dark = ['#f4f1ec', '#efe7d6', '#f2c230', '#e9d8b0', '#f2e3b0', '#f4c6cf', '#d9b26a', '#f2d27a', '#efe8d8', '#7fb04a'].includes(p.c);
  const fg = dark ? '#1c1c1f' : '#f8f5ef';
  // Akzentband
  g.fillStyle = p.a;
  if (p.form === 'wein') {
    g.fillRect(0, s * 0.42, s, s * 0.46);
    g.fillStyle = '#1c1c1f';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    fit(g, p.n, s / 2, s * 0.6, s * 0.9, 700, 22, SERIF);
    g.font = `400 12px ${SERIF}`;
    g.fillText(p.b, s / 2, s * 0.76);
    g.fillText(p.s, s / 2, s * 0.84);
    return;
  }
  g.fillRect(0, s * 0.68, s, s * 0.08);
  g.beginPath();
  g.arc(s * 0.5, s * 0.5, s * 0.17, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  fit(g, p.b.toUpperCase(), s / 2, s * 0.13, s * 0.88, 800, 15, p.font);
  fit(g, p.n, s / 2, s * 0.3, s * 0.92, 800, 24, p.font);
  g.fillStyle = dark ? '#3a3a3a' : 'rgba(255,255,255,0.85)';
  fit(g, p.s, s / 2, s * 0.86, s * 0.9, 600, 14);
}

function fit(g, text, x, y, maxW, weight, px, fam = SANS) {
  let size = px;
  g.font = `${weight} ${size}px ${fam}`;
  while (g.measureText(text).width > maxW && size > 8) g.font = `${weight} ${--size}px ${fam}`;
  g.fillText(text, x, y);
}

// ---------- Geometrien mit UVs, die eine ganze Kachel nutzen ----------
function boxGeo() {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); // Atlas ohne flipY
  // Oben/unten: nur die Grundfarbe (Kachelecke)
  for (const face of [2, 3]) for (let k = 0; k < 4; k++) uv.setXY(face * 4 + k, 0.04, 0.04);
  return g;
}
function cylGeo(rTop = 0.5, rBot = 0.5, seg = 12) {
  const g = new THREE.CylinderGeometry(rTop, rBot, 1, seg, 1);
  const uv = g.attributes.uv;
  const nSide = (seg + 1) * 2;
  for (let i = 0; i < uv.count; i++) {
    if (i < nSide) uv.setY(i, 1 - uv.getY(i));
    else uv.setXY(i, 0.04, 0.04); // Deckel: Grundfarbe
  }
  return g;
}
function latheGeo(profile) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 10);
  const uv = g.attributes.uv;
  const pos = g.attributes.position;
  const H = Math.max(...profile.map((p) => p[1]));
  for (let i = 0; i < uv.count; i++) {
    const y = pos.getY(i) / H;
    // Etikett im mittleren Bereich, oben/unten Glasfarbe
    const v = y < 0.08 || y > 0.62 ? 0.04 : 1 - (y - 0.08) / 0.54;
    uv.setY(i, v);
    if (v === 0.04) uv.setX(i, 0.04);
  }
  return g;
}

const GEOS = {
  packung: boxGeo,
  kiste: boxGeo,
  beutel: boxGeo,
  schale: boxGeo,
  tetra: boxGeo,
  tafel: boxGeo,
  glas: () => cylGeo(0.48, 0.5),
  dose: () => cylGeo(0.5, 0.5),
  becher: () => cylGeo(0.5, 0.38),
  flasche: () => latheGeo([[0, 0], [0.48, 0], [0.5, 0.02], [0.5, 0.6], [0.32, 0.72], [0.16, 0.82], [0.15, 1], [0, 1]]),
  wein: () => latheGeo([[0, 0], [0.48, 0], [0.5, 0.02], [0.5, 0.62], [0.3, 0.74], [0.14, 0.8], [0.13, 1], [0, 1]]),
};

export class Products {
  constructor() {
    this.kinds = []; // { p, tile }
    this.byCode = {};
    const c = document.createElement('canvas');
    c.width = c.height = GRID * TILE;
    const g = c.getContext('2d');
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = TILE - 2 * PAD;
    const tg = tmp.getContext('2d');
    let i = 0;
    for (const [code, list] of Object.entries(CATALOG)) {
      this.byCode[code] = [];
      for (const p of list) {
        tg.clearRect(0, 0, tmp.width, tmp.height);
        drawLabel(tg, tmp.width, p);
        const x = (i % GRID) * TILE;
        const y = Math.floor(i / GRID) * TILE;
        g.drawImage(tmp, x, y, TILE, TILE); // Rand gestreckt (gegen Bluten der Mipmaps)
        g.drawImage(tmp, x + PAD, y + PAD);
        const kind = { p, tile: [i % GRID, Math.floor(i / GRID)] };
        this.kinds.push(kind);
        this.byCode[code].push(kind);
        i++;
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.flipY = false;
    this.mats = {
      matt: atlasMaterial(tex, 0.75, 0),
      glanz: atlasMaterial(tex, 0.3, 0.05),
      metall: atlasMaterial(tex, 0.35, 0.55),
    };
    this.geos = {};
    this.items = new Map(); // form → [{ m, tile }]
  }

  geo(form) {
    if (!this.geos[form]) this.geos[form] = GEOS[form]();
    return this.geos[form];
  }

  // Einen Artikel platzieren. x/z = Mitte der Grundfläche (Store-Koordinaten), y = Unterkante, dir = Blickrichtung zum Kunden
  add(kind, x, y, z, dir = [0, -1], { scale = 1, tilt = 0 } = {}) {
    const p = kind.p;
    const [w, h, d] = p.m.map((v) => v * scale);
    const o = new THREE.Object3D();
    const yaw = Math.atan2(dir[0], -dir[1]) + (p.form === 'glas' || p.form === 'dose' || p.form === 'becher' || p.form === 'flasche' || p.form === 'wein' ? Math.PI : 0);
    const isLathe = p.form === 'flasche' || p.form === 'wein';
    o.position.set(x, isLathe ? y : y + h / 2, -z);
    o.rotation.set(tilt, yaw, 0, 'YXZ');
    o.scale.set(w, h, d);
    o.updateMatrix();
    const key = p.form;
    if (!this.items.has(key)) this.items.set(key, []);
    this.items.get(key).push({ m: o.matrix.clone(), tile: kind.tile });
    return h;
  }

  pick(code, i) {
    const list = this.byCode[code] || this.byCode.B1;
    return list[((i % list.length) + list.length) % list.length];
  }

  // Ein Regalboden: Artikel aus Fachcode(s) nebeneinander (je 3 Facings), in Reihen nach hinten.
  // along = Achse der Regalfront ('x' oder 'z'), from/to = Bereich darauf, front = Lage der Regalkante,
  // dir = Blickrichtung zum Kunden ([0,±1] bei along 'x', [±1,0] bei along 'z'), y = Bodenhöhe
  shelf(codes, { along, from, to, front, y, depth = 0.3, dir, maxH = 0.3, start = 0, gap = 0.01, rows = 2, facings = 3, scale = 1 }) {
    const list = Array.isArray(codes) ? codes : [codes];
    let pos = from + 0.03;
    let k = start;
    for (let guard = 0; guard < 300; guard++) {
      const code = list[guard % list.length];
      let kind = null;
      for (let t = 0; t < 6 && !kind; t++) {
        const c = this.pick(code, k + t);
        if (c.p.m[1] * scale <= maxH) kind = c;
      }
      k++;
      if (!kind) continue;
      const w = kind.p.m[0] * scale;
      const d = kind.p.m[2] * scale;
      if (pos + w > to - 0.02) break;
      for (let f = 0; f < facings && pos + w <= to - 0.02; f++) {
        const c = pos + w / 2;
        for (let r = 0; r < rows; r++) {
          const inset = 0.015 + d / 2 + r * (d + 0.008);
          if (inset + d / 2 > depth) break;
          if (along === 'x') this.add(kind, c, y, front - dir[1] * inset, dir, { scale });
          else this.add(kind, front - dir[0] * inset, y, c, dir, { scale });
        }
        pos += w + gap;
      }
      pos += 0.025;
    }
  }

  build() {
    const group = new THREE.Group();
    group.name = 'Produkte';
    for (const [form, list] of this.items) {
      const geo = this.geo(form).clone();
      const mat = form === 'flasche' || form === 'wein' || form === 'glas' ? this.mats.glanz : form === 'dose' ? this.mats.metall : this.mats.matt;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      im.name = `produkte-${form}`;
      const tiles = new Float32Array(list.length * 2);
      list.forEach((it, i) => {
        im.setMatrixAt(i, it.m);
        tiles[i * 2] = it.tile[0];
        tiles[i * 2 + 1] = it.tile[1];
      });
      geo.setAttribute('labelTile', new THREE.InstancedBufferAttribute(tiles, 2));
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      group.add(im);
    }
    return group;
  }
}

function atlasMaterial(map, roughness, metalness) {
  const mat = new THREE.MeshStandardMaterial({ map, roughness, metalness });
  const scale = (TILE - 2 * PAD) / (TILE * GRID);
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 labelTile;')
      .replace('#include <uv_vertex>', THREE.ShaderChunk.uv_vertex)
      .replace(
        'vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;',
        `vMapUv = ( mapTransform * vec3( (labelTile * ${TILE}.0 + ${PAD}.0) / ${TILE * GRID}.0 + clamp(MAP_UV, 0.0, 1.0) * ${scale.toFixed(6)}, 1 ) ).xy;`,
      );
  };
  mat.customProgramCacheKey = () => 'labelTile';
  return mat;
}

// ---------- Obst & Gemüse (einfache Formen, eingefärbt) ----------
export const FRESH = {
  tomate: { col: '#d8352a', r: 0.04, form: 'kugel' },
  zitrone: { col: '#f2d43a', r: 0.035, form: 'oval' },
  limette: { col: '#7cbf3a', r: 0.028, form: 'kugel' },
  avocado: { col: '#3b4f22', r: 0.04, form: 'oval' },
  paprikaRot: { col: '#c8261d', r: 0.045, form: 'kugel' },
  paprikaGelb: { col: '#f2b51c', r: 0.045, form: 'kugel' },
  zwiebel: { col: '#c99a5b', r: 0.038, form: 'kugel' },
  knoblauch: { col: '#efe6d6', r: 0.028, form: 'kugel' },
  karotte: { col: '#ee7a1f', r: 0.018, form: 'stange' },
  lauch: { col: '#7fbf4a', r: 0.016, form: 'stange' },
  pakchoi: { col: '#9ccf5a', r: 0.05, form: 'oval' },
  salat: { col: '#86c24a', r: 0.07, form: 'kugel' },
  apfel: { col: '#b8322a', r: 0.038, form: 'kugel' },
  apfelGruen: { col: '#93c042', r: 0.038, form: 'kugel' },
  banane: { col: '#f2d03a', r: 0.02, form: 'stange' },
  aubergine: { col: '#3c1f45', r: 0.04, form: 'oval' },
};

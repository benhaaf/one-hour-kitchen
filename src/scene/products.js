// Produkte im Regal: Verpackungen mit gezeichneten Etiketten (fiktive Marken) auf EINEM Textur-Atlas.
// Alle Artikel gleicher Form werden als eine InstancedMesh gezeichnet; pro Instanz wählt ein Attribut die Atlas-Kachel.
import * as THREE from 'three';

const GRID = 16;
const TILE = 128;
const PAD = 4;
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

import { CATALOG, BRANDS } from './catalog.js';
export { CATALOG };

// ---------- Etiketten zeichnen: Markenstil + Produktfenster (zeigt, was drin ist) ----------
const VISUALS = [
  [/spaghetti|linguine/, 'strang'],
  [/penne|ditalini|fusilli|couscous/, 'nudelkurz'],
  [/tagliatelle|tortellini|gnocchi/, 'frischpasta'],
  [/udon|ramen|soba|mie|reisnudel/, 'welle'],
  [/passata|pomodori|tomat|sugo|arrabbiata|salsa$|^salsa /, 'tomate'],
  [/borlotti|cannellini|kidney|bohnen|kichererbsen|linsen|refried/, 'bohnen'],
  [/reis/, 'reis'],
  [/mais/, 'mais'],
  [/oliven|kapern|artischock/, 'oliven'],
  [/pesto|basilikum|koriander|salat|rucola|oregano|salsa verde|guacamole|edamame|wok/, 'blatt'],
  [/brühe/, 'wuerfel'],
  [/paprika|chili|kreuzkümmel|pfeffer|gewürz|zitronenpfeffer/, 'pulver'],
  [/parmigiano|gouda|cheddar|mozzarella|feta|käse|cheese/, 'kaese'],
  [/milch|joghurt|sahne|schmand|crème|horchata/, 'milch'],
  [/butter/, 'butter'],
  [/eier/, 'eier'],
  [/hähnchen|lachs|hack|pancetta|garnelen|thunfisch/, 'fleisch'],
  [/tofu|tempeh/, 'tofu'],
  [/espresso|kaffee|kakao|zartbitter|schoko|mousse|tiramisu/, 'kakao'],
  [/cantuccini|amaretti|savoiardi|kekse|grissini|taralli|ciabatta|focaccia|brot|müsli|hafer|riegel|brezeln|churros|cracker|glückskeks/, 'gebaeck'],
  [/chips|nachos|tortilla|taco|wraps/, 'chips'],
  [/gelato|mochi|panna|eis$/, 'eis'],
  [/mehl|zucker|stärke|backpulver|salz/, 'pulverweiss'],
  [/honig|konfitüre/, 'glanz'],
  [/nori|seetang/, 'nori'],
  [/öl/, 'tropfen'],
  [/essig|balsamico|shoyu|hoisin|sriracha|miso/, 'tropfen'],
  [/tee|limo|limone|aranciata|lychee|wasser|helles|sake|aperitivo|eistee/, 'frucht'],
  [/pizza/, 'pizza'],
  [/studentenfutter|nuss/, 'nuss'],
  [/fruchtgummi/, 'frucht'],
];
const visualOf = (p) => (VISUALS.find(([re]) => re.test(p.n.toLowerCase())) || [null, 'kreis'])[1];

// kleiner deterministischer Zufall je Etikett
function rnd(seed) {
  let t = seed;
  return () => ((t = (t * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function drawVisual(g, kind, x, y, w, h, p) {
  const r = rnd(p.n.length * 97 + p.b.length * 13 + Math.round(p.pr * 100));
  const dot = (cx, cy, rx, ry, col, rot = 0) => {
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
  };
  const scatter = (n, fn) => {
    for (let i = 0; i < n; i++) fn(x + r() * w, y + r() * h, i);
  };
  switch (kind) {
    case 'strang':
      g.strokeStyle = '#e8c87a';
      g.lineWidth = 2;
      for (let i = 0; i < 16; i++) {
        g.beginPath();
        g.moveTo(x + 3 + i * (w / 16), y + 2);
        g.lineTo(x + 6 + i * (w / 16), y + h - 2);
        g.stroke();
      }
      break;
    case 'nudelkurz':
      scatter(14, (cx, cy) => dot(cx, cy, 6, 3, r() < 0.5 ? '#e8c87a' : '#d9b25e', r() * 3));
      break;
    case 'frischpasta':
      scatter(9, (cx, cy) => dot(cx, cy, 8, 6, '#efd58e', r() * 3));
      break;
    case 'welle':
      g.strokeStyle = p.n.includes('Soba') ? '#8a6a4a' : '#efe0b0';
      g.lineWidth = 2.5;
      for (let j = 0; j < 6; j++) {
        g.beginPath();
        for (let i = 0; i <= 20; i++) g.lineTo(x + (i / 20) * w, y + 5 + j * (h / 6) + Math.sin(i * 1.3 + j) * 3);
        g.stroke();
      }
      break;
    case 'tomate':
      scatter(5, (cx, cy) => {
        dot(cx, cy, 10, 9, '#c0392b');
        dot(cx - 3, cy - 3, 3, 2, 'rgba(255,255,255,0.35)');
        dot(cx, cy - 8, 3, 2, '#4c7a32');
      });
      break;
    case 'bohnen': {
      const col = /kidney|borlotti/i.test(p.n) ? '#7a2a22' : /schwarz/i.test(p.n) ? '#2a2422' : /kicher|refried/i.test(p.n) ? '#c9a46a' : /linsen/i.test(p.n) ? '#c8642e' : '#efe6d2';
      scatter(18, (cx, cy) => dot(cx, cy, 5, 3.5, col, r() * 3));
      break;
    }
    case 'reis':
      g.fillStyle = '#e9e3d4';
      g.fillRect(x, y, w, h);
      scatter(40, (cx, cy) => dot(cx, cy, 2.5, 1.2, '#ffffff', r() * 3));
      break;
    case 'mais':
      scatter(30, (cx, cy) => dot(cx, cy, 3, 2.6, '#f0c53a'));
      break;
    case 'oliven':
      scatter(8, (cx, cy) => dot(cx, cy, 7, 5, p.n.includes('Artischock') ? '#8a9a5a' : '#556b2f', r() * 3));
      break;
    case 'blatt':
      scatter(9, (cx, cy) => dot(cx, cy, 8, 4, r() < 0.5 ? '#4f7f3a' : '#6b9a45', r() * 3));
      break;
    case 'wuerfel':
      for (let i = 0; i < 3; i++) {
        g.fillStyle = '#c99a3a';
        g.fillRect(x + 6 + i * 16, y + h / 2 - 6, 13, 13);
      }
      break;
    case 'pulver':
      g.fillStyle = p.a;
      g.beginPath();
      g.moveTo(x + 4, y + h - 2);
      g.quadraticCurveTo(x + w / 2, y - 6, x + w - 4, y + h - 2);
      g.fill();
      break;
    case 'pulverweiss':
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(x + 4, y + h - 2);
      g.quadraticCurveTo(x + w / 2, y - 4, x + w - 4, y + h - 2);
      g.fill();
      break;
    case 'kaese':
      g.fillStyle = /cheddar/i.test(p.n) ? '#e8962e' : /mozzarella|feta/i.test(p.n) ? '#fbf8f0' : '#f0d27a';
      g.beginPath();
      g.moveTo(x + 6, y + h - 4);
      g.lineTo(x + w - 6, y + h - 4);
      g.lineTo(x + w - 10, y + 6);
      g.closePath();
      g.fill();
      break;
    case 'milch':
      dot(x + w / 2, y + h / 2, w * 0.38, h * 0.34, '#ffffff');
      dot(x + w / 2 + 8, y + h / 2 - 5, w * 0.16, h * 0.14, '#f2f2ee');
      break;
    case 'butter':
      g.fillStyle = '#f2d77a';
      g.fillRect(x + 10, y + h / 2 - 8, w - 20, 16);
      break;
    case 'eier':
      for (let i = 0; i < 3; i++) dot(x + 12 + i * (w - 24) / 2, y + h / 2, 8, 10, '#e6d2b0');
      break;
    case 'fleisch':
      dot(x + w / 2, y + h / 2, w * 0.38, h * 0.3, /lachs|garnelen/i.test(p.n) ? '#f08a5a' : /thunfisch/i.test(p.n) ? '#c9a37a' : '#d77a7a', 0.2);
      break;
    case 'tofu':
      g.fillStyle = /räucher|tempeh/i.test(p.n) ? '#c49a62' : '#f3eedf';
      g.fillRect(x + 8, y + 6, w - 16, h - 12);
      break;
    case 'kakao':
      dot(x + w / 2, y + h / 2, w * 0.36, h * 0.3, '#4a2c1c');
      dot(x + w / 2 - 6, y + h / 2 - 4, w * 0.1, h * 0.08, 'rgba(255,255,255,0.25)');
      break;
    case 'gebaeck':
      scatter(6, (cx, cy) => dot(cx, cy, 10, 5, r() < 0.5 ? '#d9a95e' : '#c48a46', r() * 3));
      break;
    case 'chips':
      scatter(7, (cx, cy) => {
        g.fillStyle = '#e8bf4a';
        g.beginPath();
        g.moveTo(cx, cy - 8);
        g.lineTo(cx + 8, cy + 6);
        g.lineTo(cx - 8, cy + 6);
        g.fill();
      });
      break;
    case 'eis':
      dot(x + w / 2, y + h / 2 + 2, w * 0.3, h * 0.3, /pistazie/i.test(p.s) ? '#a8c47a' : /mochi/i.test(p.n) ? '#f2c4cf' : '#f6eedc');
      break;
    case 'glanz':
      dot(x + w / 2, y + h / 2, w * 0.32, h * 0.32, /honig/i.test(p.n) ? '#e0a52a' : '#8a1f2a');
      break;
    case 'nori':
      g.fillStyle = '#1a2a1a';
      g.fillRect(x + 6, y + 6, w - 12, h - 12);
      break;
    case 'tropfen':
      g.fillStyle = /öl/i.test(p.n) ? '#c9b23a' : /shoyu|hoisin|balsamico/i.test(p.n) ? '#3a1e12' : /sriracha/i.test(p.n) ? '#c0392b' : /essig/i.test(p.n) ? '#e9dfb0' : '#c9a46a';
      g.beginPath();
      g.moveTo(x + w / 2, y + 2);
      g.quadraticCurveTo(x + w / 2 + 16, y + h - 10, x + w / 2, y + h - 2);
      g.quadraticCurveTo(x + w / 2 - 16, y + h - 10, x + w / 2, y + 2);
      g.fill();
      break;
    case 'frucht': {
      const col = /limo|limette/i.test(p.n + p.s) ? '#a8c43a' : /limone/i.test(p.n) ? '#f0d23a' : /aranciata/i.test(p.n) ? '#f08a2a' : /lychee/i.test(p.n) ? '#f2c4cf' : /tee/i.test(p.n) ? '#c9a24a' : /wasser/i.test(p.n) ? '#bfe0f0' : '#e9c45a';
      dot(x + w / 2 - 8, y + h / 2, 11, 11, col);
      dot(x + w / 2 + 9, y + h / 2 + 3, 9, 9, col);
      break;
    }
    case 'pizza':
      dot(x + w / 2, y + h / 2, w * 0.36, h * 0.38, '#e0b060');
      dot(x + w / 2, y + h / 2, w * 0.3, h * 0.32, '#c0392b');
      scatter(5, (cx, cy) => dot(cx, cy, 4, 4, '#fbf6e8'));
      break;
    case 'nuss':
      scatter(10, (cx, cy) => dot(cx, cy, 5, 4, r() < 0.5 ? '#b07a3e' : '#8a5a2a', r() * 3));
      break;
    default:
      dot(x + w / 2, y + h / 2, w * 0.3, h * 0.3, p.a);
  }
}

function roundRect(g, x, y, w, h, rr) {
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
}

const isLight = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return ((v >> 16) & 255) * 0.299 + ((v >> 8) & 255) * 0.587 + (v & 255) * 0.114 > 150;
};

function drawLabel(g, s, p) {
  const br = BRANDS[p.b] || { st: 'klassik' };
  const fam = br.serif ? SERIF : SANS;
  const fg = isLight(p.c) ? '#1f1d1b' : '#f6f2ea';
  g.fillStyle = p.c;
  g.fillRect(0, 0, s, s);

  if (p.form === 'wein') {
    // Weinetikett: cremefarbenes Rückenetikett in Flaschenmitte, Kapsel oben in Flaschenfarbe
    g.fillStyle = p.a;
    g.fillRect(s * 0.06, s * 0.22, s * 0.88, s * 0.7);
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 1.5;
    g.strokeRect(s * 0.1, s * 0.26, s * 0.8, s * 0.62);
    g.fillStyle = isLight(p.a) ? '#2a1a14' : '#f6f2ea';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `400 11px ${SERIF}`;
    g.fillText(p.b, s / 2, s * 0.36);
    fit(g, p.n, s / 2, s * 0.55, s * 0.76, 700, 22, SERIF);
    g.font = `italic 400 11px ${SERIF}`;
    g.fillText(p.s, s / 2, s * 0.75);
    return;
  }

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // Markenkopf je Stil
  if (br.st === 'eigen') {
    g.fillStyle = p.a;
    g.fillRect(0, 0, s, s * 0.2);
    g.fillStyle = '#ffffff';
    fit(g, p.b.toUpperCase(), s / 2, s * 0.1, s * 0.8, 800, 14);
  } else if (br.st === 'premium') {
    g.strokeStyle = p.a;
    g.lineWidth = 2;
    g.strokeRect(5, 5, s - 10, s - 10);
    g.fillStyle = p.a;
    fit(g, p.b, s / 2, s * 0.12, s * 0.8, 600, 16, SERIF);
  } else if (br.st === 'bio') {
    g.fillStyle = p.a;
    fit(g, p.b, s / 2, s * 0.11, s * 0.7, 800, 14);
    dot(g, s * 0.84, s * 0.12, 11, '#3f6b3a');
    g.fillStyle = '#ffffff';
    g.font = `800 8px ${SANS}`;
    g.fillText('BIO', s * 0.84, s * 0.125);
  } else if (br.st === 'asia') {
    dot(g, s * 0.8, s * 0.16, 12, p.a);
    g.fillStyle = fg;
    fit(g, p.b.toUpperCase(), s * 0.42, s * 0.12, s * 0.66, 800, 13);
  } else if (br.st === 'gewuerz') {
    g.fillStyle = p.a;
    g.fillRect(0, s * 0.72, s, s * 0.28);
    g.fillStyle = fg;
    fit(g, p.b.toUpperCase(), s / 2, s * 0.1, s * 0.8, 700, 12);
  } else {
    g.fillStyle = p.a;
    g.fillRect(0, s * 0.03, s, s * 0.17);
    g.fillStyle = isLight(p.a) ? '#1f1d1b' : '#ffffff';
    fit(g, p.b.toUpperCase(), s / 2, s * 0.115, s * 0.86, 800, 13, fam);
  }
  // Produktname
  g.fillStyle = br.st === 'premium' ? '#f6f2ea' : fg;
  fit(g, p.n, s / 2, s * 0.31, s * 0.9, 800, 22, fam);
  // Produktfenster
  const wx = s * 0.16;
  const wy = s * 0.42;
  const ww = s * 0.68;
  const wh = s * 0.3;
  g.save();
  roundRect(g, wx, wy, ww, wh, 10);
  g.fillStyle = br.st === 'premium' ? '#efe4c6' : 'rgba(255,255,255,0.55)';
  g.fill();
  g.clip();
  drawVisual(g, visualOf(p), wx, wy, ww, wh, p);
  g.restore();
  // Inhalt / Gewicht
  g.fillStyle = br.st === 'gewuerz' ? (isLight(p.a) ? '#1f1d1b' : '#ffffff') : br.st === 'premium' ? p.a : fg;
  fit(g, p.s, s / 2, s * 0.84, s * 0.9, 600, 12);
}

function dot(g, x, y, r, col) {
  g.fillStyle = col;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function fit(g, text, x, y, maxW, weight, px, fam = SANS) {
  let size = px;
  g.font = `${weight} ${size}px ${fam}`;
  while (g.measureText(text).width > maxW && size > 7) g.font = `${weight} ${--size}px ${fam}`;
  g.fillText(text, x, y);
}

// ---------- Preisschild (Regaletikett): Artikel, Preis, Grundpreis ----------
const euro = (v) => v.toFixed(2).replace('.', ',');
export function basePrice(p) {
  const m = /(?:(\d+)\s*×\s*)?(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b/.exec(p.s || '');
  if (!m) return '';
  const n = m[1] ? Number(m[1]) : 1;
  const v = Number(m[2].replace(',', '.')) * n;
  const kgOrL = m[3] === 'g' || m[3] === 'ml' ? v / 1000 : v;
  if (!kgOrL) return '';
  return `1 ${m[3] === 'g' || m[3] === 'kg' ? 'kg' : 'l'} = ${euro(p.pr / kgOrL)} €`;
}
function drawPrice(g, W, H, p) {
  const eigen = (BRANDS[p.b] || {}).st === 'eigen';
  g.fillStyle = '#fbfaf6';
  g.fillRect(0, 0, W, H);
  if (eigen) {
    g.fillStyle = '#b9472f';
    g.fillRect(0, 0, 8, H);
  }
  g.fillStyle = '#1f1d1b';
  g.textAlign = 'left';
  g.textBaseline = 'top';
  fit(g, p.b, 14, 8, W * 0.55, 500, 17);
  fit(g, p.n, 14, 30, W * 0.6, 800, 22);
  fit(g, p.s, 14, 58, W * 0.6, 500, 16);
  g.fillStyle = '#5a5650';
  fit(g, basePrice(p), 14, 96, W * 0.6, 500, 15);
  g.fillStyle = '#1f1d1b';
  g.textAlign = 'right';
  g.textBaseline = 'alphabetic';
  fit(g, euro(p.pr), W - 12, H - 28, W * 0.42, 800, 54);
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
// Etikett nur auf der vorderen Hälfte (u = 0,5 zeigt zum Kunden), hinten Randfarbe – sonst sieht man nur ein Stück Text
const frontU = (u) => Math.min(0.97, Math.max(0.03, (u - 0.27) / 0.46));
function cylGeo(rTop = 0.5, rBot = 0.5, seg = 12) {
  const g = new THREE.CylinderGeometry(rTop, rBot, 1, seg, 1);
  const uv = g.attributes.uv;
  const nSide = (seg + 1) * 2;
  for (let i = 0; i < uv.count; i++) {
    if (i < nSide) uv.setXY(i, frontU(uv.getX(i)), 1 - uv.getY(i));
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
    uv.setX(i, v === 0.04 ? 0.04 : frontU(uv.getX(i)));
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
  oel: () => latheGeo([[0, 0], [0.47, 0], [0.5, 0.02], [0.5, 0.66], [0.42, 0.74], [0.18, 0.84], [0.16, 1], [0, 1]]),
  tag: () => {
    const g = new THREE.PlaneGeometry(1, 1);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
    return g;
  },
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
    // zweiter Atlas mit gleicher Kachelaufteilung: Preisschilder (2:1, gestaucht gezeichnet)
    const pc = document.createElement('canvas');
    pc.width = pc.height = GRID * TILE;
    const pg = pc.getContext('2d');
    const ptmp = document.createElement('canvas');
    ptmp.width = 256;
    ptmp.height = 128;
    const ptg = ptmp.getContext('2d');
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
        drawPrice(ptg, 256, 128, p);
        pg.drawImage(ptmp, x, y, TILE, TILE);
        pg.drawImage(ptmp, x + PAD, y + PAD, TILE - 2 * PAD, TILE - 2 * PAD);
        const kind = { p, tile: [i % GRID, Math.floor(i / GRID)] };
        this.kinds.push(kind);
        this.byCode[code].push(kind);
        i++;
      }
    }
    // Regalstopper („Wobbler“): Bio, Regional, Aktion, Neu – Kacheln hinter den Artikeln im Preis-Atlas
    this.wobbler = {};
    const wt = document.createElement('canvas');
    wt.width = 192;
    wt.height = 128;
    const wg = wt.getContext('2d');
    for (const [key, bg, fg, t1, t2] of [
      ['bio', '#3f6b3a', '#ffffff', 'BIO', 'kontrolliert'],
      ['regional', '#2f5d6b', '#ffffff', 'REGIONAL', 'vom Neckar'],
      ['aktion', '#b8322a', '#f6d85a', 'AKTION', 'diese Woche'],
      ['neu', '#1f2120', '#d9b85a', 'NEU', 'im Sortiment'],
    ]) {
      wg.fillStyle = bg;
      wg.fillRect(0, 0, 192, 128);
      wg.strokeStyle = 'rgba(255,255,255,0.5)';
      wg.lineWidth = 4;
      wg.strokeRect(6, 6, 180, 116);
      wg.fillStyle = fg;
      wg.textAlign = 'center';
      wg.textBaseline = 'middle';
      fit(wg, t1, 96, 52, 170, 800, 50);
      fit(wg, t2, 96, 96, 170, 500, 22);
      const x = (i % GRID) * TILE;
      const y = Math.floor(i / GRID) * TILE;
      pg.drawImage(wt, x, y, TILE, TILE);
      this.wobbler[key] = [i % GRID, Math.floor(i / GRID)];
      i++;
    }
    this.wobbleCount = new Map();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.flipY = false;
    const ptex = new THREE.CanvasTexture(pc);
    ptex.colorSpace = THREE.SRGBColorSpace;
    ptex.anisotropy = 8;
    ptex.flipY = false;
    this.mats = {
      preis: atlasMaterial(ptex, 0.55, 0, THREE.DoubleSide),
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
    const round = p.form === 'glas' || p.form === 'dose' || p.form === 'becher' || p.form === 'flasche' || p.form === 'wein' || p.form === 'oel';
    const yaw = Math.atan2(dir[0], -dir[1]) + (round ? Math.PI : 0);
    const isLathe = p.form === 'flasche' || p.form === 'wein' || p.form === 'oel';
    o.position.set(x, isLathe ? y : y + h / 2, -z);
    o.rotation.set(tilt, yaw, 0, 'YXZ');
    o.scale.set(w, h, d);
    o.updateMatrix();
    const key = p.form;
    if (!this.items.has(key)) this.items.set(key, []);
    this.items.get(key).push({ m: o.matrix.clone(), tile: kind.tile });
    return h;
  }

  // Preisschild an der Regalkante (x/z = Mitte, y = Mitte)
  addTag(kind, x, y, z, dir) {
    const o = new THREE.Object3D();
    o.position.set(x, y, -z);
    o.rotation.set(0, Math.atan2(dir[0], -dir[1]), 0);
    o.scale.set(0.064, 0.032, 1);
    o.updateMatrix();
    if (!this.items.has('tag')) this.items.set('tag', []);
    this.items.get('tag').push({ m: o.matrix.clone(), tile: kind.tile });
  }

  // Regalstopper quer zur Regalfront: von beiden Gangrichtungen sichtbar
  addWobbler(tile, x, y, z, dir) {
    const o = new THREE.Object3D();
    o.position.set(x, y, -z);
    o.rotation.set(0, dir[1] !== 0 ? Math.PI / 2 : 0, 0);
    o.scale.set(0.12, 0.08, 1);
    o.updateMatrix();
    if (!this.items.has('tag')) this.items.set('tag', []);
    this.items.get('tag').push({ m: o.matrix.clone(), tile });
  }

  wobblerFor(p) {
    const n = this.wobbleCount.get(p) || 0;
    if (n >= 2) return null; // je Artikel höchstens zwei Stopper im ganzen Laden
    const h = (p.n.length * 31 + p.b.length * 7 + Math.round(p.pr * 100)) % 7;
    let key = null;
    if (p.b === 'Grünwerk') key = 'bio';
    else if (/Neckar/.test(p.b) && h < 4) key = 'regional';
    else if (p.b === 'Basis+' && h < 3) key = 'aktion';
    else if ((p.b === 'Nonna Lia' || p.b === 'Casa Verde' || p.b === 'Kaizen') && h === 1) key = 'neu';
    if (!key) return null;
    this.wobbleCount.set(p, n + 1);
    return this.wobbler[key];
  }

  pick(code, i) {
    const list = this.byCode[code] || this.byCode.B1;
    return list[((i % list.length) + list.length) % list.length];
  }

  // Ein Regalboden: Artikel aus Fachcode(s) nebeneinander (je 3 Facings), in Reihen nach hinten.
  // along = Achse der Regalfront ('x' oder 'z'), from/to = Bereich darauf, front = Lage der Regalkante,
  // dir = Blickrichtung zum Kunden ([0,±1] bei along 'x', [±1,0] bei along 'z'), y = Bodenhöhe
  shelf(codes, { along, from, to, front, y, depth = 0.3, dir, maxH = 0.3, start = 0, gap = 0.006, rows = 2, facings = null, scale = 1, tags = true, tagOut = 0.012, tagDy = -0.045 }) {
    const list = Array.isArray(codes) ? codes : [codes];
    let pos = from + 0.02;
    let k = start;
    const placed = new Set();
    for (let guard = 0; guard < 300; guard++) {
      const code = list[guard % list.length];
      let kind = null;
      for (let t = 0; t < 8 && !kind; t++) {
        const c = this.pick(code, k + t);
        if (c.p.m[1] * scale <= maxH && !placed.has(c)) kind = c;
      }
      // alle passenden Artikel schon im Fach → mit der Liste von vorn weitermachen (größere Facings)
      if (!kind) {
        placed.clear();
        for (let t = 0; t < 8 && !kind; t++) {
          const c = this.pick(code, k + t);
          if (c.p.m[1] * scale <= maxH) kind = c;
        }
      }
      k++;
      if (!kind) continue;
      placed.add(kind);
      const w = kind.p.m[0] * scale;
      const d = kind.p.m[2] * scale;
      if (pos + w > to - 0.015) break;
      const n = facings ?? kind.p.f ?? 3;
      const blockStart = pos;
      for (let f = 0; f < n && pos + w <= to - 0.015; f++) {
        const c = pos + w / 2;
        // Tiefe ganz auffüllen (echte Regale sind nach hinten voll)
        for (let r = 0; r < rows + 1; r++) {
          const inset = 0.012 + d / 2 + r * (d + 0.004);
          if (inset + d / 2 > depth) break;
          if (along === 'x') this.add(kind, c, y, front - dir[1] * inset, dir, { scale });
          else this.add(kind, front - dir[0] * inset, y, c, dir, { scale });
        }
        pos += w + gap;
      }
      if (tags && pos - blockStart > 0.05) {
        const c = blockStart + 0.034; // Etikett links unter dem Artikel, wie im Handel üblich
        if (along === 'x') this.addTag(kind, c, y + tagDy, front + dir[1] * tagOut, dir);
        else this.addTag(kind, front + dir[0] * tagOut, y + tagDy, c, dir);
        const wob = tags && y > 0.7 && y < 1.6 && this.wobblerFor(kind.p); // Stopper in Sicht- und Greifhöhe
        if (wob) {
          const out = tagOut + 0.065;
          const wx = blockStart + 0.004;
          if (along === 'x') this.addWobbler(wob, wx, y + tagDy + 0.035, front + dir[1] * out, dir);
          else this.addWobbler(wob, front + dir[0] * out, y + tagDy + 0.035, wx, dir);
        }
      }
      pos += 0.012;
    }
  }

  build() {
    const group = new THREE.Group();
    group.name = 'Produkte';
    for (const [form, list] of this.items) {
      const geo = this.geo(form).clone();
      const mat = form === 'tag' ? this.mats.preis : form === 'flasche' || form === 'wein' || form === 'oel' || form === 'glas' ? this.mats.glanz : form === 'dose' ? this.mats.metall : this.mats.matt;
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

function atlasMaterial(map, roughness, metalness, side = THREE.FrontSide) {
  const mat = new THREE.MeshStandardMaterial({ map, roughness, metalness, side });
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
  tomate: { col: '#c23a2c', r: 0.04, form: 'kugel' },
  zitrone: { col: '#e6c83a', r: 0.035, form: 'oval' },
  limette: { col: '#7aa83e', r: 0.028, form: 'kugel' },
  avocado: { col: '#3b4f22', r: 0.04, form: 'oval' },
  paprikaRot: { col: '#c8261d', r: 0.045, form: 'kugel' },
  paprikaGelb: { col: '#e0a82a', r: 0.045, form: 'kugel' },
  zwiebel: { col: '#c99a5b', r: 0.038, form: 'kugel' },
  knoblauch: { col: '#efe6d6', r: 0.028, form: 'kugel' },
  karotte: { col: '#d9702a', r: 0.018, form: 'stange' },
  lauch: { col: '#7aa84a', r: 0.016, form: 'stange' },
  pakchoi: { col: '#8fbb5a', r: 0.05, form: 'oval' },
  salat: { col: '#7fae4a', r: 0.07, form: 'kugel' },
  apfel: { col: '#b8322a', r: 0.038, form: 'kugel' },
  apfelGruen: { col: '#8fb04a', r: 0.038, form: 'kugel' },
  banane: { col: '#e6c64a', r: 0.02, form: 'stange' },
  aubergine: { col: '#3c1f45', r: 0.04, form: 'oval' },
};

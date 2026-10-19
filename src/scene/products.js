// Produkte im Regal: Verpackungen mit gezeichneten Etiketten (fiktive Marken) auf EINEM Textur-Atlas.
// Alle Artikel gleicher Form werden als eine InstancedMesh gezeichnet; pro Instanz wählt ein Attribut die Atlas-Kachel.
import * as THREE from 'three';

// Atlas-Raster wächst mit dem Sortiment (ca. 500 Artikel → 23 × 23 Kacheln)
const PAD = 4;
const PTILE = 64; // Preisschild-Atlas: kleinere Kacheln
const PPAD = 2;
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

import { CATALOG, BRANDS, planFace } from './catalog.js';
export { CATALOG };
const COUNT = Object.values(CATALOG).reduce((n, l) => n + l.length, 0) + 4;
const GRID = Math.ceil(Math.sqrt(COUNT));
// Atlas bleibt unter 4096 px (maximale Texturgröße vieler GPUs)
const TILE = Math.min(144, Math.floor(4096 / GRID));
// Hat die Warengruppe Großpackungen, bekommt der unterste Boden nur diese; sonst gehören alle Böden den Normalgrößen
export function planShelf(code, nLevels) {
  const hasBulk = (CATALOG[code] || []).some((p) => p.g);
  const plan = planFace(code, hasBulk ? nLevels - 1 : nLevels);
  return plan;
}

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

// ---------- Etiketten: eigene Gestaltung je Marke (klassisch, ruhig – wie echte Markenartikel) ----------
// Logische Zeichenfläche 120 × 120; der Atlas skaliert sie auf die Kachelgröße.
const L = 120;

const FILL = { tomate: '#9c2f27', blatt: '#4f6b2a', oliven: '#55603a', glanz: '#c58a2a', bohnen: '#c9a46a', kaese: '#e8d9a6', kakao: '#4a2c1c', tropfen: '#3a1e12', frucht: '#e9c45a', milch: '#f3f0e8' };
const CAPS = {
  glas: { 'Casa Verde': '#9a7d3a', 'Pomodoro Rossa': '#8f2a22', 'Basis+': '#d9d6cf', Kochwerk: '#2b2c30', 'Umami Lab': '#1f2120', 'La Milpa': '#3f5e3a', 'Sol & Maíz': '#7f2620', 'Hof Neckar': '#3e6a96', 'Nonna Lia': '#1e3d6e', Kaizen: '#1f2120' },
  flasche: { 'Casa Verde': '#9a7d3a', Kaizen: '#b8322a', 'Umami Lab': '#1f2120', Limonata: '#b89a3a', Neckarquelle: '#3e6a96', Neckarbräu: '#b89a3a', 'Basis+': '#3f6b3a', 'Sol & Maíz': '#2f5d3a' },
};
export function capOf(p) {
  if (p.cap) return p.cap;
  if (p.form === 'dose') return '#b9bbbd';
  if (p.form === 'wein') return isLight(p.c) ? '#c9b27a' : '#5a1f22';
  if (p.form === 'becher') return isLight(p.a) ? p.a : '#efebe3';
  if (p.form === 'tetra') return '#f3f0e8';
  if (p.form === 'oel' || p.form === 'flasche') return CAPS.flasche[p.b] || '#2b2c30';
  if (p.form === 'glas') return CAPS.glas[p.b] || '#8a8378';
  return p.c;
}
export function baseOf(p) {
  if (p.form === 'glas') return FILL[visualOf(p)] || p.c;
  return p.c;
}

function center(g, text, y, maxW, weight, px, fam = SANS, col) {
  if (col) g.fillStyle = col;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  fit(g, text, L / 2, y, maxW, weight, px, fam);
}

function window_(g, x, y, w, h, p, { r = 8, bg = 'rgba(255,255,255,0.6)', ellipse = false } = {}) {
  g.save();
  if (ellipse) {
    g.beginPath();
    g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else roundRect(g, x, y, w, h, r);
  g.fillStyle = bg;
  g.fill();
  g.clip();
  drawVisual(g, visualOf(p), x, y, w, h, p);
  g.restore();
}

const STYLES = {
  // Premium-Pasta (à la Barilla): tiefblau, cremefarbenes Oval mit Serifenschrift, Sichtfenster unten
  premium(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    center(g, p.b, 13, 96, 400, 13, SERIF, p.a);
    g.fillStyle = '#f3ead2';
    g.beginPath();
    g.ellipse(L / 2, 44, 52, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#b8323a';
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(L / 2, 44, 48, 18, 0, 0, Math.PI * 2);
    g.stroke();
    center(g, p.n, 44, 86, 700, 17, SERIF, p.c);
    window_(g, 22, 72, 76, 28, p, { r: 4, bg: '#efe4c6' });
    center(g, p.s, 110, 100, 500, 10, SANS, '#e9e2cf');
  },
  // Feinkost (à la Mutti/Bertolli): Creme mit Doppelrahmen, Medaillon, Serifen
  feinkost(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.strokeStyle = p.a;
    g.lineWidth = 2;
    g.strokeRect(5, 5, L - 10, L - 10);
    g.lineWidth = 0.8;
    g.strokeRect(9, 9, L - 18, L - 18);
    center(g, p.b, 21, 92, 'italic 400', 13, SERIF, p.a);
    center(g, p.n, 40, 96, 700, 15, SERIF, isLight(p.c) ? '#2a2420' : '#f3ead2');
    window_(g, 34, 52, 52, 40, p, { ellipse: true, bg: '#fbf6ea' });
    g.fillStyle = p.a;
    g.fillRect(9, 98, L - 18, 13);
    center(g, p.s, 104.5, 96, 500, 9, SANS, isLight(p.a) ? '#2a2420' : '#f6f0e2');
  },
  // Zweite Premium-Pasta (à la De Cecco): hellgelb, blaues Band, Wappen-Medaillon
  molino(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = p.a;
    g.fillRect(0, 0, L, 26);
    center(g, p.b, 14, 100, 'italic 400', 13, SERIF, '#efe1b8');
    g.fillStyle = '#c9a227';
    g.fillRect(0, 26, L, 2);
    dot(g, L / 2, 46, 13, p.a);
    dot(g, L / 2, 46, 10, '#efe1b8');
    center(g, 'M', 47, 20, 400, 13, SERIF, p.a);
    center(g, p.n, 70, 104, 700, 16, SERIF, p.a);
    window_(g, 24, 80, 72, 22, p, { r: 3, bg: '#f6ecd0' });
    center(g, p.s, 111, 100, 500, 9, SANS, p.a);
  },
  // Klassische Marke (à la Mutti rot / Ritter Sport): Vollfarbe, großer Schriftzug, Bildband
  klassik(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    center(g, p.b, 15, 100, 'italic 700', 16, SERIF, p.a);
    g.fillStyle = p.a;
    g.fillRect(0, 30, L, 2);
    window_(g, 0, 36, L, 38, p, { r: 0, bg: 'rgba(255,255,255,0.18)' });
    g.fillStyle = p.a;
    g.fillRect(0, 76, L, 2);
    center(g, p.n, 90, 104, 800, 16, SANS, isLight(p.c) ? '#1f1d1b' : '#ffffff');
    center(g, p.s, 108, 100, 500, 10, SANS, isLight(p.c) ? '#3a3632' : '#efe7d6');
  },
  // Eigenmarke (à la Gut & Günstig): weiß, schlicht, farbiger Balken unten
  eigen(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = p.a;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    fit(g, p.b, 10, 13, 60, 800, 12);
    center(g, p.n, 34, 104, 700, 17, SANS, '#2b2c30');
    window_(g, 18, 48, 84, 38, p, { r: 6, bg: '#efece6' });
    g.fillStyle = p.a;
    g.fillRect(0, 96, L, 24);
    center(g, p.s, 108, 104, 600, 11, SANS, '#ffffff');
  },
  // Bio (à la Alnatura): Kraftpapier, Blatt, Kleinschreibung, Bio-Siegel
  bio(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = '#4f6b45';
    g.beginPath();
    g.ellipse(17, 15, 8, 4, -0.6, 0, Math.PI * 2);
    g.fill();
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    fit(g, p.b.toLowerCase(), 28, 15, 60, 600, 13);
    dot(g, 100, 16, 10, '#5b8a3a');
    g.fillStyle = '#fff';
    g.font = `800 7px ${SANS}`;
    g.textAlign = 'center';
    g.fillText('BIO', 100, 16.5);
    center(g, p.n, 38, 104, 600, 15, SANS, '#2e3a28');
    window_(g, 20, 50, 80, 40, p, { ellipse: true, bg: '#efe6d0' });
    center(g, p.s, 104, 104, 500, 10, SANS, '#4a4436');
  },
  // Gewürze (à la Ostmann): dunkel, rundes Fenster mit Gewürzfarbe
  gewuerz(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    center(g, p.b.toUpperCase(), 12, 90, 700, 9, SANS, '#cbbf9e');
    window_(g, 32, 22, 56, 46, p, { ellipse: true, bg: '#e9e2d0' });
    center(g, p.n, 82, 104, 400, 15, SERIF, '#f3ead2');
    g.fillStyle = p.a;
    g.fillRect(0, 96, L, 24);
    center(g, p.s, 108, 100, 600, 10, SANS, isLight(p.a) ? '#1f1d1b' : '#ffffff');
  },
  // Asia (à la Kikkoman): hell/schwarz, roter Kreis, senkrechter Balken
  asia(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = p.a;
    g.fillRect(0, 0, 16, L);
    dot(g, 98, 20, 11, '#b8322a');
    const fg = isLight(p.c) ? '#1f1d1b' : '#f3ead2';
    g.fillStyle = fg;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    fit(g, p.b.toUpperCase(), 24, 18, 60, 800, 11);
    fit(g, p.n, 24, 40, 90, 700, 16);
    window_(g, 24, 54, 84, 36, p, { r: 3, bg: isLight(p.c) ? '#efe9de' : '#3a3632' });
    g.fillStyle = fg;
    g.textAlign = 'left';
    fit(g, p.s, 24, 104, 90, 500, 10);
  },
  // Mexiko (à la Old El Paso): warme Farben, Stufenmuster oben
  mex(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = p.a;
    for (let x = 0; x < L; x += 12) {
      g.beginPath();
      g.moveTo(x, 10);
      g.lineTo(x + 6, 2);
      g.lineTo(x + 12, 10);
      g.fill();
    }
    g.fillRect(0, 10, L, 3);
    const fg = isLight(p.c) ? '#2a1f18' : '#f6ecd6';
    center(g, p.b, 25, 100, 'italic 700', 14, SERIF, fg);
    center(g, p.n, 42, 104, 800, 15, SANS, fg);
    window_(g, 16, 54, 88, 36, p, { r: 18, bg: 'rgba(255,248,232,0.75)' });
    center(g, p.s, 104, 100, 500, 10, SANS, fg);
  },
  // Regional (à la Weihenstephan): weiß, blaues Karoband, Serifen
  regional(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    for (let x = 0; x < L; x += 6)
      for (let y = 0; y < 12; y += 6) {
        g.fillStyle = (x / 6 + y / 6) % 2 ? p.a : '#ffffff';
        g.fillRect(x, y, 6, 6);
      }
    center(g, p.b, 24, 100, 400, 13, SERIF, p.a === '#3e6a96' || !isLight(p.a) ? p.a : '#3e6a96');
    center(g, p.n, 42, 104, 700, 16, SANS, isLight(p.c) ? '#1f2a3a' : '#ffffff');
    window_(g, 22, 54, 76, 36, p, { r: 6, bg: '#eef1f4' });
    center(g, p.s, 104, 104, 500, 10, SANS, isLight(p.c) ? '#3a4656' : '#f3f0e8');
  },
  // Getränke: ovales Etikett auf Flaschenfarbe
  drink(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    g.fillStyle = p.a === p.c ? '#f3ead2' : p.a;
    g.beginPath();
    g.ellipse(L / 2, L / 2, 50, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#b89a3a';
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(L / 2, L / 2, 46, 42, 0, 0, Math.PI * 2);
    g.stroke();
    const fg = isLight(g.fillStyle) ? '#2a2420' : '#f3ead2';
    center(g, p.b, 34, 76, 'italic 400', 12, SERIF, fg);
    center(g, p.n, 58, 82, 700, 16, SERIF, fg);
    center(g, p.s, 80, 78, 500, 9, SANS, fg);
  },
  // Wein: Flaschenfarbe mit cremefarbenem Etikett
  wein(g, p) {
    g.fillStyle = p.c;
    g.fillRect(0, 0, L, L);
    // Etikett nur im mittleren Drittel der Flasche – darüber und darunter sieht man das Glas
    g.fillStyle = p.a;
    g.fillRect(14, 40, L - 28, 58);
    g.strokeStyle = 'rgba(0,0,0,0.3)';
    g.lineWidth = 1;
    g.strokeRect(18, 44, L - 36, 50);
    const fg = isLight(p.a) ? '#2a1a14' : '#f6f2ea';
    center(g, p.b, 52, 76, 400, 8, SERIF, fg);
    center(g, p.n, 68, 78, 700, 15, SERIF, fg);
    center(g, p.s, 84, 76, 'italic 400', 8, SERIF, fg);
  },
};
const BRAND_STYLE = { molino: 'molino', premium: 'premium', feinkost: 'feinkost', klassik: 'klassik', eigen: 'eigen', bio: 'bio', gewuerz: 'gewuerz', asia: 'asia', mex: 'mex', regional: 'regional', drink: 'drink', wein: 'wein' };

function drawLabel(g, s, p) {
  const br = BRANDS[p.b] || { st: 'klassik' };
  let st = p.form === 'wein' ? 'wein' : BRAND_STYLE[br.st] || 'klassik';
  if (br.st === 'feinkost' && p.form === 'tafel') st = 'klassik';
  g.save();
  g.scale(s / L, s / L);
  STYLES[st](g, p);
  g.restore();
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
  while (g.measureText(text).width > maxW && size > 5) g.font = `${weight} ${--size}px ${fam}`;
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

// ---------- Geometrien: Kachel = oben ein Streifen (links Deckelfarbe, rechts Grundfarbe), darunter das Etikett ----------
const STRIP = 0.1;
const CAP = [0.25, 0.05];
const BASE = [0.75, 0.05];
const lab = (v) => STRIP + v * (1 - STRIP);
// Etikett nur auf der vorderen Hälfte (u = 0,5 zeigt zum Kunden), hinten Randfarbe
const frontU = (u) => Math.min(0.97, Math.max(0.03, (u - 0.27) / 0.46));

function boxGeo({ topCap = false, segY = 1 } = {}) {
  const g = new THREE.BoxGeometry(1, 1, 1, 1, segY, 1);
  const uv = g.attributes.uv;
  const nrm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const ny = nrm.getY(i);
    if (ny > 0.5) uv.setXY(i, ...(topCap ? CAP : BASE));
    else if (ny < -0.5) uv.setXY(i, ...BASE);
    else uv.setY(i, lab(1 - uv.getY(i)));
  }
  return g;
}

// Kissenbeutel (Nudeln, Reis, Chips): bauchig, oben und unten flach verschweißt
function pillowGeo() {
  const g = boxGeo({ segY: 8 });
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.abs(y) * 2;
    const k = t > 0.92 ? 0.12 : 0.25 + 0.75 * Math.sqrt(1 - t * t * 0.9);
    pos.setZ(i, pos.getZ(i) * k);
    pos.setX(i, pos.getX(i) * (t > 0.92 ? 1.03 : 1 - 0.03 * t));
  }
  g.computeVertexNormals();
  return g;
}

// Drehkörper mit Zonen: Etikett [l0, l1], Deckel/Kappe (cap), Rest Grund- bzw. Glasfarbe
function latheZ(profile, { l0, l1, cap = (y) => false }) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 12);
  const uv = g.attributes.uv;
  const pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const y = pos.getY(i);
    if (cap(y)) uv.setXY(i, ...CAP);
    else if (y >= l0 - 1e-4 && y <= l1 + 1e-4) uv.setXY(i, frontU(uv.getX(i)), lab(1 - (y - l0) / (l1 - l0)));
    else uv.setXY(i, ...BASE);
  }
  g.computeVertexNormals();
  return g;
}

const GEOS = {
  packung: () => boxGeo(),
  kiste: () => boxGeo(),
  beutel: pillowGeo,
  schale: () => boxGeo({ topCap: true }),
  tetra: () => boxGeo({ topCap: true }),
  tafel: () => boxGeo(),
  glas: () => latheZ([[0, 0], [0.44, 0], [0.5, 0.03], [0.5, 0.8], [0.45, 0.85], [0.46, 0.86], [0.47, 0.87], [0.47, 0.98], [0.44, 1], [0, 1]], { l0: 0.03, l1: 0.8, cap: (y) => y >= 0.855 }),
  dose: () => latheZ([[0, 0], [0.45, 0], [0.49, 0.015], [0.5, 0.045], [0.5, 0.95], [0.48, 0.985], [0.45, 1], [0, 1]], { l0: 0.045, l1: 0.95, cap: (y) => y < 0.04 || y > 0.955 }),
  becher: () => latheZ([[0, 0], [0.4, 0], [0.5, 0.88], [0.53, 0.9], [0.53, 0.96], [0.5, 1], [0, 1]], { l0: 0, l1: 0.88, cap: (y) => y > 0.885 }),
  flasche: () => latheZ([[0, 0], [0.47, 0], [0.5, 0.02], [0.5, 0.58], [0.4, 0.68], [0.2, 0.77], [0.17, 0.84], [0.19, 0.86], [0.19, 1], [0, 1]], { l0: 0.02, l1: 0.58, cap: (y) => y >= 0.85 }),
  wein: () => latheZ([[0, 0], [0.47, 0], [0.5, 0.02], [0.5, 0.6], [0.42, 0.68], [0.16, 0.76], [0.14, 0.8], [0.15, 1], [0, 1]], { l0: 0.02, l1: 0.6, cap: (y) => y >= 0.79 }),
  oel: () => latheZ([[0, 0], [0.47, 0], [0.5, 0.02], [0.5, 0.68], [0.3, 0.8], [0.17, 0.86], [0.19, 0.88], [0.19, 1], [0, 1]], { l0: 0.02, l1: 0.68, cap: (y) => y >= 0.87 }),
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
    pc.width = pc.height = GRID * PTILE;
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
        const inner = TILE - 2 * PAD;
        const sh = Math.round(inner * 0.1);
        g.drawImage(tmp, x, y + sh, TILE, TILE - sh); // Rand gestreckt (gegen Bluten der Mipmaps)
        g.drawImage(tmp, x + PAD, y + PAD + sh, inner, inner - sh);
        // Streifen oben: Deckel-/Kappenfarbe links, Grund-/Glasfarbe rechts
        g.fillStyle = capOf(p);
        g.fillRect(x, y, TILE / 2, PAD + sh);
        g.fillStyle = baseOf(p);
        g.fillRect(x + TILE / 2, y, TILE / 2, PAD + sh);
        drawPrice(ptg, 256, 128, p);
        const px0 = (i % GRID) * PTILE;
        const py0 = Math.floor(i / GRID) * PTILE;
        pg.drawImage(ptmp, px0, py0, PTILE, PTILE);
        pg.drawImage(ptmp, px0 + PPAD, py0 + PPAD, PTILE - 2 * PPAD, PTILE - 2 * PPAD);
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
      pg.drawImage(wt, (i % GRID) * PTILE, Math.floor(i / GRID) * PTILE, PTILE, PTILE);
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
      preis: atlasMaterial(ptex, 0.55, 0, THREE.FrontSide, PTILE, PPAD),
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
    // Drehkörper starten bei y = 0 (Boden) – alle Geometrien sind auf 0..1 normiert
    const yaw = Math.atan2(dir[0], -dir[1]) + (round ? Math.PI : 0);
    const isLathe = round;
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
    // zwei Flächen Rücken an Rücken, damit die Schrift von beiden Seiten lesbar ist
    if (!this.items.has('tag')) this.items.set('tag', []);
    for (const flip of [0, Math.PI]) {
      o.rotation.set(0, (dir[1] !== 0 ? Math.PI / 2 : 0) + flip, 0);
      o.scale.set(0.12, 0.08, 1);
      o.updateMatrix();
      const off = new THREE.Vector3(0, 0, flip ? -0.001 : 0.001).applyEuler(o.rotation);
      const mm = o.matrix.clone();
      mm.elements[12] += off.x;
      mm.elements[14] += off.z;
      this.items.get('tag').push({ m: mm, tile });
    }
  }

  wobblerFor(p) {
    const n = this.wobbleCount.get(p) || 0;
    if (n >= 2) return null; // je Artikel höchstens zwei Stopper im ganzen Laden
    const h = (p.n.length * 31 + p.b.length * 7 + Math.round(p.pr * 100)) % 7;
    let key = null;
    if (p.b === 'Grünwerk' && h < 2) key = 'bio';
    else if (/Neckar/.test(p.b) && h < 4) key = 'regional';
    // keine Aktions- oder Neu-Stopper: nur Bio- und Regional-Kennzeichnung
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

  // Ganze Regalfront nach Planogramm bestücken (keine Wiederholungen: jede Sorte steht genau einmal, mit Facings).
  // levels: Böden von oben nach unten [{ y, maxH, depth }]; der unterste Boden nimmt Großpackungen auf, falls vorhanden.
  placeFace(code, { along, from, to, front, dir, levels, tagOut = 0.008, tagDy = -0.045, gap = 0.005, rows = 3, reverse = false, maxFacings = 3 }) {
    const plan = planShelf(code, levels.length);
    const W = to - from;
    const kindOf = new Map((this.byCode[code] || []).map((k) => [k.p, k]));
    const row = (items, a1, a2, lv) => {
      if (!items.length) return;
      // Facings verteilen: jede Sorte erst einmal, dann reihum die schmalsten Bestände auffüllen (max. 3),
      // verbleibender Platz wird gleichmäßig als Luft zwischen die Sorten gelegt – keine Lücken-Inseln
      const L = a2 - a1;
      const raw = items.map((p) => p.m[0] * Math.min(1, lv.maxH / p.m[1]));
      const sum0 = raw.reduce((s, x) => s + x + gap, 0);
      const shrink = Math.min(1, L / sum0);
      const ws = raw.map((x) => x * shrink);
      const nf = items.map(() => 1);
      const width = () => ws.reduce((s, x, i) => s + nf[i] * (x + gap), 0);
      let used0 = width();
      for (let pass = 0; pass < maxFacings; pass++) {
        const order = ws.map((x, i) => i).sort((a, b) => ws[a] - ws[b]);
        let grew = false;
        for (const i of order) {
          if (nf[i] < maxFacings && used0 + ws[i] + gap <= L) { nf[i]++; used0 += ws[i] + gap; grew = true; }
        }
        if (!grew) break;
      }
      const air = (L - used0) / items.length;
      let s1 = a1;
      items.forEach((p, i) => {
        const slot = nf[i] * (ws[i] + gap) + air;
        const k = kindOf.get(p);
        if (!k) { s1 += slot; return; }
        const sc = Math.min(1, lv.maxH / p.m[1]) * shrink;
        const w = p.m[0] * sc;
        const d = p.m[2] * sc;
        const n = nf[i];
        const used = n * w + (n - 1) * gap;
        let pos = s1 + (slot - used) / 2;
        for (let f = 0; f < n; f++) {
          const c = pos + w / 2;
          for (let r = 0; r < rows; r++) {
            const inset = 0.012 + d / 2 + r * (d + 0.004);
            if (inset + d / 2 > lv.depth) break;
            const fr = lv.front ?? front;
            if (along === 'x') this.add(k, c, lv.y, fr - dir[1] * inset, dir, { scale: sc });
            else this.add(k, fr - dir[0] * inset, lv.y, c, dir, { scale: sc });
          }
          pos += w + gap;
        }
        const tx = s1 + Math.min(0.04, slot / 2);
        const fr0 = lv.front ?? front;
        if (along === 'x') this.addTag(k, tx, lv.y + tagDy, fr0 + dir[1] * tagOut, dir);
        else this.addTag(k, fr0 + dir[0] * tagOut, lv.y + tagDy, tx, dir);
        const wob = lv.y > 0.7 && lv.y < 1.6 && this.wobblerFor(p);
        if (wob) {
          const out = tagOut + 0.065;
          if (along === 'x') this.addWobbler(wob, s1 + 0.004, lv.y + tagDy + 0.035, fr0 + dir[1] * out, dir);
          else this.addWobbler(wob, fr0 + dir[0] * out, lv.y + tagDy + 0.035, s1 + 0.004, dir);
        }
        s1 += slot;
      });
    };
    // Anlass-Blöcke nebeneinander (Reihenfolge günstig → besonders; die Gondel dreht sie so, dass aus Kundensicht „besonders“ links steht), Sorten je Block auf die Böden verteilt
    if (reverse) plan.blocks = plan.blocks.slice().reverse();
    let a = from;
    for (const bl of plan.blocks) {
      const a2 = a + bl.w * W;
      bl.levels.forEach((items, li) => row(items, a + 0.005, a2 - 0.005, levels[li]));
      a = a2;
    }
    if (plan.bulk.length) row(plan.bulk, from, to, levels[levels.length - 1]);
    return plan;
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

function atlasMaterial(map, roughness, metalness, side = THREE.FrontSide, T = TILE, P = PAD) {
  const mat = new THREE.MeshStandardMaterial({ map, roughness, metalness, side });
  const scale = (T - 2 * P) / (T * GRID);
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 labelTile;')
      .replace('#include <uv_vertex>', THREE.ShaderChunk.uv_vertex)
      .replace(
        'vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;',
        `vMapUv = ( mapTransform * vec3( (labelTile * ${T}.0 + ${P}.0) / ${T * GRID}.0 + clamp(MAP_UV, 0.0, 1.0) * ${scale.toFixed(6)}, 1 ) ).xy;`,
      );
  };
  mat.customProgramCacheKey = () => `labelTile-${T}`;
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

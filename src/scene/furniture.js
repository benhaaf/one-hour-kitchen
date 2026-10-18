// Möbel und Warenträger des Food-Stores „One Hour Kitchen“ aus layout.json (Typ → Bauanleitung).
import * as THREE from 'three';
import { Builder, yawFacing, rng } from './builder.js';
import { signMesh } from './labels.js';
import { CATALOG, WELTEN } from './catalog.js';
import { QR } from './qr.js';
import { AccessoryKit, canvasTex, fitText } from './accessories.js';
import { Decor } from './decor.js';
import { addStaticPerson, randomLook } from './people.js';
import { Products, FRESH } from './products.js';

const std = (color, roughness = 0.8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

const MATERIALS = {
  korpus: std(0xd8c2a2, 0.75), // helles Eichenholz
  holz: std(0xb98a5a, 0.7),
  holzDunkel: std(0x6e4a2e, 0.7),
  holzHell: std(0xe2cfb0, 0.7),
  kiste: std(0xc79a62, 0.85),
  weiss: std(0xf1ede6, 0.6),
  grau: std(0x6b6f76, 0.7),
  anthrazit: std(0x2f3136, 0.6),
  schwarz: std(0x151516, 0.5),
  metall: std(0x8d9297, 0.4, 0.6),
  chrom: std(0xc9ccd0, 0.25, 0.9),
  edelstahl: std(0xb9bdc2, 0.32, 0.85),
  stein: std(0x3a3a3c, 0.35, 0.1),
  akzent: std(0x2b2e2c, 0.5, 0.2), // Akzent = Schwarzstahl (Fensterrahmen, Kanten)
  gruen: std(0x4a7340, 0.6),
  gelb: std(0xb08a34, 0.6),
  polster: std(0x7a3b2e, 0.9),
  glas: new THREE.MeshStandardMaterial({ color: 0xcfe3ea, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false }),
  kuehlLicht: new THREE.MeshBasicMaterial({ color: 0xf4f8ff }),
  led: new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
  gitter: std(0x1d1e20, 0.8),
  kuehlwand: std(0xeef1f3, 0.55),
  bildschirm: new THREE.MeshBasicMaterial({ color: 0x9fd3c7 }),
  teller: std(0xf6f3ee, 0.3),
  topf: std(0x55595e, 0.3, 0.8),
  brett: std(0xc79a62, 0.8),
  erde: std(0x3b2a1e, 1),
  // Premium-Ladenbau: Eiche, Räuchereiche, mattschwarzer Stahl; Basis in hellem Metall
  eiche: std(0xa77d52, 0.6),
  eicheDunkel: std(0x4e3a2a, 0.6),
  schwarzMatt: std(0x1d1e20, 0.55, 0.2),
  regalWeiss: std(0xecebe7, 0.5, 0.1),
  regalGrau: std(0xcfcec9, 0.45, 0.3),
  front: std(0x2f3a35, 0.65), // Küchenfronten tiefgrün-grau, matt
  messing: std(0xb39b6b, 0.35, 0.8),
  terrazzo: std(0xd9d4ca, 0.4),
  kupfer: std(0xb87348, 0.35, 0.85),
  kochzone: new THREE.MeshBasicMaterial({ color: 0x5a5d62 }),
  // Gerichte im Schaufenster
  pasta: std(0xe8c27a, 0.55),
  sosseTomate: std(0xc4532f, 0.45),
  basilikum: std(0x3f7a32, 0.6),
  parmesan: std(0xf3ead2, 0.7),
  udon: std(0xe2c98f, 0.45),
  udonSoja: std(0xb98447, 0.45),
  pakchoi: std(0x5e9a3a, 0.6),
  karotte: std(0xd9792e, 0.6),
  schale: std(0x2b2c30, 0.35, 0.1),
  tortilla: std(0xd6a14c, 0.7),
  tortillaDunkel: std(0xa86f32, 0.7),
  kaese: std(0xf0c850, 0.5),
  salsa: std(0xb8322a, 0.5),
  guacamole: std(0x7aa346, 0.6),
};

const G = {
  disc: (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  sphere: new THREE.SphereGeometry(1, 12, 9),
  stick: new THREE.CylinderGeometry(1, 1, 1, 8),
  unit: new THREE.BoxGeometry(1, 1, 1),
};
const E = 0.005;

// ---------- Fertige Gerichte (Schaufenster-Vitrine) ----------
const GERICHT = {
  // #01 Creamy Tomato Pasta: Penne in Tomaten-Sahnesoße, Basilikum, Parmesan
  '#01'(b, x, y, z, r) {
    b.geo('teller', G.disc(0.17, 0.018, 40), x, y + 0.009, z);
    b.geo('sosseTomate', new THREE.SphereGeometry(0.11, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.32, 1), x, y + 0.018, z);
    const penne = new THREE.CylinderGeometry(0.011, 0.011, 0.045, 10, 1, true);
    for (let k = 0; k < 46; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.095;
      const h = 0.032 * (1 - (d / 0.1) ** 2);
      b.geo(r() < 0.55 ? 'sosseTomate' : 'pasta', penne, x + Math.cos(a) * d, y + 0.03 + h, z + Math.sin(a) * d, r() * 6.3, 1.2 + r() * 0.7, r() * 0.6);
    }
    for (let k = 0; k < 4; k++) b.geo('basilikum', new THREE.SphereGeometry(0.022, 10, 6).scale(1, 0.18, 0.6), x + (r() - 0.5) * 0.06, y + 0.068, z + (r() - 0.5) * 0.06, r() * 6.3);
    for (let k = 0; k < 10; k++) b.geo('parmesan', G.box(0.012, 0.003, 0.008), x + (r() - 0.5) * 0.12, y + 0.062 + r() * 0.01, z + (r() - 0.5) * 0.12, r() * 6.3);
  },
  // #04 Gebratene Udon: dunkle Schale, dicke Nudeln, Pak Choi, Karotten
  '#04'(b, x, y, z, r) {
    b.geo('schale', new THREE.CylinderGeometry(0.135, 0.075, 0.075, 36, 1, true), x, y + 0.0375, z);
    b.geo('schale', G.disc(0.075, 0.008, 28), x, y + 0.004, z);
    b.geo('udonSoja', G.disc(0.122, 0.01, 32), x, y + 0.055, z);
    const nudel = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8);
    for (let k = 0; k < 34; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.07;
      b.geo(r() < 0.6 ? 'udon' : 'udonSoja', nudel, x + Math.cos(a) * d, y + 0.065 + r() * 0.025, z + Math.sin(a) * d, r() * 6.3, Math.PI / 2 + (r() - 0.5) * 0.5, 0);
    }
    for (let k = 0; k < 5; k++) b.geo('pakchoi', G.box(0.05, 0.006, 0.03), x + (r() - 0.5) * 0.12, y + 0.095, z + (r() - 0.5) * 0.12, r() * 6.3, (r() - 0.5) * 0.4);
    for (let k = 0; k < 8; k++) b.geo('karotte', G.box(0.04, 0.007, 0.007), x + (r() - 0.5) * 0.12, y + 0.096, z + (r() - 0.5) * 0.12, r() * 6.3);
  },
  // #07 Quesadillas: vier Ecken mit Käse, dazu Salsa und Guacamole
  '#07'(b, x, y, z, r) {
    b.geo('teller', G.disc(0.17, 0.018, 40), x, y + 0.009, z);
    const keil = new THREE.CylinderGeometry(0.085, 0.085, 0.022, 3);
    const pos = [[-0.06, -0.035, 0.3], [0.02, -0.06, 2.4], [0.07, 0.02, 4.4], [-0.02, 0.055, 1.3]];
    pos.forEach(([dx, dz, yaw], k) => {
      b.geo(k % 2 ? 'tortilla' : 'tortillaDunkel', keil, x + dx, y + 0.03 + k * 0.006, z + dz, yaw, 0.08, 0);
      b.geo('kaese', new THREE.CylinderGeometry(0.083, 0.083, 0.006, 3), x + dx, y + 0.03 + k * 0.006, z + dz, yaw, 0.08, 0);
    });
    for (const [dx, mat] of [[-0.11, 'salsa'], [0.11, 'guacamole']]) {
      b.geo('schale', new THREE.CylinderGeometry(0.035, 0.028, 0.03, 20, 1, true), x + dx, y + 0.033, z + 0.1);
      b.geo(mat, G.disc(0.032, 0.012, 20), x + dx, y + 0.042, z + 0.1);
    }
  },
};
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// ---------- kleine Helfer ----------
function plane(parent, material, w, h, x, y, z, dir, pitch = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(x, y, -z);
  m.rotation.set(pitch, yawFacing(dir[0], dir[1]), 0, 'YXZ');
  parent.add(m);
  return m;
}
const lit = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.6, ...opts });
const unlit = (map) => new THREE.MeshBasicMaterial({ map });

function sign(group, text, opts, x, y, z, dir) {
  const m = signMesh(text, opts);
  m.position.set(x, y, -z);
  m.rotation.y = yawFacing(dir[0], dir[1]);
  group.add(m);
  return m;
}

// Lokales Koordinatensystem einer Regalfront: a = entlang der Front, n = Abstand vor der Front
function faceFrame(rect, seite) {
  const [x1, x2, z1, z2] = rect;
  switch (seite) {
    case 'vorne':
      return { along: 'x', from: x1, to: x2, front: z1, dir: [0, -1], at: (a, n) => [a, z1 - n] };
    case 'hinten':
      return { along: 'x', from: x1, to: x2, front: z2, dir: [0, 1], at: (a, n) => [a, z2 + n] };
    case 'links':
      return { along: 'z', from: z1, to: z2, front: x1, dir: [-1, 0], at: (a, n) => [x1 - n, a] };
    default:
      return { along: 'z', from: z1, to: z2, front: x2, dir: [1, 0], at: (a, n) => [x2 + n, a] };
  }
}

// Rechteck auf einer Front: Abschnitt [a1, a2] entlang, Tiefe [n1, n2] ab Front nach innen (negativ = ins Regal)
function faceRect(f, a1, a2, n1, n2) {
  const [p1x, p1z] = f.at(a1, n1);
  const [p2x, p2z] = f.at(a2, n2);
  return [Math.min(p1x, p2x), Math.max(p1x, p2x), Math.min(p1z, p2z), Math.max(p1z, p2z)];
}

// ---------- Texturen ----------
const ANLASS = {
  schnell: { sym: '»', text: 'schnell', sub: '≤ 20 Min.', farbe: '#9c4a34' },
  besonders: { sym: '★', text: 'besonders', sub: 'Menü mit Dessert', farbe: '#6a4f5e' },
  günstig: { sym: '€', text: 'günstig', sub: 'fürs kleine Budget', farbe: '#4f6b45' },
};
// Reihenfolge der Anlass-Zeilen auf der Tafel: besonders oben, darunter schnell, dann günstig
const ANLASS_REIHE = ['besonders', 'schnell', 'günstig'];
// QR-Code zeichnen (Module als Quadrate, mit Ruhezone)
function drawQR(g, rows, x, y, size, { fg = '#1f2120', bg = '#ffffff', quiet = 2 } = {}) {
  if (!rows) return;
  const n = rows.length;
  const m = size / (n + quiet * 2);
  g.fillStyle = bg;
  g.fillRect(x, y, size, size);
  g.fillStyle = fg;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (rows[r][c] === '1') g.fillRect(x + (c + quiet) * m, y + (r + quiet) * m, Math.ceil(m), Math.ceil(m));
}
// Text kürzen, bis er in maxW passt (mit „…“)
function clip(g, t, maxW) {
  if (g.measureText(t).width <= maxW) return t;
  while (t.length > 1 && g.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}
const WELT_FARBE = { 'Pasta Night': '#a8432c', 'Asian Night': '#a8843a', 'Mexican Night': '#3f6e4a' };
const SERIF = 'Georgia, "Times New Roman", serif';
// „DESSERT & WEIN“ → „Dessert & Wein“, Codes wie K1–K6 bleiben
const titleCase = (t) => t.split(' ').map((w) => (/\d/.test(w) || w.length <= 1 ? w : w.charAt(0) + w.slice(1).toLowerCase())).join(' ');

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Gezeichnetes „Foodfoto“: Teller von oben mit dem Gericht der Kochwelt
export function drawPlate(g, cx, cy, r, rez) {
  let t = rez.nr.charCodeAt(2) * 97 + rez.titel.length * 13;
  const rnd = () => ((t = (t * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const blob = (x, y, rx, ry, col, rot = 0) => {
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
  };
  // Holztisch als Hintergrund
  g.save();
  g.beginPath();
  g.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#b48a5e';
  g.fillRect(cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
  g.strokeStyle = 'rgba(80,50,25,0.25)';
  g.lineWidth = 2;
  for (let i = -6; i <= 6; i++) {
    g.beginPath();
    g.moveTo(cx - r * 1.3, cy + i * r * 0.22 + Math.sin(i) * 3);
    g.bezierCurveTo(cx - r * 0.4, cy + i * r * 0.22 + 4, cx + r * 0.4, cy + i * r * 0.22 - 4, cx + r * 1.3, cy + i * r * 0.22);
    g.stroke();
  }
  g.restore();
  const asian = rez.welt.startsWith('Asian');
  // Teller bzw. Schale
  blob(cx + r * 0.06, cy + r * 0.08, r, r, 'rgba(0,0,0,0.22)');
  blob(cx, cy, r, r, asian ? '#2b2c30' : '#f7f4ee');
  blob(cx, cy, r * 0.8, r * 0.8, asian ? '#3a3b40' : '#efebe3');
  if (rez.welt.startsWith('Pasta')) {
    g.strokeStyle = '#e8c76a';
    g.lineWidth = r * 0.05;
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      const a = rnd() * Math.PI * 2;
      g.arc(cx + Math.cos(a) * r * 0.18, cy + Math.sin(a) * r * 0.18, r * (0.2 + rnd() * 0.35), a, a + 1.6 + rnd() * 2);
      g.stroke();
    }
    for (let i = 0; i < 9; i++) blob(cx + (rnd() - 0.5) * r * 0.9, cy + (rnd() - 0.5) * r * 0.9, r * 0.08, r * 0.07, '#b8322a');
    for (let i = 0; i < 6; i++) blob(cx + (rnd() - 0.5) * r * 0.8, cy + (rnd() - 0.5) * r * 0.8, r * 0.07, r * 0.035, '#4f7f3a', rnd() * 3);
    for (let i = 0; i < 14; i++) blob(cx + (rnd() - 0.5) * r, cy + (rnd() - 0.5) * r, r * 0.02, r * 0.02, '#f6efd8');
  } else if (asian) {
    blob(cx, cy, r * 0.74, r * 0.74, '#c98a4a');
    g.strokeStyle = '#efd9a0';
    g.lineWidth = r * 0.045;
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      const y = cy - r * 0.5 + i * r * 0.06;
      g.moveTo(cx - r * 0.55, y);
      g.bezierCurveTo(cx - r * 0.2, y - r * 0.12, cx + r * 0.2, y + r * 0.12, cx + r * 0.55, y);
      g.stroke();
    }
    blob(cx + r * 0.28, cy - r * 0.2, r * 0.17, r * 0.17, '#fbf7ec');
    blob(cx + r * 0.28, cy - r * 0.2, r * 0.08, r * 0.08, '#f0a830');
    for (let i = 0; i < 7; i++) blob(cx - r * 0.3 + (rnd() - 0.5) * r * 0.4, cy + r * 0.25 + (rnd() - 0.5) * r * 0.3, r * 0.1, r * 0.05, '#5e8f3a', rnd() * 3);
  } else {
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.6;
      g.save();
      g.translate(cx + Math.sin(a) * r * 0.35, cy - Math.cos(a) * r * 0.05);
      g.rotate(a);
      blob(0, 0, r * 0.22, r * 0.5, '#e8c56a');
      blob(0, -r * 0.05, r * 0.15, r * 0.38, '#7a3b26');
      for (let k = 0; k < 4; k++) blob((rnd() - 0.5) * r * 0.18, (rnd() - 0.5) * r * 0.6, r * 0.05, r * 0.04, k % 2 ? '#c0392b' : '#6b9a45');
      g.restore();
    }
    blob(cx + r * 0.45, cy + r * 0.45, r * 0.18, r * 0.18, '#7fa64a');
  }
}

// Rezeptkarte (Kartenspender / Regalkopf): Foto, Nummer, Titel, Zutaten mit Fachcode
export function recipeCardTexture(r, w = 360, h = 504) {
  return canvasTex(w, h, (g) => {
    const an = ANLASS[r.anlass];
    const wc = WELT_FARBE[r.welt] || '#a8432c';
    g.fillStyle = '#fbf9f5';
    g.fillRect(0, 0, w, h);
    // Foto oben
    g.save();
    g.beginPath();
    g.rect(0, 0, w, 168);
    g.clip();
    drawPlate(g, w / 2 - 40, 92, 96, r);
    g.restore();
    // QR-Code: Rezept aufs Handy
    g.fillStyle = 'rgba(0,0,0,0.12)';
    rr(g, w - 118, 22, 102, 124, 10);
    g.fill();
    g.fillStyle = '#ffffff';
    rr(g, w - 120, 20, 102, 124, 10);
    g.fill();
    drawQR(g, QR[r.nr], w - 116, 24, 94, { quiet: 1 });
    g.fillStyle = '#4a4540';
    g.font = `600 11px ${SANS}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('aufs Handy', w - 69, 132);
    g.textAlign = 'left';
    // Nummer als Pille
    g.fillStyle = wc;
    rr(g, 16, 16, 66, 30, 15);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `700 17px ${SANS}`;
    g.textBaseline = 'middle';
    g.textAlign = 'center';
    g.fillText(r.nr, 49, 32);
    g.textAlign = 'left';
    // Titel
    g.fillStyle = '#8a8378';
    g.font = `600 13px ${SANS}`;
    g.fillText(`${an.sym}  ${an.text.toUpperCase()}  ·  ${r.welt.toUpperCase()}`, 20, 192);
    g.fillStyle = '#1f2120';
    g.font = `400 27px ${SERIF}`;
    const words = r.titel.split(' ');
    let line = '';
    let y = 226;
    for (const wd of words) {
      const t = line ? `${line} ${wd}` : wd;
      if (g.measureText(t).width > w - 40) {
        g.fillText(line, 20, y);
        y += 30;
        line = wd;
      } else line = t;
    }
    g.fillText(line, 20, y);
    y += 28;
    g.fillStyle = '#6b6258';
    g.font = `500 14px ${SANS}`;
    g.fillText(`${r.zeit}  ·  ${r.preis}`, 20, y);
    y += 18;
    g.fillStyle = '#e4ddd1';
    g.fillRect(20, y, w - 40, 1);
    y += 20;
    for (const [n, code] of r.zutaten) {
      g.fillStyle = '#2b2c30';
      g.font = `500 15px ${SANS}`;
      g.fillText(n, 20, y);
      g.fillStyle = '#efe9de';
      rr(g, w - 64, y - 11, 44, 22, 11);
      g.fill();
      g.fillStyle = '#4a4540';
      g.font = `700 12px ${SANS}`;
      g.textAlign = 'center';
      g.fillText(code, w - 42, y);
      g.textAlign = 'left';
      y += 25;
    }
    g.fillStyle = '#1f2120';
    g.fillRect(0, h - 34, w, 34);
    g.fillStyle = '#efe7d6';
    g.font = `400 14px ${SERIF}`;
    g.fillText('One Hour Kitchen', 20, h - 17);
    g.font = `500 11px ${SANS}`;
    g.textAlign = 'right';
    g.fillText('Shop. Cook. Enjoy.', w - 20, h - 17);
    g.textAlign = 'left';
  });
}

const TEX = {
  dashboard(layout, W = 2200, H = 960) {
    // Moderne Bildschirm-Oberfläche: helles UI, Karten mit Foodfotos, Spalten = Küche, Zeilen = Anlass (besonders · schnell · günstig)
    // Seitenverhältnis = Bildschirm, damit nichts verzerrt; alle Texte werden auf ihre Fläche begrenzt
    return canvasTex(W, H, (g) => {
      g.fillStyle = '#f4f1ec';
      g.fillRect(0, 0, W, H);
      g.textBaseline = 'middle';
      g.fillStyle = '#1f2120';
      g.font = `400 70px ${SERIF}`;
      g.fillText('Was kochst du heute?', 60, 78);
      g.font = `600 22px ${SANS}`;
      let cx0 = 760;
      ['1  Küche wählen', '2  Anlass wählen', '3  Karte ziehen oder QR scannen'].forEach((t, i) => {
        const tw = g.measureText(t).width + 44;
        g.fillStyle = i === 2 ? '#1f2120' : '#e7e1d7';
        rr(g, cx0, 56, tw, 46, 23);
        g.fill();
        g.fillStyle = i === 2 ? '#f4f1ec' : '#3a3632';
        g.fillText(t, cx0 + 22, 80);
        cx0 += tw + 14;
      });
      g.fillStyle = '#8a8378';
      g.font = `500 22px ${SANS}`;
      g.textAlign = 'right';
      g.fillText('Rezepte des Monats · Oktober', W - 60, 80);
      g.textAlign = 'left';
      const welten = ['Pasta Night', 'Asian Night', 'Mexican Night'];
      const x0 = 330;
      const gap = 20;
      const cw = (W - x0 - 60 - gap * 2) / 3;
      const y0 = 140;
      const hh = 64;
      const rh = (H - y0 - hh - 36 - gap * 2) / 3;
      welten.forEach((wl, i) => {
        const x = x0 + i * (cw + gap);
        g.fillStyle = WELT_FARBE[wl];
        g.beginPath();
        g.arc(x + 14, y0 + hh / 2, 9, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#1f2120';
        g.font = `400 38px ${SERIF}`;
        g.fillText(clip(g, wl, cw - 40), x + 36, y0 + hh / 2);
      });
      ANLASS_REIHE.forEach((z, j) => {
        const an = ANLASS[z];
        const y = y0 + hh + 12 + j * (rh + gap);
        g.fillStyle = '#1f2120';
        g.beginPath();
        g.arc(92, y + rh / 2 - 22, 32, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#f4f1ec';
        g.font = `700 30px ${SANS}`;
        g.textAlign = 'center';
        g.fillText(an.sym, 92, y + rh / 2 - 21);
        g.textAlign = 'left';
        g.fillStyle = '#1f2120';
        fitText(g, an.text, 138, y + rh / 2 - 22, x0 - 150, 600, 32);
        g.fillStyle = '#8a8378';
        fitText(g, an.sub, 138, y + rh / 2 + 16, x0 - 150, 500, 21);
        welten.forEach((wl, i) => {
          const r = layout.rezepte.find((x) => x.welt === wl && x.anlass === z);
          const cx = x0 + i * (cw + gap);
          g.fillStyle = 'rgba(0,0,0,0.06)';
          rr(g, cx + 2, y + 5, cw, rh, 18);
          g.fill();
          g.fillStyle = '#ffffff';
          rr(g, cx, y, cw, rh, 18);
          g.fill();
          if (!r) return;
          g.save();
          rr(g, cx, y, rh, rh, 18);
          g.clip();
          drawPlate(g, cx + rh / 2, y + rh / 2, rh * 0.36, r);
          g.restore();
          // QR-Code rechts unten in der Karte
          const qs = Math.min(112, rh - 56);
          const qx = cx + cw - qs - 16;
          const qy = y + rh - qs - 14;
          drawQR(g, QR[r.nr], qx, qy, qs, { quiet: 1 });
          g.fillStyle = '#8a8378';
          g.font = `600 15px ${SANS}`;
          g.textAlign = 'center';
          g.fillText('aufs Handy', qx + qs / 2, qy - 13);
          g.textAlign = 'left';
          const tx = cx + rh + 22;
          const maxW = cx + cw - tx - 18;
          g.fillStyle = WELT_FARBE[wl];
          g.font = `700 21px ${SANS}`;
          g.fillText(r.nr, tx, y + 34);
          g.fillStyle = '#1f2120';
          g.font = `400 30px ${SERIF}`;
          const lines = [];
          let line = '';
          for (const wd of r.titel.split(' ')) {
            const t = line ? `${line} ${wd}` : wd;
            if (g.measureText(t).width > maxW && line) {
              lines.push(line);
              line = wd;
            } else line = t;
          }
          lines.push(line);
          lines.slice(0, 2).forEach((l, k) => g.fillText(clip(g, k === 1 && lines.length > 2 ? `${l} ${lines.slice(2).join(' ')}` : l, maxW), tx, y + 72 + k * 34));
          g.fillStyle = '#8a8378';
          g.font = `500 20px ${SANS}`;
          const infoW = qx - tx - 12;
          // Keine Preise auf der Tafel – nur die Kochzeit
          g.fillText(clip(g, r.zeit, infoW), tx, y + rh - 22);
        });
      });
    });
  },
  dashboardBack: () =>
    canvasTex(1600, 1000, (g, W, H) => {
      g.fillStyle = '#1f2120';
      g.fillRect(0, 0, W, H);
      g.textBaseline = 'middle';
      g.fillStyle = '#b39b6b';
      g.font = `600 22px ${SANS}`;
      g.fillText('SHOWKÜCHE · LIVE-COOKING', 70, 90);
      g.fillStyle = '#f4f1ec';
      g.font = `400 80px ${SERIF}`;
      g.fillText('Heute probieren', 70, 170);
      g.fillStyle = '#c9c4bc';
      g.font = `500 30px ${SANS}`;
      g.fillText('täglich 11:30–13:30 und 17:30–19:00 · Probieren kostenlos · 19–22 Uhr mietbar', 70, 240);
      const rows = [['Mo', '#01 Creamy Tomato Pasta'], ['Di', '#04 Gebratene Udon'], ['Mi', '#07 Quesadillas'], ['Do', '#03 Pasta e Fagioli'], ['Fr', '#08 Taco-Abend mit Guacamole'], ['Sa', '#05 Ramen-Abend']];
      rows.forEach(([d, n], i) => {
        const y = 330 + i * 92;
        g.fillStyle = 'rgba(255,255,255,0.08)';
        g.fillRect(70, y + 42, 1000, 1);
        g.fillStyle = '#b39b6b';
        g.font = `600 30px ${SANS}`;
        g.fillText(d, 70, y);
        g.fillStyle = '#f4f1ec';
        g.font = `400 38px ${SERIF}`;
        g.fillText(n, 180, y);
      });
      g.fillStyle = '#c9c4bc';
      g.font = `500 26px ${SANS}`;
      g.textAlign = 'right';
      g.fillText('Rezeptkarte vorne am Dashboard', W - 70, H - 70);
      g.save();
      g.beginPath();
      g.arc(1310, 520, 230, 0, Math.PI * 2);
      g.clip();
      drawPlate(g, 1310, 520, 190, { nr: '#01', titel: 'Creamy Tomato Pasta', welt: 'Pasta Night' });
      g.restore();
      g.textAlign = 'left';
    }),
  plakat: (titel, zeilen, farbe = '#2b2e2c') =>
    canvasTex(512, 720, (g, W, H) => {
      g.fillStyle = '#fbf8f2';
      g.fillRect(0, 0, W, H);
      g.fillStyle = farbe;
      g.fillRect(0, 0, W, 210);
      g.fillStyle = '#fff';
      g.textBaseline = 'middle';
      g.font = `600 28px ${SANS}`;
      g.fillText('REZEPTE DES MONATS', 30, 50);
      g.font = `800 70px ${SANS}`;
      fitText(g, titel, 30, 135, W - 60, 800, 70);
      g.fillStyle = '#1c1c1f';
      g.font = `600 32px ${SANS}`;
      zeilen.forEach((z, i) => fitText(g, z, 30, 280 + i * 70, W - 60, 600, 32));
      g.fillStyle = farbe;
      g.font = `800 34px ${SANS}`;
      g.fillText('Shop. Cook. Enjoy.', 30, H - 60);
    }),
  preisleiste: () =>
    canvasTex(512, 32, (g, W, H) => {
      // leere Preisschiene (die Etiketten je Artikel kommen aus dem Produkt-Atlas)
      g.fillStyle = '#e9e6df';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#c9c4ba';
      g.fillRect(0, 0, W, 3);
      g.fillRect(0, H - 3, W, 3);
    }),
  plakette: () =>
    canvasTex(1024, 160, (g, W, H) => {
      g.fillStyle = '#b39b6b';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#2a2420';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `400 70px Georgia, "Times New Roman", serif`;
      g.fillText('Live-Cooking · täglich 11:30–13:30', W / 2, H / 2 + 4);
    }),
  glasband: () =>
    canvasTex(2048, 128, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(245,245,240,0.55)';
      g.fillRect(0, 22, W, H - 44);
      g.fillStyle = 'rgba(255,255,255,0.0)';
      g.fillStyle = 'rgba(120,120,115,0.55)';
      g.textBaseline = 'middle';
      g.font = `400 46px Georgia, "Times New Roman", serif`;
      const t = 'Showküche   ·   One Hour Kitchen   ·   ';
      const tw = g.measureText(t).width;
      for (let x = 30; x < W; x += tw) g.fillText(t, x, H / 2 + 2);
    }),
  preisleisteDunkel: () =>
    canvasTex(512, 32, (g, W, H) => {
      g.fillStyle = '#232427';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#3a3b3f';
      g.fillRect(0, 0, W, 2);
    }),
  kochtresen: () =>
    canvasTex(1024, 300, (g, W, H) => {
      g.fillStyle = '#efe9df';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#b84a32';
      g.fillRect(0, 0, 18, H);
      g.fillStyle = '#1c1c1f';
      g.textBaseline = 'middle';
      g.font = `800 66px ${SANS}`;
      g.fillText('LIVE-COOKING', 60, 100);
      g.font = `500 36px ${SANS}`;
      g.fillText('täglich 11:30–13:30 · Probieren erwünscht', 60, 180);
      g.fillStyle = '#b84a32';
      g.font = `700 32px ${SANS}`;
      g.fillText('Heute: #01 Creamy Tomato Pasta', 60, 245);
    }),
  kurskueche: () =>
    canvasTex(1024, 256, (g, W, H) => {
      g.fillStyle = '#2b2c30';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#f4f1ec';
      g.textBaseline = 'middle';
      g.font = `800 56px ${SANS}`;
      g.fillText('KURSKÜCHE', 40, 80);
      g.font = `500 30px ${SANS}`;
      g.fillStyle = '#d9b24a';
      g.fillText('Hier kochst du mit – 8 Plätze · Kurse ab 59 €', 40, 160);
    }),
  kuehlzelle: () =>
    canvasTex(512, 512, (g, W, H) => {
      g.fillStyle = '#eef1f3';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 3;
      for (let x = 0; x < W; x += 128) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
    }),
  sbScreen: () =>
    canvasTex(256, 192, (g, W, H) => {
      g.fillStyle = '#16171a';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#b84a32';
      g.fillRect(0, 0, W, 34);
      g.fillStyle = '#fff';
      g.font = `800 18px ${SANS}`;
      g.fillText('SB-KASSE', 10, 23);
      g.font = `600 20px ${SANS}`;
      g.fillText('Bitte Artikel scannen', 14, 80);
      g.fillStyle = '#4f8a6a';
      g.fillRect(14, 120, W - 28, 46);
      g.fillStyle = '#16171a';
      g.font = `800 20px ${SANS}`;
      g.fillText('Bezahlen', 24, 150);
    }),
  posScreen: () =>
    canvasTex(256, 160, (g, W, H) => {
      g.fillStyle = '#1e2124';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#e9e4da';
      g.font = `600 14px ${SANS}`;
      ['Pasta 500 g        1,29', 'Sahne 200 ml       0,89', 'Parmesan           2,49', 'Basilikum          1,79'].forEach((t, i) => g.fillText(t, 10, 26 + i * 22));
      g.fillStyle = '#4f8a6a';
      g.font = `800 20px ${SANS}`;
      g.fillText('SUMME  6,46 €', 10, 140);
    }),
};

// ---------- Regalkopf: Küchenhelfer aus der Showküche ----------
// Pfanne, Reibe, Pfeffermühle … – genau die Geräte, mit denen der Koch gerade kocht. Non-Food mit höherer Marge.
const HELFER = {
  'Pasta Night': [['Pfeffermühle Eiche', '29,90 €'], ['Parmesanreibe', '19,90 €'], ['Pastatopf 6 l', '49,90 €'], ['Pfanne 28 cm', '39,90 €']],
  'Asian Night': [['Bambusdämpfer', '24,90 €'], ['Essstäbchen 4er', '9,90 €'], ['Wok Carbonstahl', '44,90 €'], ['Hackmesser', '34,90 €']],
  'Mexican Night': [['Tortillapresse', '39,90 €'], ['Limettenpresse', '12,90 €'], ['Molcajete', '34,90 €'], ['Gusseisenpfanne', '49,90 €']],
};
function priceTag(ctx, text, x, y, z, dir) {
  sign(ctx.extra, text, { w: 0.09, h: 0.04, bg: '#fbf8f2', fg: '#1f2120', font: '700' }, x, y, z, dir);
}
function kuechenhelfer(b, ctx, welt, x2, z1, z2, H) {
  const X = x2 + 0.005;
  const D = 0.19;
  const zc = (z1 + z2) / 2;
  const L = z2 - z1 - 0.08;
  const dir = [1, 0];
  const items = HELFER[welt] || HELFER['Pasta Night'];
  if (!b.materials.bambus) b.materials.bambus = std(0xc9a46a, 0.75);
  if (!b.materials.guss) b.materials.guss = std(0x1c1c1e, 0.55, 0.35);
  // Rahmen: Sockel, Rückwand als Lochblech, zwei Eichenböden mit Messingkante
  b.box('schwarzMatt', [x2 - 0.03, X + D, z1, z2], 0, 0.1);
  b.box('anthrazit', [X, X + 0.012, z1 + 0.03, z2 - 0.03], 0.1, H - 0.03);
  for (const y of [0.46, 0.9]) {
    b.box('eiche', [X, X + D, z1 + 0.03, z2 - 0.03], y - 0.03, y);
    b.box('messing', [X + D - 0.004, X + D, z1 + 0.03, z2 - 0.03], y - 0.03, y - 0.01);
  }
  // Lochblech-Punkte (dezent)
  const hole = new THREE.CircleGeometry(0.0045, 6);
  for (let y = 1.0; y < H - 0.1; y += 0.06) for (let z = z1 + 0.07; z < z2 - 0.05; z += 0.06) b.geo('schwarz', hole, X + 0.0125, y, z, Math.PI / 2);
  const front = X + D;
  const zl = zc - L / 4;
  const zr = zc + L / 4;
  // unten: verpackte Ware im Karton mit Aufdruck
  for (const [k, z] of [[3, zl], [2, zr]]) {
    b.box(k === 3 ? 'weiss' : 'anthrazit', [X + 0.02, front - 0.01, z - L / 4 + 0.015, z + L / 4 - 0.015], 0.1, 0.34);
    const [n, pr] = items[k];
    sign(ctx.extra, n, { w: L / 2 - 0.05, h: 0.12, bg: k === 3 ? '#f3efe7' : '#2b2c30', fg: k === 3 ? '#2b2c30' : '#efe7d6', font: '600', sub: 'aus der Showküche' }, front - 0.009, 0.24, z, dir);
    priceTag(ctx, pr, front + 0.002, 0.37, z - L / 4 + 0.07, dir);
  }
  // Boden 1 (0,46): große Geräte; Boden 2 (0,9): Kleingeräte; Lochblech: hängende Pfanne/Utensilien
  const y1 = 0.46;
  const y2 = 0.9;
  const xm = X + D / 2 + 0.01;
  if (welt === 'Asian Night') {
    b.geo('guss', new THREE.CylinderGeometry(0.15, 0.06, 0.09, 28, 1, true), xm, y1 + 0.05, zl);
    b.geo('holz', G.box(0.02, 0.02, 0.16), xm, y1 + 0.08, zl - 0.2);
    for (let i = 0; i < 2; i++) b.geo('bambus', G.disc(0.085, 0.055, 24), xm, y2 + 0.03 + i * 0.058, zl);
    b.geo('bambus', G.disc(0.088, 0.012, 24), xm, y2 + 0.122, zl);
    for (let i = 0; i < 4; i++) b.geo('schwarz', G.box(0.012, 0.012, 0.22), xm - 0.04 + i * 0.025, y2 + 0.01, zr, 0.05 * i);
    b.geo('edelstahl', G.box(0.004, 0.09, 0.18), X + 0.02, 1.38, zr);
    b.geo('holzDunkel', G.box(0.02, 0.03, 0.11), X + 0.02, 1.38, zr + 0.14);
    b.geo('guss', new THREE.CylinderGeometry(0.11, 0.04, 0.06, 24, 1, true), X + 0.05, 1.42, zl, 0, 0, Math.PI / 2);
  } else if (welt === 'Mexican Night') {
    b.geo('stein', new THREE.CylinderGeometry(0.1, 0.075, 0.08, 20), xm, y1 + 0.07, zl);
    for (const a of [0, 2.1, 4.2]) b.geo('stein', G.disc(0.015, 0.04, 8), xm + Math.cos(a) * 0.05, y1 + 0.02, zl + Math.sin(a) * 0.05);
    b.geo('stein', G.disc(0.022, 0.12, 10), xm + 0.02, y1 + 0.14, zl + 0.03, 0, 0.5);
    for (let i = 0; i < 3; i++) b.geo('guss', G.disc(0.12, 0.03, 28), xm, y1 + 0.016 + i * 0.032, zr);
    b.geo('guss', G.disc(0.09, 0.025, 24), xm, y2 + 0.015, zl);
    b.geo('guss', G.disc(0.09, 0.025, 24), xm, y2 + 0.05, zl);
    b.geo('guss', G.box(0.03, 0.02, 0.2), xm, y2 + 0.075, zl + 0.08, 0, 0.25);
    b.geo('gelb', G.box(0.05, 0.03, 0.17), xm, y2 + 0.02, zr, 0.4);
    b.geo('guss', G.disc(0.13, 0.025, 28), X + 0.03, 1.45, zl + 0.05, 0, 0, Math.PI / 2);
    b.geo('guss', G.box(0.02, 0.2, 0.03), X + 0.03, 1.22, zl + 0.05);
    b.geo('holz', G.box(0.02, 0.26, 0.05), X + 0.02, 1.4, zr + 0.06);
  } else {
    b.geo('edelstahl', G.disc(0.1, 0.17, 28), xm, y1 + 0.085, zl);
    b.geo('edelstahl', G.disc(0.104, 0.012, 28), xm, y1 + 0.176, zl);
    b.geo('schwarz', G.disc(0.015, 0.02, 10), xm, y1 + 0.19, zl);
    b.geo('edelstahl', G.box(0.07, 0.22, 0.09), xm, y1 + 0.11, zr);
    b.geo('schwarz', G.box(0.03, 0.04, 0.09), xm, y1 + 0.24, zr);
    for (let i = 0; i < 3; i++) {
      const z = zc - 0.12 + i * 0.12;
      b.geo(i === 1 ? 'holzDunkel' : 'eiche', new THREE.CylinderGeometry(0.026, 0.03, 0.2, 16), xm, y2 + 0.1, z);
      b.geo('messing', G.disc(0.012, 0.03, 10), xm, y2 + 0.215, z);
    }
    b.geo('edelstahl', G.disc(0.13, 0.02, 28), X + 0.03, 1.45, zl + 0.05, 0, 0, Math.PI / 2);
    b.geo('schwarz', G.box(0.02, 0.2, 0.03), X + 0.03, 1.22, zl + 0.05);
    b.geo('edelstahl', G.box(0.012, 0.3, 0.025), X + 0.02, 1.4, zr + 0.08);
    b.geo('edelstahl', G.disc(0.035, 0.015, 14), X + 0.025, 1.24, zr + 0.08, 0, 0, Math.PI / 2);
  }
  priceTag(ctx, items[2][1], front + 0.002, y1 - 0.03, zl - 0.12, dir);
  priceTag(ctx, items[1][1], front + 0.002, y1 - 0.03, zr + 0.06, dir);
  priceTag(ctx, items[0][1], front + 0.002, y2 - 0.03, zc - 0.03, dir);
  sign(ctx.extra, 'Aus unserer Showküche', { w: 0.5, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, sub: `${items[0][0]} · ${items[2][0]} – damit kocht unser Koch` }, X + 0.04, H + 0.2, zc, dir);
  b.box('schwarzMatt', [x2 - 0.02, x2 + 0.03, zc - 0.02, zc + 0.02], H, H + 0.3);
  sign(ctx.extra, welt, { w: L, h: 0.09, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: WELT_FARBE[welt] }, X + 0.014, H - 0.1, zc, dir);
}

// ---------- Möbeltypen ----------
const BUILDERS = {
  // Schaufenster „Was kochst du heute?“: drei Podeste (je Kochwelt ein Gericht mit Zutaten), Leuchtplakat mit QR, Spots, Glasbeschriftung
  schaufenster(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const top = 0.32;
    const L = ctx.layout;
    b.box('eicheDunkel', [x1, x2, z1, z2], 0, top);
    b.box('akzent', [x1, x2, z1 - 0.005, z1], 0.26, top);
    b.box('led', [x1 + 0.02, x2 - 0.02, z1 - 0.008, z1 - 0.004], top - 0.012, top - 0.006);
    const P = ctx.products;
    const welten = [
      { welt: 'Pasta Night', nr: '#01', codes: ['T1', 'T2'], fresh: ['tomate', 'knoblauch'], preis: '4,60 €' },
      { welt: 'Asian Night', nr: '#04', codes: ['T3', 'T4'], fresh: ['pakchoi', 'limette'], preis: '4,40 €' },
      { welt: 'Mexican Night', nr: '#07', codes: ['T5', 'T6'], fresh: ['avocado', 'paprikaRot'], preis: '4,20 €' },
    ];
    const W = (x2 - x1) / 3;
    const dir = [0, -1];
    // Vitrine: Eichensockel, Glaskasten mit Messingkanten, Lichtleiste oben
    const vx1 = x1 + 0.08, vx2 = x2 - 0.08, vz1 = z1 + 0.1, vz2 = z2 - 0.04;
    const baseH = 0.36, glasH = 0.5;
    b.box('eiche', [vx1, vx2, vz1, vz2], top, top + baseH);
    const gy0 = top + baseH, gy1 = gy0 + glasH;
    b.box('glas', [vx1, vx2, vz1, vz1 + 0.008], gy0, gy1);
    b.box('glas', [vx1, vx2, vz2 - 0.008, vz2], gy0, gy1);
    b.box('glas', [vx1, vx1 + 0.008, vz1, vz2], gy0, gy1);
    b.box('glas', [vx2 - 0.008, vx2, vz1, vz2], gy0, gy1);
    b.box('glas', [vx1, vx2, vz1, vz2], gy1, gy1 + 0.008);
    for (const x of [vx1, vx2 - 0.012]) for (const z of [vz1, vz2 - 0.012]) b.box('messing', [x, x + 0.012, z, z + 0.012], gy0, gy1 + 0.01);
    b.box('messing', [vx1, vx2, vz1, vz1 + 0.012], gy1, gy1 + 0.012);
    b.box('messing', [vx1, vx2, vz2 - 0.012, vz2], gy1, gy1 + 0.012);
    b.box('led', [vx1 + 0.03, vx2 - 0.03, vz1 + 0.05, vz1 + 0.07], gy1 - 0.018, gy1 - 0.008);
    // Trennstege zwischen den drei Gerichten
    for (let k = 1; k < 3; k++) b.box('messing', [x1 + k * W - 0.004, x1 + k * W + 0.004, vz1, vz2], gy0, gy0 + 0.05);
    welten.forEach((w, i) => {
      const cx = x1 + (i + 0.5) * W;
      const rez = L.rezepte.find((r) => r.nr === w.nr);
      // Gericht in der Vitrine (fertig gekocht, je Kochwelt eins)
      const vz = (vz1 + vz2) / 2;
      const vy = top + baseH;
      b.box('terrazzo', [cx - 0.24, cx + 0.24, vz - 0.17, vz + 0.17], vy, vy + 0.1);
      GERICHT[w.nr](b, cx, vy + 0.1, vz, rng(11 + i * 7));
      // Karte vorne: Kochwelt, Gericht, Preis je Portion, QR
      const card = canvasTex(480, 220, (g, cw, ch) => {
        g.fillStyle = '#fbf8f2';
        g.fillRect(0, 0, cw, ch);
        g.fillStyle = WELT_FARBE[w.welt];
        g.fillRect(0, 0, 10, ch);
        g.textBaseline = 'middle';
        g.fillStyle = '#8a8378';
        g.font = `600 20px ${SANS}`;
        g.fillText(w.welt.toUpperCase(), 30, 34);
        g.fillStyle = '#1f2120';
        fitText(g, rez.titel, 30, 82, 290, 400, 38, SERIF);
        g.fillStyle = '#3a3632';
        g.font = `500 22px ${SANS}`;
        g.fillText(`${rez.zeit} · Zutaten im Laden`, 30, 132);
        g.fillStyle = WELT_FARBE[w.welt];
        g.font = `700 34px ${SANS}`;
        g.fillText(`${w.preis} je Portion`, 30, 180);
        drawQR(g, QR[w.nr], 340, 50, 124, { quiet: 1 });
        g.fillStyle = '#8a8378';
        g.font = `600 14px ${SANS}`;
        g.textAlign = 'center';
        g.fillText('Rezept aufs Handy', 402, 190);
      });
      plane(ctx.extra, lit(card), 0.42, 0.19, cx, top + baseH / 2, vz1 - 0.012, dir);
      b.geo('eicheDunkel', G.box(0.44, 0.21, 0.008), cx, top + baseH / 2, vz1 - 0.006);
      // Spot über dem Podest
      b.box('metall', [cx - 0.004, cx + 0.004, z1 + 0.35 - 0.004, z1 + 0.35 + 0.004], 2.45, 3.2);
      b.geo('schwarzMatt', new THREE.CylinderGeometry(0.05, 0.08, 0.16, 18, 1, true), cx, 2.4, z1 + 0.35);
      b.geo('led', new THREE.CircleGeometry(0.07, 18), cx, 2.33, z1 + 0.35, 0, Math.PI / 2);
    });
    // Leuchtplakat über den Podesten, von der Decke abgehängt
    const pw = 1.5;
    const ph = 0.84;
    const px = (x1 + x2) / 2;
    const pz = z2 - 0.08;
    const py = 1.72;
    for (const s of [-1, 1]) b.box('metall', [px + s * (pw / 2 - 0.08) - 0.004, px + s * (pw / 2 - 0.08) + 0.004, pz - 0.004, pz + 0.004], py + ph / 2, 3.2);
    b.box('schwarzMatt', [px - pw / 2 - 0.02, px + pw / 2 + 0.02, pz, pz + 0.05], py - ph / 2 - 0.02, py + ph / 2 + 0.02);
    const poster = canvasTex(1500, 840, (g, PW, PH) => {
      g.fillStyle = '#1f2120';
      g.fillRect(0, 0, PW, PH);
      g.textBaseline = 'middle';
      g.fillStyle = '#b39b6b';
      g.font = `600 30px ${SANS}`;
      g.fillText('ONE HOUR KITCHEN · REZEPTE DES MONATS', 70, 80);
      g.fillStyle = '#f4f1ec';
      g.font = `400 92px ${SERIF}`;
      g.fillText('Was kochst du heute?', 70, 180);
      g.fillStyle = '#c9c4bc';
      g.font = `500 34px ${SANS}`;
      g.fillText('Rezept wählen · Zutaten einkaufen · in einer Stunde auf dem Tisch', 70, 262);
      welten.forEach((w, i) => {
        const rez = L.rezepte.find((r) => r.nr === w.nr);
        const cx = 230 + i * 400;
        g.save();
        g.beginPath();
        g.arc(cx, 470, 130, 0, Math.PI * 2);
        g.clip();
        drawPlate(g, cx, 470, 105, rez);
        g.restore();
        g.fillStyle = '#f4f1ec';
        g.textAlign = 'center';
        g.font = `400 36px ${SERIF}`;
        g.fillText(clip(g, rez.titel, 360), cx, 650);
        g.fillStyle = '#c9c4bc';
        g.font = `500 26px ${SANS}`;
        g.fillText(`${w.welt} · ${rez.zeit}`, cx, 700);
        g.textAlign = 'left';
      });
      drawQR(g, QR.start, PW - 250, 360, 190, { quiet: 2 });
      g.fillStyle = '#f4f1ec';
      g.font = `600 24px ${SANS}`;
      g.textAlign = 'center';
      g.fillText('Alle 9 Rezepte', PW - 155, 580);
      g.fillText('aufs Handy', PW - 155, 612);
      g.fillStyle = '#b39b6b';
      g.font = `500 28px ${SANS}`;
      g.fillText('Live-Cooking täglich 11:30–13:30 · 17:30–19 Uhr', PW / 2, PH - 50);
      g.textAlign = 'left';
    });
    const pm = new THREE.MeshStandardMaterial({ map: poster, emissive: 0xffffff, emissiveMap: poster, emissiveIntensity: 0.55, roughness: 0.5 });
    plane(ctx.extra, pm, pw, ph, px, py, pz - 0.002, dir);
    // Glasbeschriftung (Folie innen auf der Scheibe, von der Straße lesbar)
    const decal = canvasTex(2048, 256, (g, DW, DH) => {
      g.clearRect(0, 0, DW, DH);
      g.fillStyle = 'rgba(250,247,240,0.92)';
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      g.font = `italic 400 120px ${SERIF}`;
      g.fillText('Shop. Cook. Enjoy.', DW / 2, 100);
      g.font = `500 44px ${SANS}`;
      g.fillText('9 Rezepte · alle Zutaten an einem Ort · Live-Cooking', DW / 2, 200);
    });
    const dm = new THREE.MeshBasicMaterial({ map: decal, transparent: true, depthWrite: false });
    plane(ctx.extra, dm, 3.4, 0.425, (x1 + x2) / 2 + 0.3, 2.55, 0.04, dir);
  },

  'matrix-dashboard'(b, m, ctx) {
    // Freistehende Stele: Eichen-Seitenwangen, rahmenloser Bildschirm, darunter schräges Kartenpult mit 3×3 Acryl-Fächern
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const zc = (z1 + z2) / 2;
    const cx = (x1 + x2) / 2;
    // Sockel (Schattenfuge) + Seitenwangen
    b.box('schwarzMatt', [x1 + 0.02, x2 - 0.02, zc - 0.16, zc + 0.16], 0, 0.05);
    for (const x of [x1, x2 - 0.06]) {
      b.box('eiche', [x, x + 0.06, zc - 0.15, zc + 0.15], 0.05, H);
    }
    // Kopfblende mit Markenname
    b.box('schwarzMatt', [x1 + 0.06, x2 - 0.06, zc - 0.05, zc + 0.05], H - 0.14, H);
    sign(ctx.extra, 'One Hour Kitchen', { w: 0.9, h: 0.1, bg: '#1d1e20', fg: '#efe7d6', font: '400', serif: true }, cx, H - 0.07, zc - 0.052, [0, -1]);
    // Bildschirm: dünner Rahmen, Glasfront
    const y0 = 1.02;
    const top = H - 0.17;
    const w = x2 - x1 - 0.2;
    const h = top - y0;
    b.box('schwarz', [x1 + 0.08, x2 - 0.08, zc - 0.035, zc + 0.035], y0 - 0.02, top + 0.01);
    plane(ctx.extra, unlit(TEX.dashboard(ctx.layout, Math.round((960 * w) / h), 960)), w, h, cx, y0 + h / 2 - 0.005, zc - 0.037, [0, -1]);
    // Rückseite bleibt bewusst schwarz (keine Tafel)
    // Kartenpult (Eiche), um 25° geneigt, mit Lichtkante
    const pz1 = z1 - 0.2;
    b.box('eiche', [x1 + 0.06, x2 - 0.06, pz1, zc - 0.035], 0.86, 0.9);
    b.box('led', [x1 + 0.08, x2 - 0.08, pz1 - 0.003, pz1], 0.865, 0.875);
    b.box('schwarzMatt', [x1 + 0.1, x2 - 0.1, pz1 + 0.05, zc - 0.06], 0.05, 0.86);
    const wl = ['Pasta Night', 'Asian Night', 'Mexican Night'];
    const an = ANLASS_REIHE;
    const colW = w / 3;
    wl.forEach((welt, i) => {
      // Spaltenkopf: Kochwelt als kleines Schild
      sign(ctx.extra, welt, { w: colW - 0.12, h: 0.045, bg: '#25282a', fg: '#efe7d6', font: '500', accent: WELT_FARBE[welt] }, x1 + 0.1 + (i + 0.5) * colW, 0.985, pz1 + 0.02, [0, -1]);
      an.forEach((a, j) => {
        const r = ctx.layout.rezepte.find((x) => x.welt === welt && x.anlass === a);
        const x = x1 + 0.1 + i * colW + (j + 0.5) * (colW / 3);
        // Acrylfach: Rückwand + Front, Karte steckt dazwischen
        b.geo('glas', G.box(0.13, 0.17, 0.004), x, 0.97, pz1 + 0.075, 0, -0.35);
        b.geo('glas', G.box(0.13, 0.08, 0.004), x, 0.93, pz1 + 0.045, 0, -0.35);
        b.geo('chrom', G.box(0.13, 0.004, 0.035), x, 0.892, pz1 + 0.06, 0, -0.35);
        if (r) {
          if (!ctx.cardMats[r.nr]) ctx.cardMats[r.nr] = lit(recipeCardTexture(r));
          plane(ctx.extra, ctx.cardMats[r.nr], 0.1, 0.14, x, 0.975, pz1 + 0.068, [0, -1], -0.35);
        }
      });
    });
  },

  'obst-stand'(b, m, ctx) {
    const [cx, cz] = m.mitte;
    const u = m.richtung;
    const n = [u[1], -u[0]]; // Seite zur Raummitte
    const L = m.laenge;
    const D = m.tiefe;
    const at = (a, s) => [cx + u[0] * a + n[0] * s, cz + u[1] * a + n[1] * s];
    const yaw = yawFacing(n[0], n[1]);
    // Unterbau
    b.geo('holzDunkel', G.box(L, 0.6, D - 0.1), cx, 0.3, cz, yaw);
    b.geo('holz', G.box(L + 0.04, 0.04, D), cx, 0.62, cz, yaw);
    // Mittelstufe
    b.geo('holz', G.box(L - 0.1, 0.22, 0.34), cx, 0.75, cz, yaw);
    const kinds = [
      ['tomate', 'zitrone', 'paprikaRot', 'avocado', 'zwiebel', 'apfel'],
      ['limette', 'paprikaGelb', 'knoblauch', 'apfelGruen', 'aubergine', 'tomate'],
    ];
    const nCr = 6;
    const cw = L / nCr;
    for (const [side, list] of [[1, kinds[0]], [-1, kinds[1]]]) {
      for (let i = 0; i < nCr; i++) {
        const a = -L / 2 + (i + 0.5) * cw;
        const [x, z] = at(a, side * 0.3);
        const dir = side > 0 ? n : [-n[0], -n[1]];
        const yw = yawFacing(dir[0], dir[1]);
        b.geo('kiste', G.box(cw - 0.03, 0.12, 0.36), x, 0.7, z, yw, -0.22);
        ctx.fresh.crate(b, x, 0.76, z, cw - 0.07, 0.3, list[i % list.length], yw, -0.22);
      }
    }
    // Oben: Salat, Pak Choi, Lauch, Karotten in Körben
    const top = ['salat', 'pakchoi', 'lauch', 'karotte', 'banane'];
    for (let i = 0; i < 5; i++) {
      const a = -L / 2 + (i + 0.5) * (L / 5);
      const [x, z] = at(a, 0);
      b.geo('kiste', G.box(L / 5 - 0.06, 0.1, 0.3), x, 0.91, z, yaw);
      ctx.fresh.crate(b, x, 0.96, z, L / 5 - 0.1, 0.24, top[i], yaw);
    }
    // Schilder an beiden Enden + Preisstecker
    const [sx, sz] = at(0, 0);
    b.geo('metall', G.box(0.02, 0.5, 0.02), sx, 1.25, sz, yaw);
    for (const d of [n, [-n[0], -n[1]]]) {
      const [px, pz] = at(0, (d === n ? 1 : -1) * 0.012);
      sign(ctx.extra, 'Obst & Gemüse', { w: 1.1, h: 0.28, chalk: true, sub: 'O1 · heute frisch' }, px, 1.45, pz, d);
    }
    // Kollision: Kette kleiner Quadrate entlang der Achse
    const r = D / 2;
    for (let i = 0; i <= 6; i++) {
      const [x, z] = at(-L / 2 + (i * L) / 6, 0);
      ctx.colliders.push([x - r * 0.75, x + r * 0.75, z - r * 0.75, z + r * 0.75]);
    }
  },

  // Gondel einer Kochwelt (Gondel 1 = Pasta Night …): je Seite eine Warengruppen-Familie als Kreuzblock
  gondel(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const zc = (z1 + z2) / 2;
    const welt = m.regal?.welt || '';
    const wfarbe = WELT_FARBE[welt] || '#b39b6b';
    b.box('schwarzMatt', [x1 + 0.02, x2 - 0.02, z1 + 0.04, z2 - 0.04], 0, 0.1);
    b.box('eicheDunkel', [x1 + 0.03, x2 - 0.03, zc - 0.02, zc + 0.02], 0.1, H - 0.01);
    for (const x of [x1, x2 - 0.03]) b.box('schwarzMatt', [x, x + 0.03, z1, z2], 0, H);
    b.box('eicheDunkel', [x1, x2, z1 + 0.02, z2 - 0.02], H - 0.03, H);
    const ys = [0.1, 0.45, 0.8, 1.15, 1.48];
    for (const seite of ['vorne', 'hinten']) {
      const f = faceFrame(m.rechteck, seite);
      for (const y of ys.slice(1)) {
        b.box('eiche', faceRect(f, x1 + 0.03, x2 - 0.03, 0, -0.25), y - 0.025, y);
        b.box('led', faceRect(f, x1 + 0.04, x2 - 0.04, -0.012, -0.022), y - 0.03, y - 0.025);
        ctx.priceRail(f, x1 + 0.03, x2 - 0.03, y - 0.065, y - 0.025, 'preisDunkel');
      }
      b.box('led', faceRect(f, x1 + 0.04, x2 - 0.04, -0.012, -0.022), H - 0.035, H - 0.03);
      b.box('schwarzMatt', faceRect(f, x1 + 0.03, x2 - 0.03, -0.03, -0.05), 0.0, 0.1);
      b.box('eiche', faceRect(f, x1, x2, 0.02, -0.03), H - 0.04, H);
      ctx.priceRail(f, x1 + 0.03, x2 - 0.03, 0.06, 0.1, 'preisDunkel');
      const face = m.regal?.[seite];
      if (!face || !face.code) continue;
      // Planogramm (Kreuzblock): Böden von oben (Sichtzone) nach unten (Bückzone, Großpackungen)
      const plan = ctx.products.placeFace(face.code, {
        along: 'x', from: x1 + 0.04, to: x2 - 0.04, front: f.front, dir: f.dir,
        levels: [{ y: 1.48, maxH: 0.29, depth: 0.24 }, { y: 1.15, maxH: 0.3, depth: 0.24 }, { y: 0.8, maxH: 0.32, depth: 0.24 }, { y: 0.45, maxH: 0.32, depth: 0.24 }, { y: 0.1, maxH: 0.32, depth: 0.24 }],
      });
      // Schild über der Seite: Kochwelt groß, darunter Warengruppen + Fachcode
      const d = f.dir;
      const sz = zc + d[1] * 0.012;
      const sy = 2.3;
      sign(ctx.extra, welt || face.titel, { w: 2.6, h: 0.32, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, accent: wfarbe, sub: `${face.titel} · Fachcode ${face.code}` }, (x1 + x2) / 2, sy, sz, d);
      for (const ox of [-1.15, 1.15]) b.box('metall', [(x1 + x2) / 2 + ox - 0.004, (x1 + x2) / 2 + ox + 0.004, sz - d[1] * 0.006 - 0.004, sz - d[1] * 0.006 + 0.004], sy + 0.16, 3.2);
      // Warengruppen-Leiste über der Ware: zeigt die senkrechten Blöcke des Kreuzblocks
      if (plan) {
        let a = x1 + 0.04;
        const W = x2 - x1 - 0.08;
        for (const bl of plan.blocks) {
          const w = bl.w * W;
          if (w > 0.35 && bl.wg) {
            const [px, pz] = f.at(a + w / 2, 0.026);
            sign(ctx.extra, bl.wg, { w: Math.min(w - 0.06, 1.2), h: 0.075, bg: '#25282a', fg: '#efe7d6', font: '500' }, px, H + 0.04, pz, d);
          }
          a += w;
        }
      }
    }
    // Stirnseite zum Rundlauf (−x): Kochwelt mit beiden Warengruppen
    b.box('eicheDunkel', [x1 - 0.012, x1, z1 + 0.02, z2 - 0.02], 0.1, H - 0.03);
    const titles = ['vorne', 'hinten'].map((sd) => m.regal?.[sd]).filter((t) => t && t.code);
    sign(ctx.extra, welt, { w: 0.5, h: 0.24, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, accent: wfarbe, sub: titles.map((t) => t.code).join(' · ') }, x1 - 0.016, 1.45, zc, [-1, 0]);
    // Regalkopf zum Hauptgang (+x): Küchenhelfer aus der Showküche (Non-Food, Zweitplatzierung)
    kuechenhelfer(b, ctx, welt, x2, z1, z2, H);
    ctx.colliders.push([x2, x2 + 0.2, z1, z2]);
  },

  kuehlregal(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const f = faceFrame(m.rechteck, 'vorne');
    const D = z2 - z1;
    // Rückwand (leuchtend), Seiten, Sockelgitter, Dachblende
    b.box('kuehlwand', [x1, x2, z2 - 0.06, z2], 0, H);
    b.box('kuehlLicht', [x1 + 0.05, x2 - 0.05, z2 - 0.065, z2 - 0.06], 0.35, 1.85);
    for (let x = x1; x < x2 + 0.01; x += (x2 - x1) / m.faecher.length) b.box('anthrazit', [Math.max(x1, x - 0.025), Math.min(x2, x + 0.025), z1 + 0.1, z2], 0, H);
    b.box('gitter', [x1, x2, z1 + 0.05, z2 - 0.06], 0, 0.28);
    b.box('anthrazit', [x1, x2, z1 + 0.25, z2], H - 0.2, H);
    b.box('weiss', [x1, x2, z1 + 0.2, z1 + 0.25], H - 0.22, H);
    // Wanne unten + Böden (nach oben weniger tief)
    b.box('kuehlwand', [x1, x2, z1 + 0.04, z1 + 0.12], 0.28, 0.42);
    const levels = [[0.3, 0.68], [0.75, 0.6], [1.1, 0.52], [1.43, 0.44], [1.72, 0.36]];
    for (const [y, d] of levels.slice(1)) {
      b.box('weiss', [x1 + 0.03, x2 - 0.03, z2 - 0.06 - d, z2 - 0.06], y - 0.02, y);
      b.box('kuehlLicht', [x1 + 0.03, x2 - 0.03, z2 - 0.06 - d, z2 - 0.06 - d + 0.015], y - 0.035, y - 0.02);
    }
    const n = m.faecher.length;
    const L = (x2 - x1) / n;
    m.faecher.forEach((fach, i) => {
      const a1 = x1 + i * L + 0.04;
      const a2 = x1 + (i + 1) * L - 0.04;
      for (const [y, d] of levels) {
        const front = z2 - 0.06 - d;
        ctx.priceRailAt([a1, a2, front - 0.015, front], y - 0.05, y - 0.01, [0, -1]);
      }
      const lv = levels.slice().reverse().map(([y, d], k, arr) => ({ y: y + 0.002, depth: d - 0.02, front: z2 - 0.06 - d, maxH: k === 0 ? 0.3 : arr[k - 1][0] - y - 0.04 }));
      ctx.products.placeFace(fach.code, { along: 'x', from: a1, to: a2, front: z2 - 0.06 - levels[0][1], dir: [0, -1], levels: lv, tagOut: 0.022, tagDy: -0.032 });
      sign(ctx.extra, fach.name, { w: L - 0.12, h: 0.16, bg: '#25282a', fg: '#efe7d6', font: '500', accent: '#46708f', sub: fach.code }, (a1 + a2) / 2, H - 0.11, z1 + 0.195, [0, -1]);
    });
    void f;
    void D;
  },

  'glastuer-kuehlung'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    b.box('anthrazit', [x1, x2, z1 + 0.04, z2], 0, 0.15);
    b.box('anthrazit', [x1, x2, z1 + 0.04, z2], H - 0.25, H);
    b.box('kuehlwand', [x1, x2, z2 - 0.05, z2], 0.15, H - 0.25);
    for (const x of [x1, x2 - 0.04]) b.box('anthrazit', [x, x + 0.04, z1 + 0.04, z2], 0, H);
    const levels = [0.18, 0.55, 0.92, 1.28, 1.6];
    for (const y of levels.slice(1)) b.box('weiss', [x1 + 0.04, x2 - 0.04, z1 + 0.12, z2 - 0.05], y - 0.02, y);
    const n = m.faecher.length;
    const L = (x2 - x1) / n;
    m.faecher.forEach((fach, i) => {
      const a1 = x1 + i * L + 0.05;
      const a2 = x1 + (i + 1) * L - 0.05;
      ctx.products.placeFace(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.14, dir: [0, -1], levels: levels.slice().reverse().map((y) => ({ y, maxH: 0.32, depth: z2 - z1 - 0.22 })), tagOut: 0.024, tagDy: -0.014 });
      sign(ctx.extra, fach.name, { w: L - 0.12, h: 0.16, bg: '#25282a', fg: '#efe7d6', font: '500', accent: '#6d4a63', sub: fach.code }, (a1 + a2) / 2, H - 0.12, z1 + 0.035, [0, -1]);
    });
    // Glastüren mit Griffen und LED-Kanten
    const doors = n * 2;
    const dw = (x2 - x1 - 0.08) / doors;
    for (let i = 0; i < doors; i++) {
      const a = x1 + 0.04 + i * dw;
      b.box('glas', [a + 0.01, a + dw - 0.01, z1 + 0.06, z1 + 0.075], 0.16, H - 0.26);
      b.box('anthrazit', [a, a + 0.02, z1 + 0.05, z1 + 0.085], 0.15, H - 0.25);
      b.box('kuehlLicht', [a + 0.005, a + 0.015, z1 + 0.085, z1 + 0.088], 0.2, H - 0.3);
      const hx = i % 2 ? a + 0.06 : a + dw - 0.06;
      b.box('chrom', [hx - 0.012, hx + 0.012, z1 + 0.02, z1 + 0.05], 0.8, 1.4);
    }
    b.box('anthrazit', [x2 - 0.02, x2, z1 + 0.05, z1 + 0.085], 0.15, H - 0.25);
  },

  weinregal(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    b.box('eicheDunkel', [x1, x2, z2 - 0.04, z2], 0, H);
    const n = m.faecher.length;
    const L = (x2 - x1) / n;
    for (let i = 0; i <= n; i++) {
      const x = x1 + i * L;
      b.box('holzDunkel', [Math.max(x1, x - 0.025), Math.min(x2, x + 0.025), z1, z2], 0, H);
    }
    const levels = [0.08, 0.45, 0.82, 1.19, 1.56];
    for (const y of levels) {
      b.box('holz', [x1, x2, z1, z2 - 0.04], y - 0.03, y);
      ctx.priceRailAt([x1, x2, z1 - 0.012, z1], y - 0.07, y - 0.03, [0, -1], 'preisDunkel');
    }
    b.box('holzDunkel', [x1, x2, z1, z2], H - 0.05, H);
    m.faecher.forEach((fach, i) => {
      const a1 = x1 + i * L + 0.04;
      const a2 = x1 + (i + 1) * L - 0.04;
      ctx.products.placeFace(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.02, dir: [0, -1], levels: levels.slice().reverse().map((y) => ({ y, maxH: 0.34, depth: z2 - z1 - 0.08 })), rows: 2, tagOut: 0.039, tagDy: -0.05 });
      sign(ctx.extra, fach.name, { w: L - 0.14, h: 0.22, chalk: true, sub: `${fach.code} · passt zum Rezept` }, (a1 + a2) / 2, H + 0.15, z1 + 0.25, [0, -1]);
      b.box('holzDunkel', [(a1 + a2) / 2 - 0.01, (a1 + a2) / 2 + 0.01, z1 + 0.25, z1 + 0.27], H, H + 0.06);
    });
  },

  'basis-regal'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const xc = (x1 + x2) / 2;
    const seiten = Object.keys(m.seiten);
    const doppelt = seiten.length > 1;
    // Trockensortiment wie im Vollsortimenter: helles Metallregal, klare helle Schilder
    b.box('regalGrau', [x1 + 0.03, x2 - 0.03, z1 + 0.02, z2 - 0.02], 0, 0.1);
    // Rückwand: beim Wandregal an der Wand, bei der Gondel in der Mitte
    const back = doppelt ? [xc - 0.02, xc + 0.02] : m.seiten.links ? [x2 - 0.04, x2] : [x1, x1 + 0.04];
    b.box('regalWeiss', [back[0], back[1], z1, z2], 0.1, H);
    for (const z of [z1, z2 - 0.03]) b.box('regalWeiss', [x1, x2, z, z + 0.03], 0, H);
    const levels = H > 1.8 ? [0.1, 0.45, 0.82, 1.2, 1.56] : [0.1, 0.45, 0.82, 1.2];
    for (const seite of seiten) {
      const f = faceFrame(m.rechteck, seite);
      const depth = doppelt ? (x2 - x1) / 2 - 0.04 : x2 - x1 - 0.06;
      for (const y of levels.slice(1)) {
        b.box('regalGrau', faceRect(f, z1 + 0.03, z2 - 0.03, 0, -depth), y - 0.025, y);
        ctx.priceRail(f, z1 + 0.03, z2 - 0.03, y - 0.065, y - 0.025);
      }
      const secs = m.seiten[seite];
      const L = (z2 - z1) / secs.length;
      secs.forEach((s, i) => {
        const a1 = z1 + i * L + 0.04;
        const a2 = z1 + (i + 1) * L - 0.04;
        ctx.products.placeFace(s.code, { along: 'z', from: a1, to: a2, front: f.front, dir: f.dir, levels: levels.slice().reverse().map((y, k, arr) => ({ y, maxH: k === 0 ? 0.36 : arr[k - 1] - y - 0.04, depth })), rows: 2, tagOut: 0.008 });
        const [sx, sz] = f.at((a1 + a2) / 2, 0.02);
        // Basis ohne Kürzel auf dem Schild; Vorspeisen mit Bezug zur Kochwelt
        const wf = WELT_FARBE[(WELTEN[s.code] || {}).welt];
        const bs = { bg: '#25282a', fg: '#efe7d6', font: '500', accent: wf || '#3f5873', sub: s.unter || null };
        if (H > 1.8) sign(ctx.extra, s.name, { ...bs, w: Math.min(1.5, L - 0.2), h: 0.2 }, sx, H - 0.14, sz, f.dir);
        else {
          const [px, pz] = f.at((a1 + a2) / 2, -0.01);
          b.box('anthrazit', [px - 0.01, px + 0.01, pz - 0.01, pz + 0.01], H, H + 0.25);
          sign(ctx.extra, s.name, { ...bs, w: Math.min(1.5, L - 0.2), h: 0.2 }, sx, H + 0.33, sz, f.dir);
        }
      });
    }
    b.box('regalWeiss', [x1, x2, z1, z2], H - 0.03, H);
    // Blende mit Lichtleiste über dem Regal (nur Wandregal)
    if (!doppelt) {
      for (const seite of seiten) {
        const f = faceFrame(m.rechteck, seite);
        b.box('regalWeiss', faceRect(f, z1, z2, 0.12, -0.02), H, H + 0.12);
        b.box('led', faceRect(f, z1 + 0.02, z2 - 0.02, 0.1, 0.0), H - 0.005, H);
      }
    }
  },

  kochtresen(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    // Korpus mit Eichen-Lamellen zur Zuschauerseite, Sockel mit Schattenfuge, Terrazzo-Platte mit Überstand
    b.box('front', [x1, x2, z1 + 0.04, z2], 0.08, h - 0.04);
    b.box('schwarzMatt', [x1 + 0.03, x2 - 0.03, z1 + 0.08, z2 - 0.03], 0, 0.08);
    for (let x = x1 + 0.03; x < x2 - 0.03; x += 0.06) b.box('eiche', [x, x + 0.035, z1 + 0.005, z1 + 0.04], 0.08, h - 0.04);
    b.box('terrazzo', [x1 - 0.04, x2 + 0.04, z1 - 0.12, z2 + 0.02], h - 0.04, h);
    // kleine Messingplakette statt großer Schrift
    b.box('messing', [(x1 + x2) / 2 - 0.3, (x1 + x2) / 2 + 0.3, z1 - 0.002, z1 + 0.005], 0.62, 0.72);
    plane(ctx.extra, lit(TEX.plakette(), { metalness: 0.5, roughness: 0.4 }), 0.58, 0.09, (x1 + x2) / 2, 0.67, z1 - 0.004, [0, -1]);
    // Kochfeld, Töpfe, Pfanne, Brett mit Gemüse
    const cx = (x1 + x2) / 2;
    b.box('schwarz', [cx - 0.45, cx + 0.15, z2 - 0.5, z2 - 0.1], h, h + 0.008);
    b.geo('topf', G.disc(0.13, 0.15), cx - 0.3, h + 0.085, z2 - 0.3);
    b.geo('topf', G.disc(0.14, 0.04), cx, h + 0.03, z2 - 0.32);
    b.geo('schwarz', G.box(0.3, 0.02, 0.03), cx + 0.25, h + 0.04, z2 - 0.32, 0.2);
    b.box('brett', [cx + 0.45, cx + 0.85, z2 - 0.45, z2 - 0.18], h, h + 0.025);
    ctx.fresh.crate(b, cx + 0.65, h + 0.025, z2 - 0.315, 0.3, 0.2, 'tomate', 0);
    for (let i = 0; i < 6; i++) b.geo('teller', G.disc(0.06, 0.015, 20), x1 + 0.3 + i * 0.32, h + 0.008, z1 + 0.12); // Probierschälchen an den Barplätzen
    // Induktionsfeld mit Kochzonen
    for (const [dx, dz, r] of [[-0.32, -0.2, 0.09], [-0.1, -0.35, 0.07], [0.02, -0.18, 0.1]]) b.geo('kochzone', new THREE.RingGeometry(r - 0.006, r, 24), cx + dx, h + 0.0095, z2 + dz, 0, -Math.PI / 2);
    // Dunstabzugshaube (Inselesse): Edelstahl-Schirm über dem Kochfeld mit Fettfilter, LED und Kamin bis zur Decke
    const hx = cx - 0.15;
    const hz = z2 - 0.3;
    const yb = 1.92;
    const canopy = new THREE.CylinderGeometry(0.2, 0.5, 0.3, 4, 1);
    canopy.rotateY(Math.PI / 4);
    canopy.scale(1.3, 1, 0.95);
    b.geo('edelstahl', canopy, hx, yb + 0.07 + 0.15, hz);
    b.box('edelstahl', [hx - 0.46, hx + 0.46, hz - 0.34, hz + 0.34], yb, yb + 0.07);
    b.box('gitter', [hx - 0.42, hx + 0.42, hz - 0.3, hz + 0.3], yb - 0.004, yb);
    b.box('led', [hx - 0.4, hx - 0.3, hz - 0.28, hz + 0.28], yb - 0.006, yb - 0.004);
    b.box('led', [hx + 0.3, hx + 0.4, hz - 0.28, hz + 0.28], yb - 0.006, yb - 0.004);
    b.box('edelstahl', [hx - 0.14, hx + 0.14, hz - 0.12, hz + 0.12], yb + 0.37, 3.2);
    b.box('schwarz', [hx - 0.1, hx + 0.1, hz - 0.345, hz - 0.34], yb + 0.02, yb + 0.05);
    // Pendelleuchten über dem Tresen (Zuschauerseite), links und rechts der Haube
    for (const dx of [-0.85, 0.85]) {
      b.box('metall', [cx + dx - 0.003, cx + dx + 0.003, z1 + 0.2 - 0.003, z1 + 0.2 + 0.003], 1.95, 3.2);
      b.geo('messing', new THREE.CylinderGeometry(0.07, 0.11, 0.16, 20, 1, true), cx + dx, 1.9, z1 + 0.2);
      b.geo('led', new THREE.CircleGeometry(0.1, 20), cx + dx, 1.83, z1 + 0.2, 0, Math.PI / 2);
    }
    // Messer- und Utensilienleiste
    // Schild hängt zur Zuschauerseite
    sign(ctx.extra, 'Showküche', { w: 1.6, h: 0.3, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, sub: 'Live-Cooking täglich 11:30–13:30 · 17:30–19 Uhr' }, cx - 0.15, 2.45, z2 - 0.76, [0, -1]);
  },

  // Probiertheke: Stehtisch aus Eiche mit Probierschälchen für das Live-Cooking (keine Kursplätze)
  probiertheke(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    const xc = (x1 + x2) / 2;
    const zc = (z1 + z2) / 2;
    b.box('schwarzMatt', [xc - 0.35, xc + 0.35, zc - 0.25, zc + 0.25], 0, 0.04);
    b.box('front', [xc - 0.3, xc + 0.3, zc - 0.2, zc + 0.2], 0.04, h - 0.05);
    for (let x = xc - 0.28; x < xc + 0.28; x += 0.05) b.box('eiche', [x, x + 0.03, zc - 0.215, zc - 0.2], 0.08, h - 0.08);
    b.box('eiche', [x1, x2, z1 + 0.15, z2 - 0.15], h - 0.05, h);
    for (let i = 0; i < 8; i++) {
      const x = x1 + 0.25 + (i % 4) * ((x2 - x1 - 0.5) / 3);
      const z = i < 4 ? z1 + 0.32 : z2 - 0.32;
      b.geo('teller', G.disc(0.045, 0.02, 16), x, h + 0.01, z);
      b.geo('holz', G.box(0.004, 0.004, 0.09), x + 0.05, h + 0.004, z, 0.6);
    }
    b.box('brett', [xc - 0.25, xc + 0.25, zc - 0.12, zc + 0.12], h, h + 0.025);
    ctx.fresh.crate(b, xc, h + 0.025, zc, 0.36, 0.16, 'tomate', 0);
    sign(ctx.extra, 'Probieren erwünscht', { w: 0.5, h: 0.12, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, xc, h + 0.1, z1 + 0.15, [0, -1]);
  },

  // Sitzecke in der Showküche: Polsterbank an der Glaswand, zwei Bistrotische mit Stühlen (Probierportionen im Sitzen)
  sitzecke(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const bx2 = x1 + 0.45;
    // Bank: Sockel, Sitzpolster, Rückenpolster
    b.box('schwarzMatt', [x1 + 0.02, bx2, z1, z2], 0, 0.06);
    b.box('eiche', [x1, bx2, z1, z2], 0.06, 0.4);
    b.box('polster', [x1 + 0.04, bx2, z1 + 0.02, z2 - 0.02], 0.4, 0.47);
    b.box('polster', [x1, x1 + 0.1, z1 + 0.02, z2 - 0.02], 0.47, 0.95);
    for (let z = z1 + 0.45; z < z2 - 0.2; z += 0.45) b.box('akzent', [x1 + 0.1, x1 + 0.105, z - 0.002, z + 0.002], 0.5, 0.92);
    // Ein durchgehender Tisch entlang der Bank, gegenüber vier Stühle
    const tx1 = bx2 + 0.08;
    const tx2 = bx2 + 0.62;
    const tz1 = z1 + 0.25;
    const tz2 = z2 - 0.2;
    for (const z of [tz1 + 0.12, tz2 - 0.12]) {
      b.box('schwarzMatt', [(tx1 + tx2) / 2 - 0.2, (tx1 + tx2) / 2 + 0.2, z - 0.03, z + 0.03], 0, 0.02);
      b.box('schwarzMatt', [(tx1 + tx2) / 2 - 0.025, (tx1 + tx2) / 2 + 0.025, z - 0.025, z + 0.025], 0.02, 0.71);
    }
    b.box('schwarzMatt', [(tx1 + tx2) / 2 - 0.02, (tx1 + tx2) / 2 + 0.02, tz1 + 0.12, tz2 - 0.12], 0.66, 0.7);
    b.box('eiche', [tx1, tx2, tz1, tz2], 0.71, 0.75);
    const L2 = tz2 - tz1;
    for (let k = 0; k < 4; k++) {
      const tz = tz1 + (k + 0.5) * (L2 / 4);
      b.geo('teller', G.disc(0.085, 0.015, 20), tx1 + 0.17, 0.76, tz);
      b.geo('teller', G.disc(0.085, 0.015, 20), tx2 - 0.17, 0.76, tz + 0.05);
      if (k % 2) b.geo('glas', G.disc(0.03, 0.11, 12), (tx1 + tx2) / 2, 0.81, tz + 0.15);
      const cx = tx2 + 0.26;
      const cz = tz;
      for (const [ox, oz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) b.box('schwarzMatt', [cx + ox - 0.012, cx + ox + 0.012, cz + oz - 0.012, cz + oz + 0.012], 0, 0.45);
      b.box('eiche', [cx - 0.2, cx + 0.2, cz - 0.2, cz + 0.2], 0.45, 0.48);
      b.box('eiche', [cx + 0.17, cx + 0.2, cz - 0.19, cz + 0.19], 0.48, 0.85);
    }
    sign(ctx.extra, 'Platz nehmen & probieren', { w: 0.62, h: 0.13, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, x1 + 0.025, 1.25, (z1 + z2) / 2, [1, 0]);
  },

  // Einkaufskörbe mit Rollen und Teleskopgriff (statt Einkaufswagen), zwei Stapel direkt links hinter dem Eingang
  rollkoerbe(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    if (!b.materials.korb) b.materials.korb = std(0x7d2a24, 0.6);
    if (!b.materials.korbGriff) b.materials.korbGriff = std(0x1f2022, 0.5, 0.3);
    const n = 2;
    const sw = (x2 - x1) / n;
    for (let s = 0; s < n; s++) {
      const cx = x1 + (s + 0.5) * sw;
      const bw = sw - 0.08;
      const za = z1 + 0.02;
      const zb = z2 - 0.06;
      // Achse mit Rollen am hinteren Ende, Stapel ineinander
      for (const dx of [-bw / 2 + 0.03, bw / 2 - 0.03]) b.geo('korbGriff', G.disc(0.035, 0.025, 14), cx + dx, 0.035, zb - 0.03, 0, 0, Math.PI / 2);
      const k = 7;
      for (let i = 0; i < k; i++) {
        const y = 0.06 + i * 0.05;
        const t = 0.006;
        const hh = 0.26;
        b.box('korb', [cx - bw / 2, cx + bw / 2, za, zb], y, y + t);
        b.box('korb', [cx - bw / 2, cx - bw / 2 + t, za, zb], y, y + hh);
        b.box('korb', [cx + bw / 2 - t, cx + bw / 2, za, zb], y, y + hh);
        b.box('korb', [cx - bw / 2, cx + bw / 2, za, za + t], y, y + hh);
        b.box('korb', [cx - bw / 2, cx + bw / 2, zb - t, zb], y, y + hh);
        b.box('korbGriff', [cx - bw / 2, cx + bw / 2, za - 0.004, za], y + hh - 0.03, y + hh);
      }
      // Teleskopgriff des obersten Korbs (ausgezogen)
      const ytop = 0.06 + (k - 1) * 0.05 + 0.26;
      for (const dx of [-bw / 2 + 0.02, bw / 2 - 0.02]) b.box('korbGriff', [cx + dx - 0.008, cx + dx + 0.008, zb - 0.02, zb - 0.004], ytop - 0.05, ytop + 0.42);
      b.box('korbGriff', [cx - bw / 2 + 0.01, cx + bw / 2 - 0.01, zb - 0.025, zb], ytop + 0.4, ytop + 0.44);
    }
    sign(ctx.extra, 'Rollkorb nehmen', { w: 0.5, h: 0.14, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, sub: 'ziehen statt schieben' }, 5.9, 1.5, 0.06, [0, 1]);
  },

  kuechenzeile(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    const fx2 = x2 - 0.5; // daneben Hochschrank (Kühlschrank)
    b.box('front', [x1, fx2, z1 + 0.02, z2], 0.1, h - 0.04);
    b.box('schwarzMatt', [x1, fx2, z1 + 0.06, z2], 0, 0.1);
    b.box('terrazzo', [x1, fx2, z1 - 0.02, z2], h - 0.04, h);
    // Fronten mit Fugen und Messing-Griffleisten
    for (let x = x1 + 0.6; x < fx2; x += 0.6) b.box('schwarzMatt', [x - 0.004, x + 0.004, z1 + 0.015, z1 + 0.02], 0.12, h - 0.06);
    for (let x = x1 + 0.1; x < fx2 - 0.3; x += 0.6) b.box('messing', [x, x + 0.4, z1 + 0.008, z1 + 0.018], h - 0.12, h - 0.1);
    // Spritzschutz Edelstahl vor der Glaswand
    b.box('edelstahl', [x1, fx2, z2 - 0.02, z2], h, h + 0.5);
    // Hängeleiste mit Pfannen
    b.box('messing', [x1 + 0.2, x1 + 1.8, z2 - 0.06, z2 - 0.04], 1.75, 1.77);
    for (let i = 0; i < 4; i++) {
      const px = x1 + 0.4 + i * 0.4;
      b.box('metall', [px - 0.003, px + 0.003, z2 - 0.06, z2 - 0.05], 1.55, 1.76);
      b.geo(i % 2 ? 'topf' : 'kupfer', G.disc(0.09 + (i % 2) * 0.02, 0.02, 20), px, 1.45, z2 - 0.08, 0, Math.PI / 2);
    }
    // Spüle + Armatur, Backofen
    b.box('edelstahl', [x1 + 0.3, x1 + 0.9, z1 + 0.08, z2 - 0.1], h - 0.01, h + 0.002);
    b.box('schwarz', [x1 + 0.35, x1 + 0.85, z1 + 0.12, z2 - 0.14], h - 0.005, h + 0.004);
    b.box('chrom', [x1 + 0.58, x1 + 0.62, z2 - 0.12, z2 - 0.08], h, h + 0.35);
    b.box('chrom', [x1 + 0.58, x1 + 0.62, z2 - 0.32, z2 - 0.08], h + 0.31, h + 0.35);
    b.box('schwarz', [x1 + 1.3, x1 + 1.9, z1 + 0.012, z1 + 0.02], 0.2, 0.8);
    b.box('chrom', [x1 + 1.35, x1 + 1.85, z1 + 0.0, z1 + 0.012], 0.72, 0.74);
    // Hochschrank / Kühlschrank
    b.box('edelstahl', [fx2 + 0.02, x2, z1, z2], 0, 2.1);
    b.box('chrom', [fx2 + 0.06, fx2 + 0.08, z1 - 0.03, z1], 0.9, 1.5);
    // Gewürzbord + Vorrat
    b.box('holz', [x1 + 1.0, fx2 - 0.1, z2 - 0.22, z2], 1.45, 1.48);
    for (let i = 0; i < 10; i++) ctx.products.add(ctx.products.pick('B3', i), x1 + 1.05 + i * 0.12, 1.48, z2 - 0.1, [0, -1]);
    b.box('anthrazit', [x1 + 1.0, x1 + 1.02, z2 - 0.02, z2], h, 1.48);
    void TEX.kurskueche;
  },

  hocker(b, m) {
    for (const [x, z] of m.stationen) {
      b.geo('chrom', G.disc(0.02, m.hoehe - 0.05, 12), x, (m.hoehe - 0.05) / 2, z);
      b.geo('chrom', G.disc(0.19, 0.02), x, 0.01, z);
      b.geo('chrom', new THREE.TorusGeometry(0.14, 0.01, 6, 24), x, 0.28, z, 0, Math.PI / 2);
      b.geo('polster', G.disc(0.18, 0.06, 28), x, m.hoehe, z);
    }
  },

  'kasse-band'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    b.box('korpus', [x1, x2, z1, z2], 0.08, h - 0.04);
    b.box('anthrazit', [x1 + 0.02, x2 - 0.02, z1 + 0.02, z2 - 0.02], 0, 0.08);
    b.box('weiss', [x1 - 0.02, x2 + 0.02, z1, z2], h - 0.04, h);
    // Band (Kundenseite), Scanner, Bildschirme
    b.box('schwarz', [x1 + 0.05, x1 + 0.45, z1 + 0.9, z2 - 0.05], h, h + 0.012);
    b.box('chrom', [x1 + 0.03, x1 + 0.05, z1 + 0.9, z2 - 0.05], h, h + 0.05);
    b.box('schwarz', [x1 + 0.12, x2 - 0.15, z1 + 0.6, z1 + 0.85], h, h + 0.1);
    b.box('glas', [x1 + 0.15, x2 - 0.2, z1 + 0.62, z1 + 0.83], h + 0.1, h + 0.105);
    b.geo('schwarz', G.box(0.3, 0.22, 0.03), x2 - 0.1, h + 0.28, z1 + 0.55, -Math.PI / 2, -0.15);
    plane(ctx.extra, unlit(TEX.posScreen()), 0.27, 0.19, x2 - 0.083, h + 0.28, z1 + 0.55, [1, 0], -0.15);
    b.geo('schwarz', G.box(0.18, 0.12, 0.02), x1 + 0.08, h + 0.2, z1 + 0.35, Math.PI / 2, -0.15);
    b.box('metall', [x1 + 0.07, x1 + 0.09, z1 + 0.34, z1 + 0.36], h, h + 0.13);
    // Ablage am Ende, Tütenhalter
    b.box('weiss', [x1 - 0.35, x1, z1, z1 + 0.5], h - 0.12, h - 0.08);
    sign(ctx.extra, 'Kasse 1', { w: 0.6, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, (x1 + x2) / 2, 2.45, (z1 + z2) / 2, [-1, 0]);
    sign(ctx.extra, 'Kasse 1', { w: 0.6, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, (x1 + x2) / 2, 2.45, (z1 + z2) / 2 + 0.01, [0, 1]);
    b.box('metall', [(x1 + x2) / 2 - 0.006, (x1 + x2) / 2 + 0.006, (z1 + z2) / 2 - 0.006, (z1 + z2) / 2 + 0.006], 2.55, 3.2);
  },

  'sb-kasse'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const mat = unlit(TEX.sbScreen());
    for (const zc of [z1 + 0.5, z2 - 0.5]) {
      b.box('anthrazit', [x1 + 0.15, x2 - 0.05, zc - 0.3, zc + 0.3], 0, 0.85);
      b.box('weiss', [x1 + 0.05, x2, zc - 0.32, zc + 0.32], 0.85, 0.9);
      b.box('glas', [x1 + 0.15, x1 + 0.45, zc - 0.18, zc + 0.12], 0.9, 0.905);
      b.box('anthrazit', [x2 - 0.15, x2 - 0.05, zc - 0.05, zc + 0.05], 0.9, 1.3);
      b.geo('schwarz', G.box(0.36, 0.28, 0.03), x2 - 0.18, 1.32, zc, -Math.PI / 2, -0.25);
      plane(ctx.extra, mat, 0.33, 0.25, x2 - 0.163, 1.32, zc, [-1, 0], -0.25);
      // Ablage für Taschen
      b.box('chrom', [x1 + 0.05, x1 + 0.4, zc + 0.15, zc + 0.32], 0.88, 0.9);
    }
    sign(ctx.extra, 'SB-Kasse', { w: 0.7, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, (x1 + x2) / 2 - 0.2, 2.45, (z1 + z2) / 2, [-1, 0]);
    sign(ctx.extra, 'SB-Kasse', { w: 0.7, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true }, (x1 + x2) / 2 - 0.2, 2.45, (z1 + z2) / 2 + 0.01, [0, 1]);
    b.box('metall', [(x1 + x2) / 2 - 0.206, (x1 + x2) / 2 - 0.194, (z1 + z2) / 2 - 0.006, (z1 + z2) / 2 + 0.006], 2.55, 3.2);
  },

  impulsregal(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    b.box('schwarzMatt', [x1, x1 + 0.04, z1, z2], 0, H);
    for (const z of [z1, z2 - 0.03]) b.box('schwarzMatt', [x1, x2, z, z + 0.03], 0, H);
    const levels = [0.08, 0.42, 0.76, 1.08];
    for (const y of levels) {
      b.box('eiche', [x1 + 0.04, x2, z1 + 0.03, z2 - 0.03], y - 0.025, y);
      ctx.priceRailAt([x2, x2 + 0.012, z1 + 0.03, z2 - 0.03], y - 0.06, y - 0.025, [1, 0], 'preisDunkel');
      void y;
    }
    ctx.products.placeFace('IMPULS', { along: 'z', from: z1 + 0.03, to: z2 - 0.03, front: x2, dir: [1, 0], levels: levels.slice().reverse().map((y) => ({ y, maxH: 0.3, depth: x2 - x1 - 0.06 })), rows: 2, tagOut: 0.019, tagDy: -0.043 });
    b.box('akzent', [x1, x2, z1, z2], H - 0.02, H);
    b.box('anthrazit', [x1 + 0.01, x1 + 0.03, (z1 + z2) / 2 - 0.01, (z1 + z2) / 2 + 0.01], H, H + 0.25);
    sign(ctx.extra, 'Noch etwas dazu?', { w: 1.3, h: 0.28, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, sub: 'Kräuter · Schokolade · Riegel' }, x1 + 0.035, H + 0.33, (z1 + z2) / 2, [1, 0]);
  },

  glasbruestung(b, m) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const xc = (x1 + x2) / 2;
    b.box('glas', [xc - 0.006, xc + 0.006, z1, z2], 0.05, H - 0.04);
    b.box('edelstahl', [x1, x2, z1, z2], H - 0.04, H);
  },

  // Raumhohe Glaswand mit schmalem Schwarzstahlrahmen, satiniertem Sichtschutzband und Pfosten alle ~1,2 m
  glaswand(b, m, ctx) {
    const H = m.hoehe;
    if (!ctx.etchMat) {
      ctx.etchMat = new THREE.MeshStandardMaterial({ map: TEX.glasband(), transparent: true, roughness: 0.4, depthWrite: false });
    }
    for (const [ax, az, bx, bz] of m.segmente) {
      const alongX = Math.abs(bx - ax) > Math.abs(bz - az);
      const len = alongX ? bx - ax : bz - az;
      const c = alongX ? (az + bz) / 2 : (ax + bx) / 2;
      const rect = (a1, a2, t) => (alongX ? [a1, a2, c - t, c + t] : [c - t, c + t, a1, a2]);
      const a0 = alongX ? ax : az;
      // Glas
      b.box('glas', rect(a0, a0 + len, 0.005), 0.06, H - 0.05);
      // Rahmen: Bodenschiene, Kopfschiene, Pfosten
      b.box('schwarzMatt', rect(a0, a0 + len, 0.025), 0, 0.06);
      b.box('schwarzMatt', rect(a0, a0 + len, 0.025), H - 0.05, H);
      const n = Math.max(1, Math.round(len / 1.2));
      for (let i = 0; i <= n; i++) {
        const p = a0 + (i * len) / n;
        b.box('schwarzMatt', rect(Math.max(a0, p - 0.02), Math.min(a0 + len, p + 0.02), 0.025), 0, H);
      }
      // satiniertes Band mit Schriftzug (beidseitig)
      const mid = a0 + len / 2;
      for (const s2 of [-1, 1]) {
        const dir = alongX ? [0, s2] : [s2, 0];
        const [px, pz] = alongX ? [mid, c + s2 * 0.007] : [c + s2 * 0.007, mid];
        const pl = plane(ctx.extra, ctx.etchMat, len - 0.06, 0.26, px, 1.25, pz, dir);
        pl.renderOrder = 2;
      }
    }
  },

  // Begehbare Zelle im Lager (Kühlzelle oder Tiefkühlzelle): Paneelwände, Tür, Temperaturanzeige,
  // Kälteaggregat auf dem Dach und eine Dachbeschriftung für die Draufsicht.
  kuehlzelle(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const tk = m.temp && m.temp.startsWith('−');
    if (!b.materials.zelle) b.materials.zelle = lit(TEX.kuehlzelle());
    b.box('kuehlwand', [x1, x2, z1, z2], 0, H);
    // Paneel-Fugen an den sichtbaren Seiten
    plane(ctx.extra, b.materials.zelle, x2 - x1, H, (x1 + x2) / 2, H / 2, z2 + 0.006, [0, 1]);
    plane(ctx.extra, b.materials.zelle, z2 - z1, H, x2 + 0.006, H / 2, (z1 + z2) / 2, [1, 0]);
    // Tür rechts zum Lagergang; eine Zelle mit tuer: 'innen' wird über die Nachbarzelle betreten (Vorraum)
    if (m.tuer !== 'innen') {
      const tz = (z1 + z2) / 2;
      const zr = [tz - 0.45, tz + 0.45];
      b.box(tk ? 'anthrazit' : 'edelstahl', [x2, x2 + 0.03, zr[0], zr[1]], 0.05, 2.05);
      b.box('chrom', [x2 + 0.03, x2 + 0.07, zr[0] + 0.1, zr[0] + 0.15], 0.95, 1.2);
      sign(ctx.extra, m.schild || m.name, { w: 1.3, h: 0.2, bg: tk ? '#1d3b5c' : '#25282a', fg: '#efe7d6', font: '600', brass: !tk }, x2 + 0.035, 2.25, tz, [1, 0]);
      sign(ctx.extra, m.temp, { w: 0.34, h: 0.14, bg: '#1c1c1f', fg: tk ? '#7fb6ff' : '#4f8a6a', font: '700' }, x2 + 0.04, 1.75, zr[0] - 0.25, [1, 0]);
    }
    // Kälteaggregat(e) auf dem Dach
    const n = Math.max(1, Math.round((x2 - x1) / 3));
    for (let i = 0; i < n; i++) {
      const cx = x1 + ((i + 0.5) * (x2 - x1)) / n;
      b.box('metall', [cx - 0.4, cx + 0.4, z2 - 0.62, z2 - 0.1], H, H + 0.34);
      b.geo('schwarz', G.disc(0.19, 0.02, 20), cx, H + 0.35, z2 - 0.36, 0, 0);
    }
    // Dachbeschriftung (in der Draufsicht lesbar)
    const tex = canvasTex(Math.round(160 * (x2 - x1) / (z2 - z1 - 0.8)), 160, (g, W, Hh) => {
      g.fillStyle = tk ? '#d6e4f2' : '#e4ecef';
      g.fillRect(0, 0, W, Hh);
      g.fillStyle = tk ? '#1d3b5c' : '#2c3b40';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      fitText(g, m.dach || m.name, W / 2, 62, W - 30, 800, 54);
      g.font = `700 40px ${SANS}`;
      g.fillText(m.temp, W / 2, 122);
    });
    const rd = z2 - z1 - 0.8;
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(x2 - x1 - 0.1, rd), lit(tex));
    roof.rotation.x = -Math.PI / 2;
    roof.position.set((x1 + x2) / 2, H + 0.005, -(z1 + 0.06 + rd / 2));
    ctx.extra.add(roof);
  },

  lagerregal(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const alongX = x2 - x1 > z2 - z1;
    const len = alongX ? x2 - x1 : z2 - z1;
    const levels = [0.05, 0.75, 1.45, 2.1];
    // Pfosten
    for (let s = 0; s <= len + 0.01; s += len / Math.max(1, Math.round(len / 1.2))) {
      for (const d of [0, 1]) {
        const r = alongX ? [x1 + Math.min(s, len - 0.05), x1 + Math.min(s, len - 0.05) + 0.05, d ? z2 - 0.05 : z1, d ? z2 : z1 + 0.05] : [d ? x2 - 0.05 : x1, d ? x2 : x1 + 0.05, z1 + Math.min(s, len - 0.05), z1 + Math.min(s, len - 0.05) + 0.05];
        b.box('akzent', r, 0, H);
      }
    }
    for (const y of levels) b.box('metall', [x1, x2, z1, z2], y, y + 0.04);
    // Kartons
    const dir = alongX ? [0, -1] : [-1, 0];
    let k = 0;
    for (const y of levels.slice(0, 3)) {
      for (let s = 0.35; s < len - 0.25; s += 0.62) {
        const label = m.kartons[k++ % m.kartons.length];
        const x = alongX ? x1 + s : (x1 + x2) / 2;
        const z = alongX ? (z1 + z2) / 2 : z1 + s;
        ctx.acc.carton(b, label, x, y + 0.04, z, dir, [0.55, 0.4, Math.min(x2 - x1, z2 - z1) - 0.06]);
      }
    }
  },

  kartonstapel(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    b.box('anthrazit', [x1, x2, z1, z2], 0.05, 0.12);
    for (const x of [x1 + 0.05, x2 - 0.1]) for (const z of [z1 + 0.05, z2 - 0.1]) b.geo('schwarz', G.disc(0.04, 0.05, 12), x + 0.025, 0.025, z + 0.025, 0, Math.PI / 2);
    const labels = ['WARENEINGANG', 'FRISCHE', 'TK'];
    for (let i = 0; i < 3; i++) ctx.acc.carton(b, labels[i], (x1 + x2) / 2, 0.12 + i * 0.32, (z1 + z2) / 2, [0, -1], [x2 - x1 - 0.06, 0.3, z2 - z1 - 0.06]);
  },
};


// ---------- Obst/Gemüse: Kugeln, Ovale, Stangen in einer Kiste ----------
class Fresh {
  constructor() {
    this.geo = { kugel: new THREE.SphereGeometry(1, 10, 8), oval: new THREE.SphereGeometry(1, 10, 8), stange: new THREE.CylinderGeometry(1, 0.7, 1, 8) };
    this.mats = {};
  }
  // Kiste mit Mitte (x, y = Oberkante Kistenboden, z), Größe w × d, Drehung yaw, Neigung pitch
  crate(b, x, y, z, w, d, kind, yaw = 0, pitch = 0) {
    const k = FRESH[kind];
    if (!this.mats[kind]) this.mats[kind] = std(new THREE.Color(k.col), 0.55);
    const r = k.r;
    const step = r * 2.05;
    const nx = Math.max(1, Math.floor(w / step));
    const nz = Math.max(1, Math.floor(d / step));
    const o = new THREE.Object3D();
    o.position.set(x, y, -z);
    o.rotation.set(pitch, yaw, 0, 'YXZ');
    o.updateMatrix();
    const v = new THREE.Vector3();
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < nx - layer; i++) {
        for (let j = 0; j < nz - layer; j++) {
          const lx = -w / 2 + r + (i + layer * 0.5) * step + (((i * 7 + j * 3) % 5) - 2) * 0.002;
          const lz = -d / 2 + r + (j + layer * 0.5) * step;
          v.set(lx, r * (k.form === 'stange' ? 0.9 : 0.85) + layer * r * 1.5, lz).applyMatrix4(o.matrix);
          const rot = (i * 1.7 + j * 2.3) % 3.14;
          if (k.form === 'stange') b.instance(`fresh-${kind}`, this.geo.stange, this.mats[kind], { x: v.x, y: v.y, z: -v.z, yaw: yaw + Math.PI / 2, pitch: Math.PI / 2, scale: [r, r * 9, r] });
          else b.instance(`fresh-${kind}`, this.geo[k.form], this.mats[kind], { x: v.x, y: v.y, z: -v.z, yaw: rot, scale: k.form === 'oval' ? [r * 0.8, r * 0.8, r * 1.15] : [r, r * 0.92, r] });
        }
      }
    }
  }
}

// Grundriss-Rechtecke eines Möbels (für Kollision und Beschriftung)
export function footprints(m) {
  if (m.stationen) {
    const r = m.durchmesser / 2 - 0.03;
    return m.stationen.map(([x, z]) => [x - r, x + r, z - r, z + r]);
  }
  if (m.segmente) return m.segmente.map(([a, c, b2, d]) => [Math.min(a, b2), Math.max(a, b2), Math.min(c, d), Math.max(c, d)]);
  if (m.mitte) {
    const half = (Math.abs(m.richtung[0]) * m.laenge + Math.abs(m.richtung[1]) * m.tiefe) / 2;
    const halfZ = (Math.abs(m.richtung[1]) * m.laenge + Math.abs(m.richtung[0]) * m.tiefe) / 2;
    return [[m.mitte[0] - half, m.mitte[0] + half, m.mitte[1] - halfZ, m.mitte[1] + halfZ]];
  }
  const list = [m.rechteck];
  if (m.stuehle_x) for (const x of m.stuehle_x) for (const z of m.stuehle_z) list.push([x - 0.2, x + 0.2, z - 0.2, z + 0.2]);
  return list;
}

export function buildFurniture(layout) {
  const rand = rng(41);
  const b = new Builder({ ...MATERIALS });
  const decor = new Decor();
  Object.assign(b.materials, decor.builderMaterials);
  b.materials.glas = MATERIALS.glas;
  const colliders = [];
  const products = new Products();
  const railMat = lit(TEX.preisleiste(), { roughness: 0.8 });
  railMat.map.wrapS = THREE.RepeatWrapping;
  b.materials.preis = railMat;
  const railDark = lit(TEX.preisleisteDunkel(), { roughness: 0.6 });
  railDark.map.wrapS = THREE.RepeatWrapping;
  b.materials.preisDunkel = railDark;
  const extra = b.extra;
  const ctx = {
    rand,
    extra,
    layout,
    acc: new AccessoryKit(),
    mats: MATERIALS,
    builder: b,
    colliders,
    products,
    fresh: new Fresh(),
    cardMats: {},
    // Preisschiene an einer Regalfront (Abschnitt a1–a2, Höhe y0–y1) – alle in einem Draw Call
    priceRail(f, a1, a2, y0, y1, mat = 'preis') {
      const [x, z] = f.at((a1 + a2) / 2, 0.004);
      this.railGeo(a2 - a1, y1 - y0, x, (y0 + y1) / 2, z, f.dir, mat);
    },
    priceRailAt([x1, x2, z1, z2], y0, y1, dir, mat = 'preis') {
      const alongX = Math.abs(dir[1]) > 0;
      const len = alongX ? x2 - x1 : z2 - z1;
      const x = dir[0] > 0 ? x2 + 0.003 : dir[0] < 0 ? x1 - 0.003 : (x1 + x2) / 2;
      const z = dir[1] > 0 ? z2 + 0.003 : dir[1] < 0 ? z1 - 0.003 : (z1 + z2) / 2;
      this.railGeo(len, y1 - y0, x, (y0 + y1) / 2, z, dir, mat);
    },
    railGeo(len, h, x, y, z, dir, mat = 'preis') {
      const g = new THREE.PlaneGeometry(len, h);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 1.2));
      b.geo(mat, g, x, y, z, yawFacing(dir[0], dir[1]));
    },
  };
  for (const m of layout.moebel) {
    const fn = BUILDERS[m.typ];
    if (!fn) {
      console.warn(`Unbekannter Möbeltyp: ${m.typ} (${m.id})`);
      continue;
    }
    fn.call(BUILDERS[m.typ], b, m, ctx);
    if (!m.mitte) colliders.push(...footprints(m));
  }
  colliders.push(...decor.wall(ctx, layout));

  // Deckenhänger zur Orientierung (beidseitig)
  for (const d of layout.deckenhaenger || []) {
    const [x, z] = d.pos;
    const dir = d.richtung || [0, -1];
    const h = d.h || 0.34;
    const w = d.w || 1.6;
    // Abhängung an zwei Seilen (quer zur Blickrichtung versetzt)
    for (const s of [-1, 1]) {
      const ox = dir[1] !== 0 ? s * (w / 2 - 0.1) : 0;
      const oz = dir[0] !== 0 ? s * (w / 2 - 0.1) : 0;
      b.box('metall', [x + ox - 0.005, x + ox + 0.005, z + oz - 0.005, z + oz + 0.005], (d.y || 2.5) + h / 2, 3.2);
    }
    const opts = { w, h: h * 1.15, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: d.farbe };
    const yaw = yawFacing(dir[0], dir[1]);
    for (const s of [1, -1]) {
      const m = signMesh(titleCase(d.text), opts);
      m.position.set(x, d.y || 2.5, -z);
      m.rotation.y = yaw + (s < 0 ? Math.PI : 0);
      m.translateZ(0.006);
      extra.add(m);
    }
  }

  // Menschen: Personal und Kundschaft
  const staffLook = { top: '#1c1c1f', bag: false, apron: true, jacket: null, skirt: false, sleeves: 'kurz' };
  for (const p of layout.personen || []) {
    if (!p.personal) continue; // Kundschaft: bewegliche Figuren aus crowd.js
    const [x, z] = p.pos;
    const kunde = { basket: p.korb ?? p.haltung === 'stoebern', ...(p.haltung === 'stoebern' ? { bag: false } : {}) };
    addStaticPerson(b, randomLook(rand, p.personal ? staffLook : kunde), x, z, yawFacing(...p.blick), p.haltung || 'stehen');
    colliders.push([x - 0.22, x + 0.22, z - 0.22, z + 0.22]);
  }

  // Feuerlöscher neben dem Notausgang
  const fx = 0.05;
  const fz = 9.35;
  if (!b.materials.rot) b.materials.rot = std(0xa83a30, 0.4);
  b.geo('rot', new THREE.CylinderGeometry(0.075, 0.075, 0.5, 20), fx + 0.1, 0.55, fz);
  b.geo('schwarz', new THREE.CylinderGeometry(0.03, 0.04, 0.08, 12), fx + 0.1, 0.84, fz);
  sign(extra, 'FEUERLÖSCHER', { w: 0.28, h: 0.1, bg: '#a83a30', fg: '#ffffff' }, 0.01, 1.1, fz, [1, 0]);

  const group = b.build('Möbel');
  group.add(products.build());
  return { group, colliders, drawers: null, products };
}

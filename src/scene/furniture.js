// Möbel und Warenträger des Food-Stores „One Hour Kitchen“ aus layout.json (Typ → Bauanleitung).
import * as THREE from 'three';
import { Builder, yawFacing, rng } from './builder.js';
import { signMesh } from './labels.js';
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
};

const G = {
  disc: (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  sphere: new THREE.SphereGeometry(1, 12, 9),
  stick: new THREE.CylinderGeometry(1, 1, 1, 8),
  unit: new THREE.BoxGeometry(1, 1, 1),
};
const E = 0.005;
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
  günstig: { sym: '€', text: 'günstig', sub: '≤ 4 € je Portion', farbe: '#4f6b45' },
};
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
function drawPlate(g, cx, cy, r, rez) {
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
    drawPlate(g, w / 2, 92, 96, r);
    g.restore();
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
  dashboard(layout) {
    // Moderne Bildschirm-Oberfläche: helles UI, Karten mit Foodfotos, Spalten = Küche, Zeilen = Anlass
    const W = 1600;
    const H = 1000;
    return canvasTex(W, H, (g) => {
      g.fillStyle = '#f4f1ec';
      g.fillRect(0, 0, W, H);
      g.textBaseline = 'middle';
      g.fillStyle = '#1f2120';
      g.font = `400 72px ${SERIF}`;
      g.fillText('Was kochst du heute?', 56, 82);
      // Schritte als Chips
      ['1  Küche wählen', '2  Anlass wählen', '3  Rezeptkarte ziehen'].forEach((t, i) => {
        const x = 56 + i * 250;
        g.fillStyle = i === 2 ? '#1f2120' : '#e7e1d7';
        rr(g, x, 134, 232, 44, 22);
        g.fill();
        g.fillStyle = i === 2 ? '#f4f1ec' : '#3a3632';
        g.font = `600 22px ${SANS}`;
        g.fillText(t, x + 22, 157);
      });
      g.fillStyle = '#8a8378';
      g.font = `500 22px ${SANS}`;
      g.textAlign = 'right';
      g.fillText('Rezepte des Monats · Oktober', W - 56, 82);
      g.textAlign = 'left';
      const welten = ['Pasta Night', 'Asian Night', 'Mexican Night'];
      const zeilen = ['schnell', 'besonders', 'günstig'];
      const x0 = 300;
      const gap = 18;
      const cw = (W - x0 - 56 - gap * 2) / 3;
      const y0 = 214;
      const hh = 56;
      const rh = (H - y0 - hh - 40 - gap * 2) / 3;
      welten.forEach((wl, i) => {
        const x = x0 + i * (cw + gap);
        g.fillStyle = WELT_FARBE[wl];
        g.beginPath();
        g.arc(x + 14, y0 + hh / 2, 8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#1f2120';
        g.font = `400 34px ${SERIF}`;
        g.fillText(wl, x + 34, y0 + hh / 2);
      });
      zeilen.forEach((z, j) => {
        const an = ANLASS[z];
        const y = y0 + hh + 12 + j * (rh + gap);
        g.fillStyle = '#1f2120';
        g.beginPath();
        g.arc(86, y + rh / 2 - 22, 30, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#f4f1ec';
        g.font = `700 30px ${SANS}`;
        g.textAlign = 'center';
        g.fillText(an.sym, 86, y + rh / 2 - 21);
        g.textAlign = 'left';
        g.fillStyle = '#1f2120';
        g.font = `600 30px ${SANS}`;
        g.fillText(an.text, 128, y + rh / 2 - 22);
        g.fillStyle = '#8a8378';
        g.font = `500 21px ${SANS}`;
        g.fillText(an.sub, 128, y + rh / 2 + 16);
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
          // Foto links
          g.save();
          rr(g, cx, y, rh, rh, 18);
          g.clip();
          drawPlate(g, cx + rh / 2, y + rh / 2, rh * 0.36, r);
          g.restore();
          const tx = cx + rh + 22;
          g.fillStyle = WELT_FARBE[wl];
          g.font = `700 20px ${SANS}`;
          g.fillText(r.nr, tx, y + 38);
          g.fillStyle = '#1f2120';
          // Titel: max. zwei Zeilen
          g.font = `400 28px ${SERIF}`;
          const maxW = cw - rh - 44;
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
          if (lines.length > 2) lines.splice(1, lines.length - 1, `${lines.slice(1).join(' ').slice(0, 16)}…`);
          lines.forEach((l, k) => g.fillText(l, tx, y + 78 + k * 33));
          g.fillStyle = '#8a8378';
          g.font = `500 20px ${SANS}`;
          g.fillText(`${r.zeit} · ${r.preis}`, tx, y + rh - 30);
          g.textAlign = 'left';
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
      g.fillText('SHOWKÜCHE · KURSPROGRAMM', 70, 90);
      g.fillStyle = '#f4f1ec';
      g.font = `400 80px ${SERIF}`;
      g.fillText('Kochen lernen bei uns', 70, 170);
      const rows = [['Mo', '18:30', 'Pasta Basics', '59 €'], ['Mi', '18:30', 'Ramen-Abend', '59 €'], ['Do', '18:30', 'Taco Night', '59 €'], ['Fr', '', 'Firmen-Events', 'auf Anfrage'], ['täglich', '12–13:30', 'Live-Cooking zum Probieren', 'gratis']];
      rows.forEach(([d, t, n, p], i) => {
        const y = 290 + i * 104;
        g.fillStyle = 'rgba(255,255,255,0.08)';
        g.fillRect(70, y + 46, 900, 1);
        g.fillStyle = '#b39b6b';
        g.font = `600 30px ${SANS}`;
        g.fillText(d, 70, y);
        g.fillStyle = '#c9c4bc';
        g.fillText(t, 220, y);
        g.fillStyle = '#f4f1ec';
        g.font = `400 38px ${SERIF}`;
        g.fillText(n, 400, y);
        g.font = `500 28px ${SANS}`;
        g.textAlign = 'right';
        g.fillText(p, 970, y);
        g.textAlign = 'left';
      });
      g.fillStyle = '#f4f1ec';
      rr(g, W - 450, H - 470, 340, 340, 24);
      g.fill();
      g.fillStyle = '#1f2120';
      for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0) g.fillRect(W - 425 + i * 19.5, H - 445 + j * 19.5, 19.5, 19.5);
      g.fillStyle = '#c9c4bc';
      g.font = `500 26px ${SANS}`;
      g.textAlign = 'center';
      g.fillText('Kurs buchen', W - 280, H - 90);
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
      g.fillText('KOCHWELT DES MONATS', 30, 50);
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
      g.fillText('Live-Cooking · täglich 12–13:30', W / 2, H / 2 + 4);
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
      g.fillText('täglich 12:00–13:30 · Probieren erwünscht', 60, 180);
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

// ---------- Möbeltypen ----------
const BUILDERS = {
  schaufenster(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const top = 0.35;
    b.box('holz', [x1, x2, z1, z2], 0, top);
    b.box('akzent', [x1, x2, z1 - 0.005, z1], 0.28, top);
    // Plakat auf Staffelei zur Straße
    const cx = x1 + 0.55;
    const zc = (z1 + z2) / 2;
    b.box('holzDunkel', [cx - 0.02, cx + 0.02, zc, zc + 0.04], top, top + 1.05);
    plane(ctx.extra, lit(TEX.plakat(m.schild, ['#01 Creamy Tomato Pasta', '#02 Tagliatelle al Limone', '#03 Pasta e Fagioli', 'Rezeptkarten gratis – drinnen'])), 0.62, 0.87, cx, top + 0.62, zc - 0.03, [0, -1], -0.08);
    // Kiste mit Tomaten, Pasta-Gläser, Olivenöl
    const P = ctx.products;
    b.box('kiste', [x1 + 1.05, x1 + 1.5, z1 + 0.08, z1 + 0.42], top, top + 0.16);
    ctx.fresh.crate(b, x1 + 1.275, top + 0.16, z1 + 0.25, 0.4, 0.3, 'tomate', 0);
    for (let i = 0; i < 4; i++) P.add(P.pick('R01', i), x1 + 1.65 + i * 0.12, top, z1 + 0.2, [0, -1]);
    for (let i = 0; i < 3; i++) P.add(P.pick('B2', 0), x2 - 0.18 - i * 0.09, top, z1 + 0.2, [0, -1]);
    P.add(P.pick('R01B', 0), x2 - 0.5, top, z1 + 0.35, [0, -1]);
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
    sign(ctx.extra, 'One Hour Kitchen', { w: 0.9, h: 0.1, bg: '#1d1e20', fg: '#efe7d6', font: '400', serif: true }, cx, H - 0.07, zc + 0.052, [0, 1]);
    // Bildschirm: dünner Rahmen, Glasfront
    const y0 = 1.02;
    const top = H - 0.17;
    const w = x2 - x1 - 0.2;
    const h = top - y0;
    b.box('schwarz', [x1 + 0.08, x2 - 0.08, zc - 0.035, zc + 0.035], y0 - 0.02, top + 0.01);
    plane(ctx.extra, unlit(TEX.dashboard(ctx.layout)), w, h, cx, y0 + h / 2 - 0.005, zc - 0.037, [0, -1]);
    plane(ctx.extra, unlit(TEX.dashboardBack()), w, h, cx, y0 + h / 2 - 0.005, zc + 0.037, [0, 1]);
    // Kartenpult (Eiche), um 25° geneigt, mit Lichtkante
    const pz1 = z1 - 0.2;
    b.box('eiche', [x1 + 0.06, x2 - 0.06, pz1, zc - 0.035], 0.86, 0.9);
    b.box('led', [x1 + 0.08, x2 - 0.08, pz1 - 0.003, pz1], 0.865, 0.875);
    b.box('schwarzMatt', [x1 + 0.1, x2 - 0.1, pz1 + 0.05, zc - 0.06], 0.05, 0.86);
    const wl = ['Pasta Night', 'Asian Night', 'Mexican Night'];
    const an = ['schnell', 'besonders', 'günstig'];
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
    for (const s of [-1, 1]) {
      const [x, z] = at(s * (L / 2 - 0.1), 0);
      b.geo('metall', G.box(0.02, 0.6, 0.02), x, 1.25, z, yaw);
    }
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

  'kochwelt-gondel'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const zc = (z1 + z2) / 2;
    const col = m.farbe;
    if (!b.materials[`welt-${m.id}`]) b.materials[`welt-${m.id}`] = std(new THREE.Color(col), 0.55);
    const wm = `welt-${m.id}`;
    // Korpus: Sockel, Mittelwand, Seitenteile
    // Feinkost-Ladenbau: Rückwand Räuchereiche, Rahmen mattschwarz, Böden Eiche mit LED-Lichtleiste
    b.box('schwarzMatt', [x1 + 0.02, x2 - 0.02, z1 + 0.04, z2 - 0.04], 0, 0.1);
    b.box('eicheDunkel', [x1 + 0.03, x2 - 0.03, zc - 0.02, zc + 0.02], 0.1, H - 0.01);
    for (const x of [x1, x2 - 0.03]) b.box('schwarzMatt', [x, x + 0.03, z1, z2], 0, H);
    b.box('eicheDunkel', [x1, x2, z1 + 0.02, z2 - 0.02], H - 0.03, H);
    const levels = [0.1, 0.45, 0.82, 1.22];
    for (const seite of ['vorne', 'hinten']) {
      const f = faceFrame(m.rechteck, seite);
      for (const y of levels.slice(1)) {
        b.box('eiche', faceRect(f, x1 + 0.03, x2 - 0.03, 0, -0.25), y - 0.025, y);
        b.box('led', faceRect(f, x1 + 0.04, x2 - 0.04, -0.012, -0.022), y - 0.03, y - 0.025);
        ctx.priceRail(f, x1 + 0.03, x2 - 0.03, y - 0.065, y - 0.025, 'preisDunkel');
      }
      b.box('led', faceRect(f, x1 + 0.04, x2 - 0.04, -0.012, -0.022), H - 0.035, H - 0.03);
      // zurückgesetzte Sockelblende und Eichen-Abschlusskante oben
      b.box('schwarzMatt', faceRect(f, x1 + 0.03, x2 - 0.03, -0.03, -0.05), 0.0, 0.1);
      b.box('eiche', faceRect(f, x1, x2, 0.02, -0.03), H - 0.04, H);
      ctx.priceRail(f, x1 + 0.03, x2 - 0.03, 0.06, 0.1, 'preisDunkel');
      if (m.regal?.[seite]) this.blockFace(b, m, ctx, f, levels, m.regal[seite]);
    }
    // Stirnseite zum Rundlauf (−x): Räuchereiche mit Kreidetafel der Rezepte dieser Kochwelt
    b.box('eicheDunkel', [x1 - 0.012, x1, z1 + 0.02, z2 - 0.02], 0.1, H - 0.03);
    {
      const rz = ctx.layout.rezepte.filter((r) => r.welt === m.welt);
      sign(ctx.extra, m.welt, { w: 0.46, h: 0.3, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: m.farbe, sub: `Rezepte ${rz.map((r) => r.nr).join(' · ')}` }, x1 - 0.016, 1.35, zc, [-1, 0]);
      rz.forEach((r, k) => sign(ctx.extra, `${r.nr}  ${r.titel}`, { w: 0.46, h: 0.09, bg: '#2f3234', fg: '#e4dccb', font: '400', align: 'left' }, x1 - 0.016, 1.1 - k * 0.1, zc, [-1, 0]));
    }
    // Regalkopf zum Gang (+x): Kochwelt-Stele mit Rezeptkarten „» schnell“
    const ex = x2 + 0.005;
    b.box('schwarzMatt', [x2 - 0.03, ex + 0.02, z1, z2], 0, 0.1);
    b.box(wm, [ex + 0.02, ex + 0.025, z1 + 0.02, z2 - 0.02], 0.02, 0.08); // Farbkante der Kochwelt am Sockel
    for (const y of [0.45, 0.85, 1.25]) b.box('eiche', [x2, x2 + 0.16, z1 + 0.04, z2 - 0.04], y - 0.025, y);
    const P = ctx.products;
    const kopf = m.regal?.kopf || { gruppen: [] };
    // Regalkopf: Rezeptkarten aller drei Rezepte dieser Kochwelt (oben), darunter Waren aus dem Kopf-Sortiment
    if (kopf.gruppen[0]) P.shelf(kopf.gruppen[0], { along: 'z', from: z1 + 0.04, to: z2 - 0.04, front: x2 + 0.15, y: 0.85, depth: 0.14, dir: [1, 0], maxH: 0.36, rows: 1, facings: 2, tagOut: 0.014, tagDy: -0.013 });
    if (kopf.gruppen[1]) P.shelf(kopf.gruppen[1], { along: 'z', from: z1 + 0.04, to: z2 - 0.04, front: x2 + 0.15, y: 0.45, depth: 0.14, dir: [1, 0], maxH: 0.36, rows: 1, facings: 2, tagOut: 0.014, tagDy: -0.013 });
    const rez = ctx.layout.rezepte.filter((r) => r.welt === m.welt);
    rez.forEach((r, k) => {
      if (!ctx.cardMats[r.nr]) ctx.cardMats[r.nr] = lit(recipeCardTexture(r));
      const dz = (k - 1) * 0.15;
      b.geo('glas', G.box(0.03, 0.13, 0.11), x2 + 0.08, 1.31, zc + dz, Math.PI / 2, -0.2);
      plane(ctx.extra, ctx.cardMats[r.nr], 0.095, 0.13, x2 + 0.09, 1.33, zc + dz, [1, 0], -0.2);
    });
    if (kopf.titel) sign(ctx.extra, kopf.titel, { w: 0.52, h: 0.12, bg: '#25282a', fg: '#efe7d6', font: '500', brass: true }, x2 + 0.165, 1.08, zc, [1, 0]);
    // Stele mit Kochwelt-Namen (Reckzone)
    b.box('schwarzMatt', [x2 - 0.02, x2 + 0.03, zc - 0.03, zc + 0.03], H, H + 0.45);
    sign(ctx.extra, m.welt, { w: 0.5, h: 0.3, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: col, sub: 'Kochwelt' }, x2 + 0.035, H + 0.22, zc, [1, 0]);
    // Kopfschild über die ganze Gondel (beidseitig)
    b.box('schwarzMatt', [(x1 + x2) / 2 - 0.01, (x1 + x2) / 2 + 0.01, zc - 0.01, zc + 0.01], H, H + 0.18);
    // Kopfschild je Seite: jede Seite gehört zu „ihrer“ Koje
    for (const [seite, d] of [['vorne', [0, -1]], ['hinten', [0, 1]]]) {
      const face = m.regal?.[seite];
      if (!face) continue;
      const wc = face.titel.startsWith('PASTA') ? '#a8432c' : face.titel.startsWith('ASIAN') ? '#b08a34' : '#3f6e4a';
      const [t1, ...rest] = face.titel.split(' · ');
      const nice = t1.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
      sign(ctx.extra, nice, { w: 2.8, h: 0.3, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: wc, sub: rest.join(' · ') }, (x1 + x2) / 2, H + 0.3, zc + d[1] * 0.012, d);
    }
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
        ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front, y: y + 0.002, depth: d - 0.02, dir: [0, -1], maxH: 0.27, rows: 3, start: Math.round(y * 10), tagOut: 0.022, tagDy: -0.032 });
        ctx.priceRailAt([a1, a2, front - 0.015, front], y - 0.05, y - 0.01, [0, -1]);
      }
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
      for (const y of levels) ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.14, y, depth: z2 - z1 - 0.22, dir: [0, -1], maxH: 0.3, rows: 3, start: Math.round(y * 10), tagOut: 0.024, tagDy: -0.014 });
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
      for (const y of levels) ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.02, y, depth: z2 - z1 - 0.08, dir: [0, -1], maxH: 0.34, rows: 2, gap: 0.006, start: Math.round(y * 10), tagOut: 0.039, tagDy: -0.05 });
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
        for (const y of levels) ctx.products.shelf(s.code, { along: 'z', from: a1, to: a2, front: f.front, y, depth, dir: f.dir, maxH: 0.32, rows: 2, start: Math.round(y * 10) + i, tagOut: 0.008 });
        const [sx, sz] = f.at((a1 + a2) / 2, 0.02);
        const bs = { bg: '#25282a', fg: '#efe7d6', font: '500', accent: '#3f5873', sub: s.code };
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
    for (let i = 0; i < 6; i++) b.geo('teller', G.disc(0.07, 0.015, 20), x1 + 0.25 + i * 0.16, h + 0.008, z1 + 0.12); // Probierschälchen
    // Induktionsfeld mit Kochzonen
    for (const [dx, dz, r] of [[-0.32, -0.2, 0.09], [-0.1, -0.35, 0.07], [0.02, -0.18, 0.1]]) b.geo('kochzone', new THREE.RingGeometry(r - 0.006, r, 24), cx + dx, h + 0.0095, z2 + dz, 0, -Math.PI / 2);
    // Inselhaube: schlanker Edelstahlkasten mit LED-Unterseite, an Stahlseilen
    b.box('edelstahl', [cx - 0.7, cx + 0.4, z2 - 0.7, z2 - 0.02], 2.38, 2.52);
    b.box('led', [cx - 0.66, cx + 0.36, z2 - 0.66, z2 - 0.06], 2.375, 2.38);
    for (const [dx, dz] of [[-0.65, -0.65], [0.35, -0.65], [-0.65, -0.07], [0.35, -0.07]]) b.box('metall', [cx + dx - 0.004, cx + dx + 0.004, z2 + dz - 0.004, z2 + dz + 0.004], 2.52, 3.2);
    // Pendelleuchten über dem Tresen (Zuschauerseite)
    for (const dx of [-0.9, 0, 0.9]) {
      b.box('metall', [cx + dx - 0.003, cx + dx + 0.003, z1 + 0.2 - 0.003, z1 + 0.2 + 0.003], 1.95, 3.2);
      b.geo('messing', new THREE.CylinderGeometry(0.07, 0.11, 0.16, 20, 1, true), cx + dx, 1.9, z1 + 0.2);
      b.geo('led', new THREE.CircleGeometry(0.1, 20), cx + dx, 1.83, z1 + 0.2, 0, Math.PI / 2);
    }
    // Messer- und Utensilienleiste
    b.box('messing', [cx + 0.45, cx + 1.05, z2 - 0.03, z2 - 0.01], h + 0.3, h + 0.33);
    for (let i = 0; i < 5; i++) b.box(i % 2 ? 'schwarz' : 'edelstahl', [cx + 0.5 + i * 0.11, cx + 0.53 + i * 0.11, z2 - 0.03, z2 - 0.015], h + 0.1, h + 0.3);
    // Schild hängt zur Zuschauerseite
    sign(ctx.extra, 'Showküche', { w: 1.6, h: 0.3, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, brass: true, sub: 'Live-Cooking 12–13:30 · Kurse ab 18:30' }, cx - 0.15, 2.45, z2 - 0.76, [0, -1]);
  },

  kurstisch(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    for (const x of [x1 + 0.08, x2 - 0.12]) for (const z of [z1 + 0.08, z2 - 0.12]) b.box('schwarzMatt', [x, x + 0.05, z, z + 0.05], 0, h - 0.05);
    b.box('schwarzMatt', [x1 + 0.1, x2 - 0.1, z1 + 0.1, z2 - 0.1], h - 0.09, h - 0.05);
    b.box('eiche', [x1, x2, z1, z2], h - 0.05, h);
    for (const x of m.stuehle_x) {
      for (const [i, z] of m.stuehle_z.entries()) {
        const facing = i === 0 ? 1 : -1; // Stuhl blickt zum Tisch
        b.box('eiche', [x - 0.2, x + 0.2, z - 0.2, z + 0.2], 0.44, 0.47);
        for (const dx of [-0.17, 0.15]) for (const dz of [-0.17, 0.15]) b.box('schwarzMatt', [x + dx, x + dx + 0.02, z + dz, z + dz + 0.02], 0, 0.44);
        const bz = z - facing * 0.19;
        b.box('eiche', [x - 0.19, x + 0.19, bz - 0.015, bz + 0.015], 0.62, 0.86);
        for (const dx of [-0.17, 0.15]) b.box('schwarzMatt', [x + dx, x + dx + 0.02, bz - 0.01, bz + 0.01], 0.47, 0.64);
        b.geo('teller', G.disc(0.11, 0.015, 24), x, h + 0.008, z + facing * 0.38);
        b.geo('glas', G.disc(0.035, 0.12, 16), x + 0.14, h + 0.06, z + facing * 0.3);
      }
    }
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
      ctx.products.shelf('IMPULS', { along: 'z', from: z1 + 0.03, to: z2 - 0.03, front: x2, y, depth: x2 - x1 - 0.06, dir: [1, 0], maxH: 0.3, rows: 2, start: Math.round(y * 10), tagOut: 0.019, tagDy: -0.043 });
    }
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

  kuehlzelle(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    if (!b.materials.zelle) b.materials.zelle = lit(TEX.kuehlzelle());
    b.box('kuehlwand', [x1, x2, z1, z2], 0, H);
    plane(ctx.extra, b.materials.zelle, x2 - x1, H, (x1 + x2) / 2, H / 2, z2 + 0.006, [0, 1]);
    // Tür zur Lagerseite
    const dx = x2 - 1.2;
    b.box('edelstahl', [dx, dx + 0.9, z2, z2 + 0.03], 0.05, 2.05);
    b.box('chrom', [dx + 0.75, dx + 0.8, z2 + 0.03, z2 + 0.07], 0.95, 1.2);
    sign(ctx.extra, 'KÜHLZELLE · Hinterbefüllung K1–K6', { w: 1.5, h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '500', brass: true }, x1 + 2.2, 1.9, z2 + 0.01, [0, 1]);
    sign(ctx.extra, '+2 °C', { w: 0.3, h: 0.14, bg: '#1c1c1f', fg: '#4f8a6a', font: '700' }, dx + 0.45, 2.15, z2 + 0.035, [0, 1]);
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

// Inhalte der Kochwelt-Gondeln: klassisch nach Warengruppen (Produktblöcke, Ahlert et al. 2020, S. 303).
// Senkrechte Blöcke je Warengruppe; Sicht- und Greifzone Standardgrößen, Bückzone Großpackungen.
// Die Rezeptkarte führt per Fachcode (W1–W3) in die Koje, das Blockschild nennt die Rezepte, die daraus kochen.
BUILDERS['kochwelt-gondel'].blockFace = function (b, m, ctx, f, levels, face) {
  const [x1, x2] = m.rechteck;
  const P = ctx.products;
  const n = face.bloecke.length;
  const L = (x2 - x1 - 0.06) / n;
  face.bloecke.forEach((bl, i) => {
    const a1 = x1 + 0.03 + i * L;
    const a2 = a1 + L;
    if (i > 0) b.box('anthrazit', faceRect(f, a1 - 0.008, a1 + 0.008, 0.004, -0.25), 0.1, m.hoehe - 0.03);
    const [g0, g1] = [bl.gruppen[0], bl.gruppen[1] || bl.gruppen[0]];
    const span = { along: 'x', from: a1, to: a2, front: f.front, depth: 0.24, dir: f.dir, rows: 2 };
    P.shelf(g0, { ...span, y: levels[3], maxH: 0.33, start: 0, tagOut: 0.008 });
    P.shelf(g0, { ...span, y: levels[2], maxH: 0.36, start: 3, tagOut: 0.008 });
    P.shelf(g1, { ...span, y: levels[1], maxH: 0.34, start: 0, tagOut: 0.008 });
    P.shelf(g1, { ...span, y: levels[0], maxH: 0.34, start: 1, tagOut: 0.008 });
    // Blockschild (Reckzone): Fachcode, Warengruppe und die Rezepte, die daraus kochen
    const rez = ctx.layout.rezepte.filter((r) => r.zutaten.some(([nm, c]) => c === bl.code && (bl.artikel || []).includes(nm))).map((r) => r.nr);
    const [sx, sz] = f.at((a1 + a2) / 2, 0.01);
    sign(ctx.extra, bl.name, { w: Math.min(1.6, L - 0.2), h: 0.2, bg: '#25282a', fg: '#efe7d6', font: '500', accent: m.farbe, sub: `${bl.code}${rez.length ? ` · für Rezept ${rez.join(' ')}` : ''}` }, sx, m.hoehe - 0.13, sz, f.dir);
  });
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
      b.box('metall', [x + ox - 0.005, x + ox + 0.005, z + oz - 0.005, z + oz + 0.005], 2.5 + h / 2, 3.2);
    }
    const opts = { w, h: h * 1.15, bg: '#25282a', fg: '#efe7d6', font: '400', serif: true, accent: d.farbe };
    const yaw = yawFacing(dir[0], dir[1]);
    for (const s of [1, -1]) {
      const m = signMesh(titleCase(d.text), opts);
      m.position.set(x, 2.5, -z);
      m.rotation.y = yaw + (s < 0 ? Math.PI : 0);
      m.translateZ(0.006);
      extra.add(m);
    }
  }

  // Menschen: Personal und Kundschaft
  const staffLook = { top: '#1c1c1f', bag: false, apron: true, jacket: null, skirt: false, sleeves: 'kurz' };
  for (const p of layout.personen || []) {
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

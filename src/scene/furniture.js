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
  akzent: std(0xd64527, 0.55),
  gruen: std(0x2f7d32, 0.6),
  gelb: std(0xc9a227, 0.6),
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
  schnell: { sym: '»', text: 'schnell', sub: '≤ 20 Min.', farbe: '#d64527' },
  besonders: { sym: '★', text: 'besonders', sub: 'Menü für 2', farbe: '#8a4fc7' },
  günstig: { sym: '€', text: 'günstig', sub: '≤ 4 € je Portion', farbe: '#2f7d32' },
};
const WELT_FARBE = { 'Pasta Night': '#d64527', 'Asian Night': '#c9a227', 'Mexican Night': '#2f9e6e' };

export function recipeCardTexture(r, w = 300, h = 420) {
  return canvasTex(w, h, (g) => {
    const an = ANLASS[r.anlass];
    g.fillStyle = '#fbf8f2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = WELT_FARBE[r.welt] || '#d64527';
    g.fillRect(0, 0, w, 74);
    g.fillStyle = '#fff';
    g.textBaseline = 'middle';
    g.font = `800 30px ${SANS}`;
    g.fillText(`${r.nr}`, 16, 26);
    g.font = `600 17px ${SANS}`;
    g.fillText(`${an.sym} ${an.text.toUpperCase()} · ${r.welt}`, 16, 56);
    g.fillStyle = '#1c1c1f';
    g.font = `800 23px ${SANS}`;
    const words = r.titel.split(' ');
    let line = '';
    let y = 104;
    for (const wd of words) {
      const t = line ? `${line} ${wd}` : wd;
      if (g.measureText(t).width > w - 30) {
        g.fillText(line, 16, y);
        y += 27;
        line = wd;
      } else line = t;
    }
    g.fillText(line, 16, y);
    y += 30;
    g.font = `600 15px ${SANS}`;
    g.fillStyle = '#6b6258';
    g.fillText(`${r.zeit} · ${r.preis}`, 16, y);
    y += 26;
    g.font = `500 15px ${SANS}`;
    for (const [n, code] of r.zutaten) {
      g.fillStyle = '#1c1c1f';
      g.fillText(`• ${n}`, 16, y);
      g.fillStyle = '#d64527';
      g.font = `800 15px ${SANS}`;
      g.textAlign = 'right';
      g.fillText(code, w - 16, y);
      g.textAlign = 'left';
      g.font = `500 15px ${SANS}`;
      y += 22;
    }
    g.fillStyle = '#efe7d6';
    g.fillRect(0, h - 40, w, 40);
    g.fillStyle = '#1c1c1f';
    g.font = `700 14px ${SANS}`;
    g.fillText('ONE HOUR KITCHEN · Shop. Cook. Enjoy.', 16, h - 20);
  });
}

const TEX = {
  dashboard(layout) {
    const W = 1536;
    const H = 840;
    return canvasTex(W, H, (g) => {
      g.fillStyle = '#16171a';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#f4f1ec';
      g.textBaseline = 'middle';
      g.font = `800 64px ${SANS}`;
      g.fillText('Was kochst du heute?', 40, 62);
      g.font = `500 30px ${SANS}`;
      g.fillStyle = '#c9c4bc';
      g.fillText('1. Küche wählen  ·  2. Anlass wählen  ·  3. Rezeptkarte ziehen', 40, 118);
      const welten = ['Pasta Night', 'Asian Night', 'Mexican Night'];
      const zeilen = ['schnell', 'besonders', 'günstig'];
      const x0 = 300;
      const cw = (W - x0 - 30) / 3;
      const y0 = 160;
      const rh = (H - y0 - 20) / 3.35;
      welten.forEach((wl, i) => {
        g.fillStyle = WELT_FARBE[wl];
        g.fillRect(x0 + i * cw + 6, y0, cw - 12, rh * 0.35);
        g.fillStyle = '#fff';
        g.font = `800 36px ${SANS}`;
        g.textAlign = 'center';
        g.fillText(wl.replace(' Night', '').toUpperCase(), x0 + i * cw + cw / 2, y0 + rh * 0.18);
        g.textAlign = 'left';
      });
      zeilen.forEach((z, j) => {
        const an = ANLASS[z];
        const y = y0 + rh * 0.35 + 10 + j * rh;
        g.fillStyle = an.farbe;
        g.fillRect(30, y + 6, x0 - 50, rh - 12);
        g.fillStyle = '#fff';
        g.font = `800 52px ${SANS}`;
        g.fillText(an.sym, 46, y + rh * 0.36);
        g.font = `800 32px ${SANS}`;
        g.fillText(an.text, 100, y + rh * 0.36);
        g.font = `500 22px ${SANS}`;
        g.fillText(an.sub, 46, y + rh * 0.72);
        welten.forEach((wl, i) => {
          const r = layout.rezepte.find((x) => x.welt === wl && x.anlass === z);
          const cx = x0 + i * cw + 6;
          g.fillStyle = '#26282c';
          g.fillRect(cx, y + 6, cw - 12, rh - 12);
          g.fillStyle = an.farbe;
          g.fillRect(cx, y + 6, 10, rh - 12);
          if (!r) return;
          g.fillStyle = '#f4f1ec';
          g.font = `800 30px ${SANS}`;
          g.fillText(r.nr, cx + 26, y + rh * 0.3);
          fitText(g, r.titel, cx + 92, y + rh * 0.3, cw - 120, 700, 28);
          g.fillStyle = '#c9c4bc';
          g.font = `500 22px ${SANS}`;
          g.fillText(`${r.zeit} · ${r.preis}`, cx + 26, y + rh * 0.68);
          g.fillStyle = '#f2c230';
          g.textAlign = 'right';
          g.fillText('Karte ▼', cx + cw - 34, y + rh * 0.68);
          g.textAlign = 'left';
        });
      });
    });
  },
  dashboardBack: () =>
    canvasTex(1536, 840, (g, W, H) => {
      g.fillStyle = '#d64527';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff';
      g.textBaseline = 'middle';
      g.font = `800 70px ${SANS}`;
      g.fillText('Kochen lernen bei uns', 50, 90);
      g.font = `500 34px ${SANS}`;
      const rows = ['Mo 18:30  Pasta Basics – 59 €', 'Mi 18:30  Ramen-Abend – 59 €', 'Do 18:30  Taco Night – 59 €', 'Fr          Firmen-Events auf Anfrage', 'täglich 12–13:30  Live-Cooking zum Probieren'];
      rows.forEach((r, i) => g.fillText(r, 60, 210 + i * 78));
      g.fillStyle = '#fff';
      g.fillRect(W - 360, H - 380, 300, 300);
      g.fillStyle = '#1c1c1f';
      for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0) g.fillRect(W - 345 + i * 18, H - 365 + j * 18, 18, 18);
      g.fillStyle = '#fff';
      g.font = `700 28px ${SANS}`;
      g.fillText('Kurs buchen →', W - 600, H - 230);
    }),
  plakat: (titel, zeilen, farbe = '#d64527') =>
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
      g.fillStyle = '#f4f1ec';
      g.fillRect(0, 0, W, H);
      for (let x = 10; x < W; x += 128) {
        g.fillStyle = '#fff';
        g.fillRect(x, 3, 70, H - 6);
        g.fillStyle = '#1c1c1f';
        g.font = `800 18px ${SANS}`;
        g.fillText(`${(1 + ((x * 7) % 5) + 0.29).toFixed(2).replace('.', ',')}`, x + 6, H / 2 + 6);
        g.fillStyle = '#d64527';
        g.fillRect(x + 70, 3, 6, H - 6);
      }
    }),
  kochtresen: () =>
    canvasTex(1024, 300, (g, W, H) => {
      g.fillStyle = '#efe9df';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#d64527';
      g.fillRect(0, 0, 18, H);
      g.fillStyle = '#1c1c1f';
      g.textBaseline = 'middle';
      g.font = `800 66px ${SANS}`;
      g.fillText('LIVE-COOKING', 60, 100);
      g.font = `500 36px ${SANS}`;
      g.fillText('täglich 12:00–13:30 · Probieren erwünscht', 60, 180);
      g.fillStyle = '#d64527';
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
      g.fillStyle = '#f2c230';
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
      g.fillStyle = '#d64527';
      g.fillRect(0, 0, W, 34);
      g.fillStyle = '#fff';
      g.font = `800 18px ${SANS}`;
      g.fillText('SB-KASSE', 10, 23);
      g.font = `600 20px ${SANS}`;
      g.fillText('Bitte Artikel scannen', 14, 80);
      g.fillStyle = '#3fbf7f';
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
      g.fillStyle = '#3fbf7f';
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
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const zc = (z1 + z2) / 2;
    // Füße + Stelen
    for (const x of [x1 + 0.08, x2 - 0.08]) {
      b.box('anthrazit', [x - 0.05, x + 0.05, z1 + 0.05, z2 - 0.05], 0, H);
      b.box('anthrazit', [x - 0.25, x + 0.25, z1, z2], 0, 0.04);
    }
    // Bildschirm-Rahmen
    const y0 = 0.98;
    b.box('anthrazit', [x1 + 0.13, x2 - 0.13, zc - 0.045, zc + 0.045], y0 - 0.03, H - 0.02);
    const w = x2 - x1 - 0.32;
    const h = H - 0.05 - y0;
    plane(ctx.extra, unlit(TEX.dashboard(ctx.layout)), w, h, (x1 + x2) / 2, y0 + h / 2 - 0.01, zc - 0.047, [0, -1]);
    plane(ctx.extra, unlit(TEX.dashboardBack()), w, h, (x1 + x2) / 2, y0 + h / 2 - 0.01, zc + 0.047, [0, 1]);
    // Kartenspender: 9 Fächer unter dem Bildschirm (3 je Küche)
    b.box('holzHell', [x1 + 0.16, x2 - 0.16, z1 - 0.12, zc], 0.82, 0.86);
    const wl = ['Pasta Night', 'Asian Night', 'Mexican Night'];
    const an = ['schnell', 'besonders', 'günstig'];
    const colW = w / 3;
    wl.forEach((welt, i) => {
      an.forEach((a, j) => {
        const r = ctx.layout.rezepte.find((x) => x.welt === welt && x.anlass === a);
        const x = x1 + 0.16 + i * colW + (j + 0.5) * (colW / 3);
        b.geo('glas', G.box(0.17, 0.12, 0.05), x, 0.92, z1 - 0.06, 0, -0.25);
        if (r) {
          if (!ctx.cardMats[r.nr]) ctx.cardMats[r.nr] = lit(recipeCardTexture(r));
          plane(ctx.extra, ctx.cardMats[r.nr], 0.1, 0.14, x, 0.95, z1 - 0.055, [0, -1], -0.25);
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
      sign(ctx.extra, 'OBST & GEMÜSE · O1', { w: 1.1, h: 0.22, bg: '#2f7d32', fg: '#fff' }, px, 1.45, pz, d);
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
    b.box('anthrazit', [x1 + 0.02, x2 - 0.02, z1 + 0.04, z2 - 0.04], 0, 0.1);
    b.box('korpus', [x1 + 0.03, x2 - 0.03, zc - 0.02, zc + 0.02], 0.1, H - 0.01);
    for (const x of [x1, x2 - 0.03]) b.box('korpus', [x, x + 0.03, z1, z2], 0, H);
    b.box('holz', [x1, x2, z1 + 0.02, z2 - 0.02], H - 0.03, H);
    const levels = [0.1, 0.45, 0.82, 1.22];
    for (const seite of ['vorne', 'hinten']) {
      const f = faceFrame(m.rechteck, seite);
      for (const y of levels.slice(1)) {
        b.box('holzHell', faceRect(f, x1 + 0.03, x2 - 0.03, 0, -0.25), y - 0.025, y);
        ctx.priceRail(f, x1 + 0.03, x2 - 0.03, y - 0.065, y - 0.025);
      }
      ctx.priceRail(f, x1 + 0.03, x2 - 0.03, 0.06, 0.1);
      const content = m[seite];
      if (content === 'matrix') this.matrixFace(b, m, ctx, f, levels);
      else this.otherFace(b, m, ctx, f, levels, content);
    }
    // Regalkopf zum Gang (+x): Kochwelt-Stele mit Rezeptkarten „» schnell“
    const ex = x2 + 0.005;
    b.box(wm, [x2 - 0.03, ex + 0.02, z1, z2], 0, 0.1);
    for (const y of [0.45, 0.85, 1.25]) b.box('holzHell', [x2, x2 + 0.16, z1 + 0.04, z2 - 0.04], y - 0.025, y);
    const P = ctx.products;
    const code = m.welt.startsWith('Pasta') ? 'W1' : m.welt.startsWith('Asian') ? 'W2' : 'W3';
    const rS = ctx.layout.rezepte.find((r) => r.welt === m.welt && r.anlass === 'schnell');
    const rk = rS ? `R${rS.nr.slice(1)}` : 'R01';
    // Regalkopf = Zeile » schnell: Zutaten des schnellen Rezepts, unten Getränk bzw. (Mexican) Ergänzungen
    P.shelf(m.welt.startsWith('Mexican') ? 'ERG_MEX' : `${rk}D`, { along: 'z', from: z1 + 0.04, to: z2 - 0.04, front: x2 + 0.15, y: 0.45, depth: 0.14, dir: [1, 0], maxH: 0.36, rows: 1, facings: 2 });
    P.shelf(rk, { along: 'z', from: z1 + 0.04, to: z2 - 0.04, front: x2 + 0.15, y: 0.85, depth: 0.14, dir: [1, 0], maxH: 0.36, rows: 1, facings: 1 });
    const rSchnell = ctx.layout.rezepte.find((r) => r.welt === m.welt && r.anlass === 'schnell');
    if (rSchnell) {
      if (!ctx.cardMats[rSchnell.nr]) ctx.cardMats[rSchnell.nr] = lit(recipeCardTexture(rSchnell));
      for (const dz of [-0.13, 0, 0.13]) {
        b.geo('glas', G.box(0.03, 0.13, 0.11), x2 + 0.08, 1.31, zc + dz, Math.PI / 2, -0.2);
        plane(ctx.extra, ctx.cardMats[rSchnell.nr], 0.095, 0.13, x2 + 0.09, 1.33, zc + dz, [1, 0], -0.2);
      }
    }
    // Stele mit Kochwelt-Namen (Reckzone)
    b.box(wm, [x2 - 0.02, x2 + 0.03, zc - 0.03, zc + 0.03], H, H + 0.45);
    sign(ctx.extra, m.welt.toUpperCase(), { w: 0.5, h: 0.3, bg: col, fg: '#fff', font: '800' }, x2 + 0.035, H + 0.22, zc, [1, 0]);
    // Kopfschild über die ganze Gondel (beidseitig)
    b.box('anthrazit', [(x1 + x2) / 2 - 0.01, (x1 + x2) / 2 + 0.01, zc - 0.01, zc + 0.01], H, H + 0.18);
    // Kopfschild nur auf der Matrix-Seite (die andere Seite gehört zur Nachbar-Koje)
    const md = m.hinten === 'matrix' ? [0, 1] : [0, -1];
    sign(ctx.extra, `${m.welt.toUpperCase()}  ·  ${code}  ·  Rezepte ${m.rezepte.slice().reverse().join(' ')}`, { w: 2.6, h: 0.26, bg: col, fg: '#fff', font: '800' }, (x1 + x2) / 2, H + 0.3, zc + md[1] * 0.012, md);
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
        ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front, y: y + 0.002, depth: d - 0.02, dir: [0, -1], maxH: 0.27, rows: 3, start: Math.round(y * 10) });
        ctx.priceRailAt([a1, a2, front - 0.015, front], y - 0.05, y - 0.01, [0, -1]);
      }
      sign(ctx.extra, `${fach.code} · ${fach.name}`, { w: L - 0.12, h: 0.16, bg: '#f4f1ec', fg: '#1c1c1f', font: '700' }, (a1 + a2) / 2, H - 0.11, z1 + 0.195, [0, -1]);
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
      for (const y of levels) ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.14, y, depth: z2 - z1 - 0.22, dir: [0, -1], maxH: 0.3, rows: 3, start: Math.round(y * 10) });
      sign(ctx.extra, `${fach.code} · ${fach.name}`, { w: L - 0.12, h: 0.16, bg: '#f4f1ec', fg: '#1c1c1f', font: '700' }, (a1 + a2) / 2, H - 0.12, z1 + 0.035, [0, -1]);
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
    b.box('holzDunkel', [x1, x2, z2 - 0.04, z2], 0, H);
    const n = m.faecher.length;
    const L = (x2 - x1) / n;
    for (let i = 0; i <= n; i++) {
      const x = x1 + i * L;
      b.box('holzDunkel', [Math.max(x1, x - 0.025), Math.min(x2, x + 0.025), z1, z2], 0, H);
    }
    const levels = [0.08, 0.45, 0.82, 1.19, 1.56];
    for (const y of levels) {
      b.box('holz', [x1, x2, z1, z2 - 0.04], y - 0.03, y);
      ctx.priceRailAt([x1, x2, z1 - 0.012, z1], y - 0.07, y - 0.03, [0, -1]);
    }
    b.box('holzDunkel', [x1, x2, z1, z2], H - 0.05, H);
    m.faecher.forEach((fach, i) => {
      const a1 = x1 + i * L + 0.04;
      const a2 = x1 + (i + 1) * L - 0.04;
      for (const y of levels) ctx.products.shelf(fach.code, { along: 'x', from: a1, to: a2, front: z1 + 0.02, y, depth: z2 - z1 - 0.08, dir: [0, -1], maxH: 0.34, rows: 2, facings: 4, gap: 0.006, start: Math.round(y * 10) });
      sign(ctx.extra, `${fach.code} · ${fach.name}`, { w: L - 0.14, h: 0.17, bg: '#3a1520', fg: '#f4f1ec', font: '700' }, (a1 + a2) / 2, H + 0.14, z1 + 0.25, [0, -1]);
      b.box('holzDunkel', [(a1 + a2) / 2 - 0.01, (a1 + a2) / 2 + 0.01, z1 + 0.25, z1 + 0.27], H, H + 0.06);
    });
  },

  'basis-regal'(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const xc = (x1 + x2) / 2;
    const seiten = Object.keys(m.seiten);
    const doppelt = seiten.length > 1;
    b.box('anthrazit', [x1 + 0.03, x2 - 0.03, z1 + 0.02, z2 - 0.02], 0, 0.1);
    // Rückwand: beim Wandregal an der Wand, bei der Gondel in der Mitte
    const back = doppelt ? [xc - 0.02, xc + 0.02] : m.seiten.links ? [x2 - 0.04, x2] : [x1, x1 + 0.04];
    b.box('korpus', [back[0], back[1], z1, z2], 0.1, H);
    for (const z of [z1, z2 - 0.03]) b.box('korpus', [x1, x2, z, z + 0.03], 0, H);
    const levels = H > 1.8 ? [0.1, 0.45, 0.82, 1.2, 1.56] : [0.1, 0.45, 0.82, 1.2];
    for (const seite of seiten) {
      const f = faceFrame(m.rechteck, seite);
      const depth = doppelt ? (x2 - x1) / 2 - 0.04 : x2 - x1 - 0.06;
      for (const y of levels.slice(1)) {
        b.box('holzHell', faceRect(f, z1 + 0.03, z2 - 0.03, 0, -depth), y - 0.025, y);
        ctx.priceRail(f, z1 + 0.03, z2 - 0.03, y - 0.065, y - 0.025);
      }
      const secs = m.seiten[seite];
      const L = (z2 - z1) / secs.length;
      secs.forEach((s, i) => {
        const a1 = z1 + i * L + 0.04;
        const a2 = z1 + (i + 1) * L - 0.04;
        for (const y of levels) ctx.products.shelf(s.code, { along: 'z', from: a1, to: a2, front: f.front, y, depth, dir: f.dir, maxH: 0.32, rows: 2, start: Math.round(y * 10) + i });
        const [sx, sz] = f.at((a1 + a2) / 2, 0.02);
        if (H > 1.8) sign(ctx.extra, `${s.code} · ${s.name}`, { w: L - 0.2, h: 0.2, bg: '#3b6fb0', fg: '#fff', font: '700' }, sx, H - 0.14, sz, f.dir);
        else {
          const [px, pz] = f.at((a1 + a2) / 2, -0.01);
          b.box('anthrazit', [px - 0.01, px + 0.01, pz - 0.01, pz + 0.01], H, H + 0.25);
          sign(ctx.extra, `${s.code} · ${s.name}`, { w: Math.min(1.5, L - 0.2), h: 0.2, bg: '#3b6fb0', fg: '#fff', font: '700' }, sx, H + 0.33, sz, f.dir);
        }
      });
    }
    b.box('holz', [x1, x2, z1, z2], H - 0.03, H);
  },

  kochtresen(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    b.box('weiss', [x1, x2, z1 + 0.02, z2], 0.08, h - 0.04);
    b.box('anthrazit', [x1, x2, z1 + 0.04, z2 - 0.02], 0, 0.08);
    b.box('stein', [x1 - 0.03, x2 + 0.03, z1 - 0.06, z2 + 0.02], h - 0.04, h);
    plane(ctx.extra, lit(TEX.kochtresen()), x2 - x1 - 0.2, 0.62, (x1 + x2) / 2, 0.47, z1 + 0.015, [0, -1]);
    // Kochfeld, Töpfe, Pfanne, Brett mit Gemüse
    const cx = (x1 + x2) / 2;
    b.box('schwarz', [cx - 0.45, cx + 0.15, z2 - 0.5, z2 - 0.1], h, h + 0.008);
    b.geo('topf', G.disc(0.13, 0.15), cx - 0.3, h + 0.085, z2 - 0.3);
    b.geo('topf', G.disc(0.14, 0.04), cx, h + 0.03, z2 - 0.32);
    b.geo('schwarz', G.box(0.3, 0.02, 0.03), cx + 0.25, h + 0.04, z2 - 0.32, 0.2);
    b.box('brett', [cx + 0.45, cx + 0.85, z2 - 0.45, z2 - 0.18], h, h + 0.025);
    ctx.fresh.crate(b, cx + 0.65, h + 0.025, z2 - 0.315, 0.3, 0.2, 'tomate', 0);
    for (let i = 0; i < 6; i++) b.geo('teller', G.disc(0.07, 0.015, 20), x1 + 0.25 + i * 0.16, h + 0.008, z1 + 0.12); // Probierschälchen
    // Dunstabzugshaube über dem Kochfeld
    b.box('edelstahl', [cx - 0.75, cx + 0.45, z2 - 0.75, z2 + 0.05], 2.3, 2.6);
    b.box('edelstahl', [cx - 0.25, cx - 0.05, z2 - 0.45, z2 - 0.25], 2.6, 3.2);
    b.box('led', [cx - 0.65, cx + 0.35, z2 - 0.65, z2 - 0.05], 2.295, 2.3);
    // Schild hängt zur Zuschauerseite
    sign(ctx.extra, 'SHOWKÜCHE · LIVE-COOKING', { w: 1.6, h: 0.22, bg: '#d64527', fg: '#fff', font: '800' }, cx - 0.15, 2.45, z2 - 0.76, [0, -1]);
  },

  kurstisch(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    for (const x of [x1 + 0.08, x2 - 0.12]) for (const z of [z1 + 0.08, z2 - 0.12]) b.box('anthrazit', [x, x + 0.04, z, z + 0.04], 0, h - 0.04);
    b.box('holz', [x1, x2, z1, z2], h - 0.04, h);
    for (const x of m.stuehle_x) {
      for (const [i, z] of m.stuehle_z.entries()) {
        const facing = i === 0 ? 1 : -1; // Stuhl blickt zum Tisch
        b.box('holz', [x - 0.2, x + 0.2, z - 0.2, z + 0.2], 0.44, 0.48);
        for (const dx of [-0.17, 0.15]) for (const dz of [-0.17, 0.15]) b.box('anthrazit', [x + dx, x + dx + 0.02, z + dz, z + dz + 0.02], 0, 0.44);
        const bz = z - facing * 0.19;
        b.box('holz', [x - 0.2, x + 0.2, bz - 0.02, bz + 0.02], 0.48, 0.88);
        b.geo('teller', G.disc(0.11, 0.015, 24), x, h + 0.008, z + facing * 0.38);
        b.geo('glas', G.disc(0.035, 0.12, 16), x + 0.14, h + 0.06, z + facing * 0.3);
      }
    }
  },

  kuechenzeile(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const h = m.hoehe;
    const fx2 = x2 - 0.5; // daneben Hochschrank (Kühlschrank)
    b.box('weiss', [x1, fx2, z1 + 0.02, z2], 0.1, h - 0.04);
    b.box('anthrazit', [x1, fx2, z1 + 0.06, z2], 0, 0.1);
    b.box('stein', [x1, fx2, z1 - 0.02, z2], h - 0.04, h);
    for (let x = x1 + 0.6; x < fx2; x += 0.6) b.box('grau', [x - 0.004, x + 0.004, z1 + 0.015, z1 + 0.02], 0.12, h - 0.06);
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
    // Rückseite zum Gang: Tafel „Kursküche“
    b.box('holzDunkel', [x1, fx2, z2, z2 + 0.03], h, h + 0.45);
    plane(ctx.extra, lit(TEX.kurskueche()), 1.6, 0.4, (x1 + fx2) / 2, h + 0.23, z2 + 0.032, [0, 1]);
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
    sign(ctx.extra, 'KASSE 1', { w: 0.6, h: 0.2, bg: '#d64527', fg: '#fff', font: '800' }, (x1 + x2) / 2, 2.45, (z1 + z2) / 2, [-1, 0]);
    sign(ctx.extra, 'KASSE 1', { w: 0.6, h: 0.2, bg: '#d64527', fg: '#fff', font: '800' }, (x1 + x2) / 2, 2.45, (z1 + z2) / 2 + 0.01, [0, 1]);
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
    sign(ctx.extra, 'SB-KASSE', { w: 0.7, h: 0.2, bg: '#3fbf7f', fg: '#1c1c1f', font: '800' }, (x1 + x2) / 2 - 0.2, 2.45, (z1 + z2) / 2, [-1, 0]);
    sign(ctx.extra, 'SB-KASSE', { w: 0.7, h: 0.2, bg: '#3fbf7f', fg: '#1c1c1f', font: '800' }, (x1 + x2) / 2 - 0.2, 2.45, (z1 + z2) / 2 + 0.01, [0, 1]);
    b.box('metall', [(x1 + x2) / 2 - 0.206, (x1 + x2) / 2 - 0.194, (z1 + z2) / 2 - 0.006, (z1 + z2) / 2 + 0.006], 2.55, 3.2);
  },

  impulsregal(b, m, ctx) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    b.box('korpus', [x1, x1 + 0.04, z1, z2], 0, H);
    for (const z of [z1, z2 - 0.03]) b.box('korpus', [x1, x2, z, z + 0.03], 0, H);
    const levels = [0.08, 0.42, 0.76, 1.08];
    for (const y of levels) {
      b.box('holzHell', [x1 + 0.04, x2, z1 + 0.03, z2 - 0.03], y - 0.025, y);
      ctx.priceRailAt([x2, x2 + 0.012, z1 + 0.03, z2 - 0.03], y - 0.06, y - 0.025, [1, 0]);
      ctx.products.shelf('IMPULS', { along: 'z', from: z1 + 0.03, to: z2 - 0.03, front: x2, y, depth: x2 - x1 - 0.06, dir: [1, 0], maxH: 0.3, rows: 2, start: Math.round(y * 10) });
    }
    b.box('akzent', [x1, x2, z1, z2], H - 0.02, H);
    b.box('anthrazit', [x1 + 0.01, x1 + 0.03, (z1 + z2) / 2 - 0.01, (z1 + z2) / 2 + 0.01], H, H + 0.25);
    sign(ctx.extra, 'ERGÄNZEN? · Kräuter · Schoko', { w: 1.3, h: 0.22, bg: '#d64527', fg: '#fff', font: '800' }, x1 + 0.035, H + 0.33, (z1 + z2) / 2, [1, 0]);
  },

  glasbruestung(b, m) {
    const [x1, x2, z1, z2] = m.rechteck;
    const H = m.hoehe;
    const xc = (x1 + x2) / 2;
    b.box('glas', [xc - 0.006, xc + 0.006, z1, z2], 0.05, H - 0.04);
    b.box('edelstahl', [x1, x2, z1, z2], H - 0.04, H);
    for (let z = z1; z <= z2 + 0.01; z += (z2 - z1) / 3) b.box('edelstahl', [xc - 0.02, xc + 0.02, Math.min(z, z2 - 0.04), Math.min(z, z2 - 0.04) + 0.04], 0, H);
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
    sign(ctx.extra, 'KÜHLZELLE · Hinterbefüllung K1–K6', { w: 1.5, h: 0.2, bg: '#3f8fd0', fg: '#fff', font: '700' }, x1 + 2.2, 1.9, z2 + 0.01, [0, 1]);
    sign(ctx.extra, '+2 °C', { w: 0.3, h: 0.14, bg: '#1c1c1f', fg: '#3fbf7f', font: '700' }, dx + 0.45, 2.15, z2 + 0.035, [0, 1]);
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

// Inhalte der Kochwelt-Gondeln (Folien 9–11): jede Spalte = ein Feld des Dashboards.
// Reckzone: Anlass-Schild · Sichtzone: Rezeptkarten + Gericht-Bild · Greifzone: UNGEKÜHLTE Zutaten des Rezepts
// (Zweitplatzierung) + Hinweis auf Kühlware · Bückzone: Großpackungen und das Getränk zum Rezept.
const KUEHL = /^[KDO]/; // Kühlung, Dessert/TK, Obst & Gemüse stehen nie in der Kochwelt (Parmesan-Regel)

// Schild „So sieht's aus“: Teller mit dem Gericht (gezeichnet), Name, Zeit
function dishTexture(r) {
  const pal = { 'Pasta Night': ['#f2d27a', '#d8352a', '#7fb04a'], 'Asian Night': ['#e9d8b0', '#7fb04a', '#c9a227'], 'Mexican Night': ['#e8862e', '#3b4f22', '#c0392b'] }[r.welt] || ['#f2d27a', '#d8352a', '#7fb04a'];
  return canvasTex(470, 330, (g, w, h) => {
    g.fillStyle = '#2b2c30';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f1ec';
    g.beginPath();
    g.arc(118, 165, 98, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e2ddd3';
    g.beginPath();
    g.arc(118, 165, 72, 0, Math.PI * 2);
    g.fill();
    let seed = r.nr.charCodeAt(2) * 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = pal[i % 3];
      const a = rnd() * Math.PI * 2;
      const d = rnd() * 52;
      g.beginPath();
      g.ellipse(118 + Math.cos(a) * d, 165 + Math.sin(a) * d, 10 + rnd() * 12, 6 + rnd() * 8, rnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#f2c230';
    g.textBaseline = 'middle';
    g.font = `700 18px ${SANS}`;
    g.fillText("SO SIEHT'S AUS", 236, 48);
    g.fillStyle = '#fff';
    g.font = `800 34px ${SANS}`;
    g.fillText(r.nr, 236, 92);
    const words = r.titel.split(' ');
    let line = '';
    let y = 136;
    g.font = `700 22px ${SANS}`;
    for (const wd of words) {
      const t = line ? `${line} ${wd}` : wd;
      if (g.measureText(t).width > w - 250) {
        g.fillText(line, 236, y);
        y += 28;
        line = wd;
      } else line = t;
    }
    g.fillText(line, 236, y);
    g.fillStyle = '#c9c4bc';
    g.font = `500 18px ${SANS}`;
    g.fillText(`${r.zeit} · ${r.preis}`, 236, h - 64);
    g.fillText('Karte ziehen, Zutaten', 236, h - 38);
    g.fillText('nach Fachcode holen', 236, h - 16);
  });
}

function talkerTexture(r) {
  const cold = [...r.zutaten, ...r.ergaenzung].filter(([, c]) => KUEHL.test(c));
  return canvasTex(320, 200, (g, w, h) => {
    g.fillStyle = '#eaf3fb';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#3f8fd0';
    g.fillRect(0, 0, w, 44);
    g.fillStyle = '#fff';
    g.textBaseline = 'middle';
    g.font = `800 20px ${SANS}`;
    g.fillText(`${r.nr} · auch dazu:`, 12, 23);
    g.fillStyle = '#1c1c1f';
    g.font = `600 19px ${SANS}`;
    cold.slice(0, 5).forEach(([n, c], i) => {
      g.fillText(n, 12, 66 + i * 28);
      g.fillStyle = '#3f8fd0';
      g.textAlign = 'right';
      g.font = `800 19px ${SANS}`;
      g.fillText(c, w - 12, 66 + i * 28);
      g.textAlign = 'left';
      g.fillStyle = '#1c1c1f';
      g.font = `600 19px ${SANS}`;
    });
  });
}

BUILDERS['kochwelt-gondel'].matrixFace = function (b, m, ctx, f, levels) {
  const [x1, x2] = m.rechteck;
  const L = (x2 - x1 - 0.06) / 3;
  const P = ctx.products;
  m.rezepte.forEach((nr, i) => {
    const r = ctx.layout.rezepte.find((x) => x.nr === nr);
    const rk = `R${nr.slice(1)}`;
    const a1 = x1 + 0.03 + i * L;
    const a2 = a1 + L;
    const an = ANLASS[r.anlass];
    const key = `anlass-${r.anlass}`;
    if (!b.materials[key]) b.materials[key] = std(new THREE.Color(an.farbe), 0.6);
    if (i > 0) b.box(key, faceRect(f, a1 - 0.012, a1 + 0.012, 0.005, -0.25), 0.1, m.hoehe);
    // Sichtzone: Kartenspender und ein Schild „So sieht's aus“ – keine fertigen Pakete, eingekauft wird nach Karte
    if (!ctx.cardMats[r.nr]) ctx.cardMats[r.nr] = lit(recipeCardTexture(r));
    for (const k of [0.12, 0.27, 0.42]) {
      const [cx, cz] = f.at(a1 + k * L, -0.08);
      b.geo('glas', G.box(0.13, 0.17, 0.05), cx, levels[3] + 0.09, cz, yawFacing(...f.dir), -0.2);
      const [px, pz] = f.at(a1 + k * L, -0.05);
      plane(ctx.extra, ctx.cardMats[r.nr], 0.1, 0.14, px, levels[3] + 0.1, pz, f.dir, -0.2);
    }
    const dk = `gericht-${nr}`;
    if (!b.materials[dk]) b.materials[dk] = lit(dishTexture(r));
    const [dx, dz] = f.at(a1 + 0.75 * L, -0.12);
    b.geo('holzDunkel', G.box(0.5, 0.36, 0.02), dx, levels[3] + 0.19, dz, yawFacing(...f.dir), -0.12);
    const [ex, ez] = f.at(a1 + 0.75 * L, -0.105);
    plane(ctx.extra, b.materials[dk], 0.47, 0.33, ex, levels[3] + 0.19, ez, f.dir, -0.12);
    // Greifzone: ungekühlte Zutaten + Hinweiskarte auf die Kühlware (Fachcodes)
    P.shelf(rk, { along: 'x', from: a1, to: a2 - 0.33, front: f.front, y: levels[2], depth: 0.24, dir: f.dir, maxH: 0.34, rows: 2, facings: 2 });
    const tk = `talker-${nr}`;
    if (!b.materials[tk]) b.materials[tk] = lit(talkerTexture(r));
    const [tx, tz] = f.at(a2 - 0.17, -0.06);
    plane(ctx.extra, b.materials[tk], 0.29, 0.18, tx, levels[2] + 0.12, tz, f.dir, -0.12);
    // Bückzone: Großpackungen (oben) und Getränk zum Rezept (unten)
    P.shelf(`${rk}B`, { along: 'x', from: a1, to: a2, front: f.front, y: levels[1], depth: 0.24, dir: f.dir, maxH: 0.34, rows: 2, facings: 3 });
    P.shelf(`${rk}D`, { along: 'x', from: a1, to: a2, front: f.front, y: levels[0], depth: 0.24, dir: f.dir, maxH: 0.34, rows: 2, facings: 4, gap: 0.006 });
    // Reckzone: Anlass-Schild
    const [sx, sz] = f.at((a1 + a2) / 2, 0.01);
    sign(ctx.extra, `${an.sym} ${an.text} · ${r.nr} ${r.titel.split(' + ')[0]}`, { w: Math.min(1.55, L - 0.1), h: 0.2, bg: an.farbe, fg: '#fff', font: '800' }, sx, m.hoehe - 0.13, sz, f.dir);
  });
};

BUILDERS['kochwelt-gondel'].otherFace = function (b, m, ctx, f, levels, content) {
  const [x1, x2] = m.rechteck;
  const P = ctx.products;
  const span = { along: 'x', from: x1 + 0.03, to: x2 - 0.03, front: f.front, depth: 0.24, dir: f.dir, maxH: 0.34, rows: 2 };
  let title;
  let farbe;
  if (content === 'aktion') {
    // Zur Obst-&-Gemüse-Zone: weitere Pasta-Sorten, Saucen und Pasta-Getränke (Auswahl zur Pasta Night)
    title = 'PASTA NIGHT · MEHR AUSWAHL: Sorten, Saucen, Antipasti';
    farbe = '#d64527';
    P.shelf(['R03', 'ERG_PASTA'], { ...span, y: levels[3], facings: 3 });
    P.shelf(['R01', 'R03'], { ...span, y: levels[2], facings: 3, start: 1 });
    P.shelf(['R01B', 'R03B'], { ...span, y: levels[1], facings: 3 });
    P.shelf(['R01D', 'R02B'], { ...span, y: levels[0], facings: 4 });
  } else {
    // Gegenüber der Matrix: Schritt 04 „Ergänzen“ – Drink + Dessert derselben Kochwelt
    const welt = content === 'ergaenzung-pasta' ? 'Pasta Night' : 'Asian Night';
    const code = content === 'ergaenzung-pasta' ? 'ERG_PASTA' : 'ERG_ASIAN';
    farbe = content === 'ergaenzung-pasta' ? '#d64527' : '#c9a227';
    title = `${welt.toUpperCase()} · 04 ERGÄNZEN: DRINK + DESSERT`;
    const list = ctx.products.byCode[code];
    const drinks = list.map((_, i) => i).filter((i) => ['flasche', 'dose', 'tetra'].includes(list[i].p.form));
    const sweets = list.map((_, i) => i).filter((i) => !drinks.includes(i));
    // Dessert & Snacks in Sicht- und Greifzone, Getränke in der Bückzone
    for (const [lv, set] of [[3, sweets], [2, sweets], [1, drinks], [0, drinks]]) {
      const tmp = `${code}-${lv}`;
      if (!ctx.products.byCode[tmp]) ctx.products.byCode[tmp] = set.map((i) => list[i]);
      P.shelf(tmp, { ...span, y: levels[lv], facings: lv < 2 ? 4 : 3, start: lv });
    }
  }
  const [sx, sz] = f.at((x1 + x2) / 2, 0.01);
  sign(ctx.extra, title, { w: 2.9, h: 0.2, bg: farbe, fg: '#fff', font: '800' }, sx, m.hoehe - 0.13, sz, f.dir);
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
    priceRail(f, a1, a2, y0, y1) {
      const [x, z] = f.at((a1 + a2) / 2, 0.004);
      this.railGeo(a2 - a1, y1 - y0, x, (y0 + y1) / 2, z, f.dir);
    },
    priceRailAt([x1, x2, z1, z2], y0, y1, dir) {
      const alongX = Math.abs(dir[1]) > 0;
      const len = alongX ? x2 - x1 : z2 - z1;
      const x = dir[0] > 0 ? x2 + 0.003 : dir[0] < 0 ? x1 - 0.003 : (x1 + x2) / 2;
      const z = dir[1] > 0 ? z2 + 0.003 : dir[1] < 0 ? z1 - 0.003 : (z1 + z2) / 2;
      this.railGeo(len, y1 - y0, x, (y0 + y1) / 2, z, dir);
    },
    railGeo(len, h, x, y, z, dir) {
      const g = new THREE.PlaneGeometry(len, h);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 1.2));
      b.geo('preis', g, x, y, z, yawFacing(dir[0], dir[1]));
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
    const opts = { w, h, bg: d.farbe, fg: '#fff', font: '800' };
    const yaw = yawFacing(dir[0], dir[1]);
    for (const s of [1, -1]) {
      const m = signMesh(d.text, opts);
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
    addStaticPerson(b, randomLook(rand, p.personal ? staffLook : {}), x, z, yawFacing(...p.blick), p.haltung || 'stehen');
    if (!p.personal) colliders.push([x - 0.22, x + 0.22, z - 0.22, z + 0.22]);
  }

  // Feuerlöscher neben dem Notausgang
  const fx = 0.05;
  const fz = 9.35;
  if (!b.materials.rot) b.materials.rot = std(0xc0282b, 0.4);
  b.geo('rot', new THREE.CylinderGeometry(0.075, 0.075, 0.5, 20), fx + 0.1, 0.55, fz);
  b.geo('schwarz', new THREE.CylinderGeometry(0.03, 0.04, 0.08, 12), fx + 0.1, 0.84, fz);
  sign(extra, 'FEUERLÖSCHER', { w: 0.28, h: 0.1, bg: '#c0282b', fg: '#ffffff' }, 0.01, 1.1, fz, [1, 0]);

  const group = b.build('Möbel');
  group.add(products.build());
  return { group, colliders, drawers: null, products };
}

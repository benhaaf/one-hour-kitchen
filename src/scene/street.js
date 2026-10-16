// Umgebung vor dem Laden: Gehweg, Straße mit Haltestelle, Bäume, Fahrräder, Kundenstopper,
// gegenüber ein Campus-Gebäude (freie Darstellung). Alles aus einfachen Formen.
import * as THREE from 'three';
import { Builder, rng, yawFacing } from './builder.js';
import { canvasTex, fitText } from './accessories.js';
import { addStaticPerson, randomLook } from './people.js';

const std = (color, roughness = 0.85, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const SANS = 'system-ui, -apple-system, sans-serif';

function tiled(draw, size, repeat) {
  const t = canvasTex(size, size, draw);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}

function plane(parent, material, w, h, x, y, z, dir, pitch = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(x, y, -z);
  m.rotation.set(pitch, yawFacing(dir[0], dir[1]), 0, 'YXZ');
  parent.add(m);
  return m;
}

export function buildStreet(layout) {
  const group = new THREE.Group();
  group.name = 'Strasse';
  const W = layout.raum.breite;
  const x0 = -14;
  const x1 = W + 14;
  const L = x1 - x0;
  const r = rng(7);

  // Böden
  const paving = new THREE.MeshStandardMaterial({
    roughness: 0.95,
    map: tiled((g, s) => {
      g.fillStyle = '#b8b2a8';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          g.fillStyle = `hsl(32, 8%, ${64 + ((i * 3 + j * 5) % 7)}%)`;
          g.fillRect(i * (s / 4) + 2, j * (s / 4) + 2, s / 4 - 4, s / 4 - 4);
        }
    }, 128, [L / 1.2, 4 / 1.2]),
  });
  const asphalt = new THREE.MeshStandardMaterial({
    roughness: 1,
    map: tiled((g, s) => {
      g.fillStyle = '#4a4b4f';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.06)`;
        g.fillRect(r() * s, r() * s, 2, 2);
      }
    }, 128, [L / 3, 2]),
  });
  const floor = (mat, za, zb, y = -0.01) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, zb - za), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, -(za + zb) / 2);
    group.add(m);
  };
  floor(paving, -4.4, -0.2);
  floor(asphalt, -11.6, -4.4, -0.14);
  floor(paving, -15.5, -11.6);

  const b = new Builder({
    bordstein: std(0x9a958e, 0.9),
    markierung: new THREE.MeshBasicMaterial({ color: 0xe9e6df }),
    stamm: std(0x5a4632, 0.9),
    laub: std(0x5f8f3e, 0.85),
    laub2: std(0x4d7a33, 0.85),
    metall: std(0x3a3c40, 0.4, 0.6),
    chrom: std(0xb8bcc2, 0.25, 0.9),
    holz: std(0x8a6242, 0.7),
    glas: new THREE.MeshStandardMaterial({ color: 0x9fb8c8, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.55 }),
    fassade: std(0xdcd6cc, 0.9),
    fassade2: std(0xc9c2b6, 0.9),
    beton: std(0xa8a39b, 0.95),
    dunkel: std(0x2b2c30, 0.7),
    rot: std(0xb84a32, 0.6),
    gruen: std(0x4a7340, 0.6),
    gelb: std(0xd9b24a, 0.6),
    blau: std(0x2f5d8a, 0.6),
    reifen: std(0x161617, 0.8),
  });
  // Bordsteine, Fahrbahnmarkierung, Gleise
  b.box('bordstein', [x0, x1, -4.45, -4.3], -0.14, 0);
  b.box('bordstein', [x0, x1, -11.7, -11.55], -0.14, 0);
  for (let x = x0; x < x1; x += 3) b.box('markierung', [x, x + 1.5, -8.05, -7.95], -0.135, -0.13);
  for (const z of [-5.66, -6.1, -9.96, -10.4]) b.box('chrom', [x0, x1, z, z + 0.06], -0.14, -0.12);

  // Bäume entlang des Gehwegs
  const tree = (x, z, s = 1) => {
    b.geo('stamm', new THREE.CylinderGeometry(0.1 * s, 0.14 * s, 2.6 * s, 10), x, 1.3 * s, z);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7;
      b.geo(k % 2 ? 'laub' : 'laub2', new THREE.IcosahedronGeometry((0.9 + (k % 2) * 0.3) * s, 1), x + Math.sin(a) * 0.45 * s, (2.9 + (k % 3) * 0.35) * s, z + Math.cos(a) * 0.45 * s);
    }
  };
  for (const x of [-9, -3.5, 13.2, 21.5, 27]) tree(x, -3.6);
  for (const x of [-10, -2, 6, 14, 22, 30]) tree(x, -12.4, 1.1);

  // Straßenlaternen
  for (const x of [-6.5, 4.6, 16.4, 28]) {
    b.box('metall', [x - 0.05, x + 0.05, -3.95, -3.85], 0, 4.6);
    b.box('metall', [x - 0.05, x + 0.05, -3.95, -3.0], 4.5, 4.6);
    b.box('chrom', [x - 0.15, x + 0.15, -3.2, -2.9], 4.4, 4.5);
  }

  // Fahrradständer + Räder
  const bike = (x, z, col) => {
    for (const dz of [-0.45, 0.45]) b.geo('reifen', new THREE.TorusGeometry(0.33, 0.025, 6, 24), x, 0.35, z + dz, Math.PI / 2);
    b.geo(col, new THREE.BoxGeometry(0.03, 0.03, 0.85), x, 0.6, z, 0, 0.25);
    b.geo(col, new THREE.BoxGeometry(0.03, 0.5, 0.03), x, 0.55, z - 0.15, 0, 0.3);
    b.box('dunkel', [x - 0.12, x + 0.12, z - 0.26, z - 0.08], 0.85, 0.89);
  };
  for (const [i, x] of [12.4, 13.1, 13.8, 14.5].entries()) {
    b.geo('chrom', new THREE.TorusGeometry(0.38, 0.022, 6, 20, Math.PI), x, 0, -2.6, Math.PI / 2);
    if (i !== 2) bike(x + 0.12, -2.6, ['rot', 'blau', 'gruen', 'dunkel'][i]);
  }

  // Bank
  b.box('holz', [-1.8, -0.2, -2.7, -2.3], 0.42, 0.47);
  b.box('holz', [-1.8, -0.2, -2.32, -2.25], 0.47, 0.85);
  for (const x of [-1.7, -0.35]) b.box('metall', [x, x + 0.05, -2.65, -2.3], 0, 0.42);

  // Haltestelle „Bildungscampus“ auf der anderen Straßenseite
  const hx = 8;
  b.box('metall', [hx - 2, hx - 1.94, -12.26, -12.2], 0, 2.5);
  b.box('metall', [hx + 1.94, hx + 2, -12.26, -12.2], 0, 2.5);
  b.box('glas', [hx - 2, hx + 2, -13.13, -13.1], 0.1, 2.4);
  b.box('dunkel', [hx - 2.1, hx + 2.1, -13.2, -12.1], 2.45, 2.55);
  b.box('holz', [hx - 1.5, hx + 1.5, -13.05, -12.8], 0.45, 0.5);
  b.box('metall', [hx + 2.4, hx + 2.48, -12.28, -12.2], 0, 2.8);
  const hsTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d9b24a';
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#4a7340';
    g.font = `800 120px ${SANS}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('H', w / 2, h / 2 + 6);
  });
  plane(group, new THREE.MeshStandardMaterial({ map: hsTex, transparent: true }), 0.5, 0.5, hx + 2.44, 2.95, -12.18, [0, 1]);
  const hName = canvasTex(512, 96, (g, w, h) => {
    g.fillStyle = '#2b2c30';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f1ec';
    g.textBaseline = 'middle';
    fitText(g, 'Bildungscampus', 24, h / 2, w - 48, 800, 48);
  });
  plane(group, new THREE.MeshStandardMaterial({ map: hName }), 2.4, 0.45, hx, 2.75, -12.08, [0, 1]);

  // Gebäude gegenüber: Campus (Beton/Glas, freie Darstellung)
  const cz = -15.5;
  b.box('beton', [x0, x1, cz - 6, cz], 0, 9);
  for (let x = x0 + 1; x < x1 - 1; x += 3) {
    for (const y of [0.6, 3.6, 6.6]) b.box('glas', [x, x + 2.4, cz, cz + 0.04], y, y + 2.2);
  }
  b.box('dunkel', [x0, x1, cz, cz + 0.3], 3.2, 3.4);
  const campus = canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0)';
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#2b2c30';
    g.textBaseline = 'middle';
    g.font = `700 64px ${SANS}`;
    g.fillText('CAMPUS · Hörsaalgebäude', 20, h / 2);
  });
  plane(group, new THREE.MeshStandardMaterial({ map: campus, transparent: true }), 8, 1, 4, 4.0, cz + 0.32, [0, 1]);

  // Nachbarfassaden links und rechts des Ladens
  const nb = (xa, xb, mat, name, col) => {
    b.box(mat, [xa, xb, -0.2, 6], 0, 9);
    b.box('glas', [xa + 0.6, xb - 0.6, -0.24, -0.2], 0.3, 2.8);
    for (let x = xa + 0.6; x < xb - 1.2; x += 1.8) for (const y of [4, 6.6]) b.box('glas', [x, x + 1.2, -0.24, -0.2], y, y + 1.6);
    const t = canvasTex(512, 96, (g, w, h) => {
      g.fillStyle = col;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff';
      g.textBaseline = 'middle';
      fitText(g, name, 20, h / 2, w - 40, 800, 52);
    });
    plane(group, new THREE.MeshStandardMaterial({ map: t }), Math.min(4, xb - xa - 1), 0.6, (xa + xb) / 2, 3.25, -0.26, [0, -1]);
  };
  nb(-14, -0.2, 'fassade', 'BUCHHANDLUNG', '#2f5d8a');
  nb(18.0, 31, 'fassade2', 'COPYSHOP', '#5b6d5b');
  // Obergeschoss über dem Laden
  b.box('fassade', [-0.2, 18.0, -0.2, 0.0], 3.4, 9);
  for (let x = 0.8; x < 17; x += 2.2) for (const y of [4.2, 6.8]) b.box('glas', [x, x + 1.4, -0.24, -0.2], y, y + 1.6);
  // Markise über dem Schaufenster
  b.geo('dunkel', new THREE.BoxGeometry(5.4, 0.04, 1.1), 3.05, 2.98, -0.6, 0, 0.18); // Markise Schwarzstahl

  // Kundenstopper vor dem Laden
  const aTex = canvasTex(256, 384, (g, w, h) => {
    g.fillStyle = '#1f2421';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b2e2c';
    g.fillRect(0, 0, w, 64);
    g.fillStyle = '#fff';
    g.textBaseline = 'middle';
    fitText(g, 'HEUTE: PASTA NIGHT', 14, 34, w - 28, 800, 26);
    g.fillStyle = '#f4f1ec';
    const lines = ['» #01 Creamy Tomato', '   Pasta – 20 Min.', '', '€ #03 Pasta e Fagioli', '   3,20 € / Portion', '', 'Live-Cooking', '11:30–13:30', 'zum Probieren!'];
    g.font = `600 22px ${SANS}`;
    lines.forEach((l, i) => g.fillText(l, 16, 100 + i * 30));
  });
  const aMat = new THREE.MeshStandardMaterial({ map: aTex, roughness: 0.9 });
  const ax = 8.8;
  const az = -1.5;
  for (const s of [1, -1]) {
    const m = plane(group, aMat, 0.55, 0.85, ax, 0.5, az + s * 0.17, [0, s > 0 ? 1 : -1], s * 0.2);
    void m;
  }

  // Passanten
  const ppl = [[-5, -2.0, [1, 0]], [2.0, -3.2, [-1, 0]], [16.2, -1.9, [0, -1]], [20.5, -2.8, [-1, 0]], [7.4, -12.6, [0, 1]], [9.1, -12.5, [-1, 0]], [-8, -1.4, [1, 0]]];
  for (const [x, z, dir] of ppl) addStaticPerson(b, randomLook(r, { bag: r() < 0.6 }), x, z, yawFacing(...dir), 'stehen');

  group.add(b.build('Strasse-Teile'));
  return group;
}

// Einkaufs-Spiel: Rezept am Matrix-Dashboard wählen → Zutaten über die Fachcodes im Laden finden
// (leuchtende Marker) → an der Kasse bezahlen → Bon mit Einkaufszeit und „One Hour“-Check.
import * as THREE from 'three';
import { recipeCardTexture } from './scene/furniture.js';
import { textSprite } from './scene/labels.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const REACH = 1.7;
const PREISE = { O1: 0.99, T1: 1.79, T2: 2.49, T3: 2.29, T4: 0.99, T5: 2.79, T6: 2.29, K1: 1.19, K2: 2.49, K3: 2.29, K4: 4.99, K5: 2.19, K6: 1.79, D1: 3.49, D2: 2.29, D3: 2.49, G1: 6.99, G2: 6.49, G3: 1.29, B1: 4.99, B2: 1.79, B3: 1.09, B4: 2.49, B5: 4.49, B6: 2.49, B7: 1.79 };
const ANLASS = { schnell: '» schnell', besonders: '★ besonders', günstig: '€ günstig' };

// Wo liegt ein Fachcode? → Punkt vor der Regalfront (Kunde steht dort) + Blickziel
export function codeLocations(layout) {
  const loc = {};
  const front = (m, seite, a, out = 0.75) => {
    const [x1, x2, z1, z2] = m.rechteck;
    if (seite === 'vorne') return { p: [a, z1 - out], ziel: [a, z1] };
    if (seite === 'hinten') return { p: [a, z2 + out], ziel: [a, z2] };
    if (seite === 'links') return { p: [x1 - out, a], ziel: [x1, a] };
    return { p: [x2 + out, a], ziel: [x2, a] };
  };
  for (const m of layout.moebel) {
    const [x1, x2, z1, z2] = m.rechteck || [0, 0, 0, 0];
    if (m.faecher) {
      const L = (x2 - x1) / m.faecher.length;
      m.faecher.forEach((f, i) => (loc[f.code] = { ...front(m, 'vorne', x1 + (i + 0.5) * L), moebel: m.id }));
    }
    if (m.seiten) {
      for (const [seite, list] of Object.entries(m.seiten)) {
        const L = (z2 - z1) / list.length;
        list.forEach((f, i) => (loc[f.code] = { ...front(m, seite, z1 + (i + 0.5) * L), moebel: m.id }));
      }
    }
    if (m.typ === 'gondel' && m.regal) {
      // je Gondelseite eine Warengruppe (Fachcode)
      for (const seite of ['vorne', 'hinten']) {
        const face = m.regal[seite];
        if (face) loc[face.code] = { ...front(m, seite, (x1 + x2) / 2), moebel: m.id };
      }
    }
    if (m.typ === 'obst-stand') {
      const n = [m.richtung[1], -m.richtung[0]];
      loc.O1 = { p: [m.mitte[0] + n[0] * 1.05, m.mitte[1] + n[1] * 1.05], ziel: m.mitte, moebel: m.id };
    }
  }
  return loc;
}

export class Shopping {
  constructor(layout, scene, root, hud) {
    this.layout = layout;
    this.scene = scene;
    this.hud = hud;
    this.loc = codeLocations(layout);
    this.state = 'aus'; // aus | wahl | einkauf | bon
    this.sel = 0;
    this.markers = new THREE.Group();
    this.markers.name = 'Einkaufsmarker';
    scene.add(this.markers);
    const dash = layout.moebel.find((m) => m.typ === 'matrix-dashboard');
    const [dx1, dx2, dz1] = dash.rechteck;
    this.dashPoint = [(dx1 + dx2) / 2, dz1 - 0.9];
    const kassen = layout.moebel.filter((m) => m.typ === 'kasse-band' || m.typ === 'sb-kasse');
    this.kassen = kassen.map((m) => {
      const [x1, x2, z1, z2] = m.rechteck;
      return m.typ === 'kasse-band' ? [x1 - 0.5, (z1 + z2) / 2] : [x1 - 0.55, (z1 + z2) / 2];
    });
    root.insertAdjacentHTML(
      'beforeend',
      `<div id="shop-pick" hidden role="dialog" aria-label="Rezept wählen"><div class="pick-box"></div></div>
       <aside id="shop-list" hidden></aside>
       <div id="shop-bon" hidden role="dialog" aria-label="Kassenbon"><div class="bon-box"></div></div>`,
    );
    this.pickEl = root.querySelector('#shop-pick');
    this.listEl = root.querySelector('#shop-list');
    this.bonEl = root.querySelector('#shop-bon');
    this.pickEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-i]');
      if (btn) {
        this.sel = Number(btn.dataset.i);
        this.choose();
      } else if (e.target === this.pickEl || e.target.closest('[data-x]')) this.stop();
    });
    this.bonEl.addEventListener('click', () => this.stop());
    this.onChange = () => {};
  }

  get active() {
    return this.state !== 'aus';
  }

  // Reihenfolge wie auf dem Dashboard: Zeilen = Anlass, Spalten = Küche
  get grid() {
    const R = this.layout.rezepte;
    const out = [];
    for (const a of ['schnell', 'besonders', 'günstig']) for (const w of ['Pasta Night', 'Asian Night', 'Mexican Night']) out.push(R.find((r) => r.welt === w && r.anlass === a));
    return out;
  }

  openPicker() {
    this.state = 'wahl';
    this.renderPicker();
    this.pickEl.hidden = false;
    this.onChange();
  }

  renderPicker() {
    const cells = this.grid.map(
      (r, i) => `<button type="button" data-i="${i}" class="pick-cell ${i === this.sel ? 'sel' : ''}" style="--w:${r.welt.startsWith('Pasta') ? '#a8432c' : r.welt.startsWith('Asian') ? '#b08a34' : '#3f6e4a'}"><b>${esc(r.nr)}</b><span>${esc(r.titel)}</span><small>${esc(r.zeit)} · ${esc(r.preis)}</small></button>`,
    );
    this.pickEl.querySelector('.pick-box').innerHTML = `
      <header><h1>Was kochst du heute?</h1><p>Küche × Anlass = ein Rezept. Wähle mit Tippen, ←/→ bzw. L1/R1 und bestätige mit X / E.</p></header>
      <div class="pick-grid"><span></span><span class="ph">PASTA</span><span class="ph">ASIAN</span><span class="ph">MEXICAN</span>
        <span class="pr">» schnell<small>≤ 20 Min.</small></span>${cells.slice(0, 3).join('')}
        <span class="pr">★ besonders<small>Menü für 2</small></span>${cells.slice(3, 6).join('')}
        <span class="pr">€ günstig<small>≤ 4 €/Portion</small></span>${cells.slice(6, 9).join('')}</div>
      <footer><button type="button" data-x="1">Abbrechen</button></footer>`;
  }

  move(d) {
    if (this.state !== 'wahl') return;
    this.sel = (this.sel + d + 9) % 9;
    this.renderPicker();
  }

  choose() {
    const r = this.grid[this.sel];
    this.recipe = r;
    this.items = [...r.zutaten.map(([n, c]) => ({ name: n, code: c })), ...r.ergaenzung.map(([n, c]) => ({ name: n, code: c, optional: true }))];
    this.items.forEach((it) => {
      it.done = false;
      it.loc = this.loc[`${it.code}:${it.name}`] || this.loc[it.code];
    });
    this.pickEl.hidden = true;
    this.state = 'einkauf';
    this.t0 = performance.now();
    this.buildMarkers();
    this.renderList();
    this.hud.toast(`Rezept ${r.nr} gezogen – folge den leuchtenden Markern`, 2600);
    this.onChange();
  }

  buildMarkers() {
    this.markers.clear();
    const seen = new Map();
    for (const it of this.items) {
      if (!it.loc || it.done) continue;
      const k = `${it.loc.p[0].toFixed(2)},${it.loc.p[1].toFixed(2)}`;
      if (seen.has(k)) {
        seen.get(k).names.push(it.name);
        continue;
      }
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.4, 32), new THREE.MeshBasicMaterial({ color: it.optional ? 0xd9b24a : 0x4f8a6a, transparent: true, opacity: 0.9, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(it.loc.p[0], 0.03, -it.loc.p[1]);
      const pin = textSprite([`${it.code} · ${it.name}`, it.optional ? 'optional: Ergänzen' : 'Zutat'], { height: 0.22, accent: it.optional ? '#d9b24a' : '#4f8a6a' });
      pin.position.set(it.loc.ziel[0], 2.05, -it.loc.ziel[1]);
      const g = new THREE.Group();
      g.add(ring, pin);
      g.userData = { names: [it.name] };
      this.markers.add(g);
      seen.set(k, g.userData);
    }
    // Kasse markieren, sobald alle Pflicht-Zutaten im Korb sind
    if (this.items.filter((i) => !i.optional).every((i) => i.done)) {
      for (const [x, z] of this.kassen) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.45, 32), new THREE.MeshBasicMaterial({ color: 0xb84a32, transparent: true, opacity: 0.95, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.03, -z);
        this.markers.add(ring);
      }
      const pin = textSprite(['KASSE', 'hier bezahlen'], { height: 0.26, accent: '#b84a32' });
      pin.position.set(13, 2.3, -2.2);
      this.markers.add(pin);
    }
  }

  renderList() {
    const r = this.recipe;
    const sec = Math.floor((performance.now() - this.t0) / 1000);
    const rows = this.items
      .map((it) => `<li class="${it.done ? 'done' : ''} ${it.optional ? 'opt' : ''}"><span class="chk">${it.done ? '✓' : '○'}</span>${esc(it.name)}<b>${esc(it.code)}</b></li>`)
      .join('');
    this.listEl.innerHTML = `
      <header><span class="nr">${esc(r.nr)}</span><div><h2>${esc(r.titel)}</h2><small>${esc(ANLASS[r.anlass])} · ${esc(r.welt)} · Kochzeit ${esc(r.zeit)}</small></div></header>
      <ol>${rows}</ol>
      <footer><span>⏱ ${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}</span><span>Fachcodes: O Obst · T Trocken · K Kühlung · B Basis · D Dessert · G Getränke</span></footer>`;
    this.listEl.hidden = false;
  }

  // Ziel in Reichweite? → { label, act } für den Interaktionshinweis
  target(px, pz) {
    if (this.state === 'aus') {
      const d = Math.hypot(px - this.dashPoint[0], pz - this.dashPoint[1]);
      return d < 1.6 ? { label: 'Rezept am Dashboard wählen (Einkaufs-Spiel)', act: () => this.openPicker() } : null;
    }
    if (this.state !== 'einkauf') return null;
    let best = null;
    for (const it of this.items) {
      if (it.done || !it.loc) continue;
      const d = Math.hypot(px - it.loc.p[0], pz - it.loc.p[1]);
      if (d < REACH && (!best || d < best.d)) best = { d, it };
    }
    if (best) {
      const same = this.items.filter((i) => !i.done && i.loc === best.it.loc);
      const names = same.map((i) => i.name).join(', ');
      return { label: `${names} in den Korb (${best.it.code})`, act: () => this.collect(same) };
    }
    const allDone = this.items.filter((i) => !i.optional).every((i) => i.done);
    if (allDone) {
      for (const [x, z] of this.kassen) if (Math.hypot(px - x, pz - z) < 1.4) return { label: 'Bezahlen', act: () => this.pay() };
    }
    return null;
  }

  collect(list) {
    list.forEach((i) => (i.done = true));
    this.hud.toast(`✓ ${list.map((i) => i.name).join(', ')}`, 1400);
    this.buildMarkers();
    this.renderList();
  }

  pay() {
    const r = this.recipe;
    const sec = Math.round((performance.now() - this.t0) / 1000);
    const bought = this.items.filter((i) => i.done);
    const sum = bought.reduce((s, i) => s + (PREISE[i.code] || 1.5), 0);
    const kochMin = parseInt(r.zeit, 10) || 30;
    // Spielzeit ist schneller als echte Zeit: 1 s Spiel ≈ 2 s im Laden (Annahme für die Darstellung)
    const einkaufMin = Math.max(1, Math.round((sec * 2) / 60));
    const gesamt = einkaufMin + kochMin;
    const ok = einkaufMin <= 15 && gesamt <= 60;
    this.state = 'bon';
    this.markers.clear();
    this.listEl.hidden = true;
    this.bonEl.querySelector('.bon-box').innerHTML = `
      <h1>ONE HOUR KITCHEN</h1><p class="sub">Kassenbon · Rezept ${esc(r.nr)} ${esc(r.titel)}</p>
      <table>${bought.map((i) => `<tr><td>${esc(i.name)}</td><td>${esc(i.code)}</td><td class="num">${(PREISE[i.code] || 1.5).toFixed(2).replace('.', ',')} €</td></tr>`).join('')}
      <tr class="sum"><td>Summe</td><td></td><td class="num">${sum.toFixed(2).replace('.', ',')} €</td></tr></table>
      <div class="check ${ok ? 'ok' : ''}"><b>One-Hour-Check</b><span>Einkauf ≈ ${einkaufMin} Min. + Kochzeit ${kochMin} Min. = ${gesamt} Min. ${ok ? '✓ unter einer Stunde' : '– Ziel verfehlt'}</span></div>
      <p class="hint">Einkaufszeit = Spielzeit × 2 (Darstellung, nicht gemessen). Tippen oder X / E schließt den Bon.</p>`;
    this.bonEl.hidden = false;
    this.onChange();
  }

  stop() {
    this.state = 'aus';
    this.markers.clear();
    this.pickEl.hidden = true;
    this.listEl.hidden = true;
    this.bonEl.hidden = true;
    this.onChange();
  }

  update(dt) {
    if (this.state !== 'einkauf') return;
    this.tick = (this.tick || 0) + dt;
    const pulse = 0.75 + Math.sin(performance.now() / 260) * 0.25;
    this.markers.traverse((o) => {
      if (o.isMesh && o.geometry.type === 'RingGeometry') o.material.opacity = pulse;
    });
    if (this.tick > 1) {
      this.tick = 0;
      this.renderList();
    }
  }
}

export { recipeCardTexture };

// Kundenbetrieb: mehrere Kunden laufen gleichzeitig durch den Laden und verhalten sich wie normale Kunden –
// rein durch den Eingang, Rollkorb nehmen, am Dashboard ein Rezept wählen, die Zutaten über die Fachcodes holen,
// an der Kasse zahlen und durch den Ausgang gehen. Läuft im Hintergrund weiter, auch während der Präsentation.
// Wege werden auf einem Raster um alle Möbel herum geplant (A* + Glättung), damit niemand durch Regale läuft.
import * as THREE from 'three';
import { Walker, randomLook, applyPose } from './scene/people.js';
import { rng } from './scene/builder.js';
import { codeLocations } from './shopping.js';

const CELL = 0.15;
const CLEAR = 0.27; // Abstand der Körpermitte zu Möbeln
const MAX = 9; // gleichzeitig im Laden

export class Crowd {
  constructor(layout, scene, colliders) {
    this.layout = layout;
    this.scene = scene;
    this.active = false;
    this.agents = [];
    this.rand = rng(7);
    this.loc = codeLocations(layout);
    this.t = 0;
    this.spawnIn = 0;
    this.buildGrid(colliders);
    const kassen = layout.moebel.filter((m) => m.typ === 'kasse-band' || m.typ === 'sb-kasse');
    this.kassen = kassen.map((m) => {
      const [x1, , z1, z2] = m.rechteck;
      return m.typ === 'kasse-band' ? { p: [x1 - 0.45, (z1 + z2) / 2], ziel: [x1, (z1 + z2) / 2] } : { p: [x1 - 0.5, (z1 + z2) / 2], ziel: [x1, (z1 + z2) / 2] };
    });
    const door = (id) => layout.oeffnungen.find((o) => o.id === id);
    const ein = door('eingang');
    const aus = door('ausgang');
    this.einX = (ein.von + ein.bis) / 2;
    this.ausX = (aus.von + aus.bis) / 2;
    const dash = layout.moebel.find((m) => m.typ === 'matrix-dashboard');
    this.dash = dash ? { p: [(dash.rechteck[0] + dash.rechteck[1]) / 2 + (this.rand() - 0.5), dash.rechteck[2] - 0.75], ziel: [(dash.rechteck[0] + dash.rechteck[1]) / 2, dash.rechteck[2]] } : null;
    const korb = layout.moebel.find((m) => m.typ === 'rollkoerbe');
    this.korb = korb ? { p: [(korb.rechteck[0] + korb.rechteck[1]) / 2, korb.rechteck[3] + 0.45], ziel: [(korb.rechteck[0] + korb.rechteck[1]) / 2, korb.rechteck[3]] } : null;
    const tresen = layout.moebel.find((m) => m.typ === 'kochtresen');
    this.kueche = tresen ? { p: [(tresen.rechteck[0] + tresen.rechteck[1]) / 2, tresen.rechteck[2] - 0.95], ziel: [(tresen.rechteck[0] + tresen.rechteck[1]) / 2, tresen.rechteck[2] + 0.3] } : null;
  }

  // ---------- Navigationsraster ----------
  buildGrid(colliders) {
    const L = this.layout;
    const [, W, , D] = L.raum.verkaufsraum || [0, L.raum.breite, 0, L.raum.tiefe];
    this.x0 = -2;
    this.z0 = -3.4;
    this.nx = Math.ceil((W + 2.2 - this.x0) / CELL);
    this.nz = Math.ceil((D - this.z0) / CELL);
    const rects = colliders.filter((r) => !(r[3] <= 0.001 && r[2] < -0.5)); // Frontwand kommt mit Türöffnungen neu dazu
    // Frontwand mit Türen (Ein- und Ausgang)
    const doors = L.oeffnungen.filter((o) => o.wand === 'front' && o.typ === 'tuer').sort((a, b) => a.von - b.von);
    let a = this.x0 - 1;
    for (const d of doors) {
      rects.push([a, d.von, -0.22, 0]);
      a = d.bis;
    }
    rects.push([a, W + 3, -0.22, 0]);
    // innerhalb des Ladens nicht in den Lagerbereich / hinter die Rückwand
    rects.push([W, W + 3, 0, D + 1], [this.x0 - 1, W + 3, D, D + 2]);
    this.blocked = new Uint8Array(this.nx * this.nz);
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.nz; j++) {
        const x = this.x0 + (i + 0.5) * CELL;
        const z = this.z0 + (j + 0.5) * CELL;
        let b = 0;
        for (const [x1, x2, z1, z2] of rects) {
          if (x > x1 - CLEAR && x < x2 + CLEAR && z > z1 - CLEAR && z < z2 + CLEAR) {
            b = 1;
            break;
          }
        }
        this.blocked[j * this.nx + i] = b;
      }
    }
  }

  cellOf(x, z) {
    return [Math.max(0, Math.min(this.nx - 1, Math.floor((x - this.x0) / CELL))), Math.max(0, Math.min(this.nz - 1, Math.floor((z - this.z0) / CELL)))];
  }

  free(i, j) {
    return i >= 0 && j >= 0 && i < this.nx && j < this.nz && !this.blocked[j * this.nx + i];
  }

  // nächste freie Zelle (falls Ziel knapp im Sperrbereich liegt)
  nearestFree(i, j) {
    if (this.free(i, j)) return [i, j];
    for (let r = 1; r < 12; r++) {
      for (let di = -r; di <= r; di++) {
        for (const dj of [-r, r]) if (this.free(i + di, j + dj)) return [i + di, j + dj];
        for (const dj of [-r + 1, r - 1]) if (this.free(i + dj, j + di)) return [i + dj, j + di];
      }
    }
    return [i, j];
  }

  lineFree(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(d / (CELL * 0.5));
    for (let k = 1; k < n; k++) {
      const [i, j] = this.cellOf(ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n);
      if (!this.free(i, j)) return false;
    }
    return true;
  }

  // A* (8 Nachbarn) + Glättung über Sichtlinien → Liste von Punkten [x, z]
  path(from, to) {
    const [si, sj] = this.nearestFree(...this.cellOf(...from));
    const [ti, tj] = this.nearestFree(...this.cellOf(...to));
    const N = this.nx * this.nz;
    const g = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const open = [];
    const s = sj * this.nx + si;
    const t = tj * this.nx + ti;
    const h = (i, j) => {
      const dx = Math.abs(i - ti);
      const dz = Math.abs(j - tj);
      return Math.max(dx, dz) + 0.414 * Math.min(dx, dz);
    };
    g[s] = 0;
    open.push([h(si, sj), s]);
    const push = (f, n) => {
      // binärer Heap
      open.push([f, n]);
      let k = open.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (open[p][0] <= open[k][0]) break;
        [open[p], open[k]] = [open[k], open[p]];
        k = p;
      }
    };
    const pop = () => {
      const top = open[0];
      const last = open.pop();
      if (open.length) {
        open[0] = last;
        let k = 0;
        for (;;) {
          const l = 2 * k + 1;
          const r = l + 1;
          let m = k;
          if (l < open.length && open[l][0] < open[m][0]) m = l;
          if (r < open.length && open[r][0] < open[m][0]) m = r;
          if (m === k) break;
          [open[m], open[k]] = [open[k], open[m]];
          k = m;
        }
      }
      return top;
    };
    let found = false;
    while (open.length) {
      const [, c] = pop();
      if (closed[c]) continue;
      closed[c] = 1;
      if (c === t) {
        found = true;
        break;
      }
      const ci = c % this.nx;
      const cj = (c / this.nx) | 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue;
          const ni = ci + di;
          const nj = cj + dj;
          if (!this.free(ni, nj)) continue;
          if (di && dj && (!this.free(ci + di, cj) || !this.free(ci, cj + dj))) continue; // keine Ecken schneiden
          const n = nj * this.nx + ni;
          const ng = g[c] + (di && dj ? 1.414 : 1);
          if (ng < g[n]) {
            g[n] = ng;
            came[n] = c;
            push(ng + h(ni, nj), n);
          }
        }
      }
    }
    if (!found) return [to];
    const cells = [];
    for (let c = t; c !== -1; c = came[c]) cells.push(c);
    cells.reverse();
    const pts = cells.map((c) => [this.x0 + ((c % this.nx) + 0.5) * CELL, this.z0 + (((c / this.nx) | 0) + 0.5) * CELL]);
    // Glätten: so weit wie möglich geradeaus
    const out = [pts[0]];
    let k = 0;
    while (k < pts.length - 1) {
      let m = pts.length - 1;
      while (m > k + 1 && !this.lineFree(pts[k][0], pts[k][1], pts[m][0], pts[m][1])) m--;
      out.push(pts[m]);
      k = m;
    }
    const last = out[out.length - 1];
    if (this.lineFree(last[0], last[1], to[0], to[1])) out.push(to);
    return out;
  }

  // ---------- Kunden ----------
  plan(agent) {
    const R = this.rand;
    const L = this.layout;
    const rez = L.rezepte[Math.floor(R() * L.rezepte.length)];
    const stops = [];
    const side = R() < 0.5 ? -1 : 1;
    stops.push({ p: [this.einX - 2.5 + side * 5 + R(), -2.6] }); // auf dem Gehweg
    stops.push({ p: [this.einX + (R() - 0.5) * 0.6, -0.9] });
    stops.push({ p: [this.einX + (R() - 0.5) * 0.4, 0.7] });
    if (this.korb && R() < 0.75) stops.push({ ...this.korb, wait: 1.2 });
    if (this.dash && R() < 0.85) stops.push({ p: [this.dash.p[0] + (R() - 0.5) * 1.4, this.dash.p[1]], ziel: this.dash.ziel, wait: 3 + R() * 3, pose: 'lesen' });
    if (this.kueche && R() < 0.35) stops.push({ p: [this.kueche.p[0] + (R() - 0.5) * 1.6, this.kueche.p[1] + (R() - 0.5) * 0.3], ziel: this.kueche.ziel, wait: 5 + R() * 6 });
    // Zutaten des Rezepts (nicht jede Ergänzung), Reihenfolge: jeweils der nächste Platz
    const codes = [...new Set([...rez.zutaten.map((z) => z[1]), ...(rez.ergaenzung || []).filter(() => R() < 0.5).map((z) => z[1])])];
    let cur = stops[stops.length - 1].p;
    const rest = codes.map((c) => this.loc[c]).filter(Boolean).map((l) => {
      const m = L.moebel.find((x) => x.id === l.moebel);
      const spread = m?.typ === 'gondel' ? 1.9 : m?.seiten ? 0.35 : 0.25;
      const alongX = Math.abs(l.p[1] - l.ziel[1]) > Math.abs(l.p[0] - l.ziel[0]);
      const o = (R() - 0.5) * 2 * spread;
      const p = alongX ? [l.p[0] + o, l.p[1]] : [l.p[0], l.p[1] + o];
      const ziel = alongX ? [l.ziel[0] + o, l.ziel[1]] : [l.ziel[0], l.ziel[1] + o];
      return { p, ziel, wait: 2 + R() * 3, pose: 'stoebern' };
    });
    while (rest.length) {
      let bi = 0;
      rest.forEach((s, i) => {
        if (Math.hypot(s.p[0] - cur[0], s.p[1] - cur[1]) < Math.hypot(rest[bi].p[0] - cur[0], rest[bi].p[1] - cur[1])) bi = i;
      });
      const s = rest.splice(bi, 1)[0];
      stops.push(s);
      cur = s.p;
    }
    const k = this.kassen[Math.floor(R() * this.kassen.length)];
    if (k) stops.push({ ...k, wait: 4 + R() * 3 });
    stops.push({ p: [this.ausX, 0.6] });
    stops.push({ p: [this.ausX, -1.0] });
    stops.push({ p: [this.ausX + (R() < 0.5 ? -1 : 1) * (5 + R() * 2), -2.7], end: true });
    agent.rez = rez;
    agent.stops = stops;
  }

  spawn(midway = false) {
    const R = this.rand;
    const look = randomLook(R, { basket: true, bag: R() < 0.25 });
    const w = new Walker(look, { ring: false });
    const agent = { w, stop: 0, route: [], wait: 0, speed: 0.95 + R() * 0.3, heading: 0, stuck: 0 };
    this.plan(agent);
    // beim Start schon mitten im Einkauf
    if (midway) agent.stop = 3 + Math.floor(R() * Math.max(1, agent.stops.length - 6));
    const p0 = agent.stops[agent.stop].p;
    agent.pos = new THREE.Vector2(p0[0], p0[1]);
    if (midway) {
      const [i, j] = this.nearestFree(...this.cellOf(p0[0], p0[1]));
      agent.pos.set(this.x0 + (i + 0.5) * CELL, this.z0 + (j + 0.5) * CELL);
    }
    this.nextLeg(agent);
    this.scene.add(w.group);
    this.agents.push(agent);
  }

  nextLeg(a) {
    a.stop++;
    if (a.stop >= a.stops.length) {
      a.done = true;
      return;
    }
    a.route = this.path([a.pos.x, a.pos.y], a.stops[a.stop].p);
    a.ri = 0;
  }

  start() {
    this.active = true;
    this.spawnIn = 0;
    for (let i = 0; i < 6; i++) this.spawn(true);
  }

  stop() {
    this.active = false;
    for (const a of this.agents) this.scene.remove(a.w.group);
    this.agents = [];
  }

  update(dt) {
    if (!this.active) return;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.agents.length < MAX) {
      this.spawn(false);
      this.spawnIn = 4 + this.rand() * 5;
    }
    for (const a of this.agents) this.step(a, dt);
    const gone = this.agents.filter((a) => a.done);
    for (const a of gone) this.scene.remove(a.w.group);
    if (gone.length) this.agents = this.agents.filter((a) => !a.done);
  }

  step(a, dt) {
    const turn = (target, rate) => {
      let d = target - a.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      a.heading += d * Math.min(1, dt * rate);
    };
    let moving = 0;
    const st = a.stops[a.stop];
    if (a.wait > 0) {
      a.wait -= dt;
      if (st?.ziel) turn(Math.atan2(st.ziel[0] - a.pos.x, -(st.ziel[1] - a.pos.y)), 5);
      a.w.animate(dt, 0);
      if (st?.pose && a.wait > 0.4) applyPose(a.w.J, st.pose);
      if (a.wait <= 0) {
        applyPose(a.w.J, 'stehen');
        this.nextLeg(a);
      }
    } else if (a.ri < a.route.length) {
      const [tx, tz] = a.route[a.ri];
      const dx = tx - a.pos.x;
      const dz = tz - a.pos.y;
      const dist = Math.hypot(dx, dz);
      // Rücksicht: langsamer, wenn jemand direkt voraus steht (nach 1,5 s geht es trotzdem weiter)
      let f = 1;
      if (dist > 1e-3) {
        for (const o of this.agents) {
          if (o === a) continue;
          const ox = o.pos.x - a.pos.x;
          const oz = o.pos.y - a.pos.y;
          const od = Math.hypot(ox, oz);
          if (od < 0.75 && (ox * dx + oz * dz) / (od * dist + 1e-6) > 0.5) f = Math.min(f, Math.max(0, (od - 0.4) / 0.35));
        }
      }
      if (f < 0.3) a.stuck += dt;
      else a.stuck = 0;
      if (a.stuck > 1.5) f = 0.6;
      const step = a.speed * f * dt;
      turn(Math.atan2(dx, -dz), 7);
      moving = f;
      if (dist <= step) {
        a.pos.set(tx, tz);
        a.ri++;
      } else {
        a.pos.x += (dx / dist) * step;
        a.pos.y += (dz / dist) * step;
      }
      a.w.animate(dt, moving);
    } else {
      // Ziel erreicht
      if (st?.end) {
        a.done = true;
        return;
      }
      a.wait = st?.wait || 0.01;
      a.w.animate(dt, 0);
    }
    a.w.group.position.set(a.pos.x, 0, -a.pos.y);
    a.w.group.rotation.y = a.heading;
  }
}

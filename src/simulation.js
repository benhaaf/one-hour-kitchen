// Kundensimulation: Eine Figur läuft einen Weg aus layout.json ab, bleibt an Stationen stehen,
// eine Bildunterschrift erklärt das Verhalten. Die Kamera folgt (Ego-Ansicht), in der Draufsicht sieht man sie von oben.
import * as THREE from 'three';
import { Walker, randomLook } from './scene/people.js';
import { rng } from './scene/builder.js';
import { footprints } from './scene/furniture.js';

const CAM_DIST = 2.4;
const CAM_HEIGHT = 2.25;

export class Simulation {
  constructor(layout, scene, camera) {
    this.cfg = layout.simulation;
    this.bounds = layout.raum.verkaufsraum || [0, layout.raum.breite, 0, layout.raum.tiefe];
    this.scene = scene;
    this.camera = camera;
    this.active = false;
    this.auto = false; // false = an jedem Halt warten, bis „Weiter“ gedrückt wird; true = läuft von allein durch
    this.next = 0; // welche Kundengruppe als Nächstes
    this.onCaption = () => {};
    this.onEnd = () => {};
    // hohe Möbel, durch die die Verfolgerkamera nicht schauen soll
    this.blockers = layout.moebel.filter((m) => m.hoehe > 1.2 && !m.id.startsWith('L')).flatMap((m) => footprints(m));
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
  }

  get kunde() {
    return this.current;
  }

  start() {
    const k = this.cfg.kunden[this.next % this.cfg.kunden.length];
    this.next++;
    this.current = k;
    const look = randomLook(rng(this.next * 13), { top: k.farbe, bag: false, basket: true, jacket: null, scale: 1 });
    this.walker = new Walker(look);
    this.scene.add(this.walker.group);
    this.pts = k.punkte;
    this.i = 0;
    const [x, z] = this.pts[0].p;
    this.pos = new THREE.Vector2(x, z);
    this.heading = 0;
    this.wait = 0;
    this.stopShown = false;
    this.done = false;
    this.active = true;
    this.placeWalker();
    // Kamera startet hinter der Figur
    this.updateCamera(1, true);
    this.onCaption(`${k.name} ${k.beschreibung}`, 0, this.stopCount());
    return k;
  }

  stop() {
    if (this.walker) this.scene.remove(this.walker.group);
    this.walker = null;
    this.active = false;
  }

  setAuto(on) {
    this.auto = on;
    // aktuellen Halt im Auto-Modus nach kurzer Zeit verlassen
    if (on && this.wait === Infinity) this.wait = 1.5;
  }

  stopCount() {
    return this.pts.filter((p) => p.text).length;
  }

  stopIndex() {
    return this.pts.slice(0, this.i + 1).filter((p) => p.text).length;
  }

  // Sprung zum nächsten / vorigen Halt (für die Präsentation)
  skip(dir) {
    // Steht die Figur an einem Halt, geht es mit „Weiter“ zu Fuß zum nächsten Halt
    if (dir > 0 && this.wait > 0) {
      this.wait = 0;
      this.onCaption('Unterwegs zum nächsten Halt …', this.stopIndex(), this.stopCount());
      return;
    }
    const stops = this.pts.map((p, i) => (p.text ? i : -1)).filter((i) => i >= 0);
    const target = dir > 0 ? stops.find((i) => i > this.i) : [...stops].reverse().find((i) => i < this.i - (this.wait > 0 ? 0 : 1));
    if (target === undefined) return;
    this.i = target;
    this.pos.set(...this.pts[target].p);
    this.wait = 0;
    this.arrive();
  }

  arrive() {
    const pt = this.pts[this.i];
    if (pt.text) {
      this.wait = this.auto ? pt.dauer || 2 : Infinity;
      this.onCaption(pt.text, this.stopIndex(), this.stopCount());
    }
    if (this.i >= this.pts.length - 1) this.done = true;
  }

  placeWalker() {
    this.walker.group.position.set(this.pos.x, 0, -this.pos.y);
    this.walker.group.rotation.y = this.heading;
  }

  // Store-Richtung (dx, dz) → Drehung der Figur (lokal +z = vorn)
  static yawOf(dx, dz) {
    return Math.atan2(dx, -dz);
  }

  turnTowards(target, dt, rate = 5) {
    let d = target - this.heading;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.heading += d * Math.min(1, dt * rate);
  }

  update(dt, followCamera) {
    if (!this.active) return;
    const speed = this.cfg.tempo || 1.1;
    let moving = 0;
    if (this.wait > 0) {
      this.wait -= dt;
      const pt = this.pts[this.i];
      if (pt.blick) this.turnTowards(Simulation.yawOf(pt.blick[0] - this.pos.x, pt.blick[1] - this.pos.y), dt);
      if (this.auto && this.wait <= 0 && this.done) {
        this.onEnd();
        return;
      }
    } else if (this.done) {
      if (this.auto || this.wait === 0) this.onEnd();
      return;
    } else {
      const [tx, tz] = this.pts[this.i + 1].p;
      const dx = tx - this.pos.x;
      const dz = tz - this.pos.y;
      const dist = Math.hypot(dx, dz);
      const step = speed * dt;
      this.turnTowards(Simulation.yawOf(dx, dz), dt, 8);
      moving = 1;
      if (dist <= step) {
        this.pos.set(tx, tz);
        this.i++;
        this.arrive();
      } else {
        this.pos.x += (dx / dist) * step;
        this.pos.y += (dz / dist) * step;
      }
    }
    this.walker.animate(dt, moving);
    this.placeWalker();
    if (followCamera) this.updateCamera(dt);
  }

  // Kamera schräg hinter der Figur, weich nachgeführt
  updateCamera(dt, snap = false) {
    const head = new THREE.Vector3(this.pos.x, 1.35, -this.pos.y);
    const [bx1, bx2, bz1, bz2] = this.bounds;
    const inside = this.pos.y > 0.2;
    // freie Strecke hinter der Figur in einer Richtung (hohe Regale, Schaufenster)
    const freeDist = (dir) => {
      for (let t = 0.35; t <= CAM_DIST; t += 0.1) {
        const px = head.x + dir.x * t;
        const pz = -(head.z + dir.z * t);
        const hit = this.blockers.some(([a, b, c, d]) => px > a - 0.15 && px < b + 0.15 && pz > c - 0.15 && pz < d + 0.15);
        if (hit) return Math.max(0, t - 0.25);
      }
      return CAM_DIST;
    };
    // Normal schräg hinter der Figur; ist dort zu wenig Platz (z. B. Schaufenster im Rücken),
    // schwenkt die Kamera zur Seite, statt in Wand oder Möbel zu rutschen
    let best = null;
    for (const deg of [0, 30, -30, 60, -60, 90, -90, 125, -125]) {
      const a = this.heading + (deg * Math.PI) / 180;
      const dir = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
      const d = freeDist(dir);
      if (!best || d > best.d + 0.05) best = { dir, d };
      if (d >= 1.6) {
        best = { dir, d };
        break;
      }
    }
    const want = head.clone().addScaledVector(best.dir, Math.max(0.7, Math.min(CAM_DIST, best.d)));
    want.y = CAM_HEIGHT;
    // Im Laden nicht durch Wände/Decke: Kamera innerhalb des Raums halten (Passage davor ist offen)
    if (-want.z > 0.2 || inside) {
      want.x = THREE.MathUtils.clamp(want.x, bx1 + 0.3, bx2 - 0.3);
      want.z = -THREE.MathUtils.clamp(-want.z, bz1 + 0.3, bz2 - 0.3);
    }
    const k = snap ? 1 : 1 - Math.exp(-dt * 3);
    this.camPos.lerp(want, k);
    this.camLook.lerp(head, snap ? 1 : 1 - Math.exp(-dt * 5));
    if (snap) {
      this.camPos.copy(want);
      this.camLook.copy(head);
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }
}

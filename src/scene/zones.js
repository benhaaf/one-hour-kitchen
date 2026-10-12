// Zonen als halbtransparente Bodenflächen + Beschriftungen (Zonennamen, Möbel-IDs).
import * as THREE from 'three';
import { toThree } from '../coords.js';
import { textSprite } from './labels.js';
import { footprints } from './furniture.js';

export function buildZones(layout) {
  const group = new THREE.Group();
  group.name = 'Zonen';

  // 1-m-Raster als Planungshilfe (gehört zur Zonen-Ansicht)
  const { breite: W, tiefe: D } = layout.raum;
  const n = Math.max(W, D);
  const grid = new THREE.GridHelper(n, n, 0x2a2a2a, 0x2a2a2a);
  grid.material.transparent = true;
  grid.material.opacity = 0.25;
  grid.material.depthWrite = false;
  grid.scale.set(W / n, 1, D / n);
  toThree(W / 2, 0.01, D / 2, grid.position);
  group.add(grid);

  // 3D-Beschriftungen (in der Draufsicht übernimmt das 2D-Overlay)
  const labels = new THREE.Group();
  labels.name = 'Beschriftungen';
  group.add(labels);
  group.userData.labels = labels;

  layout.zonen.forEach((z, i) => {
    const [x1, x2, z1, z2] = z.rechteck;
    const w = x2 - x1;
    const d = z2 - z1;
    const color = new THREE.Color(z.farbe);
    const y = 0.012 + i * 0.0015; // leicht versetzt, falls sich Zonen überlappen
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, depthWrite: false }),
    );
    plane.rotation.x = -Math.PI / 2;
    toThree(x1 + w / 2, y, z1 + d / 2, plane.position);
    plane.renderOrder = 1;
    group.add(plane);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(w - 0.04, d - 0.04)),
      new THREE.LineBasicMaterial({ color }),
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.copy(plane.position).setY(y + 0.001);
    group.add(edge);

    const label = textSprite([`${z.id} · ${z.name}`, z.typ], { height: 0.34, accent: z.farbe });
    toThree(x1 + w / 2, 2.95, z1 + d / 2, label.position);
    labels.add(label);
  });

  // Möbel-IDs
  for (const m of layout.moebel) {
    const [x1, x2, z1, z2] = footprints(m)[0];
    const label = textSprite(m.id, { height: 0.17, bg: 'rgba(214,69,39,0.92)', fg: '#ffffff' });
    const cx = m.stationen ? m.stationen[Math.floor(m.stationen.length / 2)][0] : (x1 + x2) / 2;
    if (m.id.startsWith('L')) continue; // Lagermöbel ohne schwebende ID
    toThree(cx, m.hoehe + 0.2, (z1 + z2) / 2, label.position);
    labels.add(label);
  }
  return group;
}

// Kundenseitige Regalfronten je Möbeltyp (vorne = Richtung Straße, hinten = Richtung Rückwand)
export function shelfFaces(m) {
  switch (m.typ) {
    case 'kochwelt-gondel':
      return Object.keys(m.regal || { hinten: 1, vorne: 1 }).filter((k) => k !== 'kopf');
    case 'kuehlregal':
    case 'glastuer-kuehlung':
    case 'weinregal':
      return ['vorne'];
    case 'basis-regal':
      return Object.keys(m.seiten || {});
    case 'impulsregal':
      return ['rechts'];
    default:
      return [];
  }
}

// Inhalt je Regalzone für eine Regalfront (layout.regalzonen.belegung["M7:vorne"]), sonst allgemeine Beschreibung
export function zoneContent(layout, id, seite) {
  const RZ = layout.regalzonen;
  const b = RZ.belegung?.[`${id}:${seite}`];
  return RZ.zonen.map((z, i) => b?.[i] || z.inhalt);
}

// Höhenmarken der Regalzonen an ALLEN Regalfronten (Ahlert/Kenning/Brock 2020, S. 302–303)
export function buildShelfZones(layout) {
  const group = new THREE.Group();
  group.name = 'Regalzonen';
  const fmt = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 1 });
  const zonen = layout.regalzonen.zonen;
  const top = Math.max(...zonen.map((z) => z.bis));
  const mats = new Map();
  const mat = (c) => {
    if (!mats.has(c)) mats.set(c, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }));
    return mats.get(c);
  };
  for (const m of layout.moebel) {
    const faces = shelfFaces(m);
    if (!faces.length || !m.rechteck) continue;
    const [x1, x2, z1, z2] = m.rechteck;
    // Bänder nur bis knapp über das Regal (Reckzone = Schilder über der Ware)
    const maxY = Math.min(top, m.hoehe + 0.3);
    for (const seite of faces) {
      const alongX = seite === 'vorne' || seite === 'hinten';
      const len = (alongX ? x2 - x1 : z2 - z1) - 0.06;
      const off = m.typ === 'glastuer-kuehlung' ? 0.0 : 0.035;
      const face = {
        vorne: { c: [(x1 + x2) / 2, z1 - off], dir: [0, -1] },
        hinten: { c: [(x1 + x2) / 2, z2 + off], dir: [0, 1] },
        links: { c: [x1 - off, (z1 + z2) / 2], dir: [-1, 0] },
        rechts: { c: [x2 + off, (z1 + z2) / 2], dir: [1, 0] },
      }[seite];
      const yaw = Math.atan2(face.dir[0], -face.dir[1]);
      const inhalt = zoneContent(layout, m.id, seite);
      // Beschriftung an einem Ende der Front; gegenüberliegende Fronten an verschiedenen Enden, damit sich nichts überdeckt
      const endA = alongX ? (seite === 'vorne' ? x1 + 0.5 : x2 - 0.5) : seite === 'links' ? z1 + 0.5 : z2 - 0.5;
      // lange Fronten (Kühlregal, Basis) an beiden Enden beschriften
      const ends = len > 4 ? [endA, alongX ? x1 + x2 - endA : z1 + z2 - endA] : [endA];
      zonen.forEach((rz, i) => {
        const von = rz.von;
        const bis = Math.min(rz.bis, maxY);
        if (bis - von < 0.05) return;
        const h = bis - von;
        const band = new THREE.Mesh(new THREE.PlaneGeometry(len, h), mat(rz.farbe));
        band.rotation.y = yaw;
        toThree(face.c[0], von + h / 2, face.c[1], band.position);
        band.renderOrder = 3;
        group.add(band);
        if (rz.bis < top && rz.bis <= maxY) {
          const line = new THREE.Mesh(new THREE.BoxGeometry(len, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: rz.farbe }));
          line.rotation.y = yaw;
          toThree(face.c[0] + face.dir[0] * 0.005, rz.bis, face.c[1] + face.dir[1] * 0.005, line.position);
          group.add(line);
        }
        const range = rz.von === 0 ? `unter ${fmt(rz.bis)} m` : rz.bis >= top ? `über ${fmt(rz.von)} m` : `${fmt(rz.von)}–${fmt(rz.bis)} m`;
        const text = inhalt[i] && inhalt[i] !== '–' ? [`${rz.name} · ${range}`, inhalt[i]] : [`${rz.name} · ${range}`];
        for (const e of ends) {
          const label = textSprite(text, { height: 0.13, accent: rz.farbe });
          const px = alongX ? e : face.c[0] + face.dir[0] * 0.28;
          const pz = alongX ? face.c[1] + face.dir[1] * 0.28 : e;
          toThree(px, von + h / 2, pz, label.position);
          group.add(label);
        }
      });
    }
  }
  return group;
}

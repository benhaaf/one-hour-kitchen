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

// Höhenmarken der Regalzonen an allen Regalen aus layout.regalzonen.moebel (Seite: vorne/hinten/links/rechts)
export function buildShelfZones(layout) {
  const group = new THREE.Group();
  group.name = 'Regalzonen';
  const fmt = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 1 });
  const top = Math.max(...layout.regalzonen.zonen.map((z) => z.bis));
  for (const ref of layout.regalzonen.moebel || []) {
    const m = layout.moebel.find((x) => x.id === ref.id);
    if (!m) continue;
    const [x1, x2, z1, z2] = m.rechteck;
    const alongX = ref.seite === 'vorne' || ref.seite === 'hinten';
    const len = alongX ? x2 - x1 : z2 - z1;
    const off = 0.035;
    // Mittelpunkt der Front und Richtung zum Kunden
    const face = {
      vorne: { c: [(x1 + x2) / 2, z1 - off], dir: [0, -1], yaw: Math.PI },
      hinten: { c: [(x1 + x2) / 2, z2 + off], dir: [0, 1], yaw: 0 },
      links: { c: [x1 - off, (z1 + z2) / 2], dir: [-1, 0], yaw: -Math.PI / 2 },
      rechts: { c: [x2 + off, (z1 + z2) / 2], dir: [1, 0], yaw: Math.PI / 2 },
    }[ref.seite];
    // Three-Plane zeigt nach +z (= Store -z); yaw so drehen, dass sie zum Kunden zeigt
    const yaw = Math.atan2(face.dir[0], -face.dir[1]);
    for (const rz of layout.regalzonen.zonen) {
      const h = rz.bis - rz.von;
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(len, h),
        new THREE.MeshBasicMaterial({ color: rz.farbe, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }),
      );
      band.rotation.y = yaw;
      toThree(face.c[0], rz.von + h / 2, face.c[1], band.position);
      band.renderOrder = 3;
      group.add(band);
      if (rz.bis < top) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(len, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: rz.farbe }));
        line.rotation.y = yaw;
        toThree(face.c[0] + face.dir[0] * 0.005, rz.bis, face.c[1] + face.dir[1] * 0.005, line.position);
        group.add(line);
      }
      const range = rz.von === 0 ? `unter ${fmt(rz.bis)} m` : rz.bis >= top ? `über ${fmt(rz.von)} m` : `${fmt(rz.von)}–${fmt(rz.bis)} m`;
      // Beschriftung an beiden Enden, leicht vor der Front
      for (const endA of alongX ? [x2 - 0.45] : [z2 - 0.45]) {
        const label = textSprite([`${rz.name} · ${range}`, rz.inhalt], { height: 0.15, accent: rz.farbe });
        const px = alongX ? endA : face.c[0] + face.dir[0] * 0.3;
        const pz = alongX ? face.c[1] + face.dir[1] * 0.3 : endA;
        toThree(px, rz.von + h / 2, pz, label.position);
        group.add(label);
      }
    }
  }
  return group;
}

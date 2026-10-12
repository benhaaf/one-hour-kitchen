// Testbühne: Reihe von Figuren (Stehen, Stöbern, Arbeiten, Gehen) von vorn/hinten
import * as THREE from 'three';
import { buildPerson, randomLook, Walker, applyPose } from '../../src/scene/people.js';
import { rng } from '../../src/scene/builder.js';
const q = new URLSearchParams(location.search);
const view = q.get('v') || 'front';
const r = new THREE.WebGLRenderer({ antialias: true });
r.setSize(innerWidth, innerHeight);
r.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(r.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 2.2));
const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(2, 4, 3); scene.add(d);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), new THREE.MeshStandardMaterial({ color: 0xb0a898 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const rand = rng(Number(q.get('seed') || 7));
const poses = ['stehen', 'stoebern', 'arbeiten', 'gehen', 'gehen2', 'stehen', 'stehen', 'stoebern'];
poses.forEach((pose, i) => {
  const look = randomLook(rand, { basket: pose !== 'arbeiten' && i % 2 === 1, bag: false });
  let g;
  if (pose.startsWith('gehen')) {
    const w = new Walker(look); w.animate(pose === 'gehen' ? 0.13 : 0.3, 1); w.animate(0.01, 1);
    for (let k = 0; k < 30; k++) w.animate(0.016, 1);
    if (pose === 'gehen2') for (let k = 0; k < 12; k++) w.animate(0.016, 1);
    g = w.group;
  } else {
    const { root, J } = buildPerson(look);
    applyPose(J, pose);
    g = root;
    g.userData.J = J; g.userData.pose = pose;
  }
  g.position.x = (i - 3.5) * 0.75;
  g.rotation.y = view === 'back' ? Math.PI : view === 'side' ? Math.PI / 2 : 0;
  scene.add(g);
});
const cam = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 50);
cam.position.set(0, 1.0, 7.5); cam.lookAt(0, 0.85, 0);
r.render(scene, cam);
window.done = true;

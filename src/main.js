import * as THREE from 'three';

import config from './config.js';
import layout from './layout.json';
import { buildRoom } from './scene/room.js';
import { buildFurniture } from './scene/furniture.js';
import { buildZones, buildShelfZones } from './scene/zones.js';
import { buildLighting } from './scene/lighting.js';
import { buildFloors, buildWallDetails } from './scene/surfaces.js';
import { buildPaths } from './scene/paths.js';
import { buildStreet } from './scene/street.js';
import { TopView } from './topview.js';
import { ExportDialog } from './exportDialog.js';
import { Panels } from './panels.js';
import { Presentation } from './presentation.js';
import { LofiAudio } from './audio.js';
import { Interactions } from './interact.js';
import { Simulation } from './simulation.js';
import { Crowd } from './crowd.js';
import { Shopping } from './shopping.js';
import { Collider } from './collision.js';
import { Player } from './player.js';
import { ActionBus, ACTIONS } from './input/actions.js';
import { GamepadInput } from './input/gamepad.js';
import { KeyboardMouseInput } from './input/keyboard.js';
import { TouchInput } from './input/touch.js';
import { HUD } from './ui.js';
import { setupPWA } from './pwa.js';
import { Deck } from './deck.js';
import { runReferent } from './referent.js';
import { Recorder } from './recorder.js';

// QR-Code-Ziel: Rezeptkarte fürs Handy, kein 3D
{
  const nr = new URLSearchParams(location.search).get('rezept');
  if (nr) {
    const { runMobileRecipe } = await import('./mobile.js');
    runMobileRecipe(layout, nr);
    await new Promise(() => {});
  }
}

// Zweites Fenster „Referentenansicht“: nur Notizen/Folien, kein 3D
if (new URLSearchParams(location.search).has('referent')) {
  runReferent(layout);
  await new Promise(() => {});
}

const app = document.getElementById('app');

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: config.grafik.antialias, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.grafik.maxPixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const SKY = new THREE.Color(0xa9c3d6);
const PLAN_BG = new THREE.Color(0x1c1c1f);
scene.background = SKY;

const camera = new THREE.PerspectiveCamera(config.grafik.fov, window.innerWidth / window.innerHeight, 0.05, 120);

// Umgebungslicht (IBL) aus einem schlichten Ladenraum: weiche Reflexe auf Glas, Metall und Flaschen
{
  const env = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 12), new THREE.MeshBasicMaterial({ color: 0x8c857b, side: THREE.BackSide }));
  box.position.y = 1.6;
  env.add(box);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshBasicMaterial({ color: 0x6f6a63 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  env.add(floor);
  for (let x = -6; x <= 6; x += 3)
    for (let z = -4; z <= 4; z += 4) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ color: 0xfff3e0 }));
      panel.rotation.x = Math.PI / 2;
      panel.position.set(x, 3.15, z);
      env.add(panel);
    }
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();
}

// Raum
const room = buildRoom(layout);
scene.add(room.group);
room.outside.add(buildStreet(layout));
scene.add(buildFloors(layout));
scene.add(buildWallDetails(layout));
buildLighting(layout, scene);
const furniture = buildFurniture(layout);
scene.add(furniture.group);
const zones = buildZones(layout);
zones.visible = false; // im Laden zunächst ohne Zonen-Overlay (Taste Z / „Zonen“)
scene.add(zones);
const shelfZones = buildShelfZones(layout);
shelfZones.visible = false;
scene.add(shelfZones);
const paths = buildPaths(layout);
paths.group.visible = false; // Konzept-Wege sind keine echten Bodenmarkierungen: per H / „Weg“ einblenden
scene.add(paths.group);
const fixtures = scene.getObjectByName('Leuchten');
const duct = scene.getObjectByName('Lueftung');
const collider = new Collider([...room.colliders, ...furniture.colliders]);
const interactions = new Interactions(camera, { drawers: furniture.drawers, doors: room.doors, collider });
// Startpunkt, optional per URL überschreibbar: ?pos=x,z,blickGrad[,neigungGrad]
const start = { ...layout.start };
const posParam = new URLSearchParams(location.search).get('pos');
if (posParam) {
  const [x, z, deg = 0, tilt = 0] = posParam.split(',').map(Number);
  Object.assign(start, { position: [x, z], blickrichtung_grad: deg });
  start.neigung_grad = tilt;
}
const player = new Player(camera, collider, start);
if (start.neigung_grad) player.pitch = (start.neigung_grad * Math.PI) / 180;

// Eingabe
const hud = new HUD(app);
const bus = new ActionBus();
const gamepad = new GamepadInput(bus);
gamepad.onStatus = (c) => hud.setPad(c);
const keyboard = new KeyboardMouseInput(bus, renderer.domElement);
const touch = new TouchInput(bus, app);

// Draufsicht
const topView = new TopView(layout, app);
topView.showZones = false;
topView.showPaths = false;
const exportDialog = new ExportDialog(app, (t) => hud.toast(t, 3000));
let view = 'ego';

// Sichtbarkeiten, die sich zwischen Ego-Perspektive und Draufsicht unterscheiden
function applyTopVisibility(top) {
  room.ceiling.visible = !top;
  room.outside.visible = !top;
  if (fixtures) fixtures.visible = !top;
  if (duct) duct.visible = !top;
  zones.userData.labels.visible = !top;
  shelfZones.visible = !top && shelfZonesOn;
  if (zoneLegend) syncZoneLegend();
  scene.background = top ? PLAN_BG : SKY;
}
let shelfZonesOn = false;
// Legende der Regalzonen (erscheint, sobald die Regalzonen eingeblendet sind)
app.insertAdjacentHTML(
  'beforeend',
  `<aside id="zone-legend" hidden><h4>Regalzonen</h4>${layout.regalzonen.zonen
    .map((z) => `<div><i style="background:${z.farbe}"></i><b>${z.name}</b><span>${z.von === 0 ? `unter ${String(z.bis).replace('.', ',')}` : z.bis >= 2.2 ? `über ${String(z.von).replace('.', ',')}` : `${String(z.von).replace('.', ',')}–${String(z.bis).replace('.', ',')}`} m</span><small>${z.inhalt}</small></div>`)
    .join('')}<p>Ahlert/Kenning/Brock 2020, S. 302–303 ✓ · an allen Regalen</p></aside>`,
);
var zoneLegend = app.querySelector('#zone-legend'); // var: wird schon in applyTopVisibility abgefragt
function syncZoneLegend() {
  zoneLegend.hidden = !(shelfZonesOn && view === 'ego');
}

function updateReserve() {
  // Platz für die Touch-Buttons am rechten Rand und unten freihalten
  const r = touch.ui.hidden ? { right: 0, bottom: 0, left: 0 } : { right: 96, bottom: 96, left: 0 };
  // Präsentation: Platz für die Fortschrittsleiste unten und die schmale Folie links
  if (document.body.classList.contains('presenting')) {
    r.bottom += 56;
    const side = document.querySelector('#slide.sl-side:not([hidden])');
    if (side) r.left = side.getBoundingClientRect().right + 40;
  }
  topView.reserve = r;
}

function setView(v) {
  view = v;
  const top = v === 'top';
  applyTopVisibility(top);
  topView.canvas.hidden = !top;
  document.body.classList.toggle('top-mode', top);
  touch.setActive('ansicht', top);
  if (top) {
    updateReserve();
    topView.resize(window.innerWidth, window.innerHeight);
  }
}

bus.on('ansicht', () => {
  if (exportDialog.visible) return exportDialog.hide();
  if (presentation.active) stopPresentation();
  setView(view === 'ego' ? 'top' : 'ego');
  hud.toast(view === 'top' ? 'Draufsicht' : 'Ego-Perspektive', 1200);
});

// Ein-/Ausblenden
function redrawPlan() {
  if (view === 'top') topView.resize(window.innerWidth, window.innerHeight);
}
function toggle(action, text, get, set) {
  bus.on(action, () => {
    set(!get());
    touch.setActive(action, get());
    hud.toast(`${text} ${get() ? 'eingeblendet' : 'ausgeblendet'}`, 1400);
    redrawPlan();
  });
  touch.setActive(action, get());
}
toggle('zonen', 'Zonen & Beschriftungen', () => zones.visible, (v) => {
  zones.visible = v;
  topView.showZones = v;
});
toggle('regalzonen', 'Regalzonen', () => shelfZonesOn, (v) => {
  shelfZonesOn = v;
  shelfZones.visible = v && view === 'ego';
  syncZoneLegend();
  if (v && view === 'top') hud.toast('Regalzonen sind in der Ego-Perspektive an allen Regalen zu sehen', 2500);
  // Offene Infokarte um die Regalzonen-Tabelle ergänzen bzw. kürzen
  if (panels.cardVisible && panels.cardStation) panels.showCard(panels.cardStation, stationCount, { regalzonen: v });
});
toggle('hauptweg', 'Hauptweg', () => paths.group.visible, (v) => {
  paths.group.visible = v;
  topView.showPaths = v;
});

// PNG-Export der Draufsicht (funktioniert aus beiden Ansichten)
bus.on('png', () => {
  if (exportDialog.visible) return exportDialog.hide();
  applyTopVisibility(true);
  let url;
  try {
    url = topView.exportPNG(renderer, scene);
  } finally {
    applyTopVisibility(view === 'top');
    if (view === 'top') topView.resize(window.innerWidth, window.innerHeight);
  }
  exportDialog.show(url);
});

// Bildschirmaufnahme (Knopf oben rechts oder Taste J)
const recBtn = document.createElement('button');
recBtn.id = 'btn-rec';
recBtn.className = 'tbtn';
recBtn.title = 'Bildschirmaufnahme starten/stoppen (Taste J)';
recBtn.innerHTML = '<span>⏺</span><small>Aufnahme</small>';
document.body.appendChild(recBtn);
const recorder = new Recorder({
  canvas: renderer.domElement,
  toast: (t, ms) => hud.toast(t, ms),
  onState: (on) => {
    recBtn.setAttribute('aria-pressed', String(on));
    recBtn.querySelector('small').textContent = on ? 'Stopp' : 'Aufnahme';
  },
});
recBtn.addEventListener('click', () => recorder.toggle());
bus.on('aufnahme', () => recorder.toggle());

// ---------- Etappe 5: Infokarten, Präsentationsmodus, Rahmen ----------
const panels = new Panels(app, layout);
const presentation = new Presentation(layout, camera);
const deck = new Deck(app, presentation, { toast: (t, ms) => hud.toast(t, ms) });
deck.onEnd = () => stopPresentation();
deck.onStart = (i) => startPresentation(i);
let cardOpenedAt = null; // Position, an der die Infokarte im freien Laufen geöffnet wurde

const stationCount = layout.stationen.length;
const SLIDE_LABEL = { einleitung: 'Einleitung', schluss: 'Fazit', quellen: 'Quellen' };
// Ebenen je Folie/Station (layout.json → ebenen): Zonen, Wege, Regalzonen
let savedLayers = null;
function setLayers(e = {}) {
  zones.visible = !!e.zonen;
  topView.showZones = !!e.zonen;
  paths.group.visible = !!e.wege || !!e.blickachse;
  topView.showPaths = paths.group.visible;
  shelfZonesOn = !!e.regalzonen;
  shelfZones.visible = shelfZonesOn && view === 'ego';
  syncZoneLegend();
  for (const [a, v] of [['zonen', zones.visible], ['hauptweg', paths.group.visible], ['regalzonen', shelfZonesOn]]) touch.setActive(a, v);
}
presentation.onStation = (slide, i) => {
  setLayers(slide.ebenen);
  if (slide.typ === 'station') {
    panels.hideSlide();
    panels.showCard(slide, stationCount, { regalzonen: shelfZonesOn });
    panels.setIndicator(`Station ${slide.nr}/${stationCount} · ${i + 1}/${presentation.total}`);
  } else {
    panels.hideCard();
    if (slide.panel === false) panels.hideSlide();
    else panels.showSlide(slide, stationCount);
    panels.setIndicator(`${slide.panel === false ? slide.titel : SLIDE_LABEL[slide.typ] || 'Folie'} · ${i + 1}/${presentation.total}`);
  }
  const wantTop = slide.ansicht === 'draufsicht';
  if (wantTop !== (view === 'top')) setView(wantTop ? 'top' : 'ego');
  else if (view === 'top') {
    updateReserve();
    topView.resize(window.innerWidth, window.innerHeight);
  }
  deck.update(i);
};

function startPresentation(i) {
  if (sim.active) stopSimulation();
  if (shop.active) shop.stop();
  if (!savedLayers) savedLayers = { zonen: zones.visible, wege: paths.group.visible, regalzonen: shelfZonesOn };
  if (view === 'top') setView('ego');
  if (exportDialog.visible) exportDialog.hide();
  document.body.classList.add('presenting');
  touch.setActive('praesentation', true);
  if (document.pointerLockElement) document.exitPointerLock?.();
  deck.show();
  presentation.start(i);
}

function stopPresentation() {
  presentation.stop();
  deck.hide();
  if (view === 'top') setView('ego');
  if (savedLayers) setLayers(savedLayers);
  savedLayers = null;
  room.ceiling.visible = true;
  if (fixtures) fixtures.visible = true;
  document.body.classList.remove('presenting');
  touch.setActive('praesentation', false);
  panels.hideCard();
  panels.hideSlide();
  panels.setIndicator(null);
  // Laufen dort fortsetzen, wo die Kamera steht (außerhalb des Ladens → Startpunkt)
  const x = camera.position.x;
  const z = -camera.position.z;
  const { breite: W, tiefe: D } = layout.raum;
  if (x > 0.3 && x < W - 0.3 && z > 0.3 && z < D - 0.3) {
    const p = collider.resolve(x, z, config.spielerRadius);
    player.x = p.x;
    player.z = p.z;
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    player.yaw = -e.y;
    player.pitch = e.x;
  } else {
    player.x = start.position[0];
    player.z = start.position[1];
    player.yaw = ((start.blickrichtung_grad || 0) * Math.PI) / 180;
    player.pitch = 0;
  }
  player.apply();
}

bus.on('praesentation', () => {
  if (presentation.active) {
    stopPresentation();
    hud.toast('Präsentationsmodus beendet', 1400);
  } else {
    startPresentation(0);
  }
});
// Präsentation wie in PowerPoint steuern: Notizen, Übersicht, Vollbild, Referentenfenster, Anfang/Ende
bus.on('notizen', () => presentation.active && deck.toggleNotes());
bus.on('uebersicht', () => {
  if (!presentation.active) startPresentation(0);
  deck.toggleOverview();
});
bus.on('vollbild', () => deck.toggleFullscreen());
bus.on('referent', () => {
  if (!presentation.active) startPresentation(0);
  deck.openReferent();
});
bus.on('leertaste', () => (sim.active ? sim.skip(1) : presentation.active && !deck.overviewOpen && presentation.next()));
bus.on('anfang', () => presentation.active && presentation.go(0));
bus.on('ende', () => presentation.active && presentation.go(presentation.total - 1));
bus.on('beenden', () => {
  if (deck.overviewOpen) return deck.toggleOverview(false);
  if (panels.rahmenVisible) return panels.toggleRahmen(false);
  if (presentation.active) {
    stopPresentation();
    hud.toast('Präsentationsmodus beendet', 1400);
  }
});
// Klick ins Bild = weiter (wie in PowerPoint)
renderer.domElement.addEventListener('click', () => {
  if (presentation.active && !deck.overviewOpen) presentation.next();
});

// ---------- Kundensimulation ----------
const sim = new Simulation(layout, scene, camera);
app.insertAdjacentHTML(
  'beforeend',
  '<div id="sim-caption" hidden><span class="sim-who"></span><p></p><div class="sim-ctl"><button data-s="auto" title="Automatisch abspielen an/aus (A)">▶ Automatisch</button><button data-s="next" title="Weiter zum nächsten Halt (→ / Leertaste)">Weiter ›</button><button data-s="end" title="Simulation beenden (K)">✕</button></div><small class="sim-hint"></small></div>',
);
const simCaption = app.querySelector('#sim-caption');
const simAutoBtn = simCaption.querySelector('[data-s="auto"]');
function syncSimMode() {
  simAutoBtn.classList.toggle('on', sim.auto);
  simAutoBtn.textContent = sim.auto ? '⏸ Automatisch' : '▶ Automatisch';
  simCaption.querySelector('.sim-hint').textContent = sim.auto ? 'Läuft automatisch durch alle Halte' : 'Wartet an jedem Halt – „Weiter“, wenn du fertig mit Reden bist';
}
simCaption.addEventListener('pointerdown', (e) => e.stopPropagation());
simCaption.addEventListener('click', (e) => {
  const c = e.target.closest('[data-s]')?.dataset.s;
  e.target.closest('button')?.blur();
  if (c === 'auto') {
    sim.setAuto(!sim.auto);
    syncSimMode();
  } else if (c === 'next') sim.skip(1);
  else if (c === 'end') stopSimulation();
});
window.addEventListener('keydown', (e) => {
  if (sim.active && (e.key === 'a' || e.key === 'A')) {
    sim.setAuto(!sim.auto);
    syncSimMode();
  }
});
let simSaved = null;
sim.onCaption = (text, n, total) => {
  simCaption.hidden = false;
  simCaption.querySelector('.sim-who').textContent = `${sim.kunde.name} · ${n ? `Halt ${n}/${total}` : 'startet'}`;
  simCaption.querySelector('p').textContent = text;
  simCaption.classList.remove('ic-in');
  void simCaption.offsetWidth;
  simCaption.classList.add('ic-in');
};
function startSimulation() {
  if (presentation.active) stopPresentation();
  if (exportDialog.visible) exportDialog.hide();
  simSaved = { x: player.x, z: player.z, yaw: player.yaw, pitch: player.pitch };
  const k = sim.start();
  // Während einer Aufnahme läuft der Rundgang automatisch durch (Lena: genau 60 s)
  if (recorder.active) sim.setAuto(true);
  syncSimMode();
  document.body.classList.add('simulating');
  touch.setActive('simulation', true);
  panels.setIndicator('Simulation');
  hud.toast(`Simulation: ${k.name} ${k.beschreibung}`, 2200);
}
function stopSimulation() {
  sim.stop();
  simCaption.hidden = true;
  document.body.classList.remove('simulating');
  touch.setActive('simulation', false);
  panels.setIndicator(null);
  if (simSaved) Object.assign(player, simSaved);
  player.apply();
}
sim.onEnd = () => {
  stopSimulation();
  hud.toast('Simulation beendet – erneut starten für die nächste Kundengruppe', 3000);
};
bus.on('simulation', () => (sim.active ? stopSimulation() : startSimulation()));

// ---------- Außenansicht: vor den Laden auf den Gehweg und wieder hinein ----------
let insidePos = null;
bus.on('aussen', () => {
  if (presentation.active) stopPresentation();
  if (sim.active) stopSimulation();
  if (view === 'top') setView('ego');
  if (player.z > 0) {
    insidePos = { x: player.x, z: player.z, yaw: player.yaw, pitch: player.pitch };
    Object.assign(player, { x: 5.6, z: -11.2, yaw: 0, pitch: 0.02 });
    hud.toast('Außenansicht von der anderen Straßenseite – über die Straße und durch die Tür geht es hinein (U: zurück)', 2800);
  } else {
    const st = layout.start;
    const ip = st.innen || st.position;
    Object.assign(player, insidePos || { x: ip[0], z: ip[1], yaw: ((st.blickrichtung_grad || 0) * Math.PI) / 180, pitch: 0 });
    insidePos = null;
  }
  player.apply();
  touch.setActive('aussen', player.z < 0);
});

// ---------- Kundenbetrieb: viele Kunden gleichzeitig (läuft auch während der Präsentation) ----------
const crowd = new Crowd(layout, scene, [...room.colliders, ...furniture.colliders]);
function toggleCrowd(on = !crowd.active) {
  if (on === crowd.active) return;
  if (on) crowd.start();
  else crowd.stop();
  touch.setActive('kunden', on);
  deck.kundenBtn?.classList.toggle('on', on);
  hud.toast(on ? 'Die Kunden im Laden kaufen jetzt ein (L: anhalten)' : 'Kunden angehalten', 2200);
}
bus.on('kunden', () => toggleCrowd());
deck.onKunden = () => toggleCrowd();
if (new URLSearchParams(location.search).has('kunden')) toggleCrowd(true);

// ---------- Einkaufs-Spiel ----------
const shop = new Shopping(layout, scene, app, hud);
shop.onChange = () => {
  document.body.classList.toggle('shopping', shop.active);
  touch.setActive('einkauf', shop.active);
};
bus.on('einkauf', () => {
  if (presentation.active) stopPresentation();
  if (sim.active) stopSimulation();
  if (view === 'top') setView('ego');
  if (shop.active) {
    shop.stop();
    hud.toast('Einkaufs-Spiel beendet', 1400);
  } else shop.openPicker();
});
window.addEventListener('keydown', (e) => {
  if (shop.state === 'wahl' && /^[1-9]$/.test(e.key)) {
    shop.sel = Number(e.key) - 1;
    shop.choose();
  } else if (shop.state === 'wahl' && e.key === 'Enter') shop.choose();
  else if (shop.active && e.key === 'Escape') shop.stop();
});
let shopTarget = null;

bus.on('weiter', () => {
  if (shop.state === 'wahl') return shop.move(1);
  if (sim.active) return sim.skip(1);
  if (deck.overviewOpen) return;
  return presentation.active ? presentation.next() : startPresentation(0);
});
bus.on('zurueck', () => {
  if (shop.state === 'wahl') return shop.move(-1);
  if (sim.active) return sim.skip(-1);
  if (deck.overviewOpen) return;
  return presentation.active ? presentation.prev() : startPresentation(presentation.total - 1);
});

// Schubladen / Tür im Fadenkreuz → X / E öffnet sie; sonst Infokarte
function useShop() {
  if (shop.state === 'wahl') return shop.choose(), true;
  if (shop.state === 'bon') return shop.stop(), true;
  if (shopTarget && !interactions.current) return shopTarget.act(), true;
  return false;
}
bus.on('benutzen', () => useShop() || interactions.interact());
hud.hint.addEventListener('click', () => bus.emit('benutzen', 'touch'));
hud.hint.addEventListener('pointerdown', (e) => e.stopPropagation());

bus.on('info', () => {
  if (exportDialog.visible) return exportDialog.hide();
  if (view === 'ego' && !presentation.active && (useShop() || interactions.interact())) return;
  if (presentation.active) {
    // Karte/Folie aus- und wieder einblenden (freier Blick auf den Laden)
    const cur = presentation.current;
    if (cur.typ === 'station') {
      if (panels.cardVisible) panels.hideCard();
      else panels.showCard(cur, stationCount);
    } else if (panels.slideVisible) panels.hideSlide();
    else panels.showSlide(cur, stationCount);
    return;
  }
  if (panels.cardVisible) {
    panels.hideCard();
    return;
  }
  if (view === 'top') {
    hud.toast('Infokarten: in der Ego-Perspektive auf ein Objekt schauen oder den Präsentationsmodus starten', 3000);
    return;
  }
  const s = presentation.stationInView(camera);
  if (s) {
    panels.showCard(s, stationCount);
    cardOpenedAt = [player.x, player.z];
  } else {
    hud.toast('Kein Objekt mit Infokarte im Blick – näher herangehen oder direkt anschauen', 2400);
  }
});

// Lo-Fi-Musik (synthetisch, räumlich an den Hörstationen)
const audio = new LofiAudio(layout);
bus.on('musik', async () => {
  const on = await audio.toggle();
  touch.setActive('musik', on);
  hud.toast(on ? 'Lo-Fi-Musik an – kommt aus den Hörstationen' : 'Musik aus', 1600);
  if (on) {
    // Per Controller gestartet? iOS braucht einmal eine Berührung, bevor Ton erlaubt ist.
    setTimeout(() => {
      if (!audio.blocked) return;
      hud.toast('Für die Musik einmal auf den Bildschirm tippen', 3000);
      const unlock = () => audio.ctx.resume();
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }, 400);
  }
});

bus.on('rahmen', () => {
  const on = panels.toggleRahmen();
  touch.setActive('rahmen', on);
});

setupPWA((t) => hud.toast(t, 4000));

// Diagnose in der Browser-Konsole: ?debug → window.rille
if (new URLSearchParams(location.search).has('debug')) window.rille = { deck, panels, shop, layout, renderer, scene, camera, player, topView, bus, presentation, audio, interactions, sim, crowd };

// Größe
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  panels.refit();
  if (view === 'top') {
    updateReserve();
    topView.resize(w, h);
  }
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));

// iOS: Zoom-Gesten und Kontextmenüs unterdrücken
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => {
  // Im Export-Dialog soll langes Drücken aufs Bild funktionieren
  if (!e.target.closest('#export-dialog')) e.preventDefault();
});

// Hauptschleife
const timer = new THREE.Timer();
let touchHidden = touch.ui.hidden;
renderer.setAnimationLoop(() => {
  timer.update();
  const dt = Math.min(timer.getDelta(), 0.1);

  const gp = gamepad.poll();
  const kb = keyboard.poll();
  const tc = touch.poll();

  // Controller aktiv → Touch-Oberfläche ausblenden (erscheint bei Berührung wieder)
  if (gp.active && !touch.ui.hidden) touch.show(false);
  if (touchHidden !== touch.ui.hidden) {
    touchHidden = touch.ui.hidden;
    if (view === 'top') {
      updateReserve();
      topView.resize(window.innerWidth, window.innerHeight);
    }
  }

  const move = [gp.move[0] + kb.move[0] + tc.move[0], gp.move[1] + kb.move[1] + tc.move[1]];
  const g = config.gamepad.blickGeschwindigkeit * dt;
  const look = [gp.look[0] * g + kb.lookRad[0] + tc.lookRad[0], gp.look[1] * g + kb.lookRad[1] + tc.lookRad[1]];
  const sprint = Math.max(gp.sprint, kb.sprint, tc.sprint);

  paths.update(dt);
  const canInteract = view === 'ego' && !presentation.active && !sim.active && !panels.rahmenVisible && shop.state !== 'wahl' && shop.state !== 'bon';
  const doorTarget = interactions.update(dt, canInteract);
  shopTarget = canInteract && !doorTarget ? shop.target(player.x, player.z) : null;
  hud.setTarget(canInteract, doorTarget || shopTarget);
  shop.update(dt);

  if (sim.active) sim.update(dt, view === 'ego');
  crowd.update(dt);
  if (view === 'ego') {
    if (sim.active) {
      // Kamera wird von der Simulation geführt
    } else if (presentation.active) {
      presentation.update(dt);
      // Präsentationskamera über der Decke (Grundriss von oben): Decke und Leuchten ausblenden
      const above = camera.position.y > 3.1;
      room.ceiling.visible = !above;
      if (fixtures) fixtures.visible = !above;
      if (duct) duct.visible = !above;
    } else {
      player.update(dt, move, look, sprint);
      // Infokarte aus dem freien Laufen schließt sich, wenn man weitergeht
      if (cardOpenedAt && panels.cardVisible && Math.hypot(player.x - cardOpenedAt[0], player.z - cardOpenedAt[1]) > 2.5) {
        panels.hideCard();
        cardOpenedAt = null;
      }
    }
    renderer.render(scene, camera);
  } else {
    renderer.render(scene, topView.camera);
  }
  hud.tick(dt);
  audio.updateListener(view === 'top' ? topView.camera : camera);
  adaptResolution(dt);
});

// Dynamische Auflösung: Sicherheitsnetz, falls ein Gerät die 60 fps nicht schafft.
// Misst über 3 s; liegt der Schnitt unter config.grafik.zielFps, wird die Pixeldichte in Schritten gesenkt.
let perfTime = 0;
let perfFrames = 0;
let perfWarmup = 5; // die ersten Sekunden (Shader werden kompiliert) nicht bewerten
function adaptResolution(dt) {
  if (!config.grafik.dynamischeAufloesung || document.hidden) return;
  if (perfWarmup > 0) {
    perfWarmup -= dt;
    return;
  }
  perfTime += dt;
  perfFrames++;
  if (perfTime < 3) return;
  const fps = perfFrames / perfTime;
  perfTime = 0;
  perfFrames = 0;
  const pr = renderer.getPixelRatio();
  if (fps < config.grafik.zielFps && pr > config.grafik.minPixelRatio + 0.01) {
    renderer.setPixelRatio(Math.max(config.grafik.minPixelRatio, pr - 0.25));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

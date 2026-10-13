import * as THREE from 'three';

// Schwebende Beschriftung (immer zur Kamera gedreht). Höhe in Metern.
export function textSprite(lines, { height = 0.3, bg = 'rgba(28,28,31,0.82)', fg = '#f4f1ec', accent = null, sub = '#c9c4bc' } = {}) {
  const [title, subtitle] = Array.isArray(lines) ? lines : [lines];
  const px = 64;
  const pad = 22;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const fontT = `600 ${px}px system-ui, -apple-system, sans-serif`;
  const fontS = `400 ${Math.round(px * 0.62)}px system-ui, -apple-system, sans-serif`;
  g.font = fontT;
  let w = g.measureText(title).width;
  if (subtitle) {
    g.font = fontS;
    w = Math.max(w, g.measureText(subtitle).width);
  }
  const hPx = subtitle ? px * 1.95 : px * 1.25;
  c.width = Math.ceil(w + pad * 2 + (accent ? 18 : 0));
  c.height = Math.ceil(hPx + pad);
  g.fillStyle = bg;
  roundRect(g, 0, 0, c.width, c.height, 22);
  g.fill();
  const x0 = pad + (accent ? 18 : 0);
  if (accent) {
    g.fillStyle = accent;
    roundRect(g, pad * 0.6, pad * 0.6, 12, c.height - pad * 1.2, 6);
    g.fill();
  }
  g.textBaseline = 'top';
  g.fillStyle = fg;
  g.font = fontT;
  g.fillText(title, x0, pad * 0.55);
  if (subtitle) {
    g.fillStyle = sub;
    g.font = fontS;
    g.fillText(subtitle, x0, pad * 0.55 + px * 1.12);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.set((height * c.width) / c.height, height, 1);
  s.renderOrder = 5;
  return s;
}

// Flaches Schild (Plane) mit Text. Stile: Standard, accent (Farbleiste unten), serif, chalk (Kreidetafel), sub (zweite Zeile)
export function signMesh(text, { w, h, bg = '#1c1c1f', fg = '#f4f1ec', font = '600', border = null, accent = null, serif = false, chalk = false, sub = null, align = 'center', brass = false }) {
  const H = 160;
  const W = Math.round((H * w) / h);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const fam = serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, sans-serif';
  if (chalk) {
    // Kreidetafel: dunkles Grün-Schwarz mit Wischspuren, Holzrahmen
    g.fillStyle = '#26302b';
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 18; i++) g.fillRect(((i * 97) % W) - 40, (i * 37) % H, 160, 14);
    g.strokeStyle = '#7a5a3a';
    g.lineWidth = 12;
    g.strokeRect(6, 6, W - 12, H - 12);
    fg = '#f1ede2';
  } else {
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
  }
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = 8;
    g.strokeRect(4, 4, W - 8, H - 8);
  }
  // Einheitliches Schildsystem: feine Messinglinie unten, Bereichsfarbe nur als kleiner Punkt vor dem Titel
  if (accent || brass) {
    g.fillStyle = '#b39b6b';
    g.fillRect(W * 0.04, H - 12, W * 0.92, 3);
  }
  g.fillStyle = fg;
  const main = sub ? 0.4 : 0.5;
  let size = sub ? 66 : 84;
  const weight = chalk ? '400' : font;
  const famMain = chalk ? '"Segoe Print", "Comic Sans MS", cursive' : fam;
  g.font = `${weight} ${size}px ${famMain}`;
  const maxW = W * (align === 'left' ? 0.86 : 0.88);
  while (g.measureText(text).width > maxW && size > 20) {
    size -= 4;
    g.font = `${weight} ${size}px ${famMain}`;
  }
  g.textAlign = align;
  g.textBaseline = 'middle';
  const x = align === 'left' ? W * 0.06 : W / 2;
  const ty = H * main + 3 - (accent ? 6 : 0);
  g.fillText(text, x, ty);
  if (accent && !chalk) {
    const tw = g.measureText(text).width;
    const mx = align === 'left' ? x - size * 0.45 : x - tw / 2 - size * 0.45;
    g.fillStyle = accent;
    g.beginPath();
    g.arc(Math.max(size * 0.2, mx), ty - size * 0.05, size * 0.16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = fg;
  }
  if (sub) {
    g.globalAlpha = 0.75;
    let s2 = 40;
    g.font = `400 ${s2}px ${fam}`;
    while (g.measureText(sub).width > maxW && s2 > 16) g.font = `400 ${(s2 -= 2)}px ${fam}`;
    g.fillText(sub, x, H * 0.74 - (accent ? 6 : 0));
    g.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  // bedruckte Schilder: vom Raumlicht beleuchtet (nicht selbstleuchtend), leicht aufgehellt, damit sie lesbar bleiben
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: chalk ? 0.95 : 0.7, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: chalk ? 0.2 : 0.3 }),
  );
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

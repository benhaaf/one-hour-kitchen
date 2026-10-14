// PowerPoint aus der Präsentation im 3D-Modell (layout.json) – gleiche Inhalte, Reihenfolge und Sprechernotizen.
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const SKILL = process.env.SKILL;
const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js'));

const L = JSON.parse(fs.readFileSync('/home/claude/one-hour-kitchen/src/layout.json', 'utf8'));
const P = L.praesentation;
const SHOTS = path.join(__dirname, 'shots');
const OUT = process.argv[2] || path.join(__dirname, 'One_Hour_Kitchen_Praesentation.pptx');

const THEME = {
  name: 'One Hour Kitchen',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1F2120', lt1: 'FFFFFF', dk2: '2B2D2F', lt2: 'EFE7D6',
    accent1: 'D64527', accent2: 'B39B6B', accent3: '4F7F5A', accent4: '46708F', accent5: 'A8843A', accent6: '6D4A63',
    hlink: 'D64527', folHlink: 'B39B6B',
  },
};
const HEX = { bg: '1F2120', card: '2D2F31', line: '3A3C3E', text: 'EFE7D6', muted: 'A9A296', accent: 'D64527', brass: 'B39B6B', green: '4F7F5A' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 × 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'One Hour Kitchen – Store-Konzept';
pres.author = 'Gruppe HD25A23';
const C = pres.SchemeColor;
const W = 13.333;
const H = 7.5;
const M = 0.55; // Rand

// ---------- Layouts ----------
pres.defineSlideMaster({
  title: 'TITEL',
  background: { color: HEX.bg },
  objects: [],
});
pres.defineSlideMaster({
  title: 'INHALT',
  background: { color: HEX.bg },
  margin: [0.5, 0.55, 0.5, 0.55],
  objects: [
    { text: { text: 'One Hour Kitchen · Store-Konzept · HD25A23', options: { x: M, y: H - 0.42, w: 6, h: 0.3, fontSize: 9, color: HEX.muted, margin: 0 } } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.72, w: 7.4, h: 1.15, fontSize: 28, bold: false, color: HEX.text, fontFace: 'Cambria', valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.42, w: 0.5, h: 0.3, fontSize: 9, color: HEX.muted, align: 'right' },
});
pres.defineSlideMaster({
  title: 'INHALT_BREIT',
  background: { color: HEX.bg },
  objects: [
    { text: { text: 'One Hour Kitchen · Store-Konzept · HD25A23', options: { x: M, y: H - 0.42, w: 6, h: 0.3, fontSize: 9, color: HEX.muted, margin: 0 } } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.72, w: W - 2 * M, h: 0.8, fontSize: 28, color: HEX.text, fontFace: 'Cambria', valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.42, w: 0.5, h: 0.3, fontSize: 9, color: HEX.muted, align: 'right' },
});
pres.defineSlideMaster({
  title: 'STATION',
  background: { color: HEX.bg },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 7.25, y: 0.95, w: W - 7.25 - M, h: 0.75, fontSize: 24, color: HEX.text, fontFace: 'Cambria', valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.42, w: 0.5, h: 0.3, fontSize: 9, color: HEX.muted, align: 'right' },
});

// ---------- Helfer ----------
let objN = 0;
const on = (p) => `${p}-${++objN}`;
const shot = (i) => {
  const f = path.join(SHOTS, `s${String(i).padStart(2, '0')}.png`);
  return fs.existsSync(f) ? f : null;
};
// grobe Höhe eines Textes (Calibri ≈ 0,5 em Zeichenbreite)
function textH(t, w, fs, lh = 1.2) {
  const cpl = Math.max(8, Math.floor((w * 144) / fs));
  const lines = String(t)
    .split('\n')
    .reduce((n, para) => n + Math.max(1, Math.ceil(para.length / cpl)), 0);
  return (lines * fs * lh) / 72 + 0.08;
}
function kicker(s, text, x = M, y = 0.42, w = 7.4) {
  s.addText(text.toUpperCase(), { x, y, w, h: 0.28, fontSize: 11, bold: true, color: HEX.brass, charSpacing: 1.5, margin: 0, isTextBox: true, objectName: on('kicker') });
}
function tagRow(s, tags, x, y, w, fsz = 11) {
  for (const [t, text] of tags || []) {
    const col = t === 'Q' ? HEX.green : 'B08A34';
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.03, w: 0.3, h: 0.24, fill: { color: col }, rectRadius: 0.05, line: { color: col }, objectName: on('tag') });
    s.addText(t, { x, y: y + 0.03, w: 0.3, h: 0.24, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    const h = textH(text, w - 0.42, fsz);
    s.addText(text, { x: x + 0.4, y, w: w - 0.4, h, fontSize: fsz, color: HEX.muted, margin: 0, valign: 'top', isTextBox: true, objectName: on('tagtext') });
    y += Math.max(0.32, h) + 0.06;
  }
  return y;
}
function image(s, i, x, y, w, h) {
  const f = shot(i);
  if (!f) {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: HEX.card }, line: { color: HEX.card } });
    return;
  }
  s.addImage({ path: f, x, y, w, h, sizing: { type: 'cover', w, h }, objectName: on('modellbild') });
}
function plan(s, name, x, y, w, h) {
  const f = path.join(SHOTS, `${name}_plan.png`);
  if (!fs.existsSync(f)) return;
  const ar = 1001 / 646;
  let pw = w;
  let ph = w / ar;
  if (ph > h) {
    ph = h;
    pw = h * ar;
  }
  s.addImage({ path: f, x: x + (w - pw) / 2, y, w: pw, h: ph, objectName: on('grundriss') });
}
function card(s, k, x, y, w, h) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: HEX.card }, line: { color: HEX.line, width: 0.75 }, rectRadius: 0.08, objectName: on('karte') });
  let cy = y + 0.18;
  let tx = x + 0.2;
  if (k.nr) {
    s.addShape(pres.shapes.OVAL, { x: tx, y: cy, w: 0.36, h: 0.36, fill: { color: HEX.accent }, line: { color: HEX.accent } });
    s.addText(k.nr, { x: tx, y: cy, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    tx += 0.48;
  }
  if (k.titel) {
    const th = textH(k.titel, x + w - 0.2 - tx, 15);
    s.addText(k.titel, { x: tx, y: cy, w: x + w - 0.2 - tx, h: Math.max(0.36, th), fontSize: 15, bold: true, color: HEX.text, margin: 0, valign: k.nr ? 'middle' : 'top', isTextBox: true });
    cy += Math.max(0.42, th + 0.06);
  } else if (k.nr) cy += 0.0;
  const bodyX = k.titel ? x + 0.2 : tx;
  const bodyW = x + w - 0.2 - bodyX;
  const parts = [];
  if (k.text) parts.push({ text: k.text, options: { breakLine: !!(k.punkte || k.zeilen) } });
  if (k.punkte) k.punkte.forEach((p, i, a) => parts.push({ text: p, options: { bullet: true, breakLine: i < a.length - 1 } }));
  if (k.zeilen)
    k.zeilen.forEach(([a, b], i, arr) => {
      parts.push({ text: `${a}: `, options: { bold: true, color: HEX.brass } });
      parts.push({ text: b, options: { breakLine: i < arr.length - 1 } });
    });
  if (parts.length) {
    const len = (k.text || '').length + (k.punkte || []).join(' ').length + (k.zeilen || []).map((z) => z.join(': ')).join('\n').length;
    const nLines = (k.zeilen || []).length + (k.punkte || []).length;
    const bh = textH(len ? 'x'.repeat(len) : '', bodyW, 14) + nLines * 0.12;
    s.addText(parts, { x: bodyX, y: k.titel ? cy : y + 0.18, w: bodyW, h: Math.min(bh + 0.1, y + h - (k.titel ? cy : y + 0.18) - 0.1), fontSize: 14, color: HEX.text, margin: 0, valign: 'top', paraSpaceAfter: 3, isTextBox: true });
    cy = (k.titel ? cy : y + 0.18) + bh + 0.05;
  }
  if (k.tag) tagRow(s, [k.tag], x + 0.2, y + h - 0.5, w - 0.4);
}
function cardsH(k, w) {
  let h = 0.36;
  if (k.titel) h += Math.max(0.42, textH(k.titel, w - 0.4 - (k.nr ? 0.48 : 0), 15) + 0.06);
  const len = (k.text || '').length + (k.punkte || []).join(' ').length + (k.zeilen || []).map((z) => z.join(': ')).join('\n').length;
  if (len) h += textH('x'.repeat(len), w - 0.4 - (!k.titel && k.nr ? 0.48 : 0), 14) + ((k.zeilen || []).length + (k.punkte || []).length) * 0.12 + 0.1;
  if (!k.titel && k.nr) h = Math.max(h, 0.72);
  if (k.tag) h += 0.5;
  return h;
}
function cards(s, list, x, y, w, cols) {
  const n = list.length;
  cols = cols || (n === 4 ? 2 : n === 2 ? 2 : n % 3 === 0 || n > 4 ? 3 : n);
  const gap = 0.25;
  const cw = (w - gap * (cols - 1)) / cols;
  let rowY = y;
  for (let r = 0; r < Math.ceil(n / cols); r++) {
    const row = list.slice(r * cols, r * cols + cols);
    const rh = Math.max(...row.map((k) => cardsH(k, cw)));
    row.forEach((k, i) => card(s, k, x + i * (cw + gap), rowY, cw, rh));
    rowY += rh + gap;
  }
  return rowY;
}
function table(s, T, x, y, w, opts = {}) {
  const hl = T.hervorhebenSpalte;
  const fsz = opts.fs || 14;
  const head = T.kopf.map((t, i) => ({ text: t, options: { bold: true, color: i === hl ? HEX.accent : HEX.brass, fontSize: 11, fill: { color: HEX.bg } } }));
  const rows = T.zeilen.map((z) =>
    z.map((c, i) => ({ text: String(c), options: { fontSize: fsz, color: HEX.text, bold: i === 0 || i === hl, fill: { color: i === hl ? '3A2A26' : HEX.card } } })),
  );
  const cw = opts.colW || T.kopf.map(() => w / T.kopf.length);
  s.addTable([head, ...rows], { x, y, w, colW: cw, border: { type: 'solid', pt: 0.75, color: HEX.bg }, margin: [0.06, 0.1, 0.06, 0.1], valign: 'middle', objectName: on('tabelle') });
  const rh = rows.reduce((sum, r) => sum + Math.max(...r.map((c, i) => textH(c.text, cw[i] - 0.2, fsz, 1.15))) + 0.12, 0);
  return y + 0.4 + rh;
}
function merke(s, m, x, y, w) {
  const h = 0.3 + textH(m[1], w - 0.4, 14) + 0.25;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: '3A2A26' }, line: { color: HEX.accent, width: 1 }, rectRadius: 0.08, objectName: on('merke') });
  s.addText([{ text: m[0], options: { bold: true, color: HEX.accent, fontSize: 13, breakLine: true } }, { text: m[1], options: { color: HEX.text, fontSize: 14 } }], { x: x + 0.2, y: y + 0.12, w: w - 0.4, h: h - 0.24, margin: 0, valign: 'top', isTextBox: true });
  return y + h + 0.2;
}
function fuss(s, text) {
  s.addText(text, { x: M, y: H - 0.85, w: W - 2 * M - 0.6, h: 0.36, fontSize: 10, color: HEX.muted, italic: true, margin: 0, valign: 'bottom', isTextBox: true, objectName: on('fuss') });
}
function zitat(s, text, x, y, w, size = 22) {
  const h = textH(`„${text}“`, w, size) + 0.1;
  s.addText(`„${text}“`, { x, y, w, h, fontSize: size, italic: true, color: HEX.brass, fontFace: 'Cambria', margin: 0, isTextBox: true, objectName: on('zitat') });
  return y + h + 0.15;
}

// ---------- Flächenbilanz (wie im Modell, aus dem Grundriss) ----------
function flaechen() {
  const [vx1, vx2, vz1, vz2] = L.raum.verkaufsraum;
  const total = (vx2 - vx1) * (vz2 - vz1);
  const area = (r) => Math.abs((r[1] - r[0]) * (r[3] - r[2]));
  const WARE = new Set(['gondel', 'kuehlregal', 'glastuer-kuehlung', 'weinregal', 'basis-regal', 'impulsregal', 'schaufenster', 'obst-stand']);
  const SONST = new Set(['kasse-band', 'sb-kasse', 'matrix-dashboard', 'rollkoerbe']);
  const z4 = L.zonen.find((z) => z.id === 'Z4');
  const erlebnis = z4 ? area(z4.rechteck) : 0;
  let ware = 0;
  let sonst = 0;
  const pro = {};
  for (const m of L.moebel) {
    if (m.id.startsWith('L')) continue;
    let a;
    if (m.mitte) a = m.laenge * m.tiefe;
    else if (m.stationen) a = 0;
    else if (m.segmente) a = area(m.segmente[0]);
    else a = area(m.rechteck);
    if (WARE.has(m.typ)) {
      ware += a;
      const key = m.typ === 'gondel' ? 'Kochwelt-Gondeln (3)' : m.id === 'M20' ? 'Vorspeisen' : m.typ === 'basis-regal' ? 'Basissortiment' : m.typ === 'obst-stand' ? 'Obst & Gemüse' : m.typ === 'kuehlregal' ? 'Kühlung' : m.typ === 'glastuer-kuehlung' ? 'Dessert & TK' : m.typ === 'weinregal' ? 'Wein & Getränke' : m.typ === 'impulsregal' ? 'Impuls an der Kasse' : 'Schaufenster';
      pro[key] = (pro[key] || 0) + a;
    } else if (SONST.has(m.typ)) sonst += a;
  }
  sonst += 3.0;
  const kunde = total - ware - erlebnis - sonst;
  return { total, arten: [['Kundenfläche', kunde], ['Warenfläche (Stellfläche)', ware], ['Showküche', erlebnis], ['Kassen, Dashboard, Körbe', sonst]], pro };
}

// ---------- Folien ----------
const stationen = Object.fromEntries(L.stationen.map((s) => [s.nr, s]));
const nSt = L.stationen.length;
let section = null;

function sec(e) {
  if (e.kapitel) {
    section = e.kapitel;
    pres.addSection({ title: section });
  }
  return section;
}

function titelFolie(f, i) {
  const s = pres.addSlide({ masterName: 'TITEL', sectionTitle: section });
  image(s, i, 0, 0, W, H);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 7.6, h: H, fill: { color: HEX.bg, transparency: 12 }, line: { color: HEX.bg, transparency: 100 }, objectName: on('abdunkler') });
  kicker(s, f.zeile, M, 0.7, 6.8);
  s.addText(f.titel, { x: M, y: 1.1, w: 6.8, h: 1.1, fontSize: 48, fontFace: 'Cambria', color: HEX.text, margin: 0, isTextBox: true, objectName: on('titel') });
  s.addText(f.untertitel, { x: M, y: 2.25, w: 6.6, h: 0.8, fontSize: 16, color: HEX.muted, margin: 0, isTextBox: true });
  s.addText([{ text: 'Leitfrage', options: { bold: true, color: HEX.accent, fontSize: 12, breakLine: true } }, { text: f.fragestellung, options: { fontSize: 16, color: HEX.text, italic: true } }], { x: M, y: 3.2, w: 6.6, h: 1.0, margin: 0, isTextBox: true });
  s.addText(
    f.agenda.map((a, k) => ({ text: `${String(k + 1).padStart(2, '0')}   ${a}`, options: { breakLine: k < f.agenda.length - 1 } })),
    { x: M, y: 4.35, w: 6.6, h: 1.4, fontSize: 14, color: HEX.text, margin: 0, paraSpaceAfter: 4, isTextBox: true, objectName: on('agenda') },
  );
  s.addText(f.legende.join('   ·   '), { x: M, y: 5.95, w: 6.8, h: 0.5, fontSize: 10, color: HEX.muted, margin: 0, isTextBox: true });
  s.addText(f.team, { x: M, y: 6.6, w: 6.6, h: 0.35, fontSize: 12, color: HEX.brass, margin: 0, isTextBox: true });
  s.addNotes(f.notizen || '');
}

// Folien mit Inhalt links und Modellbild rechts (oder volle Breite)
const BREIT = new Set(['grundriss', 'wettbewerb', 'optimierung', 'warenpraesentation', 'blockbildung', 'atmosphaere', 'anhang', 'quellen', 'layoutentscheidungen', 'konflikte', 'begruendung', 'rahmen', 'wirtschaft', 'matrix', 'rezeptkarte', 'fazit', 'flaechen', 'querlaengs', 'problem']);

function inhaltFolie(id, f, i) {
  const breit = BREIT.has(id);
  const s = pres.addSlide({ masterName: breit ? 'INHALT_BREIT' : 'INHALT', sectionTitle: section });
  const cw = breit ? W - 2 * M : 7.4;
  if (!breit) image(s, i, 8.35, 0, W - 8.35, H);
  kicker(s, f.kicker || '', M, 0.42, cw);
  s.addText(f.titel.replace(/\.$/, ''), { placeholder: 'title' });
  let y = breit ? 1.6 : 1.95;
  const x = M;

  switch (id) {
    case 'problem': {
      y = zitat(s, f.zitat, x, y, cw, 22);
      y = cards(s, f.karten, x, y, cw, 3);
      s.addText(f.kpisTitel, { x, y: y + 0.05, w: cw, h: 0.3, fontSize: 12, bold: true, color: HEX.brass, margin: 0, isTextBox: true });
      const kw = (cw - 0.5) / 3;
      f.kpis.forEach(([v, l], k) => {
        s.addText([{ text: v, options: { fontSize: 32, bold: true, color: HEX.accent, fontFace: 'Cambria', breakLine: true } }, { text: l, options: { fontSize: 13, color: HEX.muted } }], { x: x + k * (kw + 0.25), y: y + 0.4, w: kw, h: 1.0, margin: 0, isTextBox: true, objectName: on('kpi') });
      });
      tagRow(s, f.tags, x, y + 1.5, cw);
      break;
    }
    case 'wettbewerb':
    case 'abgrenzung':
    case 'optimierung':
    case 'warenpraesentation':
    case 'atmosphaere':
    case 'anhang':
    case 'blockbildung': {
      const n = f.tabelle.kopf.length;
      const colW = n === 4 ? [cw * 0.2, cw * 0.27, cw * 0.27, cw * 0.26] : n === 3 ? [cw * 0.28, cw * 0.44, cw * 0.28] : [cw / 2, cw / 2];
      if (id === 'anhang') colW.splice(0, 3, cw * 0.3, cw * 0.52, cw * 0.18);
      if (f.karten && id === 'blockbildung') y = cards(s, f.karten, x, y, cw, 3) + 0.05;
      if (id === 'optimierung') {
        plan(s, 's07', x + 7.0, y, cw - 7.0, 4.6);
        y = table(s, f.tabelle, x, y, 6.7, { colW: [2.6, 4.1], fs: 13 });
        tagRow(s, f.tags, x, y + 0.1, 6.7);
        break;
      }
      y = table(s, f.tabelle, x, y, cw, { colW, fs: id === 'anhang' || id === 'optimierung' ? 12 : 14 });
      if (f.karten && id === 'wettbewerb') cards(s, f.karten, x, y + 0.1, cw, 2);
      if (f.zitat) y = zitat(s, f.zitat, x, y + 0.15, cw, 18);
      if (f.tags) tagRow(s, f.tags, x, Math.min(y + 0.1, H - 1.35), cw);
      break;
    }
    case 'rahmen': {
      const T = { kopf: ['', 'Annahme', ''], zeilen: f.felder.map(([a, b, t]) => [a, b, t]) };
      y = table(s, T, x, y, cw, { colW: [cw * 0.18, cw * 0.74, cw * 0.08] });
      break;
    }
    case 'wirtschaft': {
      const T = { kopf: ['Position', 'Rechnung', 'Wert'], zeilen: f.rechnung };
      const tw = 7.3;
      table(s, T, x, y, tw, { colW: [2.3, 3.5, 1.5], fs: 13 });
      const b = f.rechts.balken;
      s.addChart(pres.charts.BAR, [{ name: b.titel, labels: b.werte.map((v) => v[0]), values: b.werte.map((v) => v[1]) }], {
        x: x + tw + 0.35, y, w: cw - tw - 0.35, h: 3.0, barDir: 'bar',
        showTitle: true, title: `${b.titel} (${b.einheit})`, titleColor: HEX.text, titleFontSize: 13, titleFontFace: '+mn-lt',
        chartColors: ['9A958E', 'D64527'], varyColors: true, showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: HEX.text, dataLabelFontSize: 12, dataLabelFontFace: '+mn-lt', dataLabelFormatCode: '0.0',
        catAxisLabelColor: HEX.muted, catAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt', valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false,
        valAxisMinVal: 0, valAxisMaxVal: 60, objectName: on('diagramm'),
      });
      merke(s, f.rechts.merke, x + tw + 0.35, y + 3.15, cw - tw - 0.35);
      tagRow(s, f.tags, x, H - 1.45, cw);
      break;
    }
    case 'grundriss': {
      plan(s, 's07', 4.9, 1.55, W - 4.9 - M, 5.0);
      f.farbpunkte.forEach(([c, t, d], k) => {
        s.addShape(pres.shapes.OVAL, { x, y: y + k * 0.85 + 0.06, w: 0.26, h: 0.26, fill: { color: c.slice(1) }, line: { color: c.slice(1) }, objectName: on('punkt') });
        s.addText([{ text: t, options: { bold: true, fontSize: 16, color: HEX.text, breakLine: true } }, { text: d, options: { fontSize: 14, color: HEX.muted } }], { x: x + 0.45, y: y + k * 0.85, w: 3.8, h: 0.75, margin: 0, isTextBox: true });
      });
      fuss(s, f.fuss);
      break;
    }
    case 'flaechen': {
      const F = flaechen();
      const left = 6.0;
      s.addChart(pres.charts.DOUGHNUT, [{ name: 'Fläche', labels: F.arten.map((a) => a[0]), values: F.arten.map((a) => Math.round(a[1])) }], {
        x, y, w: left, h: 4.2, holeSize: 55, chartColors: ['B9B4AB', 'E8862E', 'D64527', '7A7A84'], showLegend: true, legendPos: 'b', legendColor: HEX.text, legendFontSize: 12, legendFontFace: '+mn-lt',
        showValue: true, showPercent: false, dataLabelColor: '1F2120', dataLabelFontSize: 12, dataLabelFontFace: '+mn-lt', dataLabelFormatCode: '0" m²"',
        showTitle: true, title: `Verkaufsraum ${Math.round(F.total)} m²`, titleColor: HEX.text, titleFontSize: 14, titleFontFace: '+mn-lt', objectName: on('flaechen'),
      });
      const rows = Object.entries(F.pro).sort((a, b) => b[1] - a[1]);
      const T = { kopf: ['Warenbereich', 'Stellfläche'], zeilen: rows.map(([k, v]) => [k, `${v.toFixed(1).replace('.', ',')} m²`]) };
      const ty = table(s, T, x + left + 0.4, y, cw - left - 0.4, { colW: [(cw - left - 0.4) * 0.65, (cw - left - 0.4) * 0.35], fs: 13 });
      merke(s, f.merke, x + left + 0.4, Math.min(ty + 0.1, H - 2.2), cw - left - 0.4);
      fuss(s, f.fuss);
      break;
    }
    case 'matrix': {
      const welten = ['Pasta Night', 'Asian Night', 'Mexican Night'];
      const an = [['besonders', '★ besonders', 'Menü mit Dessert'], ['schnell', '» schnell', '≤ 20 Min.'], ['günstig', '€ günstig', '≤ 4 € je Portion']];
      const head = [{ text: '', options: { fill: { color: HEX.bg } } }, ...welten.map((w2) => ({ text: w2, options: { bold: true, color: HEX.brass, fontSize: 14, fill: { color: HEX.bg }, fontFace: 'Cambria' } }))];
      const rows = an.map(([k, t, sub]) => [
        { text: [{ text: t, options: { bold: true, breakLine: true } }, { text: sub, options: { fontSize: 11, color: HEX.muted } }], options: { fontSize: 15, color: HEX.text, fill: { color: HEX.card } } },
        ...welten.map((w2) => {
          const r = L.rezepte.find((q) => q.welt === w2 && q.anlass === k);
          return { text: [{ text: `${r.nr}  `, options: { color: HEX.accent, bold: true } }, { text: r.titel, options: { breakLine: true } }, { text: `${r.zeit} · ${r.preis}`, options: { fontSize: 11, color: HEX.muted } }], options: { fontSize: 14, color: HEX.text, fill: { color: HEX.card } } };
        }),
      ]);
      s.addTable([head, ...rows], { x, y, w: 8.4, colW: [1.9, 2.17, 2.17, 2.16], rowH: [0.4, 0.85, 0.85, 0.85], border: { type: 'solid', pt: 1, color: HEX.bg }, margin: [0.08, 0.12, 0.08, 0.12], valign: 'middle', objectName: on('matrix') });
      image(s, i, x + 8.7, y, cw - 8.7, 2.95);
      cards(s, f.karten, x, y + 3.2, cw, 3);
      fuss(s, f.fuss);
      break;
    }
    case 'rezeptkarte': {
      const r = L.rezepte.find((q) => q.nr === f.rezeptkarte);
      const rw = 4.3;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: rw, h: 4.75, fill: { color: 'FBF8F2' }, line: { color: 'FBF8F2' }, rectRadius: 0.1, objectName: on('rezeptkarte') });
      s.addText([{ text: `Rezept ${r.nr} · ${r.anlass} · ${r.welt}`, options: { fontSize: 11, color: '8A8378', breakLine: true } }, { text: r.titel, options: { fontSize: 22, fontFace: 'Cambria', color: '1F2120', breakLine: true } }, { text: `${r.zeit} · ${r.preis}`, options: { fontSize: 12, color: '6B6258' } }], { x: x + 0.25, y: y + 0.2, w: rw - 0.5, h: 1.15, margin: 0, isTextBox: true });
      const rows = [...r.zutaten, ...r.ergaenzung.map(([n, c]) => [`+ ${n}`, c])].map(([n, c]) => [{ text: n, options: { fontSize: 13, color: '2B2C30' } }, { text: c, options: { fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', fill: { color: { O: '2F9E44', T: 'A8642C', V: '8A5A32', K: '2B6CB0', B: '6B4F2A', D: '8E44AD', G: '7B1E3A' }[c[0]] || '555555' } } }]);
      s.addTable(rows, { x: x + 0.25, y: y + 1.45, w: rw - 0.5, colW: [rw - 1.3, 0.8], rowH: 0.3, border: { type: 'solid', pt: 2, color: 'FBF8F2' }, margin: [0.02, 0.06, 0.02, 0.06], fill: { color: 'FBF8F2' }, objectName: on('zutaten') });
      // Schritte
      const sx = x + rw + 0.45;
      const sw = cw - rw - 0.45;
      const stw = (sw - 0.2 * 4) / 5;
      f.schritte.forEach(([n, t, d], k) => {
        const bx = sx + k * (stw + 0.2);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y, w: stw, h: 1.5, fill: { color: HEX.card }, line: { color: HEX.line }, rectRadius: 0.08, objectName: on('schritt') });
        s.addText([{ text: n, options: { fontSize: 20, bold: true, color: HEX.accent, fontFace: 'Cambria', breakLine: true } }, { text: t, options: { fontSize: 14, bold: true, color: HEX.text, breakLine: true } }, { text: d, options: { fontSize: 11, color: HEX.muted } }], { x: bx + 0.12, y: y + 0.1, w: stw - 0.24, h: 1.3, margin: 0, valign: 'top', isTextBox: true });
      });
      cards(s, f.karten, sx, y + 1.8, sw, 3);
      fuss(s, f.fuss);
      break;
    }
    case 'parmesan': {
      const z = f.zuordnung;
      z.von.forEach((v, k) => {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + k * 0.75, w: 3.0, h: 0.6, fill: { color: HEX.card }, line: { color: HEX.line }, rectRadius: 0.08 });
        s.addText(v, { x: x + 0.15, y: y + k * 0.75, w: 2.8, h: 0.6, fontSize: 13, color: HEX.text, valign: 'middle', margin: 0, isTextBox: true });
      });
      s.addText('→', { x: x + 3.1, y: y + 0.3, w: 0.6, h: 0.6, fontSize: 30, color: HEX.accent, align: 'center', margin: 0, isTextBox: true });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 3.8, y: y + 0.1, w: cw - 3.8, h: 1.15, fill: { color: '3A2A26' }, line: { color: HEX.accent }, rectRadius: 0.08, objectName: on('zuordnung') });
      s.addText([{ text: z.nach, options: { bold: true, fontSize: 15, color: HEX.text, breakLine: true } }, { text: z.hinweis, options: { fontSize: 12, color: HEX.muted } }], { x: x + 4.0, y: y + 0.15, w: cw - 4.2, h: 1.05, margin: 0, valign: 'middle', isTextBox: true });
      y = cards(s, f.karten, x, y + 1.7, cw, 3);
      tagRow(s, f.tags, x, y, cw);
      break;
    }
    case 'begruendung': {
      const n = f.kette.length;
      const bw = (cw - 0.3 * (n - 1)) / n;
      f.kette.forEach((k, j) => {
        const bx = x + j * (bw + 0.3);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y, w: bw, h: 2.3, fill: { color: HEX.card }, line: { color: HEX.line }, rectRadius: 0.08, objectName: on('glied') });
        s.addText([{ text: `${j + 1}`, options: { fontSize: 22, bold: true, color: HEX.accent, fontFace: 'Cambria', breakLine: true } }, { text: k.titel, options: { fontSize: 15, bold: true, color: HEX.text, breakLine: true } }, { text: k.text, options: { fontSize: 13, color: HEX.text } }], { x: bx + 0.14, y: y + 0.12, w: bw - 0.28, h: 1.55, margin: 0, valign: 'top', isTextBox: true });
        tagRow(s, [k.tag], bx + 0.14, y + 1.62, bw - 0.2, 9);
        if (j < n - 1) s.addText('›', { x: bx + bw, y: y + 0.8, w: 0.3, h: 0.5, fontSize: 24, color: HEX.brass, align: 'center', margin: 0, isTextBox: true });
      });
      merke(s, f.merke, x, y + 2.7, cw);
      fuss(s, f.fuss);
      break;
    }
    case 'quellen': {
      const half = Math.ceil(f.liste.length / 2);
      const colw = (cw - 0.4) / 2;
      [f.liste.slice(0, half), f.liste.slice(half)].forEach((list, c) => {
        s.addText(list.map((t, k) => ({ text: t, options: { breakLine: k < list.length - 1 } })), { x: x + c * (colw + 0.4), y, w: colw, h: 4.2, fontSize: 11, color: HEX.text, margin: 0, paraSpaceAfter: 5, valign: 'top', isTextBox: true, objectName: on('quellen') });
      });
      s.addText(f.hinweise.join('\n'), { x, y: 5.95, w: cw, h: 0.65, fontSize: 10, color: HEX.muted, margin: 0, isTextBox: true });
      break;
    }
    case 'fazit': {
      y = cards(s, f.karten, x, y, cw, 3);
      y = zitat(s, f.zitat, x, y + 0.1, cw, 20);
      s.addText(f.abschluss, { x, y: y + 0.1, w: cw, h: 0.5, fontSize: 20, bold: true, color: HEX.accent, margin: 0, isTextBox: true });
      image(s, i, x, y + 0.8, cw, H - 0.6 - (y + 0.8));
      break;
    }
    default: {
      if (f.lead) {
        const h = textH(f.lead, cw, 16);
        s.addText(f.lead, { x, y, w: cw, h, fontSize: 16, color: HEX.text, margin: 0, isTextBox: true });
        y += h + 0.2;
      }
      if (f.karten) y = cards(s, f.karten, x, y, cw, id === 'querlaengs' ? 2 : id === 'layoutentscheidungen' ? 3 : undefined);
      if (id === 'konflikte' || id === 'querlaengs') image(s, i, x, y + 0.05, cw, H - 1.0 - (y + 0.05));
      if (f.tags) y = tagRow(s, f.tags, x, y, cw);
      if (f.fuss) fuss(s, f.fuss);
    }
  }
  if (f.fuss && !['grundriss', 'flaechen', 'matrix', 'rezeptkarte', 'begruendung', 'querlaengs', 'layoutentscheidungen', 'konflikte'].includes(id) && id !== 'default') fuss(s, f.fuss);
  if (['querlaengs', 'konflikte', 'layoutentscheidungen'].includes(id) && f.fuss) {
    /* bereits im default gesetzt */
  }
  s.addNotes(f.notizen || '');
}

function stationFolie(st, i) {
  const s = pres.addSlide({ masterName: 'STATION', sectionTitle: section });
  const iw = 6.85;
  image(s, i, 0, 0, iw, H);
  const x = iw + 0.4;
  const w = W - x - M;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 0.42, w: 1.45, h: 0.36, fill: { color: HEX.accent }, line: { color: HEX.accent }, rectRadius: 0.08 });
  s.addText(`Station ${st.nr}/${nSt}`, { x, y: 0.42, w: 1.45, h: 0.36, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  s.addText(st.bezug, { x: x + 1.6, y: 0.42, w: w - 1.6, h: 0.36, fontSize: 11, color: HEX.brass, valign: 'middle', margin: 0, isTextBox: true });
  s.addText(st.titel, { placeholder: 'title' });
  let y = 1.75;
  const fsE = st.entscheidung.length + st.begruendung.length > 720 ? 12 : 13;
  const eh = textH(st.entscheidung, w, fsE, 1.18);
  s.addText(st.entscheidung, { x, y, w, h: eh, fontSize: fsE, bold: true, color: HEX.text, margin: 0, valign: 'top', isTextBox: true, objectName: on('entscheidung') });
  y += eh + 0.12;
  s.addText('WARUM', { x, y, w, h: 0.25, fontSize: 10, bold: true, color: HEX.brass, charSpacing: 1.5, margin: 0, isTextBox: true });
  y += 0.27;
  const bh = textH(st.begruendung, w, fsE, 1.18);
  s.addText(st.begruendung, { x, y, w, h: bh, fontSize: fsE, color: HEX.text, margin: 0, valign: 'top', isTextBox: true, objectName: on('begruendung') });
  y += bh + 0.15;
  y = tagRow(s, [['Q', st.quelle], ['A', st.annahme]], x, y, w);
  if (st.skizze) s.addText(st.skizze, { x, y: Math.max(y, H - 0.95), w, h: 0.45, fontSize: 10, italic: true, color: HEX.muted, margin: 0, valign: 'top', isTextBox: true });
  s.addNotes(`${st.notizen || ''}\n\nBegründung: ${st.begruendung}`);
}

P.ablauf.forEach((e, i) => {
  sec(e);
  if (e.station) return stationFolie(stationen[e.station], i);
  const f = P.folien[e.folie];
  if (f.typ === 'einleitung') return titelFolie(f, i);
  return inhaltFolie(e.folie, f, i);
});

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('geschrieben', OUT);
})();

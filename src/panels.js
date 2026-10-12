// Infokarte (Entscheidung · Begründung · Quelle · Annahme · Änderung ggü. Skizze), Folien und Rahmen-Overlay.
import { footprints } from './scene/furniture.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// ✓ und ◐ farbig hervorheben
const marks = (s) => esc(s).replace(/✓/g, '<b class="ok">✓</b>').replace(/◐/g, '<b class="chk">◐</b>');

// Flächenbilanz aus dem Grundriss (Rechtecke in layout.json)
export function flaechenbilanz(layout) {
  const [vx1, vx2, vz1, vz2] = layout.raum.verkaufsraum;
  const total = (vx2 - vx1) * (vz2 - vz1);
  const area = (r) => Math.abs((r[1] - r[0]) * (r[3] - r[2]));
  const WARE = new Set(['kochwelt-gondel', 'kuehlregal', 'glastuer-kuehlung', 'weinregal', 'basis-regal', 'impulsregal', 'schaufenster', 'obst-stand']);
  const SONST = new Set(['kasse-band', 'sb-kasse', 'matrix-dashboard']);
  const showkueche = layout.zonen.find((z) => z.id === 'Z4');
  const erlebnis = showkueche ? area(showkueche.rechteck) : 0;
  let ware = 0;
  let sonst = 0;
  const proBereich = {};
  for (const m of layout.moebel) {
    if (m.id.startsWith('L')) continue;
    const a = m.mitte ? m.laenge * m.tiefe : footprints(m).slice(0, 1).reduce((s, r) => s + area(r), 0);
    if (WARE.has(m.typ)) {
      ware += a;
      const key = m.typ === 'kochwelt-gondel' ? 'Kochwelten' : m.typ === 'basis-regal' ? 'Basissortiment' : m.typ === 'obst-stand' ? 'Obst & Gemüse' : m.typ === 'kuehlregal' ? 'Kühlung' : m.typ === 'glastuer-kuehlung' ? 'Dessert & TK' : m.typ === 'weinregal' ? 'Wein & Getränke' : m.typ === 'impulsregal' ? 'Impuls an der Kasse' : 'Schaufenster';
      proBereich[key] = (proBereich[key] || 0) + a;
    } else if (SONST.has(m.typ)) sonst += a;
  }
  sonst += 3.0; // Kassenarbeitsplätze hinter den Kassen (Annahme)
  const kunde = total - ware - erlebnis - sonst;
  return {
    total,
    arten: [
      ['Warenfläche (Stellfläche der Warenträger)', ware, '#e8862e'],
      ['Kundenfläche (Gänge, Zugang, Aufenthalt)', kunde, '#b9b4ab'],
      ['Erlebnis-/Beratungszone (Showküche)', erlebnis, '#d64527'],
      ['sonstige Fläche (Kassen, Dashboard)', sonst, '#7a7a84'],
    ],
    bereiche: Object.entries(proBereich).sort((a, b) => b[1] - a[1]),
  };
}

const fmt = (n, d = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

export class Panels {
  constructor(root, layout) {
    this.layout = layout;
    root.insertAdjacentHTML(
      'beforeend',
      `<aside id="infocard" hidden aria-live="polite"></aside>
       <section id="slide" hidden aria-live="polite"></section>
       <div id="station-indicator" hidden></div>
       <div id="rahmen" hidden role="dialog" aria-label="Rahmendaten"><div class="rahmen-box"></div></div>`,
    );
    this.card = root.querySelector('#infocard');
    this.slide = root.querySelector('#slide');
    this.indicator = root.querySelector('#station-indicator');
    this.rahmen = root.querySelector('#rahmen');
    this.rahmen.addEventListener('pointerdown', () => this.toggleRahmen(false));
    this.renderRahmen();
    this.cardStation = null;
  }

  // ---------- Infokarte ----------
  showCard(station, total) {
    const s = station;
    const row = (label, text, cls = '') => `<div class="ic-row ${cls}"><span class="ic-label">${label}</span><p>${marks(text)}</p></div>`;
    this.card.innerHTML = `
      <header><span class="ic-nr">${s.nr}/${total}</span><h2>${esc(s.titel)} <small>${esc(s.bezug)}</small></h2></header>
      ${row('Entscheidung', s.entscheidung)}
      ${s.regalbild ? this.planogram(s.regalbild) : ''}
      ${row('Begründung', s.begruendung)}
      ${row('Quelle', s.quelle, 'ic-quelle')}
      ${s.annahme ? row('Annahme / Aussagegrenze', s.annahme, 'ic-annahme') : ''}
      ${s.skizze ? row('Gegenüber der Skizze', s.skizze, 'ic-skizze') : ''}`;
    this.card.classList.toggle('ic-wide', !!s.regalbild);
    this.card.hidden = false;
    this.card.classList.remove('ic-in');
    void this.card.offsetWidth; // Animation neu starten
    this.card.classList.add('ic-in');
    this.cardStation = s;
  }

  // Schematisches Regalbild (Planogramm) einer Kochwelt-Gondel: Spalten = Anlässe, Zeilen = Regalzonen
  planogram(id) {
    const L = this.layout;
    const m = L.moebel.find((x) => x.id === id);
    if (!m || !m.rezepte) return '';
    const R = m.rezepte.map((nr) => L.rezepte.find((r) => r.nr === nr));
    const sym = { schnell: '»', besonders: '★', günstig: '€' };
    const col = { schnell: '#d64527', besonders: '#8a4fc7', günstig: '#2f7d32' };
    const zonen = L.regalzonen.zonen;
    const code = m.welt.startsWith('Pasta') ? 'W1' : m.welt.startsWith('Asian') ? 'W2' : 'W3';
    const cell = (zone, r) => {
      const warm = r.zutaten.filter(([, c]) => !/^[KDO]/.test(c)).map(([n]) => n);
      const cold = [...r.zutaten, ...r.ergaenzung].filter(([, c]) => /^[KDO]/.test(c)).map(([n, c]) => `${n} ${c}`);
      if (zone.name === 'Reckzone') return `<b style="color:${col[r.anlass]}">${sym[r.anlass]} ${esc(r.anlass)}</b> · ${esc(r.nr)}`;
      if (zone.name === 'Sichtzone') return `Rezeptkarten ${esc(r.nr)} + Kochbox „für 2“`;
      if (zone.name === 'Greifzone') return `${esc(warm.join(', '))}<br><small>Karte: ${esc(cold.join(' · '))}</small>`;
      const drink = r.ergaenzung.find(([, c]) => c === 'G3' || c === 'G2');
      return `Großpackung · ${esc(drink ? drink[0] : 'Wasser')}`;
    };
    const fmtH = (z) => (z.von === 0 ? `< ${z.bis}` : `${z.von}–${z.bis}`).replace(/\./g, ',');
    return `<div class="ic-row"><span class="ic-label">Regalbild ${esc(id)} · Kreuzblock (senkrecht Anlass, waagerecht Regalzone)</span>
      <table class="planogram"><thead><tr><th></th>${R.map((r) => `<th style="border-top:3px solid ${col[r.anlass]}">${sym[r.anlass]} ${esc(r.anlass)}</th>`).join('')}</tr></thead>
      <tbody>${zonen.map((z) => `<tr><th style="border-left:4px solid ${z.farbe}">${esc(z.name)}<small>${fmtH(z)} m</small></th>${R.map((r) => `<td>${cell(z, r)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="pg-note">Kühlware steht nie in der Kochwelt (Parmesan-Regel): Die Karte nennt ihr Fach. Aus Kundensicht liegt » schnell links am Regalkopf zum Gang, € günstig an der Wand.</p></div>`;
  }

  hideCard() {
    this.card.hidden = true;
    this.cardStation = null;
  }

  get cardVisible() {
    return !this.card.hidden;
  }

  // ---------- Folien ----------
  tags(list) {
    if (!list) return '';
    return `<ul class="sl-tags">${list.map(([t, text]) => `<li><span class="tag tag-${t === 'Q' ? 'q' : 'a'}">${t}</span>${marks(text)}</li>`).join('')}</ul>`;
  }

  showSlide(sl, stationCount) {
    let body = '';
    if (sl.typ === 'einleitung') {
      body = `
        <p class="sl-kicker">${esc(sl.zeile)}</p>
        <h1 class="sl-title">${esc(sl.titel)}</h1>
        <p class="sl-sub">${esc(sl.untertitel)}</p>
        <p class="sl-frage"><span>Leitfrage</span>${esc(sl.fragestellung)}</p>
        <h3>Ablauf</h3>
        <ol class="sl-agenda">${sl.agenda.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        ${sl.legende ? `<p class="sl-legende">${sl.legende.map(marks).join(' · ')}</p>` : ''}
        <p class="sl-team">${esc(sl.team)}</p>`;
    } else if (sl.typ === 'folie') {
      let inner = '';
      if (sl.lead) inner += `<p class="sl-lead">${esc(sl.lead)}</p>`;
      if (sl.kpis) inner += `<div class="sl-kpis">${sl.kpis.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>`;
      if (sl.felder)
        inner += `<dl class="sl-felder">${sl.felder.map(([k, v, t]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}${t === 'A' ? '<span class="tag tag-a">A</span>' : t === 'Q' ? '<span class="tag tag-q">Q</span>' : ''}</dd></div>`).join('')}</dl>`;
      if (sl.rechnung)
        inner += `<table class="sl-table sl-rechnung"><tbody>${sl.rechnung.map(([a, b, c]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td><td class="num">${esc(c)}</td></tr>`).join('')}</tbody></table>`;
      if (sl.tabelle)
        inner += `<table class="sl-table"><thead><tr>${sl.tabelle.kopf.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${sl.tabelle.zeilen
          .map((r, i) => `<tr class="${i === sl.tabelle.zeilen.length - 1 && sl.tabelle.hervorheben !== false && r[0] === 'One Hour Kitchen' ? 'hl' : ''}">${r.map((c, j) => (j ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`)).join('')}</tr>`)
          .join('')}</tbody></table>`;
      if (sl.flaechen === 'auto') {
        const fb = flaechenbilanz(this.layout);
        const bar = (v, max, col) => `<span class="bar"><i style="width:${Math.max(2, (v / max) * 100)}%;background:${col}"></i></span>`;
        inner += `<div class="sl-cols"><div><h3>Flächenarten · ${fmt(fb.total)} m²</h3><table class="sl-table sl-bars"><tbody>${fb.arten
          .map(([n, v, c]) => `<tr><th>${esc(n)}</th><td>${bar(v, fb.total, c)}</td><td class="num">${fmt(v)} m² · ${fmt((v / fb.total) * 100, 0)} %</td></tr>`)
          .join('')}</tbody></table></div><div><h3>Raumzuteilung der Warenfläche</h3><table class="sl-table sl-bars"><tbody>${fb.bereiche
          .map(([n, v]) => `<tr><th>${esc(n)}</th><td>${bar(v, fb.bereiche[0][1], '#e8862e')}</td><td class="num">${fmt(v)} m²</td></tr>`)
          .join('')}</tbody></table></div></div>`;
      }
      if (sl.punkte) inner += `<ul class="sl-punkte">${sl.punkte.map((a) => `<li>${marks(a)}</li>`).join('')}</ul>`;
      inner += this.tags(sl.tags);
      body = `<p class="sl-kicker">${esc(sl.kicker || '')}</p><h1 class="sl-title sl-title-m">${esc(sl.titel)}</h1>${inner}`;
    } else if (sl.typ === 'schluss') {
      body = `
        <p class="sl-kicker">Rundgang abgeschlossen · ${stationCount} Stationen</p>
        <h1 class="sl-title sl-title-m">${esc(sl.titel)}</h1>
        <ul class="sl-punkte">${sl.punkte.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        ${sl.ausblick ? `<p class="sl-frage"><span>Aussagegrenze & Ausblick</span>${esc(sl.ausblick)}</p>` : ''}`;
    } else if (sl.typ === 'quellen') {
      body = `
        <h1 class="sl-title sl-title-m">${esc(sl.titel)}</h1>
        <ol class="sl-quellen">${sl.liste.map((a) => `<li>${marks(a)}</li>`).join('')}</ol>
        ${sl.hinweise ? `<ul class="sl-hinweise">${sl.hinweise.map((a) => `<li>${marks(a)}</li>`).join('')}</ul>` : ''}`;
    }
    const wide = sl.typ === 'folie' && (sl.tabelle || sl.flaechen || sl.rechnung || sl.felder);
    this.slide.className = `sl-${sl.typ}${wide ? ' sl-wide' : ''}`;
    this.slide.innerHTML = body;
    this.slide.hidden = false;
    this.slide.scrollTop = 0;
    this.slide.classList.remove('ic-in');
    void this.slide.offsetWidth;
    this.slide.classList.add('ic-in');
  }

  hideSlide() {
    this.slide.hidden = true;
  }

  get slideVisible() {
    return !this.slide.hidden;
  }

  setIndicator(text) {
    this.indicator.hidden = !text;
    this.indicator.textContent = text || '';
  }

  // ---------- Rahmen-Overlay (aus der Folie „rahmen“) ----------
  renderRahmen() {
    const F = this.layout.praesentation?.folien?.rahmen;
    const fb = flaechenbilanz(this.layout);
    const rows = (F?.felder || [])
      .map(([k, v, t]) => `<div class="r-row"><dt>${esc(k)}</dt><dd><p>${esc(v)}</p>${t === 'A' ? '<span class="tag-annahme">Annahme</span>' : ''}</dd></div>`)
      .join('');
    const w = this.layout.praesentation?.folien?.wirtschaft;
    const wrow = w ? `<div class="r-row"><dt>Wirtschaftliche Größe</dt><dd><p>${esc(w.titel)} (${esc(w.rechnung[w.rechnung.length - 1][2])})</p><span class="tag-annahme">Annahme</span></dd></div>` : '';
    this.rahmen.querySelector('.rahmen-box').innerHTML = `
      <h1>One Hour Kitchen – Rahmen</h1>
      <dl>${rows}${wrow}<div class="r-row"><dt>Flächenbilanz</dt><dd><p>${fb.arten.map(([n, v]) => `${esc(n.split(' (')[0])} ${fmt(v)} m²`).join(' · ')}</p></dd></div></dl>
      <footer>Store-Konzept · Kurs HD25A23 · DHBW Heilbronn<span>Schließen: Create / I / „Rahmen“ oder tippen</span></footer>`;
  }

  toggleRahmen(on = this.rahmen.hidden) {
    this.rahmen.hidden = !on;
    return on;
  }

  get rahmenVisible() {
    return !this.rahmen.hidden;
  }
}

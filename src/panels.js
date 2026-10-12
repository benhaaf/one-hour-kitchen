// Infokarte (Entscheidung · Begründung · Quelle · Annahme · Änderung ggü. Skizze), Folien und Rahmen-Overlay.
import { footprints } from './scene/furniture.js';
import { CATALOG } from './scene/products.js';
import { shelfFaces, zoneContent } from './scene/zones.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// ✓ und ◐ farbig hervorheben
const tag = (t) => `<span class="tag tag-${t === 'Q' ? 'q' : 'a'}">${t}</span>`;
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
  showCard(station, total, opts = this.cardOpts || {}) {
    this.cardOpts = opts;
    const s = station;
    const row = (label, text, cls = '') => `<div class="ic-row ${cls}"><span class="ic-label">${label}</span><p>${marks(text)}</p></div>`;
    const zt = opts.regalzonen ? this.zoneTable(s.objekte || []) : '';
    this.card.innerHTML = `<div class="sl-inner">
      <header><span class="ic-nr">${s.nr}/${total}</span><h2>${esc(s.titel)} <small>${esc(s.bezug)}</small></h2></header>
      ${row('Entscheidung', s.entscheidung)}
      ${s.regalbild ? this.planogram(s.regalbild) : ''}
      ${zt}
      ${row('Begründung', s.begruendung)}
      ${row('Quelle', s.quelle, 'ic-quelle')}
      ${s.annahme ? row('Annahme / Aussagegrenze', s.annahme, 'ic-annahme') : ''}
      ${s.skizze ? row('Gegenüber der Skizze', s.skizze, 'ic-skizze') : ''}</div>`;
    this.card.classList.toggle('ic-wide', !!s.regalbild || !!zt);
    this.card.hidden = false;
    this.card.classList.remove('ic-in');
    void this.card.offsetWidth; // Animation neu starten
    this.card.classList.add('ic-in');
    this.cardStation = s;
    this.fit(this.card);
  }

  // Regalzonen der Regale einer Station: Zeile je Regalfront, Spalte je Zone
  zoneTable(ids) {
    const L = this.layout;
    const Z = L.regalzonen.zonen;
    const SEITE = { vorne: 'Front zur Straße', hinten: 'Front zur Rückwand', links: 'linke Front', rechts: 'rechte Front' };
    const rows = [];
    for (const id of ids) {
      const m = L.moebel.find((x) => x.id === id);
      if (!m) continue;
      for (const seite of shelfFaces(m)) {
        if (id === L.stationen.find((st) => st.objekte === ids)?.regalbild && seite === 'hinten') continue; // steht schon im Regalbild
        const inh = zoneContent(L, id, seite);
        const titel = m.regal?.[seite]?.titel || (m.welt ? `${m.welt}` : m.faecher ? m.faecher.map((f) => f.code).join(' ') : m.seiten?.[seite] ? m.seiten[seite].map((f) => f.code).join(' ') : '');
        rows.push(`<tr><th>${esc(id)} <small>${esc(SEITE[seite])}${titel ? ` · ${esc(titel)}` : ''}</small></th>${Z.map((z, i) => `<td>${esc(inh[i])}</td>`).join('')}</tr>`);
      }
    }
    if (!rows.length) return '';
    const fmtH = (z) => (z.von === 0 ? `< ${z.bis}` : `${z.von}–${z.bis}`).replace(/\./g, ',');
    return `<div class="ic-row"><span class="ic-label">Regalzonen · Ahlert/Kenning/Brock 2020, S. 302–303 ✓</span>
      <table class="planogram zonetable"><thead><tr><th></th>${Z.map((z) => `<th style="border-top:4px solid ${z.farbe}">${esc(z.name)}<small>${fmtH(z)} m</small></th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  }

  // Regalbild einer Kochwelt-Gondel: Produktblöcke (Spalten) × Regalzonen (Zeilen)
  planogram(id) {
    const L = this.layout;
    const m = L.moebel.find((x) => x.id === id);
    const face = m?.regal?.hinten;
    if (!face) return '';
    const names = (g) => (CATALOG[g] || []).map((k) => (k.n.endsWith('-') ? k.n.slice(0, -1) + k.s : `${k.n}${k.s && /\d/.test(k.s) ? ` ${k.s}` : ''}`));
    const uniq = (a) => [...new Set(a)];
    const zonen = L.regalzonen.zonen;
    const B = face.bloecke.slice().reverse(); // aus Kundensicht von links nach rechts
    const cell = (zone, bl) => {
      if (zone.name === 'Reckzone') {
        const rez = L.rezepte.filter((r) => r.zutaten.some(([nm, c]) => c === bl.code && (bl.artikel || []).includes(nm))).map((r) => r.nr);
        return `<b>${esc(bl.code)} · ${esc(bl.name)}</b>${rez.length ? `<br><small>für ${esc(rez.join(' '))}</small>` : ''}`;
      }
      if (zone.name === 'Bückzone') return esc(uniq(names(bl.gruppen[1] || bl.gruppen[0])).join(', '));
      const list = uniq(names(bl.gruppen[0]));
      const half = Math.ceil(list.length / 2);
      return esc((zone.name === 'Sichtzone' ? list.slice(0, half) : list.slice(half).length ? list.slice(half) : list).join(', '));
    };
    const fmtH = (z) => (z.von === 0 ? `< ${z.bis}` : `${z.von}–${z.bis}`).replace(/\./g, ',');
    return `<div class="ic-row"><span class="ic-label">Regalbild ${esc(id)} · Produktblöcke (senkrecht Warengruppe, waagerecht Regalzone)</span>
      <table class="planogram"><thead><tr><th></th>${B.map((bl) => `<th>${esc(bl.name)}</th>`).join('')}</tr></thead>
      <tbody>${zonen.map((z) => `<tr><th style="border-left:4px solid ${z.farbe}">${esc(z.name)}<small>${fmtH(z)} m</small></th>${B.map((bl) => `<td>${cell(z, bl)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="pg-note">Keine fertigen Pakete: Die Kundin sammelt nach ihrer Rezeptkarte. Fachcode W1 → Koje Pasta → Block. Kühlware steht im Kühlregal (Parmesan-Regel).</p></div>`;
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
    return `<ul class="sl-tags">${list.map(([t, text]) => `<li>${tag(t)}${marks(text)}</li>`).join('')}</ul>`;
  }

  // Alle Inhaltsbausteine einer Folie (auch für die rechte Spalte „rechts“)
  blocks(sl) {
    const L = this.layout;
    let h = '';
    if (sl.lead) h += `<p class="sl-lead">${marks(sl.lead)}</p>`;
    if (sl.matrix) h += this.matrixHTML();
    if (sl.rezeptkarte) h += this.recipeHTML(sl.rezeptkarte, sl.schritte, sl.karten ? this.blocks({ karten: sl.karten, spalten: 1 }) : '');
    if (sl.zuordnung) {
      const z = sl.zuordnung;
      h += `<div class="sl-zuordnung"><div class="zu-von">${z.von.map((v) => `<span>${esc(v)}</span>`).join('')}</div><div class="zu-pfeil">→</div><div class="zu-nach"><b>${esc(z.nach)}</b>${z.hinweis ? `<small>${esc(z.hinweis)}</small>` : ''}</div></div>`;
    }
    if (sl.karten && !sl.rezeptkarte) {
      const n = sl.karten.length;
      const cols = sl.spalten || (n === 4 ? 2 : n === 2 ? 2 : n % 3 === 0 || n > 4 ? 3 : n);
      h += `<div class="sl-karten" style="--cols:${cols}">${sl.karten
        .map(
          (k) => `<div class="sl-karte">${k.nr || k.titel ? `<div class="k-head">${k.nr ? `<span class="k-nr">${esc(k.nr)}</span>` : ''}${k.titel ? `<h4>${esc(k.titel)}</h4>` : `<p>${marks(k.text || '')}</p>`}</div>` : ''}${k.text && (k.titel || !k.nr) ? `<p>${marks(k.text)}</p>` : ''}${
            k.punkte ? `<ul>${k.punkte.map((x) => `<li>${marks(x)}</li>`).join('')}</ul>` : ''
          }${k.zeilen ? `<dl>${k.zeilen.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${marks(b)}</dd>`).join('')}</dl>` : ''}${k.tag ? `<p class="k-tag">${tag(k.tag[0])}${marks(k.tag[1] || '')}</p>` : ''}</div>`,
        )
        .join('')}</div>`;
    }
    if (sl.kpis) h += `${sl.kpisTitel ? `<h3>${esc(sl.kpisTitel)}</h3>` : ''}<div class="sl-kpis">${sl.kpis.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>`;
    if (sl.felder)
      h += `<dl class="sl-felder">${sl.felder.map(([k, v, t]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}${t ? tag(t) : ''}</dd></div>`).join('')}</dl>`;
    if (sl.rechnung)
      h += `<table class="sl-table sl-rechnung"><tbody>${sl.rechnung.map(([a, b, c]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td><td class="num">${esc(c)}</td></tr>`).join('')}</tbody></table>`;
    if (sl.balken) {
      const B = sl.balken;
      const max = Math.max(...B.werte.map((w) => w[1]));
      h += `<div class="sl-balken"><h3>${esc(B.titel)} <small>${esc(B.einheit || '')}</small></h3>${B.werte
        .map(([l, v, c]) => `<div class="bk-row"><span class="bk-l">${esc(l)}</span><span class="bk-bar"><i style="width:${(v / max) * 100}%;background:${c || '#d64527'}"></i><b>${fmt(v)}</b></span></div>`)
        .join('')}</div>`;
    }
    if (sl.tabelle) {
      const T = sl.tabelle;
      h += `<table class="sl-table${T.hervorhebenSpalte ? ' sl-hlcol' : ''}" style="--hl:${(T.hervorhebenSpalte || 0) + 1}"><thead><tr>${T.kopf.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${T.zeilen
        .map((r) => `<tr class="${r[0] === 'One Hour Kitchen' ? 'hl' : ''}">${r.map((c, j) => (j ? `<td>${marks(c)}</td>` : `<th>${marks(c)}</th>`)).join('')}</tr>`)
        .join('')}</tbody></table>`;
    }
    if (sl.flaechen === 'auto') {
      const fb = flaechenbilanz(L);
      const bar = (v, max, col) => `<span class="bar"><i style="width:${Math.max(2, (v / max) * 100)}%;background:${col}"></i></span>`;
      h += `<div class="sl-cols"><div><h3>Flächenarten · ${fmt(fb.total)} m²</h3><table class="sl-table sl-bars"><tbody>${fb.arten
        .map(([n, v, c]) => `<tr><th>${esc(n)}</th><td>${bar(v, fb.total, c)}</td><td class="num">${fmt(v)} m² · ${fmt((v / fb.total) * 100, 0)} %</td></tr>`)
        .join('')}</tbody></table></div><div><h3>Raumzuteilung der Warenfläche</h3><table class="sl-table sl-bars"><tbody>${fb.bereiche
        .map(([n, v]) => `<tr><th>${esc(n)}</th><td>${bar(v, fb.bereiche[0][1], '#e8862e')}</td><td class="num">${fmt(v)} m²</td></tr>`)
        .join('')}</tbody></table></div></div>`;
    }
    if (sl.farbpunkte) h += `<ul class="sl-farbpunkte">${sl.farbpunkte.map(([c, t, x]) => `<li><i style="background:${c}"></i><b>${esc(t)}</b><span>${esc(x)}</span></li>`).join('')}</ul>`;
    if (sl.kette)
      h += `<ol class="sl-kette">${sl.kette.map((k, i) => `<li><span class="k-nr">${i + 1}</span><h4>${esc(k.titel)}</h4><p>${marks(k.text)}</p>${k.tag ? `<p class="k-tag">${tag(k.tag[0])}${marks(k.tag[1])}</p>` : ''}</li>`).join('')}</ol>`;
    if (sl.punkte) h += `<ul class="sl-punkte">${sl.punkte.map((a) => `<li>${marks(a)}</li>`).join('')}</ul>`;
    if (sl.zitat) h += `<blockquote class="sl-zitat">„${esc(sl.zitat)}“</blockquote>`;
    if (sl.merke) h += `<p class="sl-frage"><span>${esc(sl.merke[0])}</span>${marks(sl.merke[1])}</p>`;
    return h;
  }

  // 3×3-Matrix aus layout.rezepte (Spalten = Kochwelt, Zeilen = Anlass)
  matrixHTML() {
    const R = this.layout.rezepte;
    const welten = [...new Set(R.map((r) => r.welt))];
    const ANL = [
      ['schnell', '»', 'schnell', '≤ 20 Min.'],
      ['besonders', '★', 'besonders', 'Menü mit Dessert'],
      ['günstig', '€', 'günstig', '≤ 4 € je Portion'],
    ];
    const farbe = Object.fromEntries(this.layout.moebel.filter((m) => m.welt).map((m) => [m.welt, m.farbe]));
    return `<table class="sl-matrix"><thead><tr><th><small>Anlass ↓ · Küche →</small></th>${welten.map((w) => `<th style="--c:${farbe[w] || '#d64527'}">${esc(w)}</th>`).join('')}</tr></thead><tbody>${ANL.map(
      ([k, sym, name, krit]) =>
        `<tr><th><b>${sym}</b> ${esc(name)}<small>${esc(krit)}</small></th>${welten
          .map((w) => {
            const r = R.find((x) => x.welt === w && x.anlass === k);
            return r ? `<td style="--c:${farbe[w] || '#d64527'}"><span class="mx-nr">${esc(r.nr)}</span>${esc(r.titel)}<small>${esc(k === 'günstig' ? r.preis : k === 'schnell' ? r.zeit : 'für 2')}</small></td>` : '<td></td>';
          })
          .join('')}</tr>`,
    ).join('')}</tbody></table>`;
  }

  // Rezeptkarte wie am Kartenspender + Ablauf in fünf Schritten
  recipeHTML(nr, schritte, rechts = '') {
    const r = this.layout.rezepte.find((x) => x.nr === nr);
    if (!r) return '';
    const SYM = { schnell: '»', besonders: '★', günstig: '€' };
    const row = ([n, c]) => `<li><span>${esc(n)}</span><b class="code code-${c[0]}">${esc(c)}</b></li>`;
    const card = `<div class="sl-rezept"><header><small>Rezept ${esc(r.nr)} · ${SYM[r.anlass] || ''} ${esc(r.anlass)}</small><h4>${esc(r.titel)}</h4><span>${esc(r.zeit)} · 2 Personen · ${esc(r.welt)}</span></header><ul>${r.zutaten.map(row).join('')}${r.ergaenzung
      .map(([n, c]) => row([`+ ${n}`, c]))
      .join('')}</ul><footer>O Obst/Gemüse · W Kochwelt · K Kühlung · B Basis · D Dessert · G Getränke</footer></div>`;
    const steps = schritte ? `<ol class="sl-schritte">${schritte.map(([n, t, x]) => `<li><span>${esc(n)}</span><b>${esc(t)}</b><small>${esc(x)}</small></li>`).join('')}</ol>` : '';
    return `<div class="sl-rezept-wrap">${card}<div>${steps}${rechts}</div></div>`;
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
        ${sl.legende ? `<p class="sl-legende">${sl.legende.map((x) => marks(x).replace(/^Q =/, tag('Q') + ' =').replace(/^A =/, tag('A') + ' =')).join(' · ')}</p>` : ''}
        <p class="sl-team">${esc(sl.team)}</p>`;
    } else if (sl.typ === 'folie') {
      const main = this.blocks({ ...sl, tags: null });
      const inner = sl.rechts ? `<div class="sl-cols sl-cols-r"><div>${main}</div><div>${this.blocks(sl.rechts)}</div></div>` : main;
      body = `<p class="sl-kicker">${esc(sl.kicker || '')}</p><h1 class="sl-title ${sl.gross ? '' : 'sl-title-m'}">${esc(sl.titel)}</h1>${inner}${this.tags(sl.tags)}${
        sl.abschluss ? `<p class="sl-abschluss">${esc(sl.abschluss)}</p>` : ''
      }`;
    } else if (sl.typ === 'schluss') {
      body = `
        <p class="sl-kicker">Rundgang abgeschlossen · ${stationCount} Stationen</p>
        <h1 class="sl-title sl-title-m">${esc(sl.titel)}</h1>
        <ul class="sl-punkte">${sl.punkte.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        ${sl.ausblick ? `<p class="sl-frage"><span>Aussagegrenze & Ausblick</span>${esc(sl.ausblick)}</p>` : ''}`;
    } else if (sl.typ === 'quellen') {
      body = `
        <p class="sl-kicker">${esc(sl.kicker || '')}</p>
        <h1 class="sl-title sl-title-m">${esc(sl.titel)}</h1>
        <div class="sl-cols sl-cols-q"><ol class="sl-quellen">${sl.liste.map((a) => `<li>${marks(a)}</li>`).join('')}</ol>
        ${sl.fundstellen ? `<div><h3>Verwendete Fundstellen · Ahlert/Kenning/Brock 2020, Kap. 10</h3><table class="sl-table">${sl.fundstellen.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>
        <p class="sl-frage"><span>Schema aus Modul 7</span>Quellenwissen · Fallannahme · Entscheidung · Aussagegrenze</p></div>` : ''}</div>
        ${sl.hinweise ? `<ul class="sl-hinweise">${sl.hinweise.map((a) => `<li>${marks(a)}</li>`).join('')}</ul>` : ''}`;
    }
    if (sl.fuss) body += `<p class="sl-fuss">${marks(sl.fuss)}</p>`;
    const side = sl.panel === 'seite';
    const wide = !side && (sl.typ === 'quellen' || (sl.typ === 'folie' && (sl.tabelle || sl.flaechen || sl.rechnung || sl.felder || sl.karten || sl.matrix || sl.kette || sl.rezeptkarte)));
    this.slide.className = `sl-${sl.typ}${wide ? ' sl-wide' : ''}${side ? ' sl-side' : ''}`;
    this.slide.innerHTML = `<div class="sl-inner">${body}</div>`;
    this.slide.hidden = false;
    this.slide.scrollTop = 0;
    this.slide.classList.remove('ic-in');
    void this.slide.offsetWidth;
    this.slide.classList.add('ic-in');
    this.fit(this.slide);
  }

  // Inhalt an die Bildschirmhöhe anpassen (Beamer: größer, kleines Fenster: kleiner) – keine Scrollbalken in der Präsentation
  fit(el) {
    const inner = el.querySelector('.sl-inner');
    if (!inner) return;
    const big = document.body.classList.contains('presenting');
    let z = big ? Math.min(1.6, Math.max(1, Math.min(window.innerHeight / 860, window.innerWidth / 1500))) : 1;
    inner.style.zoom = z;
    for (let i = 0; i < 14 && el.scrollHeight > el.clientHeight + 2 && z > 0.5; i++) {
      z *= Math.max(0.8, Math.min(0.97, Math.sqrt(el.clientHeight / el.scrollHeight)));
      inner.style.zoom = z;
    }
  }

  refit() {
    if (!this.slide.hidden) this.fit(this.slide);
    if (!this.card.hidden) this.fit(this.card);
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
    const wrow = w ? `<div class="r-row"><dt>Wirtschaftliche Größe</dt><dd><p>${esc(w.merke ? w.merke[0] : w.titel)} · DB Showküche ${esc(w.rechnung[w.rechnung.length - 1][2])}</p><span class="tag-annahme">Annahme</span></dd></div>` : '';
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

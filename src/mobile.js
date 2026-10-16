// Rezeptkarte fürs Handy (?rezept=01): Ziel der QR-Codes an Dashboard, Rezeptkarten und Schaufenster.
// Schlanke Seite ohne 3D – zeigt Gericht, Zutaten mit Fachcode und wo sie im Laden stehen.
import { drawPlate } from './scene/furniture.js';
import { WELTEN } from './scene/catalog.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const SYM = { schnell: '» schnell', besonders: '★ besonders', günstig: '€ günstig' };

// Fachcode → Ort im Laden (aus layout.json)
function orte(layout) {
  const o = { O1: 'Obst & Gemüse am Eingang' };
  for (const m of layout.moebel) {
    if (m.typ === 'gondel' && m.regal) for (const s of ['vorne', 'hinten']) if (m.regal[s]) o[m.regal[s].code] = `${m.name.split('·')[0].trim()} · ${m.regal.welt} · ${m.regal[s].titel}`;
    for (const f of m.faecher || []) o[f.code] = `${m.name} · ${f.name}`;
    for (const list of Object.values(m.seiten || {})) for (const f of list) o[f.code] = `${m.name} · ${f.name}`;
  }
  for (const [c, w] of Object.entries(WELTEN)) if (c.startsWith('V')) o[c] = `Vorspeisen-Regal links am Eingang · ${w.titel}`;
  return o;
}

export function runMobileRecipe(layout, nr) {
  const L = layout;
  const list = L.rezepte;
  const r = list.find((x) => x.nr === `#${String(nr).padStart(2, '0')}`) || list[0];
  const O = orte(L);
  document.title = `${r.titel} – One Hour Kitchen`;
  document.body.classList.add('mobile-rezept');
  const row = ([n, c]) => `<li><span class="mr-n">${esc(n)}</span><b class="code code-${c[0]}">${esc(c)}</b><small>${esc(O[c] || '')}</small></li>`;
  document.getElementById('app').innerHTML = `<main id="mr">
    <header><span class="mr-brand">One Hour Kitchen</span><span class="mr-tag">Shop. Cook. Enjoy.</span></header>
    <canvas width="640" height="420"></canvas>
    <section class="mr-body">
      <p class="mr-kicker">Rezept ${esc(r.nr)} · ${esc(r.welt)} · ${esc(SYM[r.anlass] || r.anlass)}</p>
      <h1>${esc(r.titel)}</h1>
      <p class="mr-meta">${esc(r.zeit)} · ${esc(r.preis)}</p>
      <h2>Zutaten & wo du sie findest</h2>
      <ul class="mr-list">${r.zutaten.map(row).join('')}</ul>
      ${r.ergaenzung?.length ? `<h2>Passt dazu</h2><ul class="mr-list">${r.ergaenzung.map(row).join('')}</ul>` : ''}
      <p class="mr-hint">Der Fachcode steht auf dem Schild über dem Regal. Live-Cooking täglich 11:30–13:30 und 17:30–19 Uhr.</p>
      <nav class="mr-more">${list.map((x) => `<a href="?rezept=${x.nr.slice(1)}"${x === r ? ' class="on"' : ''}>${esc(x.nr)} ${esc(x.titel)}</a>`).join('')}</nav>
      <a class="mr-3d" href="./">Laden in 3D ansehen</a>
    </section></main>`;
  const c = document.querySelector('#mr canvas');
  const g = c.getContext('2d');
  g.fillStyle = '#b48a5e';
  g.fillRect(0, 0, c.width, c.height);
  drawPlate(g, c.width / 2, c.height / 2, 150, r);
}

// Referentenansicht (?referent): läuft im zweiten Fenster auf dem eigenen Bildschirm.
// Zeigt aktuelle Folie, Sprechernotizen, nächste Folie und Timer; steuert das Hauptfenster (Beamer) fern.
import { Panels } from './panels.js';
import { Presentation } from './presentation.js';
import { clock } from './deck.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function runReferent(layout) {
  document.title = 'One Hour Kitchen – Referentenansicht';
  document.body.classList.add('referent');
  const app = document.getElementById('app');
  app.innerHTML = `<div id="ref">
    <header>
      <button data-c="prev">‹ Zurück</button>
      <span class="r-count"></span>
      <button data-c="next">Weiter ›</button>
      <span class="r-kap"></span>
      <button class="r-time" data-c="timer" title="Klick: Timer zurücksetzen"></button>
    </header>
    <main>
      <section class="r-cur"></section>
      <aside>
        <h3>Sprechernotizen</h3><div class="r-notes"></div>
        <h3>Als Nächstes</h3><div class="r-next"></div>
        <p class="r-hint">Tasten: → / Leertaste / Bild ↓ weiter · ← / Bild ↑ zurück. Dieses Fenster auf den eigenen Bildschirm, das Hauptfenster auf den Beamer.</p>
      </aside>
    </main></div>`;
  const P = new Presentation(layout, null);
  const panels = new Panels(app.querySelector('.r-cur'), layout);
  const stCount = layout.stationen.length;
  let state = { i: -1, startedAt: null, aktiv: false };
  const opener = window.opener;
  const send = (cmd, extra = {}) => {
    if (!opener || opener.closed) return;
    opener.postMessage({ ohk: 'ref', cmd, ...extra }, '*');
  };

  function tick() {
    const time = app.querySelector('.r-time');
    const el = state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0;
    time.textContent = `⏱ ${clock(el)} / ${clock(P.dauer)}`;
    time.classList.toggle('over', el > P.dauer);
  }

  function render() {
    tick();
    const i = state.i;
    const sl = P.slides[i];
    if (!sl) {
      app.querySelector('.r-count').textContent = opener ? 'Präsentation noch nicht gestartet – „Weiter“ startet sie' : 'Hauptfenster nicht verbunden – bitte aus der Präsentation mit V öffnen';
      return;
    }
    app.querySelector('.r-count').textContent = `${i + 1}/${P.total}`;
    app.querySelector('.r-kap').textContent = sl.kapitel;
    app.querySelector('.r-notes').textContent = Presentation.notes(sl) || '–';
    const next = P.slides[i + 1];
    app.querySelector('.r-next').innerHTML = next ? `<b>${esc(Presentation.title(next))}</b><small>${esc(next.kicker || next.bezug || '')}</small>` : 'Ende';
    if (sl.typ === 'station') {
      panels.hideSlide();
      panels.showCard(sl, stCount);
    } else {
      panels.hideCard();
      panels.showSlide(sl, stCount);
    }
  }

  window.addEventListener('message', (e) => {
    if (e.data?.ohk !== 'stand') return;
    const changed = e.data.i !== state.i;
    state = e.data;
    if (changed) render();
    else tick();
  });
  app.querySelector('header').addEventListener('click', (e) => {
    const c = e.target.closest('[data-c]')?.dataset.c;
    if (c) send(c);
  });
  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) send('next');
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) send('prev');
    else return;
    e.preventDefault();
  });
  window.addEventListener('resize', () => panels.refit());
  setInterval(tick, 1000);
  send('hallo');
  render();
}

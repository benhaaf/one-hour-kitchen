// Präsentations-Steuerung, die PowerPoint ersetzt: Fortschrittsleiste mit Kapiteln, Timer,
// Sprechernotizen (N), Folienübersicht (O), Vollbild (F) und Referentenansicht im zweiten Fenster (V).
import { Presentation } from './presentation.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const clock = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export class Deck {
  constructor(root, presentation, { toast = () => {} } = {}) {
    this.p = presentation;
    this.toast = toast;
    root.insertAdjacentHTML(
      'beforeend',
      `<nav id="deck-bar" hidden aria-label="Präsentation">
         <button class="db-btn" data-d="prev" title="Zurück (← / Bild ↑)">‹</button>
         <div class="db-track"></div>
         <button class="db-btn" data-d="next" title="Weiter (→ / Leertaste / Bild ↓)">›</button>
         <span class="db-count"></span>
         <button class="db-time" data-d="timer" title="Timer (Klick: zurücksetzen)"></button>
         <button class="db-btn db-txt" data-d="kunden" title="Kunden im Laden starten/stoppen (L)">Kunden</button>
         <button class="db-btn db-txt" data-d="notes" title="Sprechernotizen (N)">Notizen</button>
         <button class="db-btn db-txt" data-d="overview" title="Folienübersicht (O)">Übersicht</button>
         <button class="db-btn db-txt" data-d="referent" title="Referentenansicht im zweiten Fenster (V)">Referent</button>
         <button class="db-btn" data-d="full" title="Vollbild (F)">⛶</button>
         <button class="db-btn" data-d="end" title="Präsentation beenden (Esc)">✕</button>
       </nav>
       <aside id="deck-notes" hidden aria-live="polite"><div class="dn-text"></div><div class="dn-next"></div></aside>
       <div id="deck-overview" hidden role="dialog" aria-label="Folienübersicht"><div class="do-box"></div></div>`,
    );
    this.bar = root.querySelector('#deck-bar');
    this.track = this.bar.querySelector('.db-track');
    this.count = this.bar.querySelector('.db-count');
    this.time = this.bar.querySelector('.db-time');
    this.notes = root.querySelector('#deck-notes');
    this.overview = root.querySelector('#deck-overview');
    this.notesOn = false;
    this.kundenBtn = this.bar.querySelector('[data-d="kunden"]');
    this.ref = null; // Fenster der Referentenansicht

    // Kapitel-Leiste: je Folie ein Punkt, Kapitel als Gruppe
    this.track.innerHTML = this.p.kapitel
      .map(
        (k) =>
          `<div class="db-kap${k.anhang ? ' db-anhang' : ''}" style="flex-grow:${k.bis - k.von + 1}"><span class="db-kt">${esc(k.titel)}</span><div class="db-dots">${this.p.slides
            .slice(k.von, k.bis + 1)
            .map((sl, j) => `<i data-i="${k.von + j}" class="${sl.typ === 'station' ? 'st' : ''}" title="${k.von + j + 1} · ${esc(Presentation.title(sl))}"></i>`)
            .join('')}</div></div>`,
      )
      .join('');
    this.dots = [...this.track.querySelectorAll('i')];

    this.bar.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.bar.addEventListener('click', (e) => {
      e.target.closest('button')?.blur(); // Leertaste soll danach nicht den Knopf erneut auslösen
      const dot = e.target.closest('i[data-i]');
      if (dot) return this.p.go(Number(dot.dataset.i));
      const d = e.target.closest('[data-d]')?.dataset.d;
      if (d === 'prev') this.p.prev();
      else if (d === 'next') this.p.next();
      else if (d === 'notes') this.toggleNotes();
      else if (d === 'kunden') this.onKunden?.();
      else if (d === 'overview') this.toggleOverview();
      else if (d === 'referent') this.openReferent();
      else if (d === 'full') this.toggleFullscreen();
      else if (d === 'end') this.onEnd?.();
      else if (d === 'timer') {
        this.p.startedAt = Date.now();
        this.toast('Timer zurückgesetzt', 1200);
        this.tick();
      }
    });
    this.overview.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.overview.addEventListener('click', (e) => {
      const card = e.target.closest('[data-i]');
      if (card) {
        this.toggleOverview(false);
        this.p.go(Number(card.dataset.i));
      } else if (e.target === this.overview) this.toggleOverview(false);
    });

    // Referentenfenster: Befehle empfangen, Stand senden
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.ohk !== 'ref') return;
      if (e.source && e.source !== window) this.ref = e.source;
      if (d.cmd === 'hallo') this.send();
      else if (!this.p.active) this.onStart?.(d.cmd === 'go' ? d.i : 0);
      else if (d.cmd === 'next') this.p.next();
      else if (d.cmd === 'prev') this.p.prev();
      else if (d.cmd === 'go') this.p.go(d.i);
      else if (d.cmd === 'timer') {
        this.p.startedAt = Date.now();
        this.send();
      }
    });
    setInterval(() => this.p.active && this.tick(), 1000);
  }

  get active() {
    return !this.bar.hidden;
  }

  show() {
    this.bar.hidden = false;
    this.notes.hidden = !this.notesOn;
    this.tick();
  }

  hide() {
    this.bar.hidden = true;
    this.notes.hidden = true;
    this.overview.hidden = true;
    this.send();
  }

  update(i) {
    const sl = this.p.slides[i];
    this.dots.forEach((d, j) => {
      d.classList.toggle('cur', j === i);
      d.classList.toggle('done', j < i);
    });
    this.track.querySelectorAll('.db-kap').forEach((el, k) => el.classList.toggle('cur', this.p.kapitel[k].titel === sl.kapitel));
    this.count.textContent = `${i + 1}/${this.p.total}`;
    const next = this.p.slides[i + 1];
    this.notes.querySelector('.dn-text').innerHTML = `<b>${esc(Presentation.title(sl))}</b>${esc(Presentation.notes(sl)) || '<em>Keine Notizen</em>'}`;
    this.notes.querySelector('.dn-next').textContent = next ? `Als Nächstes: ${Presentation.title(next)}` : 'Letzte Folie';
    this.renderOverview();
    this.tick();
    this.send();
  }

  tick() {
    const t = this.p.elapsed;
    this.time.textContent = `⏱ ${clock(t)} / ${clock(this.p.dauer)}`;
    this.time.classList.toggle('warn', t > this.p.dauer - 120 && t <= this.p.dauer);
    this.time.classList.toggle('over', t > this.p.dauer);
  }

  toggleNotes(on = !this.notesOn) {
    this.notesOn = on;
    this.notes.hidden = !on || !this.active;
    this.toast(on ? 'Sprechernotizen eingeblendet (N)' : 'Sprechernotizen ausgeblendet', 1200);
  }

  renderOverview() {
    const cur = this.p.index;
    this.overview.querySelector('.do-box').innerHTML = `<header><h1>Folienübersicht</h1><span>Klick springt zur Folie · O / Esc schließt</span></header>${this.p.kapitel
      .map(
        (k) =>
          `<section><h2>${esc(k.titel)}</h2><div class="do-grid">${this.p.slides
            .slice(k.von, k.bis + 1)
            .map((sl, j) => {
              const i = k.von + j;
              return `<button data-i="${i}" class="${i === cur ? 'cur' : ''} ${sl.typ === 'station' ? 'st' : ''}"><span class="do-nr">${i + 1}</span><small>${esc(sl.typ === 'station' ? `Station ${sl.nr} · ${sl.bezug}` : sl.kicker || (sl.typ === 'einleitung' ? 'Titel' : 'Folie'))}</small><b>${esc(sl.titel)}</b></button>`;
            })
            .join('')}</div></section>`,
      )
      .join('')}`;
  }

  toggleOverview(on = this.overview.hidden) {
    if (on) this.renderOverview();
    this.overview.hidden = !on;
    if (on) this.overview.querySelector('.cur')?.scrollIntoView({ block: 'center' });
    return on;
  }

  get overviewOpen() {
    return !this.overview.hidden;
  }

  toggleFullscreen() {
    const d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else {
        const el = d.documentElement;
        const r = (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
        if (r && r.catch) r.catch(() => this.toast('Vollbild ist hier nicht erlaubt – im Browser F11 nutzen', 2600));
      }
    } catch {
      this.toast('Vollbild ist hier nicht erlaubt – im Browser F11 nutzen', 2600);
    }
  }

  openReferent() {
    const url = `${location.href.split(/[?#]/)[0]}?referent`;
    let w = null;
    try {
      w = window.open(url, 'ohk-referent', 'width=1200,height=760');
    } catch {
      w = null;
    }
    if (!w) {
      this.toggleNotes(true);
      this.toast('Zweites Fenster blockiert – Notizen werden hier eingeblendet', 3000);
      return;
    }
    this.ref = w;
    this.toast('Referentenansicht geöffnet: Fenster auf den eigenen Bildschirm ziehen', 3200);
  }

  send() {
    if (!this.ref || this.ref.closed) return;
    try {
      this.ref.postMessage({ ohk: 'stand', i: this.p.index, aktiv: this.p.active, startedAt: this.p.startedAt }, '*');
    } catch {
      /* Fenster geschlossen */
    }
  }
}

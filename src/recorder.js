// Bildschirmaufnahme direkt aus dem Modell (z. B. für das Kundenweg-Video in der Präsentation).
// Am Computer: Aufnahme des Browser-Tabs über getDisplayMedia – mit allen Einblendungen (Infokarten, Simulationstexte).
// Wo das nicht geht (z. B. iPad): Aufnahme nur der 3D-Ansicht über canvas.captureStream.
// Ergebnis: Video-Datei (MP4, sonst WebM) zum Herunterladen.

function pickMime() {
  const list = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  if (typeof MediaRecorder === 'undefined') return null;
  return list.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

export class Recorder {
  constructor({ canvas, toast, onState }) {
    this.canvas = canvas;
    this.toast = toast;
    this.onState = onState || (() => {});
    this.rec = null;
    this.stream = null;
    this.chunks = [];
    this.startedAt = 0;
    this.mode = null;
    this.badge = document.createElement('div');
    this.badge.id = 'rec-badge';
    this.badge.hidden = true;
    document.body.appendChild(this.badge);
    this.timer = null;
  }

  get active() {
    return !!this.rec;
  }

  toggle() {
    if (this.rec) this.stop();
    else this.start();
  }

  async start() {
    const mime = pickMime();
    if (mime === null) {
      this.toast('Aufnahme wird von diesem Browser nicht unterstützt – bitte die Bildschirmaufnahme des Geräts nutzen', 4000);
      return;
    }
    let stream = null;
    let mode = 'tab';
    const canTab = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && !/iPad|iPhone/.test(navigator.userAgent);
    if (canTab) {
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30, displaySurface: 'browser' },
          audio: true,
          preferCurrentTab: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'exclude',
        });
      } catch (e) {
        if (e && e.name === 'NotAllowedError') {
          this.toast('Aufnahme abgebrochen', 1600);
          return;
        }
        stream = null;
      }
    }
    if (!stream) {
      if (!this.canvas.captureStream) {
        this.toast('Aufnahme wird hier nicht unterstützt – bitte die Bildschirmaufnahme des Geräts nutzen', 4000);
        return;
      }
      stream = this.canvas.captureStream(30);
      mode = 'canvas';
    }
    this.stream = stream;
    this.mode = mode;
    this.chunks = [];
    try {
      this.rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined);
    } catch {
      this.rec = new MediaRecorder(stream);
    }
    this.rec.ondataavailable = (e) => e.data && e.data.size && this.chunks.push(e.data);
    this.rec.onstop = () => this.save();
    // Aufnahme endet auch, wenn man im Browser auf „Freigabe beenden“ klickt
    stream.getVideoTracks().forEach((t) => t.addEventListener('ended', () => this.stop()));
    this.rec.start(1000);
    this.startedAt = performance.now();
    document.body.classList.toggle('recording-tab', mode === 'tab');
    document.body.classList.add('recording');
    this.badge.hidden = false;
    this.tick();
    this.timer = setInterval(() => this.tick(), 500);
    this.onState(true);
    if (mode === 'canvas') this.toast('Aufnahme läuft (nur 3D-Ansicht) – zum Beenden erneut auf Aufnahme tippen', 2600);
  }

  tick() {
    const s = Math.floor((performance.now() - this.startedAt) / 1000);
    this.badge.textContent = `● REC ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  stop() {
    if (!this.rec) return;
    const r = this.rec;
    this.rec = null;
    if (r.state !== 'inactive') r.stop();
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    clearInterval(this.timer);
    this.badge.hidden = true;
    document.body.classList.remove('recording', 'recording-tab');
    this.onState(false);
  }

  save() {
    if (!this.chunks.length) return;
    const type = this.chunks[0].type || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(this.chunks, { type });
    this.chunks = [];
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    a.href = url;
    a.download = `one-hour-kitchen_aufnahme_${stamp}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    this.toast(`Aufnahme gespeichert (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1)} MB) – liegt in den Downloads`, 4000);
  }
}

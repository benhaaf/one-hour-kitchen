// Baut die App als EINE HTML-Datei (läuft per Doppelklick, offline, ohne Server):
//   bun scripts/build.mjs            → dist/index.html  (+ Kopie dist/one-hour-kitchen.html)
// three.js liegt lokal in vendor/three (kein npm nötig).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const vendor = join(root, 'vendor/three');

const threeAlias = {
  name: 'three-alias',
  setup(build) {
    build.onResolve({ filter: /^three$/ }, () => ({ path: join(vendor, 'three.module.js') }));
    build.onResolve({ filter: /^three\/(examples\/jsm|addons)\// }, (a) => ({
      path: join(vendor, 'addons', a.path.replace(/^three\/(examples\/jsm|addons)\//, '')),
    }));
  },
};

const res = await Bun.build({
  entrypoints: [join(root, 'src/main.js')],
  plugins: [threeAlias],
  minify: true,
  target: 'browser',
  format: 'esm',
});
if (!res.success) {
  for (const l of res.logs) console.error(l);
  process.exit(1);
}
const js = (await res.outputs.find((o) => o.kind === 'entry-point').text()).replace(/<\/script/gi, '<\\/script');
const css = readFileSync(join(root, 'src/style.css'), 'utf8');
let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html.replace('<!--CSS-->', () => `<style>${css}</style>`).replace('<!--JS-->', () => `<script type="module">${js}</script>`);
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/index.html'), html);
writeFileSync(join(root, 'dist/one-hour-kitchen.html'), html);
// Variante ohne Dokument-Gerüst (für die Veröffentlichung als Artifact)
const frag = `<title>One Hour Kitchen</title>\n<style>${css}</style>\n<div id="app"></div>\n<script type="module">${js}</script>\n`;
writeFileSync(join(root, 'dist/artifact.html'), frag);
console.log(`dist/index.html geschrieben (${Math.round(html.length / 1024)} KB)`);

// Baut eine Testbühne: bun scripts/test/build-test.mjs people → dist-test/people.html
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root = resolve(import.meta.dir, '../..');
const vendor = join(root, 'vendor/three');
const name = process.argv[2] || 'people';
const res = await Bun.build({
  entrypoints: [join(root, `scripts/test/${name}-entry.js`)], minify: false, target: 'browser', format: 'esm',
  plugins: [{ name: 'a', setup(b) {
    b.onResolve({ filter: /^three$/ }, () => ({ path: join(vendor, 'three.module.js') }));
    b.onResolve({ filter: /^three\/(examples\/jsm|addons)\// }, (a) => ({ path: join(vendor, 'addons', a.path.replace(/^three\/(examples\/jsm|addons)\//, '')) }));
  } }],
});
if (!res.success) { console.error(res.logs); process.exit(1); }
const js = await res.outputs[0].text();
mkdirSync(join(root, 'dist-test'), { recursive: true });
writeFileSync(join(root, `dist-test/${name}.html`), `<!doctype html><meta charset="utf-8"><style>body{margin:0;overflow:hidden}</style><script type="module">${js.replace(/<\/script/g, '<\\/script')}</script>`);
console.log('ok');

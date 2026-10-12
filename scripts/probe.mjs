import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => console.log('console', m.type(), m.text().slice(0, 200)));
await page.goto('file://' + process.cwd() + '/dist/index.html?debug&pos=7.1,0.6,0');
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const r = window.rille; if (!r) return 'kein window.rille';
  let tris = 0, inst = 0, meshes = 0; const big = [];
  r.scene.traverse((o) => { if (o.isMesh) { meshes++; const g = o.geometry; const n = (g.index ? g.index.count : g.attributes.position.count) / 3; const c = o.isInstancedMesh ? o.count : 1; tris += n * c; if (o.isInstancedMesh) { inst += c; if (n*c > 50000) big.push(o.name + ' ' + c + 'x' + n); } else if (n > 50000) big.push(o.name + ' ' + n); } });
  return { meshes, inst, tris: Math.round(tris), big, calls: r.renderer.info.render.calls };
});
console.log(JSON.stringify(info));
await browser.close();

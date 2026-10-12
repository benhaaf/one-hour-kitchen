// Screenshots mehrerer Präsentationsschritte: node scripts/slides.mjs outdir 0,4,7 [w h]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [,, out, list, w = '1280', h = '760'] = process.argv;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('console', m.text().slice(0, 300)));
await page.goto('file://' + process.cwd() + '/dist/index.html?debug');
await page.waitForTimeout(2500);
await page.evaluate(() => window.rille.bus.emit('praesentation'));
for (const i of list.split(',').map(Number)) {
  await page.evaluate((i) => { const p = window.rille.presentation; p.go(i); if (p.flight) p.flight.t = 0.999; }, i);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/slide-${String(i).padStart(2, '0')}.png`, timeout: 120000 });
  console.log('ok', i);
}
await browser.close();

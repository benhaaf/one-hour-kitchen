import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [,, out, from = '0', to = '99'] = process.argv;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('file:///home/claude/one-hour-kitchen/dist/index.html?debug');
await page.waitForTimeout(3000);
await page.evaluate(() => window.rille.bus.emit('praesentation'));
await page.addStyleTag({ content: '#app > *:not(canvas){visibility:hidden !important}' });
const total = await page.evaluate(() => window.rille.presentation.total);
for (let i = +from; i < Math.min(total, +to + 1); i++) {
  await page.evaluate((i) => { const p = window.rille.presentation; p.go(i); if (p.flight) p.flight.t = 0.999; }, i);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/s${String(i).padStart(2, '0')}.png`, timeout: 180000 });
  console.log('ok', i);
}
await browser.close();

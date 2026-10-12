import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1180, height: 760 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('file://' + process.cwd() + '/dist/index.html?debug&pos=6.5,2.1,0');
await page.waitForTimeout(3000);
const st = await page.evaluate(() => { const t = window.rille.shop.target(6.5, 2.1); return t && t.label; });
console.log('Ziel am Dashboard:', st);
await page.evaluate(() => window.rille.bus.emit('info'));
await page.waitForTimeout(1500);
await page.screenshot({ path: out + '/shop-pick.png', timeout: 120000 });
await page.evaluate(() => { const s = window.rille.shop; s.sel = 5; s.choose(); });
const items = await page.evaluate(() => window.rille.shop.items.map((i) => [i.name, i.code, i.loc && i.loc.p.map((v) => +v.toFixed(2))]));
console.log(JSON.stringify(items));
// zur ersten Zutat teleportieren und Screenshot
await page.evaluate(() => { const r = window.rille; const it = r.shop.items[1]; r.player.x = it.loc.p[0]; r.player.z = it.loc.p[1]; r.player.yaw = Math.atan2(it.loc.ziel[0] - it.loc.p[0], it.loc.ziel[1] - it.loc.p[1]); r.player.pitch = -0.15; r.player.apply(); });
await page.waitForTimeout(4000);
await page.screenshot({ path: out + '/shop-walk.png', timeout: 120000 });
// alles einsammeln, zur Kasse, bezahlen
const res = await page.evaluate(() => { const r = window.rille; const s = r.shop; for (const it of s.items) { if (!it.done && it.loc) { const t = s.target(it.loc.p[0], it.loc.p[1]); if (t) t.act(); } } const [kx, kz] = s.kassen[0]; const t = s.target(kx, kz); const lbl = t && t.label; if (t) t.act(); return [lbl, s.state]; });
console.log(JSON.stringify(res));
await page.waitForTimeout(1500);
await page.screenshot({ path: out + '/shop-bon.png', timeout: 120000 });
await browser.close();

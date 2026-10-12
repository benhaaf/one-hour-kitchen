// Screenshot-Test: node scripts/shot.mjs "<query>" out.png [w h] [js-after-load]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [,, query = '', out = 'shot.png', w = '1280', h = '800', js = ''] = process.argv;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
await page.goto('file://' + process.cwd() + '/dist/index.html' + query);
await page.waitForTimeout(2500);
if (js) { await page.evaluate(js); await page.waitForTimeout(+(process.env.WAIT || 9000)); }
await page.screenshot({ path: out, timeout: 120000 });
console.log(errs.slice(0, 15).join('\n') || 'keine Fehler');
await browser.close();

// Screenshot the game screen at several places. Usage: node tools/maps.mjs outdir [map,x,y,dir ...]
import { launch, newPage, BASE } from './browser.mjs';
const [, , OUT, ...spots] = process.argv;
const browser = await launch();
const page = await newPage(browser);
await page.emulate({
  viewport: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  localStorage.setItem('palabritas.save.v1', JSON.stringify({ v: 1, name: 'Ana', map: 'amanecer', x: 9, y: 7, dir: 'down', party: [], flags: { starter: true }, settings: { textScale: 6, dialogVoice: false, slowVoice: false } }));
});
await page.reload({ waitUntil: 'networkidle0' });
await sleep(300);
await page.mouse.click(200, 200);
await sleep(300);
await page.keyboard.press('z'); // CONTINUAR
await sleep(800);
const box = await page.evaluate(() => {
  const r = document.getElementById('screen').getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
for (const spot of spots) {
  const [map, x, y, dir] = spot.split(',');
  await page.evaluate((a) => window.__game.loadMap(a[0], +a[1], +a[2], a[3] || 'down'), [map, x, y, dir]);
  await sleep(250);
  await page.evaluate(() => document.querySelectorAll('.banner').forEach((b) => b.remove()));
  await page.screenshot({ path: `${OUT}/${spot.replace(/,/g, '_')}.png`, clip: box });
}
console.log('errors:', errors.join('\n') || 'none');
await browser.close();

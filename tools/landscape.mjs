// Landscape (GBA) layout check, silent. Usage: node tools/landscape.mjs outdir
import { launch, newPage, BASE } from './browser.mjs';
const OUT = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const phone = (w, h) => page.emulate({
  viewport: { width: w, height: h, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, isLandscape: w > h },
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',
});
await phone(915, 412);
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  localStorage.setItem('palabritas.save.v1', JSON.stringify({ v: 1, name: 'Ana', map: 'ruta1', x: 4, y: 9, dir: 'down',
    party: [{ uid: 'a', sp: 'gotita', level: 3, hp: 20 }], flags: { starter: true, metCeiba: true },
    settings: { textScale: 6, dialogVoice: false, slowVoice: false } }));
});
await page.reload({ waitUntil: 'networkidle0' });
await sleep(300);
await page.mouse.click(450, 200);
await sleep(300);
await page.keyboard.press('z');
await sleep(900);
await page.screenshot({ path: `${OUT}/land-world.png` });
// D-pad works in landscape: tap right side of the d-pad
const pad = await page.evaluate(() => { const r = document.getElementById('dpad').getBoundingClientRect(); return { x: r.x + r.width * 0.85, y: r.y + r.height / 2 }; });
const before = await page.evaluate(() => window.__game.player.x);
await page.touchscreen.touchStart(pad.x, pad.y);
await sleep(400);
await page.touchscreen.touchEnd();
await sleep(300);
console.log('dpad moved player:', before, '->', await page.evaluate(() => window.__game.player.x));
// Battle -> challenge
await page.evaluate(() => { window.__game.runScript(window.__game.SCRIPTS.__wild, { data: { sp: 'conejito', level: 2 } }); });
for (let i = 0; i < 40; i++) {
  const s = await page.evaluate(() => ({ ch: !document.getElementById('challenge').hidden, menu: [...document.querySelectorAll('.menu .opt')].map((o) => o.textContent) }));
  if (s.ch) break;
  if (s.menu.includes('LUCHAR')) await page.evaluate(() => [...document.querySelectorAll('.menu .opt')].find((o) => o.textContent === 'LUCHAR').click());
  else if (s.menu.some((m) => m.includes('Remolino'))) await page.evaluate(() => [...document.querySelectorAll('.menu .opt')].find((o) => o.textContent.includes('Remolino')).click());
  else await page.keyboard.press('z');
  await sleep(250);
}
await sleep(300);
await page.screenshot({ path: `${OUT}/land-challenge.png` });
// Back to portrait: make sure it re-lays out
await phone(412, 915);
await sleep(600);
await page.screenshot({ path: `${OUT}/portrait-after.png` });
console.log('errors:', errors.join('\n') || 'none');
await browser.close();

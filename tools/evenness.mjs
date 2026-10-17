// While walking, record how far the camera moves each frame (silent). Even = smooth.
import { launch, newPage, BASE } from './browser.mjs';
const browser = await launch();
const page = await newPage(browser);
await page.emulate({ viewport: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  const { newSave } = await import('/src/game/state.ts');
  const save = Object.assign(newSave(), { name: 'Test', map: 'limon', x: 11, y: 16, dir: 'up' });
  Object.assign(save.flags, { starter: true });
  localStorage.setItem('palabritas.save.v1', JSON.stringify(save));
});
await page.reload({ waitUntil: 'networkidle0' });
await page.mouse.click(200, 200);
await sleep(300);
await page.keyboard.press('z');
await sleep(1500);
await page.evaluate(() => {
  // The first tile drawn each frame tells where the camera is (mod 16).
  window.__ys = [];
  const orig = CanvasRenderingContext2D.prototype.drawImage;
  let frame = -1;
  const loop = () => { frame++; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  let seen = -1;
  CanvasRenderingContext2D.prototype.drawImage = function (...a) {
    if (frame !== seen && a.length === 3) { seen = frame; window.__ys.push(a[2]); }
    return orig.apply(this, a);
  };
});
await page.keyboard.down('ArrowUp');
await sleep(1500);
await page.keyboard.up('ArrowUp');
const ys = await page.evaluate(() => window.__ys);
const d = ys.slice(1).map((y, i) => +(((y - ys[i]) % 16 + 16) % 16).toFixed(3)).slice(10, 60);
const counts = {};
for (const v of d) counts[v] = (counts[v] || 0) + 1;
console.log('camera move per frame (game px):', JSON.stringify(counts));
await browser.close();

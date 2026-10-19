// How long does drawing one overworld frame take, by day and at night (lit windows)? (silent)
// Usage: node tools/perf.mjs
import { launch, newPage, BASE } from './browser.mjs';
const browser = await launch();
const page = await newPage(browser);
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__game);
const r = await page.evaluate(async () => {
  const w = window.__game;
  const { ctx } = await import('/src/engine/screen.ts');
  const time = (map, x, y, hour) => {
    window.__hour = hour;
    w.loadMap(map, x, y, 'up');
    const t0 = performance.now();
    w.renderWorld(ctx); // first frame: paints any new tile types
    const first = performance.now() - t0;
    const t1 = performance.now();
    for (let i = 0; i < 600; i++) w.renderWorld(ctx);
    return { firstFrameMs: +first.toFixed(2), avgFrameMs: +((performance.now() - t1) / 600).toFixed(3) };
  };
  const out = { limonDay: time('limon', 11, 1, 12), careyDay: time('carey', 14, 16, 12), careyNight: time('carey', 14, 16, 23) };
  delete window.__hour;
  return out;
});
console.log(JSON.stringify(r));
await browser.close();

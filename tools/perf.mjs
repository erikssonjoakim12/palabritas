// How long does drawing one overworld frame take? (silent)
import { launch, newPage, BASE } from './browser.mjs';
const browser = await launch();
const page = await newPage(browser);
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
const r = await page.evaluate(async () => {
  const w = window.__game;
  const { ctx } = await import('/src/engine/screen.ts');
  w.loadMap('limon', 11, 1, 'up');
  const t0 = performance.now();
  w.renderWorld(ctx); // first frame: paints any new tile types
  const first = performance.now() - t0;
  const t1 = performance.now();
  for (let i = 0; i < 600; i++) w.renderWorld(ctx);
  return { firstFrameMs: first.toFixed(2), avgFrameMs: ((performance.now() - t1) / 600).toFixed(3) };
});
console.log(JSON.stringify(r));
await browser.close();

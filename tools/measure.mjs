// Measure a big "pixel art" image: sprite bounds per half and the block size (silent).
import { launch, newPage, readPng } from './browser.mjs';
const file = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
const { width, height, data: d } = await readPng(page, file);
await browser.close();
const at = (x, y) => { const i = (y * width + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
const isBg = ([r, gg, b, a = 255]) => a < 128 || (r > 225 && gg > 225 && b > 225);
const halves = [[0, width / 2], [width / 2, width]].map(([a, b]) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = Math.floor(a); x < b; x++) if (!isBg(at(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
});
// Block size: lengths of runs of near-identical color along some rows through the left sprite.
const runs = {};
const h = halves[0];
for (let y = h.y0; y < h.y1; y += 7) {
  let run = 1, prev = at(h.x0, y);
  for (let x = h.x0 + 1; x <= h.x1; x++) {
    const p = at(x, y);
    if (Math.abs(p[0] - prev[0]) + Math.abs(p[1] - prev[1]) + Math.abs(p[2] - prev[2]) < 30) run++;
    else { if (run >= 6 && run <= 40) runs[run] = (runs[run] || 0) + 1; run = 1; }
    prev = p;
  }
}
const out = { size: [width, height], halves, runs: Object.entries(runs).sort((a, b) => b[1] - a[1]).slice(0, 12) };
console.log(JSON.stringify(out));

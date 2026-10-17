// Measure a big "pixel art" image: sprite bounds per half and the block size (silent).
import { launch, newPage } from './browser.mjs';
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const url = 'data:image/png;base64,' + readFileSync(file).toString('base64');
const browser = await launch();
const page = await newPage(browser);
const out = await page.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
  const isBg = ([r, gg, b, a = 255]) => a < 128 || (r > 225 && gg > 225 && b > 225);
  const halves = [[0, c.width / 2], [c.width / 2, c.width]].map(([a, b]) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = Math.floor(a); x < b; x++) if (!isBg(at(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
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
  return { size: [c.width, c.height], halves, runs: Object.entries(runs).sort((a, b) => b[1] - a[1]).slice(0, 12) };
}, url);
console.log(JSON.stringify(out));
await browser.close();

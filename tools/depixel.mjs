// Turn big AI "pixel art" back into real pixels (silent).
// Usage: node tools/depixel.mjs in.png out.json [cell=12.45]
// Samples the middle of every block of each half (front, back), snaps similar colors together,
// makes the white background transparent, and writes { front: {w,h,rows,pal}, back: ... }.
import { launch, newPage } from './browser.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [, , file, out, cellArg] = process.argv;
const url = 'data:image/png;base64,' + readFileSync(file).toString('base64');
const browser = await launch();
const page = await newPage(browser);
const res = await page.evaluate(async (url, cell) => {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => { const i = (Math.round(y) * c.width + Math.round(x)) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
  // Transparent background if the image has one; otherwise white is the background.
  let hasAlpha = false;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 128) { hasAlpha = true; break; }
  const isBg = ([r, gg, b, a = 255]) => (hasAlpha ? a < 128 : r > 225 && gg > 225 && b > 225);
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const half = (a, b) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = Math.floor(a); x < b; x++) if (!isBg(at(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const w = Math.round((x1 - x0 + 1) / cell), h = Math.round((y1 - y0 + 1) / cell);
    const sx = (x1 - x0 + 1) / w, sy = (y1 - y0 + 1) / h;
    const grid = [];
    for (let j = 0; j < h; j++) {
      const row = [];
      for (let i = 0; i < w; i++) {
        // average a small patch in the middle of the block (AI images are a bit noisy)
        let acc = [0, 0, 0, 0], n = 0;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const p = at(x0 + (i + 0.5) * sx + dx, y0 + (j + 0.5) * sy + dy); acc = acc.map((v, k) => v + p[k]); n++; }
        const p = acc.map((v) => v / n);
        row.push(isBg(p) ? null : p);
      }
      grid.push(row);
    }
    return { w, h, grid };
  };
  const halves = { front: half(0, c.width / 2), back: half(c.width / 2, c.width) };
  // Shared palette: greedy clustering of all colors.
  const pal = [];
  for (const hf of Object.values(halves)) for (const row of hf.grid) for (const p of row) {
    if (!p) continue;
    const near = pal.find((q) => dist(q.c, p) < 34);
    if (near) { near.sum = near.sum.map((v, k) => v + p[k]); near.n++; near.c = near.sum.map((v) => v / near.n); }
    else pal.push({ c: p, sum: [...p], n: 1 });
  }
  pal.sort((a, b) => b.n - a.n);
  const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const hex = (p) => '#' + p.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const palette = Object.fromEntries(pal.map((q, i) => [keys[i], hex(q.c)]));
  const toRows = (hf) => hf.grid.map((row) => row.map((p) => {
    if (!p) return '.';
    let best = 0;
    pal.forEach((q, i) => { if (dist(q.c, p) < dist(pal[best].c, p)) best = i; });
    return keys[best];
  }).join(''));
  return { palette, counts: pal.map((q) => q.n), front: { w: halves.front.w, h: halves.front.h, rows: toRows(halves.front) }, back: { w: halves.back.w, h: halves.back.h, rows: toRows(halves.back) } };
}, url, +(cellArg || 12.45));
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('front', res.front.w, 'x', res.front.h, 'back', res.back.w, 'x', res.back.h, 'colors', Object.keys(res.palette).length);
console.log(res.counts.join(' '));
await browser.close();

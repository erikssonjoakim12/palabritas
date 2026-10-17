// Read pixel-art PNGs (one image pixel = one sprite pixel) and print a style/palabritas.ts
// entry. Pixel positions are kept exactly; transparent (alpha < 128) becomes '.'.
// Smoothed images have hundreds of in-between shades, so colors are grouped into K colors
// (k-means), one palette shared by both views. Silent.
// Usage: [K=24] node tools/exact.mjs id front.png back.png
import { launch, newPage } from './browser.mjs';
import { readFileSync } from 'node:fs';
const [, , id, ...files] = process.argv;
const K = +(process.env.K || 24);
const urls = files.map((f) => 'data:image/png;base64,' + readFileSync(f).toString('base64'));
const browser = await launch();
const page = await newPage(browser);
const views = await page.evaluate(async (urls) => {
  const out = [];
  for (const url of urls) {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const grid = [];
    for (let y = 0; y < c.height; y++) {
      const row = [];
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        row.push(d[i + 3] < 128 ? null : [d[i], d[i + 1], d[i + 2]]);
      }
      grid.push(row);
    }
    out.push({ w: c.width, h: c.height, grid });
  }
  return out;
}, urls);
await browser.close();

const px = views.flatMap((v) => v.grid.flat().filter(Boolean));
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
// Start from far-apart colors, then k-means.
let cent = [px[0]];
while (cent.length < K) {
  let best = px[0];
  let bd = -1;
  for (const p of px) {
    const dd = Math.min(...cent.map((c) => d2(c, p)));
    if (dd > bd) [bd, best] = [dd, p];
  }
  cent.push(best);
}
const nearest = (p) => cent.reduce((bi, c, i) => (d2(c, p) < d2(cent[bi], p) ? i : bi), 0);
for (let it = 0; it < 30; it++) {
  const sum = cent.map(() => [0, 0, 0, 0]);
  for (const p of px) {
    const s = sum[nearest(p)];
    s[0] += p[0];
    s[1] += p[1];
    s[2] += p[2];
    s[3]++;
  }
  cent = cent.map((c, i) => (sum[i][3] ? sum[i].slice(0, 3).map((v) => v / sum[i][3]) : c));
}
const usage = cent.map(() => 0);
for (const p of px) usage[nearest(p)]++;
const order = cent.map((_, i) => i).filter((i) => usage[i]).sort((a, b) => usage[b] - usage[a]);
const KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const keyOf = Object.fromEntries(order.map((ci, n) => [ci, KEYS[n]]));
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const bounds = (v) => {
  let top = v.h;
  let bottom = -1;
  v.grid.forEach((r, y) => {
    if (r.some(Boolean)) {
      top = Math.min(top, y);
      bottom = y;
    }
  });
  return `${top}-${bottom}`;
};
console.error(`${id}: ${views.map((v) => `${v.w}x${v.h} rows ${bounds(v)}`).join(', ')}, ${new Set(px.map(String)).size} colors -> ${order.length}`);
const pal = order.map((ci, n) => `${KEYS[n]}: '${hex(cent[ci])}'`).join(', ');
const lines = [`  ${id}: {`, `    pal: { ${pal} },`];
['front', 'back'].forEach((name, i) => {
  lines.push(`    ${name}: [`);
  for (const r of views[i].grid) lines.push(`      '${r.map((p) => (p ? keyOf[nearest(p)] : '.')).join('')}',`);
  lines.push('    ],');
});
lines.push('  },');
console.log(lines.join('\n'));

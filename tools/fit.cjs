// Clean a depixelated sprite and fit it to a height, then print it as a TypeScript art entry.
// Usage: node tools/fit.cjs agu.json id height [colorMerge=52]
const fs = require('fs');
const [, , file, id, H, MERGE = 52] = process.argv;
const src = JSON.parse(fs.readFileSync(file, 'utf8'));
const hex2 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const pal = Object.fromEntries(Object.entries(src.palette).map(([k, v]) => [k, hex2(v)]));
const sat = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);
const lum = ([r, g, b]) => (r + g + b) / 3;
const isInk = (c) => lum(c) < 40;

function clean(rows) {
  let g = rows.map((r) => [...r].map((k) => (k === '.' ? null : pal[k])));
  const h = g.length, w = g[0].length;
  const open = (x, y) => x < 0 || y < 0 || x >= w || y >= h || !g[y][x];
  // 1. gray anti-aliasing halo around the outline -> transparent (repeat: it can be 2 px)
  for (let pass = 0; pass < 3; pass++) {
    const next = g.map((r) => [...r]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = g[y][x];
      if (c && sat(c) < 22 && lum(c) > 40 && (open(x - 1, y) || open(x + 1, y) || open(x, y - 1) || open(x, y + 1))) next[y][x] = null;
    }
    g = next;
  }
  // 2. the outer outline (ink touching the outside) -> transparent; it's redrawn after scaling
  for (let pass = 0; pass < 2; pass++) {
    const next = g.map((r) => [...r]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = g[y][x];
      if (c && isInk(c) && (open(x - 1, y) || open(x + 1, y) || open(x, y - 1) || open(x, y + 1))) next[y][x] = null;
    }
    g = next;
  }
  return g;
}

function fit(g, th) {
  // crop to content
  const h = g.length, w = g[0].length;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  g.forEach((r, y) => r.forEach((c, x) => { if (c) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }));
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const inner = th - 2; // leave room for the new outline
  const s = inner / ch;
  const tw = Math.round(cw * s);
  const out = [];
  for (let y = 0; y < inner; y++) {
    const row = [];
    for (let x = 0; x < tw; x++) row.push(g[y0 + Math.min(ch - 1, Math.floor((y + 0.5) / s))][x0 + Math.min(cw - 1, Math.floor((x + 0.5) / s))]);
    out.push(row);
  }
  // pad 1 px for the outline, then draw it
  const W = tw + 2, Hh = inner + 2;
  const p = Array.from({ length: Hh }, (_, y) => Array.from({ length: W }, (_, x) => (y > 0 && x > 0 && y <= inner && x <= tw ? out[y - 1][x - 1] : null)));
  const ink = [16, 20, 16];
  const add = [];
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (p[y][x]) continue;
    if ((p[y][x - 1]) || (p[y][x + 1]) || (p[y - 1] && p[y - 1][x]) || (p[y + 1] && p[y + 1][x])) add.push([x, y]);
  }
  add.forEach(([x, y]) => (p[y][x] = ink));
  return p;
}

// Merge colors into a small palette (greedy, by distance), shared by front and back.
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const views = { front: fit(clean(src.front.rows), +H), back: fit(clean(src.back.rows), +H) };
const counts = new Map();
for (const v of Object.values(views)) for (const r of v) for (const c of r) if (c) counts.set(c.join(), (counts.get(c.join()) || 0) + 1);
const cols = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k.split(',').map(Number));
const palette = [];
for (const c of cols) if (!palette.some((q) => dist(q, c) < +MERGE)) palette.push(c);
const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const keyOf = (c) => { let b = 0; palette.forEach((q, i) => { if (dist(q, c) < dist(palette[b], c)) b = i; }); return keys[b]; };
const rows = (v) => v.map((r) => r.map((c) => (c ? keyOf(c) : '.')).join(''));
const outPal = Object.fromEntries(palette.map((c, i) => [keys[i], hex(c)]));
console.log(`  ${id}: {\n    pal: ${JSON.stringify(outPal).replace(/"/g, "'").replace(/,/g, ', ').replace(/:/g, ': ')},`);
for (const view of ['front', 'back']) {
  console.log(`    ${view}: [`);
  for (const r of rows(views[view])) console.log(`      '${r}',`);
  console.log('    ],');
}
console.log('  },');
console.error(`front ${views.front[0].length}x${views.front.length}, back ${views.back[0].length}x${views.back.length}, ${palette.length} colors`);

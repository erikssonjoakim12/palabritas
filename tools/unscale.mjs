// Shrink upscaled pixel art back to one pixel per sprite pixel (silent): samples the middle of
// each cell; the background (the top-left pixel's color) becomes transparent.
// Usage: node tools/unscale.mjs in.png out.png cell
import { launch, newPage } from './browser.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [, , inp, out, cellArg] = process.argv;
const url = 'data:image/png;base64,' + readFileSync(inp).toString('base64');
const browser = await launch();
const page = await newPage(browser);
const b64 = await page.evaluate(async (url, cell) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const bg = at(0, 0);
  const w = Math.round(img.width / cell), h = Math.round(img.height / cell);
  const o = document.createElement('canvas');
  o.width = w;
  o.height = h;
  const og = o.getContext('2d');
  const od = og.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = at(Math.floor((x + 0.5) * cell), Math.floor((y + 0.5) * cell));
      const isBg = Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) < 24;
      const i = (y * w + x) * 4;
      [od.data[i], od.data[i + 1], od.data[i + 2]] = p;
      od.data[i + 3] = isBg ? 0 : 255;
    }
  og.putImageData(od, 0, 0);
  return o.toDataURL('image/png').split(',')[1];
}, url, +cellArg);
writeFileSync(out, Buffer.from(b64, 'base64'));
await browser.close();

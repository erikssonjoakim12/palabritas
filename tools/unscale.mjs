// Shrink upscaled pixel art back to one pixel per sprite pixel (silent): samples the middle of
// each cell; the background (the top-left pixel's color, where it touches the edge) becomes transparent.
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
  const px = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px.push(at(Math.floor((x + 0.5) * cell), Math.floor((y + 0.5) * cell)));
  const nearBg = (p) => Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) < 24;
  // Only background joined to the image's edge goes: a white or pale grey body inside its outline stays.
  const isBg = new Uint8Array(w * h);
  const todo = [];
  for (let x = 0; x < w; x++) todo.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) todo.push(y * w, y * w + w - 1);
  while (todo.length) {
    const j = todo.pop();
    if (isBg[j] || !nearBg(px[j])) continue;
    isBg[j] = 1;
    const x = j % w, y = (j - x) / w;
    if (x > 0) todo.push(j - 1);
    if (x < w - 1) todo.push(j + 1);
    if (y > 0) todo.push(j - w);
    if (y < h - 1) todo.push(j + w);
  }
  for (let j = 0; j < w * h; j++) {
    [od.data[j * 4], od.data[j * 4 + 1], od.data[j * 4 + 2]] = px[j];
    od.data[j * 4 + 3] = isBg[j] ? 0 : 255;
  }
  og.putImageData(od, 0, 0);
  return o.toDataURL('image/png').split(',')[1];
}, url, +cellArg);
writeFileSync(out, Buffer.from(b64, 'base64'));
await browser.close();

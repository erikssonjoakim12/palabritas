// Shrink upscaled pixel art back to one pixel per sprite pixel (silent): samples the middle of
// each cell; the background (the top-left pixel's color, where it touches the edge) becomes transparent.
// Usage: node tools/unscale.mjs in.png out.png cell
import { launch, newPage, readPng, writePng } from './browser.mjs';
const [, , inp, out, cellArg] = process.argv;
const cell = +cellArg;
const browser = await launch();
const page = await newPage(browser);
const img = await readPng(page, inp);
const at = (x, y) => {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
};
const bg = at(0, 0);
const w = Math.round(img.width / cell), h = Math.round(img.height / cell);
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
const data = new Uint8Array(w * h * 4);
for (let j = 0; j < w * h; j++) {
  [data[j * 4], data[j * 4 + 1], data[j * 4 + 2]] = px[j];
  data[j * 4 + 3] = isBg[j] ? 0 : 255;
}
await writePng(page, out, { width: w, height: h, data });
await browser.close();

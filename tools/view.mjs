// Show PNG files side by side, scaled up with crisp pixels (silent). Usage: node tools/view.mjs out.png scale a.png b.png ...
import { launch, newPage } from './browser.mjs';
import { readFileSync } from 'node:fs';
const [, , out, scale, ...files] = process.argv;
const urls = files.map((f) => 'data:image/png;base64,' + readFileSync(f).toString('base64'));
const browser = await launch();
const page = await newPage(browser);
const size = await page.evaluate(async (urls, s) => {
  const imgs = [];
  for (const u of urls) { const i = new Image(); i.src = u; await i.decode(); imgs.push(i); }
  const c = document.createElement('canvas');
  c.width = imgs.reduce((w, i) => w + i.width * s + 16, 16);
  c.height = Math.max(...imgs.map((i) => i.height)) * s + 32;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.fillStyle = '#e8e8e0'; g.fillRect(0, 0, c.width, c.height);
  let x = 16;
  for (const i of imgs) { g.fillStyle = '#ffffff'; g.fillRect(x, 16, i.width * s, i.height * s); g.drawImage(i, x, 16, i.width * s, i.height * s); x += i.width * s + 16; }
  document.body.style.margin = '0'; document.body.appendChild(c);
  return [c.width, c.height];
}, urls, +scale);
await page.setViewport({ width: size[0], height: size[1] });
await page.screenshot({ path: out });
await browser.close();

// Render every character's frames as a big sprite sheet (silent).
import { launch, newPage, BASE } from './browser.mjs';
const OUT = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
await page.setViewport({ width: 1200, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  const { personFrames } = await import('/src/art/chars.ts');
  const { LOOKS } = await import('/src/style/people.ts');
  document.body.innerHTML = '';
  document.body.style.background = '#e8f0e0';
  const s = 5;
  const ids = Object.keys(LOOKS);
  const c = document.createElement('canvas');
  c.width = 9 * 18 * s;
  c.height = ids.length * 18 * s;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  ids.forEach((id, row) => {
    const f = personFrames(id);
    const list = [f.down[0], f.up[0], f.left[0], f.down[1], f.up[1], f.left[1], f.down[2], f.right[0], f.right[1]];
    list.forEach((img, col) => g.drawImage(img, col * 18 * s, row * 18 * s, 16 * s, 16 * s));
  });
  document.body.appendChild(c);
});
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();

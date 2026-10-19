// Render one Palabrita's front and back big (silent). Usage: node tools/zoom.mjs out.png id [scale]
import { launch, newPage, BASE } from './browser.mjs';
const [, , out, id, scale = '6'] = process.argv;
const browser = await launch();
const page = await newPage(browser);
await page.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
const size = await page.evaluate(async ([id, s]) => {
  const { creatureArt } = await import('/src/art/creatures.ts');
  const a = creatureArt(id);
  const c = document.createElement('canvas');
  c.width = (a.front.width + a.back.width + 4) * s; c.height = Math.max(a.front.height, a.back.height) * s;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f8f8f8'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(a.front, 0, 0, a.front.width * s, a.front.height * s);
  g.drawImage(a.back, (a.front.width + 4) * s, 0, a.back.width * s, a.back.height * s);
  document.body.innerHTML = ''; document.body.style.margin = '0'; document.body.appendChild(c);
  return [c.width, c.height];
}, [id, +scale]);
await page.setViewport({ width: size[0], height: size[1] });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: out });
await browser.close();

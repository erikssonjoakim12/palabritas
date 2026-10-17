// Screenshot one section of the art page (silent). Usage: node tools/artclip.mjs out.png "Section title"
import { launch, newPage, BASE } from './browser.mjs';
const [, , out, title] = process.argv;
const browser = await launch();
const page = await newPage(browser);
await page.setViewport({ width: 1100, height: 900 });
await page.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
const clip = await page.evaluate((t) => {
  const h = [...document.querySelectorAll('h2')].find((x) => x.textContent === t);
  let el = h.nextElementSibling; while (el && !el.classList.contains('grid')) el = el.nextElementSibling;
  const a = h.getBoundingClientRect(), b = el.getBoundingClientRect();
  return { x: 0, y: a.top + scrollY, width: 1100, height: b.bottom - a.top };
}, title);
await page.screenshot({ path: out, clip });
await browser.close();

// Save the app icons from art.html into public/ (silent). Usage: node tools/icons.mjs <project dir>
import { launch, newPage, BASE } from './browser.mjs';
import { writeFileSync } from 'node:fs';
const dir = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
await page.waitForSelector('canvas[data-file]');
const files = await page.evaluate(() => [...document.querySelectorAll('canvas[data-file]')].map((c) => [c.dataset.file, c.toDataURL('image/png')]));
for (const [name, url] of files) {
  writeFileSync(`${dir}/public/${name}`, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', name);
}
await browser.close();

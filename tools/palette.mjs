// Save the master palette from the art page as art-src/palette.png and palette.txt (silent).
// Usage: node tools/palette.mjs <project dir>
import { launch, newPage, BASE } from './browser.mjs';
import { writeFileSync } from 'node:fs';
const dir = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
const { png, text } = await page.evaluate(() => ({
  png: document.getElementById('palette').toDataURL('image/png'),
  text: document.getElementById('palette-text').textContent,
}));
writeFileSync(`${dir}/art-src/palette.png`, Buffer.from(png.split(',')[1], 'base64'));
const all = text.split('\n').flatMap((l) => l.split(': ')[1].split(', '));
writeFileSync(`${dir}/art-src/palette.txt`, `Palabritas master palette (${all.length} colors), dark to light per family.\nSource: src/style/colors.ts (PALETTE). Regenerate this file and palette.png after changing it.\n\n${text}\n\nAll colors in one line:\n${all.join(', ')}\n`);
console.log('wrote palette.png and palette.txt,', all.length, 'colors');
await browser.close();

// Screenshot the art review page (silent). Usage: node tools/artpage.mjs out.png
import { launch, newPage, BASE } from './browser.mjs';
const browser = await launch();
const page = await newPage(browser);
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.setViewport({ width: 1100, height: 900 });
await page.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
await page.screenshot({ path: process.argv[2], fullPage: true });
await browser.close();

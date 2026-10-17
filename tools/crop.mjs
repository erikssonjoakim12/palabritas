// Crop part of a PNG (silent). Usage: node tools/crop.mjs in.png out.png x y w h [scale]
import { launch, newPage } from './browser.mjs';
import fs from 'fs';
const [, , inp, out, x, y, w, h, scale = '1'] = process.argv;
const browser = await launch();
const page = await newPage(browser);
const src = 'data:image/png;base64,' + fs.readFileSync(inp).toString('base64');
const k = +scale;
await page.setViewport({ width: +w * k, height: +h * k });
await page.setContent(`<body style="margin:0;overflow:hidden"><img src="${src}" style="position:absolute;left:${-x * k}px;top:${-y * k}px;transform-origin:0 0;transform:scale(${k});image-rendering:pixelated"></body>`);
await page.waitForSelector('img');
await page.evaluate(() => document.querySelector('img').decode());
await page.screenshot({ path: out });
await browser.close();

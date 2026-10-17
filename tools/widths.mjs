// Screenshot the full page at several phone sizes (silent). Usage: node tools/widths.mjs outdir
import { launch, newPage, BASE } from './browser.mjs';
const OUT = process.argv[2];
const browser = await launch();
const page = await newPage(browser);
const sizes = [[360, 780, 3], [384, 832, 2.8125], [412, 915, 2.625], [915, 412, 2.625]];
for (const [w, h, dpr] of sizes) {
  await page.emulate({ viewport: { width: w, height: h, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, isLandscape: w > h },
    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36' });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const clipped = await page.evaluate(() => [...document.querySelectorAll('#pad button, #dpad')].filter((b) => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && (r.left < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight);
  }).map((b) => b.textContent.trim() || b.id));
  console.log(`${w}x${h}: off-screen controls: ${clipped.join(', ') || 'none'}`);
  await page.screenshot({ path: `${OUT}/layout-${w}x${h}.png` });
}
await browser.close();

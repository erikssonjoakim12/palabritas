// Screenshot a wild battle (your Palabrita vs a wild one) at the move menu (silent).
// Usage: node tools/battleshot.mjs out.png mySp wildSp
import { launch, newPage, BASE } from './browser.mjs';
const [, , out, mine = 'aguacatito', wild = 'aguacatito'] = process.argv;
const browser = await launch();
const page = await newPage(browser);
await page.emulate({ viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(async ([mine, wild]) => {
  const state = await import('/src/game/state.ts');
  const M = await import('/src/game/mon.ts');
  const B = await import('/src/battle/battle.ts');
  state.G.save = state.newSave();
  state.G.save.party = [M.newMon(mine, 8)];
  document.querySelector('#overlay').innerHTML = '';
  B.wildBattle(wild, 6);
}, [mine, wild]);
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 300));
  if (await page.evaluate(() => [...document.querySelectorAll('.menu .opt')].some((o) => o.textContent === 'LUCHAR'))) break;
  await page.keyboard.press('z');
}
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 412, height: 400 } });
await browser.close();

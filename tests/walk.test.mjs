// Walking: crossing between maps without a fade (and back), hopping down a ledge (never up), and
// a trainer-like NPC (Sam) who stops you only once.
import { start, sleep } from './lib.mjs';

const t = await start('walk');
const hold = async (key, ms) => {
  await t.page.keyboard.down(key);
  await sleep(ms);
  await t.page.keyboard.up(key);
  await sleep(400);
};

await t.fromSave({ map: 'limon', x: 11, y: 2, dir: 'up', party: [['gotita', 6]], flags: { palabolas: true } });
await hold('ArrowUp', 1100);
t.check('walking north from Villa Limón crosses into Ruta 2', (await t.pos())[0] === 'ruta2', await t.pos());
await t.shot('crossed');
await hold('ArrowDown', 1100);
t.check('and back south into Villa Limón', (await t.pos())[0] === 'limon', await t.pos());

await t.fromSave({ map: 'amanecer', x: 3, y: 7, dir: 'right', party: [['gotita', 6]] });
await hold('ArrowRight', 900);
const landed = await t.game(() => [window.__game.player.x, window.__game.player.y]);
t.check('you hop down the ledge into town', landed[0] >= 7, landed);
await t.warp('amanecer', 6, 7, 'left');
await hold('ArrowLeft', 800);
const below = await t.game(() => [window.__game.player.x, window.__game.player.y]);
t.check("you can't climb back up the ledge", below[0] === 6, below);

// Sam (Pueblo Amanecer) spots you like a trainer, but only the first time.
// He's only there before you meet Profesora Ceiba.
await t.fromSave({ map: 'amanecer', x: 13, y: 12, dir: 'up', flags: { metCeiba: false } });
const freeze = () => t.game(() => { const n = window.__game.npcById('sam'); n.dir = 'down'; n.turnTimer = 99999; });
await freeze();
await t.walk('up', 1);
const spotted = await t.nextText();
await t.play({ choose: (opts) => opts.find((o) => o.startsWith('No')) });
t.check('Sam spots you', spotted.length > 0 || (await t.save()).flags['beat:sam'] === true, spotted);
t.check('and remembers it', (await t.save()).flags['beat:sam'] === true);
await t.warp('amanecer', 13, 12, 'up');
await freeze();
await t.walk('up', 1);
const again = await t.ui();
t.check("Sam doesn't stop you twice", again.lock === 0 && !again.text, again.text);
// The clock: outdoors gets darker (and bluer) at night.
// (the brightness of a screenshot of the page, measured in the page)
const brightness = async () => {
  const png = await t.page.screenshot({ encoding: 'base64' });
  return t.page.evaluate(async (src) => {
    const img = new Image();
    img.src = `data:image/png;base64,${src}`;
    await img.decode();
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let v = 0;
    for (let i = 0; i < d.length; i += 4) v += d[i] + d[i + 1] + d[i + 2];
    return v;
  }, png);
};
await t.warp('limon', 11, 8, 'down');
await t.game(() => (window.__hour = 12));
await sleep(300);
const noon = await brightness();
await t.game(() => (window.__hour = 23));
await sleep(300);
const night = await brightness();
t.check('night outdoors is darker than day', night < noon * 0.85, [noon, night]);
await t.game(() => delete window.__hour);

await t.end();

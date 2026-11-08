// The long way west: the cave's far tunnel brings you out high on Ruta 4 (still walking up) and back,
// and Pintora Lucía spots you on Ruta 4's road. Ruta 9's trail up the river to Ruta 5, and the west side's saves.
import { start } from './lib.mjs';

const t = await start('routes');
await t.fromSave({ map: 'brisa', x: 3, y: 8, dir: 'left', party: [['hamburgueson', 25]], flags: { palabolas: true, medalBrisa: true } });
const noWild = () => t.game(() => { const m = window.__game.currentMap(); if (m.encounters) m.encounters.rate = 0; });
const go = async (map, x, y, dir, steps, label, want) => {
  await t.warp(map, x, y, dir);
  await noWild();
  await t.walk(dir, steps);
  await t.waitIdle();
  const at = await t.pos();
  t.check(label, at[0] === want, at);
};

await go('ruta4', 52, 2, 'up', 1, 'the far end of the cave leads to Ruta 4', 'ruta5');
const arrived = await t.game(() => [window.__game.G.save.x, window.__game.G.save.y, window.__game.player.dir]);
t.check('you come out of the tunnel high on the mountain, still walking up', arrived.join() === '90,4,up', arrived);
await go('ruta5', 90, 4, 'down', 1, 'and the tunnel leads back into the cave', 'ruta4');

// Halfway along Ruta 4's road west, Pintora Lucía (standing on the other lane) spots you.
await t.fromSave({ map: 'ruta5', x: 40, y: 11, dir: 'left', party: [['gotita', 15]] });
await t.walk('left', 6);
const said = await t.nextText();
t.check('Pintora Lucía stops you on the long road', said.includes('pintando'), said);

// Ruta 9 is plain grass for now, closed from Ruta 5 by a thin tree: an old save there starts again on Ruta 5's road, and
// the tree stops you going back in.
await t.fromSave({ map: 'ruta10', x: 2, y: 25, dir: 'up', party: [['gotita', 15]], flags: { ruta9Pasto: false } });
t.check('an old save on Ruta 9 starts on Ruta 5’s road', String(await t.pos()) === 'ruta6,34,29', await t.pos());
await t.walk('right', 3);
t.check('a thin tree closes Ruta 9 from Ruta 5', String(await t.pos()) === 'ruta10,0,2', await t.pos());

// The thin tree north of Ruta 4's road blocks the way to gym 6, until you can cut it.
const r = await t.talk('ruta5', 80, 3, 'up');
t.check('the thin tree on Ruta 4 looks like it could be cut', r.said[0]?.includes('cortar'), r.said);

// A save from before Villa Ocote got shorter stands where it was (the houses south of the plaza moved up 3).
await t.fromSave({ map: 'ocote', x: 10, y: 24, dir: 'down', party: [['gotita', 15]], flags: { oesteCorto: false } });
t.check('an old save in Villa Ocote stands in the same spot', String(await t.pos()) === 'ocote,10,21', await t.pos());
await t.end();

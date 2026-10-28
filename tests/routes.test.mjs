// The long way west: the cave's far tunnel brings you out high on Ruta 4 (still walking up) and back,
// and Pintora Lucía spots you on Ruta 4's road.
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
await t.end();

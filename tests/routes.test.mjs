// West of Ciudad Brisa: into Ruta 3, the cave and its Palacentro, through the cave to Ruta 5 and back.
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

await t.walk('left', 4);
t.check('Ciudad Brisa leads west into Ruta 3', (await t.pos())[0] === 'ruta3', await t.pos());
await go('ruta3', 4, 3, 'up', 1, 'the cave mouth leads into the Cueva del Eco', 'ruta4');
await go('ruta4', 4, 38, 'down', 1, 'its daylight leads back out to Ruta 3', 'ruta3');
await go('ruta3', 11, 6, 'up', 1, 'the Palacentro by the cave opens', 'centro_ruta3');
await go('ruta4', 52, 2, 'up', 1, 'the far end of the cave leads to Ruta 5', 'ruta5');
await t.shot('ruta5');
await go('ruta5', 22, 3, 'up', 1, 'and Ruta 5 leads back into the cave', 'ruta4');
await t.end();

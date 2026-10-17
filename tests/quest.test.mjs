// The Michi quest in Villa Limón (asking in Spanish, a listening quiz), then doors, mats and the
// seamless crossing between maps, and the battle menu.
import { start } from './lib.mjs';

const t = await start('quest');
await t.fromSave({ map: 'casa_lupe', x: 4, y: 3, dir: 'up', party: [['salchichita', 2]] });
const talk = async (map, x, y, dir, opts) => {
  await t.warp(map, x, y, dir);
  await t.press('z');
  return t.play(opts);
};
await talk('casa_lupe', 4, 3, 'up');
await talk('limon', 13, 11, 'up'); // Carmen: ask her about Michi
await talk('panaderia', 3, 3, 'up', { choices: ['Detrás'] }); // Don Pepe: ask, then listen
await talk('limon', 7, 3, 'up'); // Michi
await talk('casa_lupe', 4, 3, 'up'); // Lupe makes Palabolas again
const s = await t.save();
for (const f of ['michiQuest', 'askedCarmen', 'michiLocated', 'michiFound', 'palabolas']) t.check(`quest step: ${f}`, s.flags[f] === true);
t.check('Lupe gave you Palabolas', (s.bag.palabola ?? 0) > 0, s.bag);

await t.warp('ruta1', 9, 1, 'up');
await t.walk('up', 2);
t.check('walking off Ruta 1 leads into Villa Limón', (await t.pos())[0] === 'limon', await t.pos());
await t.warp('limon', 4, 7, 'up');
await t.walk('up', 1);
await t.waitIdle();
t.check('a door leads into the bakery', (await t.pos())[0] === 'panaderia', await t.pos());
await t.walk('down', 1);
await t.waitIdle();
t.check('the mat leads back out', (await t.pos())[0] === 'limon', await t.pos());
await t.warp('amanecer', 14, 2, 'up');
await t.walk('up', 3);
t.check('north of Pueblo Amanecer is Ruta 1', (await t.pos())[0] === 'ruta1', await t.pos());

await t.wild('mariposita', 4);
await t.play({ until: (u) => u.menu.includes('LUCHAR') });
const menu = (await t.ui()).menu;
t.check('the battle menu', ['LUCHAR', 'EQUIPO', 'MOCHILA', 'HUIR'].every((o) => menu.includes(o)), menu);
await t.end();

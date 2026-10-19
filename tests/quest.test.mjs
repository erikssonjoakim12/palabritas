// The Michi quest in Villa Limón: asking in Spanish, a listening quiz, and Lupe's Palabolas.
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

await t.end();

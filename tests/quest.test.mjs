// The Michi quest in Villa Limón: asking in Spanish, a listening quiz, and Lupe's Palabolas; Mr. Ramos's armchair.
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

// Mr. Ramos's armchair: the cushion is Cojincito; after the battle the armchair stays and he sits in it.
// Mordiscón's first move is Water: it hits a ghost (Normal moves don't).
await t.fromSave({ map: 'casa_ramos', x: 1, y: 2, dir: 'up', party: [['mordiscon', 45]], flags: { palabolas: true } });
await t.press('z');
await t.play();
t.check('the cushion was a Palabrita', (await t.save()).flags.sillonDone === true);
const shown = await t.game(() => window.__game.MAPS.casa_ramos.npcs.filter((n) => !n.show || n.show()).map((n) => n.id).join());
t.check('the armchair stays, and Mr. Ramos sits in it', shown === 'sillon_vacio,ramos_sentado', shown);
await t.warp('casa_ramos', 1, 2, 'up');
await t.press('z');
const r = await t.play();
t.check('it’s Mr. Ramos you talk to there', r.said.some((x) => x.includes('sentarme')), r.said);

await t.end();

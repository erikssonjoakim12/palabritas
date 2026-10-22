// Profesora Ceiba's starter training: pick Gotita, answer its first words (the first one wrong),
// stop halfway, find the other balls closed, then finish with Ceiba and get Gotita at level 5; Lucas takes his.
import { start, sleep } from './lib.mjs';

const t = await start('starter');
await t.fromSave({ map: 'lab', x: 3, y: 3, dir: 'up' });
await t.press('z'); // Gotita's ball
let stopped = false;
const first = await t.play({
  right: (n) => n > 0,
  // Say no the first time Ceiba asks whether to go on.
  choose: (opts, text) => (text.includes('Seguimos') && !stopped ? ((stopped = true), opts.find((o) => o.startsWith('No'))) : undefined),
});
let s = await t.save();
t.check('training started with Gotita', s.starterChoice === 'gotita', s.starterChoice);
t.check('no Palabrita yet while training', s.party.length === 0, s.party.length);
t.check('answered some words before stopping', first.answered > 2, first.answered);

await t.warp('lab', 2, 3, 'up');
await t.press('z');
await sleep(500);
const other = await t.ui();
t.check('the other balls are closed for now', other.text.length > 0, other.text);
await t.play();

await t.warp('lab', 6, 3, 'up');
await t.press('z'); // Ceiba
const rest = await t.play();
s = await t.save();
t.check('finished the training', rest.answered > 5, rest.answered);
t.check('Gotita joined at level 5', s.party.length === 1 && s.party[0].sp === 'gotita' && s.party[0].level === 5, s.party.map((m) => [m.sp, m.level]));
t.check('starter flag set and choice cleared', s.flags.starter === true && !s.starterChoice, { starter: s.flags.starter, choice: s.starterChoice });
// Lucas takes the one strong against yours (Aguacatito against Gotita) and runs off; the third stays on the table.
t.check('Lucas takes Aguacatito and leaves', s.flags.lucasEligio && s.flags.lucasSeFue && rest.said.some((x) => x.includes('Aguacatito')), rest.said.slice(-4));
const balls = await t.game(() => window.__game.MAPS.lab.npcs.filter((n) => n.object && n.show()).map((n) => n.id));
t.check('only the third Palabola is left', balls.join() === 'starter_salchichita', balls);
await t.end();

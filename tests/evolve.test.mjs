// Evolution: Salchichita reaches level 16 in the middle of a battle and evolves into Hamburguesón,
// keeping its words.
import { start, sleep } from './lib.mjs';

const t = await start('evolve');
await t.fromSave({ map: 'ruta1', x: 10, y: 20, dir: 'up', party: [['salchichita', 15, { since: 0 }]] });
const before = await t.game(() => {
  const g = window.__game;
  for (const i of g.curriculum.itemsUpTo('salchichita', 15)) g.learning.record(i, 'type', 'perfect', false);
  return g.curriculum.itemsUpTo('salchichita', 16).map((i) => i.id).join(',');
});
await t.game(() => { window.__game.wildBattle('pajarito', 3); });
await sleep(200);
const r = await t.play();
const s = await t.save();
t.check('levels up to 16 mid-battle', r.said.some((x) => x.includes('subió al nivel 16')));
t.check('evolves', r.said.some((x) => x.includes('evolucionó a Hamburguesón')) && s.party[0].sp === 'hamburgueson', s.party[0].sp);
const after = await t.game(() => window.__game.curriculum.itemsUpTo('hamburgueson', 16).map((i) => i.id).join(','));
t.check('keeps the same words', after === before);
t.check('the new form counts as caught', s.caught.includes('hamburgueson'), s.caught);
await t.end();

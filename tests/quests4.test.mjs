// Region 4's side quests (the Torovenado and the legend are in torovenado.test): bargaining for Mom's hammock
// (a rude answer doesn't lower the price), Mom takes it and the sloth in it battles you; the baby parakeet back
// to its nest; the haunted lamp's whispers, then Lamparita and the owner's C$500.
import { start } from './lib.mjs';

const t = await start('quests4');
// Mordiscón's first move is Water: it hits everything here, the ghost lamp too.
const party = [['mordiscon', 45], ['nacatamastin', 40]];
const save = () => t.save();
const yes = (opts) => (opts.includes('Sí') ? 'Sí' : undefined);
const talk = (map, x, y, dir, opts = { choose: yes }) => t.talk(map, x, y, dir, opts);

// The hammock: 900 → 750 → 600, a rude answer, → 500, buy.
await t.fromSave({ map: 'chispa', x: 13, y: 21, dir: 'left', party, money: 600, flags: { cohetesRobados: true } });
let r = await talk('chispa', 13, 21, 'left', { choices: ['¡Es muy caro', '¿Me hace', '¡Qué hamaca', '¡Es muy caro', 'Me la llevo'] });
let s = await save();
t.check('bargaining politely gets the hammock for C$500', s.bag.hamaca === 1 && s.money === 100, [s.money, s.bag.hamaca]);
t.check('a rude answer doesn’t lower the price', r.said.some((x) => x.includes('maleducad')));
await talk('casa', 1, 2, 'down');
await talk('casa', 1, 5, 'up');
s = await save();
t.check('Mom takes the hammock, and the sloth asleep in it battles you', s.flags.hamacaEntregada && s.bag.superpocion === 3 && s.flags.perezosito, s.flags);

// The baby parakeet: Elsa's directions, the lava tube, the nest, the reward.
await t.fromSave({ map: 'laderas', x: 18, y: 15, dir: 'up', party, flags: { cohetesRobados: true, lucas3: true } });
await t.press('z');
await t.play({ choices: ['En el tubo'], choose: () => 'No' });
await talk('tubo', 5, 11, 'up');
await talk('crater', 29, 12, 'right');
await talk('laderas', 18, 15, 'up');
s = await save();
t.check('the chick goes back to its nest, and Elsa gives Repels', s.flags.chocoyitoDone && s.bag.repelente === 5, s.bag);

// The haunted lamp, then the owner pays.
await t.fromSave({ map: 'cuarto_embrujado', x: 3, y: 2, dir: 'up', party, money: 0 });
await t.press('z');
r = await t.play();
t.check('repeating the lamp’s whispers calms it (then Lamparita battles)', (await save()).flags.lamparaCalmada && r.answered >= 3, r.answered);
await talk('casa_chispa2', 5, 3, 'up');
t.check('the owner pays C$500', (await save()).money === 500);

await t.end();

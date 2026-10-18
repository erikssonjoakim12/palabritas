// The shop: order in Spanish (a wrong amount isn't sold), then use a potion from the bag.
import { start } from './lib.mjs';

const t = await start('shop');
await t.fromSave({ map: 'tienda_brisa', x: 2, y: 2, dir: 'left', money: 1000, party: [['gotita', 8, { hp: 5 }]], flags: { palabolas: true } });
const menus = ['Palabola', '×2', 'Palabola', '×1', 'Poción', '×1', 'Nada'];
await t.press('z'); // the cashier
const r = await t.play({
  choose: () => menus.shift(),
  // The second order asks for three, but you picked one: it shouldn't be sold.
  answers: ['Quiero dos Palabolas, por favor', 'Quiero tres Palabolas', 'me da una pocion'],
});
let s = await t.save();
t.check('bought 2 Palabolas and a potion', s.bag.palabola === 2 && s.bag.pocion === 1, s.bag);
t.check('paid 2 × $60 + $100', s.money === 780, s.money);
t.check('ordered in Spanish 3 times', r.answered === 3, r.answered);

// With one Palabrita the potion is used on it directly; with more, you pick who.
const steps = ['MOCHILA', 'Poción', 'B', 'SALIR'];
await t.press('Enter');
await t.play({ choose: (opts) => opts.find((o) => o.startsWith('Gotita')) ?? steps.shift() });
s = await t.save();
t.check('the potion healed 20 PS', s.party[0].hp === 25 && s.bag.pocion === 0, { hp: s.party[0].hp, bag: s.bag });

// The Superpoción, bought here for the test (Brisa's shop doesn't sell it).
await t.fromSave({ map: 'tienda_brisa', x: 2, y: 2, dir: 'left', money: 1000, party: [['gotita', 8]], flags: { palabolas: true } });
await t.game(() => window.__game.SHOPS.tienda_brisa.push('superpocion'));
const more = ['Superpoción', '×1', 'Nada'];
await t.press('z');
await t.play({ choose: () => more.shift(), answers: ['me da una superpocion'] });
s = await t.save();
t.check('bought a Superpoción for $250', s.bag.superpocion === 1 && s.money === 750, { bag: s.bag, money: s.money });

await t.fromSave({ map: 'ruta1', x: 3, y: 4, dir: 'right', party: [['gotita', 8, { hp: 0 }], ['conejito', 6]], bag: { revivir: 1 } });
const revive = ['MOCHILA', 'Revivir', 'B', 'SALIR'];
await t.press('Enter');
await t.play({ choose: (opts) => opts.find((o) => o.startsWith('Gotita')) ?? revive.shift() });
s = await t.save();
const half = await t.game(() => Math.floor(window.__game.stats(window.__game.G.save.party[0]).maxHp / 2));
t.check('Revivir brings a fainted one back with half its PS', s.party[0].hp === half && !s.bag.revivir, { hp: s.party[0].hp, half });

await t.game(() => { window.__game.G.save.repel = 3; Math.random = () => 0; }); // every grass step would meet one
await t.walk('right', 3);
const said = await t.nextText();
s = await t.save();
t.check('no wild Palabritas while the Repelente lasts, then it wears off', s.x === 6 && !s.repel && said.includes('Repelente'), { x: s.x, said });
await t.end();

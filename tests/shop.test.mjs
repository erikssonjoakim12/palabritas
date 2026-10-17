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
await t.end();

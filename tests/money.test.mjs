// Money: beating a trainer pays, losing costs half of it. The Palacentro nurse heals everyone.
import { start } from './lib.mjs';

const t = await start('money');

// Niña Sofía stands right in front of you on Ruta 1.
await t.fromSave({ map: 'ruta1', x: 13, y: 12, dir: 'right', money: 0, party: [['aguacatito', 15]] });
await t.press('z');
let r = await t.play();
let s = await t.save();
t.check('beating Sofía pays prize money', s.money > 0 && r.said.some((x) => x.includes('Ganaste')), s.money);

await t.fromSave({ map: 'ruta1', x: 13, y: 12, dir: 'right', money: 100, party: [['aguacatito', 2]] });
await t.press('z');
r = await t.play({ right: false });
s = await t.save();
t.check('losing costs half your money', s.money === 50, s.money);

await t.fromSave({ map: 'centro_limon', x: 4, y: 3, dir: 'up', party: [['salchichita', 2, { hp: 1 }], ['conejito', 3, { hp: 1 }]] });
await t.press('z');
await t.play();
s = await t.save();
const full = await t.game(() => window.__game.G.save.party.every((m) => m.hp === window.__game.stats(m).maxHp));
t.check('the nurse heals the whole team', full, s.party.map((m) => m.hp));
t.check('the Palacentro is your new safe place', s.heal.map === 'centro_limon', s.heal);
await t.end();

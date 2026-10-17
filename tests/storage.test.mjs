// The Caja de Palabritas: deposit and withdraw at the Palacentro computer, a catch with a full team goes
// to the box, and so does a gift.
import { start } from './lib.mjs';

const t = await start('storage');
// The computer (Q) is at 8,3 in every Palacentro: stand below it, facing up.
const atComputer = { map: 'centro_limon', x: 8, y: 4, dir: 'up' };
/** Use the computer: pick these menu options in order (then SALIR). */
const useComputer = async (...picks) => {
  await t.press('z');
  return t.play({ choose: (opts) => (opts.includes('DEPOSITAR') ? picks.shift() ?? 'SALIR' : undefined) });
};
const counts = async () => { const s = await t.save(); return [s.party.length, s.box.length]; };

await t.fromSave({ ...atComputer, party: [['gotita', 8], ['conejito', 6, { hp: 1 }]] });
await t.game(() => window.__game.G.save.party.reverse()); // the hurt one first in the list
await useComputer('DEPOSITAR');
let s = await t.save();
t.check('depositing leaves one in the team', (await counts()).join() === '1,1', await counts());
t.check('the deposited one is healed', s.box[0].sp === 'conejito' && s.box[0].hp > 1, s.box[0]);

const r = await useComputer('DEPOSITAR');
t.check('you can’t deposit the last one', (await counts()).join() === '1,1' && r.said.some((x) => x.includes('vacío')), r.said);

await useComputer('RETIRAR');
t.check('withdrawing brings it back', (await counts()).join() === '2,0', await counts());

const six = [['gotita', 8], ['conejito', 6], ['salchichita', 6], ['aguacatito', 6], ['gotita', 5], ['conejito', 5]];
await t.fromSave({ map: 'ruta1', x: 10, y: 5, party: six, bag: { palabola: 5 } });
await t.game(() => { Math.random = () => 0; }); // the ball always holds
await t.wild('conejito', 3);
let thrown = false;
await t.play({ choose: (opts) => (opts.includes('LUCHAR') && !thrown ? ((thrown = true), 'MOCHILA') : opts.find((o) => o.includes('Palabola'))) });
t.check('a catch with a full team goes to the box', (await counts()).join() === '6,1', await counts());

await t.game(() => window.__game.giveMon('gotita', 5));
t.check('giveMon with a full team goes to the box', (await counts()).join() === '6,2', await counts());
s = await t.save();
t.check('both are marked caught', s.caught.includes('conejito') && s.caught.includes('gotita'), s.caught);
await t.end();

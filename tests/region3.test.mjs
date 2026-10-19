// Region 3 in checkpoints: Villa Ocote's south guard lets you down to Ruta 6 with the medal; Lucas at the beach;
// la noche de la arribada (counting eggs, Callada, the hatchlings, Paslamita); the restaurant, Don Lalo's rod
// and the bottle. The gym is in gym3.test.
import { start } from './lib.mjs';

const t = await start('region3');
const party = [['nubarron', 32], ['aguacatono', 32]];
const flags = async () => (await t.save()).flags;
const talk = async (map, x, y, dir, opts) => {
  await t.warp(map, x, y, dir);
  await t.press('z');
  return t.play(opts);
};

// Down from Villa Ocote with the Clay Medal.
await t.fromSave({ map: 'ocote', x: 23, y: 28, dir: 'down', party, flags: { silenciadorRoto: true, medalBarro: true } });
await t.walk('down', 4);
t.check('with the Clay Medal, the south road leads to Ruta 6', (await t.pos())[0] === 'ruta6', await t.pos());

// Lucas, rival #2, at the turtle beach (after the town): he has your starter's counter, evolved.
await t.fromSave({ map: 'tortugas', x: 22, y: 1, dir: 'down', party, starterPicked: 'aguacatito', flags: { lucas1: true } });
await t.walk('down', 1);
let r = await t.play();
t.check('Lucas battles you at the turtle beach with an evolved starter', (await flags()).lucas2 && r.said.some((x) => x.includes('Hamburguesón')), r.said.filter((x) => x.includes('envía')));

// The arribada: Tania counts eggs (you write the numbers)...
await t.fromSave({ map: 'tortugas', x: 18, y: 9, dir: 'up', party });
await t.press('z');
await t.play({ choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) });
t.check('waiting with Tania brings the night', (await t.pos())[0] === 'tortugas_noche', await t.pos());
await t.press('z');
r = await t.play({ answers: ['85', 'sesenta y dos', '100'] });
t.check('counting the eggs (digits or words)', (await flags()).huevosContados && r.answered === 3, r.answered);

// ...then Callada (after her grunts), the hatchlings, and Paslamita.
const grunts = { 'beat:silencioso8': true, 'beat:silencioso9': true, 'beat:silencioso10': true };
await t.fromSave({ map: 'tortugas_noche', x: 20, y: 14, dir: 'down', party, flags: { huevosContados: true, ...grunts } });
await t.press('z');
r = await t.play();
const s = await t.save();
t.check('Callada battles you and leaves', s.flags['beat:callada'] && s.flags.silenciososHuyen, r.said.slice(0, 2));
t.check('the hatchlings reach the sea, and Paslamita is yours', s.flags.tortuguitasAlMar && s.party.some((m) => m.sp === 'paslamita'), s.party.map((m) => m.sp));
t.check('morning in Playa Carey: the surf school opens', s.flags.arribadaDone && s.map === 'carey', [s.map, s.x, s.y]);

// El Pelícano Feliz: one round of waiting tables.
await t.fromSave({ map: 'restaurante', x: 9, y: 2, dir: 'up', party, money: 0 });
await t.press('z');
await t.play({ choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) });
await talk('restaurante', 0, 5, 'right', { choices: ['¡Muy bien'] }); // the guest at table 1
r = await talk('restaurante', 3, 3, 'up', { answers: ['Quisiera una sopa de pescado, por favor'] });
t.check('telling the cook the order pays', (await t.save()).money === 200, r.said);

// Don Lalo's lesson gives the fishing rod.
await t.fromSave({ map: 'casa_lalo', x: 1, y: 1, dir: 'right', party });
await t.press('z');
await t.play({ choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) });
t.check('Don Lalo’s fishing lesson gives the rod', (await t.save()).bag.cana === 1);

// The bottle on Ruta 7 points to a treasure in Playa Carey.
await t.fromSave({ map: 'ruta7', x: 9, y: 20, dir: 'left', party });
await t.press('z');
await t.play({ choices: ['Al sur del muelle'] });
await talk('carey', 7, 15, 'down');
t.check('the bottle’s treasure: a Revivir and two Superbolas', (await t.save()).bag.revivir === 1, (await t.save()).bag);
await t.end();

// Region 2's story, in checkpoints (each part starts from its own save): Ruta 5 → Villa Ocote and the message
// on the ground → a muted town → the mine's lever → the Capataz: the Silenciador breaks, Petra comes, the town
// talks again → the gym: three riddles, two trainers and Petra (Medalla Barro) → the south guard.
import { start } from './lib.mjs';

const t = await start('region2');
const strong = [['nubarron', 30], ['aguacatono', 30]];
const flags = (s) => t.save().then((x) => x.flags[s]);
/** Face somewhere and press A; play it out. */
const talk = async (map, x, y, dir, opts) => {
  await t.warp(map, x, y, dir);
  await t.press('z');
  return t.play(opts);
};

// 1. Over the seam from Ruta 5 into town, and the message on the ground (pick the right place).
await t.fromSave({ map: 'ruta5', x: 2, y: 11, dir: 'left', party: strong });
await t.walk('left', 4);
let r = await t.play({ choices: ['En la mina'] });
t.check('Ruta 5 leads west into Villa Ocote', (await t.pos())[0] === 'ocote', await t.pos());
t.check('the message on the ground sends you to the mine', (await flags('mensajeLeido')) && r.said.some((x) => x.includes('mina')), r.said);
await t.shot('ocote');

// 2. Everyone is muted: the potter only mimes.
r = await talk('ocote', 24, 12, 'up');
t.check('a muted person says «…»', r.said[0] === '…', r.said);

// 3. The lever in the mine opens the gate.
await t.fromSave({ map: 'mina1', x: 12, y: 3, dir: 'up', party: strong });
await t.press('z');
await t.play();
t.check('the lever opens the mine gate', await flags('compuertaAbierta'));

// 4. The Capataz spots you, battles, the Silenciador breaks, Petra comes and takes you back to town.
await t.fromSave({ map: 'mina2', x: 22, y: 19, dir: 'up', party: strong, flags: { compuertaAbierta: true } });
await t.walk('up', 1);
r = await t.play();
const s4 = await t.save();
t.check('the Capataz battles you', r.said.some((x) => x.includes('Silenciador')), r.said.slice(0, 3));
t.check('the Silenciador breaks and Petra comes back', s4.flags.silenciadorRoto && s4.flags.petraVolvio, s4.flags);
t.check('you’re back in Villa Ocote', s4.map === 'ocote', [s4.map, s4.x, s4.y]);
r = await talk('ocote', 15, 24, 'up');
t.check('the town talks again', r.said.some((x) => x.includes('mensaje')), r.said);

// 5. The gym: riddles open the stone doors; Tito and Rosario see you; Petra gives the Clay Medal.
const gym = { map: 'gym_ocote', party: strong, flags: { silenciadorRoto: true, petraVolvio: true } };
await t.fromSave({ ...gym, x: 2, y: 12, dir: 'up' });
await t.press('z');
await t.play({ choices: ['el gato'] });
t.check('the first riddle opens its door', await flags('adivinanza:piedra1'));
await t.walk('up', 3);
r = await t.play();
t.check('Alfarero Tito battles you', await flags('beat:tito'), r.said.slice(0, 2));
r = await talk('gym_ocote', 6, 8, 'up', { choices: ['la olla'] });
t.check('the second riddle opens its door', await flags('adivinanza:piedra2'));
await t.walk('up', 3);
await t.play();
t.check('Minera Rosario battles you', await flags('beat:rosario'));
await talk('gym_ocote', 4, 4, 'up', { choices: ['el reloj'] });
t.check('the third riddle opens its door', await flags('adivinanza:piedra3'));
r = await talk('gym_ocote', 5, 2, 'up');
const s5 = await t.save();
t.check('Petra gives you the Medalla Barro', s5.flags.medalBarro && s5.medals.includes('Barro') && s5.flags.busOpen, s5.medals);
await t.shot('gym');

// 6. The road south: closed until Ruta 6 is built (phase 3), even with the medal.
await t.fromSave({ map: 'ocote', x: 23, y: 28, dir: 'down', party: strong, flags: { silenciadorRoto: true, medalBarro: true } });
const said = await t.walk('down', 3);
r = await t.play();
t.check('the south guard stops you (the bridge is down)', (await t.pos())[2] < 30 && [said, ...r.said].join(' ').includes('puente'), [said, r.said]);
await t.end();

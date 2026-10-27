// Region 2's story, in checkpoints (each part starts from its own save): Ruta 4 → Villa Ocote and the message
// on the ground → a muted town → the mine's lever → the Capataz: the Silenciador breaks, Petra comes, the town
// talks again. The gym is in gym2.test.
import { start } from './lib.mjs';

const t = await start('region2');
const strong = [['nubarron', 30], ['aguacatono', 30]];
const flags = (s) => t.save().then((x) => x.flags[s]);

// 1. Over the seam from Ruta 4 into town, and the message on the ground (pick the right place).
await t.fromSave({ map: 'ruta5', x: 2, y: 11, dir: 'left', party: strong });
await t.walk('left', 4);
let r = await t.play({ choices: ['En la mina'] });
t.check('Ruta 4 leads west into Villa Ocote', (await t.pos())[0] === 'ocote', await t.pos());
t.check('the message on the ground sends you to the mine', (await flags('mensajeLeido')) && r.said.some((x) => x.includes('mina')), r.said);
await t.shot('ocote');

// 2. Everyone is muted: the potter only mimes.
r = await t.talk('ocote', 24, 12, 'up');
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
r = await t.talk('ocote', 15, 24, 'up');
t.check('the town talks again', r.said.some((x) => x.includes('mensaje')), r.said);

await t.end();

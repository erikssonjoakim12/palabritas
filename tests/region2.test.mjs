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
r = await t.talk('ocote', 24, 11, 'up');
t.check('a muted person says «…»', r.said[0] === '…', r.said);

// The Palacentro and the shop are muted too: the nurse and the cashier only mime, but still serve you (the user).
await t.fromSave({ map: 'centro_ocote', x: 4, y: 3, dir: 'up', money: 500, party: [['nubarron', 30, { hp: 5 }]] });
r = await t.talk('centro_ocote', 4, 3, 'up', { choose: () => 'Sí' });
let s2 = await t.save();
t.check('the muted nurse only mimes', r.said.every((x) => x === '…'), r.said);
t.check('…and still heals your Palabritas', s2.party[0].hp > 5 && s2.heal.map === 'centro_ocote', [s2.party[0].hp, s2.heal]);
const menus = ['Palabola', '×1', 'Nada'];
r = await t.talk('tienda_ocote', 2, 2, 'left', { choose: () => menus.shift() });
s2 = await t.save();
t.check('the muted cashier only mimes', r.said.every((x) => x === '…'), r.said);
t.check('…and you still order in Spanish and buy', r.answered === 1 && s2.bag.palabola === 1 && s2.money === 440, [r.answered, s2.bag, s2.money]);

// 3. The lever in the mine opens the gate.
await t.fromSave({ map: 'mina1', x: 22, y: 3, dir: 'up', party: strong, flags: { 'beat:silencioso2': true } });
await t.press('z');
await t.play();
t.check('the lever opens the mine gate', await flags('compuertaAbierta'));
const levers = await t.game(() => window.__game.MAPS.mina1.npcs.filter((n) => n.id.startsWith('palanca') && n.show()).map((n) => n.id).join());
t.check('the pulled lever looks pulled', levers === 'palancaAbajo', levers);
// The lever's room moved next to the gate: a save from the old room (above the big room's west side) stands in it.
await t.fromSave({ map: 'mina1', x: 8, y: 3, dir: 'up', party: strong, flags: { palancaJunto: false } });
t.check('an old save in the old lever room stands in the new one', String(await t.pos()) === 'mina1,18,3', await t.pos());

// 4. The Capataz spots you, battles, the Silenciador breaks, Petra comes and takes you back to town.
await t.fromSave({ map: 'mina2', x: 22, y: 19, dir: 'up', party: strong, flags: { compuertaAbierta: true } });
await t.walk('up', 1);
r = await t.play();
const s4 = await t.save();
t.check('the Capataz battles you', r.said.some((x) => x.includes('Silenciador')), r.said.slice(0, 3));
t.check('the Silenciador breaks and Petra comes back', s4.flags.silenciadorRoto && s4.flags.petraVolvio, s4.flags);
t.check('you’re back in Villa Ocote', s4.map === 'ocote', [s4.map, s4.x, s4.y]);
r = await t.talk('ocote', 15, 21, 'up');
t.check('the town talks again', r.said.some((x) => x.includes('mensaje')), r.said);
// The museum's pieces stand on its tables; looking at one reads its plaque.
r = await t.talk('museo_ocote', 1, 2, 'up');
t.check('the glyptodon’s plaque', r.said[0]?.includes('gliptodonte'), r.said);

await t.end();

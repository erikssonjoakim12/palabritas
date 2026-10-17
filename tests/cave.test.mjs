// The Cueva del Eco: a trainer spots you, wild Palabritas on any step (not just grass), and the potion
// in the dead-end room (once). Also: old saves keep the Ruta 2 potion as found.
import { start } from './lib.mjs';

const t = await start('cave');
const rate = (r) => t.game((r) => { window.__game.currentMap().encounters.rate = r; }, r);

await t.fromSave({ map: 'ruta4', x: 5, y: 30, dir: 'up', party: [['hamburgueson', 25]], flags: { medalBrisa: true } });
await rate(0);
let said = '';
for (let i = 0; i < 8 && !said; i++) said = await t.walk('up', 1);
const r = await t.play();
let s = await t.save();
t.check('Espeleólogo Raúl spots you and battles', r.said.some((x) => x.includes('Espeleólogo Raúl')), said);
t.check('he stays beaten', s.flags['beat:raul'] === true);

await t.warp('ruta4', 5, 34, 'up');
await rate(1);
await t.walk('up', 1);
said = await t.nextText();
t.check('any cave floor can have a wild Palabrita', said.includes('salvaje'), said);
await t.play({ choose: (opts) => (opts.includes('HUIR') ? 'HUIR' : undefined) });

await rate(0);
await t.warp('ruta4', 32, 34, 'down');
await t.press('z');
const found = await t.play();
await t.press('z');
await t.play();
s = await t.save();
t.check('the potion in the dead-end room', found.said.some((x) => x.includes('Poción')), found.said);
t.check('can only be picked up once', s.bag.pocion === 1, s.bag);

await t.fromSave({ map: 'limon', x: 4, y: 8, party: [['gotita', 5]], flags: { pocionRuta2: true } });
s = await t.save();
t.check('an old save keeps the Ruta 2 potion as found', s.flags['item:pocion_ruta2'] === true && !('pocionRuta2' in s.flags), s.flags);
await t.end();

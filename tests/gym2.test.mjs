// Petra's gym (split from region2.test, which got too long): three riddles open the stone doors, Tito and
// Rosario see you, Petra gives the Medalla Barro. And the south guard holds the road until Ruta 6 exists.
import { start } from './lib.mjs';

const t = await start('gym2');
const strong = [['nubarron', 30], ['aguacatono', 30]];
const flags = (s) => t.save().then((x) => x.flags[s]);
/** Face somewhere and press A; play it out. */
const talk = async (map, x, y, dir, opts) => {
  await t.warp(map, x, y, dir);
  await t.press('z');
  return t.play(opts);
};

let r;

// The gym: riddles open the stone doors; Tito and Rosario see you; Petra gives the Clay Medal.
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
await t.game(() => window.__game.healParty()); // as you would at the Palacentro before the leader
r = await talk('gym_ocote', 5, 2, 'up');
const s5 = await t.save();
t.check('Petra gives you the Medalla Barro', s5.flags.medalBarro && s5.medals.includes('Barro'), [s5.medals, r.said.slice(0, 3), r.said.slice(-3)]);
await t.shot('gym');

// The road south: closed until Ruta 6 is built (phase 3), even with the medal.
await t.fromSave({ map: 'ocote', x: 23, y: 28, dir: 'down', party: strong, flags: { silenciadorRoto: true, medalBarro: true } });
const said = await t.walk('down', 3);
r = await t.play();
t.check('the south guard stops you (the bridge is down)', (await t.pos())[2] < 30 && [said, ...r.said].join(' ').includes('puente'), [said, r.said]);
await t.end();

// Region 2's side stories: Lucas's first battle (he takes the starter strong against yours), Gaby's bird,
// Beto's hat, the echo room and its fossil, the museum waking Caparazonte the next day, and Don Chepe's oxen.
import { start } from './lib.mjs';

const t = await start('quests2');
const party = [['nubarron', 30], ['aguacatono', 30]];
const town = { silenciadorRoto: true, petraVolvio: true };
const flags = async () => (await t.save()).flags;

// Lucas catches up with you as you step into the mine. You picked Gotita, so he has Aguacatito.
await t.fromSave({ map: 'mina1', x: 5, y: 23, dir: 'up', party, starterPicked: 'gotita' });
const lucasInTown = () => t.game(() => window.__game.MAPS.ocote.npcs.find((n) => n.id === 'lucas_ocote').show());
t.check('Lucas isn’t in Villa Ocote before he catches up with you', !(await lucasInTown()));
await t.walk('up', 1);
let r = await t.play();
t.check('Lucas catches up with you and battles', (await flags()).lucas1 && r.said.some((x) => x.includes('alcancé')), r.said.slice(0, 2));
t.check('he took the starter strong against yours', r.said.some((x) => x.includes('Aguacatito')), r.said.filter((x) => x.includes('envía')));
// Then he waits in the silent town, and he can talk (a visitor, like you).
t.check('after the battle Lucas is in Villa Ocote', await lucasInTown());
r = await t.talk('ocote', 16, 14, 'right');
t.check('…and he talks, though the town is silent', r.said[0]?.includes('pueblo'), r.said);

// Losing to him (one weak Palabrita): he won, and there's no second chance (do better next time).
await t.fromSave({ map: 'mina1', x: 5, y: 23, dir: 'up', party: [['gotita', 5]], starterPicked: 'gotita' });
await t.walk('up', 1);
r = await t.play({ right: false });
const lost = await flags();
t.check('losing to Lucas: he gloats, and he’s gone', lost.lucas1 && !lost.lucasAqui && r.said.some((x) => x.includes('Te gané')), r.said.slice(-4));

// Gaby: pick the guardabarranco from three descriptions, then show her one.
await t.fromSave({ map: 'ruta5', x: 21, y: 8, dir: 'left', party });
await t.press('z');
await t.play({ choices: ['Un pájaro con la cola larga'] });
t.check('Gaby’s question: the bird with the racket tail', (await flags()).gabyPregunta);
await t.game(() => window.__game.G.save.box.push(window.__game.newMon('guardabarranco', 14)));
r = await t.talk('ruta5', 21, 8, 'left');
let s = await t.save();
t.check('showing her a Guardabarranco (even from the box) earns Superbolas', s.flags.gabyDone && s.bag.superbola === 3, s.bag);

// Beto's hat: an Ecolín wears it in the cave; Beto wants to know its color.
await t.fromSave({ map: 'ruta4', x: 16, y: 34, dir: 'up', party, flags: { palabolas: true } });
await t.press('z');
await t.play();
s = await t.save();
t.check('the hatted Ecolín drops the hat', s.flags.sombreroEncontrado && s.bag.sombrero === 1, s.bag);
r = await t.talk('limon', 13, 3, 'up', { answers: ['verde'] });
s = await t.save();
t.check('Beto gets his green hat back', s.flags.sombreroDevuelto && !s.bag.sombrero && s.bag.palabola === 5, s.bag);

// The echo room: five echoes break the wall; the fossil is behind it.
await t.fromSave({ map: 'ruta4', x: 6, y: 10, dir: 'up', party });
await t.press('z');
r = await t.play();
t.check('five echoes break the cracked wall', (await flags()).ecoAbierto, r.answered);
await t.talk('ruta4', 6, 5, 'up'); // the cave has wild Palabritas everywhere: no walking in a test
t.check('the shell fossil is behind it', (await t.save()).bag.fosil === 1);

// The museum keeps the fossil overnight: Caparazonte the next day.
await t.fromSave({ map: 'museo_ocote', x: 6, y: 3, dir: 'up', party, flags: town, bag: { fosil: 1 } });
await t.press('z');
await t.play();
t.check('the curator takes the fossil', (await flags()).fosilEntregado);
await t.press('z');
r = await t.play();
t.check('the same day it’s still sleeping', r.said.some((x) => x.includes('durmiendo')), r.said);
await t.game(() => { globalThis.__today = '2999-01-01'; });
await t.press('z');
await t.play();
s = await t.save();
t.check('the next day Caparazonte is yours', s.party.some((m) => m.sp === 'caparazonte' && m.level === 15), s.party.map((m) => m.sp));

// Don Chepe's oxen: listen for where the first one went, bring both back.
const chepe = { ...town, 'palabra:bueyes': true, 'devuelta:bueyes': true };
await t.fromSave({ map: 'ocote', x: 34, y: 17, dir: 'right', party, flags: chepe, money: 0 });
await t.press('z');
await t.play({ choices: ['Cerca de la cascada'] });
t.check('Don Chepe tells you where his oxen went', (await flags()).bueyes);
await t.talk('ocote', 32, 19, 'up');
await t.talk('canon', 19, 9, 'up');
s = await t.save();
t.check('both oxen follow you', s.flags.buey1 && s.flags.buey2, s.flags);
await t.talk('ocote', 34, 17, 'right');
s = await t.save();
t.check('Don Chepe pays you back', s.flags.bueyesDone && s.money === 300 && s.bag.superpocion === 2, [s.money, s.bag]);
await t.end();

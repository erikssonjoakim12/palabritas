// Gym 6 (Villa Bruma): Doña Esperanza's café opens once the fog has lifted, her students watch the way up, she gives
// the Medalla Nube, and with it Fly: VOLAR in the team menu takes you to a town you've been to.
import { start } from './lib.mjs';

const t = await start('gym6');
const medals = ['Brisa', 'Barro', 'Ola', 'Chispa', 'Espina'];
const party = [['hamburgueson', 50], ['nubarron', 50], ['palomon', 45]];
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// While the fog lasts, the door is shut.
await t.fromSave({ map: 'bruma', x: 5, y: 7, dir: 'up', party, medals });
await t.walk('up', 1);
let r = await t.play();
t.check('the gym is closed while the fog lasts', r.said.some((x) => x.includes('cerrada')) && (await t.pos())[0] === 'bruma', [r.said, await t.pos()]);

// Once Tomás is home, it's Doña Esperanza's café.
await t.fromSave({ map: 'bruma', x: 5, y: 7, dir: 'up', party, medals, flags: { tomasEnCasa: true, rosaEnCasa: true } });
await t.walk('up', 1);
await sleep(800);
t.check('once the fog has lifted, the café is open', String(await t.pos()) === 'gym_bruma,5,12', await t.pos());
await t.walk('up', 2);
r = await t.play();
t.check('her barista sees you on the way up', (await t.save()).flags['beat:barista_joel'] && r.said.some((x) => x.includes('cafecito')), r.said.slice(0, 2));

r = await t.talk('gym_bruma', 5, 2, 'up', yes);
let s = await t.save();
t.check('Doña Esperanza gives the Medalla Nube, and tells you about VOLAR', s.flags.medalNube && s.medals.includes('Nube') && r.said.some((x) => x.includes('VOLAR')), [s.medals, r.said.slice(-4)]);
t.check('the towns you’ve been to are remembered (for Fly)', s.visited.includes('bruma'), s.visited);

// Fly: START → PALABRITAS → Palomón → VOLAR, and on the map, a town you've been to.
await t.warp('bruma', 15, 12, 'down');
await t.game(() => { window.__game.G.save.visited = ['brisa']; });
await t.press('Enter');
await sleep(300);
await t.pick('PALABRITAS');
await sleep(200);
await t.game(() => document.querySelectorAll('.fullpanel .list-row')[2].click());
await sleep(200);
await t.pick('VOLAR');
await sleep(600);
const title = await t.game(() => document.querySelector('.townmap .menu-title')?.textContent);
await t.press('z');
await t.play();
await sleep(800);
t.check('VOLAR flies Palomón to a town you’ve been to, outside its Palacentro', title?.startsWith('VOLAR') && String(await t.pos()) === 'brisa,5,13', [title, await t.pos()]);
await t.end();

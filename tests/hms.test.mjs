// Surf and Cut (plans/surf-fly.md): they need the medals and a Palabrita that can really do it. Surf from Ruta 4's
// bridge, the river runs on into the next map, land ends it. A thin tree cut on Ruta 4 grows back when you leave.
import { start } from './lib.mjs';

const t = await start('hms');
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };
const medals = (n) => ['Brisa', 'Barro', 'Ola', 'Chispa', 'Selva'].slice(0, n);
const surfing = () => t.save().then((s) => !!s.surfing);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cut: without the 5th medal the thin tree is just in the way; with it and Hormigón, it's gone.
await t.fromSave({ map: 'ruta5', x: 80, y: 3, dir: 'up', party: [['hormigon', 40]], medals: medals(4) });
let r = await t.talk('ruta5', 80, 3, 'up', yes);
t.check('four medals: the thin tree only looks cuttable', r.said[0]?.includes('cortar') && !r.said.some((x) => x.includes('cortó')), r.said);
await t.fromSave({ map: 'ruta5', x: 80, y: 3, dir: 'up', party: [['hormigon', 40]], medals: medals(5) });
r = await t.talk('ruta5', 80, 3, 'up', yes);
t.check('five medals and Hormigón: it cuts the tree', r.said.some((x) => x.includes('Hormigón cortó')), r.said);
await t.walk('up', 2);
t.check('…and you walk through', (await t.pos())[2] < 3, await t.pos());
await t.warp('ruta4', 52, 2, 'up');
await t.warp('ruta5', 80, 4, 'up');
await t.walk('up', 2);
t.check('it grows back once you leave (you stop on the road below it)', (await t.pos())[2] === 3, await t.pos());
// Or from the team menu, like Gold/Silver: START → PALABRITAS → Hormigón → CORTAR.
await t.press('Enter');
await sleep(300);
await t.pick('PALABRITAS');
await sleep(200);
await t.game(() => document.querySelector('.fullpanel .list-row').click());
await sleep(200);
await t.pick('CORTAR');
r = await t.play();
t.check('CORTAR in the team menu cuts it too', r.said.some((x) => x.includes('Hormigón cortó')), r.said);

// Surf: no swimmer, no swimming.
await t.fromSave({ map: 'ruta5', x: 7, y: 12, dir: 'down', party: [['gotita', 40]], medals: medals(4) });
await t.talk('ruta5', 7, 12, 'down', yes);
t.check('without a big swimmer you can’t swim', !(await surfing()));
// With Mordiscón and four medals: onto the river, down it into the next map.
await t.fromSave({ map: 'ruta5', x: 7, y: 12, dir: 'down', party: [['mordiscon', 40]], medals: medals(4), flags: { 'beat:nadadora_rosa': true } });
await t.game(() => { const m = window.__game.MAPS; for (const id of ['ruta5', 'rio']) m[id].surf.rate = 0; });
r = await t.talk('ruta5', 7, 12, 'down', yes);
t.check('with Mordiscón and four medals you swim', (await surfing()) && String(await t.pos()) === 'ruta5,7,13', [await surfing(), await t.pos()]);
await t.walk('down', 20);
t.check('the river runs on into the next map', (await t.pos())[0] === 'rio' && (await surfing()), await t.pos());
// Landing on Villa Jaguar's pier ends it.
await t.warp('jaguar', 14, 17, 'right');
await t.game(() => { window.__game.G.save.surfing = true; });
await t.walk('right', 1);
const [m, px] = await t.pos();
t.check('stepping onto the pier, you’re on foot again', !(await surfing()) && m === 'jaguar' && px >= 15, [await surfing(), await t.pos()]);
await t.end();

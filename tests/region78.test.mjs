// Towns 7 and 8 (plans/region7-8.md): Ruta 11 from high up on Ruta 10, down to Puerto Rayo on its stormy lake; the
// trail south off the lake (a ledge into Ruta 3: one way); gym 7 and its medal, and with seven, Strength; Ciudad
// Ceniza behind its boulder (it won't move without Strength; with it, it stays where you push it); gym 8.
import { start } from './lib.mjs';

const t = await start('region78');
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };
const party = [['carablanca', 55], ['danton', 55], ['huracan', 55]];
const MEDALS = ['Brisa', 'Barro', 'Ola', 'Chispa', 'Espina', 'Nube'];
const medalFlags = Object.fromEntries(MEDALS.map((m) => [`medal${m}`, true]));

// Ruta 10's lookout runs east into Ruta 11, and Ruta 11 comes down to the lake's north shore.
await t.fromSave({ map: 'ruta11', x: 43, y: 10, dir: 'right', party, medals: MEDALS, flags: { ...medalFlags, 'beat:exploradora_vicky': true } });
await t.walk('right', 3);
t.check('Ruta 10 leads east into Ruta 11', (await t.pos())[0] === 'ruta12', await t.pos());
await t.fromSave({ map: 'ruta12', x: 30, y: 20, dir: 'up', party, flags: { ruta11Pantano: false } });
t.check('an old save on Ruta 11 (now a swamp) starts where it begins', String(await t.pos()) === 'ruta12,1,10', await t.pos());
// The swamp's fishers watch the bridges' ends: crossing the long bridge east, Rosa spots you.
await t.fromSave({ map: 'ruta12', x: 33, y: 20, dir: 'right', party: [['carablanca', 100]], medals: MEDALS, flags: medalFlags });
await t.walk('right', 3);
const rosa = await t.play({ max: 600 });
t.check('a fisher by the bridge spots you and battles', (await t.save()).flags['beat:pescadora_rosa'] && rosa.said.some((x) => x.includes('pica nada')), rosa.said.slice(0, 3));
await t.warp('ruta12', 29, 43, 'down');
await t.walk('down', 4);
t.check('Ruta 11 comes down to Puerto Rayo', (await t.pos())[0] === 'rayo', await t.pos());

// The trail south: off the lake's south-west shore into Ruta 3's mountains, and west to a ledge just above the path
// you walked there before (the user), which you can't climb back up.
await t.warp('rayo', 18, 35, 'down');
for (const [dir, n] of [['down', 5], ['left', 6], ['down', 3], ['left', 14], ['down', 1]]) await t.walk(dir, n);
const down = await t.pos();
await t.walk('up', 3);
t.check('the trail drops into Ruta 3 over a ledge, one way', String(down) === 'ruta3,38,8' && String(await t.pos()) === 'ruta3,38,8', [down, await t.pos()]);
await t.fromSave({ map: 'ruta3', x: 56, y: 10, dir: 'up', party, flags: { rayoSur: false } });
t.check('an old save on the old trail starts on the lake\'s new shore', String(await t.pos()) === 'rayo,20,35', await t.pos());

// Gym 7: Trueno, the Medalla Rayo (the 7th).
const crew7 = { 'beat:electricista_rolando': true, 'beat:meteorologa_ines': true, 'beat:marinera_paz': true };
await t.fromSave({ map: 'gym_rayo', x: 5, y: 3, dir: 'up', party, medals: MEDALS, flags: { ...medalFlags, ...crew7 } });
let r = await t.talk('gym_rayo', 5, 2, 'up', yes);
let s = await t.save();
t.check('Trueno gives the Medalla Rayo, the 7th', s.flags.medalRayo && s.medals.length === 7, [s.medals, r.said.slice(-3)]);

// Ciudad Ceniza: the boulder on Ruta 5's road doesn't move without Strength.
await t.fromSave({ map: 'ceniza', x: 0, y: 2, dir: 'right', party, medals: MEDALS, flags: medalFlags });
r = await t.talk('ceniza', 0, 2, 'right', yes);
t.check('without seven medals the boulder is just a huge rock', r.said.some((x) => x.includes('roca enorme')), r.said);
await t.walk('right', 2);
t.check('...and it doesn\'t move', String(await t.pos()) === 'ceniza,0,2', await t.pos());

// With seven: Strength, and the boulder moves (and stays there).
const seven = [...MEDALS, 'Rayo'];
await t.fromSave({ map: 'ruta6', x: 35, y: 29, dir: 'right', party, medals: seven, flags: { ...medalFlags, medalRayo: true } });
await t.walk('right', 1);
r = await t.talk('ceniza', 0, 2, 'right', yes);
t.check('with seven medals, Strength', r.said.some((x) => x.includes('FUERZA')), r.said);
await t.walk('right', 1); // a push, then on into the tile it left (like Gold/Silver)
s = await t.save();
t.check('the boulder is pushed aside, and the save keeps it there', String(s.boulders.roca_ceniza_camino) === '2,2', s.boulders);
t.check('the way into Ciudad Ceniza is open', String(await t.pos()) === 'ceniza,1,2', await t.pos());

// The east coast is black rock with grids of boulders: pushing two of them opens the way to the pier (and Surf).
await t.fromSave({ map: 'ceniza', x: 58, y: 17, dir: 'up', party, medals: seven, flags: { ...medalFlags, medalRayo: true } });
await t.talk('ceniza', 58, 17, 'up', yes);
for (const d of ['up', 'up', 'right']) await t.walk(d, 1);
t.check('pushing the boulders aside opens the way to the pier', String(await t.pos()) === 'ceniza,59,15', [await t.pos(), (await t.save()).boulders]);
await t.warp('ruta6', 34, 29, 'left');
s = await t.save();
t.check('once you leave, the boulders go back to their places', !s.boulders.roca_ceniza_muelle2, s.boulders);

// Gym 8: Aurora, the Medalla Ceniza.
const crew8 = { 'beat:historiadora_clara': true, 'beat:restaurador_efren': true, 'beat:archivera_luz': true };
await t.fromSave({ map: 'gym_ceniza', x: 5, y: 3, dir: 'up', party: [['carablanca', 100], ['danton', 100], ['huracan', 100]], medals: seven, flags: { ...medalFlags, medalRayo: true, ...crew8 } });
r = await t.talk('gym_ceniza', 5, 2, 'up', { ...yes, max: 3000 });
s = await t.save();
t.check('Aurora gives the Medalla Ceniza, the 8th', s.flags.medalCeniza && s.medals.length === 8, [s.medals, r.said.slice(-3)]);

// An old save on Ruta 9 (now the town) starts again on Ruta 5's road, outside the boulder.
await t.fromSave({ map: 'ruta10', x: 20, y: 30, dir: 'up', party, flags: { cenizaCiudad: false } });
t.check('an old save on Ruta 9 starts on Ruta 5\'s road', String(await t.pos()) === 'ruta6,34,29', await t.pos());
await t.end();

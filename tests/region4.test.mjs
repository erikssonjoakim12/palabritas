// Region 4's story in checkpoints: walking into Ciudad Chispa the fireworks are stolen (the trail opens); the
// foot of the volcano trail (Lucas #3); Don Sigilo in the crater gives the rockets back and the festival night
// follows; the workshop's torches (a wrong order resets them, the poem's order opens the door) and Don Tizón's
// Medalla Chispa; coming home down the plateau's ledge.
import { start } from './lib.mjs';

const t = await start('region4');
const party = [['huracan', 40], ['nacatamastin', 40], ['aguacatero', 40]];
const flags = async () => (await t.save()).flags;
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };
const talk = (map, x, y, dir, opts = yes) => t.talk(map, x, y, dir, opts);

// Ruta 7 into Ciudad Chispa: the theft.
await t.fromSave({ map: 'ruta8', x: 42, y: 12, dir: 'right', party, flags: { medalOla: true } });
await t.walk('right', 4);
let r = await t.play();
t.check('the fireworks are stolen as you arrive, and the volcano trail opens', (await flags()).cohetesRobados && r.said.some((x) => x.includes('Ladrones')), r.said.slice(0, 3));

// The foot of the volcano trail: Lucas battles you with his evolved starter.
await t.fromSave({ map: 'laderas', x: 20, y: 27, dir: 'up', party, flags: { cohetesRobados: true }, starterPicked: 'aguacatito' });
await t.walk('up', 1);
r = await t.play();
t.check('Lucas battles you at the foot of the trail, with his evolved starter', (await flags()).lucas3 && r.said.some((x) => x.includes('Hamburguesón')), r.said.filter((x) => x.includes('envía')));

// The crater: Don Sigilo spots you; the rockets come back, and the festival night follows.
await t.fromSave({ map: 'crater', x: 13, y: 4, dir: 'right', party, flags: { cohetesRobados: true, lucas3: true } });
await t.walk('right', 3);
await t.play(yes);
t.check('beating Don Sigilo brings the rockets back', (await flags()).cohetesRecuperados && (await flags())['beat:sigilo']);
t.check('and the festival night starts (fireworks)', (await t.pos())[0] === 'chispa_noche' && (await t.game(() => !!window.__game.currentMap().fireworks)), await t.pos());
await talk('chispa_noche', 21, 17, 'right');
t.check('the next morning the workshop opens', (await flags()).fiestaDone && (await t.pos())[0] === 'chispa', await t.pos());

// Fallen rock closes the crater's west walkway: a save where it lies stands just south of it.
await t.fromSave({ map: 'crater', x: 3, y: 10, dir: 'up', party, flags: { craterDerrumbe: false } });
t.check('an old save inside the rockfall stands south of it', String(await t.pos()) === 'crater,3,13', await t.pos());

// The workshop: the torches, then Don Tizón.
const gymFlags = { cohetesRecuperados: true, fiestaDone: true, 'beat:polvorera': true, 'beat:malabarista': true, 'beat:fritanguero': true };
await t.fromSave({ map: 'gym_chispa', x: 5, y: 8, dir: 'up', party, flags: gymFlags });
await talk('gym_chispa', 1, 6, 'up'); // green first: wrong
t.check('a torch out of order puts them all out', !(await flags())['antorcha:Verde']);
for (const x of [3, 10, 1, 8]) await talk('gym_chispa', x, 6, 'up'); // red, blue, green, yellow
t.check('the poem’s order opens the door', (await flags()).puertaTallerAbierta);
await talk('gym_chispa', 5, 2, 'up');
t.check('Don Tizón gives the Medalla Chispa', (await flags()).medalChispa && (await t.save()).medals.includes('Chispa'));

// Home, down the ledge from the plateau.
await t.fromSave({ map: 'amanecer', x: 7, y: 7, dir: 'right', party: [['huracan', 40, 1]], flags: { cohetesRobados: true, medalChispa: true } });
await t.walk('right', 1);
r = await t.play();
t.check('coming home: Mom is proud and heals your team', (await flags()).vueltaACasa && r.said.some((x) => x.includes('orgullosa') || x.includes('alegría')), r.said);
await t.end();

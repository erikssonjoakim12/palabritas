// The volcano's west side (plans/volcano.md): the crater's fallen rock closes the west walkway from below, so its rim
// comes after Equipo Silencio; Don Sigilo waits there and escapes down the slope on a board; the guide asks for the
// helmet and rents you one, and you slide down to Ruta 7's landing path, which ends in a ledge into the pasture (no way
// back up). The crater's way out to Ruta 9 is closed.
import { start } from './lib.mjs';

const t = await start('volcano');
const party = [['coheton', 40], ['nubarron', 40]];
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };
const story = { lucas3: true, cohetesRobados: true, 'beat:silencioso5': true, 'beat:silencioso6': true, 'beat:silencioso7': true };

// The fallen rock: from the crater's bottom-left you can't go up the west walkway.
await t.fromSave({ map: 'crater', x: 3, y: 19, dir: 'up', party, flags: story });
await t.walk('up', 3);
t.check('the fallen rock closes the west walkway from below', String(await t.pos()) === 'crater,3,19', await t.pos());

// The way out to Ruta 9 at the top-left is closed.
await t.warp('crater', 3, 3, 'left');
await t.walk('left', 3);
t.check('the way to Ruta 9 is closed', String(await t.pos()) === 'crater,3,3', await t.pos());

// Don Sigilo at the west rim: the battle, his escape on a board, the rockets, the guide and her helmet, and down you go.
let r = await t.talk('crater', 3, 12, 'left', yes);
let s = await t.save();
t.check('Don Sigilo battles you at the west rim', s.flags['beat:sigilo'] && r.said.some((x) => x.includes('agarra una tabla')), r.said.slice(0, 3));
t.check('he escapes on a board; you get the rockets back', s.flags.sigiloSeFue && s.flags.cohetesRecuperados, s.flags);
t.check('the guide asks for the helmet, then you ride down and the story goes on in Ciudad Chispa', s.flags.tablaExplicada && r.said.some((x) => x.includes('Qué rápido')) && s.map.startsWith('chispa'), [s.map, r.said.filter((x) => x.includes('rápido') || x.includes('cohetes'))]);

// Another day (an old save, from before he escaped on a board): the guide rents you a board; you land in Ruta 7's
// clearing at the volcano's foot.
await t.fromSave({ map: 'crater', x: 3, y: 12, dir: 'up', party, flags: { ...story, 'beat:sigilo': true, cohetesRecuperados: true, tablaExplicada: true } }); // an old save: gone since his battle
await t.talk('crater', 3, 12, 'up', yes);
t.check('the board ride lands in Ruta 7, at the foot of the slope', String(await t.pos()) === 'ruta8,37,18', await t.pos());

// The landing path ends in a ledge down into the pasture, and there's no way back up.
await t.warp('ruta8', 16, 19, 'down');
await t.walk('down', 1); // onto the ledge: a hop down into the pasture
const below = await t.pos();
await t.walk('up', 1);
t.check('a ledge down into the pasture, no way back up', below[2] === 21 && (await t.pos())[2] === 21, [below, await t.pos()]);
await t.end();

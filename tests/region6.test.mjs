// Region 6 in the real game: Ruta 10 from the top of Ruta 4 up to Villa Bruma (its gym still closed), and the fog north
// of the town: entering it after Doña Rosa asks makes the town's Palacentro where you wake up; a game saved in the fog
// loads where you were, the walk too; Tomás won't leave the trail before he's home; then he
// and his grandmother walk home, into their house. (The fog walk itself: fog.test.mjs.)
import { start } from './lib.mjs';

const t = await start('region6');
const party = [['hamburgueson', 35], ['nubarron', 35]];
const pos = () => t.game(() => { const g = window.__game; return [g.currentMap().id, g.player.x, g.player.y]; });
const tomas = { look: 'tomas', script: 'tomasSigue' };

// Up from Ruta 4 (past the thin tree) onto Ruta 10, where Campista Noemí battles you on the way.
await t.fromSave({ map: 'ruta5', x: 80, y: 1, dir: 'up', party });
await t.walk('up', 2);
t.check('the top of Ruta 4 leads onto Ruta 10', (await pos())[0] === 'ruta11', await pos());
await t.warp('ruta11', 16, 46, 'right');
await t.walk('right', 6);
let r = await t.play();
t.check('Campista Noemí battles you on Ruta 10', (await t.save()).flags['beat:campista_noemi'] && r.said.some((x) => x.includes('Acampé')), r.said.slice(0, 2));
// Rematches come back one level under your strongest (35), at most 8 levels above the first time (Vulcanóloga Clara's
// were 22), and evolved as far as that level allows.
const rematch = await t.game(() => {
  const g = window.__game;
  return [g.rematchTeam(g.TRAINERS.campista_noemi).team, g.rematchTeam(g.TRAINERS.vulcanologa1).team];
});
t.check('rematch teams follow you, up to 8 levels more', JSON.stringify(rematch[0]) === '[["mariposita",34],["murcielon",34]]', rematch[0]);
t.check('and their Palabritas evolve as they grow', JSON.stringify(rematch[1]) === '[["coheton",30],["zopiloton",30]]', rematch[1]);

// Villa Bruma: up the route into town; the gym is closed for now.
await t.warp('ruta11', 13, 1, 'up');
await t.walk('up', 2);
t.check('Ruta 10 leads up into Villa Bruma', (await pos())[0] === 'bruma', await pos());
await t.warp('bruma', 5, 7, 'up');
await t.walk('up', 1);
r = await t.play();
t.check('the gym is closed for now', r.said.some((x) => x.includes('cerrada')) && (await pos())[2] === 7, [r.said, await pos()]);
await t.shot('bruma');

// North of the town, the trail: Doña Rosa asks you to find Tomás; into the fog, and the town's Palacentro is where
// you'd wake up.
await t.warp('bruma', 15, 1, 'up');
await t.walk('up', 2);
t.check('the town leads north to the trail', (await pos())[0] === 'niebla_borde', await pos());
r = await t.talk('niebla_borde', 6, 8, 'right');
t.check('Doña Rosa asks you to find Tomás', (await t.save()).flags.nieblaBusqueda && r.said.some((x) => x.includes('gorra')), r.said);
await t.warp('niebla_borde', 6, 1, 'up');
await t.walk('up', 1);
await t.play();
const heal = (await t.save()).heal;
t.check('into the fog: fainting now wakes you in Villa Bruma’s Palacentro', (await pos())[0] === 'cerro_niebla' && heal.map === 'centro_bruma', [await pos(), heal]);

// A game saved in the fog goes on from there: the walk is saved too (here, 4 patches along the dog's road).
const fogWalk = { phase: 'dog', step: 3, onWay: true, lostFor: 0, count: 0, exit: 'right', spots: [[11, 58], [15, 56]], at: 0, met: false };
await t.fromSave({ map: 'cerro_niebla', x: 9, y: 62, dir: 'up', party, fogWalk, flags: { nieblaBusqueda: true } });
const back = await t.game(() => { const g = window.__game; const n = g.npcById('cadenegro'); return { w: g.fogWalk(), dog: n.visible ? [n.x, n.y] : null }; });
t.check('a game saved in the fog loads where you were, the black dog waiting', (await pos()) + '' === 'cerro_niebla,9,62' && back.w.step === 3 && back.w.onWay && back.dog + '' === '11,58', [await pos(), back]);
await t.fromSave({ map: 'cerro_niebla', x: 45, y: 72, dir: 'up', party, flags: { nieblaBusqueda: true } });
t.check('(a game saved before the walk was saved starts again at the top of the trail)', (await pos()) + '' === 'niebla_borde,6,1', await pos());
await t.fromSave({ map: 'cerro_niebla', x: 80, y: 40, dir: 'up', party, follower: tomas, flags: { nieblaBusqueda: true, tomasHallado: true } });
const w = await t.game(() => window.__game.fogWalk());
t.check('…and with Tomás, in his clearing with him, on the way back', w.cell + '' === '3,0' && w.phase === 'light' && (await t.save()).follower?.look === 'tomas', [w.cell, w.phase]);

// With Tomás: not down to the town (his grandmother is right here); then home, and the two of them walk home.
await t.fromSave({ map: 'niebla_borde', x: 6, y: 9, dir: 'down', party, follower: tomas, flags: { nieblaBusqueda: true, tomasHallado: true, nieblaSalida: true, cadeblancoAcariciado: true } });
await t.walk('down', 2);
r = await t.play();
t.check('Tomás won’t go down to the town before he’s home', (await pos())[0] === 'niebla_borde' && r.said.some((x) => x.includes('Espera')), [await pos(), r.said]);
r = await t.talk('niebla_borde', 6, 8, 'right');
const s = await t.save();
const home = await t.game(() => window.__game.MAPS.casa_rosa.npcs.every((n) => n.show()));
const trail = await t.game(() => window.__game.MAPS.niebla_borde.npcs.filter((n) => n.id === 'abuela_niebla' || n.id === 'tomas_casa').some((n) => n.show()));
t.check('Tomás is home, the fog lifts, and they walk home to their house in the town', s.flags.tomasEnCasa && s.flags.rosaEnCasa && home && !trail && r.said.some((x) => x.includes('Vamos a casa')), r.said.slice(-3));
await t.end();

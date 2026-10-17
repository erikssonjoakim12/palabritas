// Cutscene tools and currents: walkNpc walks an NPC tile by tile (and goes around nothing: it skips
// blocked steps), placeNpc puts one somewhere, and a chain of water currents carries you along.
import { start, sleep } from './lib.mjs';

const t = await start('cutscene');
await t.fromSave({ party: [['gotita', 10]], map: 'limon', x: 12, y: 14, dir: 'up' });

const carmen = () => t.game(() => { const n = window.__game.npcById('carmen'); return [n.x, n.y, n.dir]; });
await t.game(() => window.__game.walkNpc('carmen', ['left', 'left', 'down']));
t.check('walkNpc walks Carmen two left and one down', (await carmen()).join() === '11,11,down', await carmen());
await t.game(() => window.__game.walkNpc('carmen', ['down', 'down', 'down', 'right']));
t.check('walkNpc skips the step into you (she just turns)', (await carmen()).join() === '11,14,right', await carmen());
await t.game(() => window.__game.placeNpc('carmen', 5, 9, 'up'));
t.check('placeNpc puts her right there', (await carmen()).join() === '5,9,up', await carmen());

// A current chain: step onto 6 6 6 at x 14..16 on row 14 and land on x 17.
await t.game(() => {
  const m = window.__game.MAPS.limon;
  m.rows = m.rows.map((r, y) => (y === 14 ? r.slice(0, 14) + '666' + r.slice(17) : r));
  window.__game.loadMap('limon', 13, 14, 'right');
});
await sleep(300);
await t.walk('right', 1);
await sleep(1200);
const at = await t.pos();
t.check('three currents carry you three tiles on', at.join() === 'limon,17,14', at);
t.check('you still face the way you walked', (await t.save()).dir === 'right');
await t.shot('current');
await t.end();

// The small movements on the map (plans/world-life.md, part 1): footprints in the sand, waves on the beach, chimneys,
// and birds on the paths that fly off when you come near (never sitting inside a wall).
import { start, sleep } from './lib.mjs';

const t = await start('ambient');
await t.game(() => (window.__hour = 12)); // by day: the birds are out

await t.fromSave({ map: 'carey', x: 10, y: 9, dir: 'left', party: [['gotita', 20]] });
const there = await t.game(() => window.__game.ambient.ambientCounts());
t.check('Playa Carey has waves on its beaches and smoke from a chimney', there.shores > 0 && there.chimneys > 0, there);
await t.walk('left', 2);
const after = await t.game(() => window.__game.ambient.ambientCounts());
t.check('walking on the sand leaves footprints', after.marks >= 2, after);

await t.fromSave({ map: 'tortugas', x: 10, y: 5, dir: 'down', party: [['gotita', 20]] });
const birds = await t.game(() => window.__game.ambient.birdSpots());
t.check('birds peck on the open ground, never inside a wall', birds.length > 0 && birds.every((b) => !b.solid && !b.flown), birds);
const b = birds[0];
await t.game((b) => window.__game.loadMap('tortugas', b.x, b.y + 1, 'up'), b);
await sleep(200);
const flown = await t.game(() => window.__game.ambient.birdSpots());
t.check('a bird flies off when you come near', flown.find((f) => f.x === b.x && f.y === b.y)?.flown, flown);
await t.end();

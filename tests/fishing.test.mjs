// Fishing: with the rod, A facing the lake casts it (and from the bag too); something bites and a wild
// battle starts with a Palabrita from the map's fishing table. Without the rod, water is just water.
import { start } from './lib.mjs';

const t = await start('fishing');
// On the lake shore in Pueblo Amanecer, facing the water.
const shore = { map: 'amanecer', x: 12, y: 14, dir: 'down', party: [['gotita', 12]] };
const biting = () => t.game(() => {
  window.__game.MAPS.amanecer.fishing = { table: [{ sp: 'gotita', min: 9, max: 9, w: 1 }] };
  Math.random = () => 0; // it always bites
});
const battleStarts = () => t.play({ until: (s) => s.battle });

await t.fromSave(shore);
await biting();
await t.press('z');
let r = await t.play();
t.check('without the rod, nothing to fish with', !r.said.some((x) => x.includes('caña')), r.said);

await t.fromSave({ ...shore, bag: { cana: 1 } });
await biting();
await t.press('z');
r = await battleStarts();
const wild = await t.game(() => document.querySelector('.hud')?.textContent ?? '');
t.check('A at the lake casts the rod', r.said.some((x) => x.includes('tiró la caña')), r.said);
t.check('something bites: a battle with one from the table', r.said.some((x) => x.includes('picó')) && /Gotita/.test(wild), wild);
await t.play();

await t.fromSave({ ...shore, bag: { cana: 1 } });
await biting();
await t.press('Enter');
r = await t.play({ choose: (opts) => opts.find((o) => o === 'MOCHILA' || o.startsWith('Caña')), until: (s) => s.battle });
t.check('the rod from the bag fishes too', r.said.some((x) => x.includes('tiró la caña')), r.said);
await t.end();

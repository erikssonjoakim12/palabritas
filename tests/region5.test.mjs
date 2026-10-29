// Region 5's story at the top of the Templo del Jaguar: Comandante Mutis, then Rugidón (a guardian: no catching, no
// running), who turns to stone; her cub, Rugidito, comes with you.
import { start } from './lib.mjs';

const t = await start('region5');
const party = [['volcasaurio', 50], ['huracan', 48], ['aguacatero', 48]];
const yes = { choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) };

await t.fromSave({ map: 'templo4', x: 10, y: 7, dir: 'up', party });
await t.walk('up', 1);
const r = await t.play(yes);
const s = await t.save();
t.check('Comandante Mutis battles you at the altar', s.flags['beat:mutis'] && r.said.some((x) => x.includes('Mutis')), r.said.slice(0, 3));
t.check('the jaguar turns to stone after the battle', s.flags.jaguarPiedra, s.flags);
t.check('…and her cub, Rugidito, comes with you', s.party.some((m) => m.sp === 'rugidito') || (s.box ?? []).some((m) => m.sp === 'rugidito'), s.party.map((m) => m.sp));
const statue = await t.game(() => window.__game.MAPS.templo4.npcs.find((n) => n.id === 'estatua_a').show());
t.check('her statue stands on the altar', statue);
await t.end();

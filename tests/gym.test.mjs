// The first gym: beat Paloma (defending against her attacks) and get the Breeze Medal.
import { start } from './lib.mjs';

const t = await start('gym');
await t.fromSave({ map: 'gimnasio', x: 4, y: 3, dir: 'up', party: [['gotita', 14]] });
await t.press('z');
const r = await t.play();
const s = await t.save();
t.check('Paloma battled', r.said.some((x) => x.includes('Paloma')));
t.check('you defended against her attacks', r.answered > 3, r.answered);
t.check('you got the Breeze Medal', s.medals.includes('Brisa') && s.flags.medalBrisa === true, s.medals);
await t.end();

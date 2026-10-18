// Rematches: a route's rematch trainer (Niña Sofía) remembers the day you beat her. The same day she only
// says she wants a rematch tomorrow; on a later day she asks, and fights with a stronger team.
import { start } from './lib.mjs';

const t = await start('rematch');
// Sofía stands right in front of you on Ruta 1.
await t.fromSave({ map: 'ruta1', x: 13, y: 12, dir: 'right', party: [['aguacatito', 15]] });
const today = await t.game(() => window.__game.today());
await t.press('z');
await t.play();
let s = await t.save();
t.check('beating her remembers the day', s.flags['beat:sofia'] && s.rematch.sofia === today, s.rematch);

await t.press('z');
let r = await t.play();
t.check('the same day: no battle, «¡Mañana quiero la revancha!»', r.said.some((x) => x.includes('Mañana')) && !r.said.some((x) => x.includes('quiere luchar')), r.said);

await t.game(() => { globalThis.__today = '2999-01-01'; });
await t.press('z');
const yes = (opts) => (opts.includes('Sí') ? 'Sí' : undefined);
r = await t.play({ choose: yes, until: (u) => u.battle && /Conejito/.test(u.text) });
// Sofía's Conejito was level 3; with you at 15 it comes back at 11 (8 more at most).
const hud = await t.game(() => new Promise((ok) => { const id = setInterval(() => { const h = document.querySelector('.hud')?.textContent ?? ''; if (/Conejito/.test(h)) { clearInterval(id); ok(h); } }, 100); }));
t.check('a later day: she asks for a rematch', r.said.some((x) => x.startsWith('¡Hola otra vez')), r.said.slice(0, 2));
t.check('her team keeps up with you (up to 8 levels more)', /Conejito:?N11/.test(hud), hud);
await t.play({ choose: yes });
s = await t.save();
t.check('and remembers the new day', s.rematch.sofia === '2999-01-01' && s.flags['beat:sofia'], s.rematch);
await t.end();

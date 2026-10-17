// A new game: the title, boy or girl, your name, then your room; the Spanish fits you («lista»).
import { start } from './lib.mjs';

const t = await start('newgame');
await t.fresh();
await t.play({
  choose: (opts) => (opts.includes('Chica') ? 'Chica' : undefined),
  answers: ['Me llamo Ana'],
  // The title isn't a script (nothing is locked), so wait for the intro's last line.
  until: (s) => s.text.startsWith('¡Tu aventura empieza'),
});
await t.press('z');
await t.waitIdle();
const s = await t.save();
t.check('you chose to be a girl', s.gender === 'girl', s.gender);
t.check('your name is Ana', s.name === 'Ana', s.name);
t.check('you start at home', s.map === 'casa', s.map);
const filled = await t.game(() => [window.__game.fill('Estás list{o/a}.'), window.__game.fill('¡Bienvenid{o/a}!')]);
t.check('people talk to you as a girl', filled[0] === 'Estás lista.' && filled[1] === '¡Bienvenida!', filled);
await t.end();

// Marina's surf school: the currents carry you from the dock to platform A, then to platform C, then up to
// Marina; a wrong current carries you back to the dock. Marina gives the Medalla Ola.
import { start } from './lib.mjs';

const t = await start('gym3');
const party = [['nubarron', 34], ['aguacatono', 34]];
await t.fromSave({ map: 'gym_carey', x: 2, y: 14, dir: 'up', party, flags: { arribadaDone: true } });
const pos = async () => (await t.pos()).slice(1).join();
/** Step once (a current may carry you on), then play out whoever spots you. */
const step = async (dir) => {
  await t.walk(dir, 1);
  // A current keeps carrying you after the step: wait until you land.
  await t.page.waitForFunction(() => !window.__game.player.moving && !window.__game.player.slide);
  await t.play();
};

await step('up');
t.check('the first current carries you up to platform A', await pos() === '2,9', await pos());
await step('left');
await step('left');
t.check('a wrong current (left) carries you back to the dock', (await pos()).endsWith(',14'), await pos());
await t.warp('gym_carey', 3, 8, 'right');
await step('right');
t.check('the current right carries you to platform C', await pos() === '7,8', await pos());
await step('right');
await step('right');
await step('up');
t.check('the current up from C carries you to the top', await pos() === '9,2', await pos());
await t.game(() => window.__game.healParty());
await t.warp('gym_carey', 5, 2, 'up');
await t.press('z');
await t.play();
const s = await t.save();
t.check('Marina gives you the Medalla Ola', s.flags.medalOla && s.medals.includes('Ola'), s.medals);
await t.end();

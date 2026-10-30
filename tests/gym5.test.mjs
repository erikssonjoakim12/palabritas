// Ortiga's garden (gym 5): open but empty until the jaguar is saved (Ortiga waits at the temple); nettles hidden off the diary's way send
// you back to the door; the diary's way leads past the three trainers to Ortiga, who gives the Medalla Espina.
import { start } from './lib.mjs';

const t = await start('gym5');
const medals = ['Brisa', 'Barro', 'Ola', 'Chispa'];
const party = [['nacatamastin', 60], ['huracan', 60], ['volcasaurio', 60]];
const pos = async () => (await t.pos()).join();
/** Walk n tiles with short taps, one tile at a time (a held key can overshoot onto a nettle), playing out whoever spots you. */
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const go = async (dir, n) => {
  for (let i = 0; i < n; i++) {
    const before = await pos();
    // A tap facing another way only turns you: tap again.
    for (let k = 0; k < 2 && (await pos()) === before; k++) {
      await t.press(KEY[dir], 40);
      await t.page.waitForFunction(() => !window.__game.player.moving);
    }
    await t.play();
  }
};

// Before the temple: the gym is open but empty; the gardener says Ortiga went to the temple, and she's there.
await t.fromSave({ map: 'jaguar', x: 22, y: 7, dir: 'up', party, medals });
await t.walk('up', 2);
const empty = await t.game(() => ['ortiga', 'jardinera_azucena'].every((id) => !window.__game.npcById(id)?.visible));
let r = await t.talk('gym_jaguar', 7, 14, 'right');
t.check('before the temple, the gym is open but empty: Ortiga is at the temple', (await pos()).startsWith('gym_jaguar') && empty && r.said.some((x) => x.includes('Templo')), [await pos(), empty, r.said]);
r = await t.talk('templo', 16, 13, 'up');
t.check('Ortiga waits at the temple', r.said.some((x) => x.includes('Ortiga')), r.said);
r = await t.talk('casa_jaguar2', 1, 2, 'up');
t.check('Chepe’s mom feeds you gallo pinto', r.said.some((x) => x.includes('gallo pinto')), r.said);

await t.fromSave({ map: 'gym_jaguar', x: 6, y: 15, dir: 'up', party, medals, flags: { jaguarPiedra: true } });

await t.warp('gym_jaguar', 10, 12, 'left');
await t.walk('left', 1);
r = await t.play();
t.check('a hidden nettle sends you back to the door', await pos() === 'gym_jaguar,6,15' && r.said.some((x) => x.includes('ortigas')), [await pos(), r.said]);

// The diary's way: left at the fountain, the bridge, the orchids, right at the cacao tree, up the middle.
await go('up', 1);
await go('left', 1);
await go('up', 2);
await go('left', 3);
await go('up', 7);
await go('right', 5);
await go('up', 3);
const s0 = await t.save();
t.check('the diary’s way reaches Ortiga past all three trainers', await pos() === 'gym_jaguar,7,2' && ['jardinera_azucena', 'yerbero_chepe', 'botanica_iris'].every((id) => s0.flags[`beat:${id}`]), [await pos(), Object.keys(s0.flags).filter((f) => f.startsWith('beat:'))]);

await t.game(() => window.__game.healParty());
await t.press('z');
r = await t.play();
const s = await t.save();
t.check('Ortiga remembers the nettles', r.said.some((x) => x.includes('picaron')), r.said.slice(0, 3));
t.check('Ortiga gives the Medalla Espina: five medals, so Cut works', s.flags.medalEspina && s.medals.length === 5, [s.medals, r.said.slice(-4)]);
await t.end();

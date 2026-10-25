// Wild battles: winning with right answers, losing with wrong ones (back to a safe place),
// catching with a Palabola, and the start menu's Palabrita list.
import { start, sleep } from './lib.mjs';

const t = await start('battle');
await t.fromSave({ map: 'ruta1', x: 3, y: 3, dir: 'down', party: [['gotita', 2]] });

await t.wild('conejito', 2);
let r = await t.play();
let s = await t.save();
t.check('right answers win the battle', r.said.some((x) => x.includes('se debilitó')) && s.party[0].hp > 0, s.party[0].hp);
t.check('answered challenges in battle', r.answered > 0, r.answered);

await t.wild('pajarito', 2);
r = await t.play({ right: false });
s = await t.save();
t.check('wrong answers lose, and you wake up somewhere safe', s.map === s.heal.map, [s.map, s.heal.map]);

// Catching
await t.game(() => {
  const g = window.__game;
  g.healParty();
  g.G.save.flags.palabolas = true;
  g.G.save.bag = { palabola: 5 };
  Math.random = () => 0; // the ball always holds (the luck of a catch isn't what this tests)
  g.loadMap('ruta1', 3, 3, 'down');
});
let caught = false;
for (let tries = 0; tries < 5 && !caught; tries++) {
  let thrown = false;
  await t.wild('conejito', 2);
  if (tries === 0) await t.shot('battle');
  await t.play({
    choose: (opts) => {
      if (opts.includes('LUCHAR') && !thrown) return (thrown = true), 'MOCHILA';
      return opts.find((o) => o.includes('Palabola'));
    },
  });
  caught = (await t.save()).party.length > 1;
}
t.check('caught a Conejito with a Palabola', caught);

// A wild Palabrita you've caught shows a little Palabola in its box (one you haven't, doesn't).
await t.wild('conejito', 2);
await t.play({ until: (u) => u.menu.length > 0 });
const ball = await t.game(() => !document.querySelector('.hud .caught')?.hidden);
await t.play();
await t.wild('pajarito', 2);
await t.play({ until: (u) => u.menu.length > 0 });
const noBall = await t.game(() => !!document.querySelector('.hud .caught')?.hidden);
await t.play();
t.check('a caught Palabrita shows a Palabola in its box', ball && noBall, [ball, noBall]);

// START → PALABRITAS → details
await t.press('Enter');
await sleep(300);
await t.pick('PALABRITAS');
await sleep(200);
await t.game(() => document.querySelector('.fullpanel .list-row').click());
await sleep(200);
t.check('the team stays on screen under its menu', await t.game(() => !!document.querySelector('.fullpanel .list-row.sel')));
await t.pick('DETALLES');
await sleep(300);
await t.shot('details');
t.check('the details page opens', await t.game(() => !!document.querySelector('.fullpanel.detail')));
await t.end();

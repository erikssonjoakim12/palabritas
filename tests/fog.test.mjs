// The fog demo (?demo=niebla, plans/cadejos.md): it saves nothing; the black dog leads you along the fog's one road
// and leaves you lost; you find Tomás (he follows you); the fog thins one way, the white dog leads you both out;
// once he's home the fog lifts and the road is always the same. Also: fainting sends Tomás back to his clearing.
import { start, sleep } from './lib.mjs';
import { BASE } from '../tools/browser.mjs';

const t = await start('fog');
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const pos = () => t.game(() => { const g = window.__game; return [g.currentMap().id, g.player.x, g.player.y]; });
/** Until nothing runs: a long battle can outlast one play(). */
/** In battle, the second move: the first is Normal, which does nothing to Ismael's ghost Lamparita. */
const choose = (opts) => (opts.length === 4 && opts[0].startsWith('👆') ? opts[1] : undefined);
const idle = async () => {
  for (let i = 0; i < 6 && (await t.ui()).lock > 0; i++) await t.play({ choose });
  await settle();
};
const settle = () =>
  t.page.waitForFunction(() => !window.__game.player.moving && window.__game.G.lock === 0, { timeout: 20000 }).catch(async (e) => {
    await t.shot('stuck');
    console.log('stuck', await pos(), await t.game(() => [window.__game.G.lock, window.__game.fogWalk()]), await t.ui());
    throw e;
  });

/** One step (a tap; again if it only turned you), then whatever it starts is played out. */
async function step(dir) {
  const before = (await pos()).join();
  for (let k = 0; k < 3 && (await pos()).join() === before; k++) {
    await t.press(KEY[dir], 40);
    await sleep(30);
    await t.page.waitForFunction(() => !window.__game.player.moving, { timeout: 20000 });
    await sleep(30);
    if ((await t.ui()).lock > 0) await idle(); // only when the step started something (play() waits a while to be sure)
  }
}

/** Walk to (x, y) in this patch by the shortest open way (around whoever stands there), then off its edge going `out`. */
async function walkOut(x, y, out) {
  for (let guard = 0; guard < 40; guard++) {
    const [map, px, py] = await pos();
    if (px === x && py === y) break;
    const path = await t.game(([x, y]) => {
      const g = window.__game;
      const m = g.currentMap();
      const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const free = (a, b) => b >= 0 && a >= 0 && b < m.rows.length && a < m.rows[0].length && !g.TILES[g.tileAt(a, b)].solid && !m.npcs.some((n) => { const r = g.npcById(n.id); return r?.visible && r.x === a && r.y === b; });
      const from = new Map([[`${g.player.x},${g.player.y}`, null]]);
      const q = [[g.player.x, g.player.y]];
      while (q.length) {
        const [a, b] = q.shift();
        if (a === x && b === y) break;
        for (const [d, [dx, dy]] of Object.entries(D)) {
          const k = `${a + dx},${b + dy}`;
          if (from.has(k) || !free(a + dx, b + dy)) continue;
          from.set(k, [`${a},${b}`, d]);
          q.push([a + dx, b + dy]);
        }
      }
      const path = [];
      for (let k = `${x},${y}`, s = from.get(k); s; k = s[0], s = from.get(k)) path.unshift(s[1]);
      return path;
    }, [x, y]);
    if (!path.length) break;
    await step(path[0]);
    if ((await pos())[0] !== map) return; // a script moved you on
  }
  await step(out);
}

/** The middle of this patch's opening on a side, like the fog walk's own (region6.ts gap). */
const gap = (side) => t.game((side) => {
  const g = window.__game;
  const m = g.currentMap();
  const [w, h] = [m.rows[0].length, m.rows.length];
  const edge = side === 'up' || side === 'down' ? [...Array(w).keys()].map((x) => [x, side === 'up' ? 0 : h - 1]) : [...Array(h).keys()].map((y) => [side === 'left' ? 0 : w - 1, y]);
  const o = edge.filter(([x, y]) => !g.TILES[m.rows[y][x]].solid);
  return o[o.length >> 1];
}, side);
/** Leave this patch by a side: walk to its opening and on. */
const leaveBy = async (side) => {
  await t.game(() => window.__game.healParty()); // no healing in the fog, but this test is about the way, not the fights
  const [x, y] = await gap(side);
  await walkOut(x, y, side);
};
const walkState = () => t.game(() => window.__game.fogWalk());
/** Any way out of this patch (wandering, nobody leads). */
const openSide = async () => { for (const s of ['up', 'right', 'left', 'down']) if (await gap(s)) return s; };

// The demo: your real game stays as it was.
await t.page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await t.game(() => localStorage.setItem('palabritas.save.v1', JSON.stringify({ v: 1, name: 'Real', gender: 'girl', map: 'casa', x: 5, y: 2, dir: 'down', party: [], box: [], flags: {}, money: 7, bag: {}, rematch: {}, lessons: {}, medals: [], prog: {}, seen: [], caught: [], heal: { map: 'casa', x: 2, y: 4 }, settings: { textScale: 6 }, playMs: 0, answers: 0, correct: 0 })));
const realBefore = await t.game(() => localStorage.getItem('palabritas.save.v1'));
await t.page.goto(BASE + '/?demo=niebla', { waitUntil: 'networkidle0' });
await t.page.mouse.click(200, 200);
await sleep(400);
let r = await t.play();
t.check('the demo starts at the edge of the fog, with your name, and Doña Rosa asks for help', (await pos())[0] === 'niebla_borde' && r.said.some((x) => x.includes('Rosa')) && (await t.save()).name === 'Real', [await pos(), r.said]);
// No wild Palabritas while walking the fog; Rodrigo counts as beaten (one fight, Ismael's, keeps the test short).
await t.game(() => Object.assign(window.__game.G.save, { repel: 9999 }) && (window.__game.G.save.flags['beat:excursionista_rodrigo'] = true));
await t.shot('borde');

// Into the fog: the black dog leads along the road; straying off it shuffles you, and following it brings you back.
await leaveBy('up');
t.check('the trail leads into the fog', (await pos())[0] === 'niebla1', await pos());
await t.shot('fog');
let w = await walkState();
const strayFrom = w.exit === 'left' ? 'right' : 'left';
await leaveBy(strayFrom);
w = await walkState();
t.check('straying from the dog shuffles you off its road', !w.onRoad, w);
for (let i = 0; i < 12 && (await walkState()).phase === 'dog'; i++) {
  const s = await walkState();
  if (i === 2) await t.shot('dog');
  await leaveBy(s.exit);
}
w = await walkState();
const s1 = await t.save();
t.check('the dog leads you to the end of its road, past a lost trainer who fights you, then leaves you', w.phase === 'blind' && s1.flags['beat:espeleologo_ismael'], [w, Object.keys(s1.flags)]);

// Lost: a few patches alone, then the clearing, where Tomás joins you.
for (let i = 0; i < 6 && (await pos())[0] !== 'niebla_claro'; i++) await leaveBy(await openSide());
t.check('wandering alone you reach the clearing', (await pos())[0] === 'niebla_claro', await pos());
const boy = await t.game(() => { const n = window.__game.npcById('tomas_niebla'); return [n.x, n.y]; });
await walkOut(boy[0], boy[1] + 1, 'up'); // up to him from below: that only turns you to face him
await t.press('z');
r = await t.play();
await idle();
t.check('Tomás follows you', (await t.save()).follower?.look === 'tomas' && r.said.some((x) => x.includes('abuela')), r.said);
await t.shot('tomas');

// Fainting with Tomás: you wake up in his clearing, healed, with him beside you (the user).
await leaveBy(await openSide());
await t.game(() => { const g = window.__game; g.G.save.party.forEach((m) => (m.hp = 0)); });
await t.game(() => { window.__game.runScript(() => window.__game.blackout()); }); // not awaited: play() reads it
r = await t.play();
await idle();
const s4 = await t.save();
t.check('fainting with Tomás, you wake up in his clearing, healed, and he is beside you', (await pos())[0] === 'niebla_claro' && s4.follower?.look === 'tomas' && s4.party.every((m) => m.hp > 0) && r.said.some((x) => x.includes('a tu lado')), [await pos(), r.said]);

// The lighter fog: going its way clears it, until the white dog comes and leads you out.
for (let i = 0; i < 30 && (await pos())[0] !== 'niebla_borde'; i++) {
  const s = await walkState();
  if (s.phase === 'white' && i % 3 === 0) await t.shot('white');
  await leaveBy(s.exit);
}
const s2 = await t.save();
t.check('following the lighter fog and the white dog, you come out with Tomás', (await pos())[0] === 'niebla_borde' && s2.flags.nieblaSalida && s2.follower, [await pos(), s2.follower]);
await t.shot('out');

// Pet the white dog; Tomás home; the fog lifts and the road is fixed.
r = await t.talk('niebla_borde', 6, 2, 'down');
t.check('you pet the white dog', r.said.some((x) => x.includes('Acaricias')), r.said);
r = await t.talk('niebla_borde', 6, 8, 'right');
const s3 = await t.save();
t.check('Tomás is home and the fog lifts', s3.flags.tomasEnCasa && !s3.follower && r.said.some((x) => x.includes('levantando')), r.said);
await t.walk('up', 1);
await leaveBy('up');
const road = [];
for (let i = 0; i < 9; i++) {
  const [map] = await pos();
  road.push(map);
  if (i === 1) await t.shot('lifted');
  const exit = await t.game(() => window.__game.fogWalk().roadExit);
  if (!exit) break;
  await leaveBy(exit);
}
t.check('once lifted, the road is the dog’s road, the same every time', road.join() === 'niebla1,niebla3,niebla2,niebla4,niebla6,niebla5,niebla1,niebla2', road);

t.check('nothing was saved: your real game is as it was', (await t.game(() => localStorage.getItem('palabritas.save.v1'))) === realBefore);
await t.end();

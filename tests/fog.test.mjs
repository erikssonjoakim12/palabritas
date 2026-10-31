// The fog demo (?demo=niebla, plans/cadejos.md) on the Cerro de la Niebla: it saves nothing; the mountain's patches
// join up; the black dog waits twice a patch and leads along its road; straying loses it for 2-3 patches; at the end
// of its road it leaves you; you find Tomás (he follows you); fainting wakes you in his clearing; the lighter fog and
// the white dog lead you down the way back; once he's home the fog lifts and the mountain is an open route.
// Long stretches are jumped over (fogJump), so the test stays short.
import { start, sleep } from './lib.mjs';
import { BASE } from '../tools/browser.mjs';

const t = await start('fog');
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const pos = () => t.game(() => { const g = window.__game; return [g.currentMap().id, g.player.x, g.player.y]; });
const fog = () => t.game(() => window.__game.fogWalk());
/** In battle, the second move: the first is Normal, which does nothing to a ghost Lamparita. */
const choose = (opts) => (opts.length === 4 && opts[0].startsWith('👆') ? opts[1] : undefined);
/** Until nothing runs: a long battle can outlast one play(). */
const idle = async () => {
  for (let i = 0; i < 6 && (await t.ui()).lock > 0; i++) await t.play({ choose });
  await t.page.waitForFunction(() => !window.__game.player.moving && window.__game.G.lock === 0, { timeout: 20000 });
};

/** One step (a tap; again if it only turned you); whatever it starts is played out. */
async function step(dir) {
  const before = (await pos()).join();
  for (let k = 0; k < 3 && (await pos()).join() === before; k++) {
    await t.press(KEY[dir], 40);
    await sleep(30);
    await t.page.waitForFunction(() => !window.__game.player.moving, { timeout: 20000 });
    await sleep(30);
    if ((await t.ui()).lock > 0) await idle();
  }
}

/** Walk to (x, y) inside this patch by the shortest open way (around whoever stands there); false if a script moved you on. */
async function walkTo(x, y) {
  for (let guard = 0; guard < 60; guard++) {
    const [map, px, py] = await pos();
    if (px === x && py === y) return true;
    const dir = await t.game(([x, y]) => {
      const g = window.__game;
      const m = g.currentMap();
      const P = m.fogPatch ?? [m.rows[0].length, m.rows.length];
      const cell = (a, b) => (m.fogLifts?.() ? '' : `${Math.floor(a / P[0])},${Math.floor(b / P[1])}`); // the fog's patches
      const mine = cell(g.player.x, g.player.y);
      const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const free = (a, b) => b >= 0 && a >= 0 && b < m.rows.length && a < m.rows[0].length && cell(a, b) === mine &&
        !g.TILES[g.tileAt(a, b)].solid && !m.npcs.some((n) => { const r = g.npcById(n.id); return r?.visible && r.x === a && r.y === b; });
      const from = new Map([[`${x},${y}`, null]]);
      const q = [[x, y]];
      while (q.length) {
        const [a, b] = q.shift();
        for (const [d, [dx, dy]] of Object.entries(D)) {
          const [na, nb] = [a + dx, b + dy];
          if (na === g.player.x && nb === g.player.y) return { up: 'down', down: 'up', left: 'right', right: 'left' }[d];
          const k = `${na},${nb}`;
          if (from.has(k) || !free(na, nb)) continue;
          from.set(k, d);
          q.push([na, nb]);
        }
      }
      return null;
    }, [x, y]);
    if (!dir) return false;
    await step(dir);
    if ((await pos())[0] !== map) return false;
  }
  return false;
}
/** Leave this patch by a side: walk to its way through, and on. */
async function leaveBy(side) {
  await t.game(() => window.__game.healParty()); // no healing in the fog, but this test is about the way, not the fights
  const before = (await fog()).cell + '';
  const [x, y] = (await fog()).gaps[side];
  if (await walkTo(x, y)) await step(side);
  return (await fog()).cell + '' !== before || (await pos())[0] !== 'cerro_niebla';
}
const others = async (not) => Object.keys((await fog()).gaps).filter((s) => s !== not);

// The demo: your real game stays as it was.
await t.page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await t.game(() => localStorage.setItem('palabritas.save.v1', JSON.stringify({ v: 1, name: 'Real', gender: 'girl', map: 'casa', x: 5, y: 2, dir: 'down', party: [], box: [], flags: {}, money: 7, bag: {}, rematch: {}, lessons: {}, medals: [], prog: {}, seen: [], caught: [], heal: { map: 'casa', x: 2, y: 4 }, settings: { textScale: 6 }, playMs: 0, answers: 0, correct: 0 })));
const realBefore = await t.game(() => localStorage.getItem('palabritas.save.v1'));
await t.page.goto(BASE + '/?demo=niebla', { waitUntil: 'networkidle0' });
await t.page.mouse.click(200, 200);
await sleep(400);
let r = await t.play();
t.check('the demo starts at the edge of the fog, with your name, and Doña Rosa asks for help', (await pos())[0] === 'niebla_borde' && r.said.some((x) => x.includes('Rosa')) && (await t.save()).name === 'Real', [await pos(), r.said]);
// No wild Palabritas while walking; all but two lost trainers count as beaten (their fights would only make it long).
await t.game(() => {
  const s = window.__game.G.save;
  s.repel = 9999;
  for (const id of ['excursionista_rodrigo', 'lenador_abel', 'espeleologo_ismael', 'observadora_marta', 'cafetalero_julio', 'ciclista_kevin', 'guardaparque_elena', 'musico_rafa']) s.flags[`beat:${id}`] = true;
});

// The mountain: one map of 5×5 patches, every one reachable once the fog lifts, a rare Puercoespín in the meadow.
const shape = await t.game(() => {
  const g = window.__game;
  const m = g.MAPS.cerro_niebla;
  const [W, H] = m.fogPatch;
  const free = (x, y) => y >= 0 && x >= 0 && y < m.rows.length && x < m.rows[0].length && !g.TILES[m.rows[y][x]].solid;
  const seen = new Set(['44,79']);
  const q = [[44, 79]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const k = `${x + dx},${y + dy}`;
      if (!seen.has(k) && free(x + dx, y + dy)) (seen.add(k), q.push([x + dx, y + dy]));
    }
  }
  const cells = new Set([...seen].map((k) => k.split(',').map(Number)).map(([x, y]) => `${Math.floor(x / W)},${Math.floor(y / H)}`));
  const grass = m.rows.join('').split(',').length - 1;
  return { size: [m.rows[0].length, m.rows.length], cells: cells.size, grass, rare: m.encounterZones[0].table.some((e) => e.sp === 'puercoespin') };
});
t.check('the mountain is one map of 25 patches (18×16), all joined, with lots of grass and a rare Puercoespín', shape.size + '' === '90,80' && shape.cells === 25 && shape.grass > 1500 && shape.rare, shape);

// Into the fog; from the first patch, back down is back out.
await t.walk('up', 1);
await walkTo(6, 0);
await idle();
t.check('the trail leads into the fog', (await pos())[0] === 'cerro_niebla' && (await fog()).cell + '' === '2,4', [await pos(), (await fog()).cell]);
await t.shot('fog');
await leaveBy('down');
t.check('from the first patch, back the way you came is back out', (await pos())[0] === 'niebla_borde', await pos());
await walkTo(6, 0);
await idle();

// The black dog waits halfway, then by the way out, and leads along its road (past a lost trainer who fights).
let w = await fog();
const dog = () => t.game(() => { const n = window.__game.npcById('cadenegro'); return n.visible ? [n.x, n.y] : null; });
const firstSpot = await dog();
const halfway = w.spots[0];
await walkTo(...halfway);
const secondSpot = await dog();
t.check('the black dog waits twice in a patch: halfway, then by the way out', firstSpot + '' === w.spots[0] + '' && secondSpot + '' === w.spots[1] + '', [firstSpot, secondSpot, w.spots]);
await t.shot('dog');
for (let i = 0; i < 3; i++) await leaveBy((await fog()).exit);
w = await fog();
t.check('following the dog walks its road (Campista Lorena fights on the way)', w.onWay && w.step === 3 && (await t.save()).flags['beat:campista_lorena'], w);

// Straying: no dog for 2-3 patches, then it finds you and leads you back onto its road.
await leaveBy((await others(w.exit))[0]);
let without = 0;
for (let i = 0; i < 5 && (await fog()).lostFor > 0; i++) {
  if (!(await dog())) without++;
  await leaveBy((await others())[0]);
}
const found = await dog();
await leaveBy((await fog()).exit);
w = await fog();
t.check('straying loses the dog for 2-3 patches; then it leads you back onto its road', without >= 2 && without <= 3 && found && w.onWay && w.step === 3, [without, found, w]);

// The end of its road: it leaves you. Alone, 4 patches, then the clearing; Tomás comes along.
await t.game(() => window.__game.fogJump('dog', 15));
w = await fog();
await walkTo(...w.spots[0]);
await idle();
t.check('at the end of its road the dog leaves you', (await fog()).phase === 'blind', await fog());
for (let i = 0; i < 6 && (await fog()).cell + '' !== '3,0'; i++) await leaveBy((await others())[0]);
t.check('wandering alone you reach the clearing', (await fog()).cell + '' === '3,0', (await fog()).cell);
const boy = await t.game(() => { const n = window.__game.npcById('tomas_niebla'); return [n.x, n.y]; });
await walkTo(boy[0], boy[1] + 1);
await step('up'); // facing him
await t.press('z');
r = await t.play();
await idle();
t.check('Tomás follows you', (await t.save()).follower?.look === 'tomas' && r.said.some((x) => x.includes('abuela')), r.said);
await t.shot('tomas');

// Fainting with Tomás: you wake up in his clearing, healed, with him beside you.
await leaveBy((await fog()).exit);
await t.game(() => { window.__game.G.save.party.forEach((m) => (m.hp = 0)); window.__game.runScript(() => window.__game.blackout()); });
r = await t.play();
await idle();
const s4 = await t.save();
t.check('fainting with Tomás, you wake up in his clearing, healed, with him beside you', (await fog()).cell + '' === '3,0' && s4.follower?.look === 'tomas' && s4.party.every((m) => m.hp > 0) && r.said.some((x) => x.includes('a tu lado')), [(await fog()).cell, r.said]);

// The way back: the lighter fog leads along it; stray, and it leads you back onto it.
await leaveBy((await fog()).exit);
await leaveBy((await others((await fog()).exit))[0]);
t.check('off the way back, the fog shuffles you', !(await fog()).onWay, await fog());
await leaveBy((await fog()).exit);
w = await fog();
t.check('the lighter fog leads you back onto the way back', w.onWay && w.step === 1 && w.cell + '' === '4,0', w);
await t.game(() => window.__game.fogJump('light', 3));
for (let i = 0; i < 8 && (await pos())[0] === 'cerro_niebla'; i++) {
  if ((await fog()).phase === 'white' && i < 3) await t.shot('white');
  await leaveBy((await fog()).exit);
}
const s5 = await t.save();
t.check('the white dog comes and leads you out, past Turista Paola', (await pos())[0] === 'niebla_borde' && s5.flags.nieblaSalida && s5.follower && s5.flags['beat:turista_paola'], [await pos(), s5.follower]);
await t.shot('out');

// Pet the white dog; Tomás home; the fog lifts: the mountain is open, like any route.
r = await t.talk('niebla_borde', 6, 2, 'down');
t.check('you pet the white dog', r.said.some((x) => x.includes('Acaricias')), r.said);
r = await t.talk('niebla_borde', 6, 8, 'right');
const s3 = await t.save();
t.check('Tomás is home and the fog lifts', s3.flags.tomasEnCasa && !s3.follower && r.said.some((x) => x.includes('levantando')), r.said);
await walkTo(6, 0);
await idle();
await walkTo(44, 71);
await walkTo(34, 71); // from the trail's patch into the next one, on foot
t.check('once lifted, you walk from patch to patch like any route', (await pos()) + '' === 'cerro_niebla,34,71', await pos());
await t.shot('lifted');

t.check('nothing was saved: your real game is as it was', (await t.game(() => localStorage.getItem('palabritas.save.v1'))) === realBefore);
await t.end();

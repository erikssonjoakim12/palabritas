// Every map, checked without playing (fast, and it catches most mistakes in new maps):
// rows, tiles, doors, exits, connections (both ways, lined up), NPCs (looks, scripts, standing on
// open ground), gates, encounter tables, and that every way out can be reached from every way in
// (ledges are one-way). Run it after adding or changing any map.
import { start } from './lib.mjs';
import { BASE } from '../tools/browser.mjs';

const t = await start('maps');
await t.page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await t.page.waitForFunction(() => window.__game?.MAPS);

const report = await t.game(() => {
  const g = window.__game;
  const { MAPS, TILES, LOOKS, OBJECTS_ART, SCRIPTS, SPECIES, TRAINERS } = g;
  const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const out = {};
  const size = (m) => [m.rows[0].length, m.rows.length];
  const inside = (m, x, y) => x >= 0 && y >= 0 && y < m.rows.length && x < m.rows[0].length;
  const tile = (m, x, y) => (inside(m, x, y) ? m.rows[y][x] : m.border ?? (m.outdoor ? 'T' : ' '));
  const open = (m, x, y) => inside(m, x, y) && TILES[tile(m, x, y)] && !TILES[tile(m, x, y)].solid;

  /** The tiles along an edge that has a connection, and where each one lands in the other map. */
  function seam(m, dir, conn) {
    const n = MAPS[conn.to];
    const [w, h] = size(m);
    const [w2, h2] = size(n);
    const pairs = [];
    if (dir === 'up' || dir === 'down') {
      for (let x = 0; x < w; x++) pairs.push([[x, dir === 'up' ? 0 : h - 1], [x + conn.offset, dir === 'up' ? h2 - 1 : 0]]);
    } else {
      for (let y = 0; y < h; y++) pairs.push([[dir === 'left' ? 0 : w - 1, y], [dir === 'left' ? w2 - 1 : 0, y + conn.offset]]);
    }
    return pairs;
  }

  for (const m of Object.values(MAPS)) {
    const problems = [];
    const say = (s) => problems.push(s);
    const [w, h] = size(m);
    m.rows.forEach((r, i) => r.length !== w && say(`row ${i} is ${r.length} wide, not ${w}`));
    m.rows.forEach((r, y) => [...r].forEach((ch, x) => !TILES[ch] && say(`unknown tile '${ch}' at ${x},${y}`)));

    // Connections: the other map connects back, and at least part of the edge is walkable on both sides
    // (scenery connections are only for the view: nothing lines up to walk across).
    for (const [dir, conn] of Object.entries(m.connections ?? {})) {
      const n = MAPS[conn.to];
      if (!n) { say(`connection ${dir} to missing map ${conn.to}`); continue; }
      const back = n.connections?.[OPP[dir]];
      if (!back || back.to !== m.id || back.offset !== -conn.offset || !back.scenery !== !conn.scenery) say(`${conn.to} doesn't connect back ${OPP[dir]} with offset ${-conn.offset}`);
      const pairs = seam(m, dir, conn);
      const both = pairs.filter(([[x, y], [x2, y2]]) => open(m, x, y) && open(n, x2, y2));
      const dead = pairs.filter(([[x, y], [x2, y2]]) => open(m, x, y) && inside(n, x2, y2) && !open(n, x2, y2));
      if (conn.scenery) {
        if (both.length) say(`scenery connection ${dir} to ${conn.to}: walkable tiles line up`);
        continue;
      }
      if (!both.length) say(`connection ${dir} to ${conn.to}: no walkable tile lines up`);
      if (dead.length) say(`connection ${dir} to ${conn.to}: open edge tiles face a wall at ${dead.map(([[x, y]]) => `${x},${y}`).join(' ')}`);
    }
    for (const d of m.doors ?? []) {
      const n = MAPS[d.to];
      if (!inside(m, d.x, d.y)) say(`door at ${d.x},${d.y} is outside the map`);
      if (!n) say(`door at ${d.x},${d.y} to missing map ${d.to}`);
      else if (!open(n, d.tx, d.ty)) say(`door at ${d.x},${d.y} lands on a wall in ${d.to} (${d.tx},${d.ty})`);
    }
    if (m.exit && (!MAPS[m.exit.to] || !open(MAPS[m.exit.to], m.exit.x, m.exit.y))) say(`exit lands on a wall in ${m.exit.to} (${m.exit.x},${m.exit.y})`);

    // People and objects.
    for (const n of m.npcs ?? []) {
      if (!inside(m, n.x, n.y)) { say(`${n.id} is outside the map`); continue; }
      // People need open ground; objects may sit on tables and counters (the starter balls).
      if (n.look && TILES[tile(m, n.x, n.y)]?.solid) say(`${n.id} stands on a wall (${n.x},${n.y})`);
      if (n.look && !LOOKS[n.look]) say(`${n.id} has an unknown look '${n.look}'`);
      if (n.object && !OBJECTS_ART[n.object]) say(`${n.id} is an unknown object '${n.object}'`);
      if (!SCRIPTS[n.script]) say(`${n.id} has no script '${n.script}'`);
      if (n.sight) {
        const [dx, dy] = D[n.dir ?? 'down'];
        for (let i = 1; i <= n.sight; i++) if (!open(m, n.x + dx * i, n.y + dy * i)) say(`${n.id} looks into a wall within its sight (${n.sight})`);
      }
      const tr = TRAINERS[n.id];
      if (tr) for (const [sp] of tr.team) !SPECIES[sp] && say(`trainer ${n.id} has unknown species ${sp}`);
    }
    for (const tr of m.triggers ?? []) !SCRIPTS[tr.script] && say(`trigger at ${tr.x},${tr.y} has no script '${tr.script}'`);
    for (const s of m.signs ?? []) !inside(m, s.x, s.y) && say(`sign at ${s.x},${s.y} is outside the map`);
    for (const gt of m.gates ?? []) {
      for (const [x, y] of [gt.at, gt.aside, ...gt.road]) if (!open(m, x, y)) say(`gate ${gt.id}: ${x},${y} isn't open ground`);
    }
    for (const e of m.encounters?.table ?? []) {
      if (!SPECIES[e.sp]) say(`encounter: unknown species ${e.sp}`);
      if (e.min > e.max) say(`encounter: ${e.sp} min ${e.min} > max ${e.max}`);
    }

    // Ways in and out.
    const arrivals = [];
    for (const o of Object.values(MAPS)) {
      for (const d of o.doors ?? []) if (d.to === m.id) arrivals.push([d.tx, d.ty]);
      if (o.exit?.to === m.id) arrivals.push([o.exit.x, o.exit.y]);
    }
    if (m.id === 'casa') arrivals.push([5, 2]); // a new game starts here
    const exits = [];
    for (const d of m.doors ?? []) exits.push([d.x, d.y]);
    for (const [dir, conn] of Object.entries(m.connections ?? {})) {
      if (!MAPS[conn.to] || conn.scenery) continue;
      for (const [[x, y]] of seam(m, dir, conn)) if (open(m, x, y)) { exits.push([x, y]); arrivals.push([x, y]); }
    }
    if (m.exit) m.rows.forEach((r, y) => [...r].forEach((ch, x) => TILES[ch]?.kind === 'mat' && exits.push([x, y])));

    // NPCs that are always there block their tile (gate guards and item balls come and go).
    const blocked = new Set((m.npcs ?? []).filter((n) => !n.show).map((n) => `${n.x},${n.y}`));
    const reach = (from) => {
      const seen = new Set([from.join()]);
      const q = [from];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dir, [dx, dy]] of Object.entries(D)) {
          let [nx, ny] = [x + dx, y + dy];
          if (TILES[tile(m, nx, ny)]?.ledge === dir) [nx, ny] = [nx + dx, ny + dy];
          const k = `${nx},${ny}`;
          if (!open(m, nx, ny) || blocked.has(k) || seen.has(k)) continue;
          seen.add(k);
          q.push([nx, ny]);
        }
      }
      return seen;
    };
    const anyIn = new Set();
    for (const a of arrivals) {
      if (!open(m, ...a)) continue;
      const r = reach(a);
      r.forEach((k) => anyIn.add(k));
      if (exits.length && !exits.some((e) => r.has(e.join()))) say(`arriving at ${a} you can't reach any way out`);
    }
    if (arrivals.length) for (const e of exits) if (!anyIn.has(e.join())) say(`the way out at ${e} can't be reached from any way in`);
    out[m.id] = problems;
  }
  return out;
});

for (const [id, problems] of Object.entries(report)) t.check(`map ${id}`, problems.length === 0, problems.join('; '));
await t.end();

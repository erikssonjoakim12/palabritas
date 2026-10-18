// Check the curriculum and simulate leveling with the real learning code (silent).
import { launch, newPage, BASE } from './browser.mjs';
const browser = await launch();
const page = await newPage(browser);
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
// SIM_RIGHT=1 node tools/sim.mjs: every answer right (the shape of the curve without luck). Default 0.85.
const RIGHT = Number(process.env.SIM_RIGHT ?? 0.85);
// SIM_SP=piedrita: which Palabrita to level (default a starter).
const SP = process.env.SIM_SP ?? 'salchichita';
const out = await page.evaluate(async ([RIGHT, SP]) => {
  const state = await import('/src/game/state.ts');
  const L = await import('/src/game/learning.ts');
  const M = await import('/src/game/mon.ts');
  const C = await import('/src/game/curriculum.ts');
  const { THEMES, ITEMS } = await import('/src/data/content/index.ts');
  const { SPECIES } = await import('/src/data/species.ts');
  const r = {};
  r.coreItems = THEMES.core.items.length;
  r.sharedInThemes = Object.fromEntries(Object.keys(THEMES).map((t) => [t, THEMES[t].items.filter((i) => i.theme !== t).length]));
  r.perLevel = Object.fromEntries(Object.keys(SPECIES).map((s) => [s, [2, 3, 4, 5, 6, 8, 10, 12, 15, 19, 20, 21, 30].map((l) => C.levelItems(s, l).length).join(' ')]));
  const core20 = (sp) => new Set(C.itemsUpTo(sp, 20).filter((i) => i.theme === 'core').map((i) => i.id));
  const inter = (a, b) => [...a].filter((x) => b.has(x)).length;
  r.starterShared = { salch_gotita: inter(core20('salchichita'), core20('gotita')), salch: core20('salchichita').size, gotita: core20('gotita').size };
  r.wildOverlap = { pajarito_conejito: inter(core20('pajarito'), core20('conejito')), pajarito: core20('pajarito').size };
  r.union = new Set(Object.keys(SPECIES).flatMap((s) => [...core20(s)])).size;
  r.salchL5 = C.levelItems('salchichita', 5).map((i) => i.es);
  r.pajL5 = C.levelItems('pajarito', 5).map((i) => i.es);

  // Simulation: answers per level for a starter.
  const runs = [];
  for (const run of [0, 1, 2, 3, 4, 5, 6, 7]) {
    state.G.save = state.newSave();
    const mon = M.newMon(SP, 5);
    state.G.save.party = [mon];
    let answers = 0, start = 0;
    const per = {};
    const recent = [];
    while (mon.level < 31 && answers < 8000) {
      const item = L.pickForMon(mon, recent);
      recent.push(item.id); if (recent.length > 3) recent.shift();
      const grade = Math.random() < RIGHT ? 'perfect' : 'wrong';
      await new Promise((res) => setTimeout(res, 1));
      L.record(item, 'type', grade, false);
      answers++;
      if (grade !== 'wrong') for (const up of M.checkLevelUps()) { per[up.from] = answers - start; start = answers; }
    }
    runs.push(per);
  }
  r.answers = {};
  for (let l = 5; l <= 30; l++) r.answers[l] = Math.round(runs.reduce((s, x) => s + (x[l] ?? 0), 0) / runs.length);
  r.defensePaj7 = [...new Set(Array.from({ length: 30 }, () => L.defenseItem({ sp: 'pajarito', level: 7 }).es))];
  r.pajL6 = C.levelItems('pajarito', 6).map((i) => i.es);
  r.defenseL2 = [...new Set(Array.from({ length: 20 }, () => L.defenseItem({ sp: 'conejito', level: 2 }).es))];
  r.conL2 = C.levelItems('conejito', 2).map((i) => i.es);

  // Migration: an old save with progress on ids that are now shared.
  const old = state.newSave();
  old.prog = { 'tiempo:el agua': { seen: 2, right: 2, wrong: 0, learned: true, box: 1, due: 0, last: 0 }, 'saludos:adiós': { seen: 1, right: 1, wrong: 0, learned: true, box: 1, due: 0, last: 0 } };
  localStorage.setItem('palabritas.save.v1', JSON.stringify(old));
  state.loadGame();
  r.migrated = Object.keys(state.G.save.prog);
  localStorage.removeItem('palabritas.save.v1');
  return r;
}, [RIGHT, SP]);
console.log(JSON.stringify(out, null, 1));
await browser.close();

// Data checks without playing: every Palabrita has art, a known theme, moves, and words for every
// level up to 30 (none twice); evolutions point to real Palabritas; the art page loads cleanly.
import { start } from './lib.mjs';
import { BASE } from '../tools/browser.mjs';

const t = await start('data');
await t.page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await t.page.waitForFunction(() => window.__game?.SPECIES);

const report = await t.game(() => {
  const g = window.__game;
  const out = {};
  for (const sp of Object.values(g.SPECIES)) {
    const p = [];
    if (!g.CREATURE_ART[sp.id]) p.push('no art');
    if (!g.content.THEMES[sp.theme]) p.push(`unknown theme ${sp.theme}`);
    if (sp.moves.length !== 4) p.push(`${sp.moves.length} moves`);
    if (sp.evolves && !g.SPECIES[sp.evolves.to]) p.push(`evolves into unknown ${sp.evolves.to}`);
    const max = g.curriculum.maxLevel(sp.id);
    if (max < 30) p.push(`words only up to level ${max}`);
    for (let l = 2; l <= Math.min(30, max); l++) if (!g.curriculum.levelItems(sp.id, l).length) p.push(`no words at level ${l}`);
    const ids = g.curriculum.allItems(sp.id).map((i) => i.id);
    if (new Set(ids).size !== ids.length) p.push('a word twice');
    out[sp.id] = p;
  }
  return out;
});
for (const [id, problems] of Object.entries(report)) t.check(`Palabrita ${id}`, problems.length === 0, problems.join('; '));

// Every item a shop sells can be ordered: «Quiero una X» and «Quiero dos Xs» (also without accents).
const orders = await t.game(async () => {
  const { gradeOrder } = await import('/src/lang/order.ts');
  const { ITEM_DEFS, SHOPS } = window.__game;
  const strip = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return [...new Set(Object.values(SHOPS).flat())].map((id) => {
    const d = ITEM_DEFS[id];
    const one = `Quiero ${d.feminine ? 'una' : 'un'} ${d.name}`;
    const two = `Quiero dos ${d.plural}`;
    return [id, gradeOrder(one, id, 1), gradeOrder(two, id, 2), gradeOrder(strip(two), id, 2), !!d.key];
  });
});
for (const [id, one, two, plain, key] of orders) {
  t.check(`shop item ${id} can be ordered`, one === 'perfect' && two === 'perfect' && plain && !key, [one, two, plain]);
}

const art = await t.page.browser().newPage();
const artErrors = [];
art.on('pageerror', (e) => artErrors.push(e.message));
await art.goto(BASE + '/art.html', { waitUntil: 'networkidle0' });
t.check('the art page loads without errors', artErrors.length === 0, artErrors.join(' | '));
await t.end();

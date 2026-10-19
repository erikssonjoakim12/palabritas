// Data checks without playing: every Palabrita has art, a known theme, moves, and words for every
// level up to 50 (none twice); evolutions point to real Palabritas; the art page and the dictionary load cleanly.
import { start } from './lib.mjs';
import { BASE } from '../tools/browser.mjs';
import { readFileSync } from 'fs';

const t = await start('data');
await t.page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await t.page.waitForFunction(() => window.__game?.SPECIES);

const report = await t.game(() => {
  const g = window.__game;
  const out = {};
  for (const sp of Object.values(g.SPECIES)) {
    const p = [];
    if (!g.CREATURE_IDS.includes(sp.id)) p.push('no art');
    if (!g.content.THEMES[sp.theme]) p.push(`unknown theme ${sp.theme}`);
    if (sp.moves.length !== 4) p.push(`${sp.moves.length} moves`);
    if (sp.evolves && !g.SPECIES[sp.evolves.to]) p.push(`evolves into unknown ${sp.evolves.to}`);
    const max = g.curriculum.maxLevel(sp.id);
    if (max < 50) p.push(`words only up to level ${max}`);
    for (let l = 2; l <= Math.min(50, max); l++) if (!g.curriculum.levelItems(sp.id, l).length) p.push(`no words at level ${l}`);
    const ids = g.curriculum.allItems(sp.id).map((i) => i.id);
    if (new Set(ids).size !== ids.length) p.push('a word twice');
    out[sp.id] = p;
  }
  return out;
});
for (const [id, problems] of Object.entries(report)) t.check(`Palabrita ${id}`, problems.length === 0, problems.join('; '));

// The same Spanish in two lists must mean the same thing: only the first list's English is kept.
const conflicts = await t.game(() => window.__game.content.EN_CONFLICTS);
t.check('shared Spanish has the same English everywhere', conflicts.length === 0, conflicts.join(' · '));

// The work per level (new items × the answers each needs, plus the review) never goes down, for any Palabrita.
const drops = await t.game(() => {
  const { curriculum: C, SPECIES } = window.__game;
  const out = [];
  for (const sp of Object.keys(SPECIES)) {
    let last = 0;
    for (let L = 2; L <= 50; L++) {
      const items = C.levelItems(sp, L);
      const review = L - C.REVIEW_GAP >= 2 ? Math.ceil(C.levelItems(sp, L - C.REVIEW_GAP).length * C.REVIEW_SHARE) : 0;
      const work = items.reduce((s, i) => s + C.answersToMaster(i.tier), 0) + review;
      if (work < last) out.push(`${sp} ${L}: ${last}→${work}`);
      last = work;
    }
  }
  return out;
});
t.check('the work per level never goes down', drops.length === 0, drops.slice(0, 5).join(', '));

// Mariposita and Sillón keep their words (they must not change by accident: saves have them). The snapshot was
// taken after the families grew and the levels were evened out; regenerate it only on purpose.
const before = JSON.parse(readFileSync(new URL('./fixtures/words-before-families.json', import.meta.url), 'utf8'));
const after = await t.game((sps) => Object.fromEntries(sps.map((sp) => [sp, window.__game.curriculum.itemsUpTo(sp, 30).map((i) => i.id)])), Object.keys(before));
for (const sp of Object.keys(before)) t.check(`${sp} keeps its words up to level 30`, JSON.stringify(after[sp]) === JSON.stringify(before[sp]), `${after[sp].length} vs ${before[sp].length}`);

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
await art.goto(BASE + '/palabras.html', { waitUntil: 'networkidle0' });
const rowsShown = await art.evaluate(() => document.querySelectorAll('#words tr').length);
t.check('the dictionary page loads and lists the words', artErrors.length === 0 && rowsShown > 3000, [rowsShown, ...artErrors]);
// The music page arranges every song when it loads: a bar that doesn't fit throws (nothing plays: the test is silent).
await art.goto(BASE + '/musica.html', { waitUntil: 'networkidle0' });
const songs = await art.evaluate(() => document.querySelectorAll('.song').length);
t.check('the music page loads and every song fits its bars', artErrors.length === 0 && songs >= 20, [songs, ...artErrors]);
await t.end();

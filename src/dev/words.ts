// The dictionary page (palabras.html, `npm run words`): every word and phrase the game teaches, which lists use
// it at which level, and which Palabritas learn it. Published next to the game as palabras.html.
import { ITEMS, THEMES, type Item } from '../data/content';
import { SPECIES, DEX_ORDER, firstForm } from '../data/species';
import { el } from '../engine/dom';

const root = document.getElementById('words')!;

/** A table that scrolls sideways on narrow screens. */
const wrapped = (table: HTMLElement) => {
  const w = el('div', 'wrap');
  w.append(table);
  return w;
};

/** The families that learn each list ("Gotita → Nubarrón → Huracán"), in dex order; the core list is learned by all. */
const families: Record<string, string[]> = {};
const family: Record<string, string[]> = {};
for (const id of DEX_ORDER) {
  const first = firstForm(id);
  if (!family[first]) (families[SPECIES[id].theme] ??= []).push(first);
  (family[first] ??= []).push(SPECIES[id].name);
}
/** Lists no Palabrita learns are the schools' topics: their tiers are difficulty bands, not levels. */
const isTopic = (list: string) => list !== 'core' && !families[list];
const listName = (list: string) => (list === 'core' ? 'Núcleo' : THEMES[list].name);
const where = (list: string, tier: number) => (isTopic(list) ? `${listName(list)} · dificultad ${tier}` : `${listName(list)} · Nv ${tier}`);

/** Every place an item is taught: list and level (a shared item has several). */
const uses = new Map<Item, { list: string; tier: number }[]>();
for (const theme of Object.values(THEMES)) {
  for (const [tier, items] of Object.entries(theme.levels)) for (const item of items) {
    const u = uses.get(item) ?? [];
    u.push({ list: theme.id, tier: Number(tier) });
    uses.set(item, u);
  }
}
/** Accents, case and ¡¿ don't matter when searching or sorting. */
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¡!¿?.,]/g, '').toLowerCase();
const items = Object.values(ITEMS).sort((a, b) => plain(a.es).localeCompare(plain(b.es), 'es'));

// ---------- The lists ----------
root.append(el('h2', '', 'The lists'));
const lists = Object.values(THEMES).sort((a, b) => (a.id === 'core' ? -1 : b.id === 'core' ? 1 : Number(isTopic(a.id)) - Number(isTopic(b.id)) || a.name.localeCompare(b.name, 'es')));
const summary = el('table');
summary.append(Object.assign(el('tr'), { innerHTML: '<th>List</th><th>Who learns it</th><th>Lines</th><th>Up to</th>' }));
for (const t of lists) {
  const tr = el('tr');
  const who = t.id === 'core' ? 'every Palabrita (its own sample; starters in order)' : isTopic(t.id) ? 'the schools (topic of the day)' : families[t.id].map((f) => family[f].join(' → ')).join(' · ');
  tr.append(el('td', '', `${t.name} (${t.en})`), el('td', 'fam', who), el('td', '', String(t.items.length)), el('td', '', isTopic(t.id) ? `dificultad ${t.maxTier}` : `Nv ${t.maxTier}`));
  summary.append(tr);
}
root.append(wrapped(summary));

// ---------- Every word ----------
root.append(el('h2', '', 'Every word and phrase'));
const controls = el('div', 'controls');
const search = Object.assign(el('input'), { type: 'search', placeholder: 'Search Spanish or English…' });
const filter = el('select');
filter.append(Object.assign(el('option', '', 'All lists'), { value: '' }));
for (const t of lists) filter.append(Object.assign(el('option', '', t.name), { value: t.id }));
// A level range (from-to); empty means any level. Topics have difficulty bands, not levels, so a range leaves them out.
const maxLevel = Math.max(...lists.filter((t) => !isTopic(t.id)).map((t) => t.maxTier));
const levelInput = (placeholder: string) => Object.assign(el('input'), { type: 'number', min: '2', max: String(maxLevel), placeholder, inputMode: 'numeric' });
const levelFrom = levelInput('Nv');
const levelTo = levelInput('Nv');
const levels = el('label');
levels.append('Levels ', levelFrom, ' – ', levelTo);
const sharedOnly = Object.assign(el('input'), { type: 'checkbox' });
const sharedLabel = el('label');
sharedLabel.append(sharedOnly, ' shared only');
const count = el('span', 'count');
controls.append(search, filter, levels, sharedLabel, count);
root.append(controls);

const table = el('table');
table.append(Object.assign(el('tr'), { innerHTML: '<th>Spanish</th><th>English</th><th>Taught in</th>' }));
const rows = items.map((item) => {
  const tr = el('tr');
  const es = el('td', 'es', item.es);
  const alts = item.accept.filter((a) => a !== item.es);
  if (alts.length) es.append(el('span', 'alt', `also: ${alts.join(' · ')}`));
  const where_ = el('td');
  const u = (uses.get(item) ?? []).sort((a, b) => a.tier - b.tier);
  for (const { list, tier } of u) where_.append(el('span', `chip${list === 'core' ? ' core' : isTopic(list) ? ' topic' : ''}`, where(list, tier)));
  tr.append(es, el('td', '', item.en), where_);
  table.append(tr);
  return { tr, item, uses: u, lists: new Set(u.map((x) => x.list)), text: plain(`${item.accept.join(' ')} ${item.en}`) };
});
root.append(wrapped(table));

function update() {
  const q = plain(search.value.trim());
  const [from, to] = [Number(levelFrom.value) || 0, Number(levelTo.value) || Infinity];
  const ranged = from > 0 || to < Infinity;
  // A word matches if one of its places is in the chosen list (if any) and the level range (if any).
  const placeOk = (p: { list: string; tier: number }) =>
    (!filter.value || p.list === filter.value) && (!ranged || (!isTopic(p.list) && p.tier >= from && p.tier <= to));
  let shown = 0;
  for (const r of rows) {
    const ok = (!q || r.text.includes(q)) && r.uses.some(placeOk) && (!sharedOnly.checked || r.lists.size > 1);
    r.tr.hidden = !ok;
    if (ok) shown++;
  }
  count.textContent = `${shown} of ${rows.length}`;
}
search.addEventListener('input', update);
filter.addEventListener('change', update);
levelFrom.addEventListener('input', update);
levelTo.addEventListener('input', update);
sharedOnly.addEventListener('change', update);
update();

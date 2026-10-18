import { THEMES, tierItems, coreItemsPerLevel, themeItemsPerLevel, type Item } from '../data/content';
import { SPECIES, firstForm } from '../data/species';
import { seededShuffle } from './random';

/*
  WHAT A KIND OF PALABRITA LEARNS AT EACH LEVEL
  - Core words: coreItemsPerLevel(level) new ones per level.
      Starters walk the core list in order: they all teach the most useful words first.
      Other kinds learn a random sample of each level's core slice (the same for every
      Palabrita of that kind), so catching new kinds brings new words.
  - Theme items: the level's tier of the kind's theme.
  - An item the kind already learned at an earlier level (a theme word that is also a core
    word) isn't repeated. Instead the level is topped up from its own core slice, and so is a level
    whose theme has run out: every level gets its full work (counted in answers), so it never goes down.
  Everything about leveling, review, loyalty and defense reads its words from here.
*/

const plans = new Map<string, Item[][]>();

/** The level-up review: this share of the items from REVIEW_GAP levels back (learning.ts reviewItems). */
export const REVIEW_GAP = 5;
export const REVIEW_SHARE = 0.5;

/** Good answers that master an item: one for levels up to 20, two from 21 (learning.ts masteryRule). */
export const answersToMaster = (tier: number) => (tier <= 20 ? 1 : 2);
const cost = (items: Item[]) => items.reduce((sum, i) => sum + answersToMaster(i.tier), 0);

/** The order a kind takes a level's core slice in: as listed for starters, a fixed shuffle for the rest. */
function coreOrder(spId: string, level: number): Item[] {
  const slice = tierItems('core', level);
  if (SPECIES[spId].starter) return slice;
  const first = firstForm(spId);
  return seededShuffle(slice, `${SPECIES[first].seed ?? first}:${level}`);
}

function coreFor(spId: string, level: number, pathPos: number): Item[] {
  const n = coreItemsPerLevel(level);
  // Starters walk the A1 list in order up to level 20; from 21 they take each level's A2 slice in order (the
  // most useful first), like everyone, so they reach the A2 words too.
  if (SPECIES[spId].starter && level <= 20) return THEMES.core.items.slice(pathPos, pathPos + n);
  return coreOrder(spId, level).slice(0, n);
}

/** Index = level; each entry = the new items of that level. */
function plan(spId: string): Item[][] {
  let levels = plans.get(spId);
  if (levels) return levels;
  levels = [[], []];
  const theme = SPECIES[spId].theme;
  const last = Math.max(THEMES[theme].maxTier, THEMES.core.maxTier);
  const seen = new Set<string>();
  let pathPos = 0;
  let carry: Item[] = [];
  let lastWork = 0;
  for (let level = 2; level <= last; level++) {
    const core = coreFor(spId, level, pathPos);
    pathPos += core.length;
    const fresh = [...carry, ...core, ...tierItems(theme, level)].filter((i) => !seen.has(i.id) && !!seen.add(i.id));
    // Exactly the planned work, counted in answers: more waits for the next level; short (shared items already
    // learned, easier shared items, or the theme ran out) is topped up from the core slice.
    // The level's work is its new items plus the review; it's never less than the level before.
    const review = level - REVIEW_GAP >= 2 ? Math.ceil(levels[level - REVIEW_GAP].length * REVIEW_SHARE) : 0;
    const want = Math.max((coreItemsPerLevel(level) + themeItemsPerLevel(level)) * answersToMaster(level), lastWork - review);
    const items: Item[] = [];
    carry = [];
    for (const item of fresh) (cost(items) < want ? items : carry).push(item);
    for (const extra of coreOrder(spId, level)) {
      if (cost(items) >= want) break;
      if (!seen.has(extra.id)) (seen.add(extra.id), items.push(extra));
    }
    levels[level] = items;
    lastWork = cost(items) + review;
  }
  plans.set(spId, levels);
  return levels;
}

/** The new items a Palabrita of this kind learns at a level: core words first, then its theme. */
export const levelItems = (spId: string, level: number): Item[] => plan(spId)[level] ?? [];

/** Everything a kind learns from level `from` up to level `to`. */
export const itemsBetween = (spId: string, from: number, to: number): Item[] => plan(spId).slice(Math.max(2, from), to + 1).flat();

export const itemsUpTo = (spId: string, level: number) => itemsBetween(spId, 2, level);

/** Highest level with anything to learn (the end of the written content). */
export function maxLevel(spId: string): number {
  const levels = plan(spId);
  let l = levels.length - 1;
  while (l > 2 && !levels[l].length) l--;
  return l;
}

export const allItems = (spId: string) => itemsUpTo(spId, maxLevel(spId));

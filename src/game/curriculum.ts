import { THEMES, tierItems, coreItemsPerLevel, type Item } from '../data/content';
import { SPECIES } from '../data/species';
import { seededShuffle } from './random';

/*
  WHAT A KIND OF PALABRITA LEARNS AT EACH LEVEL
  - Core words: coreItemsPerLevel(level) new ones per level.
      Starters walk the core list in order: they all teach the most useful words first.
      Other kinds learn a random sample of each level's core slice (the same for every
      Palabrita of that kind), so catching new kinds brings new words.
  - Theme items: the level's tier of the kind's theme.
  - An item the kind already learned at an earlier level (a theme word that is also a core
    word) isn't repeated, so that level is a bit shorter.
  Everything about leveling, review, loyalty and defense reads its words from here.
*/

const plans = new Map<string, Item[][]>();

function coreFor(spId: string, level: number, pathPos: number): Item[] {
  const n = coreItemsPerLevel(level);
  if (SPECIES[spId].starter) return THEMES.core.items.slice(pathPos, pathPos + n);
  const slice = tierItems('core', level);
  return slice.length <= n ? slice : seededShuffle(slice, `${spId}:${level}`).slice(0, n);
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
  for (let level = 2; level <= last; level++) {
    const core = coreFor(spId, level, pathPos);
    pathPos += core.length;
    levels[level] = [...core, ...tierItems(theme, level)].filter((i) => !seen.has(i.id) && !!seen.add(i.id));
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

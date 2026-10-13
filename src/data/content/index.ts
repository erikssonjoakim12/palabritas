import { digitsToWords } from '../../lang/numbers';
import { perro } from './perro';
import { tiempo } from './tiempo';
import { comida } from './comida';
import { naturaleza } from './naturaleza';
import { numeros } from './numeros';
import { colores } from './colores';
import { casa } from './casa';
import { saludos, preguntas, presente } from './trainers';

/**
 * A theme is a slice of Spanish. Lines look like `"el perro | el can = the dog"`:
 * the first Spanish form is the one we show, the others are also accepted.
 *
 * Palabrita themes use `levels`: ONE list, easiest first. It is split into levels by
 * itemsPerLevel() (3 per level for 2-10, 4 for 11-20, 5 for 21-30...), so adding content is
 * just appending lines. Tier N = what a level-N Palabrita is learning.
 * Small practice topics (Rita's present tense...) can still list `tiers` by hand.
 */
export interface ThemeSource {
  id: string;
  name: string;
  en: string;
  levels?: string[];
  tiers?: Record<number, string[]>;
}

/** How many items a level has: 3 for levels 2-10, 4 for 11-20, 5 for 21-30, ... 12 for 91-100. */
export const itemsPerLevel = (level: number) => 3 + Math.floor((level - 1) / 10);

/** Split an ordered list into tiers, starting at level 2. */
function splitIntoLevels(lines: string[]): Record<number, string[]> {
  const tiers: Record<number, string[]> = {};
  let i = 0;
  for (let level = 2; i < lines.length; level++) {
    const n = itemsPerLevel(level);
    tiers[level] = lines.slice(i, i + n);
    i += n;
  }
  return tiers;
}

export interface Item {
  id: string;
  theme: string;
  tier: number;
  es: string;
  accept: string[];
  en: string;
}

export interface Theme {
  id: string;
  name: string;
  en: string;
  items: Item[];
  maxTier: number;
}

export const THEMES: Record<string, Theme> = {};
export const ITEMS: Record<string, Item> = {};

function build(src: ThemeSource): Theme {
  const items: Item[] = [];
  const tiers = src.levels ? splitIntoLevels(src.levels) : (src.tiers ?? {});
  for (const [tierStr, lines] of Object.entries(tiers)) {
    const tier = Number(tierStr);
    for (const line of lines) {
      const eq = line.lastIndexOf(' = ');
      if (eq < 0) throw new Error(`Bad content line in ${src.id}: ${line}`);
      const accept = line.slice(0, eq).split('|').map((s) => s.trim()).filter(Boolean);
      const en = line.slice(eq + 3).trim();
      const item: Item = { id: `${src.id}:${accept[0]}`, theme: src.id, tier, es: accept[0], accept, en };
      if (ITEMS[item.id]) throw new Error(`Duplicate item ${item.id}`);
      ITEMS[item.id] = item;
      items.push(item);
    }
  }
  const theme: Theme = { id: src.id, name: src.name, en: src.en, items, maxTier: Math.max(...items.map((i) => i.tier)) };
  THEMES[src.id] = theme;
  return theme;
}

[perro, tiempo, comida, naturaleza, numeros, colores, casa, saludos, preguntas, presente].forEach(build);

export function tierItems(themeId: string, tier: number): Item[] {
  return THEMES[themeId].items.filter((i) => i.tier === tier);
}

export function poolUpTo(themeId: string, level: number): Item[] {
  return THEMES[themeId].items.filter((i) => i.tier <= level);
}

/** A one-off item, e.g. "Me llamo {name}". Not saved in progress. */
export function adHocItem(es: string[], en: string): Item {
  return { id: `adhoc:${es[0]}`, theme: 'adhoc', tier: 0, es: es[0], accept: es.map(digitsToWords), en };
}

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
 * Tier N is what a level-N Palabrita of that theme is learning.
 */
export interface ThemeSource {
  id: string;
  name: string;
  en: string;
  tiers: Record<number, string[]>;
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
  for (const [tierStr, lines] of Object.entries(src.tiers)) {
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

import { digitsToWords } from '../../lang/numbers';
import { core } from './core';
import { perro } from './perro';
import { tiempo } from './tiempo';
import { comida } from './comida';
import { naturaleza } from './naturaleza';
import { numeros } from './numeros';
import { colores } from './colores';
import { casa } from './casa';
import { presente, preguntas, gustar, direcciones, ira, restaurante, compras, pasado } from './trainers';
import { playa } from './playa';
import { frutas } from './frutas';
import { mar } from './mar';
import { pesca } from './pesca';
import { viaje } from './viaje';
import { familia } from './familia';
import { cuerpo } from './cuerpo';
import { cocina } from './cocina';
import { deportes } from './deportes';
import { musica } from './musica';
import { salud } from './salud';
import { historia } from './historia';
import { latinoamerica } from './latinoamerica';
import { fiesta } from './fiesta';
import { conversacion } from './conversacion';
import { ciudad } from './ciudad';
import { ropa } from './ropa';
import { rutina } from './rutina';
import { emociones } from './emociones';
import { animales } from './animales';
import { trabajo } from './trabajo';

/**
 * A theme is a slice of Spanish. Lines look like `"el perro | el can = the dog"`:
 * the first Spanish form is the one we show, the others are also accepted.
 *
 * Palabrita themes use `levels`: ONE list, easiest first. It is split into levels by
 * themeItemsPerLevel(), so adding content is just appending lines. Small practice topics
 * (Rita's present tense...) can list `tiers` by hand.
 *
 * The same Spanish in two lists (core and a theme, or two themes) is ONE shared item:
 * mastering it once counts everywhere. The first list that has it (core first) owns it.
 */
export interface ThemeSource {
  id: string;
  name: string;
  en: string;
  levels?: string[];
  tiers?: Record<number, string[]>;
}

/**
 * Core Spanish is shared by every Palabrita. Each band is spread evenly over its levels:
 * the slice for level N holds a few times more words than one Palabrita learns there.
 * See curriculum.ts for which words each kind learns.
 */
export interface CoreSource {
  id: string;
  name: string;
  en: string;
  bands: { from: number; to: number; lines: string[] }[];
}

/** New theme items per level: 3 words (2-10), 4 short phrases (11-20), then 3 sentences. */
export const themeItemsPerLevel = (level: number) => (level <= 10 || level > 20 ? 3 : 4);

/**
 * New core items per level for 21-40 (the A2 band). Chosen so the work per level never goes down: from 21 an
 * item needs two good answers, and the level-up review covers half of the items from five levels back, which
 * shrinks once it reaches the smaller 21+ levels. Expected answers per level: 21-24: 23, 25-26: 24, 27-30: 26,
 * 31: 27, 32-34: 28, 35-38: 30, 39-40: 32 (levels 2-20 climb from 5 to 21). tools/sim.mjs checks it.
 */
const A2_CORE = [5, 5, 5, 5, 5, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10];

/** New core items per level: 2 at level 2, +1 every second level (119 by level 20); then A2_CORE for 21-40. */
export const coreItemsPerLevel = (level: number) => (level >= 2 && level <= 20 ? 2 + Math.floor((level - 2) / 2) : (A2_CORE[level - 21] ?? 0));

/** Split an ordered list into tiers, starting at level 2. */
function splitIntoLevels(lines: string[]): Record<number, string[]> {
  const tiers: Record<number, string[]> = {};
  let i = 0;
  for (let level = 2; i < lines.length; level++) {
    const n = themeItemsPerLevel(level);
    tiers[level] = lines.slice(i, i + n);
    i += n;
  }
  return tiers;
}

/** Spread each core band over its levels, in proportion to how many words a Palabrita learns there. */
function splitCoreBands(src: CoreSource): Record<number, string[]> {
  const tiers: Record<number, string[]> = {};
  for (const band of src.bands) {
    const levels = Array.from({ length: band.to - band.from + 1 }, (_, i) => band.from + i);
    const need = levels.reduce((s, l) => s + coreItemsPerLevel(l), 0);
    let done = 0;
    let start = 0;
    for (const level of levels) {
      done += coreItemsPerLevel(level);
      const end = Math.round((band.lines.length * done) / need);
      tiers[level] = band.lines.slice(start, end);
      start = end;
    }
  }
  return tiers;
}

export interface Item {
  id: string;
  /** The list that owns it (core or a theme). */
  theme: string;
  /** Its level in the owning list (decides how many answers master it). */
  tier: number;
  es: string;
  accept: string[];
  en: string;
}

export interface Theme {
  id: string;
  name: string;
  en: string;
  /** The items of each level, including shared items owned by another list. */
  levels: Record<number, Item[]>;
  /** All items, easiest first. */
  items: Item[];
  maxTier: number;
}

export const THEMES: Record<string, Theme> = {};
export const ITEMS: Record<string, Item> = {};

/** What makes two lines "the same Spanish": the shown form, ignoring case and ¡!¿?.,. */
export const spanishKey = (es: string) => es.toLowerCase().replace(/[¡!¿?.,]/g, '').trim();
const BY_KEY = new Map<string, Item>();
/** The same Spanish with different English in two lists (the first list's English wins, so the other is lost). data.test lists them. */
export const EN_CONFLICTS: string[] = [];
export const itemBySpanish = (es: string): Item | undefined => BY_KEY.get(spanishKey(es));

function build(src: { id: string; name: string; en: string }, tiers: Record<number, string[]>, byLevel = true): Theme {
  const levels: Record<number, Item[]> = {};
  for (const [tierStr, lines] of Object.entries(tiers)) {
    const tier = Number(tierStr);
    levels[tier] = lines.map((line) => {
      const eq = line.lastIndexOf(' = ');
      if (eq < 0) throw new Error(`Bad content line in ${src.id}: ${line}`);
      const accept = line.slice(0, eq).split('|').map((s) => s.trim()).filter(Boolean);
      const shared = BY_KEY.get(spanishKey(accept[0]));
      if (shared) {
        if (shared.theme === src.id) throw new Error(`Duplicate item in ${src.id}: ${accept[0]}`);
        const en = line.slice(eq + 3).trim();
        if (en !== shared.en) EN_CONFLICTS.push(`${accept[0]}: ${shared.theme} «${shared.en}» / ${src.id} «${en}»`);
        for (const a of accept) if (!shared.accept.includes(a)) shared.accept.push(a);
        // A shared item counts at its lowest level in any list (an A2 word that a theme teaches at level 8 is a
        // level 8 word there: one good answer masters it). Practice topics' tiers are difficulty bands, not levels.
        if (byLevel) shared.tier = Math.min(shared.tier, tier);
        return shared;
      }
      const item: Item = { id: `${src.id}:${accept[0]}`, theme: src.id, tier, es: accept[0], accept, en: line.slice(eq + 3).trim() };
      ITEMS[item.id] = item;
      BY_KEY.set(spanishKey(item.es), item);
      return item;
    });
  }
  const tierNums = Object.keys(levels).map(Number).sort((a, b) => a - b);
  const theme: Theme = { id: src.id, name: src.name, en: src.en, levels, items: tierNums.flatMap((t) => levels[t]), maxTier: Math.max(...tierNums) };
  THEMES[src.id] = theme;
  return theme;
}

build(core, splitCoreBands(core));
for (const src of [perro, tiempo, comida, naturaleza, numeros, colores, casa, cuerpo, cocina, deportes, musica, salud, historia, latinoamerica, playa, frutas, mar, pesca, viaje, familia, presente, preguntas, gustar, direcciones, ira, restaurante]) {
  build(src, src.levels ? splitIntoLevels(src.levels) : (src.tiers ?? {}), !!src.levels);
}
/**
 * Lists added after players had saves (region 4 on; add new themes and topics here). A word they share with an
 * earlier list keeps that list's level, so new content never moves the words existing Palabritas already have.
 * Their own Palabritas still meet the word at its place in their list.
 */
const LATER: ThemeSource[] = [fiesta, conversacion, ciudad, ropa, rutina, emociones, animales, trabajo, compras, pasado];
for (const src of LATER) build(src, src.levels ? splitIntoLevels(src.levels) : (src.tiers ?? {}), false);

export function tierItems(themeId: string, tier: number): Item[] {
  return THEMES[themeId].levels[tier] ?? [];
}

export function poolUpTo(themeId: string, level: number): Item[] {
  const t = THEMES[themeId];
  return Object.keys(t.levels).map(Number).filter((l) => l <= level).sort((a, b) => a - b).flatMap((l) => t.levels[l]);
}

/** A one-off item, e.g. "Me llamo {name}". Not saved in progress. */
export function adHocItem(es: string[], en: string): Item {
  return { id: `adhoc:${es[0]}`, theme: 'adhoc', tier: 0, es: es[0], accept: es.map(digitsToWords), en };
}

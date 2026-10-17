/** Things you can carry in your MOCHILA (bag) and buy at the shop. Money is in pesos ($). */
export interface ItemDef {
  id: string;
  name: string;
  /** For "dos Palabolas", "tres pociones". */
  plural: string;
  /** Feminine nouns take "una" ("una Palabola", "una poción"). */
  feminine: boolean;
  price: number;
  /** English, for the shop prompt: "I’d like two Palabolas". */
  enName: string;
  enPlural: string;
  en: string;
  /** Potions: how many PS (HP) it heals. */
  heal?: number;
  /** Revivir: brings a fainted Palabrita back with half its PS. */
  revive?: boolean;
  /** Repelente: no wild Palabritas for this many steps. */
  repel?: number;
  /** Balls: how well it catches (1 = a Palabola, 1.5 = a Superbola). */
  ball?: number;
  /** A key item: never sold, never used up; it's only usable where something says so. */
  key?: boolean;
  /** Using it from the bag closes the menus and runs this script (the fishing rod: 'fish'). */
  use?: string;
}

const key = (id: string, name: string, en: string, feminine = false): ItemDef =>
  ({ id, name, plural: name, feminine, price: 0, enName: en, enPlural: en, en, key: true });

export const ITEM_DEFS: Record<string, ItemDef> = {
  palabola: { id: 'palabola', name: 'Palabola', plural: 'Palabolas', feminine: true, price: 60, enName: 'Palabola', enPlural: 'Palabolas', en: 'Palabola (catches wild Palabritas)', ball: 1 },
  superbola: { id: 'superbola', name: 'Superbola', plural: 'Superbolas', feminine: true, price: 200, enName: 'Super Ball', enPlural: 'Super Balls', en: 'Super Ball (catches better than a Palabola)', ball: 1.5 },
  pocion: { id: 'pocion', name: 'Poción', plural: 'Pociones', feminine: true, price: 100, enName: 'Potion', enPlural: 'Potions', en: 'Potion (heals 20 PS)', heal: 20 },
  superpocion: { id: 'superpocion', name: 'Superpoción', plural: 'Superpociones', feminine: true, price: 250, enName: 'Super Potion', enPlural: 'Super Potions', en: 'Super Potion (heals 50 PS)', heal: 50 },
  revivir: { id: 'revivir', name: 'Revivir', plural: 'Revivires', feminine: false, price: 600, enName: 'Revive', enPlural: 'Revives', en: 'Revive (a fainted Palabrita comes back with half its PS)', revive: true },
  repelente: { id: 'repelente', name: 'Repelente', plural: 'Repelentes', feminine: false, price: 200, enName: 'Repel', enPlural: 'Repels', en: 'Repel (no wild Palabritas for 100 steps)', repel: 100 },
  // Key items: found or given, never sold.
  cana: { ...key('cana', 'Caña de pescar', 'Fishing rod', true), use: 'fish' },
  fosil: key('fosil', 'Fósil Caparazón', 'Shell fossil'),
  sombrero: key('sombrero', 'Sombrero de Beto', 'Beto’s hat'),
  hamaca: key('hamaca', 'Hamaca', 'Hammock', true),
  chocoyitoBebe: key('chocoyitoBebe', 'Chocoyito bebé', 'Baby Chocoyito'),
  traje: key('traje', 'Pieza del traje', 'Costume piece', true),
};

/** What each shop sells, by the shop's map id. */
export const SHOPS: Record<string, string[]> = {
  tienda_brisa: ['palabola', 'pocion'],
  tienda_ocote: ['palabola', 'pocion', 'superpocion', 'repelente'],
  tienda_carey: ['palabola', 'superbola', 'pocion', 'superpocion', 'repelente'],
  tienda_chispa: ['palabola', 'superbola', 'pocion', 'superpocion', 'revivir', 'repelente'],
};

/** "una Palabola", "dos Pociones"... (amounts 1-5 in words). */
export function amountOf(id: string, n: number) {
  const def = ITEM_DEFS[id];
  const words = ['', def.feminine ? 'una' : 'un', 'dos', 'tres', 'cuatro', 'cinco'];
  return `${words[n] ?? n} ${n === 1 ? def.name : def.plural}`;
}

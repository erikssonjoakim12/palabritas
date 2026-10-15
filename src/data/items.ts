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
}

export const ITEM_DEFS: Record<string, ItemDef> = {
  palabola: { id: 'palabola', name: 'Palabola', plural: 'Palabolas', feminine: true, price: 80, enName: 'Palabola', enPlural: 'Palabolas', en: 'Palabola (catches wild Palabritas)' },
  pocion: { id: 'pocion', name: 'Poción', plural: 'Pociones', feminine: true, price: 120, enName: 'Potion', enPlural: 'Potions', en: 'Potion (heals 20 PS)', heal: 20 },
};

/** What the shop in Ciudad Brisa sells. */
export const SHOP = ['palabola', 'pocion'];

/** "una Palabola", "dos Pociones"... (amounts 1-5 in words). */
export function amountOf(id: string, n: number) {
  const def = ITEM_DEFS[id];
  const words = ['', def.feminine ? 'una' : 'un', 'dos', 'tres', 'cuatro', 'cinco'];
  return `${words[n] ?? n} ${n === 1 ? def.name : def.plural}`;
}

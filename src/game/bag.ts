import { G, type Mon } from './state';
import { stats } from './mon';
import { ITEM_DEFS } from '../data/items';

/** The MOCHILA (bag) and money. */

export const itemCount = (id: string) => G.save.bag[id] ?? 0;

export function addItem(id: string, n = 1) {
  G.save.bag[id] = itemCount(id) + n;
}

/** Use up one; false if there's none. */
export function takeItem(id: string): boolean {
  if (itemCount(id) <= 0) return false;
  G.save.bag[id]--;
  return true;
}

/** The items you have, in shop order. */
export const bagItems = () => Object.keys(ITEM_DEFS).filter((id) => itemCount(id) > 0);

/** Heal a Palabrita with a potion. Returns how much it healed (0 = can't use it on this one). */
export function healWith(id: string, mon: Mon): number {
  const s = stats(mon);
  const heal = ITEM_DEFS[id].heal ?? 0;
  if (!heal || mon.hp <= 0 || mon.hp >= s.maxHp) return 0;
  const before = mon.hp;
  mon.hp = Math.min(s.maxHp, mon.hp + heal);
  return mon.hp - before;
}

/** Prize money for beating a trainer: the total stats of their Palabritas. */
export function prizeMoney(team: Mon[]) {
  return team.reduce((sum, m) => {
    const s = stats(m);
    return sum + s.maxHp + s.atk + s.def + s.spd;
  }, 0);
}

export const money = (n = G.save.money) => `$${n}`;

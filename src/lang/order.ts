import { normalize, loose, type Grade } from './check';
import { ITEM_DEFS } from '../data/items';

/*
  Grading a shop order like «Quiero dos Palabolas, por favor». Any natural way of asking counts,
  as long as it asks for the right amount of the right thing:
    «Quiero / Quisiera / Me da / Me das / Me puede dar / Deme / Dame / Necesito / Me llevo... »
  The amount can be a word or a digit. «por favor» is welcome but not required.
  Perfect needs the right singular/plural and accents (poción); otherwise it's "almost".
*/

const ASK = /\b(quiero|quisiera|me da|me das|me puede dar|me puedes dar|deme|dame|me gustaria|necesito|me llevo|voy a llevar)\b/;
const AMOUNTS: [number, RegExp][] = [
  [1, /\b(un|una|uno|1)\b/],
  [2, /\b(dos|2)\b/],
  [3, /\b(tres|3)\b/],
  [4, /\b(cuatro|4)\b/],
  [5, /\b(cinco|5)\b/],
];

/** null = not an order for this (the normal answer check decides, so it counts as wrong). */
export function gradeOrder(answer: string, id: string, n: number): Grade | null {
  const a = loose(answer);
  const def = ITEM_DEFS[id];
  if (!ASK.test(a)) return null;
  const amounts = AMOUNTS.filter(([, re]) => re.test(a)).map(([k]) => k);
  if (amounts.length !== 1 || amounts[0] !== n) return null;
  const word = (w: string) => new RegExp(`\\b${loose(w)}\\b`).test(a);
  const one = word(def.name);
  const many = word(def.plural);
  if (!one && !many) return null;
  const right = n === 1 ? def.name : def.plural;
  const agrees = n === 1 ? one : many;
  return agrees && normalize(answer).includes(normalize(right)) ? 'perfect' : 'close';
}

/**
 * Telling the cook a table's order: the answer must contain every dish (accents, case, «un/una» and «por favor»
 * don't matter). null = something's missing (it counts as wrong).
 */
export function gradeDish(answer: string, required: string[]): Grade | null {
  const a = loose(answer);
  return required.every((dish) => a.includes(loose(dish))) ? 'perfect' : null;
}

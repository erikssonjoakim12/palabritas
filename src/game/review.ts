import { G } from './state';
import { ITEMS, type Item } from '../data/content';
import { isDue, isFading } from './learning';

/**
 * Every learned word or phrase that's due for review (spaced repetition), the most overdue first: fading
 * ones (well past their date, they cost loyalty) before the ones merely due.
 */
export function dueItems(now = Date.now()): Item[] {
  return Object.entries(G.save.prog)
    .filter(([id, p]) => ITEMS[id] && isDue(p, now))
    .sort(([, a], [, b]) => Number(isFading(b, now)) - Number(isFading(a, now)) || a.due - b.due)
    .map(([id]) => ITEMS[id]);
}

export const dueCount = () => dueItems().length;

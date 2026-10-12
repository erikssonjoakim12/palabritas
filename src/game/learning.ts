import { G, type ItemProg, type Mon } from './state';
import { THEMES, poolUpTo, tierItems, type Item } from '../data/content';
import { SPECIES, type Mode } from '../data/species';
import type { Grade } from '../lang/check';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Review interval per spaced-repetition box. */
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64].map((d) => d * DAY);
export const MASTERY_POINTS = 2;
/** Below this loyalty a creature may ignore you. */
export const OBEY_THRESHOLD = 0.7;

export function prog(id: string): ItemProg {
  let p = G.save.prog[id];
  if (!p) {
    p = { pts: 0, seen: 0, right: 0, wrong: 0, learned: false, box: 0, due: 0, last: 0 };
    G.save.prog[id] = p;
  }
  return p;
}

export const peekProg = (id: string): ItemProg | undefined => G.save.prog[id];
export const isLearned = (item: Item) => !!peekProg(item.id)?.learned;
export const isUnseen = (item: Item) => !peekProg(item.id)?.seen;

function grace(box: number) {
  return Math.max(12 * HOUR, INTERVALS[Math.min(box, 7)] * 0.5);
}

/** A learned item that hasn't been practiced well past its review date. */
export function isFading(p: ItemProg | undefined, now = Date.now()) {
  return !!p?.learned && now > p.due + grace(p.box);
}

export function isDue(p: ItemProg | undefined, now = Date.now()) {
  return !!p?.learned && now >= p.due;
}

export interface RecordResult {
  learnedNow: boolean;
}

/** Update progress after an answer. `helped` = the player peeked or used a hint. */
export function record(item: Item, mode: Mode, grade: Grade, helped = false): RecordResult {
  G.save.answers++;
  if (grade !== 'wrong') G.save.correct++;
  if (item.theme === 'adhoc') return { learnedNow: false };

  const now = Date.now();
  const p = prog(item.id);
  p.seen++;
  p.last = now;
  if (grade === 'wrong') {
    p.wrong++;
    p.pts = Math.max(0, p.pts - 1);
    if (p.learned) {
      p.box = 1;
      p.due = now + 10 * 60_000;
    }
    return { learnedNow: false };
  }

  p.right++;
  let gain = grade === 'perfect' ? (mode === 'choose' ? 1 : 2) : mode === 'choose' ? 0.5 : 1;
  if (helped) gain = Math.min(gain, 1);
  p.pts = Math.min(10, p.pts + gain);

  if (!p.learned && p.pts >= MASTERY_POINTS) {
    p.learned = true;
    p.box = 1;
    p.due = now + INTERVALS[1];
    return { learnedNow: true };
  }
  // A successful review (close to or after its due date) pushes the next review further out.
  if (p.learned && now >= p.due - INTERVALS[Math.min(p.box, 7)] * 0.25) {
    if (grade === 'perfect') p.box = Math.min(7, p.box + 1);
    p.due = now + INTERVALS[Math.max(1, p.box)];
  }
  return { learnedNow: false };
}

/** Share of a creature's learned words that are still fresh (0..1). */
export function lealtad(mon: Mon): number {
  const theme = SPECIES[mon.sp].theme;
  const learned = poolUpTo(theme, mon.level).filter(isLearned);
  if (!learned.length) return 1;
  const now = Date.now();
  const fresh = learned.filter((i) => !isFading(peekProg(i.id), now)).length;
  return fresh / learned.length;
}

export function fadingItems(mon: Mon): Item[] {
  const now = Date.now();
  return poolUpTo(SPECIES[mon.sp].theme, mon.level)
    .filter((i) => isFading(peekProg(i.id), now))
    .sort((a, b) => prog(a.id).due - prog(b.id).due);
}

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Choose what to ask next from a creature's pool:
 * fading words first, then due reviews, then words being learned, then new words.
 */
export function pickItem(pool: Item[], avoid: string[] = []): Item {
  const now = Date.now();
  const usable = pool.filter((i) => !avoid.includes(i.id));
  const items = usable.length ? usable : pool;
  const fading = items.filter((i) => isFading(peekProg(i.id), now));
  if (fading.length && Math.random() < 0.6) return pickRandom(fading);
  const due = items.filter((i) => isDue(peekProg(i.id), now));
  if (due.length && Math.random() < 0.35) return pickRandom(due);

  const learning = items.filter((i) => peekProg(i.id)?.seen && !isLearned(i));
  const unseen = items.filter(isUnseen).sort((a, b) => a.tier - b.tier);
  const topTier = Math.max(...items.map((i) => i.tier));

  if (learning.length >= 3 || (learning.length && !unseen.length)) {
    // Favor the tier the creature is working on.
    const current = learning.filter((i) => i.tier === topTier);
    return pickRandom(current.length && Math.random() < 0.6 ? current : learning);
  }
  if (unseen.length) return unseen[0];
  if (learning.length) return pickRandom(learning);
  if (due.length) return pickRandom(due);
  // Everything learned and fresh: mostly review the newest tiers.
  const recent = items.filter((i) => i.tier >= topTier - 2);
  return pickRandom(recent.length && Math.random() < 0.7 ? recent : items);
}

/** Pick a theme item for a non-creature quiz (trainer defense, catching). */
export function pickFromTheme(themeId: string, maxTier: number, avoid: string[] = []) {
  return pickItem(poolUpTo(themeId, maxTier), avoid);
}

export function levelProgress(mon: Mon) {
  const theme = SPECIES[mon.sp].theme;
  const items = tierItems(theme, mon.level);
  return {
    items,
    learned: items.filter(isLearned).length,
    total: items.length,
    maxed: !items.length,
  };
}

export function themeLearnedCount(themeId: string) {
  return THEMES[themeId].items.filter(isLearned).length;
}

export function totalLearned() {
  return Object.values(G.save.prog).filter((p) => p.learned).length;
}

/** Wrong options for a "choose the meaning" question, from the same theme when possible. */
export function distractors(item: Item, n = 3): string[] {
  const theme = THEMES[item.theme];
  const pool = (theme ? theme.items : Object.values(THEMES).flatMap((t) => t.items))
    .filter((i) => i.en !== item.en)
    .sort((a, b) => Math.abs(a.tier - item.tier) - Math.abs(b.tier - item.tier) + (Math.random() - 0.5) * 3);
  const out: string[] = [];
  for (const i of pool) {
    if (!out.includes(i.en)) out.push(i.en);
    if (out.length >= n) break;
  }
  return out;
}

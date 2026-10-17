import { G, today, type ItemProg, type Mon } from './state';
import { THEMES, poolUpTo, type Item } from '../data/content';
import type { Mode } from '../data/species';
import type { Grade } from '../lang/check';
import { levelItems, itemsUpTo, maxLevel } from './curriculum';
import { pickRandom, hash } from './random';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Review interval per spaced-repetition box. */
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64].map((d) => d * DAY);
/** Below this loyalty a Palabrita may ignore you. */
export const OBEY_THRESHOLD = 0.7;

/*
  HOW LEVELING WORKS
  - A level-N Palabrita is learning its new items for level N: core words + theme items
    (see curriculum.ts).
  - An item is mastered after enough good answers (without the 💡 help button):
      levels 2-20: 1 good answer
      levels 21-40: 2 good answers
      levels 41+: 2 good answers on different days
  - Rolling review: leveling up ALSO needs half of the items from REVIEW_GAP levels back
    (level 12 reviews level 7) answered well again since the Palabrita reached its current
    level. Spreading it over every level keeps the workload smooth.
*/
export const REVIEW_GAP = 5;
export const REVIEW_SHARE = 0.5;

export function masteryRule(tier: number): { answers: number; days: number } {
  if (tier <= 20) return { answers: 1, days: 1 };
  if (tier <= 40) return { answers: 2, days: 1 };
  return { answers: 2, days: 2 };
}

export function prog(id: string): ItemProg {
  let p = G.save.prog[id];
  if (!p) {
    p = { seen: 0, right: 0, wrong: 0, learned: false, box: 0, due: 0, last: 0, good: 0, goodDays: [], lastGood: 0 };
    G.save.prog[id] = p;
  }
  p.good ??= 0;
  p.goodDays ??= [];
  p.lastGood ??= 0;
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

/** Update progress after an answer. `helped` = the player used 💡 help (doesn't count toward mastery). */
export function record(item: Item, _mode: Mode, grade: Grade, helped = false): RecordResult {
  G.save.answers++;
  if (grade !== 'wrong') G.save.correct++;
  if (item.theme === 'adhoc') return { learnedNow: false };

  const now = Date.now();
  const p = prog(item.id);
  p.seen++;
  p.last = now;
  if (grade === 'wrong') {
    p.wrong++;
    if (!p.learned) p.good = Math.max(0, (p.good ?? 0) - 1);
    if (p.learned) {
      p.box = 1;
      p.due = now + 10 * 60_000;
    }
    return { learnedNow: false };
  }

  p.right++;
  if (helped) return { learnedNow: false };
  p.good = (p.good ?? 0) + 1;
  p.lastGood = now;
  const day = today();
  if (!p.goodDays!.includes(day)) p.goodDays = [...p.goodDays!, day].slice(-5);

  const rule = masteryRule(item.tier);
  if (!p.learned && p.good >= rule.answers && p.goodDays!.length >= rule.days) {
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

/** Share of a Palabrita's learned words that are still fresh (0..1). */
export function lealtad(mon: Mon): number {
  const learned = itemsUpTo(mon.sp, mon.level).filter(isLearned);
  if (!learned.length) return 1;
  const now = Date.now();
  const fresh = learned.filter((i) => !isFading(peekProg(i.id), now)).length;
  return fresh / learned.length;
}

export function fadingItems(mon: Mon): Item[] {
  const now = Date.now();
  return itemsUpTo(mon.sp, mon.level)
    .filter((i) => isFading(peekProg(i.id), now))
    .sort((a, b) => prog(a.id).due - prog(b.id).due);
}

export interface Review {
  /** The level being reviewed (0 when there is none yet). */
  level: number;
  all: Item[];
  todo: Item[];
}

/**
 * The items from REVIEW_GAP levels back that must be answered well again before this
 * Palabrita levels up. Which half is a stable choice per item and level.
 */
export function reviewItems(mon: Mon): Review {
  const level = mon.level - REVIEW_GAP;
  if (level < 2) return { level: 0, all: [], todo: [] };
  const items = levelItems(mon.sp, level);
  const share = new Set(
    [...items]
      .sort((a, b) => hash(`${a.id}@${mon.level}`) - hash(`${b.id}@${mon.level}`))
      .slice(0, Math.ceil(items.length * REVIEW_SHARE)),
  );
  const all = items.filter((i) => share.has(i));
  const since = mon.since ?? 0;
  const todo = all.filter((i) => (peekProg(i.id)?.lastGood ?? 0) < since || (peekProg(i.id)?.lastGood ?? 0) === 0);
  return { level, all, todo };
}

/**
 * Ready to level up: the current level's items are mastered and the review is done.
 * (A level can be empty when all its items were learned earlier: then it's a free level.)
 */
export function canLevelUp(mon: Mon): boolean {
  return mon.level <= maxLevel(mon.sp) && levelItems(mon.sp, mon.level).every(isLearned) && reviewItems(mon).todo.length === 0;
}

const without = (items: Item[], avoid: string[]) => items.filter((i) => !avoid.includes(i.id));
/** Skip the recently asked items, unless that leaves nothing. */
const preferNot = (items: Item[], avoid: string[]) => {
  const rest = without(items, avoid);
  return rest.length ? rest : items;
};

/**
 * Choose what to ask next from a pool:
 * fading words first, then due reviews, then words being learned, then new words.
 */
export function pickItem(pool: Item[], avoid: string[] = []): Item {
  const now = Date.now();
  const items = preferNot(pool, avoid);
  const fading = items.filter((i) => isFading(peekProg(i.id), now));
  if (fading.length && Math.random() < 0.6) return pickRandom(fading);
  const due = items.filter((i) => isDue(peekProg(i.id), now));
  if (due.length && Math.random() < 0.35) return pickRandom(due);

  const learning = items.filter((i) => peekProg(i.id)?.seen && !isLearned(i));
  const unseen = items.filter(isUnseen).sort((a, b) => a.tier - b.tier);
  const topTier = Math.max(...items.map((i) => i.tier));

  if (learning.length >= 3 || (learning.length && !unseen.length)) {
    // Favor the tier the Palabrita is working on.
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

/** What a Palabrita asks you in battle: its new words, the review it needs, and older words. */
export function pickForMon(mon: Mon, avoid: string[] = []): Item {
  const fading = without(fadingItems(mon), avoid);
  if (fading.length && Math.random() < 0.6) return fading[0];
  const todo = levelItems(mon.sp, mon.level).filter((i) => !isLearned(i));
  const review = without(reviewItems(mon).todo, avoid);
  // Mix the review in with the new words; once the new words are done, it's all review.
  if (review.length && (!todo.length || Math.random() < 0.5)) return pickRandom(review);
  if (todo.length && Math.random() < 0.8) return pickItem(todo, avoid);
  return pickFromKind(mon.sp, mon.level, avoid);
}

/** Any of a kind's words up to a level (catching, a disobedient Palabrita). */
export function pickFromKind(spId: string, level: number, avoid: string[] = []): Item {
  return pickItem(itemsUpTo(spId, Math.min(Math.max(2, level), maxLevel(spId))), avoid);
}

/** Pick a theme item for a quiz up to a level (NPC lessons). */
export function pickFromTheme(themeId: string, maxTier: number, avoid: string[] = []) {
  return pickItem(poolUpTo(themeId, maxTier), avoid);
}

/**
 * Defense questions in trainer battles come from the ATTACKING Palabrita's own words (its core
 * words and theme): the level it mastered to get where it is (level 2 uses level 2).
 * A stronger Palabrita asks harder things, gym leaders included. Words you don't know yet come up more.
 */
export function defenseItem(enemy: Mon, avoid: string[] = []): Item {
  let level = Math.max(2, Math.min(enemy.level - 1, maxLevel(enemy.sp)));
  while (level > 2 && !levelItems(enemy.sp, level).length) level--;
  const words = levelItems(enemy.sp, level);
  const window = preferNot(words.length ? words : itemsUpTo(enemy.sp, enemy.level), avoid);
  const unknown = window.filter((i) => !isLearned(i));
  return pickRandom(unknown.length && Math.random() < 0.7 ? unknown : window);
}

export function levelProgress(mon: Mon) {
  const items = levelItems(mon.sp, mon.level);
  const review = reviewItems(mon);
  return {
    items,
    learned: items.filter(isLearned).length,
    total: items.length,
    review,
    reviewDone: review.all.length - review.todo.length,
    reviewTotal: review.all.length,
    maxed: mon.level > maxLevel(mon.sp),
  };
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

import { G, type ItemProg, type Mon } from './state';
import { THEMES, poolUpTo, tierItems, type Item } from '../data/content';
import { SPECIES, type Mode } from '../data/species';
import type { Grade } from '../lang/check';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Review interval per spaced-repetition box. */
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64].map((d) => d * DAY);
/** Below this loyalty a Palabrita may ignore you. */
export const OBEY_THRESHOLD = 0.7;

/*
  HOW LEVELING WORKS
  - A level-N Palabrita is learning the items of tier N of its theme
    (3 items per level for 2-10, 4 for 11-20, 5 for 21-30... see itemsPerLevel()).
  - An item is mastered after enough good answers (without the 💡 help button):
      tiers 2-10: 1 good answer
      tiers 11-40: 2 good answers
      tiers 41+: 2 good answers on different days
  - From level 21, leveling up ALSO needs a review: every item from the previous
    5 levels must be answered well again since the Palabrita reached its current level.
*/
export const REVIEW_FROM_LEVEL = 21;
export const REVIEW_LEVELS = 5;

export function masteryRule(tier: number): { answers: number; days: number } {
  if (tier <= 10) return { answers: 1, days: 1 };
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

const today = () => new Date().toISOString().slice(0, 10);

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

/** Items from the previous levels that must be answered well again before this Palabrita levels up. */
export function reviewItems(mon: Mon): { all: Item[]; todo: Item[] } {
  if (mon.level < REVIEW_FROM_LEVEL) return { all: [], todo: [] };
  const theme = THEMES[SPECIES[mon.sp].theme];
  const all = theme.items.filter((i) => i.tier >= mon.level - REVIEW_LEVELS && i.tier < mon.level);
  const since = mon.since ?? 0;
  const todo = all.filter((i) => (peekProg(i.id)?.lastGood ?? 0) < since || (peekProg(i.id)?.lastGood ?? 0) === 0);
  return { all, todo };
}

/** Ready to level up: the current level's items are mastered and the review is done. */
export function canLevelUp(mon: Mon): boolean {
  const items = tierItems(SPECIES[mon.sp].theme, mon.level);
  return items.length > 0 && items.every(isLearned) && reviewItems(mon).todo.length === 0;
}

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Choose what to ask next from a pool:
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

/** What a Palabrita asks you in battle: its own words, plus the review it needs to level up. */
export function pickForMon(mon: Mon, avoid: string[] = []): Item {
  const pool = poolUpTo(SPECIES[mon.sp].theme, mon.level);
  const fading = fadingItems(mon).filter((i) => !avoid.includes(i.id));
  if (fading.length && Math.random() < 0.6) return fading[0];
  const current = tierItems(SPECIES[mon.sp].theme, mon.level);
  const newStuffLeft = current.some((i) => !isLearned(i));
  const review = reviewItems(mon).todo.filter((i) => !avoid.includes(i.id));
  // Mix the review in with the new words; once the new words are done, it's all review.
  if (review.length && (!newStuffLeft || Math.random() < 0.5)) return pickRandom(review);
  return pickItem(pool, avoid);
}

/** Pick a theme item for a quiz up to a level (catching). */
export function pickFromTheme(themeId: string, maxTier: number, avoid: string[] = []) {
  return pickItem(poolUpTo(themeId, maxTier), avoid);
}

/**
 * Defense questions in trainer battles come from the OPPONENT's theme at the opponent's
 * level: a stronger Palabrita asks harder things. Words you don't know yet come up more.
 */
export function defenseItem(themeId: string, level: number, avoid: string[] = []): Item {
  const theme = THEMES[themeId];
  let window = theme.items.filter((i) => i.tier >= level - 2 && i.tier <= level && !avoid.includes(i.id));
  if (!window.length) window = poolUpTo(themeId, level);
  if (!window.length) window = theme.items;
  const unknown = window.filter((i) => !isLearned(i));
  return pickRandom(unknown.length && Math.random() < 0.7 ? unknown : window);
}

export function levelProgress(mon: Mon) {
  const theme = SPECIES[mon.sp].theme;
  const items = tierItems(theme, mon.level);
  const review = reviewItems(mon);
  return {
    items,
    learned: items.filter(isLearned).length,
    total: items.length,
    reviewDone: review.all.length - review.todo.length,
    reviewTotal: review.all.length,
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

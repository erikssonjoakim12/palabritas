import type { Dir } from '../engine/input';
import { ITEMS, itemBySpanish } from '../data/content';

export interface Mon {
  uid: string;
  sp: string;
  level: number;
  hp: number;
  /** When it reached its current level (the review before the next level counts from here). */
  since?: number;
}

export interface ItemProg {
  /** Old saves only (the points system was replaced by good answers). */
  pts?: number;
  seen: number;
  right: number;
  wrong: number;
  learned: boolean;
  /** Spaced-repetition box: 1 = review in 1 day, 2 = 2 days, 3 = 4 days... */
  box: number;
  due: number;
  last: number;
  /** Good answers (without help) toward mastery. */
  good?: number;
  /** Days (YYYY-MM-DD) with a good answer: higher levels need two different days. */
  goodDays?: string[];
  /** Time of the latest good answer (used for the level-up review). */
  lastGood?: number;
}

export interface Settings {
  textScale: number;
  /** Read normal dialog aloud automatically (challenges and listening moments always speak). */
  dialogVoice: boolean;
  slowVoice: boolean;
}

export interface SaveData {
  v: 1;
  name: string;
  map: string;
  x: number;
  y: number;
  dir: Dir;
  party: Mon[];
  /** The Caja de Palabritas (storage box, at any Palacentro computer): no limit. */
  box: Mon[];
  flags: Record<string, boolean>;
  /** You, as chosen at the start: changes your look and how people talk to you («listo/lista»). */
  gender: 'boy' | 'girl';
  /** Pesos, earned by beating trainers. */
  money: number;
  /** Items by id (data/items.ts) → how many. */
  bag: Record<string, number>;
  /** The starter you picked, while Professor Ceiba's training is still going on. */
  starterChoice?: string;
  medals: string[];
  prog: Record<string, ItemProg>;
  seen: string[];
  caught: string[];
  heal: { map: string; x: number; y: number };
  settings: Settings;
  playMs: number;
  answers: number;
  correct: number;
}

const KEY = 'palabritas.save.v1';

/** Your look (key in LOOKS), boy or girl. */
export const playerLook = () => (G.save.gender === 'girl' ? 'playerGirl' : 'player');

export function newSave(): SaveData {
  return {
    v: 1,
    name: 'Tú',
    map: 'casa',
    x: 5,
    y: 2,
    dir: 'down',
    party: [],
    box: [],
    flags: { amanecerWide: true },
    gender: 'boy',
    money: 0,
    bag: {},
    medals: [],
    prog: {},
    seen: [],
    caught: [],
    heal: { map: 'casa', x: 2, y: 4 },
    settings: { textScale: 6, dialogVoice: false, slowVoice: false },
    playMs: 0,
    answers: 0,
    correct: 0,
  };
}

/** Global game state. `lock` > 0 while a script, menu or battle owns the controls. */
export const G = {
  save: newSave(),
  lock: 0,
};

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as SaveData;
    G.save = { ...newSave(), ...data, settings: { ...newSave().settings, ...data.settings } };
    migrate(G.save);
    return true;
  } catch {
    return false;
  }
}

/** Palabritas that were renamed between versions: old id -> new id. */
const RENAMED: Record<string, string> = { perrito: 'salchichita' };

/** Bring older saves up to date so they never break after an update. */
function migrate(s: SaveData) {
  const fix = (id: string) => RENAMED[id] ?? id;
  // "Esferas" were renamed to "Palabolas".
  // Palabolas (once called esferas) used to be a plain counter; now they're in the bag.
  const old = s as unknown as { esferas?: number; palabolas?: number };
  s.bag ??= {};
  s.box ??= [];
  s.gender ??= 'boy';
  // Pueblo Amanecer grew 6 columns to the west (the plateau): keep you where you were.
  if (!s.flags.amanecerWide) {
    if (s.map === 'amanecer') s.x += 6;
    s.flags.amanecerWide = true;
  }
  s.money ??= 0;
  // The Ruta 2 potion became a general item ball.
  if (s.flags.pocionRuta2) Object.assign(s.flags, { 'item:pocion_ruta2': true, itemTip: true });
  delete s.flags.pocionRuta2;
  const balls = Math.max(old.palabolas ?? 0, old.esferas ?? 0);
  if (balls) s.bag.palabola = (s.bag.palabola ?? 0) + balls;
  delete old.esferas;
  delete old.palabolas;
  if (s.flags.esferas) s.flags.palabolas = true;
  delete s.flags.esferas;
  for (const m of [...s.party, ...s.box]) m.sp = fix(m.sp);
  s.seen = [...new Set(s.seen.map(fix))];
  s.caught = [...new Set(s.caught.map(fix))];
  // Items that moved (old trainer topics, words now shared with the core list) keep their progress.
  for (const [id, p] of Object.entries(s.prog)) {
    if (ITEMS[id]) continue;
    const to = itemBySpanish(id.slice(id.indexOf(':') + 1))?.id;
    if (to && (!s.prog[to] || (p.learned && !s.prog[to].learned))) s.prog[to] = p;
    delete s.prog[id];
  }
}

export function saveGame(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(G.save));
    return true;
  } catch {
    return false;
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Today as YYYY-MM-DD in local time: the one clock for everything daily (mastery days, rematches, lessons,
 * the fossil...). Tests can set window.__today = '2026-10-18'.
 */
export function today(): string {
  const fake = (globalThis as { __today?: string }).__today;
  if (fake) return fake;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const flag = (name: string) => !!G.save.flags[name];
export const setFlag = (name: string, v = true) => {
  G.save.flags[name] = v;
};

let uidCounter = 0;
export const uid = () => `${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

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
  flags: Record<string, boolean>;
  palabolas: number;
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

export function newSave(): SaveData {
  return {
    v: 1,
    name: 'Tú',
    map: 'casa',
    x: 5,
    y: 2,
    dir: 'down',
    party: [],
    flags: {},
    palabolas: 0,
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
  const old = s as unknown as { esferas?: number };
  if (old.esferas !== undefined) {
    s.palabolas = Math.max(s.palabolas, old.esferas);
    delete old.esferas;
  }
  if (s.flags.esferas) s.flags.palabolas = true;
  delete s.flags.esferas;
  for (const m of s.party) m.sp = fix(m.sp);
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

export const flag = (name: string) => !!G.save.flags[name];
export const setFlag = (name: string, v = true) => {
  G.save.flags[name] = v;
};

let uidCounter = 0;
export const uid = () => `${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

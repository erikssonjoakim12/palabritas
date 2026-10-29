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
  /** Music volume in percent: 0 (off), 20, 40, 60, 80 or 100. Sound effects stay either way. */
  musicLevel: number;
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
  /** Córdobas (C$), earned by beating trainers. */
  money: number;
  /** Items by id (data/items.ts) → how many. */
  bag: Record<string, number>;
  /** Steps left on a Repelente (no wild Palabritas while > 0). */
  repel?: number;
  /** The starter you picked, while Professor Ceiba's training is still going on. */
  starterChoice?: string;
  /** The starter you took (Lucas takes the one strong against it). */
  starterPicked?: string;
  /** The day you lent the shell fossil to the museum (it wakes up the next day). */
  fossilDay?: string;
  /** Rematch trainers: the day of your last battle with each (they ask again on a later day). */
  rematch: Record<string, string>;
  /** El Pelícano Feliz: today's shift as a waiter (which round, which orders, whether you heard the order). */
  restaurante?: { round: number; orders: number[]; heard: boolean };
  /** The day of your last full shift at the restaurant (one a day after the first time). */
  restauranteDia?: string;
  /** Private classes: the day of the last one at each school (one a day). */
  lessons: Record<string, string>;
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
    flags: { amanecerWide: true, ruta5East: true, rutasCortas: true, sinEstacion: true, canonCascada: true, ruta2Nueva: true, palancaJunto: true, craterDerrumbe: true, oesteCorto: true, selvaLaberinto: true },
    gender: 'boy',
    money: 0,
    bag: {},
    rematch: {},
    lessons: {},
    medals: [],
    prog: {},
    seen: [],
    caught: [],
    heal: { map: 'casa', x: 2, y: 4 },
    settings: { textScale: 6, dialogVoice: false, slowVoice: false, musicLevel: 60 },
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
    useSave(JSON.parse(raw) as SaveData);
    return true;
  } catch {
    return false;
  }
}

/** Play from this save (from storage, or a file from another device), brought up to date. */
export function useSave(data: SaveData) {
  G.save = { ...newSave(), ...data, settings: { ...newSave().settings, ...data.settings } };
  migrate(G.save);
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
  s.rematch ??= {};
  s.lessons ??= {};
  s.gender ??= 'boy';
  // Music was on/off; now it has levels (the user found 100% too loud: 60 is the default).
  const st = s.settings as Settings & { music?: boolean };
  st.musicLevel ??= st.music === false ? 0 : 60;
  delete st.music;
  // Pueblo Amanecer grew 6 columns to the west (the plateau): keep you where you were.
  if (!s.flags.amanecerWide) {
    if (s.map === 'amanecer') s.x += 6;
    s.flags.amanecerWide = true;
  }
  // Ruta 4's tunnel moved east (up and to the right of the cave's way in): anyone saved by the old one
  // stands outside the new one.
  if (!s.flags.ruta5East) {
    if (s.map === 'ruta5' && s.y >= 13 && s.x >= 20 && s.x <= 26) Object.assign(s, { x: 90, y: 4, dir: 'up' });
    s.flags.ruta5East = true;
  }
  // Rutas 3 and 7 (then called 8) got shorter (the world map's rework, 2026-10-22): anyone saved below Ruta 3's cave plateau stands at its
  // Brisa end, and anyone on Ruta 7 at its Carey end.
  if (!s.flags.rutasCortas) {
    if (s.map === 'ruta3' && s.y >= 13) Object.assign(s, { x: 62, y: 28, dir: 'left' });
    if (s.map === 'ruta8') Object.assign(s, { x: 1, y: 12, dir: 'right' });
    s.flags.rutasCortas = true;
  }
  // The rangers' station on the volcano is gone (Elsa stands outside): stand where its door was, and rest at
  // Ciudad Chispa's Palacentro instead. The slopes lost rows too, so anyone below the station's terrace
  // stands at the foot of the trail.
  if (!s.flags.sinEstacion) {
    if (s.map === 'estacion') Object.assign(s, { map: 'laderas', x: 18, y: 15, dir: 'down' });
    else if (s.map === 'laderas' && s.y >= 13) Object.assign(s, { x: 20, y: 25, dir: 'up' });
    if (s.heal.map === 'estacion') s.heal = { map: 'centro_chispa', x: 4, y: 3 };
    s.flags.sinEstacion = true;
  }
  // The canyon grew 6 rows north (the waterfall): stay where you were.
  if (!s.flags.canonCascada) {
    if (s.map === 'canon') s.y += 6;
    s.flags.canonCascada = true;
  }
  // Ruta 2 was redrawn (the user's sketch): anyone saved on it starts again at the Limón end.
  if (!s.flags.ruta2Nueva) {
    if (s.map === 'ruta2') Object.assign(s, { x: 10, y: 39, dir: 'up' });
    s.flags.ruta2Nueva = true;
  }
  // The mine's lever room moved next to the gate (the user): anyone saved in the old one stands in the new one.
  if (!s.flags.palancaJunto) {
    if (s.map === 'mina1' && s.y <= 7 && s.x <= 13) Object.assign(s, { x: 18, y: 3, dir: 'down' });
    s.flags.palancaJunto = true;
  }
  // Fallen rock closes the crater's west walkway (the user): anyone saved where it lies stands just south of it.
  if (!s.flags.craterDerrumbe) {
    if (s.map === 'crater' && s.x <= 5 && s.y >= 8 && s.y <= 12) Object.assign(s, { x: 3, y: 13, dir: 'down' });
    s.flags.craterDerrumbe = true;
  }
  // The west side, shorter (the user): Villa Ocote lost 3 rows, Ruta 5 half its length, Ruta 9 grew 8 rows on top,
  // Ruta 7 became a diagonal. Anyone saved there stands where they were, or close to it.
  if (!s.flags.oesteCorto) {
    const { x, y } = s;
    if (s.map === 'ocote') s.y = y <= 10 ? y : y <= 16 ? y - 1 : y <= 18 ? 15 : y - 3;
    else if (s.map === 'ruta6') {
      if (y <= 21) Object.assign(s, { x: 16, y: 2, dir: 'down' });
      else if (y <= 39) s.y = Math.min(y, 37) - 16;
      else if (y <= 44) s.y = y - 18;
      else Object.assign(s, { x: 20, y: 31, dir: 'down' });
    } else if (s.map === 'ruta10') Object.assign(s, { x: y === 21 || y === 22 ? Math.max(x, 1) : x, y: y + 8 });
    else if (s.map === 'ruta8') Object.assign(s, x < 22 ? { x: 2, y: 20 } : { x: 38, y: 56 }, { dir: 'right' });
    s.flags.oesteCorto = true;
  }
  // The Selva del Jaguar became a labyrinth (the user): anyone saved in it starts again at its gateway.
  if (!s.flags.selvaLaberinto) {
    if (s.map === 'selva') Object.assign(s, { x: 28, y: 20, dir: 'up' });
    s.flags.selvaLaberinto = true;
  }
  if (s.flags.starter && !s.flags.lucasSeFue) Object.assign(s.flags, { lucasEligio: true, lucasSeFue: true });
  s.money ??= 0;
  s.starterPicked ??= ['salchichita', 'gotita', 'aguacatito'].find((sp) => s.caught.includes(sp));
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

/** The phone's local time in hours (19.5 = half past seven), for day and night. Tests can set window.__hour = 22. */
export function clockHour(): number {
  const fake = (globalThis as { __hour?: number }).__hour;
  if (fake !== undefined) return fake;
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

export const flag = (name: string) => !!G.save.flags[name];
export const setFlag = (name: string, v = true) => {
  G.save.flags[name] = v;
};

let uidCounter = 0;
export const uid = () => `${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

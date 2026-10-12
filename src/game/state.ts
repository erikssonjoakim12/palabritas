import type { Dir } from '../engine/input';

export interface Mon {
  uid: string;
  sp: string;
  level: number;
  hp: number;
}

export interface ItemProg {
  pts: number;
  seen: number;
  right: number;
  wrong: number;
  learned: boolean;
  /** Spaced-repetition box: 1 = review in 1 day, 2 = 2 days, 3 = 4 days... */
  box: number;
  due: number;
  last: number;
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
  esferas: number;
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
    esferas: 0,
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
    return true;
  } catch {
    return false;
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

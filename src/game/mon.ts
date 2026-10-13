import { G, uid, type Mon } from './state';
import { SPECIES, learnLevel, type Move } from '../data/species';
import { canLevelUp } from './learning';

export interface Stats {
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
}

// Gen 2 style stat formulas (no IVs/EVs), with a little extra HP so early battles
// last a few questions instead of one or two.
export function stats(mon: Mon): Stats {
  const b = SPECIES[mon.sp].base;
  const L = mon.level;
  const s = (base: number) => Math.floor((base * 2 * L) / 100) + 5;
  return { maxHp: Math.floor((b.hp * 2 * L) / 100) + L + 15, atk: s(b.atk), def: s(b.def), spd: s(b.spd) };
}

export function newMon(sp: string, level: number): Mon {
  const mon: Mon = { uid: uid(), sp, level, hp: 0, since: Date.now() };
  mon.hp = stats(mon).maxHp;
  return mon;
}

export const monName = (mon: Mon) => SPECIES[mon.sp].name;

/** The moves a Palabrita knows at its level. */
export function knownMoves(mon: Mon): Move[] {
  return SPECIES[mon.sp].moves.filter((m) => learnLevel(m) <= mon.level);
}

/** Moves learned when going from level `from` to `to`. */
export function newMoves(mon: Mon, from: number, to: number): Move[] {
  return SPECIES[mon.sp].moves.filter((m) => learnLevel(m) > from && learnLevel(m) <= to);
}

export function healParty() {
  for (const m of G.save.party) m.hp = stats(m).maxHp;
}

export function firstAble(): Mon | undefined {
  return G.save.party.find((m) => m.hp > 0);
}

export interface LevelUp {
  mon: Mon;
  from: number;
  to: number;
}

/**
 * Words are experience: a creature levels up once every item in its current tier is
 * mastered. Checks the whole party, since creatures share themes.
 */
export function checkLevelUps(): LevelUp[] {
  const ups: LevelUp[] = [];
  for (const mon of G.save.party) {
    const from = mon.level;
    while (mon.level < 100) {
      if (!canLevelUp(mon)) break;
      const before = stats(mon).maxHp;
      mon.level++;
      mon.since = Date.now();
      const after = stats(mon).maxHp;
      if (mon.hp > 0) mon.hp = Math.min(after, mon.hp + (after - before));
    }
    if (mon.level > from) ups.push({ mon, from, to: mon.level });
  }
  return ups;
}

export function markSeen(sp: string) {
  if (!G.save.seen.includes(sp)) G.save.seen.push(sp);
}

export function markCaught(sp: string) {
  markSeen(sp);
  if (!G.save.caught.includes(sp)) G.save.caught.push(sp);
}

import { G, uid, type Mon } from './state';
import { SPECIES, learnLevel, type Move } from '../data/species';
import { canLevelUp } from './learning';

/** The starter that's strong against yours: the one Lucas takes in the lab. */
const RIVAL_STARTER: Record<string, string> = { salchichita: 'gotita', gotita: 'aguacatito', aguacatito: 'salchichita' };
export const lucasStarter = () => RIVAL_STARTER[G.save.starterPicked ?? ''] ?? 'gotita';

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

/** A team holds 6 Palabritas at most; more go to the storage box. */
export const PARTY_MAX = 6;

/** Keep a new Palabrita: in the team if there's room, otherwise in the storage box (healed). */
export function keepMon(mon: Mon): 'party' | 'box' {
  markCaught(mon.sp);
  if (G.save.party.length < PARTY_MAX) {
    G.save.party.push(mon);
    return 'party';
  }
  mon.hp = stats(mon).maxHp;
  G.save.box.push(mon);
  return 'box';
}

/** A gift (or a starter, a fossil...): a new Palabrita, kept like a caught one. */
export const giveMon = (sp: string, level: number) => keepMon(newMon(sp, level));

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
 * Words are experience: a Palabrita levels up once its level's new words and review are done
 * (see learning.ts). Checks the whole party, since Palabritas share words.
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

/** Party Palabritas that have reached the level to evolve. */
export const evolutionsDue = () => G.save.party.filter((m) => {
  const e = SPECIES[m.sp].evolves;
  return e && m.level >= e.level;
});

/** Evolve: new species, and the extra PS of the new form (damage taken stays). */
export function evolve(mon: Mon) {
  const to = SPECIES[mon.sp].evolves!.to;
  const before = stats(mon).maxHp;
  mon.sp = to;
  if (mon.hp > 0) mon.hp += stats(mon).maxHp - before;
  markCaught(to);
}

export function markSeen(sp: string) {
  if (!G.save.seen.includes(sp)) G.save.seen.push(sp);
}

export function markCaught(sp: string) {
  markSeen(sp);
  if (!G.save.caught.includes(sp)) G.save.caught.push(sp);
}

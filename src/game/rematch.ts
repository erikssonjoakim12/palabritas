import { G, flag, today } from './state';
import { TRAINERS, BATTLE_ORDER, type TrainerDef } from '../data/trainers';
import { formAt } from './mon';

/*
  Rematches (¡Revancha!): a few trainers on every route (TrainerDef.rematch) ask for one, once a day, when you
  talk to them. They never stop you again when you walk past; a small «!» over them shows they're ready.
  They grow slowly (the user, 2026-11-04): each time at most STEP levels more than the last, and never close to the
  next gym leader, so the gyms still feel like a step up.
*/

/** At most this many levels more than the last rematch. */
const STEP = 2;
/** Never closer than this to the next gym leader's strongest Palabrita. */
const UNDER_LEADER = 6;

/** The gym leaders in the order you meet them (the «Líder» trainers in BATTLE_ORDER). */
const LEADERS = BATTLE_ORDER.flatMap((leg) => leg.trainers).filter((id) => TRAINERS[id].name.startsWith('Líder'));
const top = (t: TrainerDef) => Math.max(...t.team.map(([, l]) => l));

/** A beaten rematch trainer who hasn't fought you today. */
export const rematchReady = (id: string) => !!TRAINERS[id]?.rematch && flag(`beat:${id}`) && (G.save.rematch[id]?.day ?? '') < today();

/**
 * How many levels above their first battle a rematch trainer comes back this time: STEP more than last time, but
 * never above the next leader's strongest − UNDER_LEADER (none past the last gym built), nor above your strongest
 * Palabrita − 1.
 */
export function rematchGrowth(id: string): number {
  const t = TRAINERS[id];
  const next = LEADERS[G.save.medals.length];
  const ceiling = next ? top(TRAINERS[next]) - UNDER_LEADER : Infinity;
  const lead = Math.max(1, ...G.save.party.map((m) => m.level));
  return Math.max(0, Math.min((G.save.rematch[id]?.up ?? 0) + STEP, ceiling - top(t), lead - 1 - top(t)));
}

/** The team for a rematch, `up` levels above the first battle; their Palabritas evolve as they grow. */
export function rematchTeam(t: TrainerDef, up: number): TrainerDef {
  return { ...t, team: t.team.map(([sp, l]) => [formAt(sp, l + up), l + up]) };
}

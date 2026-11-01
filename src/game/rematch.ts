import { G, flag, today } from './state';
import { TRAINERS, type TrainerDef } from '../data/trainers';
import { formAt } from './mon';

/*
  Rematches (¡Revancha!): a few trainers on every route (TrainerDef.rematch) ask for one, once a day, when you
  talk to them. They never stop you again when you walk past; a small «!» over them shows they're ready.
*/

/** A beaten rematch trainer who hasn't fought you today. */
export const rematchReady = (id: string) => !!TRAINERS[id]?.rematch && flag(`beat:${id}`) && (G.save.rematch[id] ?? '') < today();

/**
 * The team for a rematch: one level under your strongest Palabrita, but at most 8 levels above the first time (so
 * each region's rematches stay useful until about its next gym, then level off). Their Palabritas evolve as they grow.
 */
export function rematchTeam(t: TrainerDef): TrainerDef {
  const lead = Math.max(1, ...G.save.party.map((m) => m.level));
  return {
    ...t,
    team: t.team.map(([sp, l]) => {
      const level = Math.min(l + 8, Math.max(l, lead - 1));
      return [formAt(sp, level), level];
    }),
  };
}

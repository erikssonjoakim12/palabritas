import type { Mode } from './species';

export interface TrainerDef {
  id: string;
  name: string;
  /**
   * How you answer when they attack (to take less damage). The questions themselves come
   * from each opponent Palabrita's theme, at its level.
   */
  defenseMode: Mode;
  team: [string, number][];
}

export const TRAINERS: Record<string, TrainerDef> = {
  sofia: { id: 'sofia', name: 'Niña Sofía', defenseMode: 'choose', team: [['conejito', 3]] },
  mateo: { id: 'mateo', name: 'Joven Mateo', defenseMode: 'choose', team: [['mariposita', 5], ['pajarito', 5]] },
  ivan: { id: 'ivan', name: 'Aprendiz Iván', defenseMode: 'choose', team: [['pajarito', 7]] },
  paloma: { id: 'paloma', name: 'Líder Paloma', defenseMode: 'type', team: [['pajarito', 8], ['palomon', 10]] },
};

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
  tomas: { id: 'tomas', name: 'Excursionista Tomás', defenseMode: 'choose', team: [['conejito', 6], ['pajarito', 6]] },
  valeria: { id: 'valeria', name: 'Pintora Valeria', defenseMode: 'choose', team: [['mariposita', 7], ['mariposita', 7]] },
  andres: { id: 'andres', name: 'Joven Andrés', defenseMode: 'type', team: [['pajarito', 7], ['conejito', 8], ['mariposita', 8]] },
  ivan: { id: 'ivan', name: 'Aprendiz Iván', defenseMode: 'choose', team: [['pajarito', 7]] },
  paloma: { id: 'paloma', name: 'Líder Paloma', defenseMode: 'type', team: [['pajarito', 9], ['palomon', 12]] },
};

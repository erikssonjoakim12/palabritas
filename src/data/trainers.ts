import type { Mode } from './species';

export interface TrainerDef {
  id: string;
  name: string;
  /** Theme they quiz you on when they attack (answer well to take less damage). */
  topic: string;
  topicTier: number;
  defenseMode: Mode;
  team: [string, number][];
}

export const TRAINERS: Record<string, TrainerDef> = {
  sofia: { id: 'sofia', name: 'Niña Sofía', topic: 'saludos', topicTier: 3, defenseMode: 'choose', team: [['conejito', 3]] },
  mateo: {
    id: 'mateo',
    name: 'Joven Mateo',
    topic: 'preguntas',
    topicTier: 3,
    defenseMode: 'choose',
    team: [['mariposita', 5], ['pajarito', 5]],
  },
  ivan: { id: 'ivan', name: 'Aprendiz Iván', topic: 'presente', topicTier: 2, defenseMode: 'choose', team: [['pajarito', 7]] },
  paloma: {
    id: 'paloma',
    name: 'Líder Paloma',
    topic: 'presente',
    topicTier: 3,
    defenseMode: 'type',
    team: [['pajarito', 8], ['palomon', 10]],
  },
};

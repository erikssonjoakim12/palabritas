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
  mateo: { id: 'mateo', name: 'Joven Mateo', defenseMode: 'choose', team: [['mariposita', 3], ['pajarito', 3]] },
  tomas: { id: 'tomas', name: 'Excursionista Tomás', defenseMode: 'choose', team: [['conejito', 4], ['pajarito', 4]] },
  valeria: { id: 'valeria', name: 'Pintora Valeria', defenseMode: 'choose', team: [['mariposita', 5], ['mariposita', 5]] },
  andres: { id: 'andres', name: 'Joven Andrés', defenseMode: 'type', team: [['pajarito', 5], ['conejito', 6], ['mariposita', 6]] },
  ivan: { id: 'ivan', name: 'Aprendiz Iván', defenseMode: 'choose', team: [['pajarito', 7], ['mariposita', 7]] },
  paloma: { id: 'paloma', name: 'Líder Paloma', defenseMode: 'type', team: [['pajarito', 9], ['palomon', 12]] },
  // Ruta 3
  rodrigo: { id: 'rodrigo', name: 'Excursionista Rodrigo', defenseMode: 'type', team: [['conejito', 10], ['pajarito', 11]] },
  isabel: { id: 'isabel', name: 'Pintora Isabel', defenseMode: 'type', team: [['mariposita', 11], ['hojadillo', 11]] },
  pablo: { id: 'pablo', name: 'Joven Pablo', defenseMode: 'type', team: [['pajarito', 12], ['conejito', 12]] },
  kevin: { id: 'kevin', name: 'Turista Kevin', defenseMode: 'choose', team: [['pajarito', 12], ['mariposita', 12]] },
  camila: { id: 'camila', name: 'Niña Camila', defenseMode: 'type', team: [['hojadillo', 12], ['mariposita', 13]] },
  ernesto: { id: 'ernesto', name: 'Excursionista Ernesto', defenseMode: 'type', team: [['conejito', 12], ['hojadillo', 13], ['pajarito', 13]] },
  marcos: { id: 'marcos', name: 'Joven Marcos', defenseMode: 'listen', team: [['sillon', 13], ['pajarito', 13]] },
  // Cueva del Eco: here you defend by listening (it's the cave of echoes).
  raul: { id: 'raul', name: 'Espeleólogo Raúl', defenseMode: 'listen', team: [['ecolin', 13], ['ecolin', 14]] },
  daniela: { id: 'daniela', name: 'Exploradora Daniela', defenseMode: 'listen', team: [['ochopatas', 14], ['cuernito', 14]] },
  federico: { id: 'federico', name: 'Arqueólogo Federico', defenseMode: 'listen', team: [['cuernito', 15], ['ochopatas', 15]] },
  javier: { id: 'javier', name: 'Espeleólogo Javier', defenseMode: 'listen', team: [['ecolin', 15], ['ecolin', 15], ['ochopatas', 16]] },
  rocio: { id: 'rocio', name: 'Exploradora Rocío', defenseMode: 'listen', team: [['ochopatas', 16], ['cuernito', 16]] },
};

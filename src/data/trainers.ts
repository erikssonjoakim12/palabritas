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
  rodrigo: { id: 'rodrigo', name: 'Excursionista Rodrigo', defenseMode: 'type', team: [['conejito', 9], ['pajarito', 9]] },
  isabel: { id: 'isabel', name: 'Pintora Isabel', defenseMode: 'type', team: [['mariposita', 9], ['hojadillo', 9]] },
  pablo: { id: 'pablo', name: 'Joven Pablo', defenseMode: 'type', team: [['pajarito', 10], ['conejito', 10]] },
  kevin: { id: 'kevin', name: 'Turista Kevin', defenseMode: 'choose', team: [['pajarito', 10], ['mariposita', 10]] },
  camila: { id: 'camila', name: 'Niña Camila', defenseMode: 'type', team: [['hojadillo', 10], ['mariposita', 11]] },
  ernesto: { id: 'ernesto', name: 'Excursionista Ernesto', defenseMode: 'type', team: [['conejito', 10], ['hojadillo', 11], ['pajarito', 11]] },
  marcos: { id: 'marcos', name: 'Joven Marcos', defenseMode: 'listen', team: [['sillon', 11], ['pajarito', 11]] },
  // Cueva del Eco: here you defend by listening (it's the cave of echoes).
  raul: { id: 'raul', name: 'Espeleólogo Raúl', defenseMode: 'listen', team: [['ecolin', 11], ['ecolin', 12]] },
  daniela: { id: 'daniela', name: 'Exploradora Daniela', defenseMode: 'listen', team: [['ochopatas', 12], ['cuernito', 13]] },
  federico: { id: 'federico', name: 'Arqueólogo Federico', defenseMode: 'listen', team: [['cuernito', 13], ['ochopatas', 14]] },
  javier: { id: 'javier', name: 'Espeleólogo Javier', defenseMode: 'listen', team: [['ecolin', 14], ['ecolin', 14], ['ochopatas', 15]] },
  rocio: { id: 'rocio', name: 'Exploradora Rocío', defenseMode: 'listen', team: [['ochopatas', 14], ['cuernito', 15]] },
  // Region 2: the mine (Equipo Silencio) and Petra's gym. You defend by listening in the mine, by typing in the gym.
  silencioso1: { id: 'silencioso1', name: 'Silencioso', defenseMode: 'listen', team: [['ollita', 13], ['piedrita', 13]] },
  silencioso2: { id: 'silencioso2', name: 'Silenciosa', defenseMode: 'listen', team: [['ecolin', 13], ['ochopatas', 14]] },
  silencioso3: { id: 'silencioso3', name: 'Silencioso', defenseMode: 'listen', team: [['piedrita', 14], ['ecolin', 14]] },
  silencioso4: { id: 'silencioso4', name: 'Silenciosa', defenseMode: 'listen', team: [['ollita', 14], ['ochopatas', 15]] },
  capataz: { id: 'capataz', name: 'Capataz Silencioso', defenseMode: 'listen', team: [['piedrita', 15], ['ollita', 15], ['piedrita', 16]] },
  tito: { id: 'tito', name: 'Alfarero Tito', defenseMode: 'type', team: [['ollita', 15], ['piedrita', 15]] },
  rosario: { id: 'rosario', name: 'Minera Rosario', defenseMode: 'type', team: [['piedrita', 16]] },
  petra: { id: 'petra', name: 'Líder Petra', defenseMode: 'type', team: [['piedrita', 16], ['ollita', 17], ['petroglifon', 19]] },
  // Ruta 5
  lucia: { id: 'lucia', name: 'Pintora Lucía', defenseMode: 'listen', team: [['hojadillo', 13], ['mariposita', 13]] },
};

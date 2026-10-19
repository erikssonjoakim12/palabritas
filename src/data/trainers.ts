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
  /** One or two per route: asks for a rematch once a day when you talk to them (game/rematch.ts). */
  rematch?: boolean;
}

export const TRAINERS: Record<string, TrainerDef> = {
  sofia: { id: 'sofia', name: 'Niña Sofía', defenseMode: 'choose', team: [['conejito', 3]], rematch: true },
  mateo: { id: 'mateo', name: 'Joven Mateo', defenseMode: 'choose', team: [['gusanito', 3], ['pajarito', 3]] },
  tomas: { id: 'tomas', name: 'Excursionista Tomás', defenseMode: 'choose', team: [['conejito', 4], ['pajarito', 4]] },
  valeria: { id: 'valeria', name: 'Pintora Valeria', defenseMode: 'choose', team: [['gusanito', 5], ['capullito', 5]], rematch: true },
  andres: { id: 'andres', name: 'Joven Andrés', defenseMode: 'type', team: [['pajarito', 5], ['conejito', 6], ['gusanito', 6]], rematch: true },
  ivan: { id: 'ivan', name: 'Aprendiz Iván', defenseMode: 'choose', team: [['pajarito', 7], ['capullito', 7]] },
  paloma: { id: 'paloma', name: 'Líder Paloma', defenseMode: 'type', team: [['pajarito', 9], ['palomon', 12]] },
  // Ruta 3
  rodrigo: { id: 'rodrigo', name: 'Excursionista Rodrigo', defenseMode: 'type', team: [['conejito', 9], ['pajarito', 9]] },
  isabel: { id: 'isabel', name: 'Pintora Isabel', defenseMode: 'type', team: [['capullito', 9], ['hojadillo', 9]], rematch: true },
  pablo: { id: 'pablo', name: 'Joven Pablo', defenseMode: 'type', team: [['pajarito', 10], ['conejito', 10]] },
  kevin: { id: 'kevin', name: 'Turista Kevin', defenseMode: 'choose', team: [['pajarito', 10], ['mariposita', 10]] },
  camila: { id: 'camila', name: 'Niña Camila', defenseMode: 'type', team: [['hojadillo', 10], ['mariposita', 11]] },
  ernesto: { id: 'ernesto', name: 'Excursionista Ernesto', defenseMode: 'type', team: [['conejito', 10], ['hojadillo', 11], ['pajarito', 11]], rematch: true },
  marcos: { id: 'marcos', name: 'Joven Marcos', defenseMode: 'listen', team: [['cojincito', 11], ['pajarito', 11]] },
  // Cueva del Eco: here you defend by listening (it's the cave of echoes).
  raul: { id: 'raul', name: 'Espeleólogo Raúl', defenseMode: 'listen', team: [['ecolin', 11], ['ecolin', 12]] },
  daniela: { id: 'daniela', name: 'Exploradora Daniela', defenseMode: 'listen', team: [['ochopatas', 12], ['cuernito', 13]] },
  federico: { id: 'federico', name: 'Arqueólogo Federico', defenseMode: 'listen', team: [['cuernito', 13], ['ochopatas', 14]], rematch: true },
  javier: { id: 'javier', name: 'Espeleólogo Javier', defenseMode: 'listen', team: [['ecolin', 14], ['ecolin', 14], ['ochopatas', 15]] },
  rocio: { id: 'rocio', name: 'Exploradora Rocío', defenseMode: 'listen', team: [['ochopatas', 14], ['cuernito', 15]] },
  // Region 2: the mine (Equipo Silencio) and Petra's gym. You defend by listening in the mine, by typing in the gym.
  silencioso1: { id: 'silencioso1', name: 'Silencioso', defenseMode: 'listen', team: [['ollita', 15], ['piedrita', 15]] },
  silencioso2: { id: 'silencioso2', name: 'Silenciosa', defenseMode: 'listen', team: [['ecolin', 15], ['ochopatas', 16]] },
  silencioso3: { id: 'silencioso3', name: 'Silencioso', defenseMode: 'listen', team: [['piedrita', 16], ['ecolin', 16]] },
  silencioso4: { id: 'silencioso4', name: 'Silenciosa', defenseMode: 'listen', team: [['ollita', 16], ['ochopatas', 17]] },
  capataz: { id: 'capataz', name: 'Capataz Silencioso', defenseMode: 'listen', team: [['piedrita', 16], ['ollita', 17], ['piedrita', 17]] },
  tito: { id: 'tito', name: 'Alfarero Tito', defenseMode: 'type', team: [['ollita', 17], ['piedrita', 17]] },
  rosario: { id: 'rosario', name: 'Minera Rosario', defenseMode: 'type', team: [['piedrita', 17], ['ollita', 18]] },
  petra: { id: 'petra', name: 'Líder Petra', defenseMode: 'type', team: [['piedrita', 17], ['ollita', 19], ['petroglifon', 21]] },
  // Ruta 5 and the canyon (you defend by listening in the highlands).
  armando: { id: 'armando', name: 'Leñador Armando', defenseMode: 'listen', team: [['ardillita', 12], ['pajarito', 12]], rematch: true },
  elena: { id: 'elena', name: 'Campista Elena', defenseMode: 'listen', team: [['colibri', 12], ['espinita', 13]] },
  julio: { id: 'julio', name: 'Pescador Julio', defenseMode: 'listen', team: [['hojadillo', 13], ['colibri', 13]], rematch: true },
  rosa: { id: 'rosa', name: 'Campista Rosa', defenseMode: 'listen', team: [['espinita', 13], ['ardillita', 14]] },
  // Your rival. His first Palabrita is the starter strong against yours (region2.ts lucasStarter).
  lucas1: { id: 'lucas1', name: 'Lucas', defenseMode: 'type', team: [['gotita', 15], ['pajarito', 12]] },
  // Region 3: Ruta 6, Ruta 7, the turtle beach and Marina's surf school (the A2 listening level: defend by listening).
  ramon: { id: 'ramon', name: 'Leñador Ramón', defenseMode: 'listen', team: [['ardillita', 17], ['colibri', 17]] },
  laura: { id: 'laura', name: 'Campista Laura', defenseMode: 'listen', team: [['espinita', 17], ['ardillita', 18]] },
  esteban: { id: 'esteban', name: 'Vaquero Esteban', defenseMode: 'listen', team: [['conejito', 17], ['hojadillo', 18]] },
  juana: { id: 'juana', name: 'Vaquera Juana', defenseMode: 'listen', team: [['liebron', 19]] },
  hugo: { id: 'hugo', name: 'Observador Hugo', defenseMode: 'listen', rematch: true, team: [['colibri', 18], ['palomon', 19]] },
  mario: { id: 'mario', name: 'Pescador Mario', defenseMode: 'listen', rematch: true, team: [['mojarrita', 17], ['mojarrita', 18], ['mojarrita', 18]] },
  andrea: { id: 'andrea', name: 'Campista Andrea', defenseMode: 'listen', team: [['ollita', 18], ['espinita', 19]] },
  tono: { id: 'tono', name: 'Vaquero Toño', defenseMode: 'listen', team: [['liebron', 19], ['hojadillo', 19]] },
  surfista1: { id: 'surfista1', name: 'Surfista Nico', defenseMode: 'listen', team: [['cangrejito', 19], ['pelicanito', 19]] },
  banista1: { id: 'banista1', name: 'Bañista Sara', defenseMode: 'listen', team: [['coquito', 19], ['cangrejito', 20]] },
  pescador_r7: { id: 'pescador_r7', name: 'Pescador Chalo', defenseMode: 'listen', rematch: true, team: [['mojarrita', 19], ['mordisquito', 20]] },
  surfista2: { id: 'surfista2', name: 'Surfista Vale', defenseMode: 'listen', team: [['pelicanito', 20], ['mordisquito', 20]] },
  banista2: { id: 'banista2', name: 'Bañista Maripaz', defenseMode: 'listen', team: [['coquito', 20], ['cangrejito', 20]] },
  turista_r7: { id: 'turista_r7', name: 'Turista Jenny', defenseMode: 'choose', rematch: true, team: [['pelicanito', 20], ['coquito', 20]] },
  silencioso8: { id: 'silencioso8', name: 'Silencioso', defenseMode: 'listen', team: [['cangrejito', 19], ['ecolin', 20]] },
  silencioso9: { id: 'silencioso9', name: 'Silenciosa', defenseMode: 'listen', team: [['ochopatas', 20], ['petroglifon', 20]] },
  silencioso10: { id: 'silencioso10', name: 'Silencioso', defenseMode: 'listen', team: [['ecolin', 20], ['ollita', 20]] },
  callada: { id: 'callada', name: 'Callada', defenseMode: 'listen', team: [['ochopatas', 22], ['murcielon', 22], ['petroglifon', 23]] },
  surfista_gym: { id: 'surfista_gym', name: 'Surfista Kike', defenseMode: 'type', team: [['cangrejito', 21], ['mordisquito', 21]] },
  salvavidas: { id: 'salvavidas', name: 'Salvavidas Fer', defenseMode: 'type', team: [['pelicanito', 21], ['cangrejito', 21]] },
  banista_gym: { id: 'banista_gym', name: 'Bañista Tere', defenseMode: 'type', team: [['coquito', 22], ['pelicanito', 21]] },
  marina: { id: 'marina', name: 'Líder Marina', defenseMode: 'type', team: [['cangrejon', 22], ['maleticano', 23], ['mordiscon', 25]] },
  // Rival #2: his starter's second form (region3.ts lucasPlaya builds the team).
  lucas2: { id: 'lucas2', name: 'Lucas', defenseMode: 'type', team: [['nubarron', 22], ['hojadillo', 19], ['palomon', 20]] },
  lucia: { id: 'lucia', name: 'Pintora Lucía', defenseMode: 'listen', team: [['hojadillo', 13], ['mariposita', 13]], rematch: true },
};

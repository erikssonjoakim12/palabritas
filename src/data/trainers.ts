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
  // Region 4: Ruta 8, the volcano, Ruta 9 and the fireworks workshop (route trainers 18-26, the user).
  campesino: { id: 'campesino', name: 'Campesino Rigo', defenseMode: 'listen', rematch: true, team: [['liebron', 18], ['hormiguita', 18]] },
  vaquera_r8: { id: 'vaquera_r8', name: 'Vaquera Chela', defenseMode: 'listen', team: [['liebron', 19], ['zopilotito', 19]] },
  pescadora_r8: { id: 'pescadora_r8', name: 'Pescadora Iris', defenseMode: 'listen', team: [['mojarrita', 18], ['mojarrita', 19], ['mordisquito', 19]] },
  turista_r8: { id: 'turista_r8', name: 'Turista Mike', defenseMode: 'choose', team: [['pelicanito', 19], ['coquito', 19]] },
  cortador: { id: 'cortador', name: 'Cortador Juan', defenseMode: 'listen', team: [['hormiguita', 19], ['zopilotito', 20]] },
  cortadora: { id: 'cortadora', name: 'Cortadora Lidia', defenseMode: 'listen', rematch: true, team: [['zopilotito', 20], ['hormiguita', 20]] },
  granjero: { id: 'granjero', name: 'Granjero Pancho', defenseMode: 'listen', team: [['conejito', 20], ['liebron', 21]] },
  ciclista: { id: 'ciclista', name: 'Ciclista Óscar', defenseMode: 'listen', team: [['liebron', 21], ['zopilotito', 21]] },
  guardaparque1: { id: 'guardaparque1', name: 'Guardaparque Raquel', defenseMode: 'listen', team: [['chispita', 21], ['zopilotito', 22]] },
  vulcanologa1: { id: 'vulcanologa1', name: 'Vulcanóloga Clara', defenseMode: 'listen', rematch: true, team: [['chispita', 22], ['zopilotito', 22]] },
  guardaparque2: { id: 'guardaparque2', name: 'Guardaparque Mauricio', defenseMode: 'listen', team: [['chocoyito', 22], ['zopilotito', 23]] },
  vulcanologo2: { id: 'vulcanologo2', name: 'Vulcanólogo Erick', defenseMode: 'listen', team: [['ecolin', 23], ['taranton', 23]] },
  silencioso5: { id: 'silencioso5', name: 'Silencioso', defenseMode: 'listen', team: [['ecolin', 23], ['piedrita', 24]] },
  silencioso6: { id: 'silencioso6', name: 'Silenciosa', defenseMode: 'listen', team: [['ochopatas', 24], ['ollita', 24]] },
  silencioso7: { id: 'silencioso7', name: 'Silencioso', defenseMode: 'listen', team: [['petroglifon', 24], ['murcielon', 25]] },
  polvorera: { id: 'polvorera', name: 'Polvorera Gloria', defenseMode: 'type', team: [['chispita', 25], ['chispita', 25]] },
  malabarista: { id: 'malabarista', name: 'Malabarista Ricky', defenseMode: 'type', team: [['chocoyito', 25], ['coheton', 26]] },
  fritanguero: { id: 'fritanguero', name: 'Fritanguero Neno', defenseMode: 'type', team: [['chocoyote', 26], ['chispita', 26]] },
  campesina_r9: { id: 'campesina_r9', name: 'Campesina Tula', defenseMode: 'listen', team: [['zopilotito', 24], ['liebron', 25]] },
  ciclista_r9: { id: 'ciclista_r9', name: 'Ciclista Bruno', defenseMode: 'listen', rematch: true, team: [['zopilotito', 25], ['hormigon', 25]] },
  excursionista_r9: { id: 'excursionista_r9', name: 'Excursionista Lila', defenseMode: 'listen', team: [['palomon', 25], ['liebron', 26]] },
  // Optional trainers where the climb to Don Tizón is steepest (the sugarcane fields and the volcano's side terraces).
  cortadora_marta: { id: 'cortadora_marta', name: 'Cortadora Marta', defenseMode: 'listen', team: [['hormigon', 23], ['hormiguita', 22], ['zopilotito', 22]] },
  cortador_wilmer: { id: 'cortador_wilmer', name: 'Cortador Wilmer', defenseMode: 'listen', team: [['liebron', 22], ['hormiguita', 23]] },
  excursionista_noel: { id: 'excursionista_noel', name: 'Excursionista Noel', defenseMode: 'listen', team: [['chocoyito', 23], ['chispita', 23], ['zopilotito', 24]] },
  vulcanologa_sara: { id: 'vulcanologa_sara', name: 'Vulcanóloga Sara', defenseMode: 'listen', rematch: true, team: [['chispita', 24], ['chocoyote', 25]] },
  fotografo_max: { id: 'fotografo_max', name: 'Fotógrafo Max', defenseMode: 'choose', team: [['zopilotito', 24], ['chocoyito', 24], ['liebron', 25]] },
  // Region 4's bosses. Lucas #3: region4.ts builds his team from his starter's second form. Brasita's family only
  // appears on bosses (the user): Don Tizón's ace is Brasaurio.
  sigilo: { id: 'sigilo', name: 'Don Sigilo', defenseMode: 'type', team: [['murcielon', 27], ['taranton', 28], ['petroglifon', 29]] },
  lucas3: { id: 'lucas3', name: 'Lucas', defenseMode: 'type', team: [['nubarron', 28], ['hojarasco', 25], ['palomon', 25], ['cangrejon', 26]] },
  tizon: { id: 'tizon', name: 'Líder Don Tizón', defenseMode: 'type', team: [['chocoyote', 27], ['coheton', 28], ['brasaurio', 32]] },
};

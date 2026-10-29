import type { Type } from './types';

/** How a move is "cast": each move is a different kind of Spanish challenge. */
export type Mode = 'choose' | 'listen' | 'type' | 'speak';

/**
 * Each kind of challenge is a kind of move. Harder challenges hit harder.
 * learnAt: like in Gold/Silver, a Palabrita starts with two moves and learns the others as it
 * levels up (a move can override this with its own level).
 */
export const MODE_INFO: Record<Mode, { icon: string; es: string; en: string; power: number; learnAt: number }> = {
  choose: { icon: '👆', es: 'Elegir', en: 'Tap the meaning', power: 35, learnAt: 1 },
  type: { icon: '⌨️', es: 'Escribir', en: 'Write it in Spanish', power: 45, learnAt: 1 },
  listen: { icon: '🎧', es: 'Escuchar', en: 'Write what you hear', power: 55, learnAt: 6 },
  speak: { icon: '🎤', es: 'Hablar', en: 'Say it in Spanish', power: 65, learnAt: 10 },
};

/**
 * The starters (strong) learn their moves later than most (the user: weaker Palabritas learn more moves earlier,
 * stronger ones later): the 3rd at 10, and the 4th only once they've evolved at 16 (Gotita's Electric storm comes
 * with Nubarrón). Evolved forms keep these.
 */
export const STARTER_MOVES = { third: 10, fourth: 16 };

export interface Move {
  name: string;
  type: Type;
  mode: Mode;
  /** Level it is learned at (default: MODE_INFO[mode].learnAt). */
  level?: number;
}

export interface Species {
  id: string;
  name: string;
  types: Type[];
  theme: string;
  /** Starters teach the core words in order (the most useful first). They are never found in the wild early on. */
  starter?: boolean;
  base: { hp: number; atk: number; def: number; spd: number };
  moves: [Move, Move, Move, Move];
  /** 0..1, higher is easier to catch. */
  catchRate: number;
  dex: { es: string; en: string };
  /** Evolves into another species at a level (at the end of a battle turn, like in the anime). */
  evolves?: { to: string; level: number };
  /**
   * The family's word sample is seeded with this id instead of the first form's: when a family grows a new first
   * stage (Gusanito before Mariposita), the Palabritas people already have keep exactly their words.
   */
  seed?: string;
}

const m = (name: string, type: Type, mode: Mode, level?: number): Move => ({ name, type, mode, level });

export const SPECIES: Record<string, Species> = {
  salchichita: {
    id: 'salchichita',
    name: 'Salchichita',
    types: ['Fuego'],
    theme: 'perro',
    starter: true,
    base: { hp: 45, atk: 54, def: 43, spd: 62 },
    moves: [m('Ladrido', 'Normal', 'choose'), m('Mordisco', 'Siniestro', 'type'), m('Olfato', 'Normal', 'listen', STARTER_MOVES.third), m('Mostaza Ardiente', 'Fuego', 'speak', STARTER_MOVES.fourth)],
    catchRate: 0.4,
    dex: {
      es: 'Mitad perro salchicha, mitad perro caliente. Siempre huele a pan recién hecho.',
      en: 'Half dachshund (sausage dog), half hot dog. It always smells of fresh bread.',
    },
  },
  gotita: {
    id: 'gotita',
    name: 'Gotita',
    types: ['Agua'],
    theme: 'tiempo',
    starter: true,
    base: { hp: 46, atk: 48, def: 62, spd: 45 },
    moves: [m('Salpicón', 'Normal', 'choose'), m('Remolino', 'Agua', 'type'), m('Llovizna', 'Agua', 'listen', STARTER_MOVES.third), m('Tormenta', 'Eléctrico', 'speak', STARTER_MOVES.fourth)],
    catchRate: 0.4,
    dex: {
      es: 'Nace de la primera gota de lluvia. Cuando está triste, llueve.',
      en: 'Born from the first raindrop. When it is sad, it rains.',
    },
  },
  aguacatito: {
    id: 'aguacatito',
    name: 'Aguacatito',
    types: ['Planta'],
    theme: 'comida',
    starter: true,
    base: { hp: 48, atk: 50, def: 52, spd: 44 },
    moves: [m('Placaje', 'Normal', 'choose'), m('Guacamolazo', 'Planta', 'type'), m('Hoja Afilada', 'Planta', 'listen', STARTER_MOVES.third), m('Semilla Dura', 'Roca', 'speak', STARTER_MOVES.fourth)],
    catchRate: 0.4,
    dex: {
      es: 'Vive en los mercados. Su hueso es muy duro y lo usa para atacar.',
      en: 'It lives in markets. Its pit is very hard and it uses it to attack.',
    },
  },
  pajarito: {
    id: 'pajarito',
    name: 'Pajarito',
    types: ['Normal', 'Volador'],
    theme: 'naturaleza',
    base: { hp: 40, atk: 45, def: 40, spd: 56 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Aleteo', 'Volador', 'type'), m('Trino', 'Normal', 'listen', 4), m('Vendaval', 'Volador', 'speak', 7)],
    catchRate: 0.6,
    dex: {
      es: 'Canta todas las mañanas. Sus canciones despiertan al pueblo.',
      en: 'It sings every morning. Its songs wake up the town.',
    },
  },
  conejito: {
    id: 'conejito',
    name: 'Conejito',
    types: ['Normal'],
    theme: 'numeros',
    base: { hp: 44, atk: 48, def: 40, spd: 66 },
    moves: [m('Brinco', 'Normal', 'choose'), m('Patada', 'Lucha', 'type'), m('Cuenta Atrás', 'Normal', 'listen', 4), m('Multiplicar', 'Normal', 'speak', 7)],
    catchRate: 0.6,
    dex: {
      es: 'Cuenta todo lo que ve. Si pierde la cuenta, empieza otra vez.',
      en: 'It counts everything it sees. If it loses count, it starts again.',
    },
  },
  // ----- Ruta 3 and the Cueva del Eco -----
  hojadillo: {
    id: 'hojadillo',
    name: 'Hojadillo',
    types: ['Planta'],
    theme: 'naturaleza',
    base: { hp: 50, atk: 55, def: 66, spd: 40 },
    moves: [m('Rodar', 'Normal', 'choose'), m('Hoja Afilada', 'Planta', 'type'), m('Látigo Floral', 'Planta', 'listen'), m('Tormenta de Hojas', 'Planta', 'speak')],
    catchRate: 0.45,
    dex: {
      es: 'Su caparazón está hecho de hojas. Cuando tiene miedo, se hace una bola y solo se ve su flor.',
      en: 'Its shell is made of leaves. When it’s scared, it rolls into a ball and only its flower shows.',
    },
  },
  ecolin: {
    id: 'ecolin',
    name: 'Ecolín',
    types: ['Volador', 'Siniestro'],
    theme: 'tiempo',
    base: { hp: 40, atk: 48, def: 38, spd: 68 },
    moves: [m('Chillido', 'Normal', 'choose'), m('Mordisco', 'Siniestro', 'type'), m('Eco', 'Normal', 'listen'), m('Vuelo Nocturno', 'Volador', 'speak')],
    catchRate: 0.55,
    dex: {
      es: 'Duerme de día y vuela de noche. Grita en la cueva y escucha el eco para no chocar.',
      en: 'It sleeps by day and flies by night. It shouts in the cave and listens to the echo so it doesn’t bump into things.',
    },
  },
  ochopatas: {
    id: 'ochopatas',
    name: 'Ochopatas',
    types: ['Bicho', 'Veneno'],
    theme: 'numeros',
    base: { hp: 46, atk: 56, def: 44, spd: 50 },
    moves: [m('Picadura', 'Bicho', 'choose'), m('Telaraña', 'Bicho', 'type'), m('Colmillo Veneno', 'Veneno', 'listen'), m('Ocho Patadas', 'Lucha', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Siempre cuenta sus patas: uno, dos, tres... ¡ocho! Si cuenta siete, se pone muy nervioso.',
      en: 'It always counts its legs: one, two, three... eight! If it counts seven, it gets very nervous.',
    },
  },
  cuernito: {
    id: 'cuernito',
    name: 'Cuernito',
    types: ['Bicho', 'Lucha'],
    theme: 'colores',
    base: { hp: 52, atk: 62, def: 58, spd: 34 },
    moves: [m('Cornada', 'Normal', 'choose'), m('Embestida', 'Bicho', 'type'), m('Zumbido', 'Bicho', 'listen'), m('Megacuerno', 'Bicho', 'speak')],
    catchRate: 0.45,
    dex: {
      es: 'Su caparazón brilla de muchos colores en la oscuridad. Con su cuerno levanta piedras grandes.',
      en: 'Its shell shines in many colors in the dark. With its horn it lifts big rocks.',
    },
  },
  gusanito: {
    id: 'gusanito',
    name: 'Gusanito',
    types: ['Bicho'],
    theme: 'colores',
    // Mariposita was its own Palabrita before Gusanito came: its words stay the same.
    seed: 'mariposita',
    base: { hp: 40, atk: 36, def: 40, spd: 44 },
    moves: [m('Polvillo', 'Bicho', 'choose'), m('Seda', 'Bicho', 'type'), m('Arcoíris', 'Normal', 'listen', 5), m('Vuelo Colorido', 'Bicho', 'speak', 8)],
    catchRate: 0.65,
    dex: {
      es: 'Come hojas todo el día. Sus rayas tienen todos los colores del arcoíris.',
      en: 'It eats leaves all day. Its stripes have every color of the rainbow.',
    },
  },
  cojincito: {
    id: 'cojincito',
    name: 'Cojincito',
    types: ['Fantasma'],
    theme: 'casa',
    // Sillón was its own Palabrita before Cojincito came: its words stay the same.
    seed: 'sillon',
    base: { hp: 44, atk: 38, def: 54, spd: 32 },
    moves: [m('Cojinazo', 'Normal', 'choose'), m('Resorte', 'Normal', 'type'), m('Crujido', 'Fantasma', 'listen', 7), m('Siesta Eterna', 'Fantasma', 'speak', 12)],
    catchRate: 0.5,
    dex: {
      es: 'Un cojín que flota de noche. Si te sientas encima, se ríe.',
      en: 'A cushion that floats at night. If you sit on it, it laughs.',
    },
  },
  // ----- Region 2: the pine highlands -----
  piedrita: {
    id: 'piedrita',
    name: 'Piedrita',
    types: ['Roca'],
    theme: 'cuerpo',
    base: { hp: 48, atk: 52, def: 70, spd: 28 },
    moves: [m('Lanzarrocas', 'Roca', 'choose'), m('Cabezazo', 'Normal', 'type'), m('Grabado', 'Roca', 'listen'), m('Avalancha', 'Roca', 'speak')],
    catchRate: 0.45,
    dex: {
      es: 'Tiene una cara dibujada hace mil años. Cuando se aburre, se dibuja otra.',
      en: 'It has a face drawn a thousand years ago. When it gets bored, it draws a new one.',
    },
  },
  ollita: {
    id: 'ollita',
    name: 'Ollita',
    types: ['Tierra'],
    theme: 'cocina',
    base: { hp: 50, atk: 46, def: 62, spd: 40 },
    moves: [m('Tapazo', 'Normal', 'choose'), m('Barro', 'Tierra', 'type'), m('Hervor', 'Fuego', 'listen'), m('Olla Exprés', 'Tierra', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Siempre tiene algo rico cocinándose adentro. Nadie sabe qué es.',
      en: 'There’s always something tasty cooking inside. Nobody knows what it is.',
    },
  },
  ardillita: {
    id: 'ardillita',
    name: 'Ardillita',
    types: ['Normal'],
    theme: 'deportes',
    base: { hp: 42, atk: 48, def: 38, spd: 70 },
    moves: [m('Voltereta', 'Normal', 'choose'), m('Patada', 'Lucha', 'type'), m('Silbato', 'Normal', 'listen'), m('Salto Mortal', 'Lucha', 'speak')],
    catchRate: 0.55,
    dex: {
      es: 'Hace ejercicio todas las mañanas. Su cola es más grande que su cuerpo.',
      en: 'It exercises every morning. Its tail is bigger than its body.',
    },
  },
  colibri: {
    id: 'colibri',
    name: 'Colibrí',
    types: ['Volador'],
    theme: 'musica',
    base: { hp: 36, atk: 44, def: 36, spd: 80 },
    moves: [m('Pico Fino', 'Volador', 'choose'), m('Tararear', 'Normal', 'type'), m('Melodía', 'Normal', 'listen'), m('Concierto', 'Volador', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Mueve las alas ochenta veces por segundo. Su zumbido suena como una canción.',
      en: 'It beats its wings eighty times a second. Its hum sounds like a song.',
    },
  },
  espinita: {
    id: 'espinita',
    name: 'Espinita',
    types: ['Normal'],
    theme: 'salud',
    base: { hp: 46, atk: 44, def: 52, spd: 38 },
    moves: [m('Pinchazo', 'Normal', 'choose'), m('Agujas', 'Acero', 'type'), m('Cola Prensil', 'Normal', 'listen'), m('Lluvia de Púas', 'Acero', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'De bebé, sus púas son suaves. Le encanta comer fruta madura.',
      en: 'As a baby its spines are soft. It loves to eat ripe fruit.',
    },
  },
  caparazonte: {
    id: 'caparazonte',
    name: 'Caparazonte',
    types: ['Roca', 'Tierra'],
    theme: 'historia',
    base: { hp: 52, atk: 56, def: 78, spd: 24 },
    moves: [m('Caparazón', 'Normal', 'choose'), m('Excavar', 'Tierra', 'type'), m('Eco Antiguo', 'Roca', 'listen'), m('Cola Maza', 'Roca', 'speak')],
    catchRate: 0.3,
    dex: {
      es: 'Vivió hace diez mil años. Un museo lo despertó, ¡y ahora quiere ver el mundo!',
      en: 'It lived ten thousand years ago. A museum woke it up, and now it wants to see the world!',
    },
  },
  guardabarranco: {
    id: 'guardabarranco',
    name: 'Guardabarranco',
    types: ['Normal', 'Volador'],
    theme: 'latinoamerica',
    base: { hp: 60, atk: 62, def: 58, spd: 84 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Cola Raqueta', 'Normal', 'type'), m('Canto del Barranco', 'Normal', 'listen'), m('Vuelo Turquesa', 'Volador', 'speak')],
    catchRate: 0.15,
    dex: {
      es: 'Es el ave nacional de Nicaragua. Viaja por toda América y conoce muchos países.',
      en: 'It’s Nicaragua’s national bird. It travels all over the Americas and knows many countries.',
    },
  },
  // ----- Region 3: the coast -----
  cangrejito: {
    id: 'cangrejito',
    name: 'Cangrejito',
    types: ['Agua'],
    theme: 'playa',
    base: { hp: 42, atk: 58, def: 56, spd: 36 },
    moves: [m('Pinza', 'Normal', 'choose'), m('Burbuja', 'Agua', 'type'), m('Ola', 'Agua', 'listen'), m('Martillazo', 'Agua', 'speak')],
    catchRate: 0.55,
    dex: {
      es: 'Camina de lado por la playa. Si ve una toalla, se la lleva.',
      en: 'It walks sideways along the beach. If it sees a towel, it takes it.',
    },
  },
  coquito: {
    id: 'coquito',
    name: 'Coquito',
    types: ['Planta'],
    theme: 'frutas',
    base: { hp: 50, atk: 44, def: 58, spd: 36 },
    moves: [m('Cabezazo', 'Normal', 'choose'), m('Agua de Coco', 'Agua', 'type'), m('Hoja de Palma', 'Planta', 'listen'), m('Lluvia de Cocos', 'Planta', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Cae de las palmeras cuando hay viento. Por dentro tiene agua dulce y fresca.',
      en: 'It falls from palm trees when it’s windy. Inside it has sweet, fresh water.',
    },
  },
  mojarrita: {
    id: 'mojarrita',
    name: 'Mojarrita',
    types: ['Agua'],
    // A three-stage line (the user): Mojarrita → Mordisquito (20) → Mordiscón (38), all on the sea theme, and only in
    // the lake. Everywhere else you fish Tilapitas.
    theme: 'mar',
    base: { hp: 38, atk: 34, def: 40, spd: 58 },
    moves: [m('Aleta', 'Agua', 'choose'), m('Mordisco', 'Siniestro', 'type'), m('Remolino', 'Agua', 'listen'), m('Tiburonazo', 'Agua', 'speak')],
    catchRate: 0.7,
    dex: {
      es: 'Vive en el gran lago. Es pequeña, ¡pero ya muerde como un tiburón!',
      en: 'It lives in the great lake. It’s small, but it already bites like a shark!',
    },
  },
  tilapita: {
    id: 'tilapita',
    name: 'Tilapita',
    types: ['Agua'],
    // The fish of rivers, lagoons and the sea (the user): it becomes a swordfish.
    theme: 'pesca',
    base: { hp: 42, atk: 40, def: 38, spd: 56 },
    moves: [m('Salpicar', 'Agua', 'choose'), m('Coletazo', 'Normal', 'type'), m('Burbujitas', 'Agua', 'listen'), m('Estocada', 'Acero', 'speak')],
    catchRate: 0.7,
    dex: {
      es: 'Vive en ríos, lagunas y hasta en el mar. ¡Es el primer pez que pesca todo el mundo!',
      en: 'It lives in rivers, lagoons and even the sea. It’s the first fish everyone catches!',
    },
  },
  pelicanito: {
    id: 'pelicanito',
    name: 'Pelicanito',
    types: ['Agua', 'Volador'],
    theme: 'viaje',
    base: { hp: 48, atk: 46, def: 44, spd: 56 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Clavado', 'Agua', 'type'), m('Viento de Mar', 'Volador', 'listen'), m('Vuelo Largo', 'Volador', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Lleva sus cosas en la bolsa del pico. Siempre está listo para viajar.',
      en: 'It carries its things in its beak pouch. It’s always ready to travel.',
    },
  },
  paslamita: {
    id: 'paslamita',
    name: 'Paslamita',
    types: ['Agua'],
    theme: 'familia',
    base: { hp: 52, atk: 40, def: 60, spd: 40 },
    moves: [m('Placaje', 'Normal', 'choose'), m('Pistola Agua', 'Agua', 'type'), m('Arena Mojada', 'Tierra', 'listen'), m('Gran Ola', 'Agua', 'speak')],
    catchRate: 0.45,
    dex: {
      es: 'Nace en la arena y corre al mar. De grande, vuelve a la misma playa para tener a sus bebés.',
      en: 'It hatches in the sand and runs to the sea. As an adult it returns to the same beach to have its babies.',
    },
  },
  // ----- Region 4: the volcanoes and dry forest -----
  /** The user's fire lizard: rare and slow to grow, then very powerful (Brasaurio at 32, Volcasaurio at 50). */
  brasita: {
    id: 'brasita',
    name: 'Brasita',
    types: ['Fuego'],
    theme: 'animales',
    base: { hp: 45, atk: 60, def: 45, spd: 55 },
    moves: [m('Brasas', 'Fuego', 'choose'), m('Coletazo', 'Normal', 'type'), m('Calor del Sol', 'Fuego', 'listen'), m('Llamarada', 'Fuego', 'speak')],
    catchRate: 0.3,
    dex: {
      es: 'Toma el sol en las piedras del volcán. Las brasas de su cola nunca se apagan.',
      en: 'It sunbathes on the volcano’s rocks. The embers on its tail never go out.',
    },
  },
  hormiguita: {
    id: 'hormiguita',
    name: 'Hormiguita',
    types: ['Bicho', 'Planta'],
    theme: 'trabajo',
    base: { hp: 40, atk: 56, def: 50, spd: 52 },
    moves: [m('Pellizco', 'Bicho', 'choose'), m('Cortar Hoja', 'Planta', 'type'), m('Trabajo en Equipo', 'Normal', 'listen'), m('Hoja Gigante', 'Planta', 'speak')],
    catchRate: 0.55,
    dex: {
      es: 'Trabaja todo el día. Lleva hojas más grandes que su cuerpo.',
      en: 'It works all day. It carries leaves bigger than its body.',
    },
  },
  /** A firefly whose tail throws sparks like a firework. */
  chispita: {
    id: 'chispita',
    name: 'Chispita',
    types: ['Bicho', 'Fuego'],
    theme: 'fiesta',
    base: { hp: 38, atk: 56, def: 36, spd: 68 },
    moves: [m('Chispa', 'Fuego', 'choose'), m('Zumbido', 'Bicho', 'type'), m('Luz de Fiesta', 'Fuego', 'listen'), m('Fuegos Artificiales', 'Fuego', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Una luciérnaga con la cola llena de chispas. Le encantan las fiestas y la música.',
      en: 'A firefly with a tail full of sparks. It loves parties and music.',
    },
  },
  chocoyito: {
    id: 'chocoyito',
    name: 'Chocoyito',
    types: ['Normal', 'Volador'],
    theme: 'conversacion',
    base: { hp: 42, atk: 46, def: 40, spd: 66 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Charla', 'Normal', 'type'), m('Repetir', 'Normal', 'listen'), m('Grito del Volcán', 'Fuego', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Repite todo lo que oye. Si le hablas en español, ¡te contesta en español!',
      en: 'It repeats everything it hears. Talk to it in Spanish and it answers in Spanish!',
    },
  },
  zopilotito: {
    id: 'zopilotito',
    name: 'Zopilotito',
    types: ['Volador', 'Siniestro'],
    theme: 'ciudad',
    base: { hp: 50, atk: 48, def: 46, spd: 50 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Barrer', 'Normal', 'type'), m('Vuelo en Círculos', 'Volador', 'listen'), m('Sombra Negra', 'Siniestro', 'speak')],
    catchRate: 0.5,
    dex: {
      es: 'Limpia las calles de la ciudad. Sin él, todo estaría sucio.',
      en: 'It cleans the city streets. Without it, everything would be dirty.',
    },
  },
  /** A fawn in a festival mask (a gift from the Torovenado costume quest). */
  venadito: {
    id: 'venadito',
    name: 'Venadito',
    types: ['Normal'],
    theme: 'ropa',
    base: { hp: 46, atk: 52, def: 46, spd: 60 },
    moves: [m('Cornada', 'Normal', 'choose'), m('Disfraz', 'Normal', 'type'), m('Desfile', 'Normal', 'listen'), m('Baile del Toro', 'Lucha', 'speak')],
    catchRate: 0.3,
    dex: {
      es: 'Un venadito que se pone una máscara de fiesta. ¡Le encanta disfrazarse y bailar!',
      en: 'A fawn that puts on a festival mask. It loves dressing up and dancing!',
    },
  },
  /** A sloth asleep in the hammock you buy for Mom. */
  perezosito: {
    id: 'perezosito',
    name: 'Perezosito',
    types: ['Normal', 'Psíquico'],
    theme: 'rutina',
    base: { hp: 80, atk: 40, def: 60, spd: 30 },
    moves: [m('Bostezo', 'Normal', 'choose'), m('Balanceo', 'Normal', 'type'), m('Canción de Cuna', 'Psíquico', 'listen'), m('Siesta', 'Psíquico', 'speak')],
    catchRate: 0.3,
    dex: {
      es: 'Duerme en una hamaca casi todo el día. Se despierta tarde, desayuna... ¡y vuelve a dormir!',
      en: 'It sleeps in a hammock most of the day. It wakes up late, has breakfast... and goes back to sleep!',
    },
  },
  /**
   * The black jaguar's cub (region 5): its mother, Rugidón, guarded the Templo del Jaguar until Equipo Silencio took
   * her voice; you raise the cub (plans/region5-jungle.md). Its own theme comes with region 5's Palabritas.
   */
  rugidito: {
    id: 'rugidito',
    name: 'Rugidito',
    types: ['Siniestro'],
    theme: 'naturaleza',
    base: { hp: 55, atk: 62, def: 45, spd: 72 },
    moves: [m('Zarpazo', 'Siniestro', 'choose'), m('Acecho', 'Siniestro', 'type'), m('Susurro de Hojas', 'Planta', 'listen'), m('Rugido', 'Siniestro', 'speak')],
    catchRate: 0.05,
    dex: {
      es: 'Todavía no sabe rugir: solo maúlla. Pero cada día lo intenta, ¡y un día la selva lo va a oír!',
      en: 'It can’t roar yet, only mew. But it tries every day, and one day the jungle will hear it!',
    },
  },
  /** The haunted house's lamp. */
  lamparita: {
    id: 'lamparita',
    name: 'Lamparita',
    types: ['Fantasma', 'Fuego'],
    theme: 'emociones',
    base: { hp: 50, atk: 64, def: 48, spd: 62 },
    moves: [m('Llama Fantasma', 'Fantasma', 'choose'), m('Luz Triste', 'Fuego', 'type'), m('Susurro', 'Fantasma', 'listen'), m('Fuego Azul', 'Fuego', 'speak')],
    catchRate: 0.3,
    dex: {
      es: 'Cambia de color con su humor: azul si está triste, rojo si está enojada.',
      en: 'It changes color with its mood: blue when sad, red when angry.',
    },
  },
};

/**
 * An evolved form: the same theme, moves and words as the form before it (its learning simply
 * continues), with a new name, types, art, stats and dex entry.
 */
function evolution(from: string, level: number, s: Pick<Species, 'id' | 'name' | 'types' | 'base' | 'dex'> & { catchRate?: number }) {
  const prev = SPECIES[from];
  prev.evolves = { to: s.id, level };
  SPECIES[s.id] = { ...s, theme: prev.theme, starter: prev.starter, moves: prev.moves, catchRate: s.catchRate ?? prev.catchRate / 2 };
}

evolution('salchichita', 16, {
  id: 'hamburgueson',
  name: 'Hamburguesón',
  types: ['Fuego'],
  base: { hp: 62, atk: 74, def: 60, spd: 78 },
  dex: {
    es: 'Creció tanto que ya no cabe en un pan de perro caliente: ahora vive en una hamburguesa.',
    en: 'It grew so much it no longer fits in a hot dog bun: now it lives in a burger.',
  },
});
evolution('gotita', 16, {
  id: 'nubarron',
  name: 'Nubarrón',
  types: ['Agua', 'Eléctrico'],
  base: { hp: 66, atk: 64, def: 80, spd: 60 },
  dex: {
    es: 'Muchas gotas juntas forman un nubarrón. Cuando se enoja, truena.',
    en: 'Many drops together make a storm cloud. When it gets angry, it thunders.',
  },
});
evolution('aguacatito', 16, {
  id: 'aguacatono',
  name: 'Aguacatoño',
  types: ['Planta'],
  base: { hp: 68, atk: 68, def: 72, spd: 56 },
  dex: {
    es: 'El hueso de un Aguacatito echó raíces. Algún día será un árbol grande.',
    en: 'An Aguacatito pit put down roots. One day it will be a big tree.',
  },
});

// The starters' final forms (Nv 36), like Gen 2's.
evolution('hamburgueson', 36, {
  id: 'nacatamastin',
  name: 'Nacatamastín',
  types: ['Fuego'],
  base: { hp: 80, atk: 94, def: 76, spd: 90 },
  dex: {
    es: 'Se envuelve en hojas de plátano como un nacatamal. Es serio, fuerte y muy leal.',
    en: 'It wraps itself in banana leaves like a nacatamal. It’s serious, strong and very loyal.',
  },
});
evolution('nubarron', 36, {
  id: 'huracan',
  name: 'Huracán',
  types: ['Agua', 'Eléctrico'],
  base: { hp: 80, atk: 84, def: 90, spd: 86 },
  dex: {
    es: 'Cuando muchos nubarrones se juntan, nace un huracán. Sus rayos iluminan toda la costa.',
    en: 'When many storm clouds come together, a hurricane is born. Its lightning lights up the whole coast.',
  },
});
evolution('aguacatono', 36, {
  id: 'aguacatero',
  name: 'Aguacatero',
  types: ['Planta'],
  base: { hp: 92, atk: 86, def: 98, spd: 64 },
  dex: {
    es: 'Un árbol de aguacate que camina despacio. Comparte sus aguacates con quien lo cuida.',
    en: 'An avocado tree that walks slowly. It shares its avocados with whoever looks after it.',
  },
});

evolution('piedrita', 18, {
  id: 'petroglifon',
  name: 'Petroglifón',
  types: ['Roca', 'Psíquico'],
  base: { hp: 70, atk: 78, def: 96, spd: 36 },
  dex: {
    es: 'Las espirales de su cuerpo brillan de noche. Cuenta historias muy antiguas.',
    en: 'The spirals on its body glow at night. It tells very old stories.',
  },
});
evolution('ollita', 21, {
  id: 'tinajon',
  name: 'Tinajón',
  types: ['Tierra', 'Agua'],
  base: { hp: 80, atk: 62, def: 84, spd: 44 },
  dex: {
    es: 'Guarda agua fresca todo el año. En los días de calor, la comparte con todos.',
    en: 'It keeps fresh water all year. On hot days it shares it with everyone.',
  },
});

evolution('ardillita', 20, {
  id: 'ardillon',
  name: 'Ardillón',
  types: ['Normal', 'Lucha'],
  base: { hp: 64, atk: 72, def: 56, spd: 90 },
  dex: {
    es: 'Gana todas las carreras del bosque. Después, hace cien abdominales.',
    en: 'It wins every race in the forest. Then it does a hundred sit-ups.',
  },
});
evolution('colibri', 22, {
  id: 'zumbador',
  name: 'Zumbador',
  types: ['Volador', 'Eléctrico'],
  base: { hp: 54, atk: 64, def: 50, spd: 104 },
  dex: {
    es: 'Cuando canta, las flores se abren. Su garganta brilla como una lámpara.',
    en: 'When it sings, flowers open. Its throat shines like a lamp.',
  },
});
evolution('espinita', 22, {
  id: 'puercoespin',
  name: 'Puercoespín',
  types: ['Normal', 'Acero'],
  base: { hp: 72, atk: 70, def: 84, spd: 48 },
  dex: {
    es: 'Cuida a los Palabritas heridos del bosque. Dicen que sus púas curan.',
    en: 'It looks after hurt Palabritas in the forest. They say its spines heal.',
  },
});
evolution('caparazonte', 30, {
  id: 'gliptodon',
  name: 'Gliptodón',
  types: ['Roca', 'Tierra'],
  base: { hp: 90, atk: 84, def: 110, spd: 30 },
  dex: {
    es: 'Su caparazón es grande como un carro. Antes, los gliptodontes vivían en toda América.',
    en: 'Its shell is as big as a car. Long ago, glyptodons lived all over the Americas.',
  },
});

// ----- Families that grew (plans/palabritas.md §1) -----
evolution('gusanito', 7, {
  id: 'capullito',
  name: 'Capullito',
  types: ['Bicho'],
  base: { hp: 46, atk: 28, def: 66, spd: 28 },
  dex: {
    es: 'Duerme envuelto en hojas. Adentro, sus alas cambian de color.',
    en: 'It sleeps wrapped in leaves. Inside, its wings change color.',
  },
});
evolution('capullito', 10, {
  id: 'mariposita',
  name: 'Mariposita',
  types: ['Bicho', 'Volador'],
  base: { hp: 42, atk: 44, def: 45, spd: 60 },
  catchRate: 0.3,
  dex: {
    es: 'Sus alas cambian de color según su humor.',
    en: 'Its wings change color depending on its mood.',
  },
});
evolution('pajarito', 14, {
  id: 'palomon',
  name: 'Palomón',
  types: ['Normal', 'Volador'],
  base: { hp: 62, atk: 58, def: 55, spd: 70 },
  catchRate: 0.25,
  dex: {
    es: 'La paloma más grande del cielo. Vuela más rápido que el viento.',
    en: 'The biggest dove in the sky. It flies faster than the wind.',
  },
});
evolution('conejito', 18, {
  id: 'liebron',
  name: 'Liebrón',
  types: ['Normal'],
  base: { hp: 62, atk: 66, def: 55, spd: 88 },
  dex: {
    es: 'Corre tan rápido que cuenta sus pasos de mil en mil.',
    en: 'It runs so fast it counts its steps a thousand at a time.',
  },
});
evolution('cojincito', 18, {
  id: 'sillon',
  name: 'Sillón',
  types: ['Fantasma'],
  base: { hp: 60, atk: 52, def: 68, spd: 22 },
  catchRate: 0.25,
  dex: {
    es: 'Parece un sillón normal, pero se mueve de noche. Le encantan los cojines esponjosos.',
    en: 'It looks like a normal armchair, but it moves at night. It loves fluffy cushions.',
  },
});
evolution('hojadillo', 24, {
  id: 'hojarasco',
  name: 'Hojarasco',
  types: ['Planta'],
  base: { hp: 72, atk: 72, def: 90, spd: 50 },
  dex: {
    es: 'Su caparazón es un montón de hojas secas. En primavera le salen flores.',
    en: 'Its shell is a pile of dry leaves. In spring, flowers grow on it.',
  },
});
evolution('ecolin', 22, {
  id: 'murcielon',
  name: 'Murcielón',
  types: ['Volador', 'Siniestro'],
  base: { hp: 68, atk: 70, def: 60, spd: 88 },
  dex: {
    es: 'Sus orejas oyen una hoja caer al otro lado de la cueva.',
    en: 'Its ears hear a leaf fall on the other side of the cave.',
  },
});
evolution('ochopatas', 24, {
  id: 'taranton',
  name: 'Tarantón',
  types: ['Bicho', 'Veneno'],
  base: { hp: 66, atk: 80, def: 64, spd: 64 },
  dex: {
    es: 'Tiene ocho ojos en fila. Con cuatro mira adelante y con cuatro, atrás.',
    en: 'It has eight eyes in a row. Four look ahead and four look behind.',
  },
});
evolution('cuernito', 26, {
  id: 'herculeo',
  name: 'Hercúleo',
  types: ['Bicho', 'Lucha'],
  base: { hp: 72, atk: 92, def: 80, spd: 48 },
  dex: {
    es: 'Levanta cien veces su peso. Su caparazón brilla con todos los colores.',
    en: 'It lifts a hundred times its weight. Its shell shines with every color.',
  },
});

// ----- The coast -----
evolution('cangrejito', 22, {
  id: 'cangrejon',
  name: 'Cangrejón',
  types: ['Agua'],
  base: { hp: 66, atk: 92, def: 80, spd: 40 },
  dex: {
    es: 'Sus pinzas son guantes de boxeo. Practica en la playa todos los días.',
    en: 'Its claws are boxing gloves. It trains on the beach every day.',
  },
});
evolution('coquito', 26, {
  id: 'cocotero',
  name: 'Cocotero',
  types: ['Planta'],
  base: { hp: 80, atk: 70, def: 76, spd: 48 },
  dex: {
    es: 'Da sombra a toda la playa. Los turistas descansan debajo de él.',
    en: 'It shades the whole beach. Tourists rest underneath it.',
  },
});
evolution('mojarrita', 20, {
  id: 'mordisquito',
  name: 'Mordisquito',
  types: ['Agua'],
  base: { hp: 46, atk: 60, def: 42, spd: 58 },
  catchRate: 0.4,
  dex: {
    es: 'Ya es el terror de los peces del lago. Si se le cae un diente, le crece otro.',
    en: 'It’s already the terror of the lake’s fish. If it loses a tooth, a new one grows.',
  },
});
evolution('tilapita', 20, {
  id: 'espadon',
  name: 'Espadón',
  types: ['Agua', 'Acero'],
  base: { hp: 66, atk: 88, def: 62, spd: 96 },
  dex: {
    es: 'Su nariz es una espada. Nada tan rápido que corta las olas.',
    en: 'Its nose is a sword. It swims so fast it cuts through the waves.',
  },
});
evolution('mordisquito', 38, {
  id: 'mordiscon',
  name: 'Mordiscón',
  types: ['Agua', 'Siniestro'],
  base: { hp: 74, atk: 98, def: 62, spd: 80 },
  dex: {
    es: 'Algunos viven en el gran lago de Nicaragua: ¡un tiburón de agua dulce!',
    en: 'Some live in Nicaragua’s great lake: a freshwater shark!',
  },
});
evolution('pelicanito', 22, {
  id: 'maleticano',
  name: 'Maletícano',
  types: ['Agua', 'Volador'],
  base: { hp: 70, atk: 70, def: 64, spd: 76 },
  dex: {
    es: 'Ha volado a todos los países de América. Su bolsa está llena de recuerdos.',
    en: 'It has flown to every country in the Americas. Its pouch is full of souvenirs.',
  },
});
evolution('paslamita', 28, {
  id: 'paslamona',
  name: 'Paslamona',
  types: ['Agua', 'Tierra'],
  base: { hp: 96, atk: 64, def: 92, spd: 44 },
  dex: {
    es: 'Cada año vuelve a su playa con miles de tortugas. ¡Es la noche de la arribada!',
    en: 'Every year it returns to its beach with thousands of turtles. It’s the night of the arribada!',
  },
});

evolution('brasita', 32, {
  id: 'brasaurio',
  name: 'Brasaurio',
  types: ['Fuego'],
  base: { hp: 70, atk: 92, def: 70, spd: 80 },
  dex: {
    es: 'Su piel es dura como la roca volcánica. Cuando ruge, le salen chispas de la boca.',
    en: 'Its skin is as hard as volcanic rock. When it roars, sparks fly from its mouth.',
  },
});
evolution('brasaurio', 50, {
  id: 'volcasaurio',
  name: 'Volcasaurio',
  types: ['Fuego', 'Dragón'],
  base: { hp: 95, atk: 125, def: 95, spd: 105 },
  dex: {
    es: 'Dicen que duerme dentro del volcán. Cuando despierta, toda la montaña tiembla.',
    en: 'They say it sleeps inside the volcano. When it wakes up, the whole mountain shakes.',
  },
});
evolution('rugidito', 40, {
  id: 'rugidon',
  name: 'Rugidón',
  types: ['Siniestro', 'Planta'],
  base: { hp: 90, atk: 112, def: 80, spd: 118 },
  dex: {
    es: 'El guardián de la selva. Dicen que su rugido despierta a todos los árboles al amanecer.',
    en: 'The jungle’s guardian. They say its roar wakes every tree at dawn.',
  },
});
evolution('hormiguita', 22, {
  id: 'hormigon',
  name: 'Hormigón',
  types: ['Bicho', 'Roca'],
  base: { hp: 66, atk: 84, def: 92, spd: 40 },
  dex: {
    es: 'Su cuerpo es de cemento. Ayuda a construir casas y puentes.',
    en: 'Its body is made of concrete. It helps build houses and bridges.',
  },
});
evolution('chispita', 26, {
  id: 'coheton',
  name: 'Cohetón',
  types: ['Bicho', 'Fuego'],
  base: { hp: 58, atk: 90, def: 54, spd: 96 },
  dex: {
    es: 'Un escarabajo enorme. Cuando se emociona, sale disparado al cielo como un cohete y deja una estela de colores.',
    en: 'A huge beetle. When it gets excited, it shoots into the sky like a rocket and leaves a trail of colors.',
  },
});
evolution('chocoyito', 25, {
  id: 'chocoyote',
  name: 'Chocoyote',
  types: ['Fuego', 'Volador'],
  base: { hp: 64, atk: 72, def: 58, spd: 90 },
  dex: {
    es: 'Hace su nido dentro del cráter del volcán. El humo no le molesta.',
    en: 'It nests inside the volcano’s crater. The smoke doesn’t bother it.',
  },
});
evolution('zopilotito', 28, {
  id: 'zopiloton',
  name: 'Zopilotón',
  types: ['Volador', 'Siniestro'],
  base: { hp: 80, atk: 74, def: 66, spd: 70 },
  dex: {
    es: 'Vuela en círculos sobre la ciudad. Desde arriba, conoce todas las calles.',
    en: 'It circles over the city. From above, it knows every street.',
  },
});
evolution('venadito', 30, {
  id: 'torovenado',
  name: 'Torovenado',
  types: ['Normal', 'Lucha'],
  base: { hp: 74, atk: 86, def: 70, spd: 80 },
  dex: {
    es: 'Baila en el desfile del Torovenado. Tiene cuernos de toro y astas de venado.',
    en: 'It dances in the Torovenado parade. It has a bull’s horns and a deer’s antlers.',
  },
});

/** The first form of a Palabrita's line (its words are chosen by the first form). */
export function firstForm(id: string): string {
  const prev = Object.values(SPECIES).find((s) => s.evolves?.to === id);
  return prev ? firstForm(prev.id) : id;
}

/**
 * Your starter begins here, a bit stronger than the first wild Palabritas and trainers.
 * Its words for the levels below still come up in battle, as extra practice.
 */
export const STARTER_LEVEL = 5;

export const learnLevel = (m: Move) => m.level ?? MODE_INFO[m.mode].learnAt;

/** The Palabritas' numbers (the dex in the START menu, and the art page): families together, starters first. */
export const DEX_ORDER = [
  'salchichita', 'hamburgueson', 'nacatamastin', 'gotita', 'nubarron', 'huracan', 'aguacatito', 'aguacatono', 'aguacatero',
  'pajarito', 'palomon', 'conejito', 'liebron', 'gusanito', 'capullito', 'mariposita', 'cojincito', 'sillon',
  'hojadillo', 'hojarasco', 'ecolin', 'murcielon', 'ochopatas', 'taranton', 'cuernito', 'herculeo',
  'ardillita', 'ardillon', 'colibri', 'zumbador', 'espinita', 'puercoespin', 'piedrita', 'petroglifon', 'ollita', 'tinajon',
  'caparazonte', 'gliptodon', 'guardabarranco',
  'cangrejito', 'cangrejon', 'coquito', 'cocotero', 'pelicanito', 'maleticano', 'mojarrita', 'mordisquito', 'mordiscon', 'tilapita', 'espadon',
  'paslamita', 'paslamona',
  'brasita', 'brasaurio', 'volcasaurio', 'hormiguita', 'hormigon', 'zopilotito', 'zopiloton', 'chocoyito', 'chocoyote',
  'chispita', 'coheton', 'lamparita', 'perezosito', 'venadito', 'torovenado', 'rugidito', 'rugidon',
];

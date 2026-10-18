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
    moves: [m('Ladrido', 'Normal', 'choose'), m('Mordisco', 'Siniestro', 'type'), m('Olfato', 'Normal', 'listen'), m('Mostaza Ardiente', 'Fuego', 'speak')],
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
    moves: [m('Salpicón', 'Normal', 'choose'), m('Remolino', 'Agua', 'type'), m('Llovizna', 'Agua', 'listen'), m('Tormenta', 'Eléctrico', 'speak')],
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
    moves: [m('Placaje', 'Normal', 'choose'), m('Guacamolazo', 'Planta', 'type'), m('Hoja Afilada', 'Planta', 'listen'), m('Semilla Dura', 'Roca', 'speak')],
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
  mariposita: {
    id: 'mariposita',
    name: 'Mariposita',
    types: ['Bicho', 'Volador'],
    theme: 'colores',
    base: { hp: 42, atk: 44, def: 45, spd: 60 },
    moves: [m('Polvillo', 'Bicho', 'choose'), m('Aleteo', 'Volador', 'type'), m('Arcoíris', 'Normal', 'listen', 5), m('Vuelo Colorido', 'Bicho', 'speak', 8)],
    catchRate: 0.5,
    dex: {
      es: 'Sus alas cambian de color según su humor.',
      en: 'Its wings change color depending on its mood.',
    },
  },
  sillon: {
    id: 'sillon',
    name: 'Sillón',
    types: ['Normal', 'Fantasma'],
    theme: 'casa',
    base: { hp: 60, atk: 52, def: 68, spd: 22 },
    moves: [m('Cojinazo', 'Normal', 'choose'), m('Resorte', 'Normal', 'type'), m('Crujido', 'Fantasma', 'listen', 7), m('Siesta Eterna', 'Fantasma', 'speak', 12)],
    catchRate: 0.35,
    dex: {
      es: 'Parece un sillón normal, pero se mueve de noche. Le encantan los cojines esponjosos.',
      en: 'It looks like a normal armchair, but it moves at night. It loves fluffy cushions.',
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
  palomon: {
    id: 'palomon',
    name: 'Palomón',
    types: ['Normal', 'Volador'],
    theme: 'naturaleza',
    base: { hp: 62, atk: 58, def: 55, spd: 70 },
    moves: [m('Picotazo', 'Volador', 'choose'), m('Golpe Rápido', 'Normal', 'type'), m('Ataque Ala', 'Volador', 'listen'), m('Remolino Aéreo', 'Volador', 'speak')],
    catchRate: 0.2,
    dex: {
      es: 'La paloma más grande del cielo. Vuela más rápido que el viento.',
      en: 'The biggest dove in the sky. It flies faster than the wind.',
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
};

/**
 * An evolved form: the same theme, moves and words as the form before it (its learning simply
 * continues), with a new name, types, art, stats and dex entry.
 */
function evolution(from: string, level: number, s: Pick<Species, 'id' | 'name' | 'types' | 'base' | 'dex'>) {
  const prev = SPECIES[from];
  prev.evolves = { to: s.id, level };
  SPECIES[s.id] = { ...s, theme: prev.theme, starter: prev.starter, moves: prev.moves, catchRate: prev.catchRate / 2 };
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
  types: ['Agua'],
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

evolution('piedrita', 18, {
  id: 'petroglifon',
  name: 'Petroglifón',
  types: ['Roca', 'Tierra'],
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


import type { Dir } from '../engine/input';
import { flag } from '../game/state';

/*
 Tile legend (see art/tiles.ts):
  .  grass         ,  tall grass (wild Palabritas)   =  path        *  flowers
  T  tree          Y  lemon tree                    ~  water       f  fence      S  sign
  r b o p  roofs (red, blue, orange = Centro, purple = Gym)
  h  wall          w  window                        d  door        a  bakery sign
  _  wood floor    +  tile floor                    #  inside wall
  k  table         B  bed       L  shelf            P  plant       V  TV
  C  counter (talk across it)   m  exit mat         R  rug
*/

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  /** A person (key in LOOKS) or an object (key in OBJECTS). */
  look?: string;
  object?: string;
  dir?: Dir;
  script: string;
  show?: () => boolean;
  /** Trainers: how many tiles ahead they can see you. */
  sight?: number;
  /** Looks around now and then. */
  turns?: boolean;
}

export interface Conn {
  to: string;
  offset: number;
}

export interface MapDef {
  id: string;
  name: string;
  outdoor: boolean;
  rows: string[];
  floor: string;
  /** Outdoors: pale dotted town ground or green route grass for '.'. */
  ground?: 'town' | 'grass';
  /** Roof color for 'r' buildings (key in ROOFS, style/colors.ts). */
  roof?: string;
  connections?: Partial<Record<Dir, Conn>>;
  doors?: { x: number; y: number; to: string; tx: number; ty: number }[];
  /** Interiors: where you end up when walking out over the mat. */
  exit?: { to: string; x: number; y: number };
  npcs?: NpcDef[];
  signs?: { x: number; y: number; es: string; en: string }[];
  triggers?: { x: number; y: number; script: string }[];
  encounters?: { rate: number; table: { sp: string; min: number; max: number; w: number }[] };
}

const HOUSE = ['##L##V##', '________', '_kk_____', '_kk_____', '________', '______B_', '____m___'];
// Palacentro: posters (u), nurse behind the counter (C) next to the healing machine,
// a computer (Q) and waiting sofas (n).
const CENTRO = ['##u####u##', 'PxxxxxxxxP', 'xxxCCCCxxx', 'xxxxxxxxQx', 'xxxxxxxxxx', 'nxxxxxxxxn', 'nxxxxxxxxn', 'xxxxmxxxxx'];
const MAQUINA: NpcDef = { id: 'maquina', x: 5, y: 1, object: 'maquina', script: 'maquina' };

export const MAPS: Record<string, MapDef> = {
  amanecer: {
    id: 'amanecer',
    name: 'Pueblo Amanecer',
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'green',
    rows: [
      'TTTTTTTT..TTTTTTTTTT',
      'TTTTTTTT..TTTTTTTTTT',
      'TTgg............gTTT',
      'TTg.rrrr...rrrrrr.TT',
      'TTg.rrrr...rrrrrr.TT',
      'TT..hwwh...hwwwwh.TT',
      'TT.Shdwh...hwwdwh.TT',
      'TT................TT',
      'TTgg......S.....ggTT',
      'TTg..............gTT',
      'TT.........rrrr...TT',
      'TT.ffff....rrrr...TT',
      'TT.****....hwwh...TT',
      'TT.****....hwdh...TT',
      'TT................TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    connections: { up: { to: 'ruta1', offset: 0 } },
    doors: [
      { x: 5, y: 6, to: 'casa', tx: 3, ty: 6 },
      { x: 14, y: 6, to: 'lab', tx: 4, ty: 8 },
      { x: 13, y: 13, to: 'vecina', tx: 4, ty: 6 },
    ],
    signs: [
      { x: 3, y: 6, es: 'Casa de {name}.', en: "{name}'s house." },
      { x: 10, y: 8, es: 'PUEBLO AMANECER: Donde empieza la aventura.', en: 'DAWN TOWN: Where the adventure begins.' },
    ],
    npcs: [
      { id: 'lucas', x: 11, y: 2, look: 'boy', dir: 'left', script: 'lucas', turns: true },
      { id: 'pescador', x: 16, y: 14, look: 'fisher', dir: 'down', script: 'pescador' },
      { id: 'sam', x: 7, y: 8, look: 'tourist', dir: 'down', script: 'sam', turns: true, sight: 3 },
    ],
    triggers: [
      { x: 8, y: 1, script: 'needStarter' },
      { x: 9, y: 1, script: 'needStarter' },
    ],
  },

  casa: {
    id: 'casa',
    name: 'Casa',
    outdoor: false,
    floor: '_',
    rows: ['LL##V###', '________', '__kk____', '__kk____', '________', 'B______P', '___m____'],
    exit: { to: 'amanecer', x: 5, y: 7 },
    npcs: [{ id: 'mama', x: 1, y: 3, look: 'mom', dir: 'right', script: 'mama' }],
  },

  lab: {
    id: 'lab',
    name: 'Laboratorio',
    outdoor: false,
    floor: '_',
    rows: ['LLLL##LLLL', '__________', '__kkk_____', '__________', 'P________P', '_LL____LL_', '__________', '__________', '____m_____'],
    exit: { to: 'amanecer', x: 14, y: 7 },
    npcs: [
      { id: 'ceiba', x: 6, y: 2, look: 'prof', dir: 'down', script: 'ceiba' },
      { id: 'ayudante', x: 8, y: 6, look: 'man', dir: 'left', script: 'ayudante', turns: true },
      { id: 'starter_salchichita', x: 2, y: 2, object: 'palabola', script: 'starter_salchichita', show: () => !flag('starter') },
      { id: 'starter_gotita', x: 3, y: 2, object: 'palabola', script: 'starter_gotita', show: () => !flag('starter') },
      { id: 'starter_aguacatito', x: 4, y: 2, object: 'palabola', script: 'starter_aguacatito', show: () => !flag('starter') },
    ],
  },

  vecina: {
    id: 'vecina',
    name: 'Casa de Ana',
    outdoor: false,
    floor: '_',
    rows: HOUSE,
    exit: { to: 'amanecer', x: 13, y: 14 },
    npcs: [{ id: 'ana', x: 4, y: 2, look: 'girl', dir: 'down', script: 'ana' }],
  },

  ruta1: {
    id: 'ruta1',
    name: 'Ruta 1',
    outdoor: true,
    floor: '.',
    rows: [
      'TTTTTTTT==TTTTTTTTTT',
      'TTTTTTTT==TTTTTTTTTT',
      'TT,,,,..==....,,,,TT',
      'TT,,,,..==....,,,,TT',
      'TT,,,,..==....,,,,TT',
      'TT......==........TT',
      'TT......=====.....TT',
      'TT...TT.....=..S..TT',
      'TTTTTTT.....=.....TT',
      'TT,,,,,,,,===.....TT',
      'TT,,,,,,,,TTTTTTTTTT',
      'TT,,,,,,,,===.....TT',
      'TT..........=.....TT',
      'TTTTT.......=..,,,TT',
      'TT..........=..,,,TT',
      'TT......=====..,,,TT',
      'TT..*...==........TT',
      'TT..**..==........TT',
      'TT......==........TT',
      'TT......==........TT',
      'TTTTTTTT==TTTTTTTTTT',
      'TTTTTTTT==TTTTTTTTTT',
    ],
    connections: { up: { to: 'limon', offset: 2 }, down: { to: 'amanecer', offset: 0 } },
    signs: [{ x: 15, y: 7, es: 'RUTA 1. Norte: Villa Limón. Sur: Pueblo Amanecer.', en: 'ROUTE 1. North: Lemon Village. South: Dawn Town.' }],
    npcs: [{ id: 'sofia', x: 14, y: 12, look: 'sofia', dir: 'left', script: 'sofia', sight: 4 }],
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'pajarito', min: 2, max: 3, w: 50 },
        { sp: 'conejito', min: 2, max: 4, w: 50 },
      ],
    },
  },

  limon: {
    id: 'limon',
    name: 'Villa Limón',
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'yellow',
    rows: [
      'TTTTTTTTTT..TTTTTTTTTTTT',
      'TTTTTTTTTT..TTTTTTTTTTTT',
      'TTg****g..........Y..YTT',
      'TT.rrrr.........ooooo.TT',
      'TT.rrrr.........ooooo.TT',
      'TT.hawh.........hwcwh.TT',
      'TT.hdwh.........hwdwh.TT',
      'TT....................TT',
      'TTY.........S........YTT',
      'TT....................TT',
      'TT.rrrr.........rrrr..TT',
      'TT.rrrr.........rrrr..TT',
      'TT.hwwh.........hwwh..TT',
      'TT.hwdh.........hdwh..TT',
      'TT....................TT',
      'TTgg*..............*ggTT',
      'TTY..................YTT',
      'TTTTTTTT........TTTTTTTT',
      'TTTTTTTTTT..TTTTTTTTTTTT',
      'TTTTTTTTTT..TTTTTTTTTTTT',
    ],
    connections: { up: { to: 'ruta2', offset: -2 }, down: { to: 'ruta1', offset: -2 } },
    doors: [
      { x: 4, y: 6, to: 'panaderia', tx: 3, ty: 6 },
      { x: 18, y: 6, to: 'centro_limon', tx: 4, ty: 7 },
      { x: 5, y: 13, to: 'casa_lupe', tx: 4, ty: 6 },
      { x: 17, y: 13, to: 'casa_ramos', tx: 4, ty: 6 },
    ],
    signs: [{ x: 12, y: 8, es: 'VILLA LIMÓN: El pueblo más fresco de la región.', en: 'LEMON VILLAGE: The freshest town in the region.' }],
    triggers: [{ x: 11, y: 1, script: 'betoStops' }],
    npcs: [
      { id: 'carmen', x: 13, y: 10, look: 'lady', dir: 'down', script: 'carmen', turns: true },
      { id: 'diego', x: 17, y: 16, look: 'boy', dir: 'left', script: 'diego', turns: true },
      // Beto blocks the road to Ruta 2 until you have Palabolas, then steps aside.
      { id: 'beto', x: 10, y: 1, look: 'beto', dir: 'down', script: 'beto', show: () => !flag('palabolas') },
      { id: 'beto_aside', x: 13, y: 2, look: 'beto', dir: 'down', script: 'beto', turns: true, show: () => flag('palabolas') },
      { id: 'michi', x: 7, y: 2, object: 'michi', script: 'michi', show: () => flag('michiLocated') && !flag('michiFound') },
    ],
  },

  panaderia: {
    id: 'panaderia',
    name: 'Panadería',
    outdoor: false,
    floor: '_',
    rows: ['########', '________', '_CCCCC__', '________', 'k______k', '________', '___m____'],
    exit: { to: 'limon', x: 4, y: 7 },
    npcs: [{ id: 'pepe', x: 3, y: 1, look: 'baker', dir: 'down', script: 'pepe' }],
  },

  centro_limon: {
    id: 'centro_limon',
    name: 'Palacentro',
    outdoor: false,
    floor: 'x',
    rows: CENTRO,
    exit: { to: 'limon', x: 18, y: 7 },
    npcs: [
      { id: 'enfermera', x: 4, y: 1, look: 'nurse', dir: 'down', script: 'enfermera' },
      MAQUINA,
      { id: 'olvidadizo', x: 7, y: 4, look: 'man', dir: 'left', script: 'olvidadizo' },
    ],
  },

  casa_lupe: {
    id: 'casa_lupe',
    name: 'Casa de Doña Lupe',
    outdoor: false,
    floor: '_',
    rows: HOUSE,
    exit: { to: 'limon', x: 5, y: 14 },
    npcs: [{ id: 'lupe', x: 4, y: 2, look: 'granny', dir: 'down', script: 'lupe' }],
  },

  casa_ramos: {
    id: 'casa_ramos',
    name: 'Casa del Señor Ramos',
    outdoor: false,
    floor: '_',
    rows: ['##L##V##', '________', '________', '_kk_____', '_kk_____', '______B_', '____m___'],
    exit: { to: 'limon', x: 17, y: 14 },
    npcs: [
      { id: 'ramos', x: 5, y: 3, look: 'man', dir: 'left', script: 'ramos' },
      { id: 'sillon', x: 1, y: 1, object: 'armchair', script: 'sillon', show: () => !flag('sillonDone') },
    ],
  },

  ruta2: {
    id: 'ruta2',
    name: 'Ruta 2',
    outdoor: true,
    floor: '.',
    rows: [
      'TTTTTTTT==TTTTTTTTTT',
      'TTTTTTTT==TTTTTTTTTT',
      'TT......==....,,,,TT',
      'TT.,,,,.==....,,,,TT',
      'TT.,,,,.==..~~~,,,TT',
      'TT.,,,,.==..~~~...TT',
      'TT......==........TT',
      'TTTTTTT.==.TTTTTTTTT',
      'TT,,,,,.==.,,,,,,.TT',
      'TT,,,,,.==.,,,,,,.TT',
      'TT,,,,,.==.,,,,,,.TT',
      'TT......==........TT',
      'TT....S.==........TT',
      'TTTTTTT....TTTTTTTTT',
      'TT......==........TT',
      'TT,,,,,,==,,,,,,,,TT',
      'TT,,,,,,==,,,,,,,,TT',
      'TT......==........TT',
      'TT.*....==....*...TT',
      'TT......==........TT',
      'TT,,,,..==..,,,,..TT',
      'TT......==........TT',
      'TTTTTTTT==TTTTTTTTTT',
      'TTTTTTTT==TTTTTTTTTT',
    ],
    connections: { up: { to: 'brisa', offset: 2 }, down: { to: 'limon', offset: 2 } },
    signs: [{ x: 6, y: 12, es: 'RUTA 2. Norte: Ciudad Brisa. ¡Cuidado con la hierba alta!', en: 'ROUTE 2. North: Breeze City. Watch out for the tall grass!' }],
    npcs: [
      { id: 'mateo', x: 12, y: 14, look: 'mateo', dir: 'left', script: 'mateo', sight: 4 },
      { id: 'lola', x: 4, y: 11, look: 'girl', dir: 'right', script: 'lola', turns: true },
      { id: 'tomas', x: 11, y: 19, look: 'hiker', dir: 'left', script: 'tomas', sight: 3 },
      { id: 'valeria', x: 7, y: 9, look: 'painter', dir: 'right', script: 'valeria', sight: 3 },
      { id: 'andres', x: 11, y: 3, look: 'andres', dir: 'left', script: 'andres', sight: 3 },
    ],
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'pajarito', min: 3, max: 5, w: 35 },
        { sp: 'conejito', min: 3, max: 5, w: 35 },
        { sp: 'mariposita', min: 4, max: 6, w: 30 },
      ],
    },
  },

  brisa: {
    id: 'brisa',
    name: 'Ciudad Brisa',
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'blue',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TTgg................ggTT',
      'TTg.....pppppppp.....gTT',
      'TT......pppppppp......TT',
      'TT......hwwwGwwh......TT',
      'TT......hhhhdhhh......TT',
      'TT...........S........TT',
      'TT....................TT',
      'TT.ooooo........rrrr..TT',
      'TT.ooooo........rrrr..TT',
      'TT.hwcwh........hwwh..TT',
      'TT.hwdwh........hdwh..TT',
      'TT....................TT',
      'TTg.S.................TT',
      'TT*g...............g*.TT',
      'TTTTTTTTTT..TTTTTTTTTTTT',
      'TTTTTTTTTT..TTTTTTTTTTTT',
    ],
    connections: { down: { to: 'ruta2', offset: -2 } },
    doors: [
      { x: 12, y: 6, to: 'gimnasio', tx: 4, ty: 11 },
      { x: 5, y: 12, to: 'centro_brisa', tx: 4, ty: 7 },
      { x: 17, y: 12, to: 'casa_rita', tx: 4, ty: 6 },
    ],
    signs: [
      { x: 13, y: 7, es: 'GIMNASIO DE CIUDAD BRISA. Líder: Paloma, ¡la reina del cielo!', en: 'BREEZE CITY GYM. Leader: Paloma, queen of the sky!' },
      { x: 4, y: 14, es: 'CIUDAD BRISA: Donde el viento canta.', en: 'BREEZE CITY: Where the wind sings.' },
    ],
    npcs: [{ id: 'marta', x: 17, y: 4, look: 'lady', dir: 'down', script: 'marta', turns: true }],
  },

  centro_brisa: {
    id: 'centro_brisa',
    name: 'Palacentro',
    outdoor: false,
    floor: 'x',
    rows: CENTRO,
    exit: { to: 'brisa', x: 5, y: 13 },
    npcs: [{ id: 'enfermera', x: 4, y: 1, look: 'nurse', dir: 'down', script: 'enfermera' }, MAQUINA],
  },

  casa_rita: {
    id: 'casa_rita',
    name: 'Casa de Abuela Rita',
    outdoor: false,
    floor: '_',
    rows: HOUSE,
    exit: { to: 'brisa', x: 17, y: 13 },
    npcs: [{ id: 'rita', x: 4, y: 2, look: 'granny', dir: 'down', script: 'rita' }],
  },

  gimnasio: {
    id: 'gimnasio',
    name: 'Gimnasio Brisa',
    outdoor: false,
    floor: '+',
    rows: [
      '##########',
      'P+++RR+++P',
      '++++RR++++',
      '++++RR++++',
      'PPP+RR+PPP',
      '++++RR++++',
      '++++RR++++',
      'PPP+RR+PPP',
      '++++RR++++',
      'P+++RR+++P',
      '++++RR++++',
      '++++mm++++',
    ],
    exit: { to: 'brisa', x: 12, y: 7 },
    npcs: [
      { id: 'paloma', x: 4, y: 2, look: 'paloma', dir: 'down', script: 'paloma' },
      { id: 'ivan', x: 3, y: 6, look: 'ivan', dir: 'right', script: 'ivan', sight: 3 },
      { id: 'guia', x: 7, y: 10, look: 'man', dir: 'left', script: 'guia' },
    ],
  },
};

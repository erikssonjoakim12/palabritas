import type { Dir } from '../engine/input';
import { flag } from '../game/state';
import type { MapStyle } from '../art/tiles';

/*
 Tile legend (see art/tiles.ts):
  .  grass         ,  tall grass (wild Palabritas)   =  path        *  flowers
  T  tree (mostly green, some dry)   t  dry tree   I  pine (colder places, later)
                   Y  lemon tree                    ~  water       f  fence      S  sign
  r b o p  roofs (red, blue, orange = Centro, purple = Gym)
  h  wall          w  window                        d  door        a  bakery sign   M  shop sign
  _  wood floor    +  tile floor                    #  inside wall
  k  table         B  bed       L  shelf            P  plant       V  TV
  C  counter (talk across it)   m  exit mat         R  rug
  J  palm tree (beaches, later)
  ^  mountain      :  rocky ground                  O  cave entrance
  %  cave wall     ;  cave floor                    e  cave exit (walk down to leave)
  D  tunnel under a cliff (a door you walk south into)   H  bridge / pier
*/

/** A line of dialog: Spanish, and English for the EN button. */
export type Line = [es: string, en: string];

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
  /** Item balls: what's inside (key in ITEM_DEFS). */
  item?: string;
}

export interface Conn {
  to: string;
  offset: number;
  /**
   * Only for the view: the maps sit side by side in the world and each draws the other at its edge, but you
   * can't walk across (a mountain over a cave). Its edges should be solid.
   */
  scenery?: boolean;
}

/**
 * A guard who blocks a road until something is done, then steps aside (Beto, the officer...).
 * The guard stands on one tile of the road; stepping onto the rest of it gets you stopped too.
 */
export interface GateDef {
  id: string;
  look: string;
  /** The road opens once this is true. */
  opens: () => boolean;
  /** Where the guard stands, facing the way you come from. */
  at: [x: number, y: number, dir: Dir];
  /** Where the guard waits once the road is open. */
  aside: [x: number, y: number];
  /** The rest of the road beside the guard. */
  road: [x: number, y: number][];
  /** The way you're sent back when stopped. */
  back: Dir;
  closed: Line[];
  open: Line[];
}

export interface MapDef {
  id: string;
  name: string;
  outdoor: boolean;
  /** Show the name when you arrive (outdoor maps always do; caves too). */
  banner?: boolean;
  /** The tile all around the map's edges (default: trees outdoors, nothing indoors). */
  border?: string;
  rows: string[];
  floor: string;
  /** Outdoors: pale dotted town ground, green route grass or beach sand for '.'. */
  ground?: 'town' | 'grass' | 'sand';
  /** Tree, wall, rock and cave looks (art/tiles.ts MapStyle). */
  style?: MapStyle;
  /** Drawn dark, with light around you (night scenes). */
  night?: boolean;
  /** Roof color for 'r' buildings (key in ROOFS, style/colors.ts). */
  roof?: string;
  connections?: Partial<Record<Dir, Conn>>;
  /** Step on (x, y) to go to (tx, ty) on another map, facing `dir` (default: up, into a building). */
  doors?: { x: number; y: number; to: string; tx: number; ty: number; dir?: Dir }[];
  /** Interiors: where you end up when walking out over the mat. */
  exit?: { to: string; x: number; y: number };
  npcs?: NpcDef[];
  signs?: { x: number; y: number; es: string; en: string }[];
  triggers?: { x: number; y: number; script: string }[];
  gates?: GateDef[];
  /** Wild Palabritas in tall grass, or (`everywhere`, caves) on every step. */
  encounters?: { rate: number; everywhere?: boolean; table: EncounterEntry[] };
  /** What bites when you fish here (FRESHWATER when left out). */
  fishing?: { table: EncounterEntry[] };
}

/** One kind of wild Palabrita in an encounter table: its levels and weight (how common it is). */
export interface EncounterEntry {
  sp: string;
  min: number;
  max: number;
  w: number;
}

/** What bites in lakes and rivers (Mojarrita arrives with the rod, in phase 3). */
export const FRESHWATER: EncounterEntry[] = [{ sp: 'mojarrita', min: 8, max: 14, w: 100 }];

const HOUSE = ['##L##V##', '________', '_kk_____', '_kk_____', '________', '______B_', '____m___'];
// Palacentro: posters (u), nurse behind the counter (C) next to the healing machine,
// a computer (Q) and waiting sofas (n).
const CENTRO = ['##u####u##', 'PxxxxxxxxP', 'xxxCCCCxxx', 'xxxxxxxxQx', 'xxxxxxxxxx', 'nxxxxxxxxn', 'nxxxxxxxxn', 'xxxxmxxxxx'];
/** An item ball on the ground, like Gold/Silver's: picked up once (scripts.ts, itemBall). */
const itemBall = (id: string, x: number, y: number, item: string): NpcDef => ({ id, x, y, object: 'palabola', item, script: 'itemBall', show: () => !flag(`item:${id}`) });
const MAQUINA: NpcDef = { id: 'maquina', x: 5, y: 1, object: 'maquina', script: 'maquina' };
/** A Palacentro inside: the nurse, the healing machine, and whoever else is there. */
const centro = (id: string, exit: MapDef['exit'], more: NpcDef[] = []): MapDef => ({
  id,
  name: 'Palacentro',
  outdoor: false,
  floor: 'x',
  rows: CENTRO,
  exit,
  npcs: [{ id: 'enfermera', x: 4, y: 1, look: 'nurse', dir: 'down', script: 'enfermera' }, MAQUINA, ...more],
});

export const MAPS: Record<string, MapDef> = {
  amanecer: {
    id: 'amanecer',
    name: 'Pueblo Amanecer',
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'green',
    // West: a plateau you'll reach later from the other side and hop down from (the ledge).
    // South and east: the lake reaches the map edges, for SURF routes later.
    rows: [
      'TTTTTTTTTTTTTT..TTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTT..TTTTTTTTTTTTTT',
      'TTTTTTTTgg............gTTTTTTT',
      'T,,,*TTTg.rrrr...rrrrrr.TTTTTT',
      'T,,,,TTTg.rrrr...rrrrrr.TTTTTT',
      'Tg,,gTTT..hwwh...hwwwwh.TTTTTT',
      'Tgggg>...Shdwh...hwwdwh.TTTTTT',
      'ggggg>..................TTTTTT',
      '=====>..gg......S.....ggTT~~~~',
      'ggggg>..g..............gTT~~~~',
      'T*gggTTT.........rrrr...TT~~~~',
      'T,,,gTTT.ffff....rrrr...TT~~~~',
      'T,,,,TTT.****....hwwh...TT~~~~',
      'TTTTTTTT.****....hwdh...TT~~~~',
      'TTTTTTTT................TT~~~~',
      'TTTTTTTT~~~~~~~~~~~~~~~~~~~~~~',
      'TTTTTTTT~~~~~~~~~~~~~~~~~~~~~~',
      'TTTTTTTT~~~~~~~~~~~~~~~~~~~~~~',
      'TTTTTTTT~~~~~~~~~~~~~~~~~~~~~~',
      'TTTTTTTT~~~~~~~~~~~~~~~~~~~~~~',
    ],
    connections: { up: { to: 'ruta1', offset: -6 } },
    doors: [
      { x: 11, y: 6, to: 'casa', tx: 3, ty: 6 },
      { x: 20, y: 6, to: 'lab', tx: 4, ty: 8 },
      { x: 19, y: 13, to: 'vecina', tx: 4, ty: 6 },
    ],
    signs: [
      { x: 9, y: 6, es: 'Casa de {name}.', en: "{name}'s house." },
      { x: 16, y: 8, es: 'PUEBLO AMANECER: Donde empieza la aventura.', en: 'DAWN TOWN: Where the adventure begins.' },
    ],
    npcs: [
      { id: 'lucas', x: 17, y: 2, look: 'boy', dir: 'left', script: 'lucas', turns: true },
      { id: 'pescador', x: 22, y: 14, look: 'fisher', dir: 'down', script: 'pescador' },
      { id: 'sam', x: 13, y: 8, look: 'tourist', dir: 'down', script: 'sam', turns: true, sight: 3 },
    ],
    triggers: [
      { x: 14, y: 1, script: 'needStarter' },
      { x: 15, y: 1, script: 'needStarter' },
    ],
  },

  casa: {
    id: 'casa',
    name: 'Casa',
    outdoor: false,
    floor: '_',
    rows: ['LL##V###', '________', '__kk____', '__kk____', '________', 'B______P', '___m____'],
    exit: { to: 'amanecer', x: 11, y: 7 },
    npcs: [{ id: 'mama', x: 1, y: 3, look: 'mom', dir: 'right', script: 'mama' }],
  },

  lab: {
    id: 'lab',
    name: 'Laboratorio',
    outdoor: false,
    floor: '_',
    rows: ['LLLL##LLLL', '__________', '__kkk_____', '__________', 'P________P', '_LL____LL_', '__________', '__________', '____m_____'],
    exit: { to: 'amanecer', x: 20, y: 7 },
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
    exit: { to: 'amanecer', x: 19, y: 14 },
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
      'TT,,,,,,,,,,,,,,,,TT',
      'TT,,,,,,,,,,,,,,,,TT',
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
      'TT,,,,,,,,,,,,,,,,TT',
      'TT,,,,,,,,,,,,,,,,TT',
      'TT..**..==........TT',
      'TT......==....TTTTTT',
      'TT...,,,==,,,.....TT',
      'TT...,,,==,,,.....TT',
      'TT......==........TT',
      'TT......==........TT',
      'TTTTTTTT==TTTTTTTTTT',
      'TTTTTTTT==TTTTTTTTTT',
    ],
    connections: { up: { to: 'limon', offset: 2 }, down: { to: 'amanecer', offset: 6 } },
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
    connections: { up: { to: 'ruta2', offset: 0 }, down: { to: 'ruta1', offset: -2 } },
    doors: [
      { x: 4, y: 6, to: 'panaderia', tx: 3, ty: 6 },
      { x: 18, y: 6, to: 'centro_limon', tx: 4, ty: 7 },
      { x: 5, y: 13, to: 'casa_lupe', tx: 4, ty: 6 },
      { x: 17, y: 13, to: 'casa_ramos', tx: 4, ty: 6 },
    ],
    signs: [{ x: 12, y: 8, es: 'VILLA LIMÓN: El pueblo más fresco de la región.', en: 'LEMON VILLAGE: The freshest town in the region.' }],
    gates: [
      {
        id: 'beto',
        look: 'beto',
        opens: () => flag('palabolas'),
        at: [10, 1, 'down'],
        aside: [13, 2],
        road: [[11, 1]],
        back: 'down',
        closed: [
          ['¡Alto! No puedes ir a la Ruta 2.', 'Stop! You can’t go to Route 2.'],
          ['Las Palabritas salvajes de allí son muy traviesas. ¡Ayer una me robó el sombrero!', 'The wild Palabritas there are very naughty. Yesterday one stole my hat!'],
          ['Sin Palabolas no te dejo pasar. Doña Lupe las hace... pero hoy está muy triste.', 'I won’t let you through without Palabolas. Doña Lupe makes them... but she’s very sad today.'],
        ],
        open: [
          ['¡Ya tienes Palabolas! Puedes pasar a la Ruta 2.', 'You have Palabolas now! You can go to Route 2.'],
          ['Si ves mi sombrero allí, ¡avísame!', 'If you see my hat there, let me know!'],
        ],
      },
    ],
    npcs: [
      { id: 'carmen', x: 13, y: 10, look: 'lady', dir: 'down', script: 'carmen', turns: true },
      { id: 'diego', x: 17, y: 16, look: 'boy', dir: 'left', script: 'diego', turns: true },
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

  centro_limon: centro('centro_limon', { to: 'limon', x: 18, y: 7 }, [{ id: 'olvidadizo', x: 7, y: 4, look: 'man', dir: 'left', script: 'olvidadizo' }]),

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
      'TTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTT.==..TTTTTTTTTT',
      'TT.......=====,,,,,,..TT',
      'TT..,,,,.=...=,,,,,,..TT',
      'TT..,,,,.=...=........TT',
      'TT.......=...=====....TT',
      'TTTTTTTTT=TTTTTTT=TTTTTT',
      'TT.......=.......=....TT',
      'TT..~~~~.=..*....=..,,TT',
      'TT..~~~~.=.......=..,,TT',
      'TT.......=====,,,,,,,,TT',
      'TT...........=,,,,,,,,TT',
      'TTTTTTTTTTTTT=TTTTTTTTTT',
      'TT,,,,,,,,,,,,,,,,,,,,TT',
      'TT,,,,,,,,,,,,,,,,,,,,TT',
      'TT,,,,,,,,,,,,,,,,,,,,TT',
      'TTTTTT=TTTTTTTTTTTTTTTTT',
      'TT....=........,,,,...TT',
      'TT....=====....,,,,...TT',
      'TT........=...........TT',
      'TT..TTTTT.=.TTTTTTT...TT',
      'TT..T...T.=.T.....T...TT',
      'TT..T...T.=.T..,,.T...TT',
      'TT..TT.TT.=.TTT,,TT...TT',
      'TT........=...........TT',
      'TTTTTTTTTT=TTTTTTTTTTTTT',
      'TT,,,,,,,,,,,,,,,,,,,,TT',
      'TT,,,,,,,,,,,,,,,,,,,,TT',
      'TT....=====...........TT',
      'TT....=...=.....S.....TT',
      'TT....=...=...........TT',
      'TTTTTT=TTT=TTTTTTTTTTTTT',
      'TT....=...=......,,,,.TT',
      'TT..,,=...=......,,,,.TT',
      'TT..,,=====...........TT',
      'TT........=...........TT',
      'TT..*.....=......*....TT',
      'TT........==..........TT',
      'TT........==..........TT',
      'TTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTTT==TTTTTTTTTTTT',
    ],
    connections: { up: { to: 'brisa', offset: 0 }, down: { to: 'limon', offset: 0 } },
    signs: [{ x: 16, y: 30, es: 'RUTA 2. Norte: Ciudad Brisa. ¡Cuidado con la hierba alta!', en: 'ROUTE 2. North: Breeze City. Watch out for the tall grass!' }],
    npcs: [
      // Mateo, Tomás and Andrés each guard a narrow gap you must pass; Valeria can be walked around.
      { id: 'lola', x: 4, y: 36, look: 'girl', dir: 'right', script: 'lola', turns: true },
      { id: 'valeria', x: 3, y: 33, look: 'painter', dir: 'right', script: 'valeria', sight: 3 },
      { id: 'mateo', x: 13, y: 25, look: 'mateo', dir: 'left', script: 'mateo', sight: 3 },
      itemBall('pocion_ruta2', 6, 22, 'pocion'),
      { id: 'tomas', x: 9, y: 18, look: 'hiker', dir: 'left', script: 'tomas', sight: 3 },
      { id: 'andres', x: 12, y: 2, look: 'andres', dir: 'left', script: 'andres', sight: 3 },
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
      'TTgrrrr.pppppppp.....gTT',
      'TT.rrrr.pppppppp......TT',
      'TT.hwMh.hwwwGwwh......TT',
      'TT.hwdh.hhhhdhhh......TT',
      '.............S........TT',
      '......................TT',
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
    connections: { down: { to: 'ruta2', offset: 0 }, left: { to: 'ruta3', offset: 27 } },
    gates: [
      {
        id: 'oficial',
        look: 'officer',
        opens: () => flag('medalBrisa'),
        at: [1, 7, 'right'],
        aside: [2, 6],
        road: [[1, 8]],
        back: 'right',
        closed: [
          ['¡Alto ahí! El camino a la Ruta 3 está cerrado.', 'Stop right there! The road to Route 3 is closed.'],
          ['Allí hay montañas y una cueva muy oscura. Es peligroso.', 'There are mountains and a very dark cave there. It’s dangerous.'],
          ['Solo pueden pasar los entrenadores con la medalla del gimnasio.', 'Only trainers with the gym medal may pass.'],
        ],
        open: [
          ['¡Tienes la Medalla Brisa! Puedes pasar.', 'You have the Breeze Medal! You may pass.'],
          ['Ten cuidado en la cueva. ¡Está muy oscura!', 'Be careful in the cave. It’s very dark!'],
        ],
      },
    ],
    doors: [
      { x: 12, y: 6, to: 'gimnasio', tx: 4, ty: 11 },
      { x: 5, y: 6, to: 'tienda_brisa', tx: 4, ty: 6 },
      { x: 5, y: 12, to: 'centro_brisa', tx: 4, ty: 7 },
      { x: 17, y: 12, to: 'casa_rita', tx: 4, ty: 6 },
    ],
    signs: [
      { x: 13, y: 7, es: 'GIMNASIO DE CIUDAD BRISA. Líder: Paloma, ¡la reina del cielo!', en: 'BREEZE CITY GYM. Leader: Paloma, queen of the sky!' },
      { x: 4, y: 14, es: 'CIUDAD BRISA: Donde el viento canta.', en: 'BREEZE CITY: Where the wind sings.' },
    ],
    npcs: [{ id: 'marta', x: 17, y: 4, look: 'lady', dir: 'down', script: 'marta', turns: true }],
  },

  tienda_brisa: {
    id: 'tienda_brisa',
    name: 'Tienda',
    outdoor: false,
    floor: '+',
    rows: ['P########P', '++++++++++', '+C++++kk++', '+C++++kk++', '++++++++++', '++++kk++++', '++++++++++', '++++m+++++'],
    exit: { to: 'brisa', x: 5, y: 7 },
    npcs: [{ id: 'cajera', x: 0, y: 2, look: 'cashier', dir: 'right', script: 'cajera' }],
  },

  centro_brisa: centro('centro_brisa', { to: 'brisa', x: 5, y: 13 }),

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

  // West of Ciudad Brisa, through the mountains: left (snaking around two spurs), up (through
  // two narrow passes), then left again to the cave. Trainers (most of them in the way) and wild
  // Palabritas come later: the passes at (32-33, 22-23) and (35-36, 14-15) are for trainers.
  ruta3: {
    id: 'ruta3',
    name: 'Ruta 3',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    border: '^',
    rows: [
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^O^^^^ooooo^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^::::::Sooooo......^^^.,,,,^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::hwcwh......^^^.,,,,^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::hwdwh......^^^.,,,,^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::...........^^^.,,,,^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::...........^^^.,,,,^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::.,,,,,...........>.............^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::.,,,,,^^^........>.......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^:::::::.,,,,,^^^,,,,,,..>.......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^TT......,,,,,^^^,,,,,,..>.......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^TTT..........^^^,,,,,,..>.......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,......TT^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,........^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,..vvvvvv^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,........^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,........^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^,,,,........^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^..^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^......,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^TT....,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^TT....,,,,,,^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^......................^^^...^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^..,,,,,,,,........TT..^^^TT.^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^..,,,,,,,,............^^^...^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^..,,,,,,,,............^^^...^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^..,,,,,,,,..^^^.......^^^...^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.......^^^S..^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.......^^^.==========',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.......^^^.==========',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.,,,,,,^^^,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.,,,,,,...,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.,,,,,,...,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^............^^^.,,,,,,...,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^TTT.......TT^^^.,,,,,,...,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^TTT.......TT^^^.,,,,,,...,,,^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
    ],
    connections: { right: { to: 'brisa', offset: -27 }, left: { to: 'cerro_eco', offset: 0, scenery: true } },
    doors: [
      { x: 4, y: 2, to: 'ruta4', tx: 4, ty: 38 },
      { x: 11, y: 5, to: 'centro_ruta3', tx: 4, ty: 7 },
    ],
    signs: [
      { x: 53, y: 33, es: 'RUTA 3. Al oeste: la Cueva del Eco.', en: 'ROUTE 3. To the west: Echo Cave.' },
      { x: 8, y: 3, es: 'CUEVA DEL ECO. ¡Aquí cada palabra se oye dos veces!', en: 'ECHO CAVE. Here every word is heard twice!' },
    ],
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'hojadillo', min: 7, max: 11, w: 40 },
        { sp: 'pajarito', min: 7, max: 11, w: 30 },
        { sp: 'mariposita', min: 7, max: 11, w: 30 },
      ],
    },
    // Trainers look like Ruta 2's. Those in the passes and spurs can't be walked past unseen.
    npcs: [
      { id: 'rodrigo', x: 51, y: 37, look: 'hiker', dir: 'down', script: 'rodrigo', sight: 4 },
      { id: 'isabel', x: 41, y: 28, look: 'painter', dir: 'down', script: 'isabel', sight: 3 },
      { id: 'pablo', x: 32, y: 22, look: 'mateo', dir: 'right', script: 'pablo', sight: 1 },
      { id: 'kevin', x: 38, y: 20, look: 'tourist', dir: 'left', script: 'kevin', sight: 3 },
      { id: 'camila', x: 35, y: 14, look: 'sofia', dir: 'right', script: 'camila', sight: 1 },
      { id: 'ernesto', x: 21, y: 8, look: 'hiker', dir: 'down', script: 'ernesto', sight: 4 },
      { id: 'marcos', x: 16, y: 3, look: 'andres', dir: 'down', script: 'marcos', sight: 5 },
    ],
  },

  centro_ruta3: centro('centro_ruta3', { to: 'ruta3', x: 11, y: 6 }),

  // Ruta 4: the cave, about as long as Ruta 3: in at the bottom left, out at the top right
  // (daylight) to Ruta 5. The side room off the entrance hall is for an item later.
  // Bats, beetles and spiders come later.
  ruta4: {
    id: 'ruta4',
    name: 'Cueva del Eco',
    outdoor: false,
    banner: true,
    floor: ';',
    border: '%',
    rows: [
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%e%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;%%;;;;;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;%%;;;;;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;%%;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;%%;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;%%;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;%%;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%%%%%%%%%%%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%;;;;;;;;;%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;%%;;;%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;;%%;;;%%;;%;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;;;;;;;%%;;%;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%e%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    ],
    exit: { to: 'ruta3', x: 4, y: 3 },
    doors: [{ x: 52, y: 0, to: 'ruta5', tx: 90, ty: 4, dir: 'up' }],
    encounters: {
      rate: 0.08,
      everywhere: true,
      table: [
        { sp: 'ecolin', min: 8, max: 13, w: 45 },
        { sp: 'ochopatas', min: 8, max: 13, w: 30 },
        { sp: 'cuernito', min: 8, max: 13, w: 25 },
      ],
    },
    npcs: [
      { id: 'raul', x: 4, y: 24, look: 'espeleologo', dir: 'right', script: 'raul', sight: 2 },
      { id: 'daniela', x: 20, y: 12, look: 'exploradora', dir: 'down', script: 'daniela', sight: 2 },
      { id: 'federico', x: 38, y: 26, look: 'arqueologo', dir: 'down', script: 'federico', sight: 2 },
      { id: 'javier', x: 46, y: 12, look: 'espeleologo', dir: 'right', script: 'javier', sight: 2 },
      // In the side room: optional.
      { id: 'rocio', x: 21, y: 36, look: 'exploradora', dir: 'left', script: 'rocio', sight: 3 },
      // Halfway, in a dead-end room south of the big chamber.
      itemBall('pocion_cueva', 32, 35, 'pocion'),
    ],
  },

  // The mountain's west slope, beside Ruta 3 and under Ruta 5: only scenery. Ruta 5's ravine river runs down
  // it into a lake, then bends down and to the left, on to Ruta 6's river (phase 3) and the sea.
  cerro_eco: {
    id: 'cerro_eco',
    name: 'Cerro del Eco',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    rows: [
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^',
      'TTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^',
      'TTTTTTT~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^',
      'TTTTT~~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^',
      'TTT~~~~~~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^',
      'TT~~~~~~~~~~~~~~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^',
      'TT~~~~~~~~~~~~~~~TTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^',
      'TT~~~~~~~~~~~~~~~TTTTTTTTTTTTTTTTTTTT^^^^^T^^^^^^^^^^^',
      'TTT~~~~~~~~~~~~~TTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTT~~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTT~~~~~TTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^T^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTT^T^^^^^^^^T^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^',
      'TTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^',
      'TTTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^T^^^^^^^^^^^^^^^^^^',
      'TTTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^T^^^^^',
      'TTTTT~~TTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^T^^^^^^^^^^^^^',
      'TTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~TTTTTTTTTTTTTTTTTTTTTTT^^^T^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~TTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~TTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTT~~~TTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^',
      '~~~~~~~~~TTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^',
      '~~~~~~~~~TTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^',
    ],
    connections: { up: { to: 'ruta5', offset: 2, scenery: true }, right: { to: 'ruta3', offset: 0, scenery: true } },
  },

  // Out of the cave, west to the next town (with the second gym). The cave climbs up and to the right inside,
  // so you come out high on the mountain, up and to the right of the way in (Ruta 3): a tunnel in the cliff, then
  // a trail along the clifftop, down past a clearing to the road, and west over the ravine bridge. The mountain
  // below the trail is the same rock as Ruta 3's. Villa Ocote (west) and the canyon (north) come in phase 2: until
  // then the road worker and a hiker keep those roads closed. Rows from plans/phase2-region2.md §3.
  ruta5: {
    id: 'ruta5',
    name: 'Ruta 5',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    // You come up out of the cave's tunnel at the bottom (still walking up), go north through the pines,
    // then west over the ravine bridge. Villa Ocote (west) and the canyon (north) come in phase 2: until
    // then the road worker and a hiker keep those roads closed. Rows from plans/phase2-region2.md §3.
    rows: [
      'TTTTTT^~~^TTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==T........T.TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.TTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,.TTTTTTTTTTTTTTTT==============================================TTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==============================================TTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^D^^^^^',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTT==...........TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'T.T...^~~^TTTTTTTT==..T....T...TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^',
      'T.....^~~^TTTT.TTT==...........TTT.TTTTTTTTTTT==...........T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '======HHHH======================================^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '======HHHH==================*===================^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'T.....^~~^TTTT..S.......,,,,,,.TTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^',
      'TT.T..^~~^TTTT,,,,,,,...,,,,,,.TTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^T^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,,...,,,,,,TTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,,...,,,,,,TTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTT.TTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^T^^^^^^^^^^^^^^^^^^^^T^^^^^^^^^^',
      'TTTTTT^~~^TTTT......TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^^^^^^T^^^^^^^^',
      'TTTTTT^~~^TTTT......TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
    ],
    connections: { down: { to: 'cerro_eco', offset: -2, scenery: true } },
    doors: [{ x: 90, y: 5, to: 'ruta4', tx: 52, ty: 1, dir: 'down' }],
    // Halfway along the road, in a gap in the pines: she sees both lanes.
    npcs: [{ id: 'lucia', x: 34, y: 10, look: 'painter', dir: 'down', script: 'lucia', sight: 2 }],
    signs: [{ x: 16, y: 13, es: 'RUTA 5. Al oeste: Villa Ocote. Al norte: el Cañón del Guardabarranco.', en: 'ROUTE 5. West: Villa Ocote. North: Guardabarranco Canyon.' }],
    gates: [
      {
        id: 'obrero',
        look: 'worker',
        opens: () => false,
        at: [1, 11, 'right'],
        aside: [2, 10],
        road: [[1, 12]],
        back: 'right',
        closed: [
          ['¡Hola! Lo siento, el camino a Villa Ocote está cerrado.', 'Hi! Sorry, the road to Villa Ocote is closed.'],
          ['Estamos arreglando el camino. ¡Vuelve pronto!', 'We’re fixing the road. Come back soon!'],
        ],
        open: [['¡Ya terminamos! Puedes pasar.', 'We’re done! You can go through.']],
      },
      {
        id: 'derrumbe',
        look: 'hiker',
        opens: () => false,
        at: [18, 1, 'down'],
        aside: [18, 3],
        road: [[19, 1]],
        back: 'down',
        closed: [['¡Cuidado! Hubo un derrumbe y el camino al cañón está cerrado.', 'Careful! There was a landslide and the path to the canyon is closed.']],
        open: [['El camino al cañón ya está abierto.', 'The path to the canyon is open now.']],
      },
    ],
  },
};

// Each gate's guard (on the road, or aside once it's open) and the tiles where you get stopped.
for (const m of Object.values(MAPS)) {
  for (const g of m.gates ?? []) {
    const [x, y, dir] = g.at;
    (m.npcs ??= []).push(
      { id: g.id, x, y, look: g.look, dir, script: 'gate', show: () => !g.opens() },
      { id: `${g.id}_aside`, x: g.aside[0], y: g.aside[1], look: g.look, dir: 'down', script: 'gate', turns: true, show: g.opens },
    );
    (m.triggers ??= []).push(...g.road.map(([x, y]) => ({ x, y, script: 'gateStop' })));
  }
}

/** The gate a guard (on the road or aside) belongs to. */
export const gateOf = (m: MapDef, npcId: string) => m.gates?.find((g) => npcId === g.id || npcId === `${g.id}_aside`);

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
  F  fountain (2×2)  U  market stall / pottery shelf   K  mine rails  W  mine support
  s  sand          y  cactus      z  dry tall grass (wild Palabritas)   A  lighthouse (its top has the lamp)
  Z  ladder between cave floors (stand it away from the walls; you arrive on it, like Gold/Silver)
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
  /** On a muted map: what they act out (the EN line; the Spanish is «…»). */
  mime?: string;
  /** Talks even on a muted map (Equipo Silencio, the nurse, the cashier...). */
  speaksWhenMuted?: boolean;
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
  /** Once open, the guard (aside) runs this script instead of the open lines (Beto and his hat). */
  openScript?: string;
  /** What the guard acts out on a muted map (see MapDef.muted). */
  mime?: string;
  /** The rest of the road beside the guard. */
  road: [x: number, y: number][];
  /** The way you're sent back when stopped. */
  back: Dir;
  closed: Line[] | (() => Line[]);
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
  /**
   * While true, nobody here can speak: talking to a person shows «…» (with their mime in English), and signs
   * are faded. Villa Ocote until the Silenciador breaks.
   */
  muted?: () => boolean;
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
const TIENDA = ['P########P', '++++++++++', '+C++++kk++', '+C++++kk++', '++++++++++', '++++kk++++', '++++++++++', '++++m+++++'];
const CAJERA: NpcDef = { id: 'cajera', x: 0, y: 2, look: 'cashier', dir: 'right', script: 'cajera', speaksWhenMuted: true };
/** A shop inside: the cashier behind the counter. What it sells is in SHOPS (data/items.ts), by map id. */
const tienda = (id: string, exit: MapDef['exit'], extra: Partial<MapDef> = {}): MapDef => ({
  id, name: 'Tienda', outdoor: false, floor: '+', rows: TIENDA, exit, npcs: [CAJERA], ...extra,
});
/** A home: the HOUSE rows (or others) and whoever lives there. */
const casa = (id: string, name: string, exit: MapDef['exit'], npcs: NpcDef[], extra: Partial<MapDef> = {}): MapDef => ({
  id, name, outdoor: false, floor: '_', rows: HOUSE, exit, npcs, ...extra,
});
/** A museum exhibit on a two-tile table: the same text from both tiles. */
const exhibit = (x: number, y: number, es: string, en: string) => [{ x, y, es, en }, { x: x + 1, y, es, en }];
const ESCUELA = ['##L##L##L#', '__________', '__________', '_kk_kk_kk_', '__________', '_kk_kk_kk_', '__________', '____m_____'];
/** A school: the teacher at the front (lessons: world/school.ts) and two students. */
const escuela = (id: string, exit: MapDef['exit'], teacher: NpcDef, students: NpcDef[], extra: Partial<MapDef> = {}): MapDef => ({
  id, name: 'Escuela', outdoor: false, floor: '_', rows: ESCUELA, exit, npcs: [teacher, ...students], ...extra,
});
/**
 * A night version of a map (plans/phase1-groundwork.md §10): the same place drawn dark, with other people. For
 * cutscenes only, so it has no way in or out of its own (no connections, doors, triggers, gates or encounters).
 */
const night = (m: MapDef, id: string, changes: Partial<MapDef>): MapDef => ({
  ...m, id, night: true, banner: false, connections: undefined, doors: undefined, triggers: undefined, gates: undefined, encounters: undefined, ...changes,
});

/** Villa Ocote can't speak until the Silenciador in the mine breaks. */
const ocoteMuted = () => !flag('silenciadorRoto');

/** A lost word of Villa Ocote (region2.ts LOST_WORDS), lying around once the Silenciador breaks. */
const lostWord = (id: string, x: number, y: number): NpcDef => ({
  id: `palabra_${id}`, x, y, object: 'palabra', script: 'palabraPerdida', show: () => flag('silenciadorRoto') && !flag(`palabra:${id}`),
});

/** A Palacentro inside: the nurse, the healing machine, and whoever else is there. */
const centro = (id: string, exit: MapDef['exit'], more: NpcDef[] = [], extra: Partial<MapDef> = {}): MapDef => ({
  id,
  name: 'Palacentro',
  outdoor: false,
  floor: 'x',
  rows: CENTRO,
  exit,
  npcs: [{ id: 'enfermera', x: 4, y: 1, look: 'nurse', dir: 'down', script: 'enfermera', speaksWhenMuted: true }, MAQUINA, ...more],
  ...extra,
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
        { sp: 'gusanito', min: 2, max: 3, w: 30 },
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
        openScript: 'betoSombrero',
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
        { sp: 'gusanito', min: 3, max: 6, w: 30 },
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

  tienda_brisa: tienda('tienda_brisa', { to: 'brisa', x: 5, y: 7 }),

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
    connections: { right: { to: 'brisa', offset: -27 }, up: { to: 'ruta5', offset: 56, scenery: true } },
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
        { sp: 'capullito', min: 7, max: 9, w: 15 },
        { sp: 'mariposita', min: 10, max: 11, w: 15 },
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
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%;;;;;;;;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
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
      // The echo room behind the cracked wall (shout five times, §8.2), with the shell fossil.
      { id: 'pared_eco', x: 6, y: 9, object: 'paredRota', script: 'paredEco', show: () => !flag('ecoAbierto') },
      itemBall('fosil_cueva', 6, 4, 'fosil'),
      // Beto's hat, on an Ecolín's head in Rocío's side room (§8.1).
      { id: 'ecolin_sombrero', x: 16, y: 33, object: 'ecolinSombrero', script: 'ecolinSombrero', show: () => !flag('sombreroEncontrado') },
    ],
  },

  // Out of the cave, west to the next town (with the second gym). The cave climbs up and to the right inside,
  // so you come out high on the mountain, up and to the right of the way in (Ruta 3): a tunnel in the cliff, then
  // a trail along the clifftop, down past a clearing to the road, and west over the ravine bridge. The mountain
  // below the trail is the same rock as Ruta 3's. The canyon is north, up the path by the bridge.
  // Rows from plans/phase2-region2.md §3.
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
      'TTTTT~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTT~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTT~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
    ],
    style: { trees: 'pine' },
    connections: { down: { to: 'ruta3', offset: -56, scenery: true }, left: { to: 'ocote', offset: 2 }, up: { to: 'canon', offset: -4 } },
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'ardillita', min: 10, max: 13, w: 30 },
        { sp: 'colibri', min: 10, max: 13, w: 25 },
        { sp: 'espinita', min: 11, max: 13, w: 20 },
        { sp: 'hojadillo', min: 10, max: 12, w: 15 },
        { sp: 'pajarito', min: 10, max: 12, w: 10 },
      ],
    },
    // The foot of the clifftop trail: Lucas catches up with you (rival battle #1).
    triggers: [
      { x: 46, y: 10, script: 'lucasRuta5' },
      { x: 47, y: 10, script: 'lucasRuta5' },
    ],
    doors: [{ x: 90, y: 5, to: 'ruta4', tx: 52, ty: 1, dir: 'down' }],
    // Halfway along the road, in a gap in the pines: she sees both lanes.
    npcs: [
      { id: 'lucia', x: 34, y: 10, look: 'painter', dir: 'down', script: 'lucia', sight: 2 },
      { id: 'armando', x: 70, y: 2, look: 'lenador', dir: 'down', script: 'armando', sight: 2 },
      { id: 'elena', x: 14, y: 10, look: 'campista', dir: 'down', script: 'elena', sight: 2 },
      { id: 'gaby', x: 20, y: 8, look: 'ornitologa', dir: 'left', script: 'gaby', turns: true },
      { id: 'lucas', x: 35, y: 11, look: 'lucas', dir: 'right', script: 'lucas', show: () => flag('lucasAqui') },
      // Two of Villa Ocote's lost words blew all the way out here.
      lostWord('marimba', 3, 10),
      lostWord('bueyes', 53, 8),
    ],
    signs: [{ x: 16, y: 13, es: 'RUTA 5. Al oeste: Villa Ocote. Al norte: el Cañón del Guardabarranco.', en: 'ROUTE 5. West: Villa Ocote. North: Guardabarranco Canyon.' }],
  },

  // ---------- Region 2: Villa Ocote, the clay mine and Petra's gym ----------

  // A potters' town in the pines, under the mountain with the clay mine. Bigger than the towns before: a plaza
  // with a fountain and pottery stalls, a museum, a school, a workshop and plenty of homes. Nobody can speak
  // until the Silenciador in the mine breaks (muted). The east road comes from Ruta 5; the south road goes down
  // to the sea (Ruta 6, phase 3: add `down: { to: 'ruta6', offset: -6 }` then).
  ocote: {
    id: 'ocote',
    name: 'Villa Ocote',
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'clay',
    style: { trees: 'pine', walls: 'adobe' },
    muted: ocoteMuted,
    rows: [
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^TT',
      'TTT^^^^^^^^^^^^^^^^O^^^^^^^^^^^^^^^^^TTT',
      'TT.................==.................TT',
      'TT.ooooo.rrrr.rrrr.==..pppppp..rrrrr..TT',
      'TT.ooooo.rrrr.rrrr.==..pppppp..rrrrr..TT',
      'TT.hwcwh.hwMh.hwwh.==..hwGwwh..hwwwh..TT',
      'TT.hwdwh.hwdh.hwdh.==..hhdhhh..hwdwh..TT',
      'TT....*............==......*..........TT',
      'TT..T..............==..............T..TT',
      'TT..........==========UU=UU===........TT',
      'TT..........==================......S.TT',
      'TT..........============================',
      'TT..........=======FF===================',
      'TT..........=======FF=========........TT',
      'TT..........==================........TT',
      'TT..........==================........TT',
      'TT..*......g..........==....g........*TT',
      'TT.bbbbbbb..rrrr.rrrr.==..rrrrrr.rrrrrTT',
      'TT.bbbbbbb..rrrr.rrrr.==..rrrrrr.rrrrrTT',
      'TT.hwwwwwh..hwwh.hwwh.==..hwwwwh.hwwwhTT',
      'TT.hwwdwwh..hwdh.hwdh.==..hwdwwh.hwdwhTT',
      'TT......S.............==.......S......TT',
      'TT....................==..............TT',
      'TT.rrrrrr..rrrr.......==..rrrr...T....TT',
      'TT.rrrrrr..rrrr.......==..rrrr........TT',
      'TT.hwwwwh..hwwh.......==..hwwh...*....TT',
      'TT.hwwdwh..hwdh.......==..hwdh........TT',
      'TT.*..............T...==....*......T..TT',
      'TTTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTT',
    ],
    connections: { right: { to: 'ruta5', offset: -2 } },
    doors: [
      { x: 19, y: 3, to: 'mina1', tx: 5, ty: 24 },
      { x: 5, y: 8, to: 'centro_ocote', tx: 4, ty: 7 },
      { x: 11, y: 8, to: 'tienda_ocote', tx: 4, ty: 6 },
      { x: 16, y: 8, to: 'casa_lucha', tx: 4, ty: 6 },
      { x: 25, y: 8, to: 'gym_ocote', tx: 4, ty: 14 },
      { x: 33, y: 8, to: 'casa_ocote2', tx: 4, ty: 6 },
      { x: 6, y: 22, to: 'museo_ocote', tx: 5, ty: 6 },
      { x: 14, y: 22, to: 'casa_mia', tx: 4, ty: 6 },
      { x: 19, y: 22, to: 'casa_nando', tx: 4, ty: 6 },
      { x: 28, y: 22, to: 'escuela_ocote', tx: 4, ty: 6 },
      { x: 35, y: 22, to: 'casa_chepe', tx: 4, ty: 6 },
      { x: 6, y: 28, to: 'taller_ocote', tx: 4, ty: 5 },
      { x: 13, y: 28, to: 'casa_tona', tx: 4, ty: 6 },
      { x: 28, y: 28, to: 'casa_abuelos', tx: 4, ty: 6 },
    ],
    signs: [
      { x: 36, y: 12, es: 'VILLA OCOTE. El pueblo del barro.', en: 'VILLA OCOTE. The town of clay.' },
      { x: 8, y: 23, es: 'MUSEO DE VILLA OCOTE. Fósiles y piedras pintadas.', en: 'VILLA OCOTE MUSEUM. Fossils and painted stones.' },
      { x: 31, y: 23, es: 'ESCUELA. ¡Clases para entrenadores!', en: 'SCHOOL. Lessons for trainers!' },
    ],
    triggers: [
      { x: 37, y: 13, script: 'mensajeOcote' },
      { x: 37, y: 14, script: 'mensajeOcote' },
    ],
    gates: [
      {
        id: 'aprendiz',
        look: 'alfarero',
        opens: () => flag('silenciadorRoto'),
        at: [25, 9, 'down'],
        aside: [24, 9],
        road: [],
        back: 'down',
        mime: '(He can’t speak. He points north, toward the mine.)',
        closed: [['La líder no está. ¡Fue a la mina!', 'The leader isn’t here. She went to the mine!']],
        open: [['¡Petra te espera adentro!', 'Petra is waiting for you inside!']],
      },
      {
        id: 'guarda_sur',
        look: 'officer',
        // Ruta 6 comes in phase 3: until it's there, the road south stays closed even with the medal.
        opens: () => flag('medalBarro') && !!MAPS.ruta6,
        at: [22, 30, 'up'],
        aside: [21, 29],
        road: [[23, 30]],
        back: 'up',
        mime: '(He shakes his head and points back toward town.)',
        closed: () =>
          flag('medalBarro')
            ? [
                ['¡Tienes la Medalla Barro! Pero el puente del río se cayó.', 'You have the Clay Medal! But the river bridge fell down.'],
                ['Lo están arreglando. ¡Vuelve pronto!', 'They’re fixing it. Come back soon!'],
              ]
            : [
                ['El camino al sur baja hasta el mar. Es largo y peligroso.', 'The road south goes down to the sea. It’s long and dangerous.'],
                ['Solo pueden pasar los entrenadores con la Medalla Barro.', 'Only trainers with the Clay Medal may pass.'],
              ],
        open: [['¡Tienes la Medalla Barro! Buen viaje.', 'You have the Clay Medal! Have a good trip.']],
      },
    ],
    npcs: [
      { id: 'mia', x: 15, y: 23, look: 'girl', dir: 'down', script: 'mia', mime: '(She points at the ground by the east road, where she wrote a message.)' },
      { id: 'abuelo_ocote', x: 21, y: 16, look: 'abuelo', dir: 'left', script: 'abuelo_ocote', turns: true, mime: '(He points at the mine, then at his mouth, and shakes his head sadly.)' },
      { id: 'vendedora', x: 24, y: 11, look: 'lady', dir: 'down', script: 'vendedora', mime: '(She holds up a clay pot and opens her mouth, but nothing comes out.)' },
      { id: 'chepe', x: 35, y: 17, look: 'man', dir: 'left', script: 'chepe', mime: '(He counts on his fingers: one, two... and looks around for something.)' },
      { id: 'carreta', x: 36, y: 17, object: 'carreta', script: 'carreta' },
      { id: 'lucas_ocote', x: 17, y: 14, look: 'lucas', dir: 'right', script: 'lucas_ocote', show: () => !flag('silenciadorRoto'), mime: '(It’s Lucas! He stamps his foot. He looks furious that he can’t talk.)' },
      { id: 'musico', x: 13, y: 16, look: 'musico', dir: 'right', script: 'musico', mime: '(He lifts his mallets over an invisible marimba... and puts them down again.)' },
      { id: 'futbolista', x: 17, y: 24, look: 'boy', dir: 'right', script: 'futbolista', turns: true, mime: '(He bounces on his toes and mimes kicking a ball.)' },
      lostWord('tortilla', 3, 11),
      lostWord('medicina', 29, 18),
      lostWord('pelota', 22, 4),
      { id: 'buey2', x: 32, y: 18, object: 'buey', script: 'buey', show: () => flag('bueyes') && !flag('buey2') },
    ],
  },

  centro_ocote: centro('centro_ocote', { to: 'ocote', x: 5, y: 9 }, [], { muted: ocoteMuted }),
  tienda_ocote: tienda('tienda_ocote', { to: 'ocote', x: 11, y: 9 }, { muted: ocoteMuted }),
  casa_lucha: casa('casa_lucha', 'Casa de Doña Lucha', { to: 'ocote', x: 16, y: 9 }, [
    { id: 'curandera', x: 5, y: 3, look: 'granny', dir: 'down', script: 'curandera', mime: '(She holds her head as if it hurts, then points at a little bottle.)' },
  ], { rows: [
      '##P##L##',
      '________',
      '_kk__PP_',
      '_kk_____',
      '________',
      'P_____B_',
      '____m___',
  ], muted: ocoteMuted }),
  casa_ocote2: casa('casa_ocote2', 'Casa de los Alfareros', { to: 'ocote', x: 33, y: 9 }, [
    { id: 'alfarera_mama', x: 5, y: 2, look: 'lady', dir: 'down', script: 'alfarera_mama' },
    { id: 'alfarero_nino', x: 3, y: 4, look: 'boy', dir: 'up', script: 'alfarero_nino' },
  ], { muted: ocoteMuted }),
  casa_mia: casa('casa_mia', 'Casa de Mía', { to: 'ocote', x: 14, y: 23 }, [
    { id: 'mia_mama', x: 5, y: 2, look: 'lady', dir: 'down', script: 'mia_mama' },
  ], { muted: ocoteMuted }),
  casa_nando: casa('casa_nando', 'Casa de Nando', { to: 'ocote', x: 19, y: 23 }, [
    { id: 'nando_papa', x: 5, y: 3, look: 'man', dir: 'left', script: 'nando_papa' },
  ], { muted: ocoteMuted }),
  casa_chepe: casa('casa_chepe', 'Casa de Don Chepe', { to: 'ocote', x: 35, y: 23 }, [
    { id: 'chepe_esposa', x: 5, y: 2, look: 'lady', dir: 'down', script: 'chepe_esposa' },
  ], { muted: ocoteMuted }),
  casa_tona: casa('casa_tona', 'Casa de Doña Toña', { to: 'ocote', x: 13, y: 29 }, [
    { id: 'cocinera', x: 2, y: 2, look: 'lady', dir: 'down', script: 'cocinera', mime: '(She pats some dough between her hands and sighs.)' },
  ], { rows: [
      '##L##V##',
      '_CCC____',
      '________',
      '_kk_____',
      '_kk_____',
      '______B_',
      '____m___',
  ], muted: ocoteMuted }),
  casa_abuelos: casa('casa_abuelos', 'Casa de los Abuelos', { to: 'ocote', x: 28, y: 29 }, [
    { id: 'abuela_ocote', x: 5, y: 2, look: 'granny', dir: 'down', script: 'abuela_ocote' },
    { id: 'abuelo_dormido', x: 6, y: 4, look: 'abuelo', dir: 'down', script: 'abuelo_dormido' },
  ], { muted: ocoteMuted }),
  taller_ocote: casa('taller_ocote', 'Taller de Alfarería', { to: 'ocote', x: 6, y: 29 }, [
    { id: 'ramiro', x: 5, y: 2, look: 'alfarero', dir: 'down', script: 'ramiro' },
  ], { rows: [
      '##########',
      '_UUU__UUU_',
      '__________',
      '_kk____kk_',
      '__________',
      'P________P',
      '____m_____',
  ], muted: ocoteMuted }),

  museo_ocote: {
    id: 'museo_ocote',
    name: 'Museo de Villa Ocote',
    outdoor: false,
    floor: '+',
    rows: [
      '############',
      '+kk+kk++kk++',
      '++++++++++++',
      '+kk++++++kk+',
      '++++++++++++',
      'P++++++++++P',
      '++++++++++++',
      '+++++mm+++++',
    ],
    exit: { to: 'ocote', x: 6, y: 23 },
    muted: ocoteMuted,
    signs: [
      ...exhibit(1, 1, 'Un fósil de gliptodonte: un armadillo gigante de hace diez mil años.', 'A glyptodon fossil: a giant armadillo from ten thousand years ago.'),
      ...exhibit(4, 1, 'Una piedra con petroglifos: personas, soles y espirales.', 'A stone with petroglyphs: people, suns and spirals.'),
      ...exhibit(8, 1, 'Cerámica antigua de la región. ¡Los alfareros de hoy usan el mismo barro!', 'Ancient pottery from this region. Today’s potters use the same clay!'),
      ...exhibit(1, 3, 'Huellas muy antiguas, encontradas cerca de un lago.', 'Very old footprints, found near a lake.'),
      ...exhibit(9, 3, 'Un mapa de toda América, con un guardabarranco pintado.', 'A map of all the Americas, with a guardabarranco painted on it.'),
    ],
    npcs: [{ id: 'curadora', x: 6, y: 2, look: 'prof', dir: 'down', script: 'curadora' }],
  },

  escuela_ocote: escuela(
    'escuela_ocote',
    { to: 'ocote', x: 28, y: 23 },
    { id: 'maestro_ocote', x: 4, y: 1, look: 'man', dir: 'down', script: 'maestro_ocote' },
    [
      { id: 'alumno1', x: 2, y: 4, look: 'boy', dir: 'up', script: 'alumno1' },
      { id: 'alumna1', x: 6, y: 6, look: 'girl', dir: 'up', script: 'alumna1' },
    ],
    { muted: ocoteMuted },
  ),

  // Petra's gym: pottery shelves with a stone door in each row; a riddle opens each door. Both trainers are in
  // the way (the shelf rows leave no way around their lines of sight).
  gym_ocote: {
    id: 'gym_ocote',
    name: 'Gimnasio de Villa Ocote',
    outdoor: false,
    floor: '_',
    rows: [
      '##L####L##',
      '__________',
      '__________',
      'UUUU_UUUUU',
      '__________',
      '__________',
      '__________',
      'UUUUUU_UUU',
      '__________',
      '__________',
      '__________',
      'UU_UUUUUUU',
      '__________',
      '__________',
      '__________',
      '____mm____',
    ],
    exit: { to: 'ocote', x: 25, y: 9 },
    npcs: [
      { id: 'petra', x: 5, y: 1, look: 'petra', dir: 'down', script: 'petra' },
      { id: 'tito', x: 1, y: 9, look: 'alfarero', dir: 'right', script: 'tito', sight: 8 },
      { id: 'rosario', x: 8, y: 5, look: 'minera', dir: 'left', script: 'rosario', sight: 8 },
      { id: 'guia_ocote', x: 7, y: 13, look: 'man', dir: 'left', script: 'guia_ocote' },
      { id: 'piedra1', x: 2, y: 11, object: 'puertaPiedra', script: 'adivinanza', show: () => !flag('adivinanza:piedra1') },
      { id: 'piedra2', x: 6, y: 7, object: 'puertaPiedra', script: 'adivinanza', show: () => !flag('adivinanza:piedra2') },
      { id: 'piedra3', x: 4, y: 3, object: 'puertaPiedra', script: 'adivinanza', show: () => !flag('adivinanza:piedra3') },
    ],
  },

  // The clay mine, under the mountain north of town: Equipo Silencio's hideout. Floor 1 has the lever that opens
  // the gate to the ladder down; floor 2 has the Silenciador and the Capataz. Like Gold/Silver, you arrive on a ladder and
  // step off it.
  mina1: {
    id: 'mina1',
    name: 'Mina de Barro',
    outdoor: false,
    banner: true,
    floor: ';',
    border: '%',
    style: { cave: 'clay' },
    rows: [
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;;;;;;;;;;;%%',
      '%%;;;;;;;;;;;;;;;;;;;;;;;;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;;;;;;%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;KKKKKKKKKKK;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;W;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;;;Z;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;KKKKKKKKKKK;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%e%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    ],
    exit: { to: 'ocote', x: 19, y: 4 },
    doors: [{ x: 31, y: 18, to: 'mina2', tx: 4, ty: 4, dir: 'down' }],
    encounters: {
      rate: 0.08,
      everywhere: true,
      table: [
        { sp: 'piedrita', min: 11, max: 14, w: 40 },
        { sp: 'ollita', min: 11, max: 14, w: 35 },
        { sp: 'ochopatas', min: 11, max: 13, w: 15 },
        { sp: 'ecolin', min: 11, max: 13, w: 10 },
      ],
    },
    npcs: [
      { id: 'silencioso1', x: 4, y: 18, look: 'silencioso', dir: 'right', script: 'silencioso1', sight: 2 },
      { id: 'silencioso2', x: 10, y: 4, look: 'silenciosa', dir: 'left', script: 'silencioso2', sight: 2 },
      { id: 'palanca', x: 12, y: 2, object: 'palanca', script: 'palanca' },
      { id: 'compuerta', x: 20, y: 9, object: 'compuerta', script: 'compuerta', show: () => !flag('compuertaAbierta') },
      itemBall('pocion_mina', 33, 7, 'pocion'),
      lostWord('olla', 30, 13),
    ],
  },

  mina2: {
    id: 'mina2',
    name: 'Mina de Barro',
    outdoor: false,
    floor: ';',
    border: '%',
    style: { cave: 'clay' },
    rows: [
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;;;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;Z;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;%%%%%%%%%%%%%',
      '%%;;;;;%%%;%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%;;;%%%%;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;%%%%;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;;;;;;;;%%',
      '%%%%%;;%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%%;%%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;;;;;;;;;;;;%%',
      '%%%%;;;KKKKKKKKKKK;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;;;;;;;;;;;;%%',
      '%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    ],
    doors: [{ x: 4, y: 4, to: 'mina1', tx: 31, ty: 18, dir: 'down' }],
    encounters: {
      rate: 0.08,
      everywhere: true,
      table: [
        { sp: 'piedrita', min: 13, max: 15, w: 35 },
        { sp: 'ollita', min: 13, max: 15, w: 30 },
        { sp: 'ochopatas', min: 13, max: 15, w: 20 },
        { sp: 'ecolin', min: 13, max: 15, w: 15 },
      ],
    },
    npcs: [
      { id: 'silencioso3', x: 10, y: 9, look: 'silencioso', dir: 'up', script: 'silencioso3', sight: 1 },
      { id: 'silencioso4', x: 6, y: 16, look: 'silenciosa', dir: 'left', script: 'silencioso4', sight: 1 },
      { id: 'capataz', x: 22, y: 15, look: 'capataz', dir: 'down', script: 'capataz', sight: 3, show: () => !flag('capatazHuyo') },
      { id: 'silenciador', x: 22, y: 14, object: 'silenciador', script: 'silenciadorObj', show: () => !flag('silenciadorRoto') },
      { id: 'petra_mina', x: 22, y: 21, look: 'petra', dir: 'up', script: 'petra_mina', show: () => flag('capatazHuyo') && !flag('petraVolvio') },
      itemBall('repelente_mina', 26, 2, 'repelente'),
      lostWord('historia', 8, 13),
      lostWord('pregunta', 24, 18),
      { id: 'nota', x: 22, y: 15, object: 'nota', script: 'notaCapataz', show: () => flag('capatazHuyo') && !flag('notaLeida') },
    ],
  },

  // A deep river canyon north of Ruta 5, like Somoto's: paths on both banks, three bridges, a waterfall pool at the
  // top with a grove on each side. Optional; the rare Guardabarranco lives here.
  canon: {
    id: 'canon',
    name: 'Cañón del Guardabarranco',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    border: '^',
    style: { trees: 'pine' },
    rows: [
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^.......~~~........^^^',
      '^^^.T.....~~~......T.^^^',
      '^^^.......HHH........^^^',
      '^^^.......HHH........^^^',
      '^^^.......~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~........^^^',
      '^^^.......~~~......T.^^^',
      '^^^..*....HHH........^^^',
      '^^^.....T.HHH....*...^^^',
      '^^^.......~~~........^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^.......~~~.,,,,,,.^^^',
      '^^^...T...~~~........^^^',
      '^^^.......HHH....T...^^^',
      '^^^.......HHH........^^^',
      '^^^....*..~~~.==.....^^^',
      '^^^,,,,,~~~^^.==..^^^^^^',
      '^^^,,,~~~^^^^.==..^^^^^^',
      '^^^,~~~^^^^^^.==..^^^^^^',
      '^^^~~~^^^^^^^^==^^^^^^^^',
      '^^^~~^^^^^^^^^==^^^^^^^^',
    ],
    connections: { down: { to: 'ruta5', offset: 4 } },
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'colibri', min: 12, max: 14, w: 30 },
        { sp: 'ardillita', min: 12, max: 14, w: 25 },
        { sp: 'espinita', min: 12, max: 15, w: 25 },
        { sp: 'mariposita', min: 12, max: 13, w: 15 },
        { sp: 'guardabarranco', min: 13, max: 15, w: 5 },
      ],
    },
    npcs: [
      { id: 'julio', x: 9, y: 18, look: 'fisher', dir: 'left', script: 'julio', sight: 3 },
      { id: 'rosa', x: 16, y: 13, look: 'campista', dir: 'down', script: 'rosa', sight: 2 },
      itemBall('superpocion_canon', 3, 0, 'superpocion'),
      { id: 'buey1', x: 19, y: 2, object: 'buey', script: 'buey', show: () => flag('bueyes') && !flag('buey1') },
    ],
  },
};

// The lost words' party (region2.ts fiesta): Villa Ocote at night, everyone around the fountain.
MAPS.ocote_noche = night(MAPS.ocote, 'ocote_noche', {
  npcs: [
    { id: 'petra_fiesta', x: 19, y: 12, look: 'petra', dir: 'down', script: 'petra_mina' },
    { id: 'vendedora_fiesta', x: 17, y: 13, look: 'lady', dir: 'right', script: 'vendedora' },
    { id: 'cocinera_fiesta', x: 22, y: 13, look: 'lady', dir: 'left', script: 'cocinera' },
    { id: 'musico_fiesta', x: 17, y: 14, look: 'musico', dir: 'right', script: 'musico' },
    { id: 'curandera_fiesta', x: 22, y: 14, look: 'granny', dir: 'left', script: 'curandera' },
    { id: 'abuelo_fiesta', x: 17, y: 15, look: 'abuelo', dir: 'right', script: 'abuelo_ocote' },
    { id: 'chepe_fiesta', x: 22, y: 15, look: 'man', dir: 'left', script: 'chepe' },
    { id: 'futbolista_fiesta', x: 18, y: 17, look: 'boy', dir: 'up', script: 'futbolista' },
    { id: 'maestro_fiesta', x: 21, y: 17, look: 'man', dir: 'up', script: 'maestro_ocote' },
  ],
});

// Each gate's guard (on the road, or aside once it's open) and the tiles where you get stopped.
for (const m of Object.values(MAPS)) {
  for (const g of m.gates ?? []) {
    const [x, y, dir] = g.at;
    (m.npcs ??= []).push(
      { id: g.id, x, y, look: g.look, dir, script: 'gate', show: () => !g.opens(), mime: g.mime },
      { id: `${g.id}_aside`, x: g.aside[0], y: g.aside[1], look: g.look, dir: 'down', script: 'gate', turns: true, show: g.opens },
    );
    (m.triggers ??= []).push(...g.road.map(([x, y]) => ({ x, y, script: 'gateStop' })));
  }
}

/** A gate's closed lines, which can change with the story. */
export const closedLines = (g: GateDef) => (typeof g.closed === 'function' ? g.closed() : g.closed);

/** The gate a guard (on the road or aside) belongs to. */
export const gateOf = (m: MapDef, npcId: string) => m.gates?.find((g) => npcId === g.id || npcId === `${g.id}_aside`);

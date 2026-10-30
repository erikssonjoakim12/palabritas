import type { Dir } from '../../engine/input';
import { flag } from '../../game/state';
import type { MapStyle } from '../../art/tiles';

/*
  The building blocks of maps: the tile legend, the types, and the rooms and people every region reuses
  (a Palacentro, a shop, a home, a school, a night version). The maps themselves are in one file per region;
  index.ts puts them together into MAPS.

 Tile legend (see art/tiles.ts):
  .  grass         ,  tall grass (wild Palabritas)   =  path        *  flowers
  T  tree (mostly green, some dry)   t  dry tree   I  pine (colder places, later)
                   Y  lemon tree                    ~  water       f  fence      S  sign
  /  thin tree that blocks a path (cut it once you can)      {  mangrove (roots in the water; you can't land)
  -  thorny hedge (zarza: Ortiga's garden)
  r b o p  roofs (red, blue, orange = Centro, purple = Gym)
  h  wall          w  window                        d  door        a  bakery sign   M  shop sign
  _  wood floor    +  tile floor                    #  inside wall
  k  table         B  bed       L  shelf            P  plant       V  TV
  $  wood stove     &  rocking chair    <  hammock (2 wide)    @  wardrobe
  C  counter (talk across it)   m  exit mat         R  rug
  J  palm tree (beaches, later)
  ^  mountain      :  rocky ground                  O  cave entrance
  %  cave wall     ;  cave floor                    e  cave exit (walk down to leave)
  D  tunnel under a cliff (a door you walk south into)   H  bridge / pier
  F  fountain (2×2)  U  market stall / pottery shelf   K  mine rails  W  mine support
  s  sand          y  cactus      z  dry tall grass (wild Palabritas)   A  lighthouse (its top has the lamp)
  Z  ladder between cave floors (stand it away from the walls; you arrive on it, like Gold/Silver)
  i  volcanic ash    j  lava        X  steam vent    E  black volcanic boulder    |  sugarcane (tall grass)    l  cobblestones
  q  church roof (cream)            N  bell tower (2 tall: the bell on top)
  [  temple stone    ]  temple stairs    (  temple doorway    )  the same, upside down (you walk down into it)    !  waterfall (climb it one day)
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
  /** What happens when you talk to it. An object without one is decoration: you read the sign on its spot, if any. */
  script?: string;
  show?: () => boolean;
  /** Trainers: how many tiles ahead they can see you. */
  sight?: number;
  /** Looks around now and then. */
  turns?: boolean;
  /** Walks about now and then, at most WANDER tiles from where they stand (townspeople; never trainers). */
  wanders?: boolean;
  /** Item balls: what's inside (key in ITEM_DEFS). */
  item?: string;
  /** On a muted map: what they act out (the EN line; the Spanish is «…»). */
  mime?: string;
  /**
   * On a muted map, runs its own script anyway: the nurse and the cashier (they mime, but still serve you), and
   * visitors who can talk, like you (Lucas).
   */
  servesWhenMuted?: boolean;
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
  /** Outdoors: pale dotted town ground, green route grass, beach sand or volcanic ash for '.' (and under rock edges). */
  ground?: 'town' | 'grass' | 'sand' | 'ash';
  /**
   * While true, nobody here can speak: talking to a person shows «…» (with their mime in English), and signs
   * are faded. Villa Ocote until the Silenciador breaks.
   */
  muted?: () => boolean;
  /** Tree, wall, rock and cave looks (art/tiles.ts MapStyle). */
  style?: MapStyle;
  /** Drawn dark, with light around you (night scenes). */
  night?: boolean;
  /** Fireworks in the night sky (the festival in Ciudad Chispa). */
  fireworks?: boolean;
  /** Roof color for 'r' buildings (key in ROOFS, style/colors.ts). */
  roof?: string;
  connections?: Partial<Record<Dir, Conn>>;
  /**
   * Placed at (x, y) inside another map's holes instead of by a connection: a place no road leads to (Villa Jaguar,
   * reached by water).
   */
  at?: { map: string; x: number; y: number };
  /** Step on (x, y) to go to (tx, ty) on another map, facing `dir` (default: up, into a building). */
  doors?: { x: number; y: number; to: string; tx: number; ty: number; dir?: Dir }[];
  /** Interiors: where you end up when walking out over the mat. */
  exit?: { to: string; x: number; y: number };
  npcs?: NpcDef[];
  signs?: { x: number; y: number; es: string; en: string }[];
  triggers?: { x: number; y: number; script: string }[];
  gates?: GateDef[];
  /** Wild Palabritas while you swim (Surf), on every step in the water. */
  surf?: { rate: number; table: EncounterEntry[] };
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

/** What you meet swimming: in the river, the lake and the sea (Surf). */
export const RIVER_SURF = { rate: 0.08, table: [{ sp: 'tilapita', min: 28, max: 31, w: 40 }, { sp: 'mojarrita', min: 28, max: 31, w: 25 }, { sp: 'mordisquito', min: 30, max: 32, w: 20 }, { sp: 'ranojito', min: 28, max: 30, w: 15 }] };
export const LAKE_SURF = { rate: 0.08, table: [{ sp: 'mojarrita', min: 30, max: 33, w: 40 }, { sp: 'mordisquito', min: 30, max: 33, w: 30 }, { sp: 'pelicanito', min: 30, max: 32, w: 20 }, { sp: 'tilapita', min: 30, max: 32, w: 10 }] };
export const SEA_SURF = { rate: 0.08, table: [{ sp: 'cangrejito', min: 26, max: 29, w: 35 }, { sp: 'pelicanito', min: 26, max: 29, w: 30 }, { sp: 'mojarrita', min: 26, max: 29, w: 25 }, { sp: 'espadon', min: 28, max: 30, w: 10 }] };

/** What bites in rivers and ponds (with the rod, from Playa Carey). The shark line only lives in the lake. */
export const FRESHWATER: EncounterEntry[] = [{ sp: 'tilapita', min: 8, max: 14, w: 100 }];

/**
 * Homes inside, 8×7 with the mat at the bottom: a few layouts, so neighbors' houses differ. Every one leaves
 * (4, 2), (5, 2) and (5, 3) free for whoever lives there.
 */
export const HOUSES = {
  clasica: ['##L##V##', '________', '_kk_____', '_kk_____', '________', '______B_', '____m___'],
  cocina: ['#$U##L##', '________', '______&_', '_kk_____', '_kk_____', 'P_____B_', '____m___'],
  hamaca: ['##@##V##', '_<<_____', '________', '______&_', '_kk_____', '_kk___B_', '____m___'],
  familia: ['##L##@##', '________', '_B____B_', '________', '__kk____', 'P_kk__&_', '____m___'],
  estudio: ['#LL#@##P', '________', '______P_', '_&______', '______kk', 'P_____kk', '____m___'],
};
// Palacentro: posters (u), nurse behind the counter (C) next to the healing machine,
// a computer (Q) and waiting sofas (n).
const CENTRO = ['##u####u##', 'PxxxxxxxxP', 'xxxCCCCxxx', 'xxxxxxxxQx', 'xxxxxxxxxx', 'nxxxxxxxxn', 'nxxxxxxxxn', 'xxxxmxxxxx'];
/** Something to pick up, once (flag item:<id>): a Palabola on the ground, or its own look (`object`, e.g. the fossil). */
export const itemBall = (id: string, x: number, y: number, item: string, object = 'palabola'): NpcDef => ({ id, x, y, object, item, script: 'itemBall', show: () => !flag(`item:${id}`) });
const MAQUINA: NpcDef = { id: 'maquina', x: 5, y: 1, object: 'maquina', script: 'maquina' };
const TIENDA = ['P########P', '++++++++++', '+C++++kk++', '+C++++kk++', '++++++++++', '++++kk++++', '++++++++++', '++++m+++++'];
const CAJERA: NpcDef = { id: 'cajera', x: 0, y: 2, look: 'cashier', dir: 'right', script: 'cajera', servesWhenMuted: true };
/** A shop inside: the cashier behind the counter. What it sells is in SHOPS (data/items.ts), by map id. */
export const tienda = (id: string, exit: MapDef['exit'], extra: Partial<MapDef> = {}): MapDef => ({
  id, name: 'Tienda', outdoor: false, floor: '+', rows: TIENDA, exit, npcs: [CAJERA], ...extra,
});
/** A home: whoever lives there, in one of the HOUSES layouts (passed as extra.rows; the classic one by default) or its own. */
export const casa = (id: string, name: string, exit: MapDef['exit'], npcs: NpcDef[], extra: Partial<MapDef> = {}): MapDef => ({
  id, name, outdoor: false, floor: '_', rows: HOUSES.clasica, exit, npcs, ...extra,
});
/**
 * A museum exhibit on a table: its pieces (objects, one per tile from x), and its plaque, read from each of them.
 */
export const exhibit = (x: number, y: number, pieces: string[], es: string, en: string) => ({
  npcs: pieces.map((object, i): NpcDef => ({ id: `${object}_${x + i}_${y}`, x: x + i, y, object })),
  signs: pieces.map((_, i) => ({ x: x + i, y, es, en })),
});
const ESCUELA = ['##L##L##L#', '__________', '__________', '_kk_kk_kk_', '__________', '_kk_kk_kk_', '__________', '____m_____'];
/** A school: the teacher at the front (lessons: world/school.ts) and two students. */
export const escuela = (id: string, exit: MapDef['exit'], teacher: NpcDef, students: NpcDef[], extra: Partial<MapDef> = {}): MapDef => ({
  id, name: 'Escuela', outdoor: false, floor: '_', rows: ESCUELA, exit, npcs: [teacher, ...students], ...extra,
});
/**
 * A night version of a map (a story night scene): the same place drawn dark, with other people. For
 * cutscenes only, so it has no way in or out of its own (no connections, doors, triggers, gates or encounters).
 */
export const night = (m: MapDef, id: string, changes: Partial<MapDef>): MapDef => ({
  ...m, id, night: true, banner: false, connections: undefined, doors: undefined, triggers: undefined, gates: undefined, encounters: undefined, ...changes,
});


/** A lost word of Villa Ocote (region2.ts LOST_WORDS), lying around once the Silenciador breaks. */
export const lostWord = (id: string, x: number, y: number): NpcDef => ({
  id: `palabra_${id}`, x, y, object: 'palabra', script: 'palabraPerdida', show: () => flag('silenciadorRoto') && !flag(`palabra:${id}`),
});

/** A Palacentro inside: the nurse, the healing machine, and whoever else is there. */
export const centro = (id: string, exit: MapDef['exit'], more: NpcDef[] = [], extra: Partial<MapDef> = {}): MapDef => ({
  id,
  name: 'Palacentro',
  outdoor: false,
  floor: 'x',
  rows: CENTRO,
  exit,
  npcs: [{ id: 'enfermera', x: 4, y: 1, look: 'nurse', dir: 'down', script: 'enfermera', servesWhenMuted: true }, MAQUINA, ...more],
  ...extra,
});

/** Every map by id. index.ts fills it from the region files; scripts and gates look maps up here. */
export const MAPS: Record<string, MapDef> = {};

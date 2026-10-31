import type { Dir } from '../../engine/input';
import { flag } from '../../game/state';
import type { MapDef, NpcDef } from './kit';

/*
  Region 6 (plans/cadejos.md), so far only the fog outside the gym 6 city, played as a demo (?demo=niebla).
  The Cerro de la Niebla is one big map, a grid of patches. While the fog lasts, stepping from one patch into the
  next goes wherever the fog walk (world/region6.ts) leads; once it lifts, it's an open route like any other.
  Its roads: the black dog's, the long way up the left side to Tomás's clearing at the top, and the way back, down the
  right side (fixed from the start). Beside the clearing, a meadow where a rare Puercoespín lives.
*/

/** Who is in the fog with you right now: world/region6.ts places the dogs as you walk, and they show by it. */
export const inFog = new Set<string>();

/** The fog lifts once Tomás is home (his grandmother's script). */
const lifted = () => flag('tomasEnCasa');

// ---------- The patches ----------

/** A patch's size in tiles. Every patch opens (when it does) in the middle of a side, through a corridor 3 tiles deep. */
export const PATCH = { w: 18, h: 16 };
/** A patch of the grid: column, row (0, 0 is the top left). */
export type Cell = [c: number, r: number];

/*
  The kinds of patch, every one open on all four sides (the grid closes the sides that lead nowhere), with plenty of
  tall grass. Openings: columns 8-9 at the top and bottom, rows 7-8 at the sides, 3 tiles deep; just inside each
  one, open ground (where the lost trainers stand, beside the way through).
*/
const CRUCE = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII,,,==,,,IIIII',
  'II,,,,,,==,,,,,,II',
  'I,,,,II,==,II,,,,I',
  'I,,,III.==.III,,,I',
  '===,,..====..,,===',
  '===,,..====..,,===',
  'I,,,III.==.III,,,I',
  'I,,,,II,==,II,,,,I',
  'II,,,,,,==,,,,,,II',
  'IIIII,,,==,,,IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];
const PINAR = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII...==,,,IIIII',
  'III,,,..=,,,,,,III',
  'II,,II..=,,::,,,II',
  'I,,,II..==::::,,,I',
  '===,,,.....::.,===',
  '===,,,..II....,===',
  'I,,,,,..II..,,,,,I',
  'I,,,II,.==.,II,,,I',
  'II,,,,,,==,,,,,,II',
  'IIIII,,,==,,,IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];
const LAGUNA = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII,,,==,,,IIIII',
  'II,,,,,====,,,,,II',
  'I,,,,==~~~~==,,,,I',
  'I,,,=~~~~~~~~=,,,I',
  '====~~~~~~~~~~====',
  '====~~~~~~~~~~====',
  'I,,,=~~~~~~~~=,,,I',
  'I,,,,==~~~~==,,,,I',
  'II,,,,,====,,,,,II',
  'IIIII,,,==,,,IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];
const ROCAS = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII::.==.::IIIII',
  'II::::,,==,,::::II',
  'I,,::,,,==,,,::,,I',
  'I,,,,II,==,II,,,,I',
  '===,,II,==,II,,===',
  '===,,,,,==,,,,,===',
  'I,,,,II,==,II,,,,I',
  'I,,::,,,==,,,::,,I',
  'II::::,,==,,::::II',
  'IIIII::.==.::IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];
const PRADO = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII,,,==,,,IIIII',
  'II,,,,,,..,,,,,,II',
  'I,,,,,,,..,,,,,,,I',
  'I,,,,,,*..*,,,,,,I',
  '========..========',
  '===,,,,*..*,,,,===',
  'I,,,,,,,..,,,,,,,I',
  'I,,,,,,,..,,,,,,,I',
  'II,,,,,,..,,,,,,II',
  'IIIII,,,==,,,IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];
/** Tomás's clearing, at the top: two old trees in a ring of flowers, and little grass. */
const CLARO = [
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIII...==...IIIII',
  'II.......=......II',
  'I....**..=..**...I',
  'I...*TT*.=.*TT*..I',
  '===.*..*===*..*===',
  '===..**....**..===',
  'I................I',
  'I.......==.......I',
  'II......==......II',
  'IIIII...==...IIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
  'IIIIIIII==IIIIIIII',
];

// ---------- The mountain ----------

/** The black dog's road, from the trail (bottom middle) the long way up the left side; it leaves you at the last one. */
export const ROAD: Cell[] = [
  [2, 4], [1, 4], [0, 4], [0, 3], [1, 3], [1, 2], [0, 2], [0, 1],
  [0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [2, 3], [3, 3], [3, 2],
];
/** Tomás's clearing, at the top. */
export const CLEARING: Cell = [3, 0];
/** The way back from the clearing down the right side to the trail: fixed from the start, the fog only hides it. */
export const BACK: Cell[] = [[3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4]];
/** The meadow beside the clearing, where a rare Puercoespín lives. */
const MEADOW: Cell = [2, 0];
/** Where the trail comes in (and the bottom of it, out). */
export const ENTRY: Cell = [2, 4];

/** The way from one patch to the next one beside it. */
export const wayTo = ([c1, r1]: Cell, [c2, r2]: Cell): Dir => (c2 < c1 ? 'left' : c2 > c1 ? 'right' : r2 < r1 ? 'up' : 'down');
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];

/** Every pair of neighbors joined by a way through once the fog lifts: the roads, the clearing's, the meadow's. */
const pairs = (cells: Cell[]) => cells.slice(1).map((c, i): [Cell, Cell] => [cells[i], c]);
const JOINED: [Cell, Cell][] = [...pairs(ROAD), ...pairs([[3, 2], [3, 1], CLEARING]), [CLEARING, MEADOW], ...pairs(BACK)];

/** Each patch: its kind, turned around for variety ('h' mirrors it, 'v' flips it upside down). */
const LAYOUT: [string[], string][][] = [
  [[PINAR, ''], [ROCAS, 'h'], [PRADO, ''], [CLARO, ''], [CRUCE, 'v']],
  [[CRUCE, ''], [LAGUNA, ''], [PINAR, 'h'], [ROCAS, ''], [PINAR, 'v']],
  [[ROCAS, ''], [PRADO, ''], [CRUCE, 'h'], [LAGUNA, ''], [ROCAS, 'hv']],
  [[LAGUNA, 'v'], [PINAR, 'hv'], [ROCAS, 'v'], [CRUCE, ''], [PRADO, '']],
  [[PRADO, ''], [CRUCE, 'v'], [CRUCE, ''], [PINAR, ''], [LAGUNA, 'h']],
];

/** One patch's rows: turned as the layout says, its corridors filled with trees where they lead nowhere. */
function patchRows(cell: Cell): string[] {
  const [kind, turn] = LAYOUT[cell[1]][cell[0]];
  let rows = turn.includes('h') ? kind.map((row) => [...row].reverse().join('')) : kind;
  if (turn.includes('v')) rows = [...rows].reverse();
  const open = new Set(JOINED.flatMap(([a, b]) => (same(a, cell) ? [wayTo(a, b)] : same(b, cell) ? [wayTo(b, a)] : [])));
  if (same(cell, ENTRY)) open.add('down');
  const g = rows.map((row) => [...row]);
  const { w, h } = PATCH;
  for (let i = 0; i < 3; i++) {
    for (const k of [0, 1]) {
      if (!open.has('up')) g[i][8 + k] = 'I';
      if (!open.has('down')) g[h - 1 - i][8 + k] = 'I';
      if (!open.has('left')) g[7 + k][i] = 'I';
      if (!open.has('right')) g[7 + k][w - 1 - i] = 'I';
    }
  }
  return g.map((row) => row.join(''));
}

/** Every patch of the grid. */
export const CELLS: Cell[] = LAYOUT.flatMap((line, r) => line.map((_, c): Cell => [c, r]));

/** The whole mountain, patch by patch. */
const MOUNTAIN = LAYOUT.flatMap((line, r) => {
  const patches = line.map((_, c) => patchRows([c, r]));
  return Array.from({ length: PATCH.h }, (_, y) => patches.map((p) => p[y]).join(''));
});

/** A spot in a patch, in the whole map's tiles. */
const at = ([c, r]: Cell, x: number, y: number) => ({ x: c * PATCH.w + x, y: r * PATCH.h + y });

/**
 * A lost trainer just inside a patch's way out, beside it, looking across it: you can't leave that way without being
 * seen.
 */
function besideWayOut(id: string, look: string, cell: Cell, side: Dir): NpcDef {
  const [x, y, dir] = ({ up: [10, 3, 'left'], down: [10, 12, 'left'], left: [3, 9, 'up'], right: [14, 9, 'up'] } as const)[side];
  return { id, ...at(cell, x, y), look, dir, script: id, sight: 2 };
}
const onRoad = (id: string, look: string, i: number) => besideWayOut(id, look, ROAD[i], wayTo(ROAD[i], ROAD[i + 1]));
const onWayBack = (id: string, look: string, i: number) => besideWayOut(id, look, BACK[i], wayTo(BACK[i], BACK[i + 1]));

/** Wild Palabritas in the fog's tall grass: night creatures and ghosts, around level 30 (the user, 2026-10-31). */
const FOG_WILD = [
  { sp: 'murcielon', min: 28, max: 31, w: 30 },
  { sp: 'lamparita', min: 28, max: 31, w: 20 },
  { sp: 'taranton', min: 28, max: 31, w: 20 },
  { sp: 'zopiloton', min: 29, max: 32, w: 15 },
  { sp: 'perezosito', min: 28, max: 30, w: 15 },
];

export const REGION6_MAPS: Record<string, MapDef> = {
  /** Where the trail from the city meets the fog (the demo starts here; one day it joins the gym 6 city). */
  niebla_borde: {
    id: 'niebla_borde',
    name: 'Borde de la niebla',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    fog: 'edge',
    fogLifts: lifted,
    rows: [
      'IIIII==IIIII',
      'IIII,==,IIII',
      'III,,==,,III',
      'II,,.==.,,II',
      'I,,..==..,,I',
      'I,...==...,I',
      'I....==....I',
      'I.S..==....I',
      'I....==....I',
      'I....==....I',
      'I....==....I',
      'IIIIIIIIIIII',
    ],
    triggers: [{ x: 5, y: 0, script: 'nieblaEntrar' }, { x: 6, y: 0, script: 'nieblaEntrar' }],
    signs: [{ x: 2, y: 7, es: '¡Cuidado! Niebla espesa. No te salgas del camino.', en: 'Careful! Thick fog. Don’t leave the path.' }],
    npcs: [
      { id: 'abuela_niebla', x: 7, y: 8, look: 'granny', dir: 'left', script: 'abuela_niebla' },
      { id: 'tomas_casa', x: 8, y: 8, look: 'tomas', dir: 'left', script: 'tomasSigue', show: () => flag('tomasEnCasa') },
      { id: 'don_lencho', x: 2, y: 9, look: 'abuelo', dir: 'right', script: 'don_lencho' },
      { id: 'cadeblanco_borde', x: 6, y: 3, look: 'cadeblanco', dir: 'down', script: 'cadeblancoBorde', glow: 'body', show: () => flag('nieblaSalida') && !flag('cadeblancoAcariciado') },
    ],
  },
  cerro_niebla: {
    id: 'cerro_niebla',
    name: 'Cerro de la Niebla',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    fog: 'patch',
    fogPatch: [PATCH.w, PATCH.h],
    fogLifts: lifted,
    wakeUp: 'despertarNiebla',
    rows: MOUNTAIN,
    encounters: { rate: 0.11, table: FOG_WILD },
    encounterZones: [{ ...at(MEADOW, 0, 0), w: PATCH.w, h: PATCH.h, table: [...FOG_WILD, { sp: 'puercoespin', min: 30, max: 32, w: 12 }] }],
    npcs: [
      // The dogs: placed by the fog walk wherever they wait (they start at the trail).
      { id: 'cadenegro', ...at(ENTRY, 8, 7), look: 'cadenegro', dir: 'down', script: 'cadenegro', near: 3, glow: 'eyes', show: () => inFog.has('cadenegro') },
      { id: 'cadeblanco', ...at(ENTRY, 9, 7), look: 'cadeblanco', dir: 'down', script: 'cadeblanco', near: 3, glow: 'body', show: () => inFog.has('cadeblanco') },
      { id: 'tomas_niebla', ...at(CLEARING, 5, 7), look: 'tomas', dir: 'down', script: 'tomasNiebla', show: () => !flag('tomasHallado') },
      // Lost in the fog: seven on the black dog's road, three on the way back.
      onRoad('campista_lorena', 'campista', 1),
      onRoad('excursionista_rodrigo', 'hiker', 3),
      onRoad('lenador_abel', 'lenador', 5),
      onRoad('espeleologo_ismael', 'espeleologo', 7),
      onRoad('observadora_marta', 'ornitologa', 9),
      onRoad('cafetalero_julio', 'campesino', 11),
      onRoad('ciclista_kevin', 'ciclista', 13),
      onWayBack('guardaparque_elena', 'guardaparque', 1),
      onWayBack('musico_rafa', 'musico', 3),
      onWayBack('turista_paola', 'tourist', 6),
    ],
  },
};

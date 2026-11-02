import type { Dir } from '../../engine/input';
import { G, flag } from '../../game/state';
import { casa, centro, tienda, itemBall, HOUSES, MOUNTAIN_FISHING, type MapDef, type NpcDef } from './kit';

/*
  Region 6 (plans/cadejos.md): the cool cloud-forest mountains north of Ruta 4. Past the thin tree at the top of
  Ruta 4 (Cut, after the 5th medal), Ruta 10 climbs through the pines to Villa Bruma, the town in the clouds (gym 6,
  Psíquico). North of the town, a trail leads to the Cerro de la Niebla, where Doña Rosa's grandson is lost.
  The Cerro is one big map, a grid of patches. While the fog lasts, stepping from one patch into the
  next goes wherever the fog walk (world/region6.ts) leads; once it lifts, it's an open route like any other.
  Its roads: the black dog's, the long way up the left side to Tomás's clearing at the top, and the way back, down the
  right side (fixed from the start). Beside the clearing, a meadow where a rare Puercoespín lives.
  The fog demo (?demo=niebla) starts on the trail.
*/

/** The gym 6 town. */
export const TOWN6 = 'Villa Bruma';

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
  { sp: 'murcielon', min: 22, max: 31, w: 20 },
  { sp: 'ecolin', min: 18, max: 23, w: 12 },
  { sp: 'lamparita', min: 22, max: 31, w: 20 },
  { sp: 'taranton', min: 24, max: 31, w: 12 },
  { sp: 'ochopatas', min: 20, max: 24, w: 8 },
  { sp: 'zopiloton', min: 28, max: 32, w: 8 },
  { sp: 'zopilotito', min: 21, max: 27, w: 8 },
  { sp: 'perezosito', min: 21, max: 30, w: 15 },
];

/**
 * Doña Rosa and Tomás once he's home: they wait on the trail until the fog lifts, then walk home (world/region6.ts),
 * into their house in the town. In the demo they stay on the trail.
 */
const rosaHome = () => flag('rosaEnCasa');

/** Wild Palabritas on Ruta 10: the cloud forest's squirrels, hummingbirds, moths, tree frogs and deer. */
const RUTA10_WILD = [
  { sp: 'ardillita', min: 16, max: 20, w: 12 },
  { sp: 'ardillon', min: 20, max: 29, w: 15 },
  { sp: 'colibri', min: 17, max: 22, w: 12 },
  { sp: 'zumbador', min: 22, max: 29, w: 8 },
  { sp: 'mariposita', min: 20, max: 28, w: 20 },
  { sp: 'ranojito', min: 20, max: 29, w: 20 },
  { sp: 'venadito', min: 20, max: 28, w: 15 },
];
/** Above the stream, nearer the clouds: a little stronger, and the sloths. */
const RUTA10_HIGH = [
  { sp: 'ardillita', min: 18, max: 21, w: 8 },
  { sp: 'ardillon', min: 22, max: 32, w: 15 },
  { sp: 'colibri', min: 19, max: 22, w: 8 },
  { sp: 'zumbador', min: 22, max: 32, w: 12 },
  { sp: 'mariposita', min: 22, max: 31, w: 15 },
  { sp: 'ranojito', min: 22, max: 31, w: 15 },
  { sp: 'ranojon', min: 33, max: 34, w: 2 },
  { sp: 'perezosito', min: 22, max: 31, w: 15 },
  { sp: 'venadito', min: 21, max: 30, w: 10 },
  { sp: 'torovenado', min: 30, max: 32, w: 3 },
];

export const REGION6_MAPS: Record<string, MapDef> = {
  // Ruta 10 (id ruta11: the routes after the cave are shown one lower, CLAUDE.md): from the thin tree at the top of
  // Ruta 4, a long climb through the pines in switchbacks: east, up, west past a coffee garden, up over a mountain
  // stream, east along the ridge (a rocky lookout off its end), and back west to Villa Bruma. A ledge hops from the
  // coffee terrace back down to the first meadow. Above the stream the wild Palabritas are a little stronger.
  ruta11: {
    id: 'ruta11',
    name: 'Ruta 10',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    at: { map: 'ruta5', x: 66, y: -54 },
    connections: { up: { to: 'bruma', offset: 2 } },
    rows: [
      'IIIIIIIIIIIII==IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIII==IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIII==...........,,,,,IIIIIIIIIIIIIII',
      'IIIIIIIIIIII.==.,,,,,,,,..,,,,,,,IIIIIIIIIIIII',
      'IIIIIIIIIIII.==.,,,,,,,,..,,,,,,,IIIIIIIIIIIII',
      'IIIIIIIIIIII.==.,,,,,,,,.........I^^^:::::^^II',
      'IIIIIIIIIIII.==.,,,,,,,,.........I^^^:::::^^II',
      'IIIIIIIIIIII*==..........*.......I^^^:::::^^II',
      'IIIIIIIIIIII.==================..I^^^:::::^^II',
      'IIIIIIIIIIIIIIIIIIIIIIIIIIIII.=..I^^^:::::::II',
      'IIIIIIIIIIIIIIIIIIIIIIIIIIIII.=..I::::::::::II',
      'IIIIIIIIIIIIIIIIIIIIIIIIIIIII.=..I::::::::::II',
      'IIIII.........,,,,,,,,,,,.....=...::::::^^^^II',
      'IIII..........,,,,,,,,,,,.....=...::::::^^^^II',
      'III...........................=...::::::^^^^II',
      'III....========================...::::::^^^^II',
      'III......................,,,,,....^^:::^^^^^II',
      'III......................,,,,,....IIIIIIIIIIII',
      'III....==....IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'III....==.,,,I.,,,,,,,......IIIIIIIIIIIIIIIIII',
      'III....==.,,,..,,,,,,,.......IIIIIIIIIIIIIIIII',
      'III....==.,,,................IIIIIIIIIIIIIIIII',
      'III....==.,,,................IIIIIIIIIIIIIIIII',
      '~~~~~~~HH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~HH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      'III,,,,==................IIIIIIIIIIIIIIIIIIIII',
      'III,,,,==....,,,,,,,,,,,,IIIIIIIIIIIIIIIIIIIII',
      'III,,,,==....,,,,,,,,,,,,IIIIIIIIIIIIIIIIIIIII',
      'III,,,,==....,,,,,,,,,,,IIIIIIIIIIIIIIIIIIIIII',
      'III....==....IIIIfffffffffffffIIIIIIIIIIIIIIII',
      'IIII,,,==........fTTTTTTTTTTTf.,,,,.....IIIIII',
      'IIII,,,==........f...........f.,,,,.......IIII',
      'IIII...==........fff.fffffffff.,,,,.......IIII',
      'IIII...==.................................IIII',
      'IIII...==============================.....IIII',
      'IIIII...............................=.....IIII',
      'IIIII......IIIIIIIIIIIIIIIIIIIIIII..=.....IIII',
      'IIIIIvvvvvvIIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIII,,,,,,IIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIII,,,,,,IIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIII,,,,,,IIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIII,,,,,,IIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIIII,,,,.IIIIIIIIIIIIIIIIIIIIIII..=,,,,,IIII',
      'IIIII......................IIIIIII..=.....IIII',
      'IIIII.,,,,,,........................=...IIIIII',
      'IIIII.,,,,,,........................=....IIIII',
      'IIIII.,,,,,,..==============........=....IIIII',
      'IIIII.,,,,,,..=....,,,,,,,,...,,,,.......IIIII',
      'IIIII.,,,,,,..=.S..,,,,,,,,...,,,,.......*IIII',
      'IIIII*........=....,,,,,,,,.IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIII=IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIII=IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIII=IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIII=IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    ],
    encounters: { rate: 0.12, table: RUTA10_WILD },
    fishing: { table: MOUNTAIN_FISHING },
    encounterZones: [{ x: 0, y: 0, w: 46, h: 23, table: RUTA10_HIGH }],
    signs: [{ x: 16, y: 48, es: `RUTA 10. Al norte: ${TOWN6}, el pueblo entre las nubes.`, en: `ROUTE 10. North: ${TOWN6}, the town in the clouds.` }],
    npcs: [
      { id: 'campista_noemi', x: 20, y: 44, look: 'campista', dir: 'down', script: 'campista_noemi', sight: 2 },
      { id: 'excursionista_diego', x: 34, y: 40, look: 'hiker', dir: 'right', script: 'excursionista_diego', sight: 2 },
      { id: 'cafetalero_ramiro', x: 28, y: 35, look: 'campesino', dir: 'up', script: 'cafetalero_ramiro', sight: 2 },
      { id: 'recolector_wilber', x: 20, y: 31, look: 'cortador', dir: 'down', script: 'recolector_wilber', sight: 3 },
      { id: 'lenador_mauro', x: 5, y: 29, look: 'lenador', dir: 'right', script: 'lenador_mauro', sight: 3 },
      { id: 'pescador_beto', x: 16, y: 22, look: 'fisher', dir: 'left', script: 'pescador_beto', sight: 3 },
      { id: 'guardaparque_sonia', x: 20, y: 17, look: 'guardaparque', dir: 'up', script: 'guardaparque_sonia', sight: 2 },
      { id: 'exploradora_vicky', x: 38, y: 11, look: 'exploradora', dir: 'left', script: 'exploradora_vicky', sight: 3 },
      { id: 'ornitologa_celia', x: 24, y: 6, look: 'ornitologa', dir: 'down', script: 'ornitologa_celia', sight: 2 },
      { id: 'pintora_gaby', x: 12, y: 5, look: 'painter', dir: 'right', script: 'pintora_gaby', sight: 2 },
      itemBall('ruta11_superbola', 5, 38, 'superbola'),
      itemBall('ruta11_superpocion', 27, 21, 'superpocion'),
      itemBall('ruta11_revivir', 40, 6, 'revivir'),
    ],
  },
  // Villa Bruma (gym 6): a coffee town of wooden houses in the cloud forest, misty most mornings, with a little
  // coffee garden by the shop. The trail north leads to the Cerro de la Niebla.
  bruma: {
    id: 'bruma',
    name: TOWN6,
    outdoor: true,
    floor: '.',
    ground: 'town',
    roof: 'brown',
    style: { trees: 'pine' },
    connections: { down: { to: 'ruta11', offset: -2 }, up: { to: 'niebla_borde', offset: -10 } },
    rows: [
      'IIIIIIIIIIIIIII==IIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIII==IIIIIIIIIIIIIII',
      'II...*.........==.........*...II',
      'II.pppppp......==.....rrrrr...II',
      'II.pppppp......==.....rrrrr...II',
      'II.hwGwwh......==.....hwwwh...II',
      'II.hhdhhh......==.....hwdwh...II',
      'II.**..........==..........**.II',
      'II........============........II',
      'II...S....=====FF=====....S...II',
      'II.ooooo..=====FF=====rrrrffffII',
      'II.ooooo..============rrrrfTTfII',
      'II.hwcwh....==....==..hwMhfTTfII',
      'II.hwdwh....==....==..hwdhffffII',
      'II.*..I.....==....==.....I..*.II',
      'II.rrrr.II..==....==II.rrrrr..II',
      'II.rrrr.II..==....==II.rrrrr..II',
      'II.hwwh.....==....==...hwwwh..II',
      'II.hwdh.....========...hwdwh..II',
      'II...*.........==.........*...II',
      'IIIIIIIIIIIIIII==IIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIII==IIIIIIIIIIIIIII',
    ],
    signs: [
      { x: 5, y: 9, es: `${TOWN6.toUpperCase()}. El pueblo entre las nubes.`, en: `${TOWN6.toUpperCase()}. The town in the clouds.` },
      { x: 26, y: 9, es: 'Al norte: el sendero al Cerro de la Niebla. ¡No subas cuando hay niebla!', en: 'North: the trail to the Cerro de la Niebla. Don’t climb when it’s foggy!' },
    ],
    doors: [
      { x: 5, y: 13, to: 'centro_bruma', tx: 4, ty: 7 },
      { x: 24, y: 13, to: 'tienda_bruma', tx: 4, ty: 6 },
      { x: 24, y: 6, to: 'casa_rosa', tx: 4, ty: 6 },
      { x: 5, y: 18, to: 'casa_bruma2', tx: 4, ty: 6 },
      { x: 25, y: 18, to: 'casa_bruma3', tx: 4, ty: 6 },
    ],
    // The gym is closed until its Psíquico Palabritas are ready (plans/cadejos.md).
    triggers: [{ x: 5, y: 6, script: 'gimnasioBruma' }],
    npcs: [
      { id: 'vecina_bruma', x: 9, y: 14, look: 'lady', dir: 'down', script: 'vecina_bruma', wanders: true },
      { id: 'cafetalero_bruma', x: 22, y: 8, look: 'campesino', dir: 'down', script: 'cafetalero_bruma', turns: true },
      { id: 'nino_bruma', x: 7, y: 7, look: 'boy', dir: 'left', script: 'nino_bruma', turns: true },
      { id: 'guia_bruma', x: 17, y: 3, look: 'hiker', dir: 'left', script: 'guia_bruma' },
    ],
  },
  centro_bruma: centro('centro_bruma', { to: 'bruma', x: 5, y: 14 }, [{ id: 'viajero_bruma', x: 1, y: 5, look: 'tourist', dir: 'right', script: 'viajero_bruma' }]),
  tienda_bruma: tienda('tienda_bruma', { to: 'bruma', x: 24, y: 14 }),
  // Doña Rosa's house: Tomás's photo on the table; the two of them, once he's home.
  casa_rosa: casa('casa_rosa', 'Casa de Doña Rosa', { to: 'bruma', x: 24, y: 7 }, [
    { id: 'abuela_casa', x: 5, y: 2, look: 'granny', dir: 'down', script: 'abuela_niebla', show: rosaHome },
    { id: 'tomas_en_casa', x: 4, y: 3, look: 'tomas', dir: 'down', script: 'tomasSigue', show: rosaHome },
  ], {
    rows: HOUSES.familia,
    signs: [{ x: 2, y: 4, es: 'Una foto: un niño con gorra anaranjada sonríe junto a su abuela.', en: 'A photo: a boy in an orange cap smiles beside his grandma.' }],
  }),
  casa_bruma2: casa('casa_bruma2', 'Casa', { to: 'bruma', x: 5, y: 19 }, [{ id: 'cafetalera_bruma', x: 1, y: 1, look: 'lady', dir: 'up', script: 'cafetalera_bruma', turns: true }], { rows: HOUSES.cocina }),
  casa_bruma3: casa('casa_bruma3', 'Casa', { to: 'bruma', x: 25, y: 19 }, [{ id: 'abuelo_bruma', x: 3, y: 2, look: 'abuelo', dir: 'down', script: 'abuelo_bruma' }], { rows: HOUSES.hamaca }),

  /** Where the trail from the town meets the fog (the demo starts here). */
  niebla_borde: {
    id: 'niebla_borde',
    name: 'Borde de la niebla',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    fog: 'edge',
    fogLifts: lifted,
    connections: { down: { to: 'bruma', offset: 10 } },
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
      'IIIII==IIIII',
    ],
    triggers: [
      { x: 5, y: 0, script: 'nieblaEntrar' },
      { x: 6, y: 0, script: 'nieblaEntrar' },
      { x: 5, y: 11, script: 'bordeSalida' },
      { x: 6, y: 11, script: 'bordeSalida' },
    ],
    signs: [{ x: 2, y: 7, es: '¡Cuidado! Niebla espesa. No te salgas del camino.', en: 'Careful! Thick fog. Don’t leave the path.' }],
    npcs: [
      { id: 'abuela_niebla', x: 7, y: 8, look: 'granny', dir: 'left', script: 'abuela_niebla', show: () => G.demo || !rosaHome() },
      { id: 'tomas_casa', x: 8, y: 8, look: 'tomas', dir: 'left', script: 'tomasSigue', show: () => flag('tomasEnCasa') && (G.demo || !rosaHome()) },
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
    resume: 'nieblaReanudar',
    rows: MOUNTAIN,
    encounters: { rate: 0.11, table: FOG_WILD },
    fishing: { table: MOUNTAIN_FISHING },
    encounterZones: [{ ...at(MEADOW, 0, 0), w: PATCH.w, h: PATCH.h, table: [...FOG_WILD, { sp: 'puercoespin', min: 22, max: 32, w: 12 }] }],
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

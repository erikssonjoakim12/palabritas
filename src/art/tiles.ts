import { makeCanvas, type Img } from './pixel';
import { ART, ROCK_EDGES, type TileArt } from '../style/tiles';
import { ROOFS, OUTDOOR, CAVE_STYLES, CANOPY, type Pal, ACCENT } from '../style/colors';
import type { Dir } from '../engine/input';

/*
  Turns the tile art in style/tiles.ts into images, per map:
  - ground looks different in towns (pale, dotted) and on routes (green),
  - roofs take the town's color,
  - roofs, walls, tables, counters and rugs get outlines where the neighbor differs.
  Gameplay properties (solid, tall grass, doors...) are in TILES below.
*/

/** How a map's shared tiles look. All optional; the defaults are the original look. */
export interface MapStyle {
  /** 'T': green/dry mix (default) | mostly pines | mostly dry trees | rainforest. */
  trees?: 'lowland' | 'pine' | 'dry' | 'jungle';
  /** Walls (h, w, d...): cream (default) | warm ochre adobe. */
  walls?: 'plain' | 'adobe';
  /** '^' and 'O': tan rock (default) | black volcanic rock. */
  rock?: 'rock' | 'basalt';
  /** '%', ';', 'e' in caves: brown (default) | red clay | black basalt | the temple's carved stone. */
  cave?: 'cave' | 'clay' | 'basalt' | 'temple';
  /** A dense canopy overhead (the jungle): every tile darker. */
  canopy?: boolean;
}

/** What drawing a whole map needs (a MapDef has all of this). */
export interface MapLook {
  rows: string[];
  outdoor: boolean;
  floor: string;
  ground?: 'town' | 'grass' | 'sand' | 'ash';
  roof?: string;
  style?: MapStyle;
  /** The tile all around the map's edges (default: trees outdoors, nothing indoors). */
  border?: string;
}

export type TileKind = 'tallgrass' | 'door' | 'mat' | 'counter' | 'water';

export interface TileDef {
  solid: boolean;
  kind?: TileKind;
  /** A ledge: you hop over it when walking this way (from the high side); otherwise it's solid. */
  ledge?: Dir;
  /** A water current: it carries you this way until you land on something else. */
  current?: Dir;
  /** Text shown when you press A facing this tile. */
  look?: { es: string; en: string };
  /** A script run when you press A facing this tile (instead of `look`). */
  script?: string;
}

/** What a tile needs to know about the map it's in, and where it is. */
export interface TileEnv extends MapLook {
  x: number;
  y: number;
  /** Animated tiles (ANIMATED): which of their two frames. */
  frame?: number;
}

/**
 * Tiles with a second frame, swapped by the world now and then: water ripples (and its foam rolls in at beaches),
 * lava churns, flowers sway, waterfalls fall, steam puffs up, currents flow their way.
 */
export const ANIMATED = new Set(['~', 'j', '*', '!', 'X', '8', '2', '4', '6']);

/** A tile's rows moved by (dx, dy) pixels, wrapping around (the patterns repeat, so it's seamless). */
const shift = (rows: string[], dx: number, dy: number) =>
  rows.map((_, y) => {
    const r = rows[(y - dy + rows.length) % rows.length];
    return r.slice(r.length - dx) + r.slice(0, r.length - dx);
  });
/** An animated tile's art for its frame: frame 1 is the pattern moved a little. */
const framed = (art: TileArt, env: TileEnv, dx: number, dy: number): TileArt => (env.frame ? { ...art, rows: shift(art.rows, dx, dy) } : art);

const solid = (extra: Partial<TileDef> = {}): TileDef => ({ solid: true, ...extra });
const open = (extra: Partial<TileDef> = {}): TileDef => ({ solid: false, ...extra });

export const TILES: Record<string, TileDef> = {
  '.': open(),
  g: open(),
  ',': open({ kind: 'tallgrass' }),
  '=': open(),
  '*': open(),
  T: solid(),
  t: solid(),
  I: solid(),
  J: solid(),
  '>': solid({ ledge: 'right' }),
  v: solid({ ledge: 'down' }),
  Y: solid({ look: { es: '¡Un limonero! Huele muy bien.', en: 'A lemon tree! It smells very nice.' } }),
  '~': solid({ kind: 'water' }),
  f: solid(),
  S: solid(),
  r: solid(),
  b: solid(),
  o: solid(),
  p: solid(),
  h: solid(),
  w: solid(),
  c: solid({ look: { es: 'PALACENTRO. ¡Curamos a tus Palabritas gratis!', en: 'PALACENTRO. We heal your Palabritas for free!' } }),
  G: solid({ look: { es: 'GIMNASIO. ¡Solo para entrenadores valientes!', en: 'GYM. Only for brave trainers!' } }),
  a: solid({ look: { es: 'PANADERÍA DON PEPE. ¡Pan recién hecho todos los días!', en: 'DON PEPE’S BAKERY. Fresh bread every day!' } }),
  M: solid({ look: { es: 'TIENDA. Palabolas y pociones para tu aventura.', en: 'SHOP. Palabolas and potions for your adventure.' } }),
  d: open({ kind: 'door' }),
  _: open(),
  '+': open(),
  x: open(),
  '#': solid(),
  k: solid(),
  B: solid({ look: { es: 'Es tu cama. ¡Qué suave!', en: "It's your bed. So soft!" } }),
  L: solid({ look: { es: 'Hay muchos libros en español.', en: 'There are lots of books in Spanish.' } }),
  P: solid(),
  V: solid({ look: { es: 'En la tele dan una telenovela. «¡Te amo, Fernando!»', en: 'A soap opera is on TV. "I love you, Fernando!"' } }),
  C: solid({ kind: 'counter' }),
  Q: solid({ script: 'computer', look: { es: 'Es una computadora. En la pantalla dice: «¡Bienvenidos al Palacentro!»', en: 'It’s a computer. The screen says: "Welcome to the Palacentro!"' } }),
  n: solid({ look: { es: 'Un sofá muy cómodo para esperar.', en: 'A very comfy sofa for waiting.' } }),
  u: solid({ look: { es: 'Un póster: «¡Lávate las manos!»', en: 'A poster: "Wash your hands!"' } }),
  m: open({ kind: 'mat' }),
  '^': solid(),
  ':': open(),
  O: open({ kind: 'door' }),
  '%': solid(),
  ';': open(),
  e: open({ kind: 'mat' }),
  D: open({ kind: 'door' }),
  Z: open({ kind: 'door' }),
  // Water currents, by numpad direction: 8 up, 2 down, 4 left, 6 right.
  '8': open({ current: 'up' }),
  '2': open({ current: 'down' }),
  '4': open({ current: 'left' }),
  '6': open({ current: 'right' }),
  H: open(),
  F: solid({ look: { es: 'Una fuente. El agua suena muy bonito.', en: 'A fountain. The water sounds lovely.' } }),
  U: solid({ look: { es: 'Ollas, jarras y tinajas de barro.', en: 'Clay pots, jugs and water jars.' } }),
  K: open(),
  s: open(),
  y: solid({ look: { es: 'Un cactus. ¡No lo toques, pica!', en: 'A cactus. Don’t touch it, it’s prickly!' } }),
  z: open({ kind: 'tallgrass' }),
  i: open(),
  j: solid({ look: { es: '¡Lava! Está muy caliente. ¡No te acerques!', en: 'Lava! It’s very hot. Don’t get close!' } }),
  '[': solid({ look: { es: 'Piedras talladas, muy antiguas. Tienen musgo.', en: 'Carved stones, very old. They’re covered in moss.' } }),
  ']': solid({ look: { es: 'Una escalera de piedra, muy empinada.', en: 'A stone stairway, very steep.' } }),
  '(': open({ kind: 'door' }),
  '!': solid({ look: { es: 'Una cascada enorme. Tal vez algún día puedas subirla...', en: 'A huge waterfall. Maybe one day you can climb it...' } }),
  E: solid({ look: { es: 'Una roca negra con muchos huequitos. ¡Viene del volcán!', en: 'A black rock full of little holes. It comes from the volcano!' } }),
  X: solid({ look: { es: 'Sale vapor caliente de la tierra. ¡Huele a azufre!', en: 'Hot steam comes out of the ground. It smells like sulfur!' } }),
  '|': open({ kind: 'tallgrass' }),
  l: open(),
  q: solid(),
  N: solid({ look: { es: 'El campanario de la iglesia. ¡Las campanas suenan los domingos!', en: 'The church bell tower. The bells ring on Sundays!' } }),
  A: solid({ look: { es: 'El faro. De noche, su luz guía a los barcos.', en: 'The lighthouse. At night, its light guides the boats.' } }),
  W: solid(),
  R: open(),
  ' ': solid(),
};

// ---------- Painting ----------

type Grid = string[][];
const grid = (rows: string[]): Grid => rows.map((r) => [...r]);

function paint(g: Grid, pal: Pal, extra: Record<string, string> = {}): Img {
  const c = makeCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  g.forEach((row, y) =>
    row.forEach((ch, x) => {
      const col = ch >= '0' && ch <= '3' ? pal[+ch] : extra[ch];
      if (!col || ch === '.') return;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }),
  );
  return c;
}

function paintArt(art: TileArt, g: Grid = grid(art.rows), roof = 'red'): Img {
  const pal = art.pal === 'roof' ? ROOFS[roof] ?? ROOFS.red : art.pal;
  return paint(g, pal, art.extra);
}

function stack(...layers: Img[]): Img {
  const c = makeCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  for (const l of layers) ctx.drawImage(l, 0, 0);
  return c;
}

const setRow = (g: Grid, y: number, ch: string) => g[y].fill(ch);
/** Turn a 16×16 grid clockwise, `times` quarter turns. */
function turn(g: Grid, times: number): Grid {
  for (let t = 0; t < times; t++) g = g.map((row, y) => row.map((_, x) => g[15 - x][y]));
  return g;
}
const setCol = (g: Grid, x: number, ch: string) => g.forEach((row) => (row[x] = ch));

// ---------- Neighbors ----------

const ROOF_CHARS = 'rbopq';
const WALL_CHARS = 'hwdcGaM';
const roofKey = (ch: string) => (ch === 'b' ? 'r' : ch);

function neighbors(env: TileEnv) {
  const at = (dx: number, dy: number) => tileOf(env, env.x + dx, env.y + dy);
  return { n: at(0, -1), s: at(0, 1), w: at(-1, 0), e: at(1, 0) };
}

function groundArt(env: TileEnv, ch: '.' | '='): TileArt {
  // Like Johto, paths are the same pale dotted ground as towns.
  if (ch === '=' || env.ground === 'town') return ART.townGround;
  return env.ground === 'sand' ? ART.sand : env.ground === 'ash' ? ART.ash : ART.grassGround;
}

/** The same art in another palette (map styles: adobe walls, basalt rock, clay caves). */
const withPal = (art: TileArt, pal?: Pal): TileArt => (pal ? { ...art, pal } : art);
const wallArt = (env: TileEnv) => withPal(ART.wall, env.style?.walls === 'adobe' ? OUTDOOR.adobe : undefined);
const rockArt = (env: TileEnv, art: TileArt = ART.rock) => withPal(art, env.style?.rock === 'basalt' ? OUTDOOR.basalt : undefined);
/** Ledges in the map's ground colors: green on routes, gray on the volcano's ash. */
const ledgeArt = (env: TileEnv, art: TileArt) => withPal(art, env.ground === 'ash' ? OUTDOOR.ash : undefined);
const caveArt = (env: TileEnv, part: 'wall' | 'floor', art: TileArt) => withPal(art, CAVE_STYLES[env.style?.cave ?? '']?.[part]);
/** Cave floors are pebbles; the temple's are flagstones. */
const caveFloorArt = (env: TileEnv) => (env.style?.cave === 'temple' ? ART.templeFloor : ART.caveFloor);

function underImage(env: TileEnv, under: 'ground' | 'floor' | 'auto'): Img {
  if (under === 'ground') return paintArt(groundArt(env, '.'));
  const floorCh = under === 'auto' && (env.y === 0 || neighbors(env).n === '#') ? '#' : env.floor;
  return tileImage(floorCh, { ...env, y: Math.max(1, env.y) });
}

function roofImage(ch: string, env: TileEnv): Img {
  const nb = neighbors(env);
  const same = (c: string) => ROOF_CHARS.includes(c) && roofKey(c) === roofKey(ch);
  const g = grid(ART.roof.rows);
  if (!same(nb.n)) (setRow(g, 0, '3'), setRow(g, 1, '0'));
  if (!same(nb.s)) (setRow(g, 13, '3'), setRow(g, 14, '0'), setRow(g, 15, '3'));
  if (!same(nb.w)) (setCol(g, 0, '3'), g.forEach((r, y) => y > 1 && y < 13 && (r[1] = '0')));
  if (!same(nb.e)) (setCol(g, 15, '3'), g.forEach((r, y) => y > 1 && y < 13 && (r[14] = '2')));
  const color = ch === 'o' ? 'red' : ch === 'p' ? 'purple' : ch === 'q' ? 'cream' : env.roof ?? 'red';
  return paintArt(ART.roof, g, color);
}

function wallImage(env: TileEnv): Img {
  const nb = neighbors(env);
  const isWall = (c: string) => WALL_CHARS.includes(c);
  const g = grid(ART.wall.rows);
  // Brown pillars at the sides and a brown base, outlined (like New Bark Town houses).
  if (!isWall(nb.s)) (setRow(g, 12, '0'), setRow(g, 13, '2'), setRow(g, 14, '2'), setRow(g, 15, '3'));
  if (!isWall(nb.w)) (setCol(g, 0, '3'), setCol(g, 1, '2'), setCol(g, 2, '2'), setCol(g, 3, '0'));
  if (!isWall(nb.e)) (setCol(g, 15, '3'), setCol(g, 14, '2'), setCol(g, 13, '2'), setCol(g, 12, '0'));
  return paintArt(wallArt(env), g);
}

/** Rock (mountains, cave walls): outlined where it ends, with a cliff face on the south side. */
function rockImage(art: TileArt, env: TileEnv, rockChars: string, under: Img): Img {
  const nb = neighbors(env);
  const isRock = (c: string) => rockChars.includes(c);
  const g = grid(art.rows);
  /** Put an edge pattern on the rows from y0 and columns from x0 ('-' keeps the rock; it repeats). */
  const edge = (rows: string[], x0: number, y0: number, w: number, h: number) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const c = rows[y % rows.length][x % rows[0].length];
        if (c !== '-') g[y0 + y][x0 + x] = c;
      }
  };
  const E = ROCK_EDGES;
  if (!isRock(nb.n)) edge(E.n, 0, 0, 16, E.n.length);
  if (!isRock(nb.s)) edge(E.s, 0, 16 - E.s.length, 16, E.s.length);
  if (!isRock(nb.w)) edge(E.w, 0, 0, E.w[0].length, 16);
  if (!isRock(nb.e)) edge(E.e, 16 - E.e[0].length, 0, E.e[0].length, 16);
  return stack(under, paintArt(art, g));
}
const MOUNTAIN_CHARS = '^OD';

/**
 * A tunnel mouth you walk south into ('D', Ruta 5's way back into the cave): the cave mouth turned 180°
 * and half as tall, so its dark opening meets the ground north of it.
 */
const TUNNEL_MOUTH: TileArt = {
  ...ART.caveMouth,
  rows: [15, 12, 9, 7, 5, 4, 3].map((y) => ART.caveMouth.rows[y]).concat(Array(9).fill('.'.repeat(16))),
};

/** What a lone plant (palm, cactus) stands on: the ground beside it (sand on a beach, the track in a meadow). */
function groundUnder(env: TileEnv): Img {
  const nb = neighbors(env);
  const beside = [nb.s, nb.w, nb.e, nb.n].find((c) => !!c && '.:s=i'.includes(c));
  return beside ? tileImage(beside, env) : underImage(env, 'ground');
}

/** Water, with a line of foam where it meets a beach (sand on that side). */
function waterImage(env: TileEnv): Img {
  const nb = neighbors(env);
  const sandy = (c: string) => c === 's' || (c === '.' && env.ground === 'sand');
  const water = framed(ART.water, env, 2, 0);
  const falls = nb.n === '!';
  if (![nb.n, nb.s, nb.w, nb.e].some(sandy) && !falls) return paintArt(water);
  const g = grid(water.rows);
  const foam = (x: number, y: number) => (g[y][x] = (x + y) % 3 ? 'f' : '0');
  // At a beach the foam rolls in and out: one row deeper on frame 1.
  const d = env.frame ? 1 : 0;
  for (let i = 0; i < 16; i++) {
    for (let k = 0; k <= d; k++) {
      if (sandy(nb.n)) foam(i, k);
      if (sandy(nb.s)) foam(i, 15 - k);
      if (sandy(nb.w)) foam(k, i);
      if (sandy(nb.e)) foam(15 - k, i);
    }
    if (i % 2) continue;
    if (sandy(nb.n)) foam(i, d + 1);
    if (sandy(nb.s)) foam(i, 14 - d);
    if (sandy(nb.w)) foam(d + 1, i);
    if (sandy(nb.e)) foam(14 - d, i);
  }
  // Under a waterfall: spray where it hits the water, jumping between frames.
  if (falls) for (const [x, y] of env.frame ? [[1, 1], [4, 0], [6, 2], [9, 1], [12, 0], [14, 2], [3, 4], [11, 4]] : [[2, 0], [5, 2], [7, 0], [10, 2], [13, 1], [0, 3], [8, 4], [15, 4]]) g[y][x] = 'f';
  return paintArt({ ...ART.water, extra: { f: ACCENT.foam } }, g);
}

/** Bridges and piers: planks across the way you walk, with rails where the bridge ends at the sides. */
function bridgeImage(env: TileEnv): Img {
  const nb = neighbors(env);
  const goesOn = (c: string) => c === 'H' || !TILES[c]?.solid;
  const g = grid(ART.bridge.rows);
  if (goesOn(nb.w) || goesOn(nb.e)) {
    // You walk east-west: the planks run north-south, with rails along the top and bottom.
    if (nb.n !== 'H') (setRow(g, 0, '3'), setRow(g, 1, '0'));
    if (nb.s !== 'H') (setRow(g, 14, '2'), setRow(g, 15, '3'));
  } else {
    // You walk north-south: turn the planks, with rails on the left and right.
    g.forEach((row, y) => row.fill(y % 4 === 3 ? '2' : '1'));
    if (nb.w !== 'H') (setCol(g, 0, '3'), setCol(g, 1, '0'));
    if (nb.e !== 'H') (setCol(g, 14, '2'), setCol(g, 15, '3'));
  }
  return paintArt(ART.bridge, g);
}
const CAVE_WALL_CHARS = '%';

function tableImage(env: TileEnv): Img {
  const nb = neighbors(env);
  const g = grid(ART.table.rows);
  if (nb.n !== 'k') (setRow(g, 0, '3'), setRow(g, 1, '0'));
  if (nb.w !== 'k') setCol(g, 0, '3');
  if (nb.e !== 'k') setCol(g, 15, '3');
  if (nb.s !== 'k') {
    setRow(g, 11, '2');
    setRow(g, 12, '3');
    for (const y of [13, 14, 15]) g[y] = [...'.33..........33.'];
    if (nb.w === 'k') g[13][1] = g[13][2] = g[14][1] = g[14][2] = g[15][1] = g[15][2] = '.';
    if (nb.e === 'k') g[13][13] = g[13][14] = g[14][13] = g[14][14] = g[15][13] = g[15][14] = '.';
  }
  return stack(underImage(env, 'floor'), paintArt(ART.table, g));
}

// ---------- Public ----------

const cache = new Map<string, Img>();

/**
 * Which tree a 'T' is, from the map's tree style: lowland = about 1 in 4 dry, dry = about 3 in 4 dry,
 * pine = about 3 in 4 pines (the rest green). It depends on the spot, so it never changes.
 */
function treeAt(env: TileEnv): string {
  const odd = ((Math.imul(env.x, 73856093) ^ Math.imul(env.y, 19349663)) >>> 0) % 4 === 1;
  const trees = env.style?.trees ?? 'lowland';
  if (trees === 'pine') return odd ? 'T' : 'I';
  if (trees === 'dry') return odd ? 'T' : 't';
  if (trees === 'jungle') return 'T';
  return odd ? 't' : 'T';
}

/** The image for tile `ch` at (env.x, env.y) on a map. Cached by everything that affects it. */
export function tileImage(ch: string, env: TileEnv): Img {
  if (ch === 'T') ch = treeAt(env);
  const nb = neighbors(env);
  const st = env.style;
  const key = [ch, env.ground, env.roof, env.floor, env.outdoor, env.y === 0, nb.n, nb.s, nb.w, nb.e, st?.walls, st?.rock, st?.cave, st?.trees === 'jungle', st?.canopy, env.frame].join('|');
  let img = cache.get(key);
  if (!img) {
    img = render(ch, env);
    if (st?.canopy) img = shaded(img);
    cache.set(key, img);
  }
  return img;
}

/** Under a dense canopy: the tile multiplied toward deep green (its transparency kept). */
function shaded(img: Img): Img {
  const c = makeCanvas(16, 16);
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = CANOPY;
  g.fillRect(0, 0, 16, 16);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(img, 0, 0);
  return c;
}

function render(ch: string, env: TileEnv): Img {
  switch (ch) {
    case '.':
    case '=':
      return paintArt(groundArt(env, ch));
    case 'g':
      return paintArt(ART.grassGround);
    case ',':
      return paintArt(ART.tallGrass);
    case 'z':
      return paintArt(ART.dryGrass);
    case 's':
      return paintArt(ART.sand);
    case 'i':
      return paintArt(ART.ash);
    case 'j':
      return paintArt(framed(ART.lava, env, 1, 1));
    case '!':
      return paintArt(framed(ART.waterfall, env, 0, 4));
    case 'X': {
      // Frame 1: the cloud (rows 0-9) rises 2 pixels; the crack below stays.
      const rows = ART.steamVent.rows;
      const steam = env.frame ? rows.map((r, y) => (y < 10 ? (rows[y + 2] && y + 2 < 10 ? rows[y + 2] : '................') : r)) : rows;
      return stack(paintArt(ART.ash), paintArt({ ...ART.steamVent, rows: steam }));
    }
    case '|':
      return paintArt(ART.sugarcane);
    case 'l':
      return paintArt(ART.cobble);
    case 'N':
      return stack(underImage(env, 'ground'), paintArt(neighbors(env).n === 'N' ? ART.tower : ART.bellTower));
    case 'y':
      return stack(groundUnder(env), paintArt(ART.cactus));
    case 'E':
      return stack(groundUnder(env), paintArt(ART.boulder));
    case 'A':
      return stack(underImage(env, 'ground'), paintArt(neighbors(env).n === 'A' ? ART.lighthouse : ART.lighthouseTop));
    case '*':
      return paintArt(framed(ART.flowers, env, 1, 0));
    case 'T':
      return paintArt(env.style?.trees === 'jungle' ? ART.jungleTree : ART.tree);
    case '[':
      return paintArt(ART.templeStone);
    case ']':
      return paintArt(ART.templeStairs);
    case '(':
      return stack(paintArt(ART.templeStone), paintArt(ART.templeDoor));
    case 't':
      return paintArt(ART.dryTree);
    case 'I':
      return paintArt(ART.pine);
    case 'J':
      // The palm's own grass is left out: it stands on whatever ground is beside it.
      return stack(groundUnder(env), paintArt(ART.palm, grid(ART.palm.rows).map((row) => row.map((c) => ('012'.includes(c) ? '.' : c)))));
    case '>':
      return paintArt(ledgeArt(env, ART.ledgeRight));
    case 'v':
      return paintArt(ledgeArt(env, ART.ledgeDown));
    case 'Y':
      return paintArt(ART.lemonTree);
    case '^':
      return rockImage(rockArt(env), env, MOUNTAIN_CHARS, underImage(env, 'ground'));
    case 'O':
      return stack(rockImage(rockArt(env), env, MOUNTAIN_CHARS, underImage(env, 'ground')), paintArt(rockArt(env, ART.caveMouth)));
    case ':':
      return paintArt(ART.dirt);
    case '%':
      if (env.style?.cave === 'temple') return paintArt(caveArt(env, 'wall', ART.templeStone));
      return rockImage(caveArt(env, 'wall', ART.caveWall), env, CAVE_WALL_CHARS, paintArt(caveArt(env, 'floor', caveFloorArt(env))));
    case ';':
      return paintArt(caveArt(env, 'floor', caveFloorArt(env)));
    case 'e':
      return stack(paintArt(caveArt(env, 'floor', caveFloorArt(env))), paintArt(caveArt(env, 'floor', ART.caveExitOverlay)));
    case 'Z':
      return stack(paintArt(caveArt(env, 'floor', caveFloorArt(env))), paintArt(ART.ladder));
    case 'D':
      return stack(rockImage(rockArt(env), env, MOUNTAIN_CHARS, underImage(env, 'ground')), paintArt(rockArt(env, TUNNEL_MOUTH)));
    case 'H':
      return bridgeImage(env);
    case 'F': {
      // A 2×2 fountain: this tile's quarter is the one away from its fountain neighbors.
      const nb = neighbors(env);
      const [qx, qy] = [nb.w === 'F' ? 16 : 0, nb.n === 'F' ? 16 : 0];
      const rows = ART.fountain.rows.slice(qy, qy + 16).map((r) => r.slice(qx, qx + 16));
      return stack(underImage(env, 'ground'), paintArt({ ...ART.fountain, rows }));
    }
    case 'U': {
      // Outdoors a market stall; indoors a pottery shelf (a wooden top instead of the striped awning).
      if (env.outdoor) return stack(underImage(env, 'ground'), paintArt(ART.stall));
      const g = grid(ART.stall.rows);
      (setRow(g, 0, '3'), setRow(g, 1, '0'), setRow(g, 2, '1'), setRow(g, 3, '3'));
      g[4] = [...'.3............3.'];
      return stack(underImage(env, 'floor'), paintArt(ART.stall, g));
    }
    case 'K':
      return stack(paintArt(caveArt(env, 'floor', caveFloorArt(env))), paintArt(ART.rails));
    case 'W':
      return stack(paintArt(caveArt(env, 'floor', caveFloorArt(env))), paintArt(ART.minePost));
    case '8':
    case '2':
    case '4':
    case '6':
      // The arrow (drawn pointing up, then turned) moves forward 2 pixels on frame 1: you see which way it flows.
      return stack(paintArt(framed(ART.water, env, 2, 0)), paintArt(ART.currentArrow, turn(grid(framed(ART.currentArrow, env, 0, -2).rows), { 8: 0, 6: 1, 2: 2, 4: 3 }[ch]!)));
    case '~':
      return waterImage(env);
    case 'f':
      return stack(underImage(env, 'ground'), paintArt(ART.fence));
    case 'S':
      return stack(underImage(env, 'ground'), paintArt(ART.sign));
    case 'r':
    case 'b':
    case 'o':
    case 'p':
    case 'q':
      return roofImage(ch, env);
    case 'h':
      return wallImage(env);
    case 'w':
      return stack(wallImage(env), paintArt(ART.windowOverlay));
    case 'd':
      return stack(wallImage(env), paintArt(ART.doorOverlay));
    case 'c':
      return stack(wallImage(env), paintArt(ART.centroSignOverlay));
    case 'G':
      return stack(wallImage(env), paintArt(ART.gymSignOverlay));
    case 'a':
      return stack(wallImage(env), paintArt(ART.bakerySignOverlay));
    case 'M':
      return stack(wallImage(env), paintArt(ART.martSignOverlay));
    case '_':
      return paintArt(ART.floor);
    case '+':
      return paintArt(ART.tileFloor);
    case 'x':
      return paintArt(ART.pinkFloor);
    case '#':
      return paintArt(ART.innerWall);
    case 'k':
      return tableImage(env);
    case 'B':
      return stack(underImage(env, 'floor'), paintArt(ART.bed));
    case 'L':
      return stack(underImage(env, 'auto'), paintArt(ART.shelf));
    case 'P':
      return stack(underImage(env, 'auto'), paintArt(ART.plant));
    case 'V':
      return stack(underImage(env, 'auto'), paintArt(ART.tv));
    case 'C': {
      const g = grid(ART.counter.rows);
      if (nb(env).w !== 'C') g.forEach((r, y) => y < 14 && (r[0] = '3'));
      if (nb(env).e !== 'C') g.forEach((r, y) => y < 14 && (r[15] = '3'));
      return stack(underImage(env, 'floor'), paintArt(ART.counter, g));
    }
    case 'Q':
      return stack(underImage(env, 'floor'), paintArt(ART.pc));
    case 'n':
      return stack(underImage(env, 'floor'), paintArt(ART.bench));
    case 'u':
      return stack(paintArt(ART.innerWall), paintArt(ART.poster));
    case 'm':
      return stack(underImage(env, 'floor'), paintArt(ART.mat));
    case 'R': {
      const g = grid(ART.rug.rows);
      if (nb(env).w !== 'R') (setCol(g, 0, '3'), setCol(g, 1, '1'));
      if (nb(env).e !== 'R') (setCol(g, 15, '3'), setCol(g, 14, '1'));
      return paintArt(ART.rug, g);
    }
    default:
      return paintArt(ART.void);
  }
}

const nb = neighbors;

/**
 * Outdoors, a space is a hole: not part of this map. Maps are rectangles, but a route can leave out its dead
 * corners, and another map in the world shows through there (the river beside Ruta 3).
 */
export const isHole = (m: MapLook, x: number, y: number) => m.outdoor && m.rows[y]?.[x] === ' ';

/** A map's tile at (x, y). Outside the map or in a hole: its border (trees outdoors, nothing indoors). */
export function tileOf(m: MapLook, x: number, y: number): string {
  if (x >= 0 && y >= 0 && y < m.rows.length && x < m.rows[0].length && !isHole(m, x, y)) return m.rows[y][x];
  return m.border ?? (m.outdoor ? 'T' : ' ');
}

/** The tile environment for (x, y) on a map. */
export const envAt = (m: MapLook, x: number, y: number): TileEnv => ({ rows: m.rows, outdoor: m.outdoor, floor: m.floor, ground: m.ground, roof: m.roof, border: m.border, style: m.style, x, y });

/** A whole map as one image (the art page; the game draws only the tiles on screen). Holes stay see-through. */
export function renderMap(m: MapLook): Img {
  const T = 16;
  const c = makeCanvas(m.rows[0].length * T, m.rows.length * T);
  const g = c.getContext('2d')!;
  m.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (!isHole(m, x, y)) g.drawImage(tileImage(ch, envAt(m, x, y)), x * T, y * T);
    }),
  );
  return c;
}

/** Tall grass drawn over the player's feet. */
/** The tall grass drawn over your feet: green, or dry (zacate) for 'z'. */
export const tallGrassImage = (ch = ',') => paintArt(ch === 'z' ? ART.dryGrass : ch === '|' ? ART.sugarcane : ART.tallGrass);

import { makeCanvas, type Img } from './pixel';
import { ART, CLIFF_FACE, type TileArt } from '../style/tiles';
import { ROOFS, type Pal } from '../style/colors';
import type { Dir } from '../engine/input';

/*
  Turns the tile art in style/tiles.ts into images, per map:
  - ground looks different in towns (pale, dotted) and on routes (green),
  - roofs take the town's color,
  - roofs, walls, tables, counters and rugs get outlines where the neighbor differs.
  Gameplay properties (solid, tall grass, doors...) are in TILES below.
*/

/** What drawing a whole map needs (a MapDef has all of this). */
export interface MapLook {
  rows: string[];
  outdoor: boolean;
  floor: string;
  ground?: 'town' | 'grass';
  roof?: string;
  /** The tile all around the map's edges (default: trees outdoors, nothing indoors). */
  border?: string;
}

export type TileKind = 'tallgrass' | 'door' | 'mat' | 'counter' | 'water';

export interface TileDef {
  solid: boolean;
  kind?: TileKind;
  /** A ledge: you hop over it when walking this way (from the high side); otherwise it's solid. */
  ledge?: Dir;
  /** Text shown when you press A facing this tile. */
  look?: { es: string; en: string };
}

/** What a tile needs to know about the map it's in, and where it is. */
export interface TileEnv extends MapLook {
  x: number;
  y: number;
}

const solid = (extra: Partial<TileDef> = {}): TileDef => ({ solid: true, ...extra });
const open = (extra: Partial<TileDef> = {}): TileDef => ({ solid: false, ...extra });

export const TILES: Record<string, TileDef> = {
  '.': open(),
  g: open(),
  ',': open({ kind: 'tallgrass' }),
  '=': open(),
  '*': open(),
  T: solid(),
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
  Q: solid({ look: { es: 'Es una computadora. En la pantalla dice: «¡Bienvenidos al Palacentro!»', en: 'It’s a computer. The screen says: "Welcome to the Palacentro!"' } }),
  n: solid({ look: { es: 'Un sofá muy cómodo para esperar.', en: 'A very comfy sofa for waiting.' } }),
  u: solid({ look: { es: 'Un póster: «¡Lávate las manos!»', en: 'A poster: "Wash your hands!"' } }),
  m: open({ kind: 'mat' }),
  '^': solid(),
  ':': open(),
  O: open({ kind: 'door' }),
  '%': solid(),
  ';': open(),
  e: open({ kind: 'mat' }),
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
const setCol = (g: Grid, x: number, ch: string) => g.forEach((row) => (row[x] = ch));

// ---------- Neighbors ----------

const ROOF_CHARS = 'rbop';
const WALL_CHARS = 'hwdcGaM';
const roofKey = (ch: string) => (ch === 'b' ? 'r' : ch);

function neighbors(env: TileEnv) {
  const at = (dx: number, dy: number) => tileOf(env, env.x + dx, env.y + dy);
  return { n: at(0, -1), s: at(0, 1), w: at(-1, 0), e: at(1, 0) };
}

function groundArt(env: TileEnv, ch: '.' | '='): TileArt {
  const town = env.ground === 'town';
  // Like Johto, paths are the same pale dotted ground as towns.
  if (ch === '=') return ART.townGround;
  return town ? ART.townGround : ART.grassGround;
}

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
  const color = ch === 'o' ? 'red' : ch === 'p' ? 'purple' : env.roof ?? 'red';
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
  return paintArt(ART.wall, g);
}

/** Rock (mountains, cave walls): outlined where it ends, with a cliff face on the south side. */
function rockImage(art: TileArt, env: TileEnv, rockChars: string): Img {
  const nb = neighbors(env);
  const isRock = (c: string) => rockChars.includes(c);
  const g = grid(art.rows);
  const top = 16 - CLIFF_FACE.length; // where the cliff face starts
  if (!isRock(nb.s)) CLIFF_FACE.forEach((r, i) => (g[top + i] = [...r]));
  if (!isRock(nb.n)) (setRow(g, 0, '3'), setRow(g, 1, '0'));
  if (!isRock(nb.w)) (setCol(g, 0, '3'), g.forEach((r, y) => y > 0 && y < top && (r[1] = '0')));
  if (!isRock(nb.e)) (setCol(g, 15, '3'), g.forEach((r, y) => y > 0 && y < top && (r[14] = '2')));
  return paintArt(art, g);
}
const MOUNTAIN_CHARS = '^O';
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

/** The image for tile `ch` at (env.x, env.y) on a map. Cached by everything that affects it. */
export function tileImage(ch: string, env: TileEnv): Img {
  const nb = neighbors(env);
  const key = [ch, env.ground, env.roof, env.floor, env.outdoor, env.y === 0, nb.n, nb.s, nb.w, nb.e].join('|');
  let img = cache.get(key);
  if (!img) {
    img = render(ch, env);
    cache.set(key, img);
  }
  return img;
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
    case '*':
      return paintArt(ART.flowers);
    case 'T':
      return paintArt(ART.tree);
    case '>':
      return paintArt(ART.ledgeRight);
    case 'v':
      return paintArt(ART.ledgeDown);
    case 'Y':
      return paintArt(ART.lemonTree);
    case '^':
      return rockImage(ART.rock, env, MOUNTAIN_CHARS);
    case 'O':
      return stack(rockImage(ART.rock, env, MOUNTAIN_CHARS), paintArt(ART.caveMouth));
    case ':':
      return paintArt(ART.dirt);
    case '%':
      return rockImage(ART.caveWall, env, CAVE_WALL_CHARS);
    case ';':
      return paintArt(ART.caveFloor);
    case 'e':
      return stack(paintArt(ART.caveFloor), paintArt(ART.caveExitOverlay));
    case '~':
      return paintArt(ART.water);
    case 'f':
      return stack(underImage(env, 'ground'), paintArt(ART.fence));
    case 'S':
      return stack(underImage(env, 'ground'), paintArt(ART.sign));
    case 'r':
    case 'b':
    case 'o':
    case 'p':
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

/** A map's tile at (x, y). Outside the map: its border (trees outdoors, nothing indoors). */
export function tileOf(m: MapLook, x: number, y: number): string {
  if (x >= 0 && y >= 0 && y < m.rows.length && x < m.rows[0].length) return m.rows[y][x];
  return m.border ?? (m.outdoor ? 'T' : ' ');
}

/** The tile environment for (x, y) on a map. */
export const envAt = (m: MapLook, x: number, y: number): TileEnv => ({ rows: m.rows, outdoor: m.outdoor, floor: m.floor, ground: m.ground, roof: m.roof, border: m.border, x, y });

/** A whole map as one image (the art page; the game draws only the tiles on screen). */
export function renderMap(m: MapLook): Img {
  const T = 16;
  const c = makeCanvas(m.rows[0].length * T, m.rows.length * T);
  const g = c.getContext('2d')!;
  m.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      g.drawImage(tileImage(ch, envAt(m, x, y)), x * T, y * T);
    }),
  );
  return c;
}

/** Tall grass drawn over the player's feet. */
export const tallGrassImage = () => paintArt(ART.tallGrass);

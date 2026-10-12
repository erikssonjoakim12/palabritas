import { makeCanvas, type Img } from './pixel';
import { ART, type TileArt } from '../style/tiles';
import { ROOFS, type Pal } from '../style/colors';

/*
  Turns the tile art in style/tiles.ts into images, per map:
  - ground looks different in towns (pale, dotted) and on routes (green),
  - roofs take the town's color,
  - roofs, walls, tables, counters and rugs get outlines where the neighbor differs.
  Gameplay properties (solid, tall grass, doors...) are in TILES below.
*/

export type TileKind = 'tallgrass' | 'door' | 'mat' | 'counter' | 'water';

export interface TileDef {
  solid: boolean;
  kind?: TileKind;
  /** Text shown when you press A facing this tile. */
  look?: { es: string; en: string };
}

/** What a tile needs to know about the map it's in. */
export interface TileEnv {
  rows: string[];
  outdoor: boolean;
  floor: string;
  ground?: 'town' | 'grass';
  roof?: string;
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
const WALL_CHARS = 'hwdcG';
const roofKey = (ch: string) => (ch === 'b' ? 'r' : ch);

function neighbors(env: TileEnv) {
  const at = (dx: number, dy: number) => {
    const x = env.x + dx;
    const y = env.y + dy;
    if (y < 0 || y >= env.rows.length || x < 0 || x >= env.rows[0].length) return env.outdoor ? 'T' : ' ';
    return env.rows[y][x];
  };
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
    case 'Y':
      return paintArt(ART.lemonTree);
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

/** Tall grass drawn over the player's feet. */
export const tallGrassImage = () => paintArt(ART.tallGrass);

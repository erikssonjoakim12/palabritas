import { W, H, overlay, el, scaleFactor, ctx } from '../engine/screen';
import { input, type Dir } from '../engine/input';
import { sfx } from '../engine/sfx';
import { nextFrame, frames, frameAlpha, whenIdle, clearIdle } from '../engine/loop';
import { TILES, tallGrassImage, tileImage, tileOf, envAt, owns, isHole, ANIMATED } from '../art/tiles';
import { personFrames, OBJECTS, type Frames } from '../art/chars';
import { fromRows, mirror, type Img } from '../art/pixel';
import { MAPS, type MapDef, type NpcDef, type Conn, type EncounterEntry } from './maps';
import { worldLayout, mapAcross } from './layout';
import { G, flag, saveGame, playerLook, clockHour, type SaveData } from '../game/state';
import { rematchReady } from '../game/rematch';
import { shuffled, pickRandom } from '../game/random';
import { NIGHT, NIGHT_CLEAR, FIREFLY, MARK, BLACK, SHADOW, ACCENT, FOG } from '../style/colors';
import { OBJECTS_ART } from '../style/people';
import { lightAt, drawLights, skyAt, type Light } from '../art/lights';
import { drawFireworks } from '../art/fireworks';
import { setMapMusic, musicFor } from '../audio/bgm';
import { closeText, say, setSpeaker } from '../ui/textbox';

export interface NpcRT {
  def: NpcDef;
  x: number;
  y: number;
  dir: Dir;
  visible: boolean;
  bubble: number;
  turnTimer: number;
  /** While walking (cutscenes): pixels still to go to reach (x, y), and the walking frame. */
  off?: { x: number; y: number; frame: number };
  /** Extra drawing on top of the sprite (e.g. Palabolas glowing in the healing machine). */
  overlay?: (g: CanvasRenderingContext2D, x: number, y: number) => void;
}

export interface ScriptCtx {
  npc?: NpcRT;
  data?: Record<string, unknown>;
}
/** A script; whatever it resolves to is ignored (so it can end with `return lines(...)`, or a gym leader's result). */
export type ScriptFn = (c: ScriptCtx) => Promise<unknown>;

/** Filled in by scripts.ts. */
export const SCRIPTS: Record<string, ScriptFn> = {};

export const DX: Record<Dir, number> = { up: 0, down: 0, left: -1, right: 1 };
export const DY: Record<Dir, number> = { up: -1, down: 1, left: 0, right: 0 };
const DIRS = Object.keys(DX) as Dir[];
export const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

/**
 * Frames per step (a tile is 16 px). Whole numbers, so every step takes exactly as long.
 * Gen 2 walks in 16; we go a bit faster. Hold B to run.
 */
const WALK_FRAMES = 13;
const RUN_FRAMES = 9;
/** Tiles of surroundings prepared around the map: more than half a screen, so the edges are covered. */
const GRID = 7;
const T = 16;

let map: MapDef = MAPS.casa;
let npcs: NpcRT[] = [];
type Neighbor = { m: MapDef; dx: number; dy: number };
/** Nearby towns/routes, offset (in tiles) from the current map, drawn past its edges. */
let neighbors: Neighbor[] = [];

/**
 * The towns/routes around a map in the world (world/layout.ts): every one within GRID tiles of its edges,
 * connected or not, so the scenery is whole (the mountain beside a route, a corner where three meet).
 */
function neighborsOf(m: MapDef): Neighbor[] {
  const spots = worldLayout();
  const me = spots[m.id];
  if (!me) return [];
  const [w, h] = [m.rows[0].length, m.rows.length];
  return Object.entries(spots).flatMap(([id, p]) => {
    const o = MAPS[id];
    const [dx, dy] = [p.x - me.x, p.y - me.y];
    const near = dx < w + GRID && dx + o.rows[0].length > -GRID && dy < h + GRID && dy + o.rows.length > -GRID;
    return id !== m.id && near ? [{ m: o, dx, dy }] : [];
  });
}
/** People in the connected towns/routes, drawn at the map's edges (they only move once you get there). */
let edgeNpcs: NpcRT[] = [];
let fade = 0;
/** What the screen fades to: black, or the fog's gray (from one patch of fog into the next). */
let fadeColor = BLACK;
let banner: HTMLElement | null = null;
const grassOverlays: Record<string, Img> = {};

export const player = {
  x: 0,
  y: 0,
  dir: 'down' as Dir,
  moving: false,
  prog: 0,
  step: 0,
  turnDelay: 0,
  bumpCd: 0,
  justMoved: false,
  scripted: false,
  hidden: false,
  /** Pixels per frame of the current step. */
  speed: 0,
  /** Length of the current move in pixels (two tiles when hopping a ledge). */
  dist: 16,
  /** A hop with this step (onto your water Palabrita), drawn like hopping a ledge. */
  hopping: false,
  /** Being carried by a water current this way (you keep facing where you were going). */
  slide: null as Dir | null,
  frames: null as Frames | null,
};

const frameCache: Record<string, Frames> = {};
function framesFor(look: string): Frames {
  return (frameCache[look] ??= personFrames(look));
}

export const currentMap = () => map;

/** How you look on the map: walking, or swimming (Surf). */
const walkerLook = () => playerLook() + (G.save.surfing ? 'Surf' : '');
export const npcById = (id: string) => npcs.find((n) => n.def.id === id);

// ---------- Map loading ----------

const validated = new Set<string>();
function validate(m: MapDef) {
  if (validated.has(m.id)) return;
  validated.add(m.id);
  const w = m.rows[0].length;
  m.rows.forEach((r, i) => {
    if (r.length !== w) throw new Error(`Map ${m.id}: row ${i} is ${r.length} wide, expected ${w}`);
    for (const ch of r) if (!TILES[ch]) throw new Error(`Map ${m.id}: unknown tile '${ch}'`);
  });
}

export function loadMap(id: string, x: number, y: number, dir: Dir) {
  const prevName = map?.name;
  if (map && map.id !== id) growBack(map);
  map = MAPS[id];
  validate(map);
  const npc = (def: NpcDef, dx = 0, dy = 0): NpcRT => ({
    def,
    x: def.x + dx,
    y: def.y + dy,
    dir: def.dir ?? 'down',
    visible: def.show ? def.show() : true,
    bubble: 0,
    turnTimer: 60 + Math.floor(Math.random() * 200),
  });
  npcs = (map.npcs ?? []).map((def) => npc(def));
  neighbors = neighborsOf(map);
  edgeNpcs = neighbors.flatMap(({ m, dx, dy }) => (m.npcs ?? []).map((def) => npc(def, dx, dy)));
  ({ grid, w: gridW, lights, alt: gridAlt } = gridFor(map));
  prepareNeighbors();
  // Maps change between versions: never leave a loaded save standing inside a wall.
  [x, y] = nearestFree(x, y);
  Object.assign(player, { x, y, dir, moving: false, prog: 0 });
  if (G.save.follower) placeFollower();
  if (G.save.surfing && !isWater(tileAt(x, y))) G.save.surfing = false;
  const frames = framesFor(walkerLook());
  if (player.frames !== frames) {
    player.frames = frames;
    whenIdle(() => warmUp(Object.values(frames).flat())); // your walking frames, before the first step
  }
  Object.assign(G.save, { map: id, x, y, dir });
  if ((map.outdoor || map.banner) && map.name !== prevName) showBanner(map.name);
  setMapMusic(musicFor(map));
}

export function refreshNpcs() {
  for (const n of [...npcs, ...edgeNpcs]) n.visible = n.def.show ? n.def.show() : true;
}

function showBanner(name: string) {
  banner?.remove();
  const b = el('div', 'box banner', name);
  overlay.appendChild(b);
  banner = b;
  setTimeout(() => (b.style.opacity = '0'), 1600);
  setTimeout(() => b.remove(), 2100);
}

// ---------- Queries ----------

const inMap = (m: MapDef, x: number, y: number) => x >= 0 && y >= 0 && y < m.rows.length && x < m.rows[0].length;
const inBounds = (x: number, y: number) => inMap(map, x, y);

export const tileAt = (x: number, y: number) => (cut.has(`${x},${y}`) ? '.' : tileOf(map, x, y));

// ---------- Surf and Cut (plans/surf-fly.md) ----------

/** Water you can swim on: the water itself and its currents (rapids carry you). */
export const isWater = (ch: string) => TILES[ch].kind === 'water' || !!TILES[ch].current;
/** Can you go onto this tile right now: open ground, or water while you swim (stepping onto land ends it). */
const passable = (ch: string) => !TILES[ch].solid || (!!G.save.surfing && isWater(ch));

/** Start swimming: a hop onto the water you're facing, onto your Palabrita. */
export async function startSurf() {
  G.save.surfing = true;
  player.frames = framesFor(walkerLook());
  player.hopping = true;
  sfx('jump');
  await scriptedStep(player.dir);
  player.hopping = false;
}

/** The water Palabrita under you while you swim, by the way you face (a generic one until the user's art). */
let mountImgs: Record<Dir, Img> | null = null;
const mountImg = (d: Dir) =>
  (mountImgs ??= { down: OBJECTS.montaAbajo, up: OBJECTS.montaArriba, left: OBJECTS.montaLado, right: mirror(OBJECTS.montaLado) })[d];

/** Thin trees cut on this map, as 'x,y': they grow back when you leave it, like Gold/Silver. */
let cut = new Set<string>();
export function cutTree(x: number, y: number) {
  cutFx = { x, y, at: performance.now() };
  cut.add(`${x},${y}`);
  grid[(y + GRID) * gridW + x + GRID] = tileImage('.', envAt(map, x, y));
}
function growBack(m: MapDef) {
  const g = grids.get(m.id);
  for (const k of cut) {
    const [x, y] = k.split(',').map(Number);
    g?.fill((y + GRID) * g.w + x + GRID);
  }
  cut = new Set();
}

/** Who is at (x, y): a person before an object on the same tile (Mr. Ramos in his armchair). */
function npcAt(x: number, y: number) {
  const here = npcs.filter((n) => n.visible && n.x === x && n.y === y);
  return here.find((n) => !n.def.object) ?? here[0];
}

/** Free for someone on foot (people walking about, a rival coming up to you). */
function walkable(x: number, y: number) {
  return inBounds(x, y) && !TILES[tileAt(x, y)].solid && !npcAt(x, y);
}
/** Free for you: on foot, or swimming. */
function canEnter(x: number, y: number) {
  return inBounds(x, y) && passable(tileAt(x, y)) && !npcAt(x, y);
}

function nearestFree(x: number, y: number): [number, number] {
  for (let r = 0; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && canEnter(x + dx, y + dy)) return [x + dx, y + dy];
      }
    }
  }
  return [x, y];
}

// ---------- Scripts & transitions ----------

export async function runScript(fn: ScriptFn | undefined, c: ScriptCtx = {}) {
  if (!fn) return;
  G.lock++;
  setSpeaker(c.npc?.def.look); // their voice for the dialog
  try {
    await fn(c);
  } catch (err) {
    console.error(err);
  } finally {
    setSpeaker();
    closeText();
    G.lock--;
    input.clearPressed();
    refreshNpcs();
    saveGame();
  }
}

export async function fadeOut(n = 8, color = BLACK) {
  fadeColor = color;
  for (let i = 1; i <= n; i++) {
    fade = i / n;
    await nextFrame();
  }
}

export async function fadeIn(n = 8, color = BLACK) {
  fadeColor = color;
  for (let i = n - 1; i >= 0; i--) {
    fade = i / n;
    await nextFrame();
  }
}

export function setFade(v: number) {
  fade = v;
}

/** Fade to black, move somewhere, fade back in. */
async function transition(to: string, x: number, y: number, dir: Dir, fadeFrames: number) {
  G.lock++;
  await fadeOut(fadeFrames);
  loadMap(to, x, y, dir);
  await fadeIn(fadeFrames);
  G.lock--;
  input.clearPressed();
  saveGame();
}

/** Through a door (or back home after a blackout). */
export async function warp(to: string, x: number, y: number, dir: Dir, sound = true) {
  if (sound) sfx('door');
  await transition(to, x, y, dir, 8);
}

/**
 * Walk off the edge of an outdoor map straight into the connected one, without a fade:
 * the neighbor is already drawn at the edge, so the step just continues on the new map.
 * Past the part of the edge the connection covers, whatever map is there in the world (crossInto).
 */
function crossConnection(d: Dir, conn: Conn, nx: number, ny: number) {
  const target = MAPS[conn.to];
  const x = d === 'left' ? target.rows[0].length - 1 : d === 'right' ? 0 : player.x + conn.offset;
  const y = d === 'up' ? target.rows.length - 1 : d === 'down' ? 0 : player.y + conn.offset;
  if (!inMap(target, x, y)) return crossInto(nx, ny, d);
  if (!passable(tileOf(target, x, y))) return bump();
  enter(conn.to, x, y, d);
}

/**
 * Off an edge with no connection there, or into a hole: into the map that has that tile in the world, if you can
 * go there (the river runs through other maps' holes; the temple's trail comes out on Ruta 4).
 */
function crossInto(nx: number, ny: number, d: Dir) {
  const there = mapAcross(map.id, nx, ny);
  if (!there || !passable(MAPS[there.id].rows[there.y][there.x])) return bump();
  enter(there.id, there.x, there.y, d);
}

/** The step goes on in another map. */
function enter(id: string, x: number, y: number, d: Dir) {
  loadMap(id, x, y, d);
  startMove(player.x, player.y);
  whenIdle(saveGame); // not in the middle of the step
}

/** Walk the player one tile as part of a script (no encounters/triggers). */
export async function scriptedStep(d: Dir) {
  player.dir = d;
  const nx = player.x + DX[d];
  const ny = player.y + DY[d];
  if (!canEnter(nx, ny)) return;
  player.scripted = true;
  startMove(nx, ny);
  while (player.moving) await nextFrame();
  player.scripted = false;
}

// ---------- Someone following you ----------

/**
 * Someone walking one step behind you, through every map (Tomás out of the fog), like Pikachu in Pokémon Yellow:
 * kept in the save (G.save.follower), talked to by facing them, and never in anyone's way.
 */
const follower = { x: 0, y: 0, fromX: 0, fromY: 0, dir: 'down' as Dir };

/** Someone starts following you, from where they stand (or right behind you); null: they stay behind. */
export function setFollower(f: SaveData['follower'] | null, at?: [number, number]) {
  G.save.follower = f ?? undefined;
  if (f) placeFollower(at);
}

/** Behind you (on your own spot when that's a wall: they step out after you). */
function placeFollower(at?: [number, number]) {
  const behind: [number, number] = [player.x - DX[player.dir], player.y - DY[player.dir]];
  const [x, y] = at ?? (inBounds(...behind) && TILES[tileAt(...behind)].solid ? [player.x, player.y] : behind);
  Object.assign(follower, { x, y, fromX: x, fromY: y, dir: player.dir });
}

// ---------- Movement ----------

/** The tall grass you just stepped into: it shakes for a moment, like Gold/Silver. */
let rustle: { x: number; y: number; at: number } | null = null;
const RUSTLE_MS = 320;

/** Start moving to (nx, ny), `dist` pixels away (a normal step is one tile; hopping a ledge is two). */
function startMove(nx: number, ny: number, dist = T) {
  // Whoever follows you takes the spot you're leaving (not when a step just carries on into the next map).
  if (G.save.follower && (nx !== player.x || ny !== player.y)) {
    Object.assign(follower, { fromX: follower.x, fromY: follower.y, x: player.x, y: player.y });
    const [dx, dy] = [follower.x - follower.fromX, follower.y - follower.fromY];
    if (dx || dy) follower.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
  }
  if (TILES[tileAt(nx, ny)].kind === 'tallgrass') rustle = { x: nx, y: ny, at: performance.now() };
  // Swimming onto land: you're on foot again.
  if (G.save.surfing && !isWater(tileAt(nx, ny))) {
    G.save.surfing = false;
    player.frames = framesFor(walkerLook());
  }
  player.x = nx;
  player.y = ny;
  player.dist = dist;
  player.moving = true;
  player.prog = 0;
  player.step ^= 1;
}

function bump() {
  if (player.bumpCd <= 0) {
    sfx('bump');
    player.bumpCd = 16;
  }
}

function tryMove(d: Dir) {
  const nx = player.x + DX[d];
  const ny = player.y + DY[d];
  if (!inBounds(nx, ny)) {
    if (map.fog === 'patch') return void runScript(SCRIPTS.__fogEdge, { data: { dir: d } });
    if (!map.outdoor && map.exit && TILES[tileAt(player.x, player.y)].kind === 'mat' && d === 'down') {
      warp(map.exit.to, map.exit.x, map.exit.y, 'down');
      return;
    }
    const conn = map.connections?.[d];
    if (conn && !conn.scenery) crossConnection(d, conn, nx, ny);
    else crossInto(nx, ny, d);
    return;
  }
  if (isHole(map, nx, ny)) return crossInto(nx, ny, d);
  const ledge = TILES[tileAt(nx, ny)].ledge;
  if (ledge) {
    // Hop down over it from the high side, landing on the tile beyond; it's a wall otherwise.
    const [lx, ly] = [nx + DX[d], ny + DY[d]];
    if (ledge !== d || !canEnter(lx, ly)) return bump();
    sfx('jump');
    return startMove(lx, ly, 2 * T);
  }
  if (!canEnter(nx, ny)) return bump();
  startMove(nx, ny);
}

function onStep() {
  const { x, y } = player;
  const door = map.doors?.find((d) => d.x === x && d.y === y);
  if (door) {
    warp(door.to, door.tx, door.ty, door.dir ?? 'up');
    return;
  }
  const trig = map.triggers?.find((t) => t.x === x && t.y === y);
  if (trig) {
    runScript(SCRIPTS[trig.script]);
    return;
  }
  if (checkTrainers() || checkNear()) return;
  if (G.save.repel) {
    if (!--G.save.repel) runScript(() => say('El Repelente se acabó.', { en: 'The Repel wore off.' }));
    return;
  }
  // Swimming: the map's water Palabritas on every step; on foot: in tall grass (or everywhere, in caves).
  const wild = G.save.surfing ? map.surf : map.encounters;
  const wildHere = wild && (G.save.surfing || map.encounters?.everywhere || TILES[tileAt(x, y)].kind === 'tallgrass');
  if (wildHere && Math.random() < wild.rate) runScript(SCRIPTS.__wild, { data: pickEncounter(wild.table) });
}

/** A random wild Palabrita from a table (by weight), with its level. */
export function pickEncounter(table: EncounterEntry[]): { sp: string; level: number } {
  let r = Math.random() * table.reduce((s, e) => s + e.w, 0);
  const e = table.find((t) => (r -= t.w) < 0) ?? table[0];
  return { sp: e.sp, level: e.min + Math.floor(Math.random() * (e.max - e.min + 1)) };
}

/** The tile you're facing. */
export const facingTile = () => tileAt(...facingSpot());
/** The spot you're facing. */
export const facingSpot = (): [number, number] => [player.x + DX[player.dir], player.y + DY[player.dir]];

function checkTrainers(): boolean {
  for (const n of npcs) {
    const script = n.def.script;
    if (!n.visible || !n.def.sight || !script || flag(`beat:${n.def.id}`)) continue;
    for (let i = 1; i <= n.def.sight; i++) {
      const tx = n.x + DX[n.dir] * i;
      const ty = n.y + DY[n.dir] * i;
      if (tx === player.x && ty === player.y) {
        runScript(async (c) => {
          n.bubble = 45;
          sfx('alert');
          await frames(45);
          player.dir = OPP[n.dir];
          await SCRIPTS[script](c);
        }, { npc: n });
        return true;
      }
      // Trainers see across water (swimmers do), not through walls.
      if (!inBounds(tx, ty) || !(passable(tileAt(tx, ty)) || isWater(tileAt(tx, ty))) || npcAt(tx, ty)) break;
    }
  }
  return false;
}

/** Someone who stirs when you come within `near` steps, from any side, without a «!» (the dogs in the fog). */
function checkNear(): boolean {
  const n = npcs.find((n) => n.visible && n.def.near && n.def.script && Math.abs(n.x - player.x) + Math.abs(n.y - player.y) <= n.def.near);
  if (n) runScript(SCRIPTS[n.def.script!], { npc: n });
  return !!n;
}

/** What someone on a muted map acts out, when they have no mime of their own. */
export const MUTED_MIME = '(They try to speak, but no words come out!)';

function interact() {
  const fx = player.x + DX[player.dir];
  const fy = player.y + DY[player.dir];
  const f = G.save.follower;
  if (f && follower.x === fx && follower.y === fy) {
    follower.dir = OPP[player.dir];
    runScript(SCRIPTS[f.script]);
    return;
  }
  let n = npcAt(fx, fy);
  if (!n && TILES[tileAt(fx, fy)].kind === 'counter') n = npcAt(fx + DX[player.dir], fy + DY[player.dir]);
  const muted = !!map.muted?.();
  // Decoration (an object without a script) is read like the sign on its spot, below.
  if (n?.def.script) {
    if (n.def.look) n.dir = OPP[player.dir];
    if (muted && n.def.look && !n.def.servesWhenMuted) runScript(() => say('…', { en: n.def.mime ?? MUTED_MIME }), { npc: n });
    else runScript(SCRIPTS[n.def.script], { npc: n });
    return;
  }
  const sign = map.signs?.find((s) => s.x === fx && s.y === fy);
  if (sign) {
    runScript(() => (muted ? say('…', { en: '(The letters have faded away.)' }) : say(sign.es, { en: sign.en })));
    return;
  }
  const { look, script } = TILES[tileAt(fx, fy)];
  if (isWater(tileAt(fx, fy))) runScript(SCRIPTS.agua);
  else if (script) runScript(SCRIPTS[script]);
  else if (look) runScript(() => say(look.es, { en: look.en }));
}

/**
 * Walk an NPC along a path, one tile per step with the walking animation (for cutscenes). Steps into a
 * wall, another NPC or the player are skipped (with a warning in dev).
 */
export async function walkNpc(id: string, path: Dir[], { speed = 1 } = {}) {
  const n = npcById(id);
  if (!n) return console.warn(`walkNpc: no NPC ${id}`);
  for (const [i, d] of path.entries()) {
    n.dir = d;
    const [nx, ny] = [n.x + DX[d], n.y + DY[d]];
    if (!inBounds(nx, ny) || TILES[tileAt(nx, ny)].solid || npcAt(nx, ny) || (player.x === nx && player.y === ny)) {
      if (import.meta.env.DEV) console.warn(`walkNpc: ${id} can't step ${d} to ${nx},${ny}`);
      continue;
    }
    [n.x, n.y] = [nx, ny];
    const steps = Math.round(WALK_FRAMES / speed);
    for (let f = steps; f > 0; f--) {
      n.off = { x: -DX[d] * T * (f / steps), y: -DY[d] * T * (f / steps), frame: f > steps / 2 ? 1 + (i % 2) : 0 };
      await nextFrame();
    }
    n.off = undefined;
  }
}

/**
 * Walk an NPC up to you, by the shortest way, to a tile right next to you, and turn to face you (a rival
 * catching up). If nothing leads there, it stays where it is.
 */
export async function approachPlayer(id: string, opts: { speed?: number } = {}) {
  const n = npcById(id);
  if (!n) return console.warn(`approachPlayer: no NPC ${id}`);
  const path = pathFor(n, (x, y) => Math.abs(x - player.x) + Math.abs(y - player.y) === 1);
  if (!path) return;
  await walkNpc(id, path, opts);
  n.dir = player.x < n.x ? 'left' : player.x > n.x ? 'right' : player.y < n.y ? 'up' : 'down';
}

/** Walk an NPC to (x, y) by the shortest way (the white dog heading for the way out of a patch of fog). */
export async function walkNpcTo(id: string, x: number, y: number, opts: { speed?: number } = {}) {
  const n = npcById(id);
  if (!n) return console.warn(`walkNpcTo: no NPC ${id}`);
  const path = pathFor(n, (px, py) => px === x && py === y);
  if (path) await walkNpc(id, path, opts);
}

/** The shortest way for an NPC over open ground (not through you) to a spot `end` accepts, or null. */
function pathFor(n: NpcRT, end: (x: number, y: number) => boolean): Dir[] | null {
  const from = new Map<string, [string, Dir] | null>([[`${n.x},${n.y}`, null]]);
  const queue = [[n.x, n.y]];
  let last: number[] | null = end(n.x, n.y) ? [n.x, n.y] : null;
  while (queue.length && !last) {
    const [x, y] = queue.shift()!;
    for (const d of DIRS) {
      const [nx, ny] = [x + DX[d], y + DY[d]];
      const k = `${nx},${ny}`;
      if (from.has(k) || !walkable(nx, ny) || (nx === player.x && ny === player.y)) continue;
      from.set(k, [`${x},${y}`, d]);
      if (end(nx, ny)) {
        last = [nx, ny];
        break;
      }
      queue.push([nx, ny]);
    }
  }
  if (!last) return null;
  const path: Dir[] = [];
  for (let k = `${last[0]},${last[1]}`, step = from.get(k); step; k = step[0], step = from.get(k)) path.unshift(step[1]);
  return path;
}

/** Put an NPC at (x, y), visible (e.g. the rival arriving from off-screen before walking in). */
export function placeNpc(id: string, x: number, y: number, dir: Dir) {
  const n = npcById(id);
  if (!n) return console.warn(`placeNpc: no NPC ${id}`);
  Object.assign(n, { x, y, dir, visible: true, off: undefined });
}

/** How far from home a wandering person goes. */
const WANDER = 2;

/** A wandering person takes a step: a random way that's open ground, near home (not a door, a mat or a trigger). */
function wander(n: NpcRT) {
  if ((globalThis as { __still?: boolean }).__still) return; // tests (tools/browser.mjs)
  for (const d of shuffled(DIRS)) {
    const [nx, ny] = [n.x + DX[d], n.y + DY[d]];
    if (Math.abs(nx - n.def.x) > WANDER || Math.abs(ny - n.def.y) > WANDER) continue;
    const t = TILES[tileAt(nx, ny)];
    if (!inBounds(nx, ny) || t.solid || t.kind || npcAt(nx, ny) || (player.x === nx && player.y === ny)) continue;
    if (map.triggers?.some((tr) => tr.x === nx && tr.y === ny)) continue;
    walkNpc(n.def.id, [d]);
    return;
  }
}

function updateNpcs() {
  for (const n of npcs) {
    if (n.bubble > 0) n.bubble--;
    if (G.lock > 0 || n.off || !n.visible) continue;
    if (n.def.wanders && --n.turnTimer <= 0) {
      n.turnTimer = 90 + Math.floor(Math.random() * 200);
      wander(n);
      continue;
    }
    if (!n.def.turns) continue;
    if (--n.turnTimer <= 0) {
      n.turnTimer = 120 + Math.floor(Math.random() * 240);
      n.dir = pickRandom(DIRS);
    }
  }
}

export function updateWorld() {
  G.save.playMs += 1000 / 60;
  if (player.bumpCd > 0) player.bumpCd--;
  updateNpcs();
  if (player.moving) {
    player.speed = T / (input.isHeld('B') && !player.scripted && !player.slide ? RUN_FRAMES : WALK_FRAMES);
    player.prog += player.speed;
    if (player.prog >= player.dist - 1e-6) {
      player.moving = false;
      player.prog = 0;
      player.justMoved = true;
      // Always remember where you are (also after being walked by a script), so a save never
      // puts you back on a spot a script moved you away from.
      Object.assign(G.save, { x: player.x, y: player.y, dir: player.dir });
      // A water current carries you on until you land somewhere (or it would push you into something).
      const current = TILES[tileAt(player.x, player.y)].current;
      if (current && canEnter(player.x + DX[current], player.y + DY[current])) {
        player.slide = current;
        startMove(player.x + DX[current], player.y + DY[current]);
        return;
      }
      player.slide = null;
      if (!player.scripted) onStep();
    }
    return;
  }
  if (G.lock > 0) return;
  if (input.pressed('START')) {
    runScript(SCRIPTS.startMenu);
    return;
  }
  if (input.pressed('A')) {
    interact();
    return;
  }
  const d = input.dir();
  if (!d) {
    player.turnDelay = 0;
    player.justMoved = false;
    return;
  }
  if (d !== player.dir) {
    player.dir = d;
    if (!player.justMoved) {
      player.turnDelay = 5;
      return;
    }
  }
  if (player.turnDelay > 0) {
    player.turnDelay--;
    return;
  }
  tryMove(d);
}

// ---------- Rendering ----------

/** The «!» when a trainer spots you, and a small, quieter one over a trainer who's ready for a rematch. */
const ALERT = fromRows(['kkkkkkkkk', 'kwwwwwwwk', 'kwwrrrwwk', 'kwwrrrwwk', 'kwwrrrwwk', 'kwwrrrwwk', 'kwwwwwwwk', 'kwwrrrwwk', 'kwwrrrwwk', 'kwwwwwwwk', 'kkkkkkkkk'], MARK);
const REMATCH = fromRows(['kkkkk', 'kwwwk', 'kwrwk', 'kwrwk', 'kwrwk', 'kwwwk', 'kwrwk', 'kkkkk'], MARK);

/** Night: everything dark blue except a soft circle of light around you. */
function drawNight(g: CanvasRenderingContext2D, cx: number, cy: number) {
  const light = g.createRadialGradient(cx, cy, 18, cx, cy, 52);
  light.addColorStop(0, NIGHT_CLEAR);
  light.addColorStop(1, NIGHT);
  g.fillStyle = light;
  g.fillRect(0, 0, W, H);
}

/** Evening and night by the clock, outdoors: the whole view multiplied by the sky's color, and the windows lit. */
function drawDayTime(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const sky = skyAt(clockHour());
  if (sky.light === 0) return; // full day
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = sky.tint;
  g.fillRect(0, 0, W, H);
  g.restore();
  drawLights(g, lights, -camX, -camY, sky.light);
}

/**
 * Which tile image goes where, for the map plus GRID tiles around it (the connected
 * towns/routes there, or trees; nothing indoors). Prepared once when a map loads, so drawing a
 * frame is just looking images up: nothing is created per frame.
 */
let grid: Img[] = [];
let gridW = 0;
let gridAlt = new Map<number, Img>();
let lights: Light[] = [];
/** A map's tile layout, kept per map: just references to tile images (about 10 KB a map). */
interface Grid {
  grid: Img[];
  w: number;
  h: number;
  /** Tiles filled in so far (it can be built a few tiles at a time, in spare moments). */
  done: number;
  /** Windows and lamps that shine at night, in the home map's pixels. */
  lights: Light[];
  /** Animated tiles' second frame (water, lava, flowers, waterfalls), by grid index. */
  alt: Map<number, Img>;
  fill: (i: number) => void;
}
const grids = new Map<string, Grid>();
function gridOf(home: MapDef): Grid {
  let g = grids.get(home.id);
  if (g) return g;
  const near = neighborsOf(home);
  const w = home.rows[0].length + GRID * 2;
  const h = home.rows.length + GRID * 2;
  const grid: Img[] = new Array(w * h);
  const fill = (i: number) => {
    const [tx, ty] = [(i % w) - GRID, Math.floor(i / w) - GRID];
    const n = owns(home, tx, ty) ? undefined : near.find(({ m, dx, dy }) => owns(m, tx - dx, ty - dy));
    const [m, x, y] = n ? [n.m, tx - n.dx, ty - n.dy] : [home, tx, ty];
    const ch = tileOf(m, x, y);
    grid[i] = tileImage(ch, envAt(m, x, y));
    if (ANIMATED.has(ch)) alt.set(i, tileImage(ch, { ...envAt(m, x, y), frame: 1 }));
    const l = lightAt(m, x, y);
    if (l) lights.push({ ...l, x: l.x + (tx - x) * T, y: l.y + (ty - y) * T });
  };
  const lights: Light[] = [];
  const alt = new Map<number, Img>();
  g = { grid, w, h, done: 0, fill, lights, alt };
  grids.set(home.id, g);
  return g;
}
/** Tiles per spare-time job: small, so painting new tiles never makes a frame late. */
const TILES_PER_JOB = 8;
/** Fill in (and send to the graphics chip) the next few tiles of a layout. */
function nextTiles(g: Grid, n = TILES_PER_JOB) {
  for (const end = Math.min(g.grid.length, g.done + n); g.done < end; g.done++) {
    g.fill(g.done);
    warmUp([g.grid[g.done], g.alt.get(g.done)].filter((img): img is Img => !!img));
  }
}
/** A complete layout, right now (finishing any tiles not prepared yet). */
function gridFor(home: MapDef): Grid {
  const g = gridOf(home);
  nextTiles(g, Infinity);
  return g;
}

/** Images already sent to the graphics chip (the first draw of an image is the slow one). */
const warm = new WeakSet<Img>();
function warmUp(imgs: Img[]) {
  for (const img of imgs) {
    if (warm.has(img)) continue;
    warm.add(img);
    ctx.drawImage(img, 0, 0, 1, 1); // invisible: the next frame draws over it
  }
}

/**
 * In the spare time between frames, get the connected towns/routes ready: their tile layout
 * (a row at a time), any new tile images and their people's sprites, all on the graphics chip.
 * Then crossing into them costs (almost) nothing, even the first time.
 */
function prepareNeighbors() {
  clearIdle(); // the previous area's neighbors don't matter anymore
  for (const { m } of neighbors) {
    const g = gridOf(m);
    whenIdle(...Array.from({ length: Math.ceil((g.grid.length - g.done) / TILES_PER_JOB) }, () => () => nextTiles(g)));
    for (const n of m.npcs ?? []) {
      whenIdle(() => warmUp(n.look ? Object.values(framesFor(n.look)).flat() : n.object ? [OBJECTS[n.object]] : []));
    }
  }
}

/** Like the Game Boy, only the tiles on screen are drawn, every frame. */
function drawTiles(g: CanvasRenderingContext2D, camX: number, camY: number) {
  g.fillStyle = BLACK;
  g.fillRect(0, 0, W, H);
  const gridH = grid.length / gridW;
  // Animated tiles show their second frame half the time (like the Game Boy's water).
  const second = Math.floor(performance.now() / 500) % 2 === 1;
  for (let ty = Math.floor(camY / T); ty <= Math.floor((camY + H) / T); ty++) {
    const gy = ty + GRID;
    if (gy < 0 || gy >= gridH) continue;
    for (let tx = Math.floor(camX / T); tx <= Math.floor((camX + W) / T); tx++) {
      const gx = tx + GRID;
      if (gx < 0 || gx >= gridW) continue;
      const i = gy * gridW + gx;
      g.drawImage((second && gridAlt.get(i)) || grid[i], tx * T - camX, ty * T - camY);
    }
  }
}

/**
 * Fireflies after dark where wild Chispitas live (it's a firefly): a few glowing dots over the open ground, each
 * drifting in a small circle and blinking on and off. The same spots every night (they come from the tile).
 */
function drawFireflies(g: CanvasRenderingContext2D, camX: number, camY: number) {
  if (skyAt(clockHour()).light < 0.6 || !map.encounters?.table.some((e) => e.sp === 'chispita')) return;
  const t = performance.now() / 1000;
  for (let ty = Math.floor(camY / T); ty <= Math.floor((camY + H) / T); ty++)
    for (let tx = Math.floor(camX / T); tx <= Math.floor((camX + W) / T); tx++) {
      const h = (Math.imul(tx, 73856093) ^ Math.imul(ty, 19349663)) >>> 0;
      if (h % 6 !== 0 || !inBounds(tx, ty) || TILES[tileAt(tx, ty)].solid) continue;
      const phase = (h >>> 8) % 628 / 100;
      if (Math.sin(t * 1.3 + phase) < 0.2) continue; // blinking
      const x = Math.round(tx * T - camX + 8 + Math.cos(t * 0.7 + phase) * 5);
      const y = Math.round(ty * T - camY + 6 + Math.sin(t * 0.9 + phase) * 4);
      g.fillStyle = FIREFLY.halo;
      g.fillRect(x - 1, y - 1, 4, 4);
      g.fillStyle = FIREFLY.glow;
      g.fillRect(x, y, 2, 2);
    }
}

/** The grass you stepped into shakes: its blades drawn a pixel left, then right, over the tile. */
/** A thin tree being cut: a white slash across it, then its leaves flying off and falling. */
let cutFx: { x: number; y: number; at: number } | null = null;
const CUT_MS = 500;
function drawCut(g: CanvasRenderingContext2D, camX: number, camY: number) {
  if (!cutFx) return;
  const t = performance.now() - cutFx.at;
  if (t > CUT_MS) return void (cutFx = null);
  const [x, y] = [cutFx.x * T - camX, cutFx.y * T - camY];
  if (t < 120) {
    g.fillStyle = ACCENT.slash;
    for (let i = 0; i < 14; i++) g.fillRect(x + 1 + i, y + 14 - i, 2, 1);
    return;
  }
  const k = (t - 120) / (CUT_MS - 120);
  for (const [i, [dx, dy]] of [[-1, -1], [1, -1], [-1, 0.4], [1, 0.4], [0.2, -1.2]].entries()) {
    g.fillStyle = i % 2 ? ACCENT.leaf : ACCENT.leafLight;
    g.fillRect(Math.round(x + 7 + dx * 10 * k), Math.round(y + 6 + dy * 8 * k + 14 * k * k), 2, 2);
  }
}

function drawRustle(g: CanvasRenderingContext2D, camX: number, camY: number) {
  if (!rustle) return;
  const t = performance.now() - rustle.at;
  if (t > RUSTLE_MS) return void (rustle = null);
  const ch = tileAt(rustle.x, rustle.y);
  if (TILES[ch].kind !== 'tallgrass') return;
  const [x, y] = [rustle.x * T - camX, rustle.y * T - camY];
  g.save();
  g.beginPath();
  g.rect(x, y, T, T);
  g.clip();
  // The map's own tile (so it's shaded under the jungle's canopy too).
  g.drawImage(tileImage(ch, envAt(map, rustle.x, rustle.y)), x + (Math.floor(t / 80) % 2 ? 1 : -1), y);
  g.restore();
}

// ---------- Fog ----------

/** How the fog looks around you in a patch (world/region6.ts sets it as you walk): how far you see, and where it thins. */
export const fogView = { radius: 34, lean: null as Dir | null, leanBy: 0 };
let fogRadius = 34;

/** A cloud of fog: a dithered oval (pixels, not a blur, like everything else). */
let cloudImg: Img | null = null;
function cloud(): Img {
  if (cloudImg) return cloudImg;
  const [w, h] = [44, 16];
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const d = Math.hypot((x - w / 2 + 0.5) / (w / 2), (y - h / 2 + 0.5) / (h / 2));
      return d < 0.7 || (d < 1 && (x + y) % 2 === 0) ? 'c' : '.';
    }).join(''),
  );
  return (cloudImg = fromRows(rows, { c: FOG.cloud }, 'cloud'));
}

/**
 * The fog over everything: in a patch, a gloom (dusk-dark at any hour) and gray all around except a small patch where
 * you are (it leans toward where the fog thins); at an 'edge', gray along the top of the map. Clouds drifting
 * by (a little slower than the ground, so walking moves you through them), and what shines through.
 */
function drawFog(g: CanvasRenderingContext2D, cx: number, cy: number, camX: number, camY: number) {
  const t = performance.now() / 1000;
  g.save();
  let cloudsAbove = H;
  if (map.fog === 'patch') {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = FOG.gloom;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    fogRadius += (fogView.radius - fogRadius) * 0.05;
    const r = fogRadius + Math.sin(t * 1.3) * 1.5;
    const [lx, ly] = fogView.lean ? [DX[fogView.lean] * fogView.leanBy, DY[fogView.lean] * fogView.leanBy] : [0, 0];
    const fog = g.createRadialGradient(cx, cy, r * 0.45, cx + lx, cy + ly, r + Math.hypot(lx, ly));
    fog.addColorStop(0, FOG.clear);
    fog.addColorStop(1, FOG.thick);
    g.fillStyle = fog;
  } else {
    // Thick above the map, thinning out over its first rows: you step out of it onto the trail.
    const top = -T - camY;
    const fog = g.createLinearGradient(0, top + 4 * T, 0, top);
    fog.addColorStop(0, FOG.clear);
    fog.addColorStop(1, FOG.thick);
    g.fillStyle = fog;
    cloudsAbove = top + 2 * T;
  }
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.45;
  const img = cloud();
  const [spanX, spanY] = [W + img.width, H + img.height];
  for (let i = 0; i < 7; i++) {
    const x = ((((i * 61 + t * (5 + (i % 3) * 3) - camX * 0.6) % spanX) + spanX) % spanX) - img.width;
    const y = ((((i * 47 + Math.sin(t * 0.4 + i) * 6 - camY * 0.6) % spanY) + spanY) % spanY) - img.height;
    if (y < cloudsAbove) g.drawImage(img, Math.round(x), Math.round(y));
  }
  g.globalAlpha = 1;
  // Through the fog: the black dog's eyes, the white dog's glow.
  for (const n of npcs) {
    if (!n.visible || !n.def.glow || !n.def.object) continue;
    const [sx, sy] = [n.x * T - camX + (n.off?.x ?? 0), n.y * T - camY + (n.off?.y ?? 0)];
    if (n.def.glow === 'body') {
      g.globalAlpha = 0.8;
      g.drawImage(objectImg(n), sx, sy);
      g.globalAlpha = 1;
      continue;
    }
    for (const [ex, ey] of eyesOf(n.def.object)) {
      const x = sx + (n.def.mirrors && n.dir === 'right' ? 15 - ex : ex);
      g.fillStyle = FOG.eyeGlow;
      g.fillRect(x - 1, sy + ey - 1, 3, 3);
      g.fillStyle = FOG.eye;
      g.fillRect(x, sy + ey, 1, 1);
    }
  }
  g.restore();
}

/** Where an object's eyes are: the pixels of color 0 in its art. */
const eyeCache: Record<string, [number, number][]> = {};
const eyesOf = (object: string) =>
  (eyeCache[object] ??= OBJECTS_ART[object].rows.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === '0' ? [[x, y] as [number, number]] : []))));

/** An object's sprite, turned to face right when it's an animal seen from the side (NpcDef `mirrors`). */
const mirrored: Record<string, Img> = {};
function objectImg(n: NpcRT): Img {
  const id = n.def.object!;
  return n.def.mirrors && n.dir === 'right' ? (mirrored[id] ??= mirror(OBJECTS[id])) : OBJECTS[id];
}

/** Snap to the screen's real pixels: smooth motion (finer than game pixels) that stays crisp. */
const snap = (v: number) => Math.round(v * scaleFactor) / scaleFactor;

export function renderWorld(g: CanvasRenderingContext2D) {
  // Mid-step, draw the player as far along as time says (smooth on 90/120 Hz screens too).
  const prog = player.moving ? Math.min(player.dist, player.prog + player.speed * frameAlpha()) : 0;
  const off = player.moving ? player.dist - prog : 0;
  /** Hopping a ledge: the player rises and falls, over a shadow. */
  const hop = player.moving && (player.dist > T || player.hopping) ? Math.round(Math.sin((Math.PI * prog) / player.dist) * 8) : 0;
  const moveDir = player.slide ?? player.dir;
  const px = player.x * T - DX[moveDir] * off;
  const py = player.y * T - DY[moveDir] * off;
  const camX = snap(px - 64);
  const camY = snap(py - 64);
  drawTiles(g, camX, camY);
  drawRustle(g, camX, camY);
  drawCut(g, camX, camY);

  const sprites: { y: number; draw: () => void }[] = [];
  for (const n of npcs.concat(edgeNpcs)) {
    if (!n.visible) continue;
    const sx = n.x * T - camX + (n.off?.x ?? 0);
    const sy = n.y * T - camY + (n.off?.y ?? 0);
    if (sx < -T || sy < -T || sx > W || sy > H + T) continue;
    sprites.push({
      y: n.y * T + (n.def.object ? 0 : 0.5),
      draw: () => {
        if (n.def.object) g.drawImage(objectImg(n), sx, sy);
        else g.drawImage(framesFor(n.def.look ?? 'man')[n.dir][n.off?.frame ?? 0], sx, sy - 4);
        n.overlay?.(g, sx, sy);
        if (n.bubble > 0) g.drawImage(ALERT, sx + 4, sy - 16);
        else if (rematchReady(n.def.id)) g.drawImage(REMATCH, sx + 6, sy - 13);
      },
    });
  }
  const f = G.save.follower;
  if (f && !player.hidden) {
    // One step behind you, as far along as you are.
    const k = player.moving ? prog / player.dist : 1;
    const fx = (follower.fromX + (follower.x - follower.fromX) * k) * T - camX;
    const fy = (follower.fromY + (follower.y - follower.fromY) * k) * T - camY;
    const walking = player.moving && (follower.x !== follower.fromX || follower.y !== follower.fromY) && k < 0.5;
    sprites.push({ y: fy + camY - 0.5, draw: () => g.drawImage(framesFor(f.look)[follower.dir][walking ? 1 + player.step : 0], Math.round(fx), Math.round(fy) - 4) });
  }
  if (!player.hidden && player.frames) {
    const fr = player.frames[player.dir];
    const img = player.moving && !player.slide && player.prog < 8 ? fr[player.step ? 1 : 2] : fr[0];
    sprites.push({
      y: py,
      draw: () => {
        if (hop) {
          g.fillStyle = SHADOW;
          g.fillRect(67, 74, 10, 2);
        }
        // Swimming, you sit on your water Palabrita: it under you, you a little higher.
        if (G.save.surfing) g.drawImage(mountImg(player.dir), 64, 63 - hop);
        g.drawImage(img, 64, (G.save.surfing ? 57 : 60) - hop);
      },
    });
  }
  sprites.sort((a, b) => a.y - b.y).forEach((s) => s.draw());

  // Tall grass covers your feet, like in Gold/Silver, also while walking through it: the grass
  // tiles you're on (both while moving) are drawn over you, but only in a band at your feet,
  // so the tile you're leaving never covers your head.
  const under = player.moving ? [[player.x, player.y], [player.x - DX[player.dir], player.y - DY[player.dir]]] : [[player.x, player.y]];
  g.save();
  g.beginPath();
  g.rect(64, 64 + 9, T, T - 9);
  g.clip();
  for (const [tx, ty] of under) {
    if (TILES[tileAt(tx, ty)].kind !== 'tallgrass') continue;
    const ch = tileAt(tx, ty);
    g.drawImage((grassOverlays[ch] ??= tallGrassImage(ch)), tx * T - camX, ty * T - camY);
  }
  g.restore();
  if (map.night) {
    drawNight(g, 72, 68 - hop);
    drawLights(g, lights, -camX, -camY);
    if (map.fireworks) drawFireworks(g);
  } else if (map.outdoor) {
    drawDayTime(g, camX, camY);
    drawFireflies(g, camX, camY);
  } else if (map.floor === ';') drawDayTime(g, camX, camY); // caves (and the temple) darken at night too
  if (map.fog && !map.fogLifts?.()) drawFog(g, 72, 68 - hop, camX, camY);
  if (fade > 0) {
    g.globalAlpha = fade;
    g.fillStyle = fadeColor;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }
}

export const worldScene = { update: updateWorld, render: renderWorld };

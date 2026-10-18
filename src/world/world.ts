import { W, H, overlay, el, scaleFactor, ctx } from '../engine/screen';
import { input, type Dir } from '../engine/input';
import { sfx } from '../engine/sfx';
import { nextFrame, frames, frameAlpha, whenIdle, clearIdle } from '../engine/loop';
import { TILES, tallGrassImage, tileImage, tileOf, envAt } from '../art/tiles';
import { personFrames, OBJECTS, type Frames } from '../art/chars';
import type { Img } from '../art/pixel';
import { MAPS, type MapDef, type NpcDef, type Conn, type EncounterEntry } from './maps';
import { worldLayout } from './layout';
import { G, flag, saveGame, playerLook } from '../game/state';
import { itemCount } from '../game/bag';
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
export type ScriptFn = (c: ScriptCtx) => Promise<void>;

/** Filled in by scripts.ts. */
export const SCRIPTS: Record<string, ScriptFn> = {};

export const DX: Record<Dir, number> = { up: 0, down: 0, left: -1, right: 1 };
export const DY: Record<Dir, number> = { up: -1, down: 1, left: 0, right: 0 };
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
let banner: HTMLElement | null = null;
let grassOverlay: Img | null = null;

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
  /** Being carried by a water current this way (you keep facing where you were going). */
  slide: null as Dir | null,
  frames: null as Frames | null,
};

const frameCache: Record<string, Frames> = {};
function framesFor(look: string): Frames {
  return (frameCache[look] ??= personFrames(look));
}

export const currentMap = () => map;
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
  ({ grid, w: gridW } = gridFor(map));
  prepareNeighbors();
  // Maps change between versions: never leave a loaded save standing inside a wall.
  [x, y] = nearestFree(x, y);
  Object.assign(player, { x, y, dir, moving: false, prog: 0 });
  const frames = framesFor(playerLook());
  if (player.frames !== frames) {
    player.frames = frames;
    whenIdle(() => warmUp(Object.values(frames).flat())); // your walking frames, before the first step
  }
  Object.assign(G.save, { map: id, x, y, dir });
  if ((map.outdoor || map.banner) && map.name !== prevName) showBanner(map.name);
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

export const tileAt = (x: number, y: number) => tileOf(map, x, y);

function npcAt(x: number, y: number) {
  return npcs.find((n) => n.visible && n.x === x && n.y === y);
}

function walkable(x: number, y: number) {
  return inBounds(x, y) && !TILES[tileAt(x, y)].solid && !npcAt(x, y);
}

function nearestFree(x: number, y: number): [number, number] {
  for (let r = 0; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && walkable(x + dx, y + dy)) return [x + dx, y + dy];
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

export async function fadeOut(n = 8) {
  for (let i = 1; i <= n; i++) {
    fade = i / n;
    await nextFrame();
  }
}

export async function fadeIn(n = 8) {
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

/** Walk off the edge of an outdoor map into the connected one. */
/**
 * Walk off the edge of an outdoor map straight into the connected one, without a fade:
 * the neighbor is already drawn at the edge, so the step just continues on the new map.
 */
function crossConnection(d: Dir, conn: Conn) {
  const target = MAPS[conn.to];
  const x = d === 'left' ? target.rows[0].length - 1 : d === 'right' ? 0 : player.x + conn.offset;
  const y = d === 'up' ? target.rows.length - 1 : d === 'down' ? 0 : player.y + conn.offset;
  if (TILES[tileOf(target, x, y)].solid) return bump();
  loadMap(conn.to, x, y, d);
  startMove(player.x, player.y);
  whenIdle(saveGame); // not in the middle of the step
}

/** Walk the player one tile as part of a script (no encounters/triggers). */
export async function scriptedStep(d: Dir) {
  player.dir = d;
  const nx = player.x + DX[d];
  const ny = player.y + DY[d];
  if (!walkable(nx, ny)) return;
  player.scripted = true;
  startMove(nx, ny);
  while (player.moving) await nextFrame();
  player.scripted = false;
}

// ---------- Movement ----------

/** Start moving to (nx, ny), `dist` pixels away (a normal step is one tile; hopping a ledge is two). */
function startMove(nx: number, ny: number, dist = T) {
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
    if (!map.outdoor && map.exit && TILES[tileAt(player.x, player.y)].kind === 'mat' && d === 'down') {
      warp(map.exit.to, map.exit.x, map.exit.y, 'down');
      return;
    }
    const conn = map.connections?.[d];
    if (conn && !conn.scenery) crossConnection(d, conn);
    else bump();
    return;
  }
  const ledge = TILES[tileAt(nx, ny)].ledge;
  if (ledge) {
    // Hop down over it from the high side, landing on the tile beyond; it's a wall otherwise.
    const [lx, ly] = [nx + DX[d], ny + DY[d]];
    if (ledge !== d || !walkable(lx, ly)) return bump();
    sfx('jump');
    return startMove(lx, ly, 2 * T);
  }
  if (!walkable(nx, ny)) return bump();
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
  if (checkTrainers()) return;
  if (G.save.repel) {
    if (!--G.save.repel) runScript(() => say('El Repelente se acabó.', { en: 'The Repel wore off.' }));
    return;
  }
  const wildHere = map.encounters && (map.encounters.everywhere || TILES[tileAt(x, y)].kind === 'tallgrass');
  if (wildHere && Math.random() < map.encounters!.rate) runScript(SCRIPTS.__wild, { data: pickEncounter(map.encounters!.table) });
}

/** A random wild Palabrita from a table (by weight), with its level. */
export function pickEncounter(table: EncounterEntry[]): { sp: string; level: number } {
  let r = Math.random() * table.reduce((s, e) => s + e.w, 0);
  const e = table.find((t) => (r -= t.w) < 0) ?? table[0];
  return { sp: e.sp, level: e.min + Math.floor(Math.random() * (e.max - e.min + 1)) };
}

/** The tile you're facing. */
export const facingTile = () => tileAt(player.x + DX[player.dir], player.y + DY[player.dir]);

function checkTrainers(): boolean {
  for (const n of npcs) {
    if (!n.visible || !n.def.sight || flag(`beat:${n.def.id}`)) continue;
    for (let i = 1; i <= n.def.sight; i++) {
      const tx = n.x + DX[n.dir] * i;
      const ty = n.y + DY[n.dir] * i;
      if (tx === player.x && ty === player.y) {
        runScript(async (c) => {
          n.bubble = 45;
          sfx('alert');
          await frames(45);
          player.dir = OPP[n.dir];
          await SCRIPTS[n.def.script](c);
        }, { npc: n });
        return true;
      }
      if (!inBounds(tx, ty) || TILES[tileAt(tx, ty)].solid || npcAt(tx, ty)) break;
    }
  }
  return false;
}

function interact() {
  const fx = player.x + DX[player.dir];
  const fy = player.y + DY[player.dir];
  let n = npcAt(fx, fy);
  if (!n && TILES[tileAt(fx, fy)].kind === 'counter') n = npcAt(fx + DX[player.dir], fy + DY[player.dir]);
  if (n) {
    if (n.def.look) n.dir = OPP[player.dir];
    runScript(SCRIPTS[n.def.script], { npc: n });
    return;
  }
  const sign = map.signs?.find((s) => s.x === fx && s.y === fy);
  if (sign) {
    runScript(() => say(sign.es, { en: sign.en }));
    return;
  }
  const { look, script, kind } = TILES[tileAt(fx, fy)];
  if (kind === 'water' && itemCount('cana')) runScript(SCRIPTS.fish);
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

/** Put an NPC at (x, y), visible (e.g. the rival arriving from off-screen before walking in). */
export function placeNpc(id: string, x: number, y: number, dir: Dir) {
  const n = npcById(id);
  if (!n) return console.warn(`placeNpc: no NPC ${id}`);
  Object.assign(n, { x, y, dir, visible: true, off: undefined });
}

function updateNpcs() {
  for (const n of npcs) {
    if (n.bubble > 0) n.bubble--;
    if (!n.def.turns || G.lock > 0) continue;
    if (--n.turnTimer <= 0) {
      n.turnTimer = 120 + Math.floor(Math.random() * 240);
      n.dir = (['up', 'down', 'left', 'right'] as Dir[])[Math.floor(Math.random() * 4)];
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
      if (current && walkable(player.x + DX[current], player.y + DY[current])) {
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

function drawBubble(g: CanvasRenderingContext2D, x: number, y: number) {
  g.fillStyle = '#202028';
  g.fillRect(x + 4, y - 12, 9, 11);
  g.fillStyle = '#ffffff';
  g.fillRect(x + 5, y - 11, 7, 9);
  g.fillStyle = '#d83838';
  g.fillRect(x + 7, y - 10, 3, 4);
  g.fillRect(x + 7, y - 5, 3, 2);
}

/**
 * Which tile image goes where, for the map plus GRID tiles around it (the connected
 * towns/routes there, or trees; nothing indoors). Prepared once when a map loads, so drawing a
 * frame is just looking images up: nothing is created per frame.
 */
let grid: Img[] = [];
let gridW = 0;
/** A map's tile layout, kept per map: just references to tile images (about 10 KB a map). */
interface Grid {
  grid: Img[];
  w: number;
  h: number;
  /** Tiles filled in so far (it can be built a few tiles at a time, in spare moments). */
  done: number;
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
    const n = inMap(home, tx, ty) ? undefined : near.find(({ m, dx, dy }) => inMap(m, tx - dx, ty - dy));
    const [m, x, y] = n ? [n.m, tx - n.dx, ty - n.dy] : [home, tx, ty];
    grid[i] = tileImage(tileOf(m, x, y), envAt(m, x, y));
  };
  g = { grid, w, h, done: 0, fill };
  grids.set(home.id, g);
  return g;
}
/** Tiles per spare-time job: small, so painting new tiles never makes a frame late. */
const TILES_PER_JOB = 8;
/** Fill in (and send to the graphics chip) the next few tiles of a layout. */
function nextTiles(g: Grid, n = TILES_PER_JOB) {
  for (const end = Math.min(g.grid.length, g.done + n); g.done < end; g.done++) {
    g.fill(g.done);
    warmUp([g.grid[g.done]]);
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
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  const gridH = grid.length / gridW;
  for (let ty = Math.floor(camY / T); ty <= Math.floor((camY + H) / T); ty++) {
    const gy = ty + GRID;
    if (gy < 0 || gy >= gridH) continue;
    for (let tx = Math.floor(camX / T); tx <= Math.floor((camX + W) / T); tx++) {
      const gx = tx + GRID;
      if (gx >= 0 && gx < gridW) g.drawImage(grid[gy * gridW + gx], tx * T - camX, ty * T - camY);
    }
  }
}

/** Snap to the screen's real pixels: smooth motion (finer than game pixels) that stays crisp. */
const snap = (v: number) => Math.round(v * scaleFactor) / scaleFactor;

export function renderWorld(g: CanvasRenderingContext2D) {
  // Mid-step, draw the player as far along as time says (smooth on 90/120 Hz screens too).
  const prog = player.moving ? Math.min(player.dist, player.prog + player.speed * frameAlpha()) : 0;
  const off = player.moving ? player.dist - prog : 0;
  /** Hopping a ledge: the player rises and falls, over a shadow. */
  const hop = player.moving && player.dist > T ? Math.round(Math.sin((Math.PI * prog) / player.dist) * 8) : 0;
  const moveDir = player.slide ?? player.dir;
  const px = player.x * T - DX[moveDir] * off;
  const py = player.y * T - DY[moveDir] * off;
  const camX = snap(px - 64);
  const camY = snap(py - 64);
  drawTiles(g, camX, camY);

  const sprites: { y: number; draw: () => void }[] = [];
  for (const n of npcs.concat(edgeNpcs)) {
    if (!n.visible) continue;
    const sx = n.x * T - camX + (n.off?.x ?? 0);
    const sy = n.y * T - camY + (n.off?.y ?? 0);
    if (sx < -T || sy < -T || sx > W || sy > H + T) continue;
    sprites.push({
      y: n.y * T,
      draw: () => {
        if (n.def.object) g.drawImage(OBJECTS[n.def.object], sx, sy);
        else g.drawImage(framesFor(n.def.look ?? 'man')[n.dir][n.off?.frame ?? 0], sx, sy - 4);
        n.overlay?.(g, sx, sy);
        if (n.bubble > 0) drawBubble(g, sx, sy - 4);
      },
    });
  }
  if (!player.hidden && player.frames) {
    const fr = player.frames[player.dir];
    const img = player.moving && !player.slide && player.prog < 8 ? fr[player.step ? 1 : 2] : fr[0];
    sprites.push({
      y: py,
      draw: () => {
        if (hop) {
          g.fillStyle = 'rgba(0,0,0,0.25)';
          g.fillRect(67, 74, 10, 2);
        }
        g.drawImage(img, 64, 60 - hop);
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
    g.drawImage((grassOverlay ??= tallGrassImage()), tx * T - camX, ty * T - camY);
  }
  g.restore();
  if (fade > 0) {
    g.fillStyle = `rgba(0,0,0,${fade})`;
    g.fillRect(0, 0, W, H);
  }
}

export const worldScene = { update: updateWorld, render: renderWorld };

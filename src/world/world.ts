import { W, H, overlay, el } from '../engine/screen';
import { input, type Dir } from '../engine/input';
import { sfx } from '../engine/sfx';
import { nextFrame, frames } from '../engine/loop';
import { TILES, tileImage, tallGrassImage } from '../art/tiles';
import { personFrames, OBJECTS, type Frames } from '../art/chars';
import { makeCanvas, type Img } from '../art/pixel';
import { MAPS, type MapDef, type NpcDef, type Conn } from './maps';
import { G, flag, saveGame } from '../game/state';
import { closeText, say } from '../ui/textbox';

export interface NpcRT {
  def: NpcDef;
  x: number;
  y: number;
  dir: Dir;
  visible: boolean;
  bubble: number;
  turnTimer: number;
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

/** Pixels per frame (a tile is 16px). Gen 2 walks at 1; we go a bit faster. Hold B to run. */
const WALK_SPEED = 1.2;
const RUN_SPEED = 1.8;
const MARGIN = 6;
const T = 16;

let map: MapDef = MAPS.casa;
let mapImg: Img = makeCanvas(1, 1);
let npcs: NpcRT[] = [];
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

function drawTile(g: CanvasRenderingContext2D, ch: string, tx: number, ty: number, px: number, py: number) {
  const env = { rows: map.rows, outdoor: map.outdoor, floor: map.floor, ground: map.ground, roof: map.roof, x: tx, y: ty };
  g.drawImage(tileImage(ch, env), px, py);
}

function prerender() {
  const w = map.rows[0].length;
  const h = map.rows.length;
  const c = makeCanvas((w + MARGIN * 2) * T, (h + MARGIN * 2) * T);
  const g = c.getContext('2d')!;
  for (let ty = -MARGIN; ty < h + MARGIN; ty++) {
    for (let tx = -MARGIN; tx < w + MARGIN; tx++) {
      drawTile(g, tileAt(tx, ty), tx, ty, (tx + MARGIN) * T, (ty + MARGIN) * T);
    }
  }
  mapImg = c;
}

export function loadMap(id: string, x: number, y: number, dir: Dir) {
  const prevName = map?.name;
  map = MAPS[id];
  validate(map);
  prerender();
  npcs = (map.npcs ?? []).map((def) => ({
    def,
    x: def.x,
    y: def.y,
    dir: def.dir ?? 'down',
    visible: def.show ? def.show() : true,
    bubble: 0,
    turnTimer: 60 + Math.floor(Math.random() * 200),
  }));
  // Maps change between versions: never leave a loaded save standing inside a wall.
  [x, y] = nearestFree(x, y);
  Object.assign(player, { x, y, dir, moving: false, prog: 0 });
  player.frames ??= framesFor('player');
  Object.assign(G.save, { map: id, x, y, dir });
  if (map.outdoor && map.name !== prevName) showBanner(map.name);
}

export function refreshNpcs() {
  for (const n of npcs) n.visible = n.def.show ? n.def.show() : true;
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

const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && y < map.rows.length && x < map.rows[0].length;

export function tileAt(x: number, y: number): string {
  if (inBounds(x, y)) return map.rows[y][x];
  return map.outdoor ? 'T' : ' ';
}

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
  try {
    await fn(c);
  } catch (err) {
    console.error(err);
  } finally {
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
function crossConnection(d: Dir, conn: Conn) {
  const target = MAPS[conn.to];
  const x = d === 'left' ? target.rows[0].length - 1 : d === 'right' ? 0 : player.x + conn.offset;
  const y = d === 'up' ? target.rows.length - 1 : d === 'down' ? 0 : player.y + conn.offset;
  return transition(conn.to, x, y, d, 4);
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

function startMove(nx: number, ny: number) {
  player.x = nx;
  player.y = ny;
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
    if (conn) crossConnection(d, conn);
    else bump();
    return;
  }
  if (!walkable(nx, ny)) return bump();
  startMove(nx, ny);
}

function onStep() {
  const { x, y } = player;
  Object.assign(G.save, { x, y, dir: player.dir });
  const door = map.doors?.find((d) => d.x === x && d.y === y);
  if (door) {
    warp(door.to, door.tx, door.ty, 'up');
    return;
  }
  const trig = map.triggers?.find((t) => t.x === x && t.y === y);
  if (trig) {
    runScript(SCRIPTS[trig.script]);
    return;
  }
  if (checkTrainers()) return;
  if (TILES[tileAt(x, y)].kind === 'tallgrass' && map.encounters && Math.random() < map.encounters.rate) {
    const table = map.encounters.table;
    let r = Math.random() * table.reduce((s, e) => s + e.w, 0);
    const e = table.find((t) => (r -= t.w) < 0) ?? table[0];
    const level = e.min + Math.floor(Math.random() * (e.max - e.min + 1));
    runScript(SCRIPTS.__wild, { data: { sp: e.sp, level } });
  }
}

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
  const look = TILES[tileAt(fx, fy)].look;
  if (look) runScript(() => say(look.es, { en: look.en }));
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
    player.prog += input.isHeld('B') && !player.scripted ? RUN_SPEED : WALK_SPEED;
    if (player.prog >= T) {
      player.moving = false;
      player.prog = 0;
      player.justMoved = true;
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

export function renderWorld(g: CanvasRenderingContext2D) {
  const off = player.moving ? T - player.prog : 0;
  const px = player.x * T - DX[player.dir] * off;
  const py = player.y * T - DY[player.dir] * off;
  const camX = px - 64;
  const camY = py - 64;
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  g.drawImage(mapImg, -camX - MARGIN * T, -camY - MARGIN * T);

  const sprites: { y: number; draw: () => void }[] = [];
  for (const n of npcs) {
    if (!n.visible) continue;
    const sx = n.x * T - camX;
    const sy = n.y * T - camY;
    if (sx < -T || sy < -T || sx > W || sy > H + T) continue;
    sprites.push({
      y: n.y * T,
      draw: () => {
        if (n.def.object) g.drawImage(OBJECTS[n.def.object], sx, sy);
        else g.drawImage(framesFor(n.def.look ?? 'man')[n.dir][0], sx, sy - 4);
        n.overlay?.(g, sx, sy);
        if (n.bubble > 0) drawBubble(g, sx, sy - 4);
      },
    });
  }
  if (!player.hidden && player.frames) {
    const fr = player.frames[player.dir];
    const img = player.moving && player.prog < 8 ? fr[player.step ? 1 : 2] : fr[0];
    sprites.push({ y: py, draw: () => g.drawImage(img, 64, 60) });
  }
  sprites.sort((a, b) => a.y - b.y).forEach((s) => s.draw());

  // Tall grass covers your feet, like in Gold/Silver, also while walking through it:
  // the front half of the grass tiles you're on (both while moving) is drawn over you.
  const under = player.moving ? [[player.x, player.y], [player.x - DX[player.dir], player.y - DY[player.dir]]] : [[player.x, player.y]];
  for (const [tx, ty] of under) {
    if (TILES[tileAt(tx, ty)].kind !== 'tallgrass') continue;
    g.drawImage((grassOverlay ??= tallGrassImage()), 0, 9, 16, 7, tx * T - camX, ty * T - camY + 9, 16, 7);
  }
  if (fade > 0) {
    g.fillStyle = `rgba(0,0,0,${fade})`;
    g.fillRect(0, 0, W, H);
  }
}

export const worldScene = { update: updateWorld, render: renderWorld };

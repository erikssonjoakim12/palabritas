// The small movements on the map (plans/world-life.md, part 1): footprints in the sand and ash, ripples behind a
// swimmer and a splash as you get in, dust when you land after a ledge, birds pecking on the paths that fly off when
// you come near, smoke from a few chimneys, and waves rolling onto the beaches. All in the map's pixels, drawn by
// world.ts; nothing here touches the save, and nothing uses Math.random (tests pin it): spots come from a hash of the
// tile, so they're the same every visit.
import { TILES, tileOf } from '../art/tiles';
import { fromRows, mirror, T, type Img } from '../art/pixel';
import { AMBIENT, BIRD } from '../style/colors';
import { skyAt } from '../art/lights';
import { clockHour } from '../game/state';
import { W, H } from '../engine/screen';
import type { Dir } from '../engine/input';
import type { MapDef } from './maps';

const hash = (x: number, y: number) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
const now = () => performance.now();
/** Is a map-pixel point anywhere near the screen? */
const onScreen = (x: number, y: number, camX: number, camY: number, margin = 24) =>
  x > camX - margin && x < camX + W + margin && y > camY - margin && y < camY + H + margin;
/** The birds and the smoke only show by day (at dusk the birds have gone to roost). */
const daytime = () => skyAt(clockHour()).light < 0.4;

// ---------- What a map has: its beaches, chimneys and birds ----------

interface Shore { x: number; y: number; dx: number; dy: number; phase: number }
interface Bird { x: number; y: number; face: 1 | -1; phase: number; flown?: number }
interface Chimney { x: number; y: number; phase: number }

let shores: Shore[] = [];
let birds: Bird[] = [];
let chimneys: Chimney[] = [];
/** The map the effects belong to (it decides which ground takes footprints). */
let here: MapDef | null = null;

/** Birds on a route: about one per this many open tiles, never more than MAX_BIRDS. */
const BIRD_EVERY = 90;
const MAX_BIRDS = 6;
/** Open ground a bird lands on (not tall grass: it would be hidden). */
const BIRD_GROUND = new Set(['.', '=', ':', 's', 'i']);

/** Find a map's beaches, chimneys and birds, and clear what was left on the last one. */
export function ambientMap(m: MapDef) {
  here = m;
  marks.length = 0;
  bits.length = 0;
  shores = [];
  birds = [];
  chimneys = [];
  if (!m.outdoor || m.night) return;
  const at = (x: number, y: number) => tileOf(m, x, y);
  const people = new Set((m.npcs ?? []).map((n) => `${n.x},${n.y}`));
  const doors = new Set((m.doors ?? []).map((d) => `${d.x},${d.y}`));
  const roofs: Chimney[] = [];
  const spots: Bird[] = [];
  m.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const h = hash(x, y);
      // A wave rolls in from each side of the water that touches sand.
      if (ch === '~') {
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          if (at(x + dx, y + dy) === 's') shores.push({ x, y, dx, dy, phase: (x + y) * 0.45 });
        }
      }
      // A house's roof, at its top-right corner (the town's roof color, not the Palacentro, gym or school).
      if (ch === 'r' && at(x, y - 1) !== 'r' && at(x + 1, y) !== 'r') roofs.push({ x, y, phase: (h % 100) / 100 });
      // Birds on a route's open ground, away from people and doors.
      if (m.encounters && !m.encounters.everywhere && !m.storm && BIRD_GROUND.has(ch) && h % BIRD_EVERY === 0 && !people.has(`${x},${y}`) && !doors.has(`${x},${y}`)) {
        spots.push({ x, y, face: h & 1 ? 1 : -1, phase: (h >>> 8) % 1000 });
      }
    }),
  );
  // A chimney on every third house (at least one in a town), the same ones each visit.
  chimneys = roofs.filter((r, i) => hash(r.x, r.y) % 3 === 0 || (i === 0 && roofs.length > 0));
  birds = spots.sort((a, b) => hash(a.y, a.x) - hash(b.y, b.x)).slice(0, MAX_BIRDS);
}

// ---------- Footprints and ripples ----------

/** Footprints and ripples, where and when they were made. */
const marks: { kind: 'print' | 'ripple'; x: number; y: number; dir: Dir; at: number; ash?: boolean }[] = [];
const PRINT_MS = 4000;
const RIPPLE_MS = 700;
const MAX_MARKS = 30;

/** Does this ground keep footprints: sand, and the ash around the volcano. */
const softGround = (ch: string) => ch === 's' || ch === 'i' || (ch === '.' && (here?.ground === 'ash' || here?.ground === 'sand'));

/**
 * A step: footprints on soft ground, or a ripple while you swim, both on the tile you leave (from). The
 * step has only begun: marks on the tile ahead would show before you're there (the user: steps only behind you).
 */
export function stepFx(dir: Dir, from: [number, number], swimming: boolean) {
  if (!here?.outdoor) return;
  const ch = tileOf(here, from[0], from[1]);
  if (swimming) marks.push({ kind: 'ripple', x: from[0], y: from[1], dir, at: now() });
  else if (softGround(ch)) marks.push({ kind: 'print', x: from[0], y: from[1], dir, at: now(), ash: ch === 'i' || (ch === '.' && here.ground === 'ash') });
  if (marks.length > MAX_MARKS) marks.shift();
}

function drawMarks(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const t = now();
  while (marks.length && t - marks[0].at > (marks[0].kind === 'print' ? PRINT_MS : RIPPLE_MS)) marks.shift();
  for (const m of marks) {
    const [x, y] = [m.x * T - camX, m.y * T - camY];
    if (x < -T || y < -T || x > W || y > H) continue;
    const age = t - m.at;
    if (m.kind === 'print') {
      // Two feet, side by side across the way you walked; they fade over the last part of their life.
      g.globalAlpha = Math.min(1, (PRINT_MS - age) / 1500);
      g.fillStyle = m.ash ? AMBIENT.ashPrint : AMBIENT.sandPrint;
      if (m.dir === 'up' || m.dir === 'down') {
        g.fillRect(x + 4, y + 6, 2, 3);
        g.fillRect(x + 10, y + 9, 2, 3);
      } else {
        g.fillRect(x + 4, y + 8, 3, 2);
        g.fillRect(x + 9, y + 11, 3, 2);
      }
    } else {
      // A ring that spreads on the water and fades: pixels on an ellipse, crisp like the rest.
      const k = age / RIPPLE_MS;
      g.globalAlpha = 1 - k;
      g.fillStyle = AMBIENT.foam;
      const [rx, ry] = [3 + k * 7, 1.5 + k * 3];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        g.fillRect(Math.round(x + 8 + Math.cos(a) * rx), Math.round(y + 11 + Math.sin(a) * ry), 1, 1);
      }
    }
  }
  g.globalAlpha = 1;
}

// ---------- Splashes and dust ----------

/** Little flying bits (a splash's drops, a landing's dust), in map pixels, with a bit of gravity. */
const bits: { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; fall: number }[] = [];

/** Getting into the water: drops thrown up around you. */
export function splashFx(x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * (0.15 + (0.7 * i) / 7); // a fan, upwards
    bits.push({ x: x * T + 8, y: y * T + 10, vx: -Math.cos(a) * 1.1, vy: -Math.sin(a) * 1.6, life: 22, max: 22, color: AMBIENT.foam, size: 1, fall: 0.12 });
  }
}

/** Landing after a ledge: a puff of dust out to each side of your feet. */
export function landFx(x: number, y: number) {
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) bits.push({ x: x * T + 8 + s * 4, y: y * T + 13, vx: s * (0.5 + i * 0.3), vy: -0.2 - i * 0.15, life: 16, max: 16, color: AMBIENT.dust, size: 2, fall: 0 });
  }
}

function drawBits(g: CanvasRenderingContext2D, camX: number, camY: number) {
  for (const b of bits) {
    Object.assign(b, { x: b.x + b.vx, y: b.y + b.vy, vy: b.vy + b.fall, life: b.life - 1 });
    g.globalAlpha = Math.max(0, b.life / b.max);
    g.fillStyle = b.color;
    const s = b.size + (b.fall ? 0 : Math.floor((b.max - b.life) / 6));
    g.fillRect(Math.round(b.x - camX), Math.round(b.y - camY), s, s);
  }
  g.globalAlpha = 1;
  while (bits.length && bits[0].life <= 0) bits.shift();
}

// ---------- Waves ----------

/** A wave's foam: a dashed line that rolls in to the sand and back, each stretch of beach a moment after the last. */
function drawWaves(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const t = now() / 1000;
  g.fillStyle = AMBIENT.foam;
  for (const s of shores) {
    const [x, y] = [s.x * T - camX, s.y * T - camY];
    if (x < -T || y < -T || x > W || y > H) continue;
    const swell = (Math.sin(t * 1.4 - s.phase) + 1) / 2; // 0: out on the water, 1: up at the sand
    const d = Math.round(1 + (1 - swell) * 5); // pixels out from the edge
    g.globalAlpha = 0.35 + swell * 0.55;
    for (let i = 0; i < T; i++) {
      if ((i + Math.floor(t * 3) + s.x * 3 + s.y) % 5 === 4) continue; // broken foam
      // The edge it rolls toward: the side of the tile that touches the sand.
      if (s.dy) g.fillRect(x + i, s.dy < 0 ? y + d - 1 : y + T - d, 1, 1);
      else g.fillRect(s.dx < 0 ? x + d - 1 : x + T - d, y + i, 1, 1);
    }
  }
  g.globalAlpha = 1;
}

// ---------- Birds ----------

/** A sparrow, facing right: standing, pecking (head down), and in flight (wings up, wings down). */
const BIRD_STAND = fromRows(['.....kkk.', '....kddkk', '.kkkkdddy', 'kddddlllk', '.kddlllk.', '..kkkkk..', '...k.k...'], BIRD, 'bird');
const BIRD_PECK = fromRows(['.........', '.kkkk....', 'kddddkkk.', 'kddddddkk', '.kddlllky', '..kkkkkk.', '...k.k...'], BIRD, 'bird peck');
const BIRD_UP = fromRows(['k.......k', 'dk.....kd', '.dk.k.kd.', '..ddddd..', '...kkk...'], BIRD, 'bird up');
const BIRD_DOWN = fromRows(['.........', '..ddddd..', '.dkdkdkd.', 'dk..k..kd', 'k.......k'], BIRD, 'bird down');
const FACING: Record<string, Img> = { stand: BIRD_STAND, peck: BIRD_PECK, standL: mirror(BIRD_STAND), peckL: mirror(BIRD_PECK) };
/** How close you come before a bird flies off (tiles), and how long it's in the air before it's out of sight. */
const SHY = 2;
const FLIGHT_MS = 1600;

/** Birds take off when you come near (where you are or are walking to: x, y), away from you. */
export function updateBirds(x: number, y: number) {
  if (!birds.length || !daytime()) return;
  for (const b of birds) {
    if (b.flown || Math.abs(b.x - x) + Math.abs(b.y - y) > SHY) continue;
    b.flown = now();
    b.face = b.x >= x ? 1 : -1;
  }
}

/** Birds still on the ground, pecking now and then: drawn under people. */
function drawBirdsOnGround(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const t = now();
  for (const b of birds) {
    if (b.flown) continue;
    const [x, y] = [b.x * T - camX + 4, b.y * T - camY + 7];
    if (!onScreen(x + camX, y + camY, camX, camY)) continue;
    const peck = (t + b.phase * 7) % 1400 < 260;
    g.drawImage(FACING[(peck ? 'peck' : 'stand') + (b.face < 0 ? 'L' : '')], x, y);
  }
}

/** Birds in the air, flapping up and away, over everything. */
function drawBirdsFlying(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const t = now();
  for (const b of birds) {
    if (!b.flown) continue;
    const s = (t - b.flown) / 1000;
    if (s * 1000 > FLIGHT_MS) continue;
    const x = b.x * T - camX + 4 + b.face * s * 70;
    const y = b.y * T - camY + 8 - s * 60 - s * s * 10;
    g.globalAlpha = Math.min(1, (FLIGHT_MS - s * 1000) / 400);
    g.drawImage(Math.floor(s * 12) % 2 ? BIRD_UP : BIRD_DOWN, Math.round(x), Math.round(y));
  }
  g.globalAlpha = 1;
}

// ---------- Chimneys ----------

/** Where a chimney's top is on the screen. */
const chimneyTop = (c: Chimney, camX: number, camY: number) => [c.x * T - camX + 8, c.y * T - camY - 2];

/** A brick chimney on the roof (under anyone standing behind the house). */
function drawChimneys(g: CanvasRenderingContext2D, camX: number, camY: number) {
  for (const c of chimneys) {
    const [x, y] = chimneyTop(c, camX, camY);
    if (!onScreen(x + camX, y + camY, camX, camY)) continue;
    g.fillStyle = AMBIENT.chimney[1];
    g.fillRect(x, y, 5, 7);
    g.fillStyle = AMBIENT.chimney[0];
    g.fillRect(x + 1, y + 1, 3, 6);
    g.fillStyle = AMBIENT.chimney[1];
    g.fillRect(x - 1, y, 7, 2);
  }
}

/** Smoke rising from the chimneys and drifting off with the wind (by day: it wouldn't show against the night). */
function drawSmoke(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const t = now() / 1000;
  for (const c of chimneys) {
    const [x, y] = chimneyTop(c, camX, camY);
    if (!onScreen(x + camX, y + camY, camX, camY, 40)) continue;
    for (let k = 0; k < 5; k++) {
      const age = (t / 3.2 + k / 5 + c.phase) % 1; // each puff from the chimney's top up into the air
      const px = x + 2 + age * 12 + Math.sin(t * 2 + k * 1.7) * 1.2;
      const py = y - 2 - age * 24;
      const r = 1.5 + age * 2.5;
      const [l, tp, w, h] = [Math.round(px - r), Math.round(py - r * 0.8), Math.round(r * 2), Math.round(r * 1.6)];
      // A grey edge (it shows on the pale town ground) around a light middle (it shows against trees and roofs).
      g.globalAlpha = 0.8 * (1 - age);
      g.fillStyle = AMBIENT.smoke[1];
      g.fillRect(l, tp, w, h);
      g.fillStyle = AMBIENT.smoke[0];
      g.fillRect(l + 1, tp + 1, w - 2, h - 2);
    }
    g.globalAlpha = 1;
  }
}

// ---------- Drawing, in world.ts's order ----------

/** On the ground, under everyone: waves, footprints, ripples, chimneys, birds pecking. */
export function drawAmbientGround(g: CanvasRenderingContext2D, camX: number, camY: number) {
  if (shores.length) drawWaves(g, camX, camY);
  if (marks.length) drawMarks(g, camX, camY);
  if (chimneys.length) drawChimneys(g, camX, camY);
  if (birds.length && daytime()) drawBirdsOnGround(g, camX, camY);
}

/** Over everyone: chimney smoke, birds in the air, splashes and dust. */
export function drawAmbientAir(g: CanvasRenderingContext2D, camX: number, camY: number) {
  if (chimneys.length && daytime()) drawSmoke(g, camX, camY);
  if (birds.length) drawBirdsFlying(g, camX, camY);
  if (bits.length) drawBits(g, camX, camY);
}

/** For tests: what a map has (after ambientMap). */
export const ambientCounts = () => ({ shores: shores.length, birds: birds.length, chimneys: chimneys.length, marks: marks.length });
export const markSpots = () => marks.map(({ kind, x, y }) => ({ kind, x, y }));
/** Is anything solid there? (Birds never sit inside a wall: a check the tests make.) */
export const birdSpots = () => birds.map((b) => ({ x: b.x, y: b.y, flown: !!b.flown, solid: !!here && TILES[tileOf(here, b.x, b.y)].solid }));

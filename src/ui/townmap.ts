import { overlay, el } from '../engine/screen';
import { input, type Dir } from '../engine/input';
import { sfx } from '../engine/sfx';
import { MAPS, type MapDef } from '../world/maps';
import { worldLayout } from '../world/layout';
import { currentMap, player } from '../world/world';
import { TOWN_MAP } from '../style/colors';
import { isHole } from '../art/tiles';

/*
  The town map (START → MAPA), kept simple: the outdoor world drawn small, one pixel per tile in the world's own
  colors, with where you are blinking. The arrows (or a tap) pick a place and show its name.
*/

/** Which outdoor map a place belongs to: itself, its day version, or the map its way out leads to. */
function outdoorOf(m: MapDef, seen = new Set<string>()): { map: MapDef; x?: number; y?: number } | null {
  const L = worldLayout();
  if (L[m.id]) return { map: m };
  const day = MAPS[m.id.replace(/_noche$/, '')];
  if (day && L[day.id]) return { map: day };
  if (!m.exit || seen.has(m.id)) return null;
  const out = outdoorOf(MAPS[m.exit.to], seen.add(m.id));
  return out && { map: out.map, x: out.x ?? m.exit.x, y: out.y ?? m.exit.y };
}

const BUILDINGS = 'rbopqhwdcGaMNAFUQ';

/** A tile's color on the town map. */
function tileColor(ch: string, m: MapDef): string {
  if ('~8246'.includes(ch)) return TOWN_MAP.water;
  if (ch === 's') return TOWN_MAP.sand;
  if ('TtIJY'.includes(ch)) return TOWN_MAP.trees;
  if ('[](' .includes(ch)) return TOWN_MAP.rock;
  if (ch === '^' || ch === 'O') return m.style?.rock === 'basalt' ? TOWN_MAP.basalt : TOWN_MAP.rock;
  if ('iXE'.includes(ch)) return TOWN_MAP.ash;
  if (ch === 'j') return TOWN_MAP.lava;
  if (BUILDINGS.includes(ch)) return TOWN_MAP.building;
  if ('=l:fSDH'.includes(ch)) return TOWN_MAP.path;
  if (ch === '.') return m.ground === 'town' ? TOWN_MAP.path : m.ground === 'sand' ? TOWN_MAP.sand : m.ground === 'ash' ? TOWN_MAP.ash : TOWN_MAP.grass;
  return TOWN_MAP.grass;
}

/** The world's places and the map drawn once (it never changes while the game runs). */
let drawn: { canvas: HTMLCanvasElement; x0: number; y0: number; places: { id: string; x: number; y: number; w: number; h: number }[] } | null = null;
function drawWorld() {
  if (drawn) return drawn;
  const L = worldLayout();
  const places = Object.entries(L).map(([id, p]) => ({ id, x: p.x, y: p.y, w: MAPS[id].rows[0].length, h: MAPS[id].rows.length }));
  const x0 = Math.min(...places.map((p) => p.x)), y0 = Math.min(...places.map((p) => p.y));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(...places.map((p) => p.x + p.w)) - x0;
  canvas.height = Math.max(...places.map((p) => p.y + p.h)) - y0;
  const g = canvas.getContext('2d')!;
  g.fillStyle = TOWN_MAP.beyond;
  g.fillRect(0, 0, canvas.width, canvas.height);
  for (const p of places) {
    const m = MAPS[p.id];
    m.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (isHole(m, x, y)) return;
      g.fillStyle = tileColor(ch, m);
      g.fillRect(p.x - x0 + x, p.y - y0 + y, 1, 1);
    }));
  }
  for (const p of places) Object.assign(p, { x: p.x - x0, y: p.y - y0 });
  drawn = { canvas, x0, y0, places };
  return drawn;
}

/** The place whose middle is nearest in direction `dir` from place `from` (roughly that way, not sideways). */
function nextPlace(places: NonNullable<typeof drawn>['places'], from: number, dir: Dir): number {
  const mid = (p: (typeof places)[number]) => [p.x + p.w / 2, p.y + p.h / 2];
  const [fx, fy] = mid(places[from]);
  const [ux, uy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  let best = from, bestScore = Infinity;
  places.forEach((p, i) => {
    const [x, y] = mid(p);
    const ahead = (x - fx) * ux + (y - fy) * uy;
    const side = Math.abs((x - fx) * uy) + Math.abs((y - fy) * ux);
    if (i === from || ahead <= 0 || side > ahead * 1.5) return;
    if (ahead + side * 2 < bestScore) (best = i), (bestScore = ahead + side * 2);
  });
  return best;
}

/** Show the town map until A, B or a tap outside it. */
export function townMap(): Promise<void> {
  const { canvas: world, places } = drawWorld();
  const here = outdoorOf(currentMap());
  const you = here && {
    x: places.find((p) => p.id === here.map.id)!.x + (here.x ?? player.x),
    y: places.find((p) => p.id === here.map.id)!.y + (here.y ?? player.y),
  };
  let sel = Math.max(0, places.findIndex((p) => p.id === here?.map.id));

  const box = el('div', 'box fullpanel townmap');
  const view = document.createElement('canvas');
  view.width = world.width;
  view.height = world.height;
  const name = el('div', 'townmap-name');
  box.append(el('div', 'menu-title', 'MAPA'), view, name);
  overlay.appendChild(box);

  let blink = true;
  const draw = () => {
    const g = view.getContext('2d')!;
    g.drawImage(world, 0, 0);
    const p = places[sel];
    g.strokeStyle = TOWN_MAP.cursor;
    g.lineWidth = 2;
    g.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    if (you && blink) {
      g.fillStyle = TOWN_MAP.you;
      g.fillRect(you.x - 2, you.y - 2, 5, 5);
    }
    name.textContent = MAPS[p.id].name;
  };
  draw();
  const timer = setInterval(() => ((blink = !blink), draw()), 400);

  return new Promise((resolve) => {
    const close = () => {
      clearInterval(timer);
      pop();
      box.remove();
      sfx('select');
      resolve();
    };
    const pop = input.push((b) => {
      if (b === 'A' || b === 'B') return close();
      if (b !== 'up' && b !== 'down' && b !== 'left' && b !== 'right') return;
      const next = nextPlace(places, sel, b);
      if (next !== sel) (sel = next), sfx('blip'), draw();
    });
    view.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = view.getBoundingClientRect();
      const [x, y] = [((e.clientX - r.left) / r.width) * view.width, ((e.clientY - r.top) / r.height) * view.height];
      const i = places.findIndex((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h && !isHole(MAPS[p.id], Math.floor(x - p.x), Math.floor(y - p.y)));
      if (i >= 0) (sel = i), sfx('blip'), draw();
    });
    box.addEventListener('click', close);
  });
}

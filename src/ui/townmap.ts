import { overlay, el } from '../engine/screen';
import { input, type Dir } from '../engine/input';
import { sfx } from '../engine/sfx';
import { MAPS, type MapDef } from '../world/maps';
import { worldLayout } from '../world/layout';
import { currentMap, player } from '../world/world';
import { TOWN_MAP } from '../style/colors';
import { isHole } from '../art/tiles';

/*
  The town map (START → MAPA), simple like the original games': land and water, the routes as straight lines
  between the places they join, the towns as squares, and you blinking. The arrows (or a tap) pick a place and
  show its name. Only places you can get to are on it (Villa Jaguar waits for Surf).
*/

/** World tiles per pixel of the map: chunky, like the Game Boy's. */
const S = 2;

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

/** Every map you can walk to from home: by roads, doors and ways out (not scenery). */
function reachable(): Set<string> {
  const seen = new Set(['amanecer']);
  const queue = ['amanecer'];
  while (queue.length) {
    const m = MAPS[queue.shift()!];
    const next = [
      ...Object.values(m.connections ?? {}).filter((c) => c && !c.scenery).map((c) => c!.to),
      ...(m.doors ?? []).map((d) => d.to),
      ...(m.exit ? [m.exit.to] : []),
    ];
    for (const id of next) if (MAPS[id] && !seen.has(id)) (seen.add(id), queue.push(id));
  }
  return seen;
}

/** Mostly water (the lake): you can pick it, but no road line runs out over the water. */
const isWater = (m: MapDef) => m.rows.join('').split('~').length - 1 > (m.rows.length * m.rows[0].length) / 2;

/** A town: town ground, or its own Palacentro (not the one on Ruta 3). */
const isTown = (m: MapDef) =>
  m.ground === 'town' || (!m.name.startsWith('Ruta') && Object.values(MAPS).some((o) => o.id.startsWith('centro') && o.exit?.to === m.id));

interface Place {
  id: string;
  /** Its middle, in map pixels. */
  x: number;
  y: number;
  town: boolean;
}

/** The map drawn once (it never changes while the game runs), and the places on it. */
let drawn: { canvas: HTMLCanvasElement; x0: number; y0: number; places: Place[] } | null = null;
function drawWorld() {
  if (drawn) return drawn;
  const L = worldLayout();
  const ids = Object.keys(L);
  const size = (id: string) => [MAPS[id].rows[0].length, MAPS[id].rows.length];
  const x0 = Math.min(...ids.map((id) => L[id].x)), y0 = Math.min(...ids.map((id) => L[id].y));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((Math.max(...ids.map((id) => L[id].x + size(id)[0])) - x0) / S);
  canvas.height = Math.ceil((Math.max(...ids.map((id) => L[id].y + size(id)[1])) - y0) / S);
  const g = canvas.getContext('2d')!;
  g.fillStyle = TOWN_MAP.beyond;
  g.fillRect(0, 0, canvas.width, canvas.height);
  // Land and water.
  for (const id of ids) {
    const m = MAPS[id];
    for (let y = 0; y < m.rows.length; y += S)
      for (let x = 0; x < m.rows[0].length; x += S) {
        if (isHole(m, x, y)) continue;
        g.fillStyle = m.rows[y][x] === '~' ? TOWN_MAP.water : TOWN_MAP.land;
        g.fillRect(Math.floor((L[id].x - x0 + x) / S), Math.floor((L[id].y - y0 + y) / S), 1, 1);
      }
  }
  const open = reachable();
  const mid = (id: string) => [(L[id].x - x0 + size(id)[0] / 2) / S, (L[id].y - y0 + size(id)[1] / 2) / S];
  // The routes: from each place to where its road crosses into the next, and on to that place.
  g.strokeStyle = TOWN_MAP.path;
  g.lineWidth = 2;
  for (const id of ids.filter((i) => open.has(i))) {
    for (const [dir, c] of Object.entries(MAPS[id].connections ?? {})) {
      if (!c || c.scenery || !open.has(c.to) || id > c.to || isWater(MAPS[id]) || isWater(MAPS[c.to])) continue;
      const [w, h] = size(id);
      const along = dir === 'up' || dir === 'down';
      const side = { up: [w / 2, 0], down: [w / 2, h], left: [0, h / 2], right: [w, h / 2] }[dir]!;
      // Where the road crosses: the middle of the walkable tiles on that edge.
      const edge = Array.from({ length: along ? w : h }, (_, i) => i).filter((i) => {
        const [x, y] = along ? [i, dir === 'up' ? 0 : h - 1] : [dir === 'left' ? 0 : w - 1, i];
        return !'TtIJY^~%'.includes(MAPS[id].rows[y][x]);
      });
      const at = edge.length ? (edge[0] + edge[edge.length - 1] + 1) / 2 : along ? w / 2 : h / 2;
      const [sx, sy] = [(L[id].x - x0 + (along ? at : side[0])) / S, (L[id].y - y0 + (along ? side[1] : at)) / S];
      const [ax, ay] = mid(id), [bx, by] = mid(c.to);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(along ? sx : ax, along ? ay : sy);
      g.lineTo(sx, sy);
      g.lineTo(along ? sx : bx, along ? by : sy);
      g.lineTo(bx, by);
      g.stroke();
    }
  }
  const places = ids.filter((id) => open.has(id)).map((id) => ({ id, x: mid(id)[0], y: mid(id)[1], town: isTown(MAPS[id]) }));
  for (const p of places.filter((q) => q.town)) {
    g.fillStyle = TOWN_MAP.town;
    g.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 5, 5);
  }
  drawn = { canvas, x0, y0, places };
  return drawn;
}

/** The place nearest in direction `dir` from place `from` (roughly that way, not sideways). */
function nextPlace(places: Place[], from: number, dir: Dir): number {
  const { x: fx, y: fy } = places[from];
  const [ux, uy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  let best = from, bestScore = Infinity;
  places.forEach((p, i) => {
    const ahead = (p.x - fx) * ux + (p.y - fy) * uy;
    const side = Math.abs((p.x - fx) * uy) + Math.abs((p.y - fy) * ux);
    if (i === from || ahead <= 0 || side > ahead * 1.5) return;
    if (ahead + side * 2 < bestScore) (best = i), (bestScore = ahead + side * 2);
  });
  return best;
}

/** Show the town map until A, B or a tap outside it. */
export function townMap(): Promise<void> {
  const { canvas: world, x0, y0, places } = drawWorld();
  const L = worldLayout();
  const here = outdoorOf(currentMap());
  const you = here && { x: (L[here.map.id].x - x0 + (here.x ?? player.x)) / S, y: (L[here.map.id].y - y0 + (here.y ?? player.y)) / S };
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
    g.lineWidth = 1;
    g.strokeRect(Math.round(p.x) - 3.5, Math.round(p.y) - 3.5, 8, 8);
    if (you && blink) {
      g.fillStyle = TOWN_MAP.you;
      g.fillRect(Math.round(you.x) - 1, Math.round(you.y) - 1, 3, 3);
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
      let best = sel, dist = Infinity;
      places.forEach((p, i) => {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < dist) (best = i), (dist = d);
      });
      if (best !== sel) (sel = best), sfx('blip'), draw();
    });
    box.addEventListener('click', close);
  });
}

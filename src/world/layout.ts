import { MAPS, type MapDef } from './maps';
import { isHole, lookAcrossEdges } from '../art/tiles';

/*
  Like Gold/Silver, every town and route is its own map, joined to its neighbors by
  `connections` (see world/maps/). This works out where each outdoor map sits in one big world
  grid (in tiles), so the game can draw the neighbors at the edges and the art page can show
  the whole world. Change a map freely: only its connection offsets have to line up.
*/

const START = 'amanecer';

export interface Spot {
  x: number;
  y: number;
}

let layout: Record<string, Spot> | null = null;

/** Where map `to` starts, seen from map `from` at `p`, for a connection in direction `dir`. */
function neighborSpot(from: MapDef, p: Spot, dir: string, to: MapDef, offset: number): Spot {
  const [w1, h1, w2, h2] = [from.rows[0].length, from.rows.length, to.rows[0].length, to.rows.length];
  if (dir === 'up') return { x: p.x - offset, y: p.y - h2 };
  if (dir === 'down') return { x: p.x - offset, y: p.y + h1 };
  if (dir === 'left') return { x: p.x - w2, y: p.y - offset };
  return { x: p.x + w1, y: p.y - offset };
}

/** Every outdoor map's top-left corner in the world grid. */
export function worldLayout(): Record<string, Spot> {
  if (layout) return layout;
  const spots: Record<string, Spot> = { [START]: { x: 0, y: 0 } };
  const queue = [START];
  while (queue.length) {
    const id = queue.shift()!;
    const m = MAPS[id];
    for (const [dir, conn] of Object.entries(m.connections ?? {})) {
      if (!conn || spots[conn.to]) continue;
      spots[conn.to] = neighborSpot(m, spots[id], dir, MAPS[conn.to], conn.offset);
      queue.push(conn.to);
    }
    for (const o of Object.values(MAPS)) {
      if (o.at?.map !== id || spots[o.id]) continue;
      spots[o.id] = { x: spots[id].x + o.at.x, y: spots[id].y + o.at.y };
      queue.push(o.id);
    }
  }
  layout = spots;
  return spots;
}

/** Which other outdoor map in the world has (x, y) of map `id` (beyond its edge, or in a hole), and where in it. */
export function mapAcross(id: string, x: number, y: number): { id: string; x: number; y: number } | undefined {
  const L = worldLayout();
  const p = L[id];
  if (!p) return undefined;
  for (const [oid, q] of Object.entries(L)) {
    const o = MAPS[oid];
    const [ox, oy] = [p.x + x - q.x, p.y + y - q.y];
    if (oid !== id && oy >= 0 && oy < o.rows.length && ox >= 0 && ox < o.rows[0].length && !isHole(o, ox, oy)) return { id: oid, x: ox, y: oy };
  }
  return undefined;
}
lookAcrossEdges((id, x, y) => {
  const there = mapAcross(id, x, y);
  return there && MAPS[there.id].rows[there.y][there.x];
});

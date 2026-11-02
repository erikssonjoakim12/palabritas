import { G } from '../game/state';
import { MAPS } from './maps';

/*
  Fly (the 6th medal, plans/surf-fly.md): from the team menu, pick a town you've been to on the map, and a big bird
  carries you there. You land outside the town's Palacentro (at home, outside your house).
*/

let spots: Record<string, { x: number; y: number }> | null = null;

/** Where Fly lands in each town it can take you to, by town map id. */
export function flySpots() {
  if (spots) return spots;
  spots = {};
  for (const m of Object.values(MAPS)) if (m.id.startsWith('centro_') && m.exit) spots[m.exit.to] = { x: m.exit.x, y: m.exit.y };
  const home = MAPS.casa.exit!;
  spots[home.to] = { x: home.x, y: home.y };
  return spots;
}

/** Remember a town once you've been there (loadMap calls this for every map). */
export function visit(mapId: string) {
  if (flySpots()[mapId] && !G.save.visited.includes(mapId)) G.save.visited.push(mapId);
}

/** The towns Fly can take you to now. */
export const flyTowns = () => G.save.visited.filter((id) => flySpots()[id]);

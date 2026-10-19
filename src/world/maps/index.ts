import { MAPS, type MapDef, type GateDef } from './kit';
import { REGION1_MAPS } from './region1';
import { REGION2_MAPS } from './region2';
import { REGION3_MAPS } from './region3';

// Every map, one file per region (the building blocks they share are in kit.ts).
export * from './kit';
Object.assign(MAPS, REGION1_MAPS, REGION2_MAPS, REGION3_MAPS);

// Each gate's guard (on the road, or aside once it's open) and the tiles where you get stopped.
for (const m of Object.values(MAPS)) {
  for (const g of m.gates ?? []) {
    const [x, y, dir] = g.at;
    (m.npcs ??= []).push(
      { id: g.id, x, y, look: g.look, dir, script: 'gate', show: () => !g.opens(), mime: g.mime },
      { id: `${g.id}_aside`, x: g.aside[0], y: g.aside[1], look: g.look, dir: 'down', script: 'gate', turns: true, show: g.opens },
    );
    (m.triggers ??= []).push(...g.road.map(([x, y]) => ({ x, y, script: 'gateStop' })));
  }
}

/** A gate's closed lines, which can change with the story. */
export const closedLines = (g: GateDef) => (typeof g.closed === 'function' ? g.closed() : g.closed);

/** The gate a guard (on the road or aside) belongs to. */
export const gateOf = (m: MapDef, npcId: string) => m.gates?.find((g) => npcId === g.id || npcId === `${g.id}_aside`);

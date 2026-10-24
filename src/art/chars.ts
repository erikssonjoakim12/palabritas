import { fromRows, mirror, type Img } from './pixel';
import type { Dir } from '../engine/input';
import { CLOTHES, SKIN, SPRITE_INK } from '../style/colors';
import { HEADS, BODIES, LOOKS, OBJECTS_ART } from '../style/people';

export type Frames = Record<Dir, [Img, Img, Img]>; // stand, walk A, walk B

/** Build all walking frames for a character in LOOKS (style/people.ts). */
export function personFrames(lookId: string): Frames {
  const look = LOOKS[lookId] ?? LOOKS.man;
  const head = HEADS[look.head];
  const body = BODIES[look.body];
  const pal = { '1': SKIN, '2': CLOTHES[look.color] ?? CLOTHES.blue, '3': SPRITE_INK };
  const img = (rows: string[]) => fromRows(rows, pal, lookId);
  // Walking frames sit 1 px lower than standing ones: that drop is Gen 2's walking bob.
  const blank = '................';
  const downStand = img([...head.down, ...body.down.stand]);
  const downWalk = img([blank, ...head.down, ...body.down.walk]);
  const upStand = img([...head.up, ...body.down.stand]);
  const upWalk = img([blank, ...head.up, ...body.down.walk]);
  const sideStand = img([...head.side, ...body.side.stand]);
  const sideWalk = img([blank, ...head.side, ...body.side.walk]);
  return {
    down: [downStand, downWalk, mirror(downWalk)],
    up: [upStand, upWalk, mirror(upWalk)],
    left: [sideStand, sideWalk, sideWalk],
    right: [mirror(sideStand), mirror(sideWalk), mirror(sideWalk)],
  };
}

export const OBJECTS: Record<string, Img> = {};

export function buildObjects() {
  for (const [id, art] of Object.entries(OBJECTS_ART)) {
    // Color 0 too, where a palette has one (the armchair's cushion); the others leave it empty.
    OBJECTS[id] = fromRows(art.rows, { '0': art.pal[0], '1': art.pal[1], '2': art.pal[2], '3': art.pal[3] }, id);
  }
}

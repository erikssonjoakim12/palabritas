import { fromRows, mirror, type Img } from './pixel';
import type { Dir } from '../engine/input';
import { CLOTHES, SKIN, SPRITE_INK } from '../style/colors';
import { HEADS, BODIES, LOOKS, OBJECTS_ART, ANIMALS } from '../style/people';

export type Frames = Record<Dir, [Img, Img, Img]>; // stand, walk A, walk B

/** Build all walking frames for a character in LOOKS (style/people.ts), or an animal in ANIMALS. */
export function personFrames(lookId: string): Frames {
  if (ANIMALS[lookId]) return animalFrames(lookId);
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

/** Empty rows above a 16-pixel animal: as tall as a person, so it stands where a person would. */
const animalTop = () => HEADS.cap.down.length + BODIES.pants.down.stand.length - 16;

/**
 * An animal's walking frames: drawn where a person would be (as tall as one, its feet on the ground) and 1 px lower
 * mid-step, like people.
 */
function animalFrames(id: string): Frames {
  const a = ANIMALS[id];
  const pal = { '0': a.pal[0], '1': a.pal[1], '2': a.pal[2], '3': a.pal[3] };
  const blank = '................';
  const top = Array(animalTop()).fill(blank);
  const img = (rows: string[], step: number) => fromRows([...top, ...(step ? [blank] : []), ...rows], pal, id);
  const view = (frames: string[][]) => frames.map((rows, step) => img(rows, step)) as [Img, Img, Img];
  const side = view(a.side);
  return { down: view(a.down), up: view(a.up), left: side, right: side.map(mirror) as [Img, Img, Img] };
}

/** Where an animal's eyes are on its standing frame facing `dir` (color 0), to glow through the fog. */
export function animalEyes(id: string, dir: Dir): [number, number][] {
  const a = ANIMALS[id];
  const rows = (dir === 'left' || dir === 'right' ? a.side : a[dir])[0];
  const top = animalTop();
  return rows.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === '0' ? [[dir === 'right' ? 15 - x : x, y + top] as [number, number]] : [])));
}

export const OBJECTS: Record<string, Img> = {};

export function buildObjects() {
  for (const [id, art] of Object.entries(OBJECTS_ART)) {
    // Color 0 too, where a palette has one (the armchair's cushion); the others leave it empty.
    OBJECTS[id] = fromRows(art.rows, { '0': art.pal[0], '1': art.pal[1], '2': art.pal[2], '3': art.pal[3] }, id);
  }
}

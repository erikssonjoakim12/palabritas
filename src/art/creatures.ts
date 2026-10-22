import { Pix, mirror, fromRows, trim, type Img } from './pixel';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).

type Draw = (p: Pix) => void;

/** Placeholders for new Palabritas until the user's art arrives (every Palabrita has art right now). */
const DRAW: Record<string, Draw> = {};

export interface CreatureArt {
  front: Img;
  back: Img;
}

/** Every Palabrita that has art (hand-made or a shape drawing). */
export const CREATURE_IDS = [...new Set([...Object.keys(PALABRITA_ART), ...Object.keys(DRAW)])];

const built: Record<string, CreatureArt> = {};

/**
 * A Palabrita's sprites, drawn the first time they're needed (drawing all of them at start-up took ~100 ms).
 * Hand-made pixel art (style/palabritas.ts) when it has it; otherwise its shape drawing, with the mirrored
 * front as the back view.
 */
export function creatureArt(id: string): CreatureArt {
  if (built[id]) return built[id];
  const art = PALABRITA_ART[id];
  if (art) {
    // Trimmed, so the feet stand on the ground however much empty space the file has.
    const img = (view: 'front' | 'back') => trim(fromRows(art[view], art.pal, `${id} ${view}`));
    return (built[id] = { front: img('front'), back: img('back') });
  }
  const p = new Pix(48, 48);
  DRAW[id](p);
  const front = p.toCanvas();
  return (built[id] = { front, back: mirror(front) });
}

import { Pix, mirror, fromRows, trim, makeCanvas, type Img } from './pixel';
import { SPRITE_INK } from '../style/colors';
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

/** Icon size: one map tile, like your character on the map (and Gold/Silver's party icons). */
export const ICON = 16;
const icons: Record<string, Img> = {};

/**
 * A Palabrita's 16x16 icon for lists (your team, the Palabridex), made from its front sprite: each icon pixel takes
 * the most common color of its part of the sprite (so the art's own colors, not a blur), with an outline around it.
 * Shown scaled up with hard pixels, it reads as pixel art. Hand-made icons could replace these one by one.
 */
export function creatureIcon(id: string): Img {
  if (icons[id]) return icons[id];
  const src = creatureArt(id).front;
  const { data } = src.getContext('2d')!.getImageData(0, 0, src.width, src.height);
  const fit = ICON - 2; // room for the outline
  const k = Math.max(src.width, src.height) / fit;
  const [w, h] = [Math.max(1, Math.round(src.width / k)), Math.max(1, Math.round(src.height / k))];
  const [ox, oy] = [Math.floor((ICON - w) / 2), ICON - 1 - h];
  const px: (string | null)[] = new Array(ICON * ICON).fill(null);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const count = new Map<string, number>();
      let cells = 0;
      for (let sy = Math.floor(y * k); sy < Math.min(src.height, Math.floor((y + 1) * k)); sy++)
        for (let sx = Math.floor(x * k); sx < Math.min(src.width, Math.floor((x + 1) * k)); sx++) {
          cells++;
          const i = (sy * src.width + sx) * 4;
          if (data[i + 3] < 128) continue;
          const c = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
          count.set(c, (count.get(c) ?? 0) + 1);
        }
      const solid = [...count.values()].reduce((a, b) => a + b, 0);
      if (solid * 2 < cells) continue; // mostly empty: transparent
      px[(oy + y) * ICON + ox + x] = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
  const c = makeCanvas(ICON, ICON);
  const g = c.getContext('2d')!;
  for (let y = 0; y < ICON; y++)
    for (let x = 0; x < ICON; x++) {
      let col = px[y * ICON + x];
      // The outline: empty pixels next to the Palabrita.
      if (!col && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => x + dx >= 0 && x + dx < ICON && px[(y + dy) * ICON + x + dx])) col = SPRITE_INK;
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  return (icons[id] = c);
}

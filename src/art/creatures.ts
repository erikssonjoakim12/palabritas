import { Pix, mirror, fromRows, trim, makeCanvas, type Img } from './pixel';
import { SPRITE_INK, JAGUAR as J } from '../style/colors';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).
type Draw = (p: Pix) => void;

/** Placeholders for new Palabritas until the user's art arrives. */
const DRAW: Record<string, Draw> = {
  /** The black jaguar cub: a big head, big green eyes, faint spots, sitting. */
  rugidito(p) {
    p.poly([[33, 42], [40, 36], [43, 28], [41, 27], [38, 34], [31, 39]], J.fur); // the tail, curling up
    p.ellipse(24, 38, 11, 9, J.fur);
    p.ellipse(17, 46, 4, 2.5, J.fur).ellipse(31, 46, 4, 2.5, J.fur);
    for (const [x, y] of [[19, 36], [28, 34], [24, 41], [31, 40], [16, 40]]) p.ellipse(x, y, 1.6, 1.2, J.rosette);
    p.poly([[12, 18], [14, 7], [21, 13]], J.fur).poly([[36, 18], [34, 7], [27, 13]], J.fur);
    p.poly([[14, 15], [15, 10], [18, 13]], J.rosette).poly([[34, 15], [33, 10], [30, 13]], J.rosette);
    p.ellipse(24, 22, 12, 10.5, J.fur);
    p.ellipse(24, 27.5, 5.5, 3.5, J.muzzle);
    p.ellipse(24, 25.5, 1.8, 1.2, J.nose);
    p.ellipse(18.5, 21, 2.6, 3, J.eye).ellipse(29.5, 21, 2.6, 3, J.eye);
    p.rect(18, 20, 1, 3, SPRITE_INK).rect(29, 20, 1, 3, SPRITE_INK);
    p.set(17, 19, '#ffffff').set(28, 19, '#ffffff');
    p.outline(SPRITE_INK);
  },
  /** Rugidón, the jungle's guardian: a long black body crouched to spring, leaf markings, a leafy tail tip. */
  rugidon(p) {
    p.poly([[38, 34], [44, 28], [46, 20], [43, 19], [41, 27], [36, 31]], J.fur); // the tail
    p.poly([[44, 21], [47, 15], [45, 12], [41, 16], [42, 21]], J.leaf); // a leaf at its tip
    p.ellipse(27, 33, 15, 8, J.fur);
    p.rect(13, 36, 5, 9, J.fur).rect(34, 36, 5, 9, J.fur).rect(21, 37, 4, 8, J.shade).rect(28, 37, 4, 8, J.shade);
    for (const [x, y] of [[22, 30], [30, 29], [36, 33], [27, 35], [18, 34]]) p.ellipse(x, y, 2, 1.4, J.rosette);
    p.poly([[22, 27], [26, 24], [31, 25], [27, 28]], J.leaf).poly([[33, 28], [37, 26], [40, 29], [36, 31]], J.leaf);
    p.poly([[6, 14], [8, 6], [13, 11]], J.fur).poly([[19, 14], [18, 6], [13, 10]], J.fur);
    p.ellipse(12, 19, 9, 8, J.fur);
    p.ellipse(10, 23, 5, 3, J.muzzle);
    p.ellipse(9, 21.5, 1.6, 1, J.nose);
    p.ellipse(8, 17.5, 2, 1.6, J.eye).ellipse(15, 17.5, 2, 1.6, J.eye);
    p.rect(8, 17, 1, 2, SPRITE_INK).rect(15, 17, 1, 2, SPRITE_INK);
    p.poly([[4, 26], [16, 26], [14, 29], [6, 29]], J.leafDark); // a collar of leaves
    p.outline(SPRITE_INK);
  },
};

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

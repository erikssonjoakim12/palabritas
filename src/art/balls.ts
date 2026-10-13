import { HEAL_BALL, SPRITE_INK } from '../style/colors';

/** Small Palabolas drawn straight onto the canvas. t = teal top, w = white bottom, k = ink, . = clear. */

/** 4x4: the ones in the healing machine's tray. */
export const MINI_BALL = ['.tt.', 'tttt', 'wwww', '.ww.'];

/** 8x8: a trainer's lineup at the start of a battle, one per Palabrita. */
export const LINEUP_BALL = ['..kkkk..', '.kttttk.', 'kttttttk', 'kkkkkkkk', 'kwwwwwwk', 'kwwwwwwk', '.kwwwwk.', '..kkkk..'];

export const BALL_COLORS = { t: HEAL_BALL[0], w: HEAL_BALL[1], k: SPRITE_INK };
/** A fainted Palabrita's ball. */
export const FAINTED_COLORS = { t: '#8c8c8c', w: '#c8c8c0', k: SPRITE_INK };
/** An empty slot: just a faint outline. */
export const EMPTY_COLORS = { k: '#c8c8c0' };

export function drawPattern(g: CanvasRenderingContext2D, rows: string[], x: number, y: number, colors: Record<string, string>) {
  rows.forEach((row, dy) =>
    [...row].forEach((ch, dx) => {
      const c = colors[ch];
      if (!c) return;
      g.fillStyle = c;
      g.fillRect(x + dx, y + dy, 1, 1);
    }),
  );
}

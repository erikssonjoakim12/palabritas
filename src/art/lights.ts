import { tileOf, type MapLook } from './tiles';
import { NIGHT_LIGHT } from '../style/colors';

/** A light at night: its center in map pixels and how far it reaches. */
export interface Light {
  x: number;
  y: number;
  r: number;
}

const T = 16;

/** The light a tile gives at night, if any: lit windows, and the lighthouse's lamp (its top tile). */
export function lightAt(m: MapLook, x: number, y: number): Light | undefined {
  const ch = tileOf(m, x, y);
  if (ch === 'w') return { x: x * T + 7, y: y * T + 9, r: 24 };
  if (ch === 'A' && tileOf(m, x, y - 1) !== 'A') return { x: x * T + 8, y: y * T + 4, r: 34 };
}

/** Every light on a map (the art page; the game keeps them with its tile layout). */
export const mapLights = (m: MapLook) =>
  m.rows.flatMap((row, y) => [...row].flatMap((_, x) => lightAt(m, x, y) ?? []));

/** Lights drawn over a night tint, at (x, y) on screen: a warm glow that brings the colors under it back. */
export function drawLights(g: CanvasRenderingContext2D, lights: Light[], dx = 0, dy = 0) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    const [x, y] = [l.x + dx, l.y + dy];
    const glow = g.createRadialGradient(x, y, 2, x, y, l.r);
    glow.addColorStop(0, NIGHT_LIGHT.core);
    glow.addColorStop(0.35, NIGHT_LIGHT.glow);
    glow.addColorStop(1, NIGHT_LIGHT.clear);
    g.fillStyle = glow;
    g.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
  }
  g.restore();
}

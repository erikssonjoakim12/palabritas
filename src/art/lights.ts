import { tileOf, type MapLook } from './tiles';
import { NIGHT_LIGHT, DAY_CYCLE } from '../style/colors';

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

const rgb = (hex: string) => [16, 8, 0].map((s) => (parseInt(hex.slice(1), 16) >> s) & 255);

/** The sky at an hour of the day: the tint over the world and how strongly windows shine, faded between DAY_CYCLE's hours. */
export function skyAt(hour: number): { tint: string; light: number } {
  const h = ((hour % 24) + 24) % 24;
  // The cycle wraps around midnight: before its first hour, fade from its last.
  const i = DAY_CYCLE.findIndex((k) => k.h > h);
  const [a, b] = i === -1 ? [DAY_CYCLE[DAY_CYCLE.length - 1], DAY_CYCLE[0]] : [DAY_CYCLE[(i + DAY_CYCLE.length - 1) % DAY_CYCLE.length], DAY_CYCLE[i]];
  const span = (b.h - a.h + 24) % 24 || 24;
  const t = Math.min(1, ((h - a.h + 24) % 24) / span);
  const [ca, cb] = [rgb(a.tint), rgb(b.tint)];
  const mix = ca.map((v, k) => Math.round(v + (cb[k] - v) * t));
  return { tint: `rgb(${mix.join(',')})`, light: a.light + (b.light - a.light) * t };
}

/** Lights drawn over a night tint, at (x, y) on screen: a warm glow that brings the colors under it back. */
export function drawLights(g: CanvasRenderingContext2D, lights: Light[], dx = 0, dy = 0, strength = 1) {
  if (strength <= 0) return;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = strength;
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

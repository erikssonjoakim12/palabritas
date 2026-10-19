import { FIREWORK_COLORS } from '../style/colors';
import { W } from '../engine/screen';

/** One firework: sparks flying out from (x, y) on screen. */
interface Burst {
  x: number;
  y: number;
  color: string;
  age: number;
  /** How far the sparks fly (a big one for Don Tizón's rocket). */
  size: number;
}

const LIFE = 44;
const bursts: Burst[] = [];
let wait = 0;

/** A burst now, somewhere over the plaza (or a big one in the middle). */
export function launchFirework(big = false) {
  bursts.push({
    x: big ? W / 2 : 20 + Math.random() * (W - 40),
    y: big ? 30 : 10 + Math.random() * 50,
    color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
    age: 0,
    size: big ? 40 : 14 + Math.random() * 8,
  });
}

/** Festival fireworks over the night sky: a new burst every half second or so, each sparkling out and fading. */
export function drawFireworks(g: CanvasRenderingContext2D) {
  if (--wait <= 0) {
    launchFirework();
    wait = 30 + Math.floor(Math.random() * 30);
  }
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    const t = ++b.age / LIFE;
    if (t >= 1) {
      bursts.splice(i, 1);
      continue;
    }
    const r = b.size * Math.sqrt(t);
    g.globalAlpha = 1 - t * t;
    g.fillStyle = b.color;
    const sparks = b.size > 30 ? 16 : 10;
    for (let k = 0; k < sparks; k++) {
      const a = (k / sparks) * Math.PI * 2;
      // The sparks fall a little as they fade, like real ones.
      g.fillRect(Math.round(b.x + Math.cos(a) * r), Math.round(b.y + Math.sin(a) * r + t * t * 6), 2, 2);
    }
  }
  g.restore();
}

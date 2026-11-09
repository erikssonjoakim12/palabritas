// The storm over town 7's lake (MapDef.storm): the light dimmed to a stormy grey, rain slanting down, and now and then
// a soft flash of lightning (gentle on purpose: dim, brief, seconds apart).
import { W, H } from '../engine/screen';
import { STORM } from '../style/colors';

/** Raindrops on the screen at once. */
const DROPS = 46;
/** Lightning: once in this many milliseconds, a double flicker. */
const FLASH_EVERY = 11000;

export function drawStorm(g: CanvasRenderingContext2D, camX: number, camY: number) {
  const now = performance.now();
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = STORM.gloom;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  // Each drop has its own place and speed; they fall down and to the left, and stay put as you walk (like the ground).
  g.fillStyle = STORM.rain;
  const t = now / 1000;
  for (let i = 0; i < DROPS; i++) {
    const speed = 150 + (i % 5) * 18;
    const x = (((i * 47 - camX - t * speed * 0.35) % W) + W) % W;
    const y = (((i * 61 - camY + t * speed) % H) + H) % H;
    g.fillRect(Math.round(x), Math.round(y), 1, 3);
    g.fillRect(Math.round(x) - 1, Math.round(y) + 3, 1, 2);
  }
  // Lightning: in the first moments of each cycle, two quick, dim flickers.
  const phase = now % FLASH_EVERY;
  if (phase < 90 || (phase > 180 && phase < 240)) {
    g.globalAlpha = 0.28;
    g.fillStyle = STORM.flash;
    g.fillRect(0, 0, W, H);
  }
  g.restore();
}

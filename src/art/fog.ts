// The fog of region 6, drawn over the map: a gloom with a clear patch where you are (or thick along a map's top),
// clouds drifting by, and what shines through it.
import { W, H } from '../engine/screen';
import { DX, DY, type Dir } from '../engine/input';
import { fromRows, T, type Img } from './pixel';
import { FOG } from '../style/colors';

/** How the fog looks around you in a patch (world/region6.ts sets it as you walk): how far you see, and where it thins. */
export const fogView = { radius: 34, lean: null as Dir | null, leanBy: 0 };
let fogRadius = 34;

/** Something seen through the fog, where it is on the screen: a glowing body, or just its eyes. */
export type Glow = { x: number; y: number } & ({ body: Img } | { eyes: [number, number][] });

/** A cloud of fog: a dithered oval (pixels, not a blur, like everything else). */
let cloudImg: Img | null = null;
function cloud(): Img {
  if (cloudImg) return cloudImg;
  const [w, h] = [44, 16];
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const d = Math.hypot((x - w / 2 + 0.5) / (w / 2), (y - h / 2 + 0.5) / (h / 2));
      return d < 0.7 || (d < 1 && (x + y) % 2 === 0) ? 'c' : '.';
    }).join(''),
  );
  return (cloudImg = fromRows(rows, { c: FOG.cloud }, 'cloud'));
}

/**
 * The fog over everything: in a patch, a gloom (dusk-dark at any hour) and gray all around except a small patch where
 * you are (cx, cy on the screen; it leans toward where the fog thins); at an 'edge', gray along the top of the map.
 * Clouds drifting by (a little slower than the ground, so walking moves you through them), and what shines through.
 */
export function drawFog(g: CanvasRenderingContext2D, kind: 'patch' | 'edge', cx: number, cy: number, camX: number, camY: number, glows: Glow[]) {
  const t = performance.now() / 1000;
  g.save();
  let cloudsAbove = H;
  if (kind === 'patch') {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = FOG.gloom;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    fogRadius += (fogView.radius - fogRadius) * 0.05;
    const r = fogRadius + Math.sin(t * 1.3) * 1.5;
    const [lx, ly] = fogView.lean ? [DX[fogView.lean] * fogView.leanBy, DY[fogView.lean] * fogView.leanBy] : [0, 0];
    const fog = g.createRadialGradient(cx, cy, r * 0.45, cx + lx, cy + ly, r + Math.hypot(lx, ly));
    fog.addColorStop(0, FOG.clear);
    fog.addColorStop(1, FOG.thick);
    g.fillStyle = fog;
  } else {
    // Thick above the map, thinning out over its first rows: you step out of it onto the trail.
    const top = -T - camY;
    const fog = g.createLinearGradient(0, top + 4 * T, 0, top);
    fog.addColorStop(0, FOG.clear);
    fog.addColorStop(1, FOG.thick);
    g.fillStyle = fog;
    cloudsAbove = top + 2 * T;
  }
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.45;
  const img = cloud();
  const [spanX, spanY] = [W + img.width, H + img.height];
  for (let i = 0; i < 7; i++) {
    const x = ((((i * 61 + t * (5 + (i % 3) * 3) - camX * 0.6) % spanX) + spanX) % spanX) - img.width;
    const y = ((((i * 47 + Math.sin(t * 0.4 + i) * 6 - camY * 0.6) % spanY) + spanY) % spanY) - img.height;
    if (y < cloudsAbove) g.drawImage(img, Math.round(x), Math.round(y));
  }
  g.globalAlpha = 1;
  // Through the fog: the black dog's eyes, the white dog's glow.
  for (const glow of glows) {
    if ('body' in glow) {
      g.globalAlpha = 0.8;
      g.drawImage(glow.body, glow.x, glow.y);
      g.globalAlpha = 1;
      continue;
    }
    for (const [ex, ey] of glow.eyes) {
      const [x, y] = [Math.round(glow.x + ex), Math.round(glow.y + ey)];
      g.fillStyle = FOG.eyeGlow;
      g.fillRect(x - 1, y - 1, 3, 3);
      g.fillStyle = FOG.eye;
      g.fillRect(x, y, 1, 1);
    }
  }
  g.restore();
}

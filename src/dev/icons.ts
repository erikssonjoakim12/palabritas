// The app icon: our mascot Aguacatito, drawn from the game's own sprite (so it always matches).
// Open with `npm run icons`, then save the PNGs into public/ (see icons.html).
import { buildCreatureArt, CREATURE_ART } from '../art/creatures';

const MASCOT = 'aguacatito';
const BG = '#2b2350'; // same as theme_color in manifest.webmanifest
/** Icon size → pixel scale of the 48x48 sprite. 512 is also the "maskable" icon, so it keeps a safe margin. */
const SIZES: [number, number][] = [
  [192, 3],
  [512, 7],
];

/** The sprite's non-transparent area, so it can be centered. */
function bounds(img: HTMLCanvasElement) {
  const { data, width, height } = img.getContext('2d')!.getImageData(0, 0, img.width, img.height);
  let [x0, y0, x1, y1] = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export function makeIcon(size: number, scale: number): HTMLCanvasElement {
  const sprite = CREATURE_ART[MASCOT].front as HTMLCanvasElement;
  const b = bounds(sprite);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = BG;
  g.fillRect(0, 0, size, size);
  const w = b.w * scale;
  const h = b.h * scale;
  g.drawImage(sprite, b.x, b.y, b.w, b.h, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);
  return c;
}

buildCreatureArt();
const list = document.getElementById('icons')!;
for (const [size, scale] of SIZES) {
  const c = makeIcon(size, scale);
  c.dataset.file = `icon-${size}.png`;
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = `icon-${size}.png`;
  a.textContent = `Download icon-${size}.png`;
  const item = document.createElement('div');
  item.append(c, document.createElement('br'), a);
  list.appendChild(item);
}

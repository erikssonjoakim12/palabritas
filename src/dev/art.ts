// The art review page (art.html, `npm run art`): every sprite the game draws, side by side,
// plus the app icons to download. Published next to the game as art.html.
import { buildCreatureArt, CREATURE_ART } from '../art/creatures';
import { portrait } from '../art/portraits';
import { personFrames } from '../art/chars';
import { LOOKS } from '../style/people';
import { SPECIES } from '../data/species';
import type { Img } from '../art/pixel';

const root = document.getElementById('art')!;

function section(title: string, note = '') {
  const h = document.createElement('h2');
  h.textContent = title;
  root.appendChild(h);
  if (note) root.appendChild(Object.assign(document.createElement('p'), { textContent: note }));
  const grid = document.createElement('div');
  grid.className = 'grid';
  root.appendChild(grid);
  return grid;
}

/** A copy of an image scaled up with crisp pixels. */
function big(img: Img, scale: number) {
  const c = document.createElement('canvas');
  c.width = img.width * scale;
  c.height = img.height * scale;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function card(grid: HTMLElement, label: string, images: Img[], scale: number) {
  const el = document.createElement('div');
  el.className = 'card';
  const row = document.createElement('div');
  row.className = 'row';
  for (const img of images) row.appendChild(big(img, scale));
  el.append(row, label);
  grid.appendChild(el);
}

buildCreatureArt();

const mons = section('Palabritas', 'Front (the opponent sees this) and back (yours in battle). Palabritas with hand-made art (style/palabritas.ts) have a real back view; the others use their mirrored front.');
for (const [id, art] of Object.entries(CREATURE_ART)) card(mons, SPECIES[id]?.name ?? id, [art.front, art.back], 3);

const people = section('Battle portraits', 'Shown at the start and end of trainer battles. Built from each person\'s look, like the overworld sprites.');
card(people, 'You (front · back)', [portrait('player'), portrait('player', 'back')], 3);
for (const id of Object.keys(LOOKS)) if (id !== 'player') card(people, id, [portrait(id)], 3);

const walk = section('Overworld sprites', 'Down, up, left, right (standing), then walking.');
for (const id of Object.keys(LOOKS)) {
  const f = personFrames(id);
  card(walk, id, [f.down[0], f.up[0], f.left[0], f.right[0], f.down[1], f.left[1]], 4);
}

// ---------- App icons: our mascot, from the game's own sprite ----------

const MASCOT = 'aguacatito';
const BG = '#2b2350'; // same as theme_color in manifest.webmanifest
/** Icon size → pixel scale of the 48x48 sprite. 512 is also the "maskable" icon, so it keeps a safe margin. */
const ICON_SIZES: [number, number][] = [
  [192, 3],
  [512, 6],
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

function makeIcon(size: number, scale: number): HTMLCanvasElement {
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

const icons = section('App icons', 'Download both and replace the files in public/.');
icons.classList.add('icons');
for (const [size, scale] of ICON_SIZES) {
  const c = makeIcon(size, scale);
  c.dataset.file = `icon-${size}.png`;
  c.style.width = c.style.height = `${Math.min(size, 192)}px`;
  const a = Object.assign(document.createElement('a'), { href: c.toDataURL('image/png'), download: `icon-${size}.png`, textContent: `Download icon-${size}.png` });
  const el = document.createElement('div');
  el.className = 'card';
  el.append(c, a);
  icons.appendChild(el);
}

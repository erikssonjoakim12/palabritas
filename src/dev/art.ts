// The art review page (art.html, `npm run art`): every sprite the game draws, side by side,
// plus the app icons to download. Published next to the game as art.html.
import { buildCreatureArt, CREATURE_ART } from '../art/creatures';
import { portrait } from '../art/portraits';
import { personFrames, buildObjects, OBJECTS } from '../art/chars';
import { renderMap } from '../art/tiles';
import { MAPS, type MapDef } from '../world/maps';
import { worldLayout } from '../world/layout';
import { LOOKS } from '../style/people';
import { PALETTE } from '../style/colors';
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
for (const [id, art] of Object.entries(CREATURE_ART)) card(mons, SPECIES[id]?.name ?? `${id[0].toUpperCase()}${id.slice(1)} (art only)`, [art.front, art.back], 3);

const people = section('Battle portraits', 'Shown at the start and end of trainer battles. Built from each person\'s look, like the overworld sprites.');
card(people, 'You (front · back)', [portrait('player'), portrait('player', 'back')], 3);
for (const id of Object.keys(LOOKS)) if (id !== 'player') card(people, id, [portrait(id)], 3);

const walk = section('Overworld sprites', 'Down, up, left, right (standing), then walking.');
for (const id of Object.keys(LOOKS)) {
  const f = personFrames(id);
  card(walk, id, [f.down[0], f.up[0], f.left[0], f.right[0], f.down[1], f.left[1]], 4);
}

// ---------- Map tiles and whole maps ----------

/** What each tile character is (the legend in world/maps.ts). */
const TILE_NAMES: Record<string, string> = {
  '.': 'ground', g: 'grass patch', ',': 'tall grass', '=': 'path', '*': 'flowers', T: 'tree', Y: 'lemon tree',
  '~': 'water', f: 'fence', S: 'sign', r: 'roof (town color)', b: 'roof', o: 'roof (Palacentro)', p: 'roof (gym)',
  h: 'wall', w: 'window', d: 'door', c: 'Palacentro sign', G: 'gym sign', a: 'bakery sign', _: 'wood floor',
  '+': 'tile floor', x: 'Palacentro floor', '#': 'inside wall', k: 'table', B: 'bed', L: 'shelf', P: 'plant',
  V: 'TV', C: 'counter', Q: 'computer', n: 'sofa', u: 'poster', m: 'exit mat', R: 'rug',
};
const INDOOR = '_+x#kBLPVCQnumR';

const tiles = section('Map tiles', 'Every tile on its own (16x16). In maps, roofs, walls and tables join up with their neighbors. Art: style/tiles.ts.');
for (const [ch, name] of Object.entries(TILE_NAMES)) {
  const indoor = INDOOR.includes(ch);
  const look = (ground: 'town' | 'grass') => renderMap({ rows: [ch], outdoor: !indoor, floor: indoor ? '_' : '.', ground, roof: 'red' });
  const images = ch === '.' ? [look('town'), look('grass')] : [look('town')];
  card(tiles, `'${ch}' ${ch === '.' ? 'ground (town · route)' : name}`, images, 4);
}

buildObjects();
/** A map with its people and objects standing where they are in the game. */
function mapWithPeople(m: MapDef) {
  const img = renderMap(m);
  const g = img.getContext('2d')!;
  for (const n of m.npcs ?? []) {
    if (n.object) g.drawImage(OBJECTS[n.object], n.x * 16, n.y * 16);
    else g.drawImage(personFrames(n.look ?? 'man')[n.dir ?? 'down'][0], n.x * 16, n.y * 16 - 4);
  }
  return img;
}

// The whole outdoor world, stitched from each map's connections (world/layout.ts).
const world = section('World', 'All towns and routes together, placed by their connections. Each is still its own map: change one and this updates by itself. If paths don\'t line up at an edge, that map\'s connection offset needs adjusting.');
{
  const spots = Object.entries(worldLayout());
  const x0 = Math.min(...spots.map(([, p]) => p.x));
  const y0 = Math.min(...spots.map(([, p]) => p.y));
  const x1 = Math.max(...spots.map(([id, p]) => p.x + MAPS[id].rows[0].length));
  const y1 = Math.max(...spots.map(([id, p]) => p.y + MAPS[id].rows.length));
  const c = document.createElement('canvas');
  c.width = (x1 - x0) * 16;
  c.height = (y1 - y0) * 16;
  const g = c.getContext('2d')!;
  g.fillStyle = '#2a3a28';
  g.fillRect(0, 0, c.width, c.height);
  g.font = 'bold 14px sans-serif';
  for (const [id, p] of spots) {
    const [x, y] = [(p.x - x0) * 16, (p.y - y0) * 16];
    g.drawImage(mapWithPeople(MAPS[id]), x, y);
    g.fillStyle = '#000a';
    g.fillRect(x + 4, y + 4, g.measureText(MAPS[id].name).width + 12, 22);
    g.fillStyle = '#fff';
    g.fillText(MAPS[id].name, x + 10, y + 20);
  }
  card(world, `${spots.length} outdoor maps`, [c], 1);
}

const maps = section('Maps', 'Every map on its own, with its people and objects (some only appear at certain points in the story). Layout: world/maps.ts.');
for (const m of Object.values(MAPS)) card(maps, `${m.name} (${m.id})`, [mapWithPeople(m)], 2);

// ---------- App icons: our mascot, from the game's own sprite ----------

const MASCOT = 'aguacatito';
const BG = '#2b2350'; // same as theme_color in manifest.webmanifest
const ICON_SIZES = [192, 512];
/** How much of the icon the mascot may fill. 512 is also the "maskable" icon, so it keeps a safe margin. */
const ICON_FILL = 0.62;

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

function makeIcon(size: number): HTMLCanvasElement {
  const sprite = CREATURE_ART[MASCOT].front as HTMLCanvasElement;
  const b = bounds(sprite);
  // The biggest whole-number zoom that fits, so the pixels stay crisp whatever the sprite's size.
  const scale = Math.max(1, Math.floor((size * ICON_FILL) / Math.max(b.w, b.h)));
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
for (const size of ICON_SIZES) {
  const c = makeIcon(size);
  c.dataset.file = `icon-${size}.png`;
  c.style.width = c.style.height = `${Math.min(size, 192)}px`;
  const a = Object.assign(document.createElement('a'), { href: c.toDataURL('image/png'), download: `icon-${size}.png`, textContent: `Download icon-${size}.png` });
  const el = document.createElement('div');
  el.className = 'card';
  el.append(c, a);
  icons.appendChild(el);
}

// ---------- The master palette ----------

const pal = section('Color palette', 'The colors new art may use (style/colors.ts, PALETTE). Each family runs dark to light. A sprite uses about 8-16 of them.');
const swatches = document.createElement('canvas');
swatches.id = 'palette';
const SW = 64;
const families = Object.entries(PALETTE);
swatches.width = 110 + SW * Math.max(...families.map(([, c]) => c.length));
swatches.height = SW * families.length;
{
  const g = swatches.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, swatches.width, swatches.height);
  g.font = 'bold 16px sans-serif';
  g.textBaseline = 'middle';
  families.forEach(([name, colors], row) => {
    g.fillStyle = '#222';
    g.fillText(name, 8, row * SW + SW / 2);
    colors.forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(110 + i * SW, row * SW, SW - 4, SW - 4);
      g.fillStyle = parseInt(c.slice(1, 3), 16) + parseInt(c.slice(3, 5), 16) + parseInt(c.slice(5, 7), 16) > 380 ? '#000' : '#fff';
      g.font = '11px monospace';
      g.fillText(c, 110 + i * SW + 4, row * SW + SW - 14);
      g.font = 'bold 16px sans-serif';
    });
  });
}
swatches.style.imageRendering = 'auto';
const list = Object.assign(document.createElement('pre'), {
  id: 'palette-text',
  textContent: families.map(([n, c]) => `${n}: ${c.join(', ')}`).join('\n'),
});
const palCard = document.createElement('div');
palCard.className = 'card';
palCard.style.textAlign = 'left';
palCard.append(swatches, list);
pal.appendChild(palCard);

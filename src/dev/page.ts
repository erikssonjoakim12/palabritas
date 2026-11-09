// What every dev page shares: the bar of links on top (each page reaches all the others), tables that scroll
// sideways on a phone, and the type chips.
import { el } from '../engine/dom';
import { TYPE_COLORS, TYPE_TEXT } from '../style/colors';
import { MAPS, type MapDef } from '../world/maps';
import { renderMap } from '../art/tiles';
import { personFrames, buildObjects, OBJECTS } from '../art/chars';
import { NIGHT } from '../style/colors';
import { mapLights, drawLights } from '../art/lights';

/** The dev pages, published next to the game (vite.config.ts builds the same list). */
const PAGES: [file: string, label: string][] = [
  ['index.html', 'Game'],
  ['art.html', 'Art'],
  ['mundo.html', 'World map'],
  ['salvajes.html', 'Wild Palabritas'],
  ['batallas.html', 'Battles'],
  ['palabras.html', 'Words'],
  ['musica.html', 'Music'],
];

/** The bar of links at the top of the page (the page you're on in bold). */
export function pageNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = el('nav', 'pages');
  for (const [file, label] of PAGES) {
    if (file === here) nav.append(el('b', '', label));
    else nav.append(Object.assign(el('a', '', label), { href: file }));
  }
  const style = el('style');
  style.textContent =
    'nav.pages { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; font-size: 14px; }' +
    'nav.pages a { color: #2a6a9a; }';
  document.head.append(style);
  document.body.prepend(nav);
}

/** A table that scrolls sideways on narrow screens. */
export const wrapped = (table: HTMLElement) => {
  const w = el('div', 'wrap');
  w.append(table);
  return w;
};

export const typeChip = (t: keyof typeof TYPE_COLORS) => {
  const c = el('span', 'type', t);
  c.style.background = TYPE_COLORS[t];
  c.style.color = TYPE_TEXT;
  return c;
};

/** A map with its people and objects standing where they are in the game. */
export function mapWithPeople(m: MapDef) {
  if (!Object.keys(OBJECTS).length) buildObjects();
  const img = renderMap(m);
  const g = img.getContext('2d')!;
  for (const n of m.npcs ?? []) {
    if (n.object) g.drawImage(OBJECTS[n.object], n.x * 16, n.y * 16);
    else g.drawImage(personFrames(n.look ?? 'man')[n.dir ?? 'down'][0], n.x * 16, n.y * 16 - 4);
  }
  if (m.night) {
    g.fillStyle = NIGHT;
    g.fillRect(0, 0, img.width, img.height);
    drawLights(g, mapLights(m));
  }
  return img;
}

/** The rectangle the outdoor maps cover in the world, in tiles (x0, y0: its top-left corner). */
export function worldBounds(spots: [string, { x: number; y: number }][]) {
  const x0 = Math.min(...spots.map(([, p]) => p.x));
  const y0 = Math.min(...spots.map(([, p]) => p.y));
  const x1 = Math.max(...spots.map(([id, p]) => p.x + MAPS[id].rows[0].length));
  const y1 = Math.max(...spots.map(([id, p]) => p.y + MAPS[id].rows.length));
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}

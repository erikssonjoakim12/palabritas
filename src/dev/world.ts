// The world map page (mundo.html, `npm run world`): every town and route together, placed by their connections
// (world/layout.ts), with their people. Each is still its own map: change one and this updates by itself.
import { el } from '../engine/dom';
import { MAPS } from '../world/maps';
import { worldLayout } from '../world/layout';
import { pageNav, mapWithPeople, worldBounds } from './page';

pageNav();
const root = document.getElementById('world')!;

const spots = Object.entries(worldLayout());
const { x0, y0, w, h } = worldBounds(spots);
const canvas = el('canvas', 'world');
canvas.width = w * 16;
canvas.height = h * 16;
const g = canvas.getContext('2d')!;
g.fillStyle = '#2a3a28';
g.fillRect(0, 0, canvas.width, canvas.height);
g.font = 'bold 14px sans-serif';
for (const [id, p] of spots) {
  const [x, y] = [(p.x - x0) * 16, (p.y - y0) * 16];
  g.drawImage(mapWithPeople(MAPS[id]), x, y);
  g.fillStyle = '#000a';
  g.fillRect(x + 4, y + 4, g.measureText(MAPS[id].name).width + 12, 22);
  g.fillStyle = '#fff';
  g.fillText(MAPS[id].name, x + 10, y + 20);
}

// Zoom: the whole world on screen, or closer (scroll around).
const view = el('div', 'view');
view.append(canvas);
const zooms: [string, number][] = [['Whole world', 0], ['¼', 0.25], ['½', 0.5], ['Full size', 1]];
const bar = el('div', 'zoom');
let zoom = 0;
const setZoom = (z: number) => {
  zoom = z;
  canvas.style.width = z ? `${canvas.width * z}px` : '100%';
  for (const [i, b] of [...bar.children].entries()) b.classList.toggle('on', zooms[i][1] === z);
};
for (const [label, z] of zooms) {
  const b = el('button', '', label);
  b.addEventListener('click', () => setZoom(z));
  bar.append(b);
}

// The places: tap one to go there (closer, if you're looking at the whole world).
const places = el('div', 'places');
for (const [id, p] of [...spots].sort(([a], [b]) => MAPS[a].name.localeCompare(MAPS[b].name))) {
  const b = el('button', 'place', MAPS[id].name);
  b.addEventListener('click', () => {
    if (!zoom) setZoom(0.5);
    const m = MAPS[id];
    view.scrollTo({
      left: ((p.x - x0 + m.rows[0].length / 2) * 16 * zoom) - view.clientWidth / 2,
      top: ((p.y - y0 + m.rows.length / 2) * 16 * zoom) - view.clientHeight / 2,
      behavior: 'smooth',
    });
  });
  places.append(b);
}
// Tapping the map while it shows the whole world goes in closer, there.
canvas.addEventListener('click', (e) => {
  if (zoom) return;
  const r = canvas.getBoundingClientRect();
  const [fx, fy] = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  setZoom(0.5);
  view.scrollTo({ left: fx * canvas.width * zoom - view.clientWidth / 2, top: fy * canvas.height * zoom - view.clientHeight / 2 });
});

root.append(el('p', '', `${spots.length} outdoor maps.`), bar, places, view);
setZoom(0);

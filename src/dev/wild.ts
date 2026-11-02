// The wild Palabritas page (salvajes.html, `npm run wild`): where each Palabrita lives and at which levels, read
// from the maps the same way the game reads them (tall grass, caves, parts of a map, swimming, fishing), on a small
// map of the world. Tap a Palabrita to see where it lives; tap a place to see who lives there.
import { el } from '../engine/dom';
import { MAPS, FRESHWATER, type MapDef, type EncounterEntry } from '../world/maps';
import { worldLayout, outdoorOf } from '../world/layout';
import { TILES, isHole } from '../art/tiles';
import { SPECIES, DEX_ORDER } from '../data/species';
import { WILD_MAP } from '../style/colors';
import { creatureArt } from '../art/creatures';
import { pageNav, wrapped, typeChip, worldBounds } from './page';

pageNav();
const root = document.getElementById('wild')!;

// ---------- Every place with wild Palabritas ----------

type How = 'grass' | 'everywhere' | 'surf' | 'fishing';
const HOW: Record<How, string> = { grass: '🌿 tall grass', everywhere: '👣 every step', surf: '🌊 swimming', fishing: '🎣 fishing' };

interface Spot {
  map: MapDef;
  how: How;
  /** A part of the map with its own Palabritas (encounterZones). */
  part?: string;
  table: EncounterEntry[];
}

/** Which part of a map a zone covers, roughly, as a compass word. */
function partName(m: MapDef, z: { x: number; y: number; w: number; h: number }) {
  const [w, h] = [m.rows[0].length, m.rows.length];
  if (z.w >= w * 0.9 && z.h >= h * 0.9) return 'all of it';
  const ns = z.y + z.h <= h * 0.6 ? 'north' : z.y >= h * 0.4 ? 'south' : '';
  const ew = z.x + z.w <= w * 0.6 ? 'west' : z.x >= w * 0.4 ? 'east' : '';
  return `${ns}${ns && ew ? '-' : ''}${ew}` || 'middle';
}

const hasWater = (m: MapDef) => m.rows.some((r) => [...r].some((c) => TILES[c]?.kind === 'water'));

const spots: Spot[] = [];
for (const m of Object.values(MAPS)) {
  if (m.night) continue; // story scenes: no wild Palabritas
  if (m.encounters) {
    const how = m.encounters.everywhere ? 'everywhere' : 'grass';
    spots.push({ map: m, how, part: m.encounterZones ? 'the rest' : undefined, table: m.encounters.table });
    for (const z of m.encounterZones ?? []) spots.push({ map: m, how, part: partName(m, z), table: z.table });
  }
  if (m.surf) spots.push({ map: m, how: 'surf', table: m.surf.table });
  if (hasWater(m)) spots.push({ map: m, how: 'fishing', table: m.fishing?.table ?? FRESHWATER });
}

const chance = (s: Spot, e: EncounterEntry) => Math.round((e.w / s.table.reduce((t, x) => t + x.w, 0)) * 100);
const levels = (min: number, max: number) => (min === max ? `Nv ${min}` : `Nv ${min}–${max}`);
const placeName = (s: Spot) => s.map.name + (s.part ? ` (${s.part})` : '');

// ---------- The small world map ----------

/** Pixels per world tile. */
const K = 2;
const L = worldLayout();
const { x0, y0, w, h } = worldBounds(Object.entries(L));
const canvas = el('canvas', 'mini');
canvas.width = w * K;
canvas.height = h * K;
const g = canvas.getContext('2d')!;
g.fillStyle = WILD_MAP.beyond;
g.fillRect(0, 0, canvas.width, canvas.height);
for (const [id, p] of Object.entries(L)) {
  const m = MAPS[id];
  for (let y = 0; y < m.rows.length; y++)
    for (let x = 0; x < m.rows[0].length; x++) {
      if (isHole(m, x, y)) continue;
      const t = TILES[m.rows[y][x]];
      g.fillStyle = t?.kind === 'water' ? WILD_MAP.water : t?.kind === 'tallgrass' ? WILD_MAP.tallGrass : t?.solid ? WILD_MAP.solid : WILD_MAP.open;
      g.fillRect((p.x - x0 + x) * K, (p.y - y0 + y) * K, K, K);
    }
}
const base = g.getImageData(0, 0, canvas.width, canvas.height);

/** Where a place is on the small map: its own rectangle outdoors, or the door or way out it's reached by. */
function locate(m: MapDef): { id: string; x?: number; y?: number } | null {
  if (L[m.id]) return { id: m.id };
  const out = outdoorOf(m);
  return out && L[out.map.id] ? { id: out.map.id, x: out.x, y: out.y } : null;
}

/** Light up places on the small map, each with a label (levels, or a name). */
function mark(places: { map: MapDef; label: string }[]) {
  g.putImageData(base, 0, 0);
  const labels: [string, number, number][] = [];
  for (const { map, label } of places) {
    const at = locate(map);
    if (!at) continue;
    const m = MAPS[at.id], p = L[at.id];
    g.fillStyle = WILD_MAP.mark;
    if (at.x === undefined) {
      g.globalAlpha = 0.65;
      for (let y = 0; y < m.rows.length; y++)
        for (let x = 0; x < m.rows[0].length; x++) if (!isHole(m, x, y)) g.fillRect((p.x - x0 + x) * K, (p.y - y0 + y) * K, K, K);
      g.globalAlpha = 1;
      labels.push([label, (p.x - x0 + m.rows[0].length / 2) * K, (p.y - y0 + m.rows.length / 2) * K]);
    } else {
      // A cave or a building: a dot at its way in.
      const [cx, cy] = [(p.x - x0 + at.x + 0.5) * K, (p.y - y0 + at.y! + 0.5) * K];
      g.beginPath();
      g.arc(cx, cy, 7, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#000';
      g.stroke();
      labels.push([label, cx, cy - 12]);
    }
  }
  // Labels last, on top of everything.
  g.font = 'bold 13px sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 3;
  g.strokeStyle = '#000';
  g.fillStyle = '#fff';
  for (const [text, x, y] of labels) {
    g.strokeText(text, x, y + 4);
    g.fillText(text, x, y + 4);
  }
}

const caption = el('p', 'caption', 'Tap a Palabrita or a place.');
const side = el('div', 'side');
side.append(canvas, caption);

// ---------- By Palabrita ----------

const firstOf = (id: string) => Object.values(SPECIES).find((s) => s.evolves?.to === id);
const tabs = el('div', 'tabs');
const byMon = el('table', 'mons');
const byPlace = el('table', 'places');
let picked: HTMLElement | null = null;
const pick = (tr: HTMLElement) => {
  picked?.classList.remove('picked');
  (picked = tr).classList.add('picked');
};

byMon.append(Object.assign(el('tr'), { innerHTML: '<th></th><th>Palabrita</th><th>Where (levels, how often)</th><th>Evolves</th>' }));
for (const id of DEX_ORDER) {
  const s = SPECIES[id];
  const where = spots.flatMap((spot) => spot.table.filter((e) => e.sp === id).map((e) => ({ spot, e })));
  const tr = el('tr', where.length ? '' : 'tame');
  const sprite = el('td', 'sprite');
  const img = creatureArt(id).front;
  const k = 40 / Math.max(img.width, img.height);
  Object.assign(img.style, { width: `${img.width * k}px`, height: `${img.height * k}px` });
  img.className = 'mon';
  sprite.append(img);
  const name = el('td', 'name', s.name);
  const types = el('span', 'sub');
  for (const t of s.types) types.append(typeChip(t));
  name.append(types);
  const cell = el('td');
  if (!where.length) cell.append(el('span', 'none', 'Not in the wild'));
  for (const { spot, e } of where) {
    const line = el('span', 'where');
    line.append(el('b', '', placeName(spot)), ` ${HOW[spot.how]} · ${levels(e.min, e.max)} · ${chance(spot, e)}%`);
    cell.append(line);
  }
  const from = firstOf(id);
  const evo = [from ? `from ${from.name} (Nv ${from.evolves!.level})` : '', s.evolves ? `→ ${SPECIES[s.evolves.to].name} (Nv ${s.evolves.level})` : ''];
  tr.append(sprite, name, cell, el('td', 'evo', evo.filter(Boolean).join(' · ') || '—'));
  tr.addEventListener('click', () => {
    pick(tr);
    // One label per map, from its lowest level to its highest (grass and swimming, or two parts of a map).
    const range = new Map<MapDef, [number, number]>();
    for (const { spot, e } of where) {
      const [lo, hi] = range.get(spot.map) ?? [e.min, e.max];
      range.set(spot.map, [Math.min(lo, e.min), Math.max(hi, e.max)]);
    }
    mark([...range].map(([map, [lo, hi]]) => ({ map, label: levels(lo, hi) })));
    caption.textContent = where.length ? `${s.name}: ${where.length} place${where.length > 1 ? 's' : ''}` : `${s.name} isn't found in the wild.`;
  });
  byMon.append(tr);
}

// ---------- By place ----------

byPlace.append(Object.assign(el('tr'), { innerHTML: '<th>Place</th><th>How</th><th>Palabritas (levels, how often)</th>' }));
const placeRows = new Map<string, HTMLElement>();
for (const spot of spots) {
  const tr = el('tr');
  const list = el('td');
  for (const e of [...spot.table].sort((a, b) => b.w - a.w)) list.append(el('span', 'chip', `${SPECIES[e.sp].name} ${levels(e.min, e.max)} · ${chance(spot, e)}%`));
  tr.append(el('td', 'name', placeName(spot)), el('td', 'how', HOW[spot.how]), list);
  tr.addEventListener('click', () => showPlace(spot.map, tr));
  if (!placeRows.has(spot.map.id)) placeRows.set(spot.map.id, tr);
  byPlace.append(tr);
}
function showPlace(m: MapDef, tr: HTMLElement) {
  pick(tr);
  mark([{ map: m, label: m.name }]);
  const here = spots.filter((s) => s.map === m);
  const lo = Math.min(...here.flatMap((s) => s.table.map((e) => e.min)));
  const hi = Math.max(...here.flatMap((s) => s.table.map((e) => e.max)));
  caption.textContent = `${m.name}: ${levels(lo, hi)}`;
}

// Tap the small map: the place there, in the list by place.
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const [tx, ty] = [((e.clientX - r.left) / r.width) * w + x0, ((e.clientY - r.top) / r.height) * h + y0];
  const id = Object.keys(L).find((i) => {
    const m = MAPS[i], p = L[i];
    return tx >= p.x && ty >= p.y && tx < p.x + m.rows[0].length && ty < p.y + m.rows.length && !isHole(m, Math.floor(tx - p.x), Math.floor(ty - p.y));
  });
  // A place without wild Palabritas of its own: the caves and buildings it leads to may have some.
  const rowId = id && [...placeRows.keys()].find((k) => k === id || locate(MAPS[k])?.id === id);
  if (!rowId) {
    mark([]);
    caption.textContent = id ? `${MAPS[id].name}: no wild Palabritas` : 'Tap a Palabrita or a place.';
    return;
  }
  show('place');
  const tr = placeRows.get(rowId)!;
  showPlace(MAPS[rowId], tr);
  tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

// ---------- The two lists, as tabs ----------

const views = { mon: wrapped(byMon), place: wrapped(byPlace) };
const tabButtons = { mon: el('button', '', 'By Palabrita'), place: el('button', '', 'By place') };
function show(v: keyof typeof views) {
  for (const k of Object.keys(views) as (keyof typeof views)[]) {
    views[k].hidden = k !== v;
    tabButtons[k].classList.toggle('on', k === v);
  }
}
for (const k of Object.keys(views) as (keyof typeof views)[]) {
  tabButtons[k].addEventListener('click', () => show(k));
  tabs.append(tabButtons[k]);
}
const main = el('div', 'main');
main.append(tabs, views.mon, views.place);
const layout = el('div', 'layout');
layout.append(side, main);
root.append(layout);
show('mon');
mark([]);

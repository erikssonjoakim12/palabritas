// The battles page (batallas.html, `npm run battles`): every trainer in the order you meet them, with their
// Palabritas' levels and a chart of the curve, and every Palabrita's base stats and moves. For checking the
// difficulty curve at a glance. Published next to the game as batallas.html.
import { SPECIES, DEX_ORDER, MODE_INFO, learnLevel, type Species } from '../data/species';
import { TRAINERS, BATTLE_ORDER } from '../data/trainers';
import { THEMES } from '../data/content';
import { TYPE_COLORS, TYPE_TEXT } from '../style/colors';
import { creatureArt } from '../art/creatures';
import { el } from '../engine/dom';

const root = document.getElementById('battles')!;

/** A table that scrolls sideways on narrow screens. */
const wrapped = (table: HTMLElement) => {
  const w = el('div', 'wrap');
  w.append(table);
  return w;
};
const typeChip = (t: keyof typeof TYPE_COLORS) => {
  const c = el('span', 'type', t);
  c.style.background = TYPE_COLORS[t];
  c.style.color = TYPE_TEXT;
  return c;
};
/** Rivals and villains' bosses, drawn like leaders (Lucas, the admins, Don Sigilo). */
const BOSSES = new Set(['lucas1', 'lucas2', 'lucas3', 'capataz', 'callada', 'sigilo', 'mutis']);
const isLeader = (id: string) => TRAINERS[id].name.startsWith('Líder');
const top = (id: string) => Math.max(...TRAINERS[id].team.map(([, l]) => l));

// ---------- The curve: every trainer's strongest Palabrita, in battle order ----------
const order = BATTLE_ORDER.flatMap((leg, li) => leg.trainers.map((id) => ({ id, li })));
const missing = Object.keys(TRAINERS).filter((id) => !order.some((o) => o.id === id));

root.append(el('h2', '', 'The curve'));
root.append(el('p', '', 'Each dot is a trainer’s strongest Palabrita, in the order you meet them. Big dots: gym leaders; squares: Lucas and the villains’ bosses.'));
{
  const W = Math.max(640, order.length * 7);
  const H = 240;
  const maxL = Math.ceil(Math.max(...order.map((o) => top(o.id))) / 10) * 10;
  const [padL, padB, padT] = [28, 18, 8];
  const x = (i: number) => padL + (i * (W - padL - 8)) / (order.length - 1);
  const y = (l: number) => padT + ((maxL - l) * (H - padT - padB)) / maxL;
  const parts: string[] = [];
  for (let l = 0; l <= maxL; l += 10) parts.push(`<line x1="${padL}" x2="${W}" y1="${y(l)}" y2="${y(l)}" class="grid"/><text x="${padL - 4}" y="${y(l) + 4}" class="axis" text-anchor="end">${l}</text>`);
  // Each leg a band, alternating, with its number at the bottom.
  let i0 = 0;
  BATTLE_ORDER.forEach((leg, li) => {
    const i1 = i0 + leg.trainers.length - 1;
    if (li % 2) parts.push(`<rect x="${x(i0) - 3}" y="${padT}" width="${x(i1) - x(i0) + 6}" height="${H - padT - padB}" class="band"/>`);
    parts.push(`<text x="${(x(i0) + x(i1)) / 2}" y="${H - 4}" class="axis" text-anchor="middle">${li + 1}</text>`);
    i0 = i1 + 1;
  });
  parts.push(`<polyline class="line" points="${order.map((o, i) => `${x(i)},${y(top(o.id))}`).join(' ')}"/>`);
  order.forEach((o, i) => {
    const [cx, cy] = [x(i), y(top(o.id))];
    const title = `<title>${TRAINERS[o.id].name}: ${TRAINERS[o.id].team.map(([sp, l]) => `${SPECIES[sp].name} ${l}`).join(', ')}</title>`;
    if (isLeader(o.id)) parts.push(`<circle cx="${cx}" cy="${cy}" r="5" class="leader">${title}</circle>`);
    else if (BOSSES.has(o.id)) parts.push(`<rect x="${cx - 4}" y="${cy - 4}" width="8" height="8" class="boss">${title}</rect>`);
    else parts.push(`<circle cx="${cx}" cy="${cy}" r="2.5" class="dot">${title}</circle>`);
  });
  const chart = el('div', 'wrap');
  chart.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
  root.append(chart);
}

// ---------- Every trainer, leg by leg ----------
root.append(el('h2', '', 'Trainers, in battle order'));
root.append(el('p', '', 'Legs end at a gym. Lucas leads with the starter strong against yours (evolved as far as its level allows). Optional trainers are listed where you can first reach them.'));
if (missing.length) root.append(el('p', 'warn', `Not in BATTLE_ORDER (src/data/trainers.ts): ${missing.join(', ')}`));
let n = 0;
BATTLE_ORDER.forEach((leg, li) => {
  const levels = leg.trainers.flatMap((id) => TRAINERS[id].team.map(([, l]) => l));
  root.append(el('h3', '', `${li + 1}. ${leg.leg}`));
  root.append(el('p', '', `${leg.en} · levels ${Math.min(...levels)}–${Math.max(...levels)}`));
  const table = el('table', 'trainers');
  table.append(Object.assign(el('tr'), { innerHTML: '<th>#</th><th>Trainer</th><th>Defend by</th><th>Team</th><th>Top</th>' }));
  for (const id of leg.trainers) {
    const t = TRAINERS[id];
    const tr = el('tr', isLeader(id) ? 'leader' : BOSSES.has(id) ? 'boss' : '');
    const team = el('td');
    t.team.forEach(([sp, l], i) => team.append(el('span', 'chip', `${id.startsWith('lucas') && i === 0 ? 'his starter' : SPECIES[sp].name} ${l}`)));
    const topCell = el('td', 'top');
    const bar = el('span', 'bar');
    bar.style.width = `${top(id) * 1.5}px`;
    topCell.append(el('b', '', String(top(id))), bar);
    tr.append(el('td', 'num', String(++n)), el('td', '', `${t.name}${t.rematch ? ' ↻' : ''}`), el('td', '', `${MODE_INFO[t.defenseMode].icon} ${MODE_INFO[t.defenseMode].es}`), team, topCell);
    table.append(tr);
  }
  root.append(wrapped(table));
});
root.append(el('p', '', '↻ asks for a rematch once a day.'));

// ---------- Every Palabrita ----------
root.append(el('h2', '', 'Palabritas'));
root.append(el('p', '', 'Base stats and moves, in dex order. Evolved forms keep their family’s moves. Tap a column to sort.'));
const total = (s: Species) => s.base.hp + s.base.atk + s.base.def + s.base.spd;
const mons = DEX_ORDER.map((id) => SPECIES[id]);
const prevOf = (id: string) => mons.find((s) => s.evolves?.to === id);
const cols: { label: string; key?: (s: Species) => number }[] = [
  { label: '#', key: (s) => DEX_ORDER.indexOf(s.id) },
  { label: '' },
  { label: 'Palabrita' },
  { label: 'Types' },
  { label: 'HP', key: (s) => s.base.hp },
  { label: 'Atk', key: (s) => s.base.atk },
  { label: 'Def', key: (s) => s.base.def },
  { label: 'Spd', key: (s) => s.base.spd },
  { label: 'Total', key: total },
  { label: 'Evolves' },
  { label: 'Catch', key: (s) => s.catchRate },
  { label: 'Moves (level learned)' },
];
const table = el('table', 'mons');
const head = el('tr');
const rows = mons.map((s) => {
  const tr = el('tr');
  const sprite = el('td', 'sprite');
  const img = creatureArt(s.id).front;
  img.className = 'mon';
  sprite.append(img);
  const types = el('td');
  for (const t of s.types) types.append(typeChip(t));
  const name = el('td', 'name', s.name);
  name.append(el('span', 'sub', THEMES[s.theme]?.name ?? s.theme));
  const prev = prevOf(s.id);
  const evo = [prev ? `from ${prev.name} (Nv ${prev.evolves!.level})` : '', s.evolves ? `→ ${SPECIES[s.evolves.to].name} at Nv ${s.evolves.level}` : ''].filter(Boolean).join(' · ');
  const moves = el('td', 'moves');
  for (const m of [...s.moves].sort((a, b) => learnLevel(a) - learnLevel(b))) {
    const line = el('span', 'move');
    line.append(el('b', '', `Nv ${learnLevel(m)}`), ` ${MODE_INFO[m.mode].icon} ${m.name} `, typeChip(m.type));
    moves.append(line);
  }
  const num = (v: number) => el('td', 'num', String(v));
  tr.append(num(DEX_ORDER.indexOf(s.id) + 1), sprite, name, types, num(s.base.hp), num(s.base.atk), num(s.base.def), num(s.base.spd), el('td', 'num total', String(total(s))), el('td', 'evo', evo || '—'), num(Math.round(s.catchRate * 100) / 100), moves);
  return { tr, s };
});
let sortBy = 0;
let dir = 1;
cols.forEach((c, i) => {
  const th = el('th', c.key ? 'sortable' : '', c.label);
  if (c.key) {
    th.addEventListener('click', () => {
      dir = sortBy === i ? -dir : i === 0 ? 1 : -1; // numbers: biggest first
      sortBy = i;
      const key = c.key!;
      rows.sort((a, b) => (key(a.s) - key(b.s)) * dir);
      for (const r of rows) table.append(r.tr);
    });
  }
  head.append(th);
});
table.append(head);
for (const r of rows) table.append(r.tr);
root.append(wrapped(table));

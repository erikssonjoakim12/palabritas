import { TYPE_ICONS } from '../style/typeIcons';
import { TYPE_COLORS, type Type } from '../data/types';
import { INK } from '../style/colors';

/** A darker shade of a #rrggbb color. */
function shade(hex: string, f = 0.7) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * f);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const drawn = new Map<Type, HTMLCanvasElement>();

function art(type: Type): HTMLCanvasElement {
  let c = drawn.get(type);
  if (c) return c;
  const rows = TYPE_ICONS[type];
  c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d')!;
  const colors: Record<string, string> = { '1': TYPE_COLORS[type], '2': shade(TYPE_COLORS[type]), '3': INK };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!colors[ch]) return;
    g.fillStyle = colors[ch];
    g.fillRect(x, y, 1, 1);
  }));
  drawn.set(type, c);
  return c;
}

/** A type's little symbol for the UI (a new element each time: an element can only be in one place). */
export function typeIcon(type: Type): HTMLCanvasElement {
  const src = art(type);
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  c.className = 'type-icon';
  return c;
}

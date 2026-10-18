import { overlay, el, gp } from '../engine/screen';
import { input } from '../engine/input';
import { sfx } from '../engine/sfx';
import { say, type SayOpts } from './textbox';

export interface MenuOpts {
  /** B / back allowed: resolves -1. */
  cancel?: boolean;
  /** Absolute position in game pixels. Defaults to the right side above the text box. */
  pos?: { left?: number; right?: number; top?: number; bottom?: number; width?: number };
  columns?: 1 | 2;
  initial?: number;
  title?: string;
  disabled?: boolean[];
  /** Called when the cursor moves (e.g. to show move details). */
  onMove?: (i: number) => void;
  /** A small picture before each option (e.g. a move's type symbol). */
  icons?: (Node | undefined)[];
}

/** A Game Boy style menu, navigable with the pad or by tapping. */
export function menu(options: string[], opts: MenuOpts = {}): Promise<number> {
  const box = el('div', `box menu${opts.columns === 2 ? ' grid' : ''}`);
  const pos = opts.pos ?? { right: 0, bottom: 48 };
  if (pos.left !== undefined) box.style.left = gp(pos.left);
  if (pos.right !== undefined) box.style.right = gp(pos.right);
  if (pos.top !== undefined) box.style.top = gp(pos.top);
  if (pos.bottom !== undefined) box.style.bottom = gp(pos.bottom);
  if (pos.width !== undefined) box.style.width = gp(pos.width);
  if (opts.title) box.appendChild(el('div', 'menu-title', opts.title));
  const rows = options.map((o, i) => {
    const r = el('div', 'opt', o);
    const icon = opts.icons?.[i];
    if (icon) r.prepend(icon);
    if (opts.disabled?.[i]) r.classList.add('disabled');
    box.appendChild(r);
    return r;
  });
  overlay.appendChild(box);
  let sel = Math.min(opts.initial ?? 0, options.length - 1);
  const cols = opts.columns ?? 1;
  const render = () => {
    rows.forEach((r, i) => r.classList.toggle('sel', i === sel));
    opts.onMove?.(sel);
  };
  render();

  return new Promise((resolve) => {
    const done = (i: number) => {
      pop();
      box.remove();
      sfx('select');
      resolve(i);
    };
    const move = (d: number) => {
      const n = sel + d;
      if (n >= 0 && n < options.length) {
        sel = n;
        sfx('blip');
        render();
      }
    };
    const pop = input.push((b) => {
      if (b === 'up') move(-cols);
      else if (b === 'down') move(cols);
      else if (b === 'left' && cols === 2 && sel % 2 === 1) move(-1);
      else if (b === 'right' && cols === 2 && sel % 2 === 0) move(1);
      else if (b === 'A' && !opts.disabled?.[sel]) done(sel);
      else if (b === 'B' && opts.cancel) done(-1);
    });
    rows.forEach((r, i) =>
      r.addEventListener('click', () => {
        if (opts.disabled?.[i]) return;
        if (sel !== i) {
          sel = i;
          render();
        }
        done(i);
      }),
    );
  });
}

/** Ask a yes/no question (in Spanish). */
export async function ask(question: string, opts: SayOpts = {}, choices = ['Sí', 'No']): Promise<boolean> {
  await say(question, { ...opts, noWait: true });
  return (await menu(choices, { cancel: true })) === 0;
}

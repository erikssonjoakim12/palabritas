import { overlay, el } from '../engine/screen';
import { input, repeatWhileHeld } from '../engine/input';
import { sfx } from '../engine/sfx';
import { creatureArt, creatureIcon, ICON } from '../art/creatures';
import { G, type Mon } from '../game/state';
import { stats, monName } from '../game/mon';
import { lealtad, levelProgress, isLearned, peekProg, isFading, OBEY_THRESHOLD } from '../game/learning';
import { itemsUpTo } from '../game/curriculum';
import { SPECIES, MODE_INFO, learnLevel } from '../data/species';
import { THEMES } from '../data/content';
import { TYPE_COLORS } from '../data/types';
import { speak } from '../lang/speech';

/** A Palabrita's 16x16 icon, for lists (scaled up with hard pixels by the CSS). */
export function iconCanvas(sp: string) {
  const c = document.createElement('canvas');
  c.width = c.height = ICON;
  c.getContext('2d')!.drawImage(creatureIcon(sp), 0, 0);
  return c;
}

export function spriteCanvas(sp: string, size = 48) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // Fit the sprite in the square without stretching it, standing on the bottom.
  const img = creatureArt(sp).front;
  const k = size / Math.max(img.width, img.height);
  g.drawImage(img, Math.round((size - img.width * k) / 2), Math.round(size - img.height * k), img.width * k, img.height * k);
  return c;
}

export function hpClass(hp: number, max: number) {
  const r = hp / max;
  return r > 0.5 ? '' : r > 0.2 ? 'mid' : 'low';
}

/**
 * A scrollable list in a full-screen box. Resolves the chosen index, or -1 on B. With `stay`, choosing runs it while
 * the list stays open underneath (a menu over the team); the list closes only when it returns true.
 */
export function listMenu(
  rows: HTMLElement[],
  opts: { cancel?: boolean; header?: HTMLElement; initial?: number; stay?: (i: number) => Promise<boolean> } = {},
): Promise<number> {
  const box = el('div', 'box fullpanel');
  if (opts.header) box.appendChild(opts.header);
  rows.forEach((r) => {
    r.classList.add('list-row');
    box.appendChild(r);
  });
  overlay.appendChild(box);
  let sel = Math.min(opts.initial ?? 0, rows.length - 1);
  const render = () => {
    rows.forEach((r, i) => r.classList.toggle('sel', i === sel));
    rows[sel]?.scrollIntoView({ block: 'nearest' });
  };
  render();
  return new Promise((resolve) => {
    let busy = false;
    const done = async (i: number) => {
      if (busy) return;
      sfx('select');
      if (i >= 0 && opts.stay) {
        busy = true;
        pop();
        const close = await opts.stay(i);
        busy = false;
        if (!close) return void (pop = input.push(keys));
      } else pop();
      box.remove();
      resolve(i);
    };
    const step = (d: number) => {
      if (busy || sel + d < 0 || sel + d >= rows.length) return;
      sel += d;
      sfx('blip');
      render();
    };
    const keys = (b: string) => {
      // Held, it keeps moving through a long list (the Palabridex).
      if (b === 'up') (step(-1), repeatWhileHeld('up', () => step(-1), 90));
      else if (b === 'down') (step(1), repeatWhileHeld('down', () => step(1), 90));
      else if (b === 'A' && rows.length) done(sel);
      else if (b === 'B' && opts.cancel !== false) done(-1);
    };
    let pop = input.push(keys);
    rows.forEach((r, i) => r.addEventListener('click', () => ((sel = i), render(), done(i))));
  });
}

/**
 * A Palabrita in a list, like Gold/Silver's party screen: its icon, its name and level, its health. Compact, so
 * all six fit at once (loyalty and its words are on its page, DETALLES). mon-row: the chosen one's icon bobs.
 */
function partyRow(mon: Mon, active?: Mon) {
  const row = el('div', 'mon-row');
  const s = stats(mon);
  row.appendChild(iconCanvas(mon.sp));
  const info = el('div', 'grow');
  const top = el('div', 'mon-top');
  top.append(el('span', '', `${monName(mon)}${mon === active ? ' ★' : ''}`), el('span', '', `Nv${mon.level}`));
  const hp = el('div', 'mon-hp');
  const bar = el('div', `hpbar ${hpClass(mon.hp, s.maxHp)}`);
  const fill = el('div');
  fill.style.width = `${(100 * mon.hp) / s.maxHp}%`;
  bar.appendChild(fill);
  hp.append(bar, el('span', 'small', `${mon.hp}/${s.maxHp}`));
  info.append(top, hp);
  row.appendChild(info);
  return row;
}

/** Pick one of these Palabritas (the team, the storage box...), or null on B. */
export async function pickFrom(mons: Mon[], title: string): Promise<Mon | null> {
  const i = await listMenu(mons.map((m) => partyRow(m)), { header: el('div', 'menu-title', title) });
  return i < 0 ? null : mons[i];
}

/**
 * Pick a Palabrita. In 'switch'/'forced' mode only Palabritas that can fight are valid. With `stay`, the team stays on
 * screen while it runs (the START menu's DETALLES / PRIMERO / SALIR); it returns true to close the team.
 */
export async function pickMon(mode: 'switch' | 'forced' | 'view', active?: Mon, stay?: (mon: Mon) => Promise<boolean>): Promise<Mon | null> {
  while (true) {
    const header = el('div', 'menu-title', mode === 'view' ? 'TUS PALABRITAS' : '¿Quién luchará?');
    const party = G.save.party;
    const i = await listMenu(party.map((m) => partyRow(m, active)), { cancel: mode !== 'forced', header, stay: stay && ((n) => stay(party[n])) });
    if (i < 0) return null;
    const mon = G.save.party[i];
    if (mode !== 'view' && mon.hp <= 0) {
      sfx('bump');
      continue;
    }
    return mon;
  }
}

// ---------- Detail pages (Palabrita details, dictionary entries) ----------

/** A full-screen page about a kind of Palabrita: its big sprite, then a title. */
export function detailBox(sp: string, title: string) {
  const box = el('div', 'box fullpanel detail');
  const big = spriteCanvas(sp, 96);
  big.className = 'big';
  box.append(big, el('h3', '', title));
  return box;
}

/** A word and its English. Tap the Spanish to hear it. */
export function wordRow(es: string, en: string, mark = '') {
  const w = el('div', 'word');
  const left = el('span', '', mark ? `${mark} ${es}` : es);
  left.style.cursor = 'pointer';
  left.addEventListener('click', (e) => {
    e.stopPropagation();
    speak(es);
  });
  w.append(left, el('span', 'en', en));
  return w;
}

/** Show a detail page until A, B or a tap; up/down scroll it. */
export function openDetail(box: HTMLElement): Promise<void> {
  overlay.appendChild(box);
  return new Promise((resolve) => {
    const close = () => {
      pop();
      box.remove();
      resolve();
    };
    const pop = input.push((b) => {
      if (b === 'A' || b === 'B') close();
      // A tap scrolls a step; held, it keeps scrolling (a Palabrita's word list gets long).
      if (b === 'down') (box.scrollTop += 40, repeatWhileHeld('down', () => (box.scrollTop += 6)));
      if (b === 'up') (box.scrollTop -= 40, repeatWhileHeld('up', () => (box.scrollTop -= 6)));
    });
    box.addEventListener('click', close);
  });
}

/** Full details for one Palabrita: theme, loyalty, moves, words for the next level. */
export function showDetails(mon: Mon): Promise<void> {
  const sp = SPECIES[mon.sp];
  const theme = THEMES[sp.theme];
  const s = stats(mon);
  const box = detailBox(mon.sp, `${sp.name}  Nv${mon.level}`);
  const types = el('div', 'row');
  for (const t of sp.types) {
    const chip = el('span', '', ` ${t} `);
    chip.style.background = TYPE_COLORS[t];
    chip.style.color = '#fff';
    chip.style.marginRight = '0.4em';
    chip.style.borderRadius = '4px';
    types.appendChild(chip);
  }
  box.appendChild(types);
  box.appendChild(el('div', 'row', `Tema: ${theme.name}`));
  box.appendChild(el('div', 'row muted', `Theme: ${theme.en}`));
  box.appendChild(el('div', 'row', `PS ${mon.hp}/${s.maxHp} · Ata ${s.atk} · Def ${s.def} · Vel ${s.spd}`));

  const loy = lealtad(mon);
  box.appendChild(el('div', 'row', `Lealtad ♥ ${Math.round(loy * 100)}%`));
  const meter = el('div', 'meter');
  const fill = el('div');
  fill.style.width = `${loy * 100}%`;
  if (loy < OBEY_THRESHOLD) fill.style.background = 'var(--bad)';
  meter.appendChild(fill);
  box.appendChild(meter);
  box.appendChild(el('div', 'row muted', 'Loyalty: keep using its words or it stops obeying.'));

  const moves = el('div', 'row');
  moves.appendChild(el('div', 'muted', 'Ataques · Moves'));
  for (const m of sp.moves) {
    const known = learnLevel(m) <= mon.level;
    // Moves it hasn't learned yet stay a secret, like in Gold/Silver.
    const line = known
      ? el('div', '', `${MODE_INFO[m.mode].icon} ${m.name} · ${m.type} · Poder ${MODE_INFO[m.mode].power}`)
      : el('div', 'muted', '❔ ???');
    moves.appendChild(line);
  }
  box.appendChild(moves);

  const lp = levelProgress(mon);
  const words = el('div', 'words');
  words.appendChild(
    el('div', 'muted', lp.maxed ? 'Nivel máximo de esta versión.' : `Para el nivel ${mon.level + 1}: ${lp.learned}/${lp.total} nuevas dominadas`),
  );
  const addWord = (es: string, en: string, mark: string) => words.appendChild(wordRow(es, en, mark));
  for (const it of lp.items) {
    const p = peekProg(it.id);
    if (isLearned(it)) addWord(it.es, it.en, '✓');
    else if (p?.seen) addWord(it.es, it.en, '…');
    else addWord('???', it.en, '·');
  }
  // Half of an earlier level must be reviewed before leveling up.
  const { review } = lp;
  if (review.all.length) {
    words.appendChild(
      el('div', 'muted', `Repaso del nivel ${review.level}: ${lp.reviewDone}/${lp.reviewTotal}`),
    ).style.marginTop = '0.8em';
    for (const it of review.all) addWord(it.es, it.en, review.todo.includes(it) ? '↻' : '✓');
  }
  const learned = itemsUpTo(mon.sp, mon.level - 1).filter(isLearned);
  if (learned.length) {
    words.appendChild(el('div', 'muted', `Ya dominadas (${learned.length}):`)).style.marginTop = '0.8em';
    for (const it of learned) addWord(it.es, it.en, isFading(peekProg(it.id)) ? '⚠' : '✓');
  }
  box.appendChild(words);
  box.appendChild(el('div', 'row muted', sp.dex.es));
  return openDetail(box);
}

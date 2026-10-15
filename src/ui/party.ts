import { overlay, el } from '../engine/screen';
import { input } from '../engine/input';
import { sfx } from '../engine/sfx';
import { CREATURE_ART } from '../art/creatures';
import { G, type Mon } from '../game/state';
import { stats, monName } from '../game/mon';
import { lealtad, levelProgress, isLearned, peekProg, isFading, OBEY_THRESHOLD } from '../game/learning';
import { itemsUpTo } from '../game/curriculum';
import { SPECIES, MODE_INFO, learnLevel } from '../data/species';
import { THEMES } from '../data/content';
import { TYPE_COLORS } from '../data/types';
import { speak } from '../lang/speech';

export function spriteCanvas(sp: string, size = 48) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // Fit the sprite in the square without stretching it, standing on the bottom.
  const img = CREATURE_ART[sp].front;
  const k = size / Math.max(img.width, img.height);
  g.drawImage(img, Math.round((size - img.width * k) / 2), Math.round(size - img.height * k), img.width * k, img.height * k);
  return c;
}

export function hpClass(hp: number, max: number) {
  const r = hp / max;
  return r > 0.5 ? '' : r > 0.2 ? 'mid' : 'low';
}

/** A scrollable list in a full-screen box. Resolves the chosen index, or -1 on B. */
export function listMenu(rows: HTMLElement[], opts: { cancel?: boolean; header?: HTMLElement; initial?: number } = {}): Promise<number> {
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
    const done = (i: number) => {
      pop();
      box.remove();
      sfx('select');
      resolve(i);
    };
    const pop = input.push((b) => {
      if (b === 'up' && sel > 0) (sel--, sfx('blip'), render());
      else if (b === 'down' && sel < rows.length - 1) (sel++, sfx('blip'), render());
      else if (b === 'A' && rows.length) done(sel);
      else if (b === 'B' && opts.cancel !== false) done(-1);
    });
    rows.forEach((r, i) => r.addEventListener('click', () => done(i)));
  });
}

function partyRow(mon: Mon, active?: Mon) {
  const row = el('div');
  const s = stats(mon);
  row.appendChild(spriteCanvas(mon.sp));
  const info = el('div', 'grow');
  info.appendChild(el('div', '', `${monName(mon)}${mon === active ? ' ★' : ''}`));
  const loy = Math.round(lealtad(mon) * 100);
  info.appendChild(el('div', 'small', `Nv${mon.level}  PS ${mon.hp}/${s.maxHp}  ♥${loy}%`));
  const bar = el('div', `hpbar ${hpClass(mon.hp, s.maxHp)}`);
  const fill = el('div');
  fill.style.width = `${(100 * mon.hp) / s.maxHp}%`;
  bar.appendChild(fill);
  info.appendChild(bar);
  const lp = levelProgress(mon);
  info.appendChild(el('div', 'small', lp.maxed ? 'Nivel máx.' : `Nuevas ${lp.learned}/${lp.total}${lp.reviewTotal ? ` · Repaso ${lp.reviewDone}/${lp.reviewTotal}` : ''}`));
  row.appendChild(info);
  return row;
}

/** Pick a Palabrita. In 'switch'/'forced' mode only Palabritas that can fight are valid. */
export async function pickMon(mode: 'switch' | 'forced' | 'view', active?: Mon): Promise<Mon | null> {
  while (true) {
    const header = el('div', 'menu-title', mode === 'view' ? 'TUS PALABRITAS' : '¿Quién luchará?');
    const i = await listMenu(G.save.party.map((m) => partyRow(m, active)), { cancel: mode !== 'forced', header });
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
      if (b === 'down') box.scrollTop += 40;
      if (b === 'up') box.scrollTop -= 40;
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

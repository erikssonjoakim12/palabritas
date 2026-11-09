// The battle's boxes with each side's name, level and health (and yours, its loyalty).
import { overlay, el } from '../engine/screen';
import { OBJECTS } from '../art/chars';
import { G, type Mon } from '../game/state';
import { stats, monName } from '../game/mon';
import { lealtad, OBEY_THRESHOLD } from '../game/learning';
import { hpClass } from '../ui/party';

export interface Hud {
  root: HTMLElement;
  update(): void;
  show(side: 'enemy' | 'player', visible: boolean): void;
}

/**
 * Gold/Silver battle boxes: name, then ":N7" (N for nivel = level), then a "PS:" bar
 * (puntos de salud = HP), inside a bracket line. Yours also shows PS numbers and loyalty.
 */
export function buildHud(getEnemy: () => Mon, getMe: () => Mon, wild: boolean): Hud {
  const root = el('div');
  const mk = (cls: string, showNum: boolean) => {
    const box = el('div', `hud ${cls}`);
    const name = el('div', 'name');
    const lv = el('div', 'lv');
    const br = el('div', 'bracket');
    const row = el('div', 'hprow');
    const bar = el('div', 'hpbar');
    const fill = el('div');
    bar.appendChild(fill);
    row.append(el('span', 'hplabel', 'PS:'), bar);
    br.appendChild(row);
    const num = el('div', 'hpnum');
    const loy = el('div', 'loyalty');
    if (showNum) br.append(num, loy);
    box.append(name, lv, br);
    root.appendChild(box);
    return { box, name, lv, bar, fill, num, loy };
  };
  const e = mk('enemy', false);
  const p = mk('player', true);
  // A wild Palabrita you've already caught: a tiny Palabola by its level (Gold/Silver show it too).
  const caught = document.createElement('canvas');
  caught.className = 'caught';
  caught.width = caught.height = 7;
  caught.getContext('2d')!.drawImage(OBJECTS.palabolaMini, 0, 0);
  e.lv.appendChild(caught);
  overlay.appendChild(root);
  const set = (h: ReturnType<typeof mk>, mon: Mon) => {
    const s = stats(mon);
    const name = monName(mon);
    h.name.textContent = name;
    // Long names (Guardabarranco, Nacatamastín, nicknames) get smaller letters instead of running off the box.
    h.name.style.fontSize = name.length > 10 ? `${10 / name.length}em` : '';
    h.lv.textContent = `:N${mon.level}`;
    h.fill.style.width = `${Math.max(0, (100 * mon.hp) / s.maxHp)}%`;
    h.bar.className = `hpbar ${hpClass(mon.hp, s.maxHp)}`;
    h.num.textContent = `${mon.hp}/ ${s.maxHp}`;
  };
  return {
    root,
    update() {
      set(e, getEnemy());
      caught.hidden = !(wild && G.save.caught.includes(getEnemy().sp));
      e.lv.appendChild(caught); // set() replaced the level's text
      const me = getMe();
      set(p, me);
      const l = lealtad(me);
      p.loy.textContent = `♥ ${Math.round(l * 100)}%`;
      p.loy.style.color = l < OBEY_THRESHOLD ? 'var(--bad)' : '';
    },
    show(side, visible) {
      (side === 'enemy' ? e : p).box.style.visibility = visible ? '' : 'hidden';
    },
  };
}

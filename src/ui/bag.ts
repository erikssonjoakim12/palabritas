import { sfx } from '../engine/sfx';
import { ITEM_DEFS } from '../data/items';
import { G } from '../game/state';
import { bagItems, itemCount, healWith, takeItem, money } from '../game/bag';
import { monName, stats } from '../game/mon';
import { menu } from './menu';
import { info } from './textbox';
import { pickMon } from './party';

/** Pick an item from the MOCHILA. Resolves its id, or null (B / empty bag). */
export async function chooseItem(): Promise<string | null> {
  const items = bagItems();
  if (!items.length) {
    await info('La mochila está vacía.', { en: 'Your bag is empty.' });
    return null;
  }
  const i = await menu(
    items.map((id) => `${ITEM_DEFS[id].name} ×${itemCount(id)}`),
    { cancel: true, title: `MOCHILA · ${money()}`, pos: { left: 0, right: 0, bottom: 0 } },
  );
  return i < 0 ? null : items[i];
}

/** Choose a Palabrita and use a potion or a Revivir on it. True if it was used up. */
export async function useOnMon(id: string): Promise<boolean> {
  const mon = await pickMon('view');
  if (!mon) return false;
  if (ITEM_DEFS[id].revive) {
    if (mon.hp > 0) {
      await info(`¡${monName(mon)} no está debilitado!`, { en: `${monName(mon)} hasn’t fainted! (Revivir is for fainted Palabritas.)` });
      return false;
    }
    takeItem(id);
    mon.hp = Math.floor(stats(mon).maxHp / 2);
    sfx('heal');
    await info(`¡${monName(mon)} revivió!`, { en: `${monName(mon)} was revived!` });
    return true;
  }
  const healed = healWith(id, mon);
  if (!healed) {
    await info(mon.hp <= 0 ? 'No funciona con una Palabrita debilitada.' : `¡${monName(mon)} ya tiene todos sus PS!`, {
      en: mon.hp <= 0 ? 'It doesn’t work on a fainted Palabrita.' : `${monName(mon)} already has full PS!`,
    });
    return false;
  }
  takeItem(id);
  sfx('heal');
  await info(`${monName(mon)} recuperó ${healed} PS.`, { en: `${monName(mon)} recovered ${healed} PS.` });
  return true;
}

/** "Not now": a key item (or anything) that has no use here. */
export const notNow = () => info('Ahora no.', { en: 'Not now. (There’s no use for it here.)' });

/** START → MOCHILA: look at your items and use potions, Revivir and Repelente. */
export async function openBag() {
  while (true) {
    const id = await chooseItem();
    if (!id) return;
    const def = ITEM_DEFS[id];
    if (def.heal || def.revive) await useOnMon(id);
    else if (def.repel) {
      takeItem(id);
      G.save.repel = def.repel;
      sfx('heal');
      await info(`Usaste un ${def.name}. Las Palabritas salvajes no se acercarán por un rato.`, {
        en: `You used a ${def.enName}. Wild Palabritas won’t come near for ${def.repel} steps.`,
      });
    } else if (def.ball) await info(`Las ${def.plural} se lanzan en batalla, contra Palabritas salvajes.`, { en: `${def.enPlural} are thrown in battle, at wild Palabritas.` });
    else await notNow();
  }
}

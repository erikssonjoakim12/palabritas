import { sfx } from '../engine/sfx';
import { ITEM_DEFS } from '../data/items';
import { bagItems, itemCount, healWith, takeItem, money } from '../game/bag';
import { monName } from '../game/mon';
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

/** Choose a Palabrita and heal it with a potion. True if it was used up. */
export async function usePotion(id: string): Promise<boolean> {
  const mon = await pickMon('view');
  if (!mon) return false;
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

/** START → MOCHILA: look at your items and use potions. */
export async function openBag() {
  while (true) {
    const id = await chooseItem();
    if (!id) return;
    if (ITEM_DEFS[id].heal) await usePotion(id);
    else await info('Las Palabolas se lanzan en batalla, contra Palabritas salvajes.', { en: 'Palabolas are thrown in battle, at wild Palabritas.' });
  }
}

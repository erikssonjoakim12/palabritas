import { overlay, el } from '../engine/screen';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag } from '../game/state';
import { dueCount, dueItems } from '../game/review';
import { drill, reviewMode } from './school';
import { addItem, itemCount, money } from '../game/bag';
import { ITEM_DEFS, SHOPS, amountOf } from '../data/items';
import { gradeOrder } from '../lang/order';
import { healParty, stats, monName, PARTY_MAX, fieldHelper } from '../game/mon';
import { adHocItem } from '../data/content';
import { say, info, closeText, setSpeaker } from '../ui/textbox';
import { ask, menu } from '../ui/menu';
import { pickFrom } from '../ui/party';
import { startMenu } from '../ui/startmenu';
import { wildBattle } from '../battle/battle';
import { SCRIPTS, scriptedStep, currentMap, refreshNpcs, npcById, pickEncounter, facingTile, facingSpot, startSurf, cutTree, isWater, warp, useStrength, strengthOn, MUTED_MIME, type ScriptFn } from './world';
import { townMap } from '../ui/townmap';
import { flySpots, flyTowns } from './fly';
import type { Mon } from '../game/state';
import { gateOf, closedLines, FRESHWATER } from './maps';
import { lines, sayOrMime, talkMode, heal, blackout, practice } from './flows';
import { REGION1 } from './region1';
import { REGION2 } from './region2';
import { REGION3 } from './region3';
import { REGION4 } from './region4';
import { REGION6 } from './region6';
import { REGION7 } from './region7';
import { REGION8 } from './region8';
import { TILES } from '../art/tiles';
import { notNow } from '../ui/bag';
import { gloss } from '../lang/gloss';
import { MINI_BALL, BALL_COLORS, FLASH_COLORS, drawPattern } from '../art/balls';

/*
  The scripts every town shares (the Palacentro, the shop, the box, gates, items on the ground, swimming, flying,
  cutting, fishing) and the registry of every region's scripts (region1.ts...). The building blocks they're made of
  are in flows.ts.
*/

/** Climb onto a water Palabrita and swim off (Surf). */
async function surf(mon: Mon) {
  await info(`¡{name} se sube a ${monName(mon)}!`, { en: `{name} climbs onto ${monName(mon)}!`, sv: `{name} klättrar upp på ${monName(mon)}!` });
  await startSurf();
}

/**
 * Gold/Silver's healing: the Palabolas go into the machine one by one, flash, and the
 * healing jingle plays.
 */
async function healingMachine() {
  const machine = npcById('maquina');
  if (!machine) return heal();
  const count = Math.max(1, G.save.party.length);
  // 6 slots of 4x4 in the machine's tray; each holds a mini Palabola (teal top, white bottom).
  const slots: [number, number][] = [[2, 3], [6, 3], [10, 3], [2, 7], [6, 7], [10, 7]];
  let shown = 0;
  let flash = false;
  machine.overlay = (g, x, y) => {
    for (let i = 0; i < shown; i++) drawPattern(g, MINI_BALL, x + slots[i][0], y + slots[i][1], flash ? FLASH_COLORS : BALL_COLORS);
  };
  for (let i = 0; i < count && i < 6; i++) {
    shown = i + 1;
    sfx('blip');
    await frames(14);
  }
  sfx('heal');
  healParty();
  for (let k = 0; k < 10; k++) {
    flash = !flash;
    await frames(8);
  }
  machine.overlay = undefined;
}

// ---------- Scripts ----------

const S: Record<string, ScriptFn> = {
  async startMenu(c) {
    const next = await startMenu();
    if (next) await SCRIPTS[next.script]({ ...c, data: next.data });
  },

  /** Facing water: swim on a big water Palabrita (Surf, from the 4th medal), or else fish with the rod. */
  async agua(c) {
    const swimmer = !G.save.surfing && fieldHelper('surf');
    if (swimmer) {
      const name = monName(swimmer);
      if (await ask(`El agua está tranquila. ¿Quieres nadar con ${name}?`, { en: `The water is calm. Do you want to swim with ${name}?`, sv: `Vattnet är lugnt. Vill du simma med ${name}?` })) return surf(swimmer);
    }
    if (itemCount('cana')) return SCRIPTS.fish(c);
  },

  /** NADAR from the team menu, with that Palabrita. */
  async nadar(c) {
    if (G.save.surfing) return info('¡Ya estás nadando!', { en: 'You’re already swimming!' });
    if (!isWater(facingTile())) return info('Aquí no hay agua para nadar.', { en: 'There’s no water here to swim in.' });
    return surf(c.data!.mon as Mon);
  },

  /**
   * VOLAR from the team menu (Fly, from the 6th medal): pick a town you've been to, and land outside its Palacentro.
   * Not indoors, and not in the fog while it lasts (the story there needs you on foot).
   */
  async volar(c) {
    const m = currentMap();
    if (!m.outdoor) return info('Aquí adentro no se puede volar.', { en: 'You can’t fly indoors.' });
    if ((m.fog && !flag('tomasEnCasa')) || G.save.follower) return info('La niebla es demasiado espesa para volar.', { en: 'The fog is too thick to fly.' });
    const to = await townMap(flyTowns());
    if (!to) return;
    const at = flySpots()[to];
    const bird = monName(c.data!.mon as Mon);
    sfx('jump');
    await info(`¡${bird} te lleva volando!`, { en: `${bird} carries you through the sky!`, sv: `${bird} bär dig genom luften!`, auto: 1200 });
    await warp(to, at.x, at.y, 'down', false);
  },

  /** A thin tree (A facing it), or CORTAR from the team menu: cut it with a Palabrita that can (from the 5th medal). */
  async cortar(c) {
    const chosen = c.data?.mon as Mon | undefined;
    if (facingTile() !== '/') return info('Aquí no hay nada que cortar.', { en: 'There’s nothing to cut here.' });
    const cutter = chosen ?? fieldHelper('cut');
    const { es, en } = TILES['/'].look!;
    if (!cutter) return say(es, { en });
    const name = monName(cutter);
    if (!chosen && !(await ask(`Este arbolito se puede cortar. ¿Quieres cortarlo con ${name}?`, { en: `This little tree can be cut. Do you want to cut it with ${name}?`, sv: `Det här lilla trädet går att hugga ner. Vill du hugga ner det med ${name}?` }))) return;
    sfx('hit');
    cutTree(...facingSpot());
    await frames(30); // the slash and the leaves
    await info(`¡${name} cortó el arbolito!`, { en: `${name} cut the little tree!`, sv: `${name} högg ner det lilla trädet!` });
  },

  /**
   * FUERZA from the team menu, or A facing a boulder: a strong Palabrita (from the 7th medal) lets you push boulders
   * until you leave the map.
   */
  async fuerza(c) {
    if (strengthOn()) return info('¡Camina hacia una roca para empujarla!', { en: 'Walk into a boulder to push it!' });
    const chosen = c.data?.mon as Mon | undefined;
    const strong = chosen ?? fieldHelper('strength');
    if (!strong) return say('Es una roca enorme. Una Palabrita muy fuerte podría moverla.', { en: 'It’s a huge boulder. A very strong Palabrita could move it.' });
    const name = monName(strong);
    if (!chosen && !(await ask(`Es una roca enorme. ¿Quieres usar FUERZA con ${name}?`, { en: `It’s a huge boulder. Do you want to use Strength with ${name}?`, sv: `Det är ett enormt stenblock. Vill du använda FUERZA med ${name}?` }))) return;
    useStrength();
    sfx('hit');
    await info(`¡${name} usó FUERZA! Ahora puedes empujar las rocas.`, { en: `${name} used Strength! Now you can push the boulders.`, sv: `${name} använde FUERZA! Nu kan du knuffa stenblocken.` });
  },
  roca: (c) => SCRIPTS.fuerza(c),

  /** Fishing with the rod, facing water: sometimes something bites. */
  async fish() {
    if (TILES[facingTile()].kind !== 'water') return notNow();
    await info('{name} tiró la caña...', { en: '{name} cast the fishing rod...', auto: 900 });
    await info('...', { auto: 1000 + Math.random() * 2000 });
    if (Math.random() >= 0.75) return info('No pica nada...', { en: 'Nothing’s biting...' });
    sfx('alert');
    await info('¡Algo picó!', { en: 'Something bit!', auto: 800 });
    const { sp, level } = pickEncounter(currentMap().fishing?.table ?? FRESHWATER);
    if ((await wildBattle(sp, level)) === 'lose') await blackout();
  },

  async __wild(c) {
    const { sp, level } = c.data as { sp: string; level: number };
    if ((await wildBattle(sp, level)) === 'lose') await blackout();
  },

  /** A gate guard (world/maps/): why the road is closed, or that you may pass now. */
  async gate(c) {
    const g = gateOf(currentMap(), c.npc!.def.id)!;
    if (g.opens() && g.openScript) return SCRIPTS[g.openScript](c);
    await lines(...(g.opens() ? g.open : closedLines(g)));
  },

  /** Stepping onto the road beside a guard: stopped and sent back. */
  async gateStop() {
    const g = currentMap().gates?.find((g) => g.road.some(([x, y]) => x === G.save.x && y === G.save.y));
    if (!g || g.opens()) return;
    sfx('alert');
    setSpeaker(g.look);
    if (currentMap().muted?.()) await say('…', { en: g.mime ?? MUTED_MIME });
    else await lines(...closedLines(g));
    await scriptedStep(g.back);
  },

  /** The shop: pick something, then ask for it in Spanish (written or spoken). */
  async cajera() {
    await sayOrMime(['¡Bienvenid{o/a} a la tienda! ¿Qué deseas comprar?', 'Welcome to the shop! What would you like to buy?'], '(The cashier can’t speak. She smiles and points at the shelves.)', { noWait: true });
    const shop = SHOPS[currentMap().id] ?? SHOPS.tienda_brisa;
    // Your money in the top right while you shop (like Gold/Silver), updated after every purchase.
    const purse = el('div', 'box purse');
    const showMoney = () => (purse.textContent = `DINERO ${money()}`);
    showMoney();
    overlay.appendChild(purse);
    try {
      while (true) {
        const i = await menu([...shop.map((id) => `${ITEM_DEFS[id].name}  ${money(ITEM_DEFS[id].price)}`), 'Nada'], { cancel: true });
        if (i < 0 || i >= shop.length) break;
        const id = shop[i];
        const def = ITEM_DEFS[id];
        const most = Math.min(5, Math.floor(G.save.money / def.price));
        if (!most) {
          await sayOrMime(['Lo siento, no tienes suficiente dinero.', 'Sorry, you don’t have enough money.'], '(She shakes her head and points at your purse: not enough money.)');
          continue;
        }
        const q = await menu(Array.from({ length: most }, (_, k) => `×${k + 1}  ${money(def.price * (k + 1))}`), { cancel: true, title: def.feminine ? '¿Cuántas?' : '¿Cuántos?' });
        if (q < 0) continue;
        const n = q + 1;
        const enOrder = `I’d like ${n} ${n === 1 ? def.enName : def.enPlural}, please`;
        const svOrder = `Jag vill ha ${n} ${n === 1 ? def.name : def.plural}, tack`;
        const r = await practice({
          item: adHocItem([`Quiero ${amountOf(id, n)}, por favor`], gloss('', enOrder, svOrder)),
          mode: talkMode(),
          title: '🛒 Tienda',
          label: `Pídelo en español: «${enOrder}»`,
          labelSv: `Pídelo en español: «${svOrder}»`,
          allowHelp: true,
          validate: (answer) => gradeOrder(answer, id, n),
        });
        if (r.grade === 'wrong') {
          await sayOrMime(['¿Perdón? No te entendí bien. ¿Qué deseas?', 'Sorry? I didn’t quite understand. What would you like?'], '(She tilts her head: she didn’t understand. Try again!)');
          continue;
        }
        G.save.money -= def.price * n;
        showMoney();
        addItem(id, n);
        sfx('caught');
        await sayOrMime(
          [`¡Aquí tienes: ${amountOf(id, n)}! Son ${money(def.price * n)}.`, `Here you go! That’s ${money(def.price * n)}.`, `Varsågod! Det blir ${money(def.price * n)}.`],
          [`(She hands it over and writes the price on a paper: ${money(def.price * n)}.)`, `(Hon ger dig det och skriver priset på en lapp: ${money(def.price * n)}.)`],
        );
        await sayOrMime(['¿Algo más?', 'Anything else?'], '(She raises her eyebrows: anything else?)', { noWait: true });
      }
    } finally {
      purse.remove();
    }
    await sayOrMime(['¡Gracias por tu compra! Vuelve pronto.', 'Thanks for shopping! Come back soon.'], '(She waves goodbye.)');
  },

  /** The Palacentro computer: the Caja de Palabritas (storage box). */
  async computer() {
    await say('Encendiste la computadora. ¿Qué quieres hacer?', {
      en: 'You turned on the computer. What do you want to do? DEPOSITAR = leave a Palabrita in the box, RETIRAR = take one out, SALIR = log off.',
      noWait: true,
    });
    while (true) {
      const i = await menu(['DEPOSITAR', 'RETIRAR', 'SALIR'], { cancel: true, title: 'CAJA DE PALABRITAS' });
      if (i === 0) {
        const mon = await pickFrom(G.save.party, '¿Cuál dejas en la caja?');
        if (!mon) continue;
        if (mon.hp > 0 && !G.save.party.some((m) => m !== mon && m.hp > 0)) {
          await lines(['¡No puedes dejar tu equipo vacío!', 'You can’t leave your team empty (keep one that can fight)!']);
          continue;
        }
        G.save.party.splice(G.save.party.indexOf(mon), 1);
        mon.hp = stats(mon).maxHp;
        G.save.box.push(mon);
        sfx('door');
        await info(`Dejaste a ${monName(mon)} en la caja.`, { en: `You left ${monName(mon)} in the box (it gets healed there).`, sv: `Du lämnade ${monName(mon)} i lådan (där blir den frisk igen).` });
      } else if (i === 1) {
        if (!G.save.box.length) {
          await info('La caja está vacía.', { en: 'The box is empty.' });
          continue;
        }
        if (G.save.party.length >= PARTY_MAX) {
          await info('Tu equipo está lleno.', { en: `Your team is full (${PARTY_MAX}). Deposit one first.`, sv: `Ditt lag är fullt (${PARTY_MAX}). Lämna en i lådan först.` });
          continue;
        }
        const mon = await pickFrom(G.save.box, '¿Cuál sacas de la caja?');
        if (!mon) continue;
        G.save.box.splice(G.save.box.indexOf(mon), 1);
        G.save.party.push(mon);
        sfx('select');
        await info(`¡${monName(mon)} volvió a tu equipo!`, { en: `${monName(mon)} is back on your team!`, sv: `${monName(mon)} är tillbaka i ditt lag!` });
      } else break;
    }
    closeText();
  },

  async enfermera() {
    const muted = currentMap().muted?.();
    await sayOrMime(['¡Hola! Bienvenidos al Palacentro.', 'Hi! Welcome to the Palacentro.'], '(The nurse can’t speak. She smiles and bows.)');
    const healIt = muted
      ? await ask('…', { en: '(She points at your Palabolas, then at the healing machine. Heal your Palabritas?)' })
      : await ask('¿Quieres que cure a tus Palabritas?', { en: 'Would you like me to heal your Palabritas?' });
    if (healIt) {
      await sayOrMime(['Un momento, por favor...', 'One moment, please...'], '(She takes your Palabolas.)');
      await healingMachine();
      G.save.heal = { map: currentMap().id, x: 4, y: 3 };
      await sayOrMime(['¡Listo! Tus Palabritas están sanas. ¡Vuelve pronto!', 'Done! Your Palabritas are healthy. Come back soon!'], '(She gives them back with a big smile and a thumbs up.)');
      const due = dueCount();
      if (due >= 15 && !muted) await lines([`Por cierto: tienes ${due} palabras para repasar. ¡Nuestra lora te ayuda!`, `By the way: you have ${due} words to review. Our parrot can help!`, `Förresten: du har ${due} ord att repetera. Vår papegoja kan hjälpa dig!`]);
    } else {
      await sayOrMime(['¡Vuelve pronto!', 'Come back soon!'], '(She waves.)');
    }
  },

  /** The Palacentro's parrot: «¡Repite conmigo!», ten of your words due for review (never new ones), any time. */
  async lora() {
    if (currentMap().muted?.()) return info('La lora abre el pico... pero no sale ningún sonido.', { en: 'The parrot opens its beak... but no sound comes out.' });
    const due = dueItems();
    if (!due.length) return lines(['¡Cuac! ¡Ya repasaste todo! ¡Cuac!', 'Squawk! You’ve reviewed everything! Squawk!']);
    await lines(['¡Cuac! ¡Repite conmigo! ¡Repite conmigo!', 'Squawk! Repeat after me! Repeat after me!']);
    const finished = await drill(due.slice(0, 10), { title: (d, t) => `Lora ${d + 1}/${t}`, mode: reviewMode });
    await lines(finished ? ['¡Cuac! ¡Muy bien, muy bien!', 'Squawk! Very good, very good!'] : ['¡Cuac! ¡Hasta luego, hasta luego!', 'Squawk! See you, see you!']);
  },

  async maquina() {
    await lines(['Es la máquina que cura a las Palabritas.', 'It’s the machine that heals Palabritas.']);
  },

  /** An item ball (maps/kit.ts, itemBall): what's inside goes in your bag, once. */
  async itemBall(c) {
    const { id, item } = c.npc!.def;
    if (!item || flag(`item:${id}`)) return;
    setFlag(`item:${id}`);
    addItem(item);
    sfx('levelup');
    await info(`¡{name} encontró ${amountOf(item, 1)}!`, { en: `{name} found a ${ITEM_DEFS[item].enName}!`, sv: `{name} hittade: ${ITEM_DEFS[item].name}!` });
    if (!flag('itemTip')) {
      setFlag('itemTip');
      await info('Lo que encuentras está en START → MOCHILA. ¡También puedes usarlo en batalla!', { en: 'What you find is in START → MOCHILA. You can use it in battle too!' });
    }
    refreshNpcs();
  },
};

export function registerScripts() {
  Object.assign(SCRIPTS, S, REGION1, REGION2, REGION3, REGION4, REGION6, REGION7, REGION8);
}

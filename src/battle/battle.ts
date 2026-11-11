import { W, overlay, el } from '../engine/screen';
import { setScene, getScene, frames } from '../engine/loop';
import { sfx } from '../engine/sfx';
import { creatureArt } from '../art/creatures';
import { portrait } from '../art/portraits';
import { G, playerLook, type Mon } from '../game/state';
import { stats, monName, checkLevelUps, firstAble, markSeen, keepMon, newMon, knownMoves, newMoves, evolutionsDue, evolve, type LevelUp } from '../game/mon';
import { SPECIES, MODE_INFO, type Move } from '../data/species';
import { effectiveness } from '../data/types';
import { THEMES, type Item } from '../data/content';
import { pickForMon, pickFromKind, defenseItem, record, lealtad, fadingItems, OBEY_THRESHOLD } from '../game/learning';
import { challenge, type ChallengeResult } from '../ui/challenge';
import { info, say, closeText } from '../ui/textbox';
import { chooseItem, useOnMon, notNow } from '../ui/bag';
import { takeItem, itemCount, prizeMoney, money } from '../game/bag';
import { ITEM_DEFS } from '../data/items';
import { menu } from '../ui/menu';
import { typeIcon } from '../art/typeIcon';
import { setBattleMusic, battleMusicFor, playOverlay, clearOverlay, endBattleSong } from '../audio/bgm';
import { pickMon } from '../ui/party';
import { stage, clearStage, battleScene, fighter, enemyFighter, myFighter, lunge, hitAnim, sinkAnim, slide, encounterFlash, throwBall, shakeBall, breakOut, silhouette, SLOT, ENEMY_POS, ME_POS, type Fighter } from './stage';
import { buildHud, type Hud } from './hud';
import { canListen } from '../lang/speech';
import { meaning, named } from '../lang/gloss';
import type { TrainerDef } from '../data/trainers';

/** An element with a small picture in front of its text. */
const withIcon = (icon: Node, e: HTMLElement) => (e.prepend(icon), e);

export type BattleResult = 'win' | 'lose' | 'run' | 'caught';

/** How often a perfect answer (on a non-tap move) is a critical hit. */
const CRIT_CHANCE = 0.5;

// ---------- Damage ----------

function calcDamage(att: Mon, def: Mon, move: Move, power: number, mult: number) {
  const a = stats(att).atk;
  const d = stats(def).def;
  const base = Math.floor(Math.floor((Math.floor((2 * att.level) / 5 + 2) * power * a) / d) / 50) + 2;
  const stab = SPECIES[att.sp].types.includes(move.type) ? 1.5 : 1;
  const eff = effectiveness(move.type, SPECIES[def.sp].types);
  const rand = 0.85 + Math.random() * 0.15;
  let dmg = Math.floor(base * stab * eff * mult * rand);
  if (eff > 0) dmg = Math.max(1, dmg);
  return { dmg, eff };
}

async function effMessage(eff: number) {
  if (eff > 1) await info('¡Es muy eficaz!', { auto: 900 });
  else if (eff > 0 && eff < 1) await info('No es muy eficaz...', { auto: 900 });
}

// ---------- The battle ----------

interface Config {
  kind: 'wild' | 'trainer';
  team: Mon[];
  trainer?: TrainerDef;
  look?: string;
  outro?: [es: string, en: string, sv?: string];
  /** The share of the normal prize money (rematches pay half). */
  prize?: number;
  /** A wild guardian (the temple's Rugidón): it can't be caught and you can't run from it. */
  guardian?: boolean;
}

type Action = { type: 'fight'; move: Move } | { type: 'switch'; mon: Mon } | { type: 'ball'; id: string } | { type: 'item' } | { type: 'run' };

/** The messages for level-ups (and the moves they bring): after a battle, a lesson or a review. */
async function announceLevelUps(ups: LevelUp[], each?: () => void) {
  for (const up of ups) {
    sfx('levelup');
    each?.();
    await info(`¡${monName(up.mon)} subió al nivel ${up.to}!`);
    for (const mv of newMoves(up.mon, up.from, up.to)) {
      sfx('perfect');
      await info(`¡${monName(up.mon)} aprendió ${mv.name}! (${MODE_INFO[mv.mode].icon} ${MODE_INFO[mv.mode].es})`, {
        en: `${monName(up.mon)} learned ${mv.name}! It's a "${MODE_INFO[mv.mode].en}" move.`,
        sv: `${monName(up.mon)} lärde sig ${mv.name}! Det är en attack av typen "${meaning(MODE_INFO[mv.mode])}".`,
      });
    }
  }
}

export function wildBattle(sp: string, level: number, opts: { guardian?: boolean } = {}) {
  return runBattle({ kind: 'wild', team: [newMon(sp, level)], ...opts });
}

/**
 * look: how the trainer looks (key in LOOKS), for their portrait.
 * outro: what they say in battle when you win.
 */
export function trainerBattle(t: TrainerDef, opts: { look?: string; outro?: [es: string, en: string, sv?: string]; prize?: number } = {}) {
  return runBattle({ kind: 'trainer', team: t.team.map(([sp, l]) => newMon(sp, l)), trainer: t, ...opts });
}

async function runBattle(cfg: Config): Promise<BattleResult> {
  const prevScene = getScene();
  const trainer = cfg.trainer;
  let enemyIdx = 0;
  let enemy = cfg.team[0];
  let me = firstAble()!;
  const recent: string[] = [];
  /** Avoid asking the same few items again right away. */
  const remember = (item: Item) => {
    recent.push(item.id);
    if (recent.length > 3) recent.shift();
    return item;
  };
  const tally = { asked: 0, learned: 0 };

  const trainerFighter = () => fighter(portrait(cfg.look ?? 'man'), -SLOT, ENEMY_POS.y);
  stage.enemyF = trainer ? trainerFighter() : enemyFighter(enemy);
  stage.meF = fighter(portrait(playerLook(), 'back'), W, ME_POS.y);
  stage.ball = null;
  closeText();
  overlay.querySelectorAll('.banner').forEach((b) => b.remove()); // the place-name banner
  setScene(battleScene);
  setBattleMusic(battleMusicFor(trainer));
  let hud: Hud | null = null;

  const myName = () => monName(me);
  const enemyLabel = () => (trainer ? `${monName(enemy)} enemigo` : `El ${monName(enemy)} salvaje`);

  /** Record an answer (words are experience!). Level-ups wait until the end of the turn. */
  const learn = async (item: Item, r: ChallengeResult) => {
    const res = record(item, r.mode, r.grade, r.helped);
    tally.asked++;
    if (res.learnedNow) {
      tally.learned++;
      await info(`📗 ¡Dominaste «${item.es}»!`, { auto: 1100 });
    }
  };

  /**
   * Level-ups happen last in a turn, and only when your attack landed and your Palabrita is
   * still standing. Otherwise they wait for the next attack that lands.
   */
  let landed = false;
  const endTurn = async () => {
    const ok = landed && me.hp > 0;
    landed = false;
    if (!ok) return;
    await announceLevelUps(checkLevelUps(), () => hud?.update());
    for (const mon of evolutionsDue()) await evolveNow(mon);
  };

  /**
   * Evolution, like Gold/Silver: the battle steps aside and the whole screen is the evolving Palabrita. It flashes
   * between its old and new outline, faster and faster, then shows its new form; then back to the battle.
   */
  const evolveNow = async (mon: Mon) => {
    const from = monName(mon);
    const to = SPECIES[mon.sp].evolves!.to;
    const [oldImg, newImg] = [creatureArt(mon.sp).front, creatureArt(to).front];
    if (hud) hud.root.style.visibility = 'hidden';
    stage.evo = { img: oldImg };
    playOverlay('evolucion', false);
    await info(`¿Qué? ¡${from} está evolucionando!`, { en: `What? ${from} is evolving!`, sv: `Vad? ${from} utvecklas!` });
    const [oldOut, newOut] = [silhouette(oldImg), silhouette(newImg)];
    for (let i = 0; i < 20; i++) {
      stage.evo.img = i % 2 ? oldOut : newOut;
      if (i % 2) sfx('blip');
      await frames(Math.max(3, 18 - i));
    }
    // The new form: a flash, then in color.
    stage.flash = true;
    await frames(4);
    stage.flash = false;
    stage.evo.img = newImg;
    evolve(mon);
    clearOverlay();
    sfx('caught');
    await info(`¡Felicidades! ¡${from} evolucionó a ${monName(mon)}!`, { en: `Congratulations! ${from} evolved into ${monName(mon)}!`, sv: `Grattis! ${from} utvecklades till ${monName(mon)}!` });
    // Back to the battle, where it left off.
    stage.evo = null;
    if (mon === me && stage.meF) stage.meF.img = creatureArt(mon.sp).back;
    if (hud) {
      hud.root.style.visibility = '';
      hud.update();
    }
  };

  const sendOut = async (mon: Mon) => {
    me = mon;
    stage.meF = myFighter(mon);
    await info(`¡Adelante, ${monName(mon)}!`, { auto: 700 });
    await slide(stage.meF, ME_POS.x);
    hud?.update();
  };

  /** Each Palabrita's last move this battle: the cursor starts there (just press A to use it again). */
  const lastMove = new Map<Mon, string>();
  const chooseMove = async (): Promise<Move | null> => {
    const moves = knownMoves(me);
    // Like Gold/Silver's move menu: a box above it shows the selected move's type and power.
    const detail = el('div', 'box movedetail');
    overlay.appendChild(detail);
    const i = await menu(
      moves.map((m) => `${MODE_INFO[m.mode].icon} ${m.name}`),
      {
        icons: moves.map((m) => typeIcon(m.type)),
        cancel: true,
        wrap: true,
        initial: Math.max(0, moves.findIndex((m) => m.name === lastMove.get(me))),
        pos: { left: 0, right: 0, bottom: 0 },
        onMove: (k) => {
          const m = moves[k];
          const mi = MODE_INFO[m.mode];
          const eff = effectiveness(m.type, SPECIES[enemy.sp].types);
          const vs = eff > 1 ? '¡Muy eficaz!' : eff === 0 ? 'No le afecta' : eff < 1 ? 'Poco eficaz' : '';
          detail.innerHTML = '';
          detail.append(
            withIcon(typeIcon(m.type), el('div', '', `TIPO/${m.type.toUpperCase()}`)),
            el('div', '', `PODER ${mi.power}${vs ? ` · ${vs}` : ''}`),
            el('div', 'muted', `${mi.icon} ${mi.es}: ${meaning(mi)}`),
          );
        },
      },
    );
    detail.remove();
    if (i >= 0) lastMove.set(me, moves[i].name);
    return i < 0 ? null : moves[i];
  };

  const chooseAction = async (): Promise<Action> => {
    while (true) {
      closeText();
      const i = await menu(['LUCHAR', 'EQUIPO', 'MOCHILA', 'HUIR'], {
        columns: 2,
        title: `¿Qué hará ${myName()}?`,
        pos: { left: 0, right: 0, bottom: 0 },
        disabled: [false, G.save.party.length < 2, false, !!trainer || !!cfg.guardian],
      });
      if (i === 0) {
        const mv = await chooseMove();
        if (mv) return { type: 'fight', move: mv };
      } else if (i === 1) {
        const m = await pickMon('switch', me);
        if (m && m !== me) return { type: 'switch', mon: m };
      } else if (i === 2) {
        // The bag: a ball (wild battles only), a potion or a Revivir. Each one uses up your turn.
        const id = await chooseItem();
        const def = id ? ITEM_DEFS[id] : null;
        if (!id || !def) continue;
        if (def.ball) {
          if (!trainer && !cfg.guardian) return { type: 'ball', id };
          if (trainer) await info('¡No puedes atrapar la Palabrita de otro entrenador!', { en: 'You can’t catch another trainer’s Palabrita!' });
          else await info('¡No se deja atrapar! Es la guardiana del templo.', { en: 'It won’t be caught! It’s the temple’s guardian.' });
        } else if (def.heal || def.revive) {
          if (await useOnMon(id)) {
            hud?.update();
            return { type: 'item' };
          }
        } else await notNow();
      }
      else if (i === 3) return { type: 'run' };
    }
  };

  /** One hit: the attacker lunges and the target flashes. Returns the effectiveness (0 = no effect). */
  const strike = async (att: Mon, attF: Fighter, def: Mon, defF: Fighter, dir: number, move: Move, power: number, mult: number) => {
    await lunge(attF, dir);
    const { dmg, eff } = calcDamage(att, def, move, power, mult);
    if (eff === 0) {
      await info(`No afecta a ${monName(def)}...`);
      return 0;
    }
    sfx(eff > 1 ? 'super' : eff < 1 ? 'weak' : 'hit');
    def.hp = Math.max(0, def.hp - dmg);
    hud!.update();
    await hitAnim(defF);
    return eff;
  };

  /** The Spanish part of an attack: obedience check, then the move's challenge. */
  const prepareAttack = async (move: Move): Promise<ChallengeResult | null> => {
    const loy = lealtad(me);
    if (loy < OBEY_THRESHOLD && Math.random() < 0.35 + (OBEY_THRESHOLD - loy)) {
      await info(`¡${myName()} no te hace caso!`);
      await info('Está olvidando sus palabras... ¡Háblale!');
      const item = fadingItems(me)[0] ?? pickFromKind(me.sp, me.level);
      const r = await challenge({ item, mode: 'type', title: '¡Háblale!' });
      await learn(item, r);
      hud?.update();
      if (r.grade === 'wrong') {
        await info(`${myName()} sigue ignorándote...`);
        return null;
      }
      await info(`¡${myName()} te escuchó!`, { auto: 900 });
    }
    const item = remember(pickForMon(me, recent));
    const r = await challenge({ item, mode: move.mode, title: move.name });
    await learn(item, r);
    return r;
  };

  /**
   * Damage depends on how you answered: perfect (accents too) on a non-tap move is a
   * critical hit ×1.5 half the time (otherwise ×1), almost ×0.75, with 💡 help ×0.5, and a wrong answer misses.
   */
  const playerAttack = async (move: Move, prep: ChallengeResult | null) => {
    if (!prep) return;
    await info(`¡${myName()} usó ${move.name}!`, { auto: 700, icon: typeIcon(move.type) });
    if (prep.grade === 'wrong') {
      sfx('miss');
      await info('¡Pero no acertó!', { auto: 900, en: 'But it missed!' });
      return;
    }
    const crit = prep.grade === 'perfect' && !prep.helped && prep.mode !== 'choose' && Math.random() < CRIT_CHANCE;
    const mult = crit ? 1.5 : prep.helped ? 0.5 : prep.grade === 'close' ? 0.75 : 1;
    const eff = await strike(me, stage.meF!, enemy, stage.enemyF!, 1, move, MODE_INFO[prep.mode].power, mult);
    if (!eff) return;
    landed = true;
    if (crit) await info('¡Golpe crítico!', { auto: 900 });
    else if (prep.helped) await info('Con ayuda, el golpe es más débil.', { auto: 1100, en: 'With help, the hit is weaker.' });
    await effMessage(eff);
  };

  const enemyAttack = async () => {
    const moves = knownMoves(enemy);
    const move = moves[Math.floor(Math.random() * moves.length)];
    await info(`¡${enemyLabel()} usó ${move.name}!`, { auto: 700, icon: typeIcon(move.type) });
    // Wild Palabritas hit a bit softer; trainers let you defend with Spanish.
    let mult = trainer ? 1 : 0.7;
    let defended = false;
    if (trainer) {
      // Defense questions come from the opponent's own words at its level: stronger = harder.
      const item = remember(defenseItem(enemy, recent));
      const r = await challenge({
        item,
        mode: trainer.defenseMode,
        title: '🛡️ Defensa',
        label: trainer.defenseMode === 'choose' ? '¡Defiéndete! ¿Qué significa? · Defend: what does it mean?' : '¡Defiéndete! Escríbelo en español · Defend: write it in Spanish',
      });
      await learn(item, r);
      if (r.grade !== 'wrong') {
        mult *= r.grade === 'perfect' ? 0.4 : 0.6;
        defended = true;
      }
    }
    const eff = await strike(enemy, stage.enemyF!, me, stage.meF!, -1, move, MODE_INFO[move.mode].power, mult);
    if (!eff) return;
    if (defended) await info(`¡${myName()} resistió el golpe!`, { auto: 900 });
    await effMessage(eff);
  };

  /** Returns a result if the battle ended. */
  const afterEnemyHit = async (): Promise<BattleResult | null> => {
    if (enemy.hp > 0) return null;
    await frames(60); // a moment at 0 PS before it falls (the user: it fell too fast)
    sfx('faint');
    await sinkAnim(stage.enemyF!);
    await info(`¡${enemyLabel()} se debilitó!`);
    if (trainer && enemyIdx < cfg.team.length - 1) {
      await endTurn(); // level up before the next one comes out
      enemy = cfg.team[++enemyIdx];
      markSeen(enemy.sp);
      stage.enemyF = enemyFighter(enemy);
      hud!.show('enemy', false);
      stage.lineups = { enemy: cfg.team };
      await info(`¡${trainer.name} envía a ${monName(enemy)}!`, { auto: 900 });
      stage.lineups = {};
      await slide(stage.enemyF, ENEMY_POS.x);
      hud!.update();
      hud!.show('enemy', true);
      return null;
    }
    return 'win';
  };

  const afterMyHit = async (): Promise<BattleResult | null> => {
    if (me.hp > 0) return null;
    await frames(60); // the same moment at 0 PS for yours
    sfx('faint');
    await sinkAnim(stage.meF!);
    await info(`¡${myName()} se debilitó!`);
    if (!firstAble()) {
      await info('¡No te quedan Palabritas que puedan luchar!');
      return 'lose';
    }
    const next = (await pickMon('forced', me))!;
    await sendOut(next);
    return null;
  };

  const tryToCatch = async (id: string): Promise<'caught' | 'failed' | 'cancel'> => {
    if (!takeItem(id)) return 'cancel';
    const sp = SPECIES[enemy.sp];
    const ballDef = ITEM_DEFS[id];
    await info(`¡${G.save.name} lanzó una ${ballDef.name}! (Quedan ${itemCount(id)})`, { auto: 900 });
    await info(`Para atraparlo, ¡dile una de sus palabras!`, {
      auto: 1400,
      en: `To catch it, say one of its words!`,
    });
    const item = remember(pickFromKind(enemy.sp, enemy.level, recent));
    const r = await challenge({ item, mode: canListen() ? 'speak' : 'type', title: '🔮 ¡Atrápalo!' });
    await learn(item, r);

    await throwBall();
    const s = stats(enemy);
    const hpFactor = 1 - (2 / 3) * (enemy.hp / s.maxHp);
    const quality = r.grade === 'perfect' ? 1.8 : r.grade === 'close' ? 1.3 : 0.5;
    const p = Math.min(0.95, Math.max(0.05, sp.catchRate * hpFactor * quality * 1.4 * ballDef.ball!));
    const success = Math.random() < p;
    const shakes = success ? 3 : Math.floor(Math.random() * 3);
    await shakeBall(shakes);
    if (success) {
      sfx('caught');
      await info(`¡Atrapaste a ${sp.name}!`);
      if (keepMon(enemy) === 'box') {
        await info(`¡${sp.name} fue enviado a la Caja de Palabritas!`, {
          en: `Your team is full (6), so ${sp.name} was sent to the storage box. Use a Palacentro computer to get it.`,
          sv: `Ditt lag är fullt (6), så ${sp.name} skickades till förvaringslådan. Hämta den vid en dator på ett Palacentro.`,
        });
      } else {
        await info(`${sp.name} se unió a tu equipo. Aprenderá palabras de: ${THEMES[sp.theme].name}.`, {
          en: `${sp.name} joined your team. It learns words about: ${THEMES[sp.theme].en}.`,
          sv: `${sp.name} gick med i ditt lag. Den lär sig ord om: ${named(THEMES[sp.theme])}.`,
        });
      }
      return 'caught';
    }
    breakOut();
    await info(shakes === 0 ? '¡Oh, no! ¡Se escapó!' : '¡Casi lo atrapas!');
    return 'failed';
  };

  const summary = async () => {
    if (!tally.asked) return;
    await info(
      `Practicaste ${tally.asked} ${tally.asked === 1 ? 'palabra' : 'palabras'}.` +
        (tally.learned ? ` ¡${tally.learned} ${tally.learned === 1 ? 'nueva dominada' : 'nuevas dominadas'}!` : ''),
      { en: `You practiced ${tally.asked}. Newly mastered: ${tally.learned}.`, sv: `Du övade på ${tally.asked}. Nya som du kan: ${tally.learned}.` },
    );
  };

  try {
    await encounterFlash();
    markSeen(enemy.sp);
    // Like Gold/Silver: you and the opponent slide in from opposite sides.
    await Promise.all([slide(stage.enemyF, ENEMY_POS.x), slide(stage.meF, ME_POS.x)]);
    if (trainer) {
      stage.lineups = { enemy: cfg.team, me: G.save.party };
      await info(`¡${trainer.name} quiere luchar!`);
      stage.lineups = {};
      await slide(stage.enemyF, W);
      stage.enemyF = enemyFighter(enemy);
      await info(`¡${trainer.name} envía a ${monName(enemy)}!`, { auto: 900 });
      await slide(stage.enemyF, ENEMY_POS.x);
    } else {
      await info(`¡Un ${monName(enemy)} salvaje apareció!`);
    }
    hud = buildHud(() => enemy, () => me, !trainer);
    hud.update();
    hud.show('player', false);
    await slide(stage.meF, -SLOT);
    await sendOut(me);
    hud.show('player', true);

    while (true) {
      const action = await chooseAction();
      let myAct: (() => Promise<void>) | null = null;
      if (action.type === 'run') {
        sfx('door');
        await info('¡Escapaste sin problemas!');
        return 'run';
      }
      if (action.type === 'ball') {
        const res = await tryToCatch(action.id);
        if (res === 'caught') return await finish('caught');
        if (res === 'cancel') continue;
      }
      if (action.type === 'switch') {
        await info(`¡${myName()}, vuelve!`, { auto: 700 });
        await sendOut(action.mon);
      }
      if (action.type === 'fight') {
        const prep = await prepareAttack(action.move);
        const attacker = me;
        myAct = async () => {
          if (me === attacker && me.hp > 0) await playerAttack(action.move, prep);
        };
      }
      const meFirst = !!myAct && stats(me).spd >= stats(enemy).spd;
      if (myAct && meFirst) {
        const enemyBefore = enemy;
        await myAct();
        const r = await afterEnemyHit();
        if (r) {
          await endTurn();
          return await finish(r);
        }
        if (enemy !== enemyBefore) {
          await endTurn();
          continue; // a fresh enemy doesn't attack on the turn it comes out
        }
      }
      await enemyAttack();
      if (me.hp <= 0) landed = false; // knocked out before the turn ended: no level-up this time
      const lost = await afterMyHit();
      if (lost) return lost;
      if (myAct && !meFirst) {
        await myAct();
        const r2 = await afterEnemyHit();
        if (r2) {
          await endTurn();
          return await finish(r2);
        }
      }
      await endTurn();
    }
  } finally {
    hud?.root.remove();
    closeText();
    clearStage();
    setScene(prevScene);
    setBattleMusic(null); // the map's song again (after a wild win's or a catch's jingle)
  }

  async function finish(r: BattleResult) {
    // The battle's song becomes the win tune until you leave (a catch's jingle plays over it first).
    if (r === 'win' || r === 'caught') endBattleSong(trainer ? 'victoria' : 'ganaste');
    if (r === 'caught') playOverlay('atrapado');
    if (r === 'win' && trainer) {
      // The trainer comes back out to admit defeat.
      hud?.show('enemy', false);
      stage.enemyF = trainerFighter();
      await slide(stage.enemyF, ENEMY_POS.x);
      await info(`¡Venciste a ${trainer.name}!`);
      if (cfg.outro) await say(cfg.outro[0], { en: cfg.outro[1], sv: cfg.outro[2] });
      const prize = Math.round(prizeMoney(cfg.team) * (cfg.prize ?? 1));
      G.save.money += prize;
      sfx('levelup');
      await info(`¡Ganaste ${money(prize)}!`, { en: `You won ${money(prize)}!`, sv: `Du vann ${money(prize)}!` });
    }
    await summary();
    return r;
  }
}

import { fanfare } from '../audio/bgm';
import { overlay, el, gp } from '../engine/screen';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag, today } from '../game/state';
import { shuffled } from '../game/random';
import { rematchReady, rematchTeam } from '../game/rematch';
import { addItem, money } from '../game/bag';
import { giveMon, healParty, lucasStarter, formAt } from '../game/mon';
import { record } from '../game/learning';
import { SPECIES, type Mode } from '../data/species';
import { TRAINERS } from '../data/trainers';
import { say, info, setSpeaker, type SayOpts } from '../ui/textbox';
import { ask } from '../ui/menu';
import { challenge, chooseText, type ChallengeSpec } from '../ui/challenge';
import { spriteCanvas } from '../ui/party';
import { trainerBattle } from '../battle/battle';
import { speak, canListen } from '../lang/speech';
import { warp, npcById, fadeOut, currentMap, type ScriptFn } from './world';
import type { Dir } from '../engine/input';
import type { Line } from './maps';

/*
  The building blocks of every script (scripts.ts, region2-4.ts): talking, battles and how they end, gifts, and
  Spanish questions outside battles (they count toward mastery, like any answer).
*/

// ---------- Talking ----------

export async function lines(...ls: Line[]) {
  for (const [es, en] of ls) await say(es, { en });
}

/** Lines said by someone other than the person you talked to (Lucas arriving, Don Tizón in a cutscene...). */
export async function as(look: string, ...ls: Line[]) {
  const before = setSpeaker(look);
  try {
    await lines(...ls);
  } finally {
    setSpeaker(before);
  }
}

/**
 * Someone's line, or on a muted map (Villa Ocote before the mine) «…» and what they act out instead (the EN
 * line), like everyone else there.
 */
export function sayOrMime([es, en]: Line, mime: string, opts: SayOpts = {}) {
  return currentMap().muted?.() ? say('…', { ...opts, en: mime }) : say(es, { ...opts, en });
}

/** Someone with a few lines, the same each time. */
export const talk = (...ls: Line[]): ScriptFn => () => lines(...ls);

/** Speak when the device can listen, otherwise write. */
export const talkMode = (): Mode => (canListen() ? 'speak' : 'type');

/** A Palabrita shown in a box at the top of the screen; returns what hides it. */
export function showCreature(sp: string) {
  const box = el('div', 'box');
  Object.assign(box.style, { left: gp(48), top: gp(6), padding: gp(4) });
  const c = spriteCanvas(sp, 48);
  Object.assign(c.style, { width: gp(56), height: gp(56), imageRendering: 'pixelated', display: 'block' });
  box.appendChild(c);
  overlay.appendChild(box);
  return () => box.remove();
}

/** Time passes, or you travel: the screen fades out, a line says so, and you're somewhere else. */
export async function cutTo([es, en]: Line, map: string, x: number, y: number, dir: Dir) {
  await fadeOut(24);
  await info(es, { en });
  await warp(map, x, y, dir, false);
}

// ---------- Healing and losing ----------

export async function heal() {
  sfx('heal');
  healParty();
  await frames(70);
}

export async function blackout() {
  // Like Gold/Silver: losing costs half your money.
  const lost = Math.floor(G.save.money / 2);
  G.save.money -= lost;
  await info('{name} corre de vuelta a un lugar seguro...', { en: '{name} hurries back to a safe place...' });
  if (lost) await info(`¡Con las prisas, se te cayeron ${money(lost)}!`, { en: `In the rush, you dropped ${money(lost)}!` });
  healParty();
  const h = G.save.heal;
  await warp(h.map, h.x, h.y, 'down');
  await info('Tus Palabritas se recuperaron.', { en: 'Your Palabritas recovered.' });
}

// ---------- Trainers ----------

interface TrainerLines {
  intro: Line;
  defeated: Line;
  after: Line;
}

export async function trainerFight(id: string, l: TrainerLines) {
  if (flag(`beat:${id}`)) return afterBeaten(id, l);
  await lines(l.intro);
  if (!flag('defenseTip')) {
    setFlag('defenseTip');
    await info('Contra entrenadores, ¡puedes defenderte! Si respondes bien cuando te atacan, recibes menos daño.', {
      en: 'Against trainers you can defend! Answer well when they attack and you take less damage.',
    });
  }
  const res = await trainerBattle(TRAINERS[id], { look: npcById(id)?.def.look, outro: l.defeated });
  if (res === 'lose') return blackout();
  setFlag(`beat:${id}`);
  if (TRAINERS[id].rematch) G.save.rematch[id] = today();
}

/** A beaten trainer: the rematch trainers ask for one (once a day); everyone else just talks. */
async function afterBeaten(id: string, l: TrainerLines) {
  const t = TRAINERS[id];
  if (!rematchReady(id)) {
    await lines(l.after);
    if (t.rematch) await lines(['¡Mañana quiero la revancha!', 'Tomorrow I want a rematch!']);
    return;
  }
  if (!(await ask('¡Hola otra vez! ¿Quieres la revancha?', { en: 'Hi again! Do you want a rematch?' }))) return lines(['¡Otro día será!', 'Another day, then!']);
  const res = await trainerBattle(rematchTeam(t), { look: npcById(id)?.def.look, outro: l.defeated, prize: 0.5 });
  if (res === 'lose') return blackout();
  G.save.rematch[id] = today();
}

/** A trainer's script: what they say before, when beaten, and afterwards. */
export const fight = (id: string, intro: Line, defeated: Line, after: Line): ScriptFn => () => trainerFight(id, { intro, defeated, after });

/**
 * A battle with Lucas (TRAINERS[id]: his starter leads, evolved as far as its level allows). Won or lost, it
 * happens once (the user: no second chance); if he wins, he gloats. Resolves true if you won.
 */
export async function rivalBattle(id: string, outro: Line, gloat: Line): Promise<boolean> {
  const [[, level], ...rest] = TRAINERS[id].team;
  const team: [string, number][] = [[formAt(lucasStarter(), level), level], ...rest];
  const res = await trainerBattle({ ...TRAINERS[id], team }, { look: 'lucas', outro });
  setFlag(id);
  if (res !== 'lose') return true;
  await as('lucas', gloat);
  return false;
}

export interface GymLeader {
  /** The medal's name in Spanish and English (Brisa, Breeze): flags medal<Brisa> and beat:<id>. */
  medal: [string, string];
  intro: Line[];
  /** The question before the battle, and the answer to «no». */
  ready: Line;
  notReady: Line;
  /** Said once you're ready. */
  go?: Line;
  /** When their last Palabrita faints. */
  outro: Line;
  /** Before and after they hand over the medal. */
  handOver?: Line[];
  after: Line[];
  /** Talking to them once they've lost. */
  beaten: Line[];
}

/** A gym leader: their talk, the battle and the medal. Resolves true when you've just won it. */
export async function gymLeader(id: string, g: GymLeader): Promise<boolean> {
  const [medal, medalEn] = g.medal;
  if (flag(`medal${medal}`)) {
    await lines(...g.beaten);
    return false;
  }
  await lines(...g.intro);
  if (!(await ask(g.ready[0], { en: g.ready[1] }))) {
    await lines(g.notReady);
    return false;
  }
  if (g.go) await lines(g.go);
  const res = await trainerBattle(TRAINERS[id], { look: id, outro: g.outro });
  if (res === 'lose') {
    await blackout();
    return false;
  }
  setFlag(`beat:${id}`);
  setFlag(`medal${medal}`);
  G.save.medals.push(medal);
  if (g.handOver) await lines(...g.handOver);
  fanfare('medalla', 'badge');
  await info(`¡{name} recibió la Medalla ${medal}!`, { en: `{name} received the ${medalEn} Medal!` });
  await lines(...g.after);
  return true;
}

// ---------- Gifts ----------

/** Something for your bag: es and en name it with its amount («dos Pociones», "two Potions"). */
export async function gift(id: string, n: number, es: string, en: string) {
  addItem(id, n);
  sfx('caught');
  await info(`¡{name} recibió ${es}!`, { en: `{name} received ${en}!` });
}

export async function pay(n: number) {
  G.save.money += n;
  sfx('caught');
  await info(`¡{name} recibió ${money(n)}!`, { en: `{name} received ${money(n)}!` });
}

/** A Palabrita joins you (to the box when your team is full). */
export async function receiveMon(sp: string, level: number) {
  const where = giveMon(sp, level);
  const { name } = SPECIES[sp];
  sfx('caught');
  await info(`¡{name} recibió a ${name}!`, { en: `{name} received ${name}!` });
  if (where === 'box') await info(`Tu equipo está lleno: ${name} fue a la Caja de Palabritas.`, { en: `Your team is full: ${name} went to the storage box.` });
}

// ---------- Spanish outside battles ----------

/** A challenge that counts toward mastery, like any answer in battle. */
export async function practice(spec: ChallengeSpec) {
  const r = await challenge(spec);
  record(spec.item, r.mode, r.grade, r.helped);
  return r;
}

/** Asked until it's answered (not wrong), with `retry` after each miss. */
export async function practiceUntilRight(spec: ChallengeSpec, retry: () => Promise<unknown>) {
  while ((await practice(spec)).grade === 'wrong') await retry();
}

/**
 * A multiple-choice question: true when `right` is picked. With `listen`, it's read aloud first (and can be
 * heard again).
 */
export async function question(label: string, en: string, right: string, wrong: string[], listen?: string) {
  const options = shuffled([right, ...wrong]);
  if (listen) speak(listen);
  return options[await chooseText(label, en, options, listen)] === right;
}

/** The same, asked until `right` is picked; `retry` (or retry(misses so far)) after each wrong answer. */
export async function untilRight(label: string, en: string, right: string, wrong: string[], retry: Line | ((misses: number) => Line), listen?: string) {
  for (let misses = 0; !(await question(label, en, right, wrong, listen)); misses++) {
    sfx('wrong');
    await lines(typeof retry === 'function' ? retry(misses) : retry);
  }
  sfx('right');
}

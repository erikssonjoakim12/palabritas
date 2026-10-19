import { G, saveGame, today } from '../game/state';
import { money } from '../game/bag';
import { monName, checkLevelUps } from '../game/mon';
import { record, pickFromTheme, isLearned, isUnseen, levelProgress } from '../game/learning';
import { dueItems } from '../game/review';
import { THEMES, type Item } from '../data/content';
import type { Mode } from '../data/species';
import { say } from '../ui/textbox';
import { ask, menu } from '../ui/menu';
import { challenge, type ChallengeResult } from '../ui/challenge';
import { pickMon } from '../ui/party';
import { announceLevelUps } from '../battle/battle';
import { currentMap, type ScriptFn } from './world';
import { lines, showCreature } from './scripts';

/*
  Studying outside battles: the reusable drill (the starter's first words, the school), and the school teacher.
  Every town with a gym has a school, so these come back in every region:
    REPASO: the words due for review (spaced repetition), most overdue first. Free; keeps loyalty up.
    CLASE PARTICULAR: one Palabrita's current level (new words, then its review). $200, once a day per school.
    TEMA DEL DÍA: 8 questions on the town's grammar topic (two topics, one each day).
*/

export interface DrillOpts {
  /** The challenge title, from how many are done and how many there are. */
  title: (done: number, total: number) => string;
  /** Ask this one again later (after a miss)? */
  again?: (item: Item, r: ChallengeResult) => boolean;
  /** A Palabrita shown during the drill. */
  sp?: string;
  mode?: (item: Item, i: number) => Mode;
}

/** New words are tapped (choose the meaning); the rest are written. */
const defaultMode = (item: Item): Mode => (isUnseen(item) ? 'choose' : 'type');

/**
 * A run of questions: each item is asked and recorded (it counts toward mastery), and asked again later while
 * `again` says so; «¿Seguimos?» every 6. Resolves false if you stopped early.
 */
export async function drill(items: Item[], opts: DrillOpts): Promise<boolean> {
  const queue = [...items];
  const hide = opts.sp ? showCreature(opts.sp) : () => {};
  let asked = 0;
  try {
    while (queue.length) {
      const item = queue.shift()!;
      const done = Math.max(0, items.length - queue.length - 1);
      const r = await challenge({ item, mode: (opts.mode ?? defaultMode)(item, asked), title: opts.title(done, items.length) });
      record(item, r.mode, r.grade, r.helped);
      saveGame();
      if (opts.again?.(item, r)) queue.push(item);
      if (++asked % 6 === 0 && queue.length && !(await ask('¡Vas muy bien! ¿Seguimos?', { en: 'You’re doing great! Shall we continue?' }))) return false;
    }
  } finally {
    hide();
  }
  return true;
}

/** Ask a missed item once more (lessons): no endless loops on a hard one. */
function onceMore() {
  const retried = new Set<string>();
  return (item: Item, r: ChallengeResult) => r.grade === 'wrong' && !retried.has(item.id) && !!retried.add(item.id);
}

export const LESSON_PRICE = 200;
const REVIEW_SIZE = 10;

/** The topic of the day: a town's two grammar topics take turns, by the day of the month. */
const topicOfDay = (topics: [string, string]) => topics[Number(today().slice(-2)) % 2];

async function repaso(topics: [string, string]) {
  const due = dueItems();
  if (!due.length) {
    await lines(['¡Estás al día! No tienes palabras para repasar.', 'You’re all caught up! You have no words to review.']);
    if (await ask('¿Quieres estudiar el tema del día?', { en: 'Do you want to study today’s topic?' })) await tema(topics);
    return;
  }
  const n = Math.min(REVIEW_SIZE, due.length);
  await lines([`Tienes ${due.length} ${due.length === 1 ? 'palabra' : 'palabras'} para repasar. ¡Empecemos con ${n}!`, `You have ${due.length} to review. Let’s start with ${n}!`]);
  await drill(due.slice(0, n), { title: (d, t) => `Repaso ${d + 1}/${t}`, again: onceMore(), mode: (_, i) => (i % 3 === 2 ? 'listen' : 'type') });
  await announceLevelUps(checkLevelUps());
  await lines(['¡Muy bien! Repasar a tiempo hace que tus Palabritas te obedezcan.', 'Very good! Reviewing on time keeps your Palabritas loyal.']);
}

async function privateClass() {
  const school = currentMap().id;
  if (G.save.lessons[school] === today()) return lines(['Hoy ya tuvimos clase. ¡Vuelve mañana!', 'We already had class today. Come back tomorrow!']);
  if (G.save.money < LESSON_PRICE) return lines([`La clase cuesta ${money(LESSON_PRICE)}. ¡Vuelve cuando tengas dinero!`, `The class costs ${money(LESSON_PRICE)}. Come back when you have the money!`]);
  if (!(await ask(`Una clase particular cuesta ${money(LESSON_PRICE)}. ¿Está bien?`, { en: `A private class costs ${money(LESSON_PRICE)}. Is that OK?` }))) return;
  await lines(['¿Con qué Palabrita estudiamos?', 'Which Palabrita shall we study with?']);
  const mon = await pickMon('view');
  if (!mon) return;
  const lp = levelProgress(mon);
  const items = [...lp.items.filter((i) => !isLearned(i)), ...lp.review.todo].slice(0, REVIEW_SIZE);
  if (!items.length) return lines([`¡${monName(mon)} ya sabe todo lo de su nivel! Luchen un poco y vuelvan.`, `${monName(mon)} already knows everything for its level! Battle a bit and come back.`]);
  G.save.money -= LESSON_PRICE;
  G.save.lessons[school] = today();
  await drill(items, { sp: mon.sp, title: (d, t) => `${monName(mon)} ${d + 1}/${t}`, again: onceMore() });
  await announceLevelUps(checkLevelUps());
  await lines(['¡Buen trabajo! Estudiar con tu Palabrita los une más.', 'Good work! Studying with your Palabrita brings you closer.']);
}

async function tema(topics: [string, string]) {
  const id = topicOfDay(topics);
  const theme = THEMES[id];
  await lines([`El tema de hoy: «${theme.name}».`, `Today’s topic: ${theme.en}.`]);
  const recent: string[] = [];
  const items = Array.from({ length: 8 }, () => {
    const item = pickFromTheme(id, 3, recent);
    recent.push(item.id);
    return item;
  });
  await drill(items, { title: (d, t) => `${theme.name} ${d + 1}/${t}`, mode: (_, i) => (i % 2 ? 'type' : 'choose') });
  await lines(['¡Excelente clase! Mañana hay otro tema.', 'Excellent class! Tomorrow there’s another topic.']);
}

/** A school's teacher, with the town's two grammar topics. */
export const teacher = (topics: [string, string]): ScriptFn => async () => {
  await say('¡Bienvenid{o/a} a la escuela! ¿Qué quieres estudiar hoy?', {
    en: 'Welcome to school! What do you want to study today? REPASO = review the words that are due. CLASE PARTICULAR = a private class for one Palabrita ($200, once a day). TEMA DEL DÍA = today’s grammar topic.',
    noWait: true,
  });
  const i = await menu(['REPASO', 'CLASE PARTICULAR', 'TEMA DEL DÍA', 'Nada'], { cancel: true });
  if (i === 0) return repaso(topics);
  if (i === 1) return privateClass();
  if (i === 2) return tema(topics);
  await lines(['¡Hasta luego! Estudiar un poco cada día es lo mejor.', 'See you! Studying a little every day is the best.']);
};

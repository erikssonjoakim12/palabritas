import { saveGame, today } from '../game/state';
import { monName } from '../game/mon';
import { record, pickFromTheme, isUnseen, dueForMon } from '../game/learning';
import { dueItems } from '../game/review';
import { THEMES, type Item } from '../data/content';
import type { Mode } from '../data/species';
import { say } from '../ui/textbox';
import { ask, menu } from '../ui/menu';
import { challenge, type ChallengeResult } from '../ui/challenge';
import { pickMon } from '../ui/party';
import type { ScriptFn } from './world';
import { lines, showCreature } from './flows';
import { named } from '../lang/gloss';

/*
  Studying outside battles: the reusable drill (the starter's first words, the school, the Palacentro's parrot),
  and the school teacher. Every town with a gym has a school, so these come back in every region:
    REPASO: the words due for review (spaced repetition), most overdue first. Free; keeps loyalty up.
    CLASE PARTICULAR: one Palabrita's own words due for review, its fading ones first: its loyalty. Free.
    TEMA DEL DÍA: 8 questions on the town's grammar topic (two topics, one each day).
  Never new words, and nobody levels up here: Palabritas only grow by fighting (the user). The answers still count,
  so a level that a review completes comes in the next battle.
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
 * `again` says so. The ✕ (or Esc) asks whether to stop; staying asks the same one again. Resolves false if you
 * stopped early.
 */
export async function drill(items: Item[], opts: DrillOpts): Promise<boolean> {
  const queue = [...items];
  const hide = opts.sp ? showCreature(opts.sp) : () => {};
  let asked = 0;
  try {
    while (queue.length) {
      const item = queue.shift()!;
      const done = Math.max(0, items.length - queue.length - 1);
      const r = await challenge({ item, mode: (opts.mode ?? defaultMode)(item, asked), title: opts.title(done, items.length), quittable: true });
      if (r.quit) {
        if (await ask('¿Quieres terminar?', { en: 'Do you want to stop?' })) return false;
        queue.unshift(item);
        continue;
      }
      record(item, r.mode, r.grade, r.helped);
      saveGame();
      if (opts.again?.(item, r)) queue.push(item);
      asked++;
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

const REVIEW_SIZE = 10;

/** Writing and listening by turns: reviews are for words you know, so no tapping. */
export const reviewMode = (_: Item, i: number): Mode => (i % 3 === 2 ? 'listen' : 'type');

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
  await lines([`Tienes ${due.length} ${due.length === 1 ? 'palabra' : 'palabras'} para repasar. ¡Empecemos con ${n}!`, `You have ${due.length} to review. Let’s start with ${n}!`, `Du har ${due.length} att repetera. Vi börjar med ${n}!`]);
  await drill(due.slice(0, n), { title: (d, t) => `Repaso ${d + 1}/${t}`, again: onceMore(), mode: reviewMode });
  await lines(['¡Muy bien! Repasar a tiempo hace que tus Palabritas te obedezcan.', 'Very good! Reviewing on time keeps your Palabritas loyal.']);
}

/** One Palabrita's words to review, its fading ones first: just what it needs to obey you again. */
async function privateClass() {
  await lines(['¿Con qué Palabrita estudiamos?', 'Which Palabrita shall we study with?']);
  const mon = await pickMon('view');
  if (!mon) return;
  const items = dueForMon(mon).slice(0, REVIEW_SIZE);
  if (!items.length) {
    return lines([`¡${monName(mon)} se acuerda de todas sus palabras! No tiene nada que repasar.`, `${monName(mon)} remembers all its words! It has nothing to review.`, `${monName(mon)} minns alla sina ord! Den har inget att repetera.`]);
  }
  await drill(items, { sp: mon.sp, title: (d, t) => `${monName(mon)} ${d + 1}/${t}`, again: onceMore(), mode: reviewMode });
  await lines(['¡Buen trabajo! Estudiar con tu Palabrita los une más.', 'Good work! Studying with your Palabrita brings you closer.']);
}

async function tema(topics: [string, string]) {
  const id = topicOfDay(topics);
  const theme = THEMES[id];
  await lines([`El tema de hoy: «${theme.name}».`, `Today’s topic: ${theme.en}.`, `Dagens ämne: ${named(theme)}.`]);
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
    en: 'Welcome to school! What do you want to study today? REPASO = review the words that are due. CLASE PARTICULAR = review one Palabrita’s own words, so it obeys you. TEMA DEL DÍA = today’s grammar topic.',
    noWait: true,
  });
  const i = await menu(['REPASO', 'CLASE PARTICULAR', 'TEMA DEL DÍA', 'Nada'], { cancel: true });
  if (i === 0) return repaso(topics);
  if (i === 1) return privateClass();
  if (i === 2) return tema(topics);
  await lines(['¡Hasta luego! Estudiar un poco cada día es lo mejor.', 'See you! Studying a little every day is the best.']);
};

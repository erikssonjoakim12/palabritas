// The school (Villa Ocote's): REPASO asks the words due for review and pushes their next review out; with
// nothing due it says you're caught up. A private class asks one Palabrita's own words due for review (free, never
// new words). The topic of the day asks 8. And the parrot in every Palacentro repeats your due words with you.
import { start } from './lib.mjs';

const t = await start('lesson');
const party = [['gotita', 8]];
const school = { map: 'escuela_ocote', x: 4, y: 2, dir: 'up', party, flags: { silenciadorRoto: true, 'palabra:pregunta': true, 'devuelta:pregunta': true } };
/** Talk to the teacher and pick a lesson; answer everything right; say «answer» to yes/no questions. */
const lesson = async (pick, yesNo = 'Sí') => {
  await t.press('z');
  return t.play({ choose: (opts) => (opts.includes('REPASO') ? pick : opts.includes('Sí') ? yesNo : undefined) });
};

// Three learned words, all overdue.
await t.fromSave(school);
const due = await t.game(() => {
  const g = window.__game;
  const ids = Object.keys(g.content.ITEMS).filter((id) => id.startsWith('colores:')).slice(0, 3);
  for (const id of ids) g.G.save.prog[id] = { seen: 3, right: 3, wrong: 0, learned: true, box: 2, due: 1, last: 1, good: 2, goodDays: [], lastGood: 1 };
  return ids;
});
let r = await lesson('REPASO');
let s = await t.save();
t.check('REPASO asks the words that are due', r.answered === 3, r.answered);
t.check('and pushes their next review out', due.every((id) => s.prog[id].due > Date.now()), due.map((id) => s.prog[id].due));

r = await lesson('REPASO', 'No');
t.check('with nothing due, you’re caught up', r.said.some((x) => x.includes('al día')), r.said);

// A private class: Gotita's own overdue words, and only those (no new ones, free).
await t.fromSave({ ...school, money: 500 });
const own = await t.game(() => {
  const g = window.__game;
  const ids = g.curriculum.itemsUpTo('gotita', 8).slice(0, 3).map((i) => i.id);
  for (const id of ids) g.G.save.prog[id] = { seen: 3, right: 3, wrong: 0, learned: true, box: 2, due: 1, last: 1, good: 2, goodDays: [], lastGood: 1 };
  return ids;
});
r = await lesson('CLASE PARTICULAR');
s = await t.save();
t.check('a private class asks the Palabrita’s own words due for review, for free', r.answered === 3 && s.money === 500 && own.every((id) => s.prog[id].due > Date.now()), [r.answered, s.money]);
r = await lesson('CLASE PARTICULAR');
t.check('with nothing left to review, there’s no class (no new words)', r.answered === 0 && r.said.some((x) => x.includes('se acuerda')), r.said);

// The topic of the day.
r = await lesson('TEMA DEL DÍA');
t.check('the topic of the day asks 8 questions', r.answered === 8, r.answered);

// The parrot in Ciudad Brisa's Palacentro: up to ten of your due words (here all six).
await t.fromSave({ map: 'centro_brisa', x: 1, y: 2, dir: 'up', party });
await t.game(() => {
  const g = window.__game;
  for (const id of Object.keys(g.content.ITEMS).filter((id) => id.startsWith('colores:')).slice(0, 6)) g.G.save.prog[id] = { seen: 3, right: 3, wrong: 0, learned: true, box: 2, due: 1, last: 1, good: 2, goodDays: [], lastGood: 1 };
});
r = await t.talk('centro_brisa', 1, 2, 'up');
t.check('the parrot repeats your due words with you (up to ten)', r.answered === 6 && r.said.some((x) => x.includes('Repite conmigo')), [r.answered, r.said.slice(0, 1)]);

// ✕ stops a drill: «¿Quieres terminar?» → Sí, and nothing more is asked.
await t.game(() => { for (const p of Object.values(window.__game.G.save.prog)) p.due = 1; });
await t.press('z');
await t.play({ until: (u) => !!u.challenge });
await t.quitChallenge();
r = await t.play({ choose: (opts) => (opts.includes('Sí') ? 'Sí' : undefined) });
t.check('✕ asks whether to stop, and stops', r.answered === 0 && r.said.some((x) => x.includes('Quieres')), [r.answered, r.said]);
await t.end();

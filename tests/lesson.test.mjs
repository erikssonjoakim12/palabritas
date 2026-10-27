// The school (Villa Ocote's): REPASO asks the words due for review and pushes their next review out; with
// nothing due it says you're caught up. A private class costs C$200, asks up to 10 of a Palabrita's current
// words and only once a day. The topic of the day asks 8.
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

// A private class.
await t.fromSave({ ...school, money: 500 });
r = await lesson('CLASE PARTICULAR');
s = await t.save();
t.check('a private class costs C$200', s.money === 300, s.money);
t.check('and asks up to 10 of the Palabrita’s words', r.answered > 0 && r.answered <= 20, r.answered);
r = await lesson('CLASE PARTICULAR');
t.check('only one a day', (await t.save()).money === 300 && r.said.some((x) => x.includes('mañana')), r.said);

// The topic of the day.
r = await lesson('TEMA DEL DÍA');
t.check('the topic of the day asks 8 questions', r.answered === 8, r.answered);
await t.end();

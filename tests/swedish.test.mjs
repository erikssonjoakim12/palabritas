// Learning through Swedish (src/lang/gloss.ts): chosen when a new game starts and kept in the save, the SV button,
// challenges in Swedish, back to English in AJUSTES, old saves in English. And the Swedish itself: none left behind
// by a change to the Spanish, none that loses a difference the English keeps (tools/sv.mjs).
import { start } from './lib.mjs';
import { report } from '../tools/sv.mjs';

const t = await start('swedish');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { orphans, collisions, clashes } = report();
t.check('every Swedish line still has its Spanish in the game', orphans.length === 0, orphans.slice(0, 5).join(' · '));
t.check('no Spanish line means two things (it can have only one Swedish)', clashes.length === 0, clashes.slice(0, 5).join(' · '));
t.check('no Swedish loses a difference the English keeps', collisions.length === 0, collisions.slice(0, 5).map(([s, ls]) => `${s}: ${ls.map((l) => l.es).join(' / ')}`).join(' · '));

// A new game: Svenska, chosen before anyone speaks.
await t.fresh();
await t.play({
  choose: (opts) => (opts.includes('Svenska') ? 'Svenska' : undefined),
  answers: ['Me llamo Ana'],
  until: (s) => s.text.startsWith('¡Tu aventura empieza'),
});
await t.press('z');
await t.waitIdle();
t.check('Svenska is kept in the save', (await t.save()).settings.gloss === 'sv');

/** Say a line and read its text box: the translation button and what it shows. */
const textBox = () =>
  t.game(async () => {
    window.__game.say('¡Algo picó!', { en: 'Something bit!' });
    await new Promise((r) => setTimeout(r, 500)); // typed out
    return { button: document.querySelector('.tb-tools .tool:last-child')?.textContent, shows: document.querySelector('.tb-en')?.textContent };
  });
let box = await textBox();
t.check('the text box has SV, with the Swedish', box.button === 'SV' && box.shows === 'Något nappade!', box);
await t.press('z');

// A challenge: its label and the meaning to choose, in Swedish.
const ch = await t.game(async () => {
  const g = window.__game;
  g.challenge({ item: g.content.adHocItem(['¡Algo picó!'], 'Something bit!'), mode: 'choose', quittable: true });
  await new Promise((r) => setTimeout(r, 300));
  return {
    label: document.querySelector('#challenge .label')?.textContent,
    options: [...document.querySelectorAll('#challenge .choices .btn')].map((b) => b.textContent),
  };
});
t.check('a challenge asks in Swedish', ch.label === '¿Qué significa? · Vad betyder det?', ch.label);
t.check('…and the right meaning is in Swedish', ch.options.includes('Något nappade!'), ch.options);
await t.quitChallenge();
await t.waitIdle();

// Back to English in START → AJUSTES → Traducción.
await t.press('Enter');
await sleep(300);
await t.pick('AJUSTES');
await sleep(300);
await t.pick('Traducción: Svenska');
await sleep(300);
await t.pick('Volver');
await sleep(300);
await t.press('x');
await sleep(300);
t.check('AJUSTES switches back to English', (await t.save()).settings.gloss === 'en');
box = await textBox();
t.check('…and the button is EN again', box.button === 'EN' && box.shows === 'Something bit!', box);
await t.press('z');

// A save from before Swedish existed opens in English.
await t.fromSave({ map: 'casa', x: 5, y: 2, settings: { textScale: 6, dialogVoice: false, slowVoice: false, musicLevel: 60 } });
t.check('an old save is in English', (await t.game(() => window.__game.G.save.settings.gloss)) === 'en');
await t.end();

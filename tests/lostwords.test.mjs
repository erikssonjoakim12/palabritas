// Villa Ocote's lost words: pick one up, its owner stumbles over the word until you complete
// their sentence (a wrong answer changes nothing), the eighth one starts the party. Plus the Capataz's note.
import { start } from './lib.mjs';

const t = await start('lostwords');
const party = [['nubarron', 30]];
const town = { silenciadorRoto: true, petraVolvio: true, capatazHuyo: true };
const words = ['olla', 'tortilla', 'bueyes', 'historia', 'marimba', 'medicina', 'pelota', 'pregunta'];
const save = () => t.save();

// Pick up «la olla» in the mine.
await t.fromSave({ map: 'mina1', x: 30, y: 14, dir: 'up', party, flags: town });
await t.press('z');
let r = await t.play();
let s = await save();
t.check('a lost word can be picked up', s.flags['palabra:olla'] && s.bag.palabras === 1, r.said);

// The potter without her word, then with it (wrong, then right).
await t.fromSave({ map: 'ocote', x: 24, y: 12, dir: 'up', party, flags: town });
await t.press('z');
r = await t.play();
t.check('without the word, she stumbles over it', r.said[0].includes('…') && r.said.some((x) => x.includes('no me sale')), r.said);

const withWord = { map: 'ocote', x: 24, y: 12, dir: 'up', party, flags: { ...town, 'palabra:olla': true }, bag: { palabras: 1 } };
await t.fromSave(withWord);
await t.press('z');
await t.play({ right: false });
s = await save();
t.check('a wrong word changes nothing', !s.flags['devuelta:olla'] && s.bag.palabras === 1);
await t.press('z');
r = await t.play({ answers: ['la olla'] });
s = await save();
t.check('completing her sentence gives the word back', s.flags['devuelta:olla'] && !s.bag.palabras, r.said);
t.check('and she gives a reward', s.bag.superpocion === 1, s.bag);

// The last of the eight starts the party.
const seven = Object.fromEntries(words.filter((w) => w !== 'pregunta').flatMap((w) => [[`palabra:${w}`, true], [`devuelta:${w}`, true]]));
await t.fromSave({ map: 'escuela_ocote', x: 4, y: 2, dir: 'up', party, flags: { ...town, ...seven, 'palabra:pregunta': true }, bag: { palabras: 1 } });
await t.press('z');
r = await t.play({ answers: ['la pregunta'] });
s = await save();
t.check('the eighth word starts the party', s.flags.palabrasDone && r.said.some((x) => x.includes('fiesta')), r.said.slice(-6));
t.check('Petra’s party gifts', s.bag.superbola === 5 && s.bag.revivir === 2, s.bag);

// The Capataz's note.
await t.fromSave({ map: 'mina2', x: 22, y: 16, dir: 'up', party, flags: town });
await t.press('z');
await t.play({ choices: ['Callada'] });
t.check('the Capataz’s note points to Playa Carey', (await save()).flags.notaLeida);
await t.end();

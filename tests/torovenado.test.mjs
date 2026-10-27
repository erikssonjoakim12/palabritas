// Ciudad Chispa's Torovenado costume (the mask seller, the five pieces by name, then the parade gives Venadito)
// and the legend of the Carreta Nagua on Ruta 8 (its questions give the bell).
import { start } from './lib.mjs';

const t = await start('torovenado');
// Mordiscón's first move is Water: it hits everything here, the ghost lamp too.
const party = [['mordiscon', 45], ['nacatamastin', 40]];
const save = () => t.save();
const yes = (opts) => (opts.includes('Sí') ? 'Sí' : undefined);
const talk = async (map, x, y, dir, opts = { choose: yes }) => {
  await t.warp(map, x, y, dir);
  await t.press('z');
  return t.play(opts);
};

// The Torovenado: the mask seller, the five pieces by name, then the parade.
await t.fromSave({ map: 'chispa', x: 21, y: 21, dir: 'left', party, flags: { cohetesRobados: true, cohetesRecuperados: true } });
await talk('chispa', 21, 21, 'left');
for (const [map, x, y, dir] of [['chispa', 16, 17, 'up'], ['chispa', 12, 12, 'up'], ['chispa', 25, 21, 'left'], ['iglesia', 5, 3, 'up'], ['escuela_chispa', 3, 4, 'left']]) await talk(map, x, y, dir);
t.check('naming the five pieces collects the costume', (await save()).bag.traje === 5, (await save()).bag);
await talk('chispa', 21, 21, 'left');
await talk('chispa', 31, 13, 'left');
const s = await save();
t.check('dancing in the parade gives Venadito', s.flags.venaditoRecibido && s.party.some((m) => m.sp === 'venadito'), s.party.map((m) => m.sp));

// The legend of the Carreta Nagua.
await t.fromSave({ map: 'ruta9', x: 5, y: 8, dir: 'left', party });
await talk('ruta9', 5, 8, 'left', { choose: yes, choices: ['Un ruido', 'Dos bueyes', 'Salir'] });
t.check('answering the legend’s questions gives the bell', (await save()).bag.campanita === 1, (await save()).bag);
await t.end();

// Moving a save between devices: export it as a file, import a file through AJUSTES (it asks first, then the game
// restarts with it), and a file that isn't a Palabritas save is turned away.
import { start, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const t = await start('backup');
await t.fromSave({ map: 'limon', x: 11, y: 8, dir: 'down', name: 'Ana', money: 300, party: [['gotita', 10]], flags: { medalBrisa: true } });
const text = await t.game(() => window.__game.backup.exportText());
t.check('the export holds the save', JSON.parse(text).save.name === 'Ana');
t.check('another file is turned away', (await t.game(() => [window.__game.backup.readSave('{"name":"x"}'), window.__game.backup.readSave('hola')])).every((s) => s === null));

// A save from "another device": the same game, under another name.
mkdirSync(resolve('tests/out/backup'), { recursive: true });
const file = resolve('tests/out/backup/beto.json');
const other = JSON.parse(text);
other.save.name = 'Beto';
writeFileSync(file, JSON.stringify(other));

await t.press('Enter');
await sleep(300);
await t.pick('AJUSTES');
await sleep(300);
const [chooser] = await Promise.all([t.page.waitForFileChooser(), t.pick('Importar partida')]);
await chooser.accept([file]);
await sleep(500);
const asked = (await t.ui()).text;
t.check('it asks before replacing the game', asked.includes('Beto'), asked);
await Promise.all([t.page.waitForNavigation({ timeout: 10000 }).catch(() => null), (async () => { for (let i = 0; i < 6; i++) await t.press('z'); })()]);
await sleep(500);
const stored = await t.page.evaluate(() => JSON.parse(localStorage.getItem('palabritas.save.v1')));
t.check('the imported save is kept, and the game restarts', stored.name === 'Beto' && stored.money === 300 && stored.flags.medalBrisa, [stored.name, stored.money]);
await t.end();

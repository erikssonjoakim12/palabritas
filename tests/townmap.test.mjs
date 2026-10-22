// The town map (START → MAPA): it opens on where you are (a building counts as its town), and the arrows pick
// other places.
import { start, sleep } from './lib.mjs';

const t = await start('townmap');
const shown = () => t.game(() => document.querySelector('.townmap-name')?.textContent);
const open = async () => {
  await t.press('Enter');
  await sleep(300);
  await t.pick('MAPA');
  await sleep(300);
};

await t.fromSave({ map: 'limon', x: 11, y: 8, dir: 'down', party: [['gotita', 5]] });
await open();
t.check('it opens on where you are', (await shown()) === 'Villa Limón', await shown());
await t.press('ArrowUp');
t.check('up picks the place to the north', (await shown()) === 'Ruta 2', await shown());
await t.shot('townmap');
await t.press('x');

await t.fromSave({ map: 'centro_chispa', x: 4, y: 5, dir: 'up', party: [['gotita', 5]] });
await open();
t.check('in a building, it shows the town outside', (await shown()) === 'Ciudad Chispa', await shown());
await t.end();

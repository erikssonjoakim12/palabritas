// Gate guards stop you and walk you back until their road opens: Beto (Palabolas), the officer in
// Ciudad Brisa (the Breeze Medal) and the road worker on Ruta 5 (the next town isn't built yet).
import { start } from './lib.mjs';

const t = await start('gates');
const guard = async (name, save, dir, back) => {
  await t.fromSave({ party: [['gotita', 14]], ...save });
  const said = await t.walk(dir, 4);
  await t.play();
  const at = await t.pos();
  t.check(`${name} stops you`, said.length > 0, said);
  t.check(`${name} sends you back (and the save knows)`, at.join() === back.join(), at);
};
const passes = async (name, save, dir, to) => {
  await t.fromSave({ party: [['gotita', 14]], ...save });
  await t.walk(dir, 5);
  const at = await t.pos();
  t.check(`${name} lets you pass`, at[0] === to, at);
};

await guard('Beto', { map: 'limon', x: 11, y: 3, dir: 'up' }, 'up', ['limon', 11, 2]);
await passes('Beto, once you have Palabolas,', { map: 'limon', x: 11, y: 3, dir: 'up', flags: { palabolas: true } }, 'up', 'ruta2');
await guard('The officer', { map: 'brisa', x: 3, y: 8, dir: 'left', flags: { palabolas: true } }, 'left', ['brisa', 2, 8]);
await passes('The officer, once you have the medal,', { map: 'brisa', x: 3, y: 8, dir: 'left', flags: { palabolas: true, medalBrisa: true } }, 'left', 'ruta3');
await guard('The road worker', { map: 'ruta5', x: 3, y: 9, dir: 'left' }, 'left', ['ruta5', 2, 9]);
await t.end();

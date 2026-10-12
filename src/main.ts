import '@fontsource/press-start-2p/400.css';
import './style.css';
import { layout } from './engine/screen';
import { initInput } from './engine/input';
import { startLoop } from './engine/loop';
import { buildObjects } from './art/chars';
import { buildCreatureArt } from './art/creatures';
import { registerScripts } from './world/scripts';
import { runTitle } from './title';

layout(true);
window.addEventListener('resize', () => layout());
window.addEventListener('orientationchange', () => setTimeout(() => layout(true), 200));

initInput();
buildObjects();
buildCreatureArt();
registerScripts();
startLoop();
runTitle();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

if (import.meta.env.DEV) {
  // Handy for testing from the browser console: __game.G.save, __game.warp('brisa', 11, 15, 'up')...
  Promise.all([import('./game/state'), import('./world/world'), import('./battle/battle'), import('./game/mon')]).then(
    ([state, world, battle, mon]) => {
      (window as any).__game = { ...state, ...world, ...battle, ...mon };
    },
  );
}

import '@fontsource/press-start-2p/400.css';
import './style.css';
import { layout } from './engine/screen';
import { initInput } from './engine/input';
import { startLoop } from './engine/loop';
import { buildObjects } from './art/chars';
import { registerScripts } from './world/scripts';
import { runTitle } from './title';

layout(true);
window.addEventListener('resize', () => layout());
window.addEventListener('orientationchange', () => setTimeout(() => layout(true), 200));
document.addEventListener('fullscreenchange', () => setTimeout(() => layout(true), 150));

// Fullscreen button (hides Chrome's address bar). Not shown where the browser can't do it.
const fsButton = document.getElementById('fullscreen') as HTMLButtonElement;
const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };

function toast(text: string) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else doc.webkitExitFullscreen?.();
      return;
    }
    try {
      await root.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      // Some browsers refuse the options or the standard call; try the plain/older ones.
      if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else await root.requestFullscreen();
    }
  } catch (err) {
    toast(`No se pudo poner pantalla completa (${(err as Error).name || 'error'})`);
  }
}

if (document.fullscreenEnabled || root.webkitRequestFullscreen) {
  fsButton.hidden = false;
  // Browsers only allow fullscreen when a tap *ends* (touchend / click), not when it starts.
  // Listen to both and act on whichever arrives first.
  let last = 0;
  const onTapEnd = async (e: Event) => {
    e.stopPropagation();
    if (Date.now() - last < 600) return;
    last = Date.now();
    const wasFull = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    await toggleFullscreen();
    setTimeout(() => {
      if (!wasFull && !document.fullscreenElement && !doc.webkitFullscreenElement) toast('Este navegador no permitió la pantalla completa.');
    }, 500);
  };
  fsButton.addEventListener('touchend', onTapEnd);
  fsButton.addEventListener('click', onTapEnd);
  fsButton.addEventListener('keydown', (e) => e.key === 'Enter' && toggleFullscreen());
}

initInput();
buildObjects();
registerScripts();
startLoop();
runTitle();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

if (import.meta.env.DEV) {
  // Handy for testing from the browser console: __game.G.save, __game.warp('brisa', 11, 15, 'up')...
  // The tests use it too: always the game's own modules (a fresh import can be a second copy after hot reloads).
  Promise.all([
    import('./game/state'),
    import('./world/world'),
    import('./battle/battle'),
    import('./game/mon'),
    import('./world/maps'),
    import('./ui/textbox'),
    import('./data/species'),
    import('./data/content'),
    import('./game/curriculum'),
    import('./game/learning'),
    import('./art/tiles'),
    import('./art/creatures'),
    import('./style/people'),
    import('./data/trainers'),
    import('./data/items'),
    import('./audio/bgm'),
    import('./world/layout'),
    import('./game/backup'),
  ]).then(([state, world, battle, mon, maps, textbox, species, content, curriculum, learning, tiles, creatures, people, trainers, items, bgm, layout, backup]) => {
    (window as any).__game = {
      ...state, ...world, ...battle, ...mon, ...maps,
      fill: textbox.fill, SPECIES: species.SPECIES, TILES: tiles.TILES, creatureArt: creatures.creatureArt, CREATURE_IDS: creatures.CREATURE_IDS, LOOKS: people.LOOKS,
      OBJECTS_ART: people.OBJECTS_ART, TRAINERS: trainers.TRAINERS, ITEM_DEFS: items.ITEM_DEFS, SHOPS: items.SHOPS,
      content, curriculum, learning, bgm, backup, worldLayout: layout.worldLayout,
    };
  });
}

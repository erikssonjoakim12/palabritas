import { W, H, overlay, el, setTextScale } from './engine/screen';
import { setScene, nextFrame } from './engine/loop';
import { input } from './engine/input';
import { sfx, unlockAudio } from './engine/sfx';
import { creatureArt } from './art/creatures';
import { G, hasSave, loadGame, newSave, deleteSave, saveGame } from './game/state';
import { initSpeech } from './lang/speech';
import { say, closeText } from './ui/textbox';
import { menu, ask } from './ui/menu';
import { promptText } from './ui/challenge';
import { loadMap, worldScene, fadeIn, setFade } from './world/world';
import { importGame } from './ui/startmenu';

let t = 0;
const titleScene = {
  update() {
    t++;
  },
  render(g: CanvasRenderingContext2D) {
    g.fillStyle = '#5ab0f0';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#88c8f8';
    g.fillRect(0, 60, W, 30);
    g.fillStyle = '#7ec860';
    g.fillRect(0, 98, W, H - 98);
    g.fillStyle = '#5aa04a';
    g.fillRect(0, 98, W, 3);
    // Each starter hops now and then, one after the other (a 20-frame hop every 3 seconds).
    const bob = (i: number) => {
      const f = (t + i * 60) % 180;
      return f < 20 ? -Math.round(Math.sin((f / 20) * Math.PI) * 6) : 0;
    };
    // The three starters, standing on the grass (centered on x, feet at y).
    const stand = (sp: string, x: number, y: number) => {
      const img = creatureArt(sp).front;
      g.drawImage(img, Math.round(x - img.width / 2), y - img.height);
    };
    stand('salchichita', 32, 104 + bob(0));
    stand('gotita', 80, 98 + bob(1));
    stand('aguacatito', 128, 104 + bob(2));
  },
};

function waitTap(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      pop();
      document.removeEventListener('pointerdown', done);
      resolve();
    };
    const pop = input.push((b) => {
      if (b === 'A' || b === 'START') done();
    });
    document.addEventListener('pointerdown', done);
  });
}

/** Parse "Me llamo Ana" / "Soy Ana" / "Ana" into a name. */
function parseName(raw: string): { name: string; full: boolean } {
  const m = raw.trim().match(/^(me llamo|soy|mi nombre es)\s+(.+)$/i);
  const name = (m ? m[2] : raw).replace(/[.!¡?¿]/g, '').trim().split(/\s+/)[0] ?? 'Tú';
  const clean = name.slice(0, 10);
  return { name: clean.charAt(0).toUpperCase() + clean.slice(1), full: !!m };
}

export async function runTitle() {
  setScene(titleScene);
  const title = el('div', 'title', 'PALABRITAS');
  title.dataset.text = 'PALABRITAS'; // the shine (style.css) draws over the same letters
  const sub = el('div', 'subtitle', 'Aprende español con Palabritas');
  const tap = el('div', 'blink-text', 'TOCA PARA EMPEZAR');
  overlay.append(title, sub, tap);
  await waitTap();
  unlockAudio();
  initSpeech();
  sfx('select');
  tap.remove();

  let start: 'new' | 'continue' | 'import' = 'new';
  // Importing a save file brings a game from another device (or a backup).
  const choices = hasSave() ? ['CONTINUAR', 'NUEVA PARTIDA', 'IMPORTAR'] : ['NUEVA PARTIDA', 'IMPORTAR'];
  const choice = choices[await menu(choices, { pos: { left: 22, right: 22, bottom: 12 } })];
  start = choice === 'CONTINUAR' ? 'continue' : choice === 'IMPORTAR' ? 'import' : 'new';
  if (start === 'import') {
    title.remove();
    sub.remove();
    if (!(await importGame())) return runTitle();
    applySettings();
    enterWorld();
    return;
  }
  title.remove();
  sub.remove();

  if (start === 'new' && hasSave()) {
    const sure = await ask('¿Borrar la partida guardada y empezar de nuevo?', {
      voice: false,
      en: 'Delete your saved game and start over?',
    });
    closeText();
    if (!sure) return runTitle();
  }

  if (start === 'continue' && loadGame()) {
    applySettings();
    enterWorld();
    return;
  }

  deleteSave();
  G.save = newSave();
  applySettings();
  await newGameIntro();
  saveGame();
  enterWorld();
}

function applySettings() {
  setTextScale(G.save.settings.textScale);
}

async function newGameIntro() {
  await say('¡Hola! Este es el mundo de Palabritas.', { en: 'Hello! This is the world of Palabritas.' });
  await say('Aquí, las Palabritas crecen cuando tú aprendes español.', { en: 'Here, Palabritas grow when you learn Spanish.' });
  await say('¿Eres un chico o una chica?', { en: 'Are you a boy or a girl?', noWait: true });
  G.save.gender = (await menu(['Chico', 'Chica'], { pos: { right: 0, bottom: 48 } })) === 1 ? 'girl' : 'boy';
  await say('Primero, ¿cómo te llamas?', { en: 'First of all, what’s your name?' });
  closeText();
  const raw = await promptText('¿Cómo te llamas?', 'Write "Me llamo …" (or just your name)', 'Me llamo…');
  const { name, full } = parseName(raw);
  G.save.name = name || 'Tú';
  if (full) {
    sfx('perfect');
    await say('¡Muy bien! «Me llamo {name}» es perfecto.', { en: '"Me llamo {name}" is perfect.' });
  } else {
    await say('¡Hola, {name}! La próxima vez, di: «Me llamo {name}».', { en: 'Next time, say: "Me llamo {name}" (My name is {name}).' });
  }
  await say('¡Tu aventura empieza ahora!', { en: 'Your adventure starts now!' });
  closeText();
}

async function enterWorld() {
  const s = G.save;
  setFade(1);
  loadMap(s.map, s.x, s.y, s.dir);
  setScene(worldScene);
  await nextFrame();
  await fadeIn(12);
}

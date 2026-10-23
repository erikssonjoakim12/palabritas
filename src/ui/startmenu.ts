import { el, setTextScale } from '../engine/screen';
import { sfx } from '../engine/sfx';
import { G, saveGame, useSave } from '../game/state';
import { exportSave, pickFile, readSave } from '../game/backup';
import { monName } from '../game/mon';
import { totalLearned, isLearned } from '../game/learning';
import { SPECIES, DEX_ORDER } from '../data/species';
import { THEMES } from '../data/content';
import { allItems } from '../game/curriculum';
import { speak } from '../lang/speech';
import { menu, ask } from './menu';
import { info, say, closeText } from './textbox';
import { pickMon, showDetails, listMenu, iconCanvas, detailBox, wordRow, openDetail } from './party';
import { openBag } from './bag';
import { money } from '../game/bag';
import { dueCount } from '../game/review';
import { musicSettingChanged } from '../audio/bgm';
import { townMap } from './townmap';

/** The START menu. Resolves a script to run after it closes (an item used from the bag), if any. */
export async function startMenu(): Promise<string | undefined> {
  sfx('select');
  let sel = 0;
  while (true) {
    const opts = ['PALABRITAS', 'MOCHILA', 'DICCIONARIO', 'MAPA', 'TARJETA', 'GUARDAR', 'AJUSTES', 'SALIR'];
    // Words due for review (the schools' REPASO), so you know when it's time.
    const due = dueCount();
    const i = await menu(opts, { cancel: true, pos: { right: 0, top: 0 }, initial: sel, disabled: [!G.save.party.length], title: due ? `Repaso: ${due}` : undefined });
    sel = Math.max(0, i);
    if (i === 0) await PalabritasMenu();
    else if (i === 1) {
      const script = await openBag();
      if (script) return script;
    }
    else if (i === 2) await dictionary();
    else if (i === 3) await townMap();
    else if (i === 4) await trainerCard();
    else if (i === 5) {
      await guardar();
    } else if (i === 6) await settings();
    else return;
  }
}

async function PalabritasMenu() {
  // Palabritas train by fighting; this menu is for looking at their powers and words. The team stays on screen
  // under it; after PRIMERO it's shown again in the new order.
  while (
    await pickMon('view', undefined, async (mon) => {
      const i = await menu(['DETALLES', 'PRIMERO', 'SALIR'], { cancel: true, pos: { right: 0, bottom: 0 } });
      if (i === 0) await showDetails(mon);
      if (i !== 1) return false;
      G.save.party = [mon, ...G.save.party.filter((m) => m !== mon)];
      await info(`${monName(mon)} luchará primero.`, { en: `${monName(mon)} will fight first.` });
      return true;
    })
  );
}

async function dictionary() {
  // Rebuilt every time: cloning a canvas doesn't copy its pixels.
  const makeRows = () => DEX_ORDER.map((id, n) => {
    const row = el('div');
    const seen = G.save.seen.includes(id);
    const caught = G.save.caught.includes(id);
    if (seen) row.appendChild(iconCanvas(id));
    else row.appendChild(el('div', '', '?')).style.width = '2.4em';
    const label = el('div', 'grow', `${String(n + 1).padStart(3, '0')} ${seen ? SPECIES[id].name : '???'}`);
    row.appendChild(label);
    row.appendChild(el('div', 'small', caught ? '●' : seen ? '○' : ''));
    return row;
  });
  const header = el('div', 'menu-title', `DICCIONARIO · Vistos ${G.save.seen.length} · Atrapados ${G.save.caught.length}`);
  let initial = 0;
  while (true) {
    const i = await listMenu(makeRows(), { header, initial });
    if (i < 0) return;
    initial = i;
    const id = DEX_ORDER[i];
    if (!G.save.seen.includes(id)) continue;
    await dexEntry(id);
  }
}

function dexEntry(id: string): Promise<void> {
  const sp = SPECIES[id];
  const box = detailBox(id, sp.name);
  box.append(el('div', 'row', sp.types.join(' / ')), el('div', 'row', `Tema: ${THEMES[sp.theme].name}`));
  const es = el('div', 'row', sp.dex.es);
  es.style.cursor = 'pointer';
  es.addEventListener('click', (e) => {
    e.stopPropagation();
    speak(sp.dex.es);
  });
  box.append(es, el('div', 'row muted', sp.dex.en));
  speak(sp.dex.es);
  if (G.save.caught.includes(id)) {
    const items = allItems(id);
    const learned = items.filter(isLearned);
    const words = el('div', 'words');
    words.appendChild(el('div', 'muted', `Palabras dominadas: ${learned.length}/${items.length}`));
    for (const it of learned) words.appendChild(wordRow(it.es, it.en));
    box.appendChild(words);
  }
  return openDetail(box);
}

async function trainerCard() {
  const s = G.save;
  const mins = Math.floor(s.playMs / 60000);
  const acc = s.answers ? Math.round((100 * s.correct) / s.answers) : 0;
  const lines = [
    `Nombre: ${s.name}`,
    `Medallas: ${s.medals.length ? s.medals.join(', ') : 'ninguna'}`,
    `Palabras dominadas: ${totalLearned()}`,
    `Respuestas: ${s.answers} (${acc}% bien)`,
    `Dinero: ${money()}`,
    `Diccionario: ${s.caught.length} atrapados`,
    `Tiempo: ${Math.floor(mins / 60)}h ${mins % 60}m`,
  ];
  await say(lines.join('\n'), { voice: false });
}

/** GUARDAR: in this browser, or as a file to keep or take to another device (Drive, WhatsApp...). */
async function guardar() {
  const i = await menu(['Guardar aquí', 'Exportar archivo', 'Volver'], { cancel: true, pos: { right: 0, top: 0 }, title: 'GUARDAR' });
  if (i === 0) await info(saveGame() ? 'Partida guardada.' : 'No se pudo guardar.', { en: 'Game saved.' });
  if (i !== 1) return;
  saveGame();
  if (await exportSave()) await info('Partida exportada. Con ese archivo puedes seguir en otro dispositivo.', { en: 'Game exported. With that file you can continue on another device.' });
}

/** Import a save file: pick it, check it, ask, then keep it. True if a save was loaded (the title screen uses it too). */
export async function importGame(): Promise<boolean> {
  const text = await pickFile();
  if (text === null) return false;
  const save = readSave(text);
  if (!save) {
    await info('Ese archivo no es una partida de Palabritas.', { en: 'That file isn’t a Palabritas save.' });
    return false;
  }
  const sure = await ask(`¿Cargar la partida de ${save.name}? Reemplaza la partida de este dispositivo.`, {
    voice: false,
    en: `Load ${save.name}’s game? It replaces the game on this device.`,
  });
  closeText();
  if (!sure) return false;
  useSave(save);
  saveGame();
  return true;
}

async function settings() {
  const sizes: Record<number, string> = { 5: 'Pequeño', 6: 'Mediano', 7: 'Grande' };
  let sel = 0;
  while (true) {
    const st = G.save.settings;
    const i = await menu(
      [`Texto: ${sizes[st.textScale]}`, `Voz en diálogos: ${st.dialogVoice ? 'Sí' : 'No'}`, `Voz lenta: ${st.slowVoice ? 'Sí' : 'No'}`, `Música: ${st.musicLevel ? `${st.musicLevel}%` : 'No'}`, 'Importar partida', 'Volver'],
      { cancel: true, pos: { right: 0, top: 0 }, initial: sel, title: 'AJUSTES' },
    );
    sel = Math.max(0, i);
    if (i === 0) {
      st.textScale = st.textScale >= 7 ? 5 : st.textScale + 1;
      setTextScale(st.textScale);
    } else if (i === 1) st.dialogVoice = !st.dialogVoice;
    else if (i === 2) st.slowVoice = !st.slowVoice;
    else if (i === 3) {
      // No, 20, 40, 60, 80, 100%, then off again.
      st.musicLevel = st.musicLevel >= 100 ? 0 : st.musicLevel + 20;
      musicSettingChanged();
    } else if (i === 4) {
      // The game restarts from the title, to load the new save from the start.
      if (await importGame()) {
        await info('Partida cargada. El juego vuelve a empezar.', { en: 'Game loaded. The game restarts.' });
        location.reload();
      }
    } else {
      saveGame();
      return;
    }
  }
}

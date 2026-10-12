import { overlay, el, setTextScale } from '../engine/screen';
import { input } from '../engine/input';
import { sfx } from '../engine/sfx';
import { G, saveGame, type Mon } from '../game/state';
import { monName, checkLevelUps } from '../game/mon';
import { pickItem, record, totalLearned, themeLearnedCount, isLearned } from '../game/learning';
import { SPECIES, type Mode } from '../data/species';
import { THEMES, poolUpTo } from '../data/content';
import { canListen, speak } from '../lang/speech';
import { menu, ask } from './menu';
import { info, say } from './textbox';
import { challenge } from './challenge';
import { pickMon, showDetails, listMenu, spriteCanvas } from './party';

const DEX_ORDER = ['perrito', 'gotita', 'aguacatito', 'pajarito', 'palomon', 'conejito', 'mariposita', 'sillon'];

export async function startMenu() {
  sfx('select');
  let sel = 0;
  while (true) {
    const opts = ['CRIATURAS', 'DICCIONARIO', 'TARJETA', 'GUARDAR', 'AJUSTES', 'SALIR'];
    const i = await menu(opts, { cancel: true, pos: { right: 0, top: 0 }, initial: sel, disabled: [!G.save.party.length] });
    sel = Math.max(0, i);
    if (i === 0) await creaturesMenu();
    else if (i === 1) await dictionary();
    else if (i === 2) await trainerCard();
    else if (i === 3) {
      await info(saveGame() ? 'Partida guardada.' : 'No se pudo guardar.', { en: 'Game saved.' });
    } else if (i === 4) await settings();
    else return;
  }
}

async function creaturesMenu() {
  while (true) {
    const mon = await pickMon('view');
    if (!mon) return;
    const i = await menu(['ENTRENAR', 'DETALLES', 'PRIMERO', 'SALIR'], { cancel: true, pos: { right: 0, bottom: 0 } });
    if (i === 0) await train(mon);
    else if (i === 1) await showDetails(mon);
    else if (i === 2) {
      G.save.party = [mon, ...G.save.party.filter((m) => m !== mon)];
      await info(`${monName(mon)} luchará primero.`, { en: `${monName(mon)} will fight first.` });
    }
  }
}

/** Practice a creature's words outside battle: five challenges, mixed modes. */
export async function train(mon: Mon) {
  const sp = SPECIES[mon.sp];
  const box = el('div', 'box fullpanel detail');
  const big = spriteCanvas(mon.sp, 96);
  big.className = 'big';
  const title = el('h3', '', `Entrenando a ${sp.name}`);
  const sub = el('div', 'row muted', `Tema: ${THEMES[sp.theme].name} · Nv${mon.level}`);
  box.append(big, title, sub, el('div', 'row muted', 'Training: answer to grow stronger!'));
  overlay.appendChild(box);
  const modes: Mode[] = canListen() ? ['choose', 'listen', 'type', 'speak'] : ['choose', 'listen', 'type'];
  let m = Math.floor(Math.random() * modes.length);
  const recent: string[] = [];
  try {
    do {
      let right = 0;
      for (let round = 1; round <= 5; round++) {
        const item = pickItem(poolUpTo(sp.theme, mon.level), recent);
        recent.push(item.id);
        if (recent.length > 3) recent.shift();
        const mode = modes[m++ % modes.length];
        const r = await challenge({ item, mode, title: `Entreno ${round}/5` });
        const res = record(item, r.mode, r.grade, r.helped);
        if (r.grade !== 'wrong') right++;
        if (res.learnedNow) await info(`📗 ¡Dominaste «${item.es}»!`, { auto: 1100 });
        for (const up of checkLevelUps()) {
          sfx('levelup');
          await info(`¡${monName(up.mon)} subió al nivel ${up.to}!`);
          if (up.mon === mon) sub.textContent = `Tema: ${THEMES[sp.theme].name} · Nv${mon.level}`;
        }
      }
      await info(`¡Buen entreno! ${right}/5 correctas.`, { en: `Good training! ${right}/5 correct.` });
    } while (await ask('¿Otra ronda?', { voice: false, en: 'Another round?' }));
  } finally {
    box.remove();
    saveGame();
  }
}

async function dictionary() {
  // Rebuilt every time: cloning a canvas doesn't copy its pixels.
  const makeRows = () => DEX_ORDER.map((id, n) => {
    const row = el('div');
    const seen = G.save.seen.includes(id);
    const caught = G.save.caught.includes(id);
    if (seen) row.appendChild(spriteCanvas(id));
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
  const theme = THEMES[sp.theme];
  const box = el('div', 'box fullpanel detail');
  const big = spriteCanvas(id, 96);
  big.className = 'big';
  box.append(big, el('h3', '', sp.name), el('div', 'row', sp.types.join(' / ')), el('div', 'row', `Tema: ${theme.name}`));
  const es = el('div', 'row', sp.dex.es);
  es.style.cursor = 'pointer';
  box.append(es, el('div', 'row muted', sp.dex.en));
  speak(sp.dex.es);
  if (G.save.caught.includes(id)) {
    const learned = theme.items.filter(isLearned);
    const words = el('div', 'words');
    words.appendChild(el('div', 'muted', `Palabras dominadas: ${themeLearnedCount(sp.theme)}/${theme.items.length}`));
    for (const it of learned) {
      const w = el('div', 'word');
      const left = el('span', '', it.es);
      left.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(it.es);
      });
      w.append(left, el('span', 'en', it.en));
      words.appendChild(w);
    }
    box.appendChild(words);
  }
  overlay.appendChild(box);
  es.addEventListener('click', (e) => {
    e.stopPropagation();
    speak(sp.dex.es);
  });
  return new Promise((resolve) => {
    const close = () => {
      pop();
      box.remove();
      resolve();
    };
    const pop = input.push((b) => {
      if (b === 'A' || b === 'B') close();
      if (b === 'down') box.scrollTop += 40;
      if (b === 'up') box.scrollTop -= 40;
    });
    box.addEventListener('click', close);
  });
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
    `Esferas: ${s.esferas}`,
    `Diccionario: ${s.caught.length} atrapados`,
    `Tiempo: ${Math.floor(mins / 60)}h ${mins % 60}m`,
  ];
  await say(lines.join('\n'), { voice: false });
}

async function settings() {
  const sizes: Record<number, string> = { 5: 'Pequeño', 6: 'Mediano', 7: 'Grande' };
  let sel = 0;
  while (true) {
    const st = G.save.settings;
    const i = await menu(
      [`Texto: ${sizes[st.textScale]}`, `Voz en diálogos: ${st.dialogVoice ? 'Sí' : 'No'}`, `Voz lenta: ${st.slowVoice ? 'Sí' : 'No'}`, 'Volver'],
      { cancel: true, pos: { right: 0, top: 0 }, initial: sel, title: 'AJUSTES' },
    );
    sel = Math.max(0, i);
    if (i === 0) {
      st.textScale = st.textScale >= 7 ? 5 : st.textScale + 1;
      setTextScale(st.textScale);
    } else if (i === 1) st.dialogVoice = !st.dialogVoice;
    else if (i === 2) st.slowVoice = !st.slowVoice;
    else {
      saveGame();
      return;
    }
  }
}

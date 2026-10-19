// The music page (musica.html, `npm run music`): play the song samples, mute voices to hear the parts, set the
// volume. Nothing plays until you tap a song.
import { MusicPlayer, arrange, type Voice } from '../audio/music';
import { SONGS } from '../data/music';

const root = document.getElementById('music')!;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '', cls = '') => {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (cls) e.className = cls;
  return e;
};
const player = new MusicPlayer();

// Volume and the voices (mute one to hear the others).
const controls = el('div', '', 'controls');
const volume = Object.assign(el('input'), { type: 'range', min: '0', max: '1', step: '0.05', value: '0.7' });
volume.addEventListener('input', () => player.setVolume(Number(volume.value)));
const volLabel = el('label', 'Volume ');
volLabel.append(volume);
controls.append(volLabel);
const VOICES: [Voice, string][] = [['melody', 'melody'], ['harmony', 'harmony'], ['bass', 'bass'], ['drums', 'drums']];
for (const [voice, label] of VOICES) {
  const box = Object.assign(el('input'), { type: 'checkbox', checked: true });
  box.addEventListener('change', () => player.setMuted(voice, !box.checked));
  const l = el('label');
  l.append(box, ` ${label}`);
  controls.append(l);
}
root.append(controls);

const KINDS = [
  ['route', 'Routes'],
  ['town', 'Towns'],
  ['battle', 'Battles'],
] as const;
const cards: { id: string; card: HTMLElement; button: HTMLButtonElement }[] = [];
const refresh = () => {
  for (const c of cards) {
    const on = player.playing === c.id;
    c.card.classList.toggle('playing', on);
    c.button.textContent = on ? '■ Stop' : '▶ Play';
  }
};
for (const [kind, title] of KINDS) {
  root.append(el('h2', title));
  const grid = el('div', '', 'songs');
  for (const song of SONGS.filter((s) => s.kind === kind)) {
    // Arranging checks every bar fits (a mistake shows up as an error on the page and in data.test).
    const { steps } = arrange(song);
    const seconds = Math.round((steps * 60) / song.bpm / song.stepsPerBeat);
    const card = el('div', '', 'song');
    const button = el('button', '▶ Play');
    button.addEventListener('click', () => {
      if (player.playing === song.id) player.stop();
      else player.play(song);
      refresh();
    });
    card.append(
      el('h3', song.name),
      el('div', song.en, 'en'),
      el('p', song.note),
      el('div', `${song.chords.length} bars · ${song.bpm} bpm · ${song.barSteps === 12 ? '6/8' : '4/4'} · loops every ${seconds} s`, 'facts'),
      button,
    );
    grid.append(card);
    cards.push({ id: song.id, card, button });
  }
  root.append(grid);
}

// The music page (musica.html, `npm run music`): play the song samples, mute voices to hear the parts, set the
// volume. Nothing plays until you tap a song.
import { MusicPlayer, arrange, type Voice } from '../audio/music';
import { SONGS } from '../data/music';
import { el } from '../engine/dom';

const root = document.getElementById('music')!;
const player = new MusicPlayer();

// Volume and the voices (mute one to hear the others).
const controls = el('div', 'controls');
const volume = Object.assign(el('input'), { type: 'range', min: '0', max: '1', step: '0.05', value: '0.7' });
volume.addEventListener('input', () => player.setVolume(Number(volume.value)));
const volLabel = el('label', '', 'Volume ');
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
  ['place', 'Places'],
  ['battle', 'Battles'],
  ['jingle', 'After battles and jingles'],
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
  root.append(el('h2', '', title));
  const grid = el('div', 'songs');
  for (const song of SONGS.filter((s) => s.kind === kind)) {
    // Arranging checks every bar fits (a mistake shows up as an error on the page and in data.test).
    const { intro, steps } = arrange(song);
    const seconds = Math.round(((steps - intro) * 60) / song.bpm / song.stepsPerBeat);
    const card = el('div', 'song');
    const button = el('button', '', '▶ Play');
    button.addEventListener('click', () => {
      if (player.playing === song.id) player.stop();
      else player.play(song, refresh);
      refresh();
    });
    card.append(
      el('h3', '', song.name),
      el('div', 'en', song.en),
      el('p', '', song.note),
      el('div', 'facts', `${song.chords.length} bars${song.intro ? ` + a ${song.intro.melody.length}-bar intro` : ''} · ${song.bpm} bpm · ${song.barSteps === 12 ? '6/8' : '4/4'} · ${song.once ? `plays once (${seconds} s)` : `loops every ${seconds} s`}`),
      button,
    );
    grid.append(card);
    cards.push({ id: song.id, card, button });
  }
  root.append(grid);
}

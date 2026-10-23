import { el } from '../engine/screen';
import { input } from '../engine/input';
import { sfx } from '../engine/sfx';
import { FAQ } from '../data/faq';

/*
  The ? button (bottom left, by the controls, on the title screen) opens the FAQ over the whole page: the game's
  screen is too small to read it in. ✕, B or a tap outside the questions closes it.
*/

const button = document.getElementById('help') as HTMLButtonElement;

/** Show or hide the ? button (the title screen shows it). */
export const showHelpButton = (on: boolean) => (button.hidden = !on);

function openFaq() {
  sfx('select');
  const page = el('div', 'faq');
  const box = el('div', 'faq-box');
  const close = el('button', 'faq-close', '✕');
  box.append(close, el('h2', '', 'Preguntas frecuentes'), el('div', 'faq-sub', 'FAQ'));
  for (const { q, a } of FAQ) box.append(el('h3', '', q), el('p', '', a));
  page.appendChild(box);
  document.body.appendChild(page);
  const done = () => {
    pop();
    page.remove();
    sfx('select');
  };
  const pop = input.push((b) => b === 'B' && done());
  // Taps here mustn't start the game behind it (the title waits for any tap).
  page.addEventListener('pointerdown', (e) => e.stopPropagation());
  page.addEventListener('click', (e) => (e.target === page || e.target === close) && done());
}

button.addEventListener('pointerdown', (e) => e.stopPropagation());
button.addEventListener('click', openFaq);

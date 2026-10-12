import { overlay, el } from '../engine/screen';
import { input } from '../engine/input';
import { speak } from '../lang/speech';
import { G } from '../game/state';
import { sfx } from '../engine/sfx';

let box: HTMLDivElement | null = null;

export interface SayOpts {
  /** English translation, shown with the EN button. */
  en?: string;
  /** Spanish line: show the 🔊 button. Default true. */
  voice?: boolean;
  /** Read it aloud right away, even when dialog voice is off (listening moments). */
  speakNow?: boolean;
  /** Resolve as soon as the text is shown (for questions followed by a menu). */
  noWait?: boolean;
  /** Advance by itself after this many ms (still skippable). */
  auto?: number;
}

export const fill = (text: string) => text.replace(/\{name\}/g, G.save.name);

function ensureBox() {
  if (!box) {
    box = el('div', 'box textbox');
    overlay.appendChild(box);
  }
  return box;
}

export function closeText() {
  box?.remove();
  box = null;
}

/** Show a line of dialog in the Game Boy text box and wait for A (or a tap). */
export function say(raw: string, opts: SayOpts = {}): Promise<void> {
  const text = fill(raw);
  const en = opts.en ? fill(opts.en) : '';
  const voice = opts.voice !== false;
  const b = ensureBox();
  b.innerHTML = '';
  const textEl = el('div', 'tb-text');
  const enEl = el('div', 'tb-en', en);
  enEl.hidden = true;
  const arrow = el('div', 'tb-arrow', '▼');
  arrow.hidden = true;
  const tools = el('div', 'tb-tools');
  if (voice) {
    const spk = el('button', 'tool', '🔊');
    spk.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(text, G.save.settings.slowVoice);
    });
    tools.appendChild(spk);
  }
  if (en) {
    const enBtn = el('button', 'tool', 'EN');
    enBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enEl.hidden = !enEl.hidden;
      enBtn.classList.toggle('on', !enEl.hidden);
    });
    tools.appendChild(enBtn);
  }
  b.append(textEl, enEl, tools, arrow);
  b.style.paddingRight = tools.childElementCount ? '' : `calc(var(--px) * 8)`;

  if (voice && (opts.speakNow || G.save.settings.dialogVoice)) speak(text, G.save.settings.slowVoice);

  return new Promise((resolve) => {
    let shown = 0;
    let done = false;
    let finished = false;
    const chars = [...text];
    const finishTyping = () => {
      clearInterval(timer);
      textEl.textContent = text;
      done = true;
      if (opts.noWait) return finish();
      arrow.hidden = false;
      if (opts.auto) setTimeout(finish, opts.auto);
    };
    const timer = setInterval(() => {
      shown = Math.min(chars.length, shown + 2);
      textEl.textContent = chars.slice(0, shown).join('');
      if (shown >= chars.length) finishTyping();
    }, 22);
    const advance = () => {
      if (!done) finishTyping();
      else finish();
    };
    const pop = input.push((btn) => {
      if (btn === 'A' || btn === 'B') advance();
    });
    const onTap = () => advance();
    b.addEventListener('click', onTap);
    function finish() {
      if (finished) return;
      finished = true;
      pop();
      b.removeEventListener('click', onTap);
      arrow.hidden = true;
      if (!opts.noWait) sfx('blip');
      resolve();
    }
  });
}

/** Narration that isn't spoken Spanish dialog (battle messages, system text). */
export const info = (text: string, opts: SayOpts = {}) => say(text, { voice: false, ...opts });

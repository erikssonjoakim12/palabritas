import { el } from '../engine/screen';
import { input } from '../engine/input';
import { sfx } from '../engine/sfx';
import { duck, DUCK } from '../audio/bgm';
import { check, diffMarks, REASONS, type CheckResult, type Grade } from '../lang/check';
import { speak, listen, canListen, stopSpeaking } from '../lang/speech';
import { MODE_INFO, type Mode } from '../data/species';
import type { Item } from '../data/content';
import { distractors, isUnseen } from '../game/learning';

const panel = () => document.getElementById('challenge') as HTMLDivElement;
const pad = () => document.getElementById('pad') as HTMLDivElement;

export interface ChallengeSpec {
  item: Item;
  mode: Mode;
  /** Shown top-left, e.g. the move name. */
  title?: string;
  /** Allow the 💡 help button. Default true (not for choose). */
  allowHelp?: boolean;
  /** Override the instruction line. */
  label?: string;
  /** Custom grading that runs before the normal check (return null to fall through). */
  validate?: (answer: string) => Grade | null;
}

export interface ChallengeResult {
  grade: Grade;
  helped: boolean;
  /** The mode actually used (speak can fall back to type). */
  mode: Mode;
  answer: string;
}

function showPanel() {
  pad().hidden = true;
  document.body.classList.add('challenge-open');
  const p = panel();
  p.hidden = false;
  p.innerHTML = '';
  p.scrollTop = 0;
  input.releaseAll();
  return p;
}

function hidePanel() {
  panel().hidden = true;
  panel().innerHTML = '';
  pad().hidden = false;
  document.body.classList.remove('challenge-open');
}

/**
 * A tap counts only if it also started on this button. The A button reacts as soon as it's touched, and a challenge's
 * answers can appear right under your finger: lifting it mustn't choose one (Android sends that "ghost" click).
 */
function onTap(b: HTMLElement, fn: () => void) {
  let armed = false;
  b.addEventListener('pointerdown', () => (armed = true));
  b.addEventListener('click', (e) => {
    if (e.detail > 0 && !armed) return; // keyboard and test clicks have no pointer (detail 0)
    armed = false;
    fn();
  });
}

function button(text: string, cls = 'btn', onClick?: () => void) {
  const b = el('button', cls, text);
  b.type = 'button';
  if (onClick) onTap(b, onClick);
  return b;
}

function speakButtons(text: string) {
  const row = el('div', 'ch-row');
  row.style.marginTop = '8px';
  row.append(
    button('🔊 Oír', 'btn', () => speak(text)),
    button('🐢 Lento', 'btn', () => speak(text, true)),
  );
  return row;
}

function textInput(onEnter: () => void) {
  const inp = el('input', 'ch-input');
  inp.type = 'text';
  // Tells the phone keyboard this is Spanish (Gboard uses it when Spanish is installed).
  inp.lang = 'es';
  inp.setAttribute('inputmode', 'text');
  inp.autocomplete = 'off';
  inp.setAttribute('autocapitalize', 'off');
  inp.setAttribute('autocorrect', 'off');
  inp.spellcheck = false;
  inp.placeholder = 'Escribe aquí…';
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
  });
  return inp;
}

/** A text field with an OK button. Calls onSubmit with the trimmed text (ignores empty). */
function inputRow(onSubmit: (value: string) => void) {
  const submit = () => {
    const v = inp.value.trim();
    if (v) onSubmit(v);
  };
  const inp = textInput(submit);
  const row = el('div', 'ch-row');
  row.append(inp, button('OK', 'btn primary', submit));
  setTimeout(() => inp.focus(), 50);
  return { row, inp };
}

/** A column of answer buttons. */
function choiceList(options: string[], onPick: (i: number) => void) {
  const list = el('div', 'choices');
  list.style.marginTop = '10px';
  options.forEach((o, i) => list.appendChild(button(o, 'btn', () => onPick(i))));
  return list;
}

/** For the small prompts below: open the panel and block game buttons until close(). */
function openPanel(label: string, big: string) {
  const blockGame = input.push(() => {});
  const p = showPanel();
  const prompt = el('div', 'ch-prompt');
  prompt.append(el('div', 'label', label), el('div', 'answer-es', big));
  p.appendChild(prompt);
  const close = () => {
    hidePanel();
    blockGame();
  };
  return { p, close };
}

/** First letter of each word, e.g. "el perro" → "e_ p____". */
function hintFor(es: string) {
  return es.replace(/[\p{L}]+/gu, (w) => w[0] + '_'.repeat(w.length - 1));
}

/**
 * Run one Spanish challenge in the bottom panel. The world/battle waits on the result.
 */
export function challenge(spec: ChallengeSpec): Promise<ChallengeResult> {
  return new Promise((resolve) => {
    const { item } = spec;
    if (import.meta.env.DEV) (window as any).__challenge = spec; // lets automated tests read the question
    const isNew = isUnseen(item);
    let mode: Mode = spec.mode;
    let helped = false;
    let speechAttempts = 0;
    const blockGame = input.push(() => {}); // swallow game buttons while answering
    // The music makes room: a whisper while answering, silence for listening and speaking (the user's rule).
    const releaseMusic = duck(mode === 'listen' || mode === 'speak' ? DUCK.silent : DUCK.challenge);
    const grade = (answer: string, speech: boolean): CheckResult => {
      const custom = spec.validate?.(answer);
      return custom ? { grade: custom, target: item.es } : check(answer, item.accept, speech);
    };

    const finish = (grade: Grade, answer: string, res?: CheckResult) => {
      stopSpeaking();
      showResult(grade, answer, res);
    };

    const render = () => {
      const p = showPanel();
      const head = el('div', 'ch-head');
      const tag = el('span', 'tag', `${MODE_INFO[mode].icon} ${MODE_INFO[mode].es.toUpperCase()}`);
      head.appendChild(tag);
      if (spec.title) head.appendChild(el('span', '', spec.title));
      if (isNew) head.appendChild(el('span', 'tag new', '¡NUEVO!'));
      p.appendChild(head);

      const prompt = el('div', 'ch-prompt');
      p.appendChild(prompt);
      const label = el('div', 'label');
      prompt.appendChild(label);

      if (mode === 'choose') {
        label.textContent = spec.label ?? '¿Qué significa? · What does it mean?';
        prompt.appendChild(el('div', 'answer-es', item.es));
        p.appendChild(speakButtons(item.es));
        speak(item.es);
        const opts = [item.en, ...distractors(item)].sort(() => Math.random() - 0.5);
        p.appendChild(choiceList(opts, (i) => finish(opts[i] === item.en ? 'perfect' : 'wrong', opts[i])));
        return;
      }

      const helpBtn = button('💡 Ayuda', 'btn ghost');
      const reveal = el('div', 'reveal');
      const allowHelp = spec.allowHelp !== false;
      helpBtn.addEventListener('click', () => {
        helped = true;
        helpBtn.disabled = true;
        if (mode === 'listen' || isNew) {
          reveal.textContent = item.es;
          if (mode !== 'listen') speak(item.es);
        } else {
          reveal.textContent = hintFor(item.es);
        }
      });

      if (mode === 'listen') {
        label.textContent = spec.label ?? 'Escribe lo que oyes · Write what you hear';
        prompt.appendChild(el('div', '', '🎧 …'));
        prompt.appendChild(reveal);
        p.appendChild(speakButtons(item.es));
        setTimeout(() => speak(item.es), 250);
      } else {
        label.textContent =
          spec.label ?? (mode === 'speak' ? 'Dilo en español · Say it in Spanish' : 'Escríbelo en español · Write it in Spanish');
        prompt.appendChild(el('div', 'answer-es', item.en));
        prompt.appendChild(reveal);
      }

      const actions = el('div', 'ch-actions');
      const dontKnow = button('No sé', 'btn ghost', () => finish('wrong', ''));

      if (mode === 'speak') {
        const heard = el('div', 'heard', canListen() ? 'Toca el micrófono y habla' : 'Este navegador no tiene micrófono');
        const mic = button('🎤', 'mic');
        onTap(mic, async () => {
          if (mic.classList.contains('listening')) return;
          mic.classList.add('listening');
          heard.textContent = 'Escuchando…';
          try {
            const alts = await listen((partial) => (heard.textContent = `«${partial}»`)).result;
            mic.classList.remove('listening');
            if (!alts.length) {
              heard.textContent = 'No te oí. ¡Inténtalo otra vez!';
              return;
            }
            speechAttempts++;
            const results = alts.map((a) => ({ a, r: grade(a, true) }));
            const rank = { perfect: 2, close: 1, wrong: 0 } as const;
            results.sort((x, y) => rank[y.r.grade] - rank[x.r.grade]);
            const best = results[0];
            if (best.r.grade === 'wrong' && speechAttempts < 2) {
              heard.textContent = `Oí: «${alts[0]}». ¡Otra vez!`;
              sfx('wrong');
              return;
            }
            finish(helped && best.r.grade === 'perfect' ? 'close' : best.r.grade, best.a, best.r);
          } catch (err) {
            mic.classList.remove('listening');
            const msg = (err as Error).message;
            heard.textContent =
              msg === 'not-allowed' || msg === 'service-not-allowed'
                ? 'Sin permiso para el micrófono. Usa el teclado.'
                : `Error del micrófono (${msg}). Prueba otra vez o usa el teclado.`;
          }
        });
        p.append(mic, heard);
        actions.append(
          dontKnow,
          button('⌨️ Escribir', 'btn', () => {
            mode = 'type';
            render();
          }),
        );
        if (allowHelp) actions.insertBefore(helpBtn, actions.lastChild);
        p.appendChild(actions);
        return;
      }

      // listen / type: text input
      const { row } = inputRow((v) => {
        const r = grade(v, false);
        finish(helped && r.grade === 'perfect' ? 'close' : r.grade, v, r);
      });
      p.append(row);
      actions.appendChild(dontKnow);
      if (allowHelp) actions.appendChild(helpBtn);
      p.appendChild(actions);
    };

    const showResult = (grade: Grade, answer: string, res?: CheckResult) => {
      const p = showPanel();
      sfx(grade === 'perfect' ? 'perfect' : grade === 'close' ? 'right' : 'wrong');
      const box = el('div', `result ${grade}`);
      box.appendChild(
        el('div', '', grade === 'perfect' ? '¡PERFECTO!' : grade === 'close' ? '¡CASI!' : isNew && !answer ? '¡PALABRA NUEVA!' : '¡UY!'),
      );
      if (grade === 'close') {
        const reason = res?.reason ? REASONS[res.reason] : helped ? { es: 'Con ayuda.', en: 'With help.' } : null;
        if (reason) box.appendChild(el('div', 'why', `${reason.es} · ${reason.en}`));
      }
      p.appendChild(box);

      const prompt = el('div', 'ch-prompt');
      const target = res?.target ?? item.es;
      if (mode !== 'choose' && answer && grade !== 'perfect') {
        prompt.appendChild(el('div', 'label', `Tu respuesta: ${answer}`));
      }
      const es = el('div', 'answer-es');
      if (mode !== 'choose' && answer && grade !== 'perfect') {
        for (const seg of diffMarks(answer, target)) {
          es.appendChild(seg.bad ? el('mark', 'diff', seg.text) : document.createTextNode(seg.text));
        }
      } else {
        es.textContent = target;
      }
      prompt.appendChild(es);
      prompt.appendChild(el('div', 'answer-line', item.en));
      p.appendChild(prompt);
      p.appendChild(speakButtons(item.es));
      speak(target);

      const cont = button('Continuar ▶', 'btn primary big', () => done());
      cont.style.marginTop = '12px';
      p.appendChild(cont);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') {
          e.preventDefault();
          done();
        }
      };
      setTimeout(() => window.addEventListener('keydown', onKey), 150);
      let closed = false;
      function done() {
        if (closed) return;
        closed = true;
        window.removeEventListener('keydown', onKey);
        stopSpeaking();
        hidePanel();
        blockGame();
        releaseMusic();
        resolve({ grade, helped, mode, answer });
      }
    };

    render();
  });
}

/** Free text input (e.g. the player's name). */
export function promptText(label: string, en: string, placeholder = ''): Promise<string> {
  return new Promise((resolve) => {
    const { p, close } = openPanel(en, label);
    const { row, inp } = inputRow((v) => {
      close();
      resolve(v);
    });
    inp.placeholder = placeholder;
    p.append(row);
  });
}

/** A comprehension question with answers in Spanish (tap one). */
export function chooseText(label: string, en: string, options: string[], replay?: string): Promise<number> {
  return new Promise((resolve) => {
    const { p, close } = openPanel(en, label);
    if (replay) p.appendChild(speakButtons(replay));
    p.appendChild(
      choiceList(options, (i) => {
        close();
        resolve(i);
      }),
    );
  });
}

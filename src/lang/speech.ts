// Text-to-speech and speech recognition through the browser (Chrome on Android
// has good Latin American voices and recognition).

const PREFERRED_LANGS = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es'];

let voice: SpeechSynthesisVoice | null = null;

export const speechSettings = { rate: 0.95, recognitionLang: 'es-MX' };

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  for (const lang of PREFERRED_LANGS) {
    const exact = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
    const pool = exact.length ? exact : voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (pool.length) {
      // Prefer the higher quality network / Google voices when present.
      voice = pool.find((v) => /google|natural|online/i.test(v.name)) ?? pool[0];
      return;
    }
  }
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

/** Remove things a voice shouldn't read: emoji, quote marks, the "▼" arrow. */
function clean(text: string) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[«»"▼▶]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Speak Spanish. Resolves when done (or after a timeout if the browser never reports). */
export function speak(text: string, slow = false): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  const t = clean(text);
  if (!t) return Promise.resolve();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  if (!voice) pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'es-MX';
  u.rate = slow ? 0.6 : speechSettings.rate;
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1500 + t.length * 120);
    u.onend = u.onerror = () => {
      clearTimeout(timeout);
      resolve();
    };
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// ---------- Recognition ----------

type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function recCtor(): (new () => Rec) | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen() {
  return !!recCtor();
}

export interface ListenHandle {
  /** All alternatives the recognizer heard (best first). Empty if nothing was heard. */
  result: Promise<string[]>;
  stop(): void;
}

/** Listen for one Spanish phrase. `onPartial` receives live text while speaking. */
export function listen(onPartial?: (text: string) => void): ListenHandle {
  const Ctor = recCtor();
  if (!Ctor) return { result: Promise.reject(new Error('unsupported')), stop() {} };
  stopSpeaking();
  const rec = new Ctor();
  rec.lang = speechSettings.recognitionLang;
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;
  let finals: string[] = [];
  let lastPartial = '';
  const result = new Promise<string[]>((resolve, reject) => {
    rec.onresult = (e: any) => {
      const res = e.results[e.results.length - 1];
      if (res.isFinal) {
        finals = Array.from({ length: res.length }, (_, i) => String(res[i].transcript));
      } else {
        lastPartial = String(res[0].transcript);
        onPartial?.(lastPartial);
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      reject(new Error(e.error || 'error'));
    };
    rec.onend = () => resolve(finals.length ? finals : lastPartial ? [lastPartial] : []);
  });
  try {
    rec.start();
  } catch (err) {
    return { result: Promise.reject(err), stop() {} };
  }
  return { result, stop: () => rec.stop() };
}

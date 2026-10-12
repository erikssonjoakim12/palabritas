import { digitsToWords } from './numbers';

export type Grade = 'perfect' | 'close' | 'wrong';

export interface CheckResult {
  grade: Grade;
  /** Why it was only "close". */
  reason?: 'acentos' | 'articulo' | 'typo';
  /** The accepted answer that matched best (for showing the correction). */
  target: string;
}

export const REASONS: Record<NonNullable<CheckResult['reason']>, { es: string; en: string }> = {
  acentos: { es: 'Ojo con los acentos.', en: 'Watch the accents.' },
  articulo: { es: 'Falta el artículo.', en: 'The article (el/la/…) is missing.' },
  typo: { es: 'Casi: un pequeño error.', en: 'Almost: a small mistake.' },
};

/** Lowercase, unify quotes, drop punctuation, collapse spaces. Keeps accents. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[¿?¡!.,;:"«»()…\-–—']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** normalize() and also strip accents/tildes: "está" → "esta", "niño" → "nino". */
export function loose(s: string): string {
  return normalize(s).normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

const ARTICLE = /^(el|la|los|las|un|una|unos|unas) /;

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function typoAllowance(len: number, speech: boolean) {
  const base = len <= 4 ? 0 : len <= 10 ? 1 : len <= 24 ? 2 : 3;
  return base + (speech && len > 4 ? 1 : 0);
}

/** Answer variants: speech engines write "1" for un/una/uno. */
function answerVariants(answer: string): string[] {
  const out = [normalize(digitsToWords(answer))];
  if (/\b1\b/.test(answer)) {
    for (const w of ['un', 'una']) out.push(normalize(digitsToWords(answer.replace(/\b1\b/g, w))));
  }
  return out;
}

/**
 * Grade an answer against accepted Spanish answers.
 * Perfect needs accents too (except for speech, where the recognizer picks the spelling).
 */
export function check(answer: string, accepted: string[], speech = false): CheckResult {
  const answers = answerVariants(answer).filter(Boolean);
  if (!answers.length) return { grade: 'wrong', target: accepted[0] };

  for (const t of accepted) {
    const nt = normalize(t);
    if (answers.includes(nt)) return { grade: 'perfect', target: t };
  }
  for (const t of accepted) {
    const lt = loose(t);
    if (answers.some((a) => loose(a) === lt)) {
      return speech ? { grade: 'perfect', target: t } : { grade: 'close', reason: 'acentos', target: t };
    }
  }
  for (const t of accepted) {
    const nt = normalize(t);
    if (!ARTICLE.test(nt)) continue;
    const stripped = loose(nt.replace(ARTICLE, ''));
    if (answers.some((a) => loose(a) === stripped)) return { grade: 'close', reason: 'articulo', target: t };
  }
  let best = { d: Infinity, t: accepted[0] };
  for (const t of accepted) {
    const lt = loose(t);
    for (const a of answers) {
      const d = levenshtein(loose(a), lt);
      if (d < best.d) best = { d, t };
    }
  }
  if (best.d <= typoAllowance(loose(best.t).length, speech)) {
    return { grade: 'close', reason: 'typo', target: best.t };
  }
  return { grade: 'wrong', target: accepted[0] };
}

/**
 * Mark which letters of `target` the answer got wrong (accents included), for showing the
 * correction. Returns HTML-safe segments.
 */
export function diffMarks(answer: string, target: string): { text: string; bad: boolean }[] {
  const a = normalize(digitsToWords(answer));
  const segs: { text: string; bad: boolean }[] = [];
  let ai = 0;
  for (const ch of target.normalize('NFC')) {
    const low = ch.toLowerCase();
    const isWordChar = /[\p{L}\p{N}]/u.test(ch);
    let bad = false;
    if (isWordChar) {
      while (ai < a.length && a[ai] === ' ') ai++;
      bad = a[ai] !== low;
      ai++;
    }
    const last = segs[segs.length - 1];
    if (last && last.bad === bad) last.text += ch;
    else segs.push({ text: ch, bad });
  }
  return segs;
}

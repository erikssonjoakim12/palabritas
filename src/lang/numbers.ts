// Speech recognition often writes numbers as digits ("3 perros"), so we turn digits
// back into Spanish words before comparing answers.

const UNITS = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
  'veintisiete', 'veintiocho', 'veintinueve',
];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

export function numToSpanish(n: number): string {
  if (n < 30) return UNITS[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t];
  }
  if (n === 100) return 'cien';
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${HUNDREDS[h]} ${numToSpanish(rest)}` : HUNDREDS[h];
  }
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    const head = th === 1 ? 'mil' : `${numToSpanish(th)} mil`;
    return rest ? `${head} ${numToSpanish(rest)}` : head;
  }
  return String(n);
}

/** "son las 3:30" → "son las tres y media", "5 conejos" → "cinco conejos". */
export function digitsToWords(text: string): string {
  return text
    .replace(/(\d{1,2}):(\d{2})/g, (_, h: string, m: string) => {
      const mins = parseInt(m, 10);
      const hour = numToSpanish(parseInt(h, 10));
      if (mins === 0) return hour;
      if (mins === 30) return `${hour} y media`;
      if (mins === 15) return `${hour} y cuarto`;
      return `${hour} y ${numToSpanish(mins)}`;
    })
    .replace(/\d+/g, (d) => numToSpanish(parseInt(d, 10)));
}

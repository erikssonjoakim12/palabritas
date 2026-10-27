export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** A stable 32-bit hash of a string (FNV-1a). */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** A shuffled copy (Fisher-Yates: every order equally likely). */
export function shuffled<T>(arr: T[], rand = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The same "random" order every time for the same seed. */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let a = hash(seed);
  // mulberry32
  return shuffled(arr, () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
}

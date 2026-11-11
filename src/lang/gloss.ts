import { G } from '../game/state';

/*
  The translation the game helps with (plans/swedish.md): English, or Swedish. The Spanish never changes.

  The Swedish lives in src/data/sv/, keyed by the Spanish it translates (or, for text with no Spanish, like the FAQ,
  by the English). It's a chunk of its own, loaded only when Swedish is chosen. A line with no Swedish yet shows its
  English. Lines built while playing (a Palabrita's name in them) can't be looked up by their text: they carry their
  Swedish inline (`sv`). `node tools/sv.mjs` lists what's missing.
*/

export type Gloss = 'en' | 'sv';

let SV: Record<string, string> | null = null;

export const swedish = () => G.save.settings.gloss === 'sv';

/** Load the Swedish if it's chosen (call after loading a save or changing the setting), or `always`. */
export async function loadGloss(always = false) {
  if ((always || swedish()) && !SV) SV = (await import('../data/sv')).SV;
}

/**
 * For text in English only, before a game is loaded (the FAQ on the title screen): Swedish if the game or the phone
 * is in Swedish. Keyed by the English.
 */
export async function titleGloss(): Promise<(en: string) => string> {
  if (!swedish() && !phoneIsSwedish()) return (en) => en;
  await loadGloss(true);
  return (en) => SV?.[en] ?? en;
}

/** The translation of a line: its Swedish when Swedish is chosen and there is one, else its English. */
export function gloss(es: string, en: string, sv?: string): string {
  if (!swedish()) return en;
  return sv ?? SV?.[es] ?? en;
}

/** A label that holds its own translation ('¿Qué significa? · What does it mean?'), keyed by itself. */
export const glossLabel = (label: string, sv?: string) => gloss(label, label, sv);

/** The button that shows the translation: EN or SV. */
export const glossButton = () => (swedish() ? 'SV' : 'EN');

/** Is the phone set to Swedish? Then a new game starts with Swedish selected (the choice is kept after that). */
export const phoneIsSwedish = () => (navigator.languages ?? [navigator.language]).some((l) => /^sv\b/i.test(l));

export const GLOSS_NAMES: Record<Gloss, string> = { en: 'English', sv: 'Svenska' };

/** The translation of anything with Spanish and English: a word, a sign, a Palabridex entry. */
export const meaning = (x: { es: string; en: string }) => gloss(x.es, x.en);

/** Does this line show in Swedish now? (While the translation is incomplete, some still show English.) */
export const inSwedish = (es: string) => swedish() && !!SV?.[es];

/** The translation of something with a Spanish name and English: a theme, an item. */
export const named = (x: { name: string; en: string }) => gloss(x.name, x.en);

/** Text with no Spanish, in the player's own language (Sam explaining the game): keyed by its English. */
export const native = (en: string) => gloss(en, en);

/*
  The Swedish (src/lang/gloss.ts), keyed by the Spanish it translates. One file per source: ui.ts (menus, battles,
  items, the Palabridex, the FAQ), one per region's dialogue (region1.ts...), and one per word list (words/core.ts...).
  Each file's default export is a record of Spanish → Swedish. This module is loaded only when Swedish is chosen.
*/
const files = import.meta.glob<Record<string, string>>(['./*.ts', './words/*.ts', '!./index.ts'], { eager: true, import: 'default' });

export const SV: Record<string, string> = Object.assign({}, ...Object.values(files));

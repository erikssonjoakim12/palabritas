/*
  EVERY COLOR IN THE GAME WORLD LIVES HERE.

  These are Pokémon Gold/Silver's daytime palettes as they look on a real Game Boy Color
  screen (softer and less saturated than the raw palette numbers), sampled from screenshots.
  Change a value here and every tile, sprite and creature that uses it changes with it.

  A "palette" is 4 colors, like on the real hardware:
    index 0 = lightest, 1 = light, 2 = dark, 3 = outline
  The pixel art in tiles.ts / people.ts uses the digits 0-3 to pick from its palette.
*/

export type Pal = [string, string, string, string];

/** Outline color for the world (the GBC "black" is a soft dark grey). */
export const INK = '#383838';

// ---------- Outdoors (day) ----------
export const OUTDOOR = {
  /** Town and path ground: pale, with grey dots. */
  town: ['#e8f0e0', '#a8b0a0', '#788070', INK] as Pal,
  /** Grass, trees, tall grass. */
  grass: ['#b8e080', '#70a038', '#386018', INK] as Pal,
  water: ['#d8e0f8', '#a0a8f0', '#7078e0', INK] as Pal,
  flower: ['#b8e080', '#f0a8b8', '#d05058', '#70a038'] as Pal,
  /** House walls: cream with a brown dotted pattern and brown edges. */
  wall: ['#e8f0e0', '#b09080', '#b08870', INK] as Pal,
  sign: ['#e8f0e8', '#b0b0a8', '#787870', INK] as Pal,
  fence: ['#e8f0e0', '#c09878', '#906848', INK] as Pal,
  /** Mountains and cliffs. */
  rock: ['#f0e0b8', '#d0b078', '#987040', INK] as Pal,
  /** Rocky ground in the mountains. */
  dirt: ['#f8f0d0', '#e8d8a8', '#b8a070', INK] as Pal,
};

/** Tree leaves (a light, b mid, c shade) and trunks (k, K): green and dry-season trees. */
const TRUNK = { k: '#a07048', K: '#684028' };
export const TREES = {
  green: { a: '#a8d868', b: '#68a030', c: '#3a6820', ...TRUNK },
  dry: { a: '#f0d890', b: '#c8a050', c: '#886828', ...TRUNK },
  palm: { a: '#b0e070', b: '#58a030', c: '#306818', k: '#d0a868', K: '#987040', n: '#7a5028' },
};

// ---------- Caves ----------

export const CAVE = {
  wall: ['#c8a880', '#987050', '#604028', INK] as Pal,
  floor: ['#e8d8b8', '#d0b890', '#988060', INK] as Pal,
  /** Darkness in the cave mouth, and daylight at the way out. */
  dark: '#201810',
  daylight: '#f8f8e8',
};

/** Accent colors used by individual tiles (letters in tiles.ts). */
export const ACCENT = {
  windowYellow: '#e8d090',
  doorFrame: '#e8c070',
  doorTop: '#d07050',
  doorBrown: '#a07050',
  lemon: '#f0e060',
  centroRed: '#d05058',
  gymPurple: '#7858b0',
  breadCrust: '#c07838',
  breadLight: '#e8b860',
  martBlue: '#3858c0',
};

/** Roof colors: [highlight, light, dark, outline]. Each town picks one (see maps.ts). */
export const ROOFS: Record<string, Pal> = {
  green: ['#d8f0c8', '#b8d898', '#789858', INK],
  yellow: ['#f8f0c8', '#e8d888', '#b89848', INK],
  blue: ['#d8e8f8', '#a8c8f0', '#6888c8', INK],
  red: ['#f8d8d0', '#e8a8a0', '#c06058', INK],
  purple: ['#e8d8f8', '#c8a8e8', '#8868b8', INK],
  brown: ['#f0e0c8', '#c8a080', '#906848', INK],
};

// ---------- Indoors ----------
export const INDOOR = {
  wood: ['#d8c898', '#a89050', '#706030', INK] as Pal,
  red: ['#f0e8e0', '#f0b0b8', '#d05058', INK] as Pal,
  gray: ['#f0e8e0', '#c8c8c0', '#909088', INK] as Pal,
  green: ['#d8c898', '#88b048', '#507028', INK] as Pal,
  blue: ['#f0e8e0', '#a0a8f0', '#6870d8', INK] as Pal,
  books: ['#d05058', '#6870d8', '#70a038', INK] as Pal,
};

// ---------- Overworld people & objects ----------
// Like on the GBC, sprites have 3 colors plus transparent: skin, one clothing color, ink.
export const SKIN = '#e8a890';
export const SPRITE_INK = '#181818';
export const CLOTHES: Record<string, string> = {
  red: '#c84048',
  blue: '#5860c8',
  green: '#48a040',
  brown: '#906048',
  pink: '#d86878',
  gray: '#8c8c8c',
  purple: '#8860c0',
  teal: '#3898a0',
  white: '#f0f0e8',
  navy: '#384080',
  orange: '#e08038',
  khaki: '#b8a060',
  yellow: '#e0c040',
};

export const OBJECT_PALS: Record<string, Pal> = {
  palabola: ['', '#f0f0e8', '#38a8a0', SPRITE_INK],
  michi: ['', '#f0f0e8', '#e09848', SPRITE_INK],
  armchair: ['', '#f0b0b8', '#d05058', SPRITE_INK],
  maquina: ['', '#e8e8e0', '#a0a0a8', SPRITE_INK],
};

/** Palabola colors in the healing machine (normal, flash). */
export const HEAL_BALL = ['#38a8a0', '#f0f0e8'];

/**
 * The master palette for new art (Palabritas, trainers): color families, each dark → light,
 * so every family has ready-made shading steps. A sprite picks about 8-16 of these.
 * Shown on the art page; art-src/palette.png and palette.txt are made from it for ChatGPT.
 */
export const PALETTE: Record<string, string[]> = {
  neutral: ['#101410', '#3a3a42', '#6e6e78', '#a8a8b0', '#d8d8dc', '#f8f8f8'],
  skin: ['#8c4a32', '#c87858', '#e8a890', '#f8d8c0'],
  brown: ['#4a2a14', '#6c3717', '#945a2c', '#c89058'],
  red: ['#6a1820', '#a83038', '#d85058', '#f09090'],
  orange: ['#7a3410', '#c0601c', '#f09030', '#f8c070'],
  yellow: ['#7a6010', '#c0a020', '#f0d040', '#f8f0a0'],
  green: ['#1c3a18', '#2f5928', '#518436', '#84b14e', '#d9ec8d'],
  teal: ['#104848', '#287878', '#38a8a0', '#a0e0d0'],
  blue: ['#182860', '#2f58b0', '#5aa8f0', '#b8e0f8'],
  purple: ['#381858', '#6040a0', '#9070d0', '#c8b0f0'],
  pink: ['#702848', '#b04878', '#e880a8', '#f8c8d8'],
};

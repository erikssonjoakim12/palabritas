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
  /** Black volcanic rock (style rock: 'basalt'). */
  basalt: ['#b0a8a8', '#706870', '#403840', INK] as Pal,
  /** Warm ochre adobe walls (style walls: 'adobe'). */
  adobe: ['#f0d8b0', '#c89868', '#a06838', INK] as Pal,
  /** Beach sand (ground: 'sand'). */
  sand: ['#f8f0d0', '#f0e0b0', '#d8c088', INK] as Pal,
  /** The fountain's stone (and its water, as extra colors in tiles.ts). */
  stone: ['#f0f0e8', '#c8c8c0', '#909088', INK] as Pal,
  /** Dry tall grass (zacate) and dune grass. */
  dryGrass: ['#f0e8a8', '#d8b860', '#9a7830', INK] as Pal,
  /** Cactus: the lit side, the green, the spines. */
  cactus: ['#f8f0d0', '#88c858', '#3a7a30', INK] as Pal,
  /** The lighthouse: white and red stripes. */
  lighthouse: ['#f8f8f0', '#d05050', '#a8a8b0', INK] as Pal,
  /** Rocky ground in the mountains. */
  dirt: ['#f8f0d0', '#e8d8a8', '#b8a070', INK] as Pal,
  /** Volcanic ash on the volcano's slopes and the crater rim. */
  ash: ['#d8d4d0', '#b0a8a8', '#787070', INK] as Pal,
  /** Lava: glow, flow, crust (and a dark crust as an extra color in tiles.ts). */
  lava: ['#f8e070', '#f09030', '#c04818', INK] as Pal,
  /** Steam from a vent. */
  steam: ['#ffffff', '#d0d0d8', '#504848', INK] as Pal,
  /** Sugarcane: the light leaves, the stalks, the shade. */
  cane: ['#d0f098', '#6ab048', '#2e6a28', INK] as Pal,
  /** The old temple's stone (Villa Jaguar's pyramid), gray with a green cast. */
  temple: ['#d8d8c0', '#a0a088', '#686c58', INK] as Pal,
  /** Cobblestones in Ciudad Chispa's plaza. */
  cobble: ['#e8e4d8', '#d0c8b8', '#b0a898', INK] as Pal,
};

/** Tree leaves (a light, b mid, c shade) and trunks (k, K): green and dry-season trees. */
const TRUNK = { k: '#a07048', K: '#684028' };
export const TREES = {
  green: { a: '#a8d868', b: '#68a030', c: '#3a6820', ...TRUNK },
  dry: { a: '#f0d890', b: '#c8a050', c: '#886828', ...TRUNK },
  palm: { a: '#b0e070', b: '#58a030', c: '#306818', k: '#d0a868', K: '#987040', n: '#7a5028' },
  /** Rainforest: deeper, bluer greens. */
  jungle: { a: '#78c060', b: '#348838', c: '#1c5028', ...TRUNK },
};

/** Under the jungle's canopy (style canopy): every tile is multiplied by this, so it's visibly darker. */
export const CANOPY = '#8ca890';

/** The town map (START → MAPA): simple, like the original games'. */
export const TOWN_MAP = {
  /** Beyond the known world. */
  beyond: '#283850',
  land: OUTDOOR.grass[1],
  water: OUTDOOR.water[2],
  /** The routes' lines. */
  path: OUTDOOR.town[0],
  town: '#c05048',
  /** You (blinking), and the box around the place picked. */
  you: '#f8f8f8',
  cursor: '#f8d048',
};

// ---------- Caves ----------

/** Cave looks by map style (style cave: 'clay' | 'basalt'); the default is CAVE's wall and floor. */
export const CAVE_STYLES: Record<string, { wall: Pal; floor: Pal }> = {
  clay: { wall: ['#d08860', '#a05838', '#683020', INK], floor: ['#e8c0a0', '#d0a080', '#a07050', INK] },
  basalt: { wall: ['#888088', '#585058', '#302830', INK], floor: ['#b0a8a0', '#908880', '#605850', INK] },
  /** Inside the Templo del Jaguar: carved blocks and flagstones. */
  temple: { wall: ['#d8d8c0', '#a0a088', '#686c58', INK], floor: ['#c8c8b0', '#a8a890', '#7c8068', INK] },
};

export const CAVE = {
  wall: ['#c8a880', '#987050', '#604028', INK] as Pal,
  floor: ['#e8d8b8', '#d0b890', '#988060', INK] as Pal,
  /** Darkness in the cave mouth, and daylight at the way out. */
  dark: '#201810',
  daylight: '#f8f8e8',
};

/** Night scenes: the dark blue laid over the world (a soft circle of light stays around you). */
export const NIGHT = 'rgba(16, 24, 64, 0.56)';
export const NIGHT_CLEAR = 'rgba(16, 24, 64, 0)';

/**
 * The day outdoors, by the clock (art/lights.ts skyAt): the world is multiplied by the tint, like Gold/Silver's
 * evening and night palettes, and windows shine by `light`. The colors fade from one hour to the next:
 * day until 17, golden at 18, night from 19, morning back by 7. Lighter than night scenes (no light around you).
 */
export const DAY_CYCLE: { h: number; tint: string; light: number }[] = [
  { h: 6, tint: '#7080c8', light: 1 },
  { h: 7, tint: '#ffffff', light: 0 },
  { h: 17, tint: '#ffffff', light: 0 },
  { h: 18, tint: '#f8b890', light: 0.3 },
  { h: 19, tint: '#7080c8', light: 1 },
];

/** Festival fireworks (art/fireworks.ts). */
export const FIREWORK_COLORS = ['#f85858', '#f8d048', '#58c8f8', '#78e068', '#e878f0', '#f8f8f8'];

/** Warm light from windows and lamps at night (art/lights.ts), added over the dark. */
export const NIGHT_LIGHT = {
  core: 'rgba(132, 104, 44, 1)',
  glow: 'rgba(104, 76, 28, 0.6)',
  clear: 'rgba(90, 66, 24, 0)',
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
  stallRed: '#d05058',
  stallWhite: '#f8f8f0',
  clayPot: '#c87048',
  railLight: '#c8c8d0',
  railDark: '#686878',
  sleeper: '#986840',
  sleeperDark: '#684020',
  lamp: '#f8e070',
  foam: '#f8f8ff',
};

/** Roof colors: [highlight, light, dark, outline]. Each town picks one (see world/maps/). */
export const ROOFS: Record<string, Pal> = {
  clay: ['#f8d8c0', '#e09870', '#b05838', INK],
  green: ['#d8f0c8', '#b8d898', '#789858', INK],
  yellow: ['#f8f0c8', '#e8d888', '#b89848', INK],
  blue: ['#d8e8f8', '#a8c8f0', '#6888c8', INK],
  red: ['#f8d8d0', '#e8a8a0', '#c06058', INK],
  purple: ['#e8d8f8', '#c8a8e8', '#8868b8', INK],
  brown: ['#f0e0c8', '#c8a080', '#906848', INK],
  /** The church in Ciudad Chispa (roof tile 'q'). */
  cream: ['#fff8e8', '#f0e0c0', '#c8b088', INK],
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
  /** Equipo Silencio. */
  black: '#383848',
};

export const OBJECT_PALS: Record<string, Pal> = {
  palabola: ['', '#f0f0e8', '#38a8a0', SPRITE_INK],
  michi: ['', '#f0f0e8', '#e09848', SPRITE_INK],
  armchair: ['', '#f0b0b8', '#d05058', SPRITE_INK],
  maquina: ['', '#e8e8e0', '#a0a0a8', SPRITE_INK],
  carreta: ['', '#d8a868', '#906048', SPRITE_INK],
  palanca: ['', '#c8c8d0', '#d04048', SPRITE_INK],
  compuerta: ['', '#c89058', '#7a4a24', SPRITE_INK],
  silenciador: ['', '#d0d0d8', '#686878', SPRITE_INK],
  puertaPiedra: ['', '#d8d0c0', '#908878', SPRITE_INK],
  palabra: ['', '#f8f8d0', '#e0a830', SPRITE_INK],
  nota: ['', '#f8f8f0', '#b8b0a0', SPRITE_INK],
  buey: ['', '#f0e8d8', '#a07858', SPRITE_INK],
  paredRota: ['', '#c8a880', '#987050', SPRITE_INK],
  panga: ['', '#e8c890', '#a06838', SPRITE_INK],
  botella: ['', '#f8f0d8', '#58a878', SPRITE_INK],
  nido: ['', '#f8f8f0', '#e0c898', SPRITE_INK],
  tortuguita: ['', '#a8d880', '#4a8a48', SPRITE_INK],
  brillo: ['', '#f8f8f8', '#f8d850', SPRITE_INK],
  tienda: ['', '#f0c078', '#c06030', SPRITE_INK],
  ecolinSombrero: ['', '#48a040', '#7a6090', SPRITE_INK],
  // Region 4.
  vaca: ['', '#f8f8f0', '#685048', SPRITE_INK],
  cajaCohetes: ['', '#d8a868', '#d04840', SPRITE_INK],
  chocoyitoBebe: ['', '#a8e078', '#e88838', SPRITE_INK],
  antorchaRoja: ['', '#f8d058', '#d04040', SPRITE_INK],
  antorchaAzul: ['', '#a8d8f8', '#4868d0', SPRITE_INK],
  antorchaVerde: ['', '#c8f088', '#40a040', SPRITE_INK],
  antorchaAmarilla: ['', '#f8f0a8', '#e0b020', SPRITE_INK],
  puertaTaller: ['', '#c89058', '#7a4a24', SPRITE_INK],
  lampara: ['', '#a8c8f8', '#c8a040', SPRITE_INK],
  perezosito: ['', '#c8a880', '#d84848', SPRITE_INK],
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

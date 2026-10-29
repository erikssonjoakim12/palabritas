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

/** The evolution scene: the outline the Palabrita flashes in while it changes. */
export const EVOLUTION_OUTLINE = '#383848';

/** Fireflies at night where wild Chispitas live: the glow, and the halo around it. */
export const FIREFLY = { glow: '#f8f070', halo: 'rgba(248, 240, 112, 0.35)' };

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
  fire: '#f07830',
  fireGlow: '#f8d848',
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
  /** The wood stove's clay and bricks. */
  clay: ['#f0c8a0', '#d08858', '#985030', INK] as Pal,
};
/** The hammock's stripes (Masaya hammocks): red, yellow, green, blue. */
export const HAMMOCK = { r: '#d05058', y: '#f0c040', g: '#58a048', b: '#5870d0' };

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
  /** The shell fossil: a highlight (0), old bone (1), the seams between its plates (2). */
  fosil: ['#f8f4e8', '#e0d8c8', '#8c7c68', SPRITE_INK],
  // The museum (Villa Ocote): carved stone, old pottery (cream, terracotta, dark red), dried mud, a map.
  petroglifo: ['#e8e4d8', '#b8b0a0', '#787060', SPRITE_INK],
  ceramica: ['#f0e0c0', '#d07848', '#8a4028', SPRITE_INK],
  huellas: ['#c8b8a0', '#988870', '#5c5040', SPRITE_INK],
  /** A star (0) on Nicaragua, the sea, the land. */
  mapa: ['#f8e050', '#a8c8e8', '#78a858', SPRITE_INK],
  // The Templo del Jaguar: the black jaguars (green eyes, fur, rosettes) and the stone the mother becomes.
  jaguar: ['#90e868', '#3c3a4c', '#5a5670', SPRITE_INK],
  jaguarPiedra: ['#c8c8b0', '#888874', '#585c4c', SPRITE_INK],
  michi: ['', '#f0f0e8', '#e09848', SPRITE_INK],
  armchair: ['', '#f0b0b8', '#d05058', SPRITE_INK],
  /** The armchair with Cojincito on it: a cream cushion (0) on the seat. */
  armchairCojin: ['#f8f0d8', '#f0b0b8', '#d05058', SPRITE_INK],
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

/**
 * Placeholder Palabrita drawings (art/creatures.ts DRAW), until the user's art: the black jaguar (Rugidito,
 * Rugidón): fur, its shade, the faint rosettes, the muzzle, green eyes, the leaf markings.
 */
export const VIPER = { green: '#80c848', dark: '#3a7a28', gold: '#f0d048', goldDark: '#b89020', lash: '#f8e870', tongue: '#d84040' };
export const TREEFROG = { green: '#58c040', dark: '#2e7a28', belly: '#f0f0d0', eye: '#e83030', foot: '#f08830', flank: '#4868d0' };
export const DARTFROG = { blue: '#3c80e8', light: '#88b8f8', dark: '#1c3c90' };
export const JAGUAR = { fur: '#3c3a4c', shade: '#28263a', rosette: '#5a5670', muzzle: '#6a6478', nose: '#a07888', eye: '#90e868', leaf: '#58a848', leafDark: '#2e6a30' };

/** Palabolas drawn as little patterns (art/balls.ts): teal top and white bottom, gray once fainted, the healing machine's flash, an empty slot. */
export const BALL = { top: '#38a8a0', bottom: '#f0f0e8', faintedTop: '#8c8c8c', faintedBottom: '#c8c8c0', flash: '#f8f8b0', empty: '#c8c8c0' };

/** The «!» over someone's head (a trainer who spots you, or wants a rematch): k frame, w paper, r the mark. */
export const MARK = { k: '#202028', w: '#ffffff', r: '#d83838' };

/** Black: outside the maps, fades, the flash as a battle starts; and a hopping sprite's shadow. */
export const BLACK = '#000000';
export const SHADOW = 'rgba(0, 0, 0, 0.25)';

// ---------- Battles and screens ----------

/** The battle screen's background, and the ground under each Palabrita. */
export const BATTLE = { bg: '#f8f8f8', ground: '#d8d8c4' };

/** The title screen: the sky, the haze on the horizon, the grass and its edge. */
export const TITLE = { sky: '#5ab0f0', haze: '#88c8f8', grass: '#7ec860', edge: '#5aa04a' };

/** Battle portraits (art/portraits.ts): ink, white, dark and gray hair, the mouth; the lab coat; a caver's headlamp. */
export const PORTRAIT = {
  ink: '#1a1a26',
  white: '#ffffff',
  hair: '#2a2430',
  grayHair: '#a8a8b4',
  mouth: '#c05048',
  coatShade: '#d8d8e0',
  coatShirt: '#4858a8',
  coatSeam: '#b8b8c8',
  lamp: '#f0f0d0',
  lampGlow: '#f8f8a0',
};

/** Each type's color (the chips on a Palabrita's page, the type icons), and the chip's text. */
export const TYPE_COLORS = {
  Normal: '#a8a878', Fuego: '#f08030', Agua: '#6890f0', Eléctrico: '#f8d030', Planta: '#78c850',
  Hielo: '#98d8d8', Lucha: '#c03028', Veneno: '#a040a0', Tierra: '#e0c068', Volador: '#a890f0',
  Psíquico: '#f85888', Bicho: '#a8b820', Roca: '#b8a038', Fantasma: '#705898', Dragón: '#7038f8',
  Siniestro: '#705848', Acero: '#b8b8d0',
};
export const TYPE_TEXT = '#ffffff';

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

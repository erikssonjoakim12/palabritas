import { OUTDOOR, INDOOR, ACCENT, type Pal } from './colors';

/*
  TILE ART (16x16 "metatiles", like Gold/Silver's 2x2 blocks of 8x8 tiles).

  How to read a design:
    - Each string is one row of 16 pixels.
    - Digits 0-3 pick a color from the tile's palette (0 = lightest ... 3 = outline).
    - '.' is transparent: the tile drawn underneath shows through.
    - Letters are extra colors, defined in the tile's `extra` map.

  To restyle the game, edit these rows or the palettes in colors.ts.
  Roofs, walls, tables etc. get automatic edges (outlines where the neighbor differs);
  that logic lives in art/tiles.ts.
*/

export interface TileArt {
  rows: string[];
  pal: Pal | 'roof';
  extra?: Record<string, string>;
}

/** Repeat an 8x8 pattern into 16x16. */
const tile8 = (rows8: string[]) => [...rows8, ...rows8].map((r) => r + r);

/** Put `ch` at the given [row, col] spots (only where `onlyOn` is). */
const accents = (rows: string[], spots: [number, number][], ch: string, onlyOn = '2') =>
  rows.map((r, y) =>
    [...r].map((c, x) => (spots.some(([sy, sx]) => sy === y && sx === x) && c === onlyOn ? ch : c)).join(''),
  );

/** Grass: fine checker dither with clear diamonds and a dark dot in each. */
const grassRows = [
  '1010101010101010',
  '0101010101010101',
  '1010001010100010',
  '0102000101020001',
  '1000001010000010',
  '0100010101000101',
  '1010101010101010',
  '0101010101010101',
  '1010101010101010',
  '0101010101010101',
  '1010001010100010',
  '0102000101020001',
  '1000001010000010',
  '0100010101000101',
  '1010101010101010',
  '0101010101010101',
];

/** Johto pine: jagged tiers, lit from the left; the corners show grass so rows interlock. */
const treeRows = [
  '1010101330101010',
  '0101013223010101',
  '1010032222300010',
  '0102321222330001',
  '1003223232323010',
  '0100301112330101',
  '1031211222232310',
  '0312112222223231',
  '1322123232323230',
  '0130122112223301',
  '1321211221222330',
  '3212112222223233',
  '3222323232323233',
  '3223222322233333',
  '1032223222333310',
  '0101332223330101',
];

export const ART: Record<string, TileArt> = {
  // ---------- Outdoors ----------
  /** Pale ground with grey dots: towns and paths. */
  townGround: {
    pal: OUTDOOR.town,
    rows: tile8(['00000000', '00100000', '00000010', '00000100', '10000000', '00001000', '00000000', '01000010']),
  },
  grassGround: { pal: OUTDOOR.grass, rows: grassRows },
  /**
   * Ledges: grass with a lip you can hop down but not climb (like Gold/Silver).
   * ledgeRight: the high side is on the left, you hop east. ledgeDown: you hop south.
   */
  ledgeRight: { pal: OUTDOOR.grass, rows: grassRows.map((r, y) => r.slice(0, 10) + (y % 4 === 1 ? '00' : '01') + '1232') },
  ledgeDown: {
    pal: OUTDOOR.grass,
    rows: grassRows.map((r, y) => (y === 10 ? '0000000000000000' : y === 11 ? '1101111011011110' : y === 12 ? '2222222222222222' : y === 13 ? '3333333333333333' : r)),
  },
  /** Tall grass: a "V" tuft every 8 pixels. */
  tallGrass: {
    pal: OUTDOOR.grass,
    rows: tile8(['00000000', '02000200', '21202120', '21121120', '02111200', '10222010', '01000100', '00000000']),
  },
  tree: { pal: OUTDOOR.grass, rows: treeRows },
  lemonTree: {
    pal: OUTDOOR.grass,
    extra: { y: ACCENT.lemon },
    rows: accents(treeRows, [[3, 8], [7, 6], [7, 10], [10, 9], [12, 4], [13, 9]], 'y'),
  },
  water: {
    pal: OUTDOOR.water,
    rows: tile8(['22222222', '20222222', '22222222', '22222122', '22222222', '22222222', '21222222', '22222202']),
  },
  flowers: {
    pal: OUTDOOR.flower,
    rows: tile8(['00000000', '00220000', '02112000', '02112000', '00223000', '00033000', '00000000', '00000000']),
  },
  fence: {
    pal: OUTDOOR.fence,
    rows: [
      '................',
      '................',
      '..333......333..',
      '..313......313..',
      '3331333333331333',
      '1111111111111111',
      '2222222222222222',
      '3331333333331333',
      '..313......313..',
      '..313......313..',
      '3331333333331333',
      '1111111111111111',
      '2222222222222222',
      '3331333333331333',
      '..323......323..',
      '..333......333..',
    ],
  },
  sign: {
    pal: OUTDOOR.sign,
    rows: [
      '................',
      '.33333333333333.',
      '.31111111111113.',
      '.30000000000003.',
      '.30330330333003.',
      '.30000000000003.',
      '.31111111111113.',
      '.30000000000003.',
      '.31111111111113.',
      '.33333333333333.',
      '.32..........23.',
      '.32..........23.',
      '.32..........23.',
      '.33..........33.',
      '................',
      '................',
    ],
  },
  /** Roof stripes; the edges are added automatically. Color comes from the town. */
  roof: { pal: 'roof', rows: Array(16).fill('1112111211121112') },
  /** Cream wall with a brown dotted zigzag; edges added automatically. */
  wall: {
    pal: OUTDOOR.wall,
    rows: tile8(['10101010', '00000000', '10000010', '01000100', '00101000', '00010000', '00000000', '00000000']),
  },
  /** Drawn on top of a wall ('.' keeps the wall). */
  windowOverlay: {
    pal: OUTDOOR.wall,
    extra: { y: ACCENT.windowYellow },
    rows: [
      '................',
      '................',
      '................',
      '.3333333333333..',
      '.30y0y030y0y03..',
      '.30y0y030y0y03..',
      '.30y0y030y0y03..',
      '.30y0y030y0y03..',
      '.3333333333333..',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  doorOverlay: {
    pal: OUTDOOR.wall,
    extra: { y: ACCENT.doorFrame, o: ACCENT.doorTop, b: ACCENT.doorBrown },
    rows: [
      '................',
      '..yyyyyyyyyyyy..',
      '..y3333333333y..',
      '..y3oooooooo3y..',
      '..y3000000003y..',
      '..y3000000003y..',
      '..y3000000003y..',
      '..y3333333333y..',
      '..y3bbbbbbbb3y..',
      '..y3bbbbbbbb3y..',
      '..y3bbbbbbbb3y..',
      '..y3bbbbbbbb3y..',
      '..y3bbbbbbbb3y..',
      '..33bbbbbbbb33..',
      '..33bbbbbbbb33..',
      '..333333333333..',
    ],
  },
  centroSignOverlay: {
    pal: OUTDOOR.wall,
    extra: { r: ACCENT.centroRed },
    rows: [
      '................',
      '................',
      '.....333333.....',
      '....30000003....',
      '...3000rr0003...',
      '...3000rr0003...',
      '...30rrrrrr03...',
      '...30rrrrrr03...',
      '...3000rr0003...',
      '...3000rr0003...',
      '....30000003....',
      '.....333333.....',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  /** The shop's sign: a white $ on blue. */
  martSignOverlay: {
    pal: OUTDOOR.wall,
    extra: { b: ACCENT.martBlue, w: '#f8f8f8' },
    rows: [
      '................',
      '................',
      '..333333333333..',
      '..3bbbbbbbbbb3..',
      '..3bbbbwbbbbb3..',
      '..3bbbwwwwbbb3..',
      '..3bbwwbbbbbb3..',
      '..3bbbwwwbbbb3..',
      '..3bbbbbwwbbb3..',
      '..3bbwwwwbbbb3..',
      '..3bbbbwbbbbb3..',
      '..333333333333..',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  /** A bread sign over the bakery door. */
  bakerySignOverlay: {
    pal: OUTDOOR.wall,
    extra: { k: ACCENT.breadCrust, l: ACCENT.breadLight },
    rows: [
      '................',
      '................',
      '..333333333333..',
      '..300000000003..',
      '..300kkkkkk003..',
      '..30kllllllk03..',
      '..3klkllklllk3..',
      '..3kllllllllk3..',
      '..30kkkkkkkk03..',
      '..300000000003..',
      '..333333333333..',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  gymSignOverlay: {
    pal: OUTDOOR.wall,
    extra: { p: ACCENT.gymPurple },
    rows: [
      '................',
      '................',
      '................',
      '.33333333333333.',
      '.3pppppppppppp3.',
      '.3000p0p0ppp0p3.',
      '.30ppp0p00p00p3.',
      '.30p0p0p0p0p0p3.',
      '.30p0p0p0ppp0p3.',
      '.3000p0p0ppp0p3.',
      '.3pppppppppppp3.',
      '.33333333333333.',
      '................',
      '................',
      '................',
      '................',
    ],
  },

  // ---------- Indoors ----------
  floor: {
    pal: INDOOR.wood,
    rows: Array.from({ length: 16 }, (_, y) => (y % 4 < 2 ? '0000000000000000' : '1111111111111111')),
  },
  innerWall: {
    pal: INDOOR.wood,
    rows: [
      ...Array(13).fill('3122312231223122'),
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ],
  },
  tileFloor: {
    pal: INDOOR.gray,
    rows: [
      ...Array(7).fill('0000000211111112'),
      '2222222222222222',
      ...Array(7).fill('1111111200000002'),
      '2222222222222222',
    ],
  },
  pinkFloor: {
    pal: INDOOR.red,
    rows: Array.from({ length: 16 }, (_, y) =>
      Array.from({ length: 16 }, (_, x) => (((x >> 2) + (y >> 2)) % 2 ? '1' : '0')).join(''),
    ),
  },
  /** Table top; edges and legs are added automatically. */
  table: { pal: INDOOR.wood, rows: Array(16).fill('1111111111111111') },
  bed: {
    pal: INDOOR.red,
    rows: [
      '3333333333333333',
      '3000000000000003',
      '3000000000000003',
      '3000000000000003',
      '3333333333333333',
      '3111111111111113',
      '3121212121212123',
      '3111111111111113',
      '3212121212121213',
      '3111111111111113',
      '3121212121212123',
      '3111111111111113',
      '3222222222222223',
      '3333333333333333',
      '.3............3.',
      '................',
    ],
  },
  shelf: {
    pal: INDOOR.books,
    extra: { w: '#a89050', d: '#706030' },
    rows: [
      '3333333333333333',
      '3wwwwwwwwwwwwww3',
      '3w001122001122w3',
      '3w001122001122w3',
      '3w001122001122w3',
      '3w001122001122w3',
      '3wwwwwwwwwwwwww3',
      '3w110022110022w3',
      '3w110022110022w3',
      '3w110022110022w3',
      '3w110022110022w3',
      '3wwwwwwwwwwwwww3',
      '3dddddddddddddd3',
      '3333333333333333',
      '................',
      '................',
    ],
  },
  plant: {
    pal: INDOOR.green,
    extra: { w: '#a89050', d: '#706030' },
    rows: [
      '.....333333.....',
      '...3311211133...',
      '..312112111213..',
      '.31121121121213.',
      '.31211211211213.',
      '.32121121121223.',
      '..322121212223..',
      '...3322222233...',
      '.....333333.....',
      '....3wwwwww3....',
      '....3wwwwdd3....',
      '.....3wwwd3.....',
      '.....3wwdd3.....',
      '.....333333.....',
      '................',
      '................',
    ],
  },
  tv: {
    pal: INDOOR.gray,
    extra: { b: '#a0a8f0', B: '#6870d8' },
    rows: [
      '................',
      '.33333333333333.',
      '.31111111111113.',
      '.31bbbbbbbbbb13.',
      '.31bBBBBBBBBb13.',
      '.31bBBBBBBBBb13.',
      '.31bBBBBBBBBb13.',
      '.31bbbbbbbbbb13.',
      '.31111111111113.',
      '.33333333333333.',
      '.32222222222223.',
      '.33333333333333.',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  counter: {
    pal: INDOOR.red,
    rows: [
      '3333333333333333',
      '0000000000000000',
      '0000000000000000',
      '1111111111111111',
      '3333333333333333',
      '2222222122222221',
      '2222222122222221',
      '2222222122222221',
      '2222222122222221',
      '2222222122222221',
      '2222222122222221',
      '2222222122222221',
      '2222222222222222',
      '3333333333333333',
      '................',
      '................',
    ],
  },
  /** Computer (Palacentro). */
  pc: {
    pal: INDOOR.gray,
    extra: { b: '#a0a8f0', B: '#6870d8' },
    rows: [
      '................',
      '.33333333333333.',
      '.31111111111113.',
      '.31bbbbbbbbbb13.',
      '.31bBBBbbbbbb13.',
      '.31bbbbbbbbbb13.',
      '.31bbbbbbbbbb13.',
      '.31111111111113.',
      '.33333333333333.',
      '..322222222223..',
      '..321212121213..',
      '..322222222223..',
      '..333333333333..',
      '...32......23...',
      '...33......33...',
      '................',
    ],
  },
  /** Waiting-room sofa (Palacentro). */
  bench: {
    pal: INDOOR.red,
    rows: [
      '................',
      '................',
      '.33333333333333.',
      '.31111111111113.',
      '.31111111111113.',
      '.32222222222223.',
      '3333333333333333',
      '3111111111111113',
      '3122222222222213',
      '3333333333333333',
      '.32..........23.',
      '.33..........33.',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  /** Health poster with a red cross, hung on the inside wall. */
  poster: {
    pal: INDOOR.red,
    rows: [
      '................',
      '..333333333333..',
      '..300000000003..',
      '..300002200003..',
      '..300002200003..',
      '..302222222203..',
      '..302222222203..',
      '..300002200003..',
      '..300002200003..',
      '..300000000003..',
      '..333333333333..',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  mat: {
    pal: INDOOR.red,
    rows: [
      '................',
      '................',
      '.33333333333333.',
      '.31111111111113.',
      '.31222222222213.',
      '.31211111111213.',
      '.31212121212213.',
      '.31211111111213.',
      '.31212121212213.',
      '.31211111111213.',
      '.31212121212213.',
      '.31211111111213.',
      '.31222222222213.',
      '.31111111111113.',
      '.33333333333333.',
      '................',
    ],
  },
  rug: {
    pal: INDOOR.red,
    rows: tile8(['22222222', '22222222', '22122222', '21212222', '22122222', '22222222', '22222212', '22222222']),
  },
  void: { pal: ['#000000', '#000000', '#000000', '#000000'], rows: Array(16).fill('0000000000000000') },
};

import { Pix, type Img } from './pixel';
import { CLOTHES, SKIN } from '../style/colors';
import { LOOKS, type Look } from '../style/people';

/*
  Battle portraits of people (48x48, waist up, Gold/Silver style), built from the same LOOKS
  as the overworld sprites (style/people.ts): hairstyle, outfit and color. So every trainer
  gets a portrait for free, and a new trainer only needs a look.
  The player also has a back view, looking up and to the right at the opponent.
*/

const K = '#1a1a26';
const W = '#ffffff';
const HAIR = '#2a2430';
const GRAY_HAIR = '#a8a8b4';
const MOUTH = '#c05048';

/** A darker shade of a #rrggbb color. */
function shade(hex: string, f = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * f);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const SKIN_DARK = shade(SKIN, 0.85);

function body(p: Pix, look: Look, color: string) {
  const dark = shade(color);
  if (look.body === 'coat' && look.color !== 'black') {
    // An open lab coat over a dark shirt.
    p.poly([[9, 47], [12, 34], [18, 29], [30, 29], [36, 34], [39, 47]], W);
    p.poly([[30, 29], [36, 34], [39, 47], [33, 47]], '#d8d8e0');
    p.poly([[20, 29], [28, 29], [27, 47], [21, 47]], '#4858a8');
    p.line(20, 30, 21, 46, '#b8b8c8').line(28, 30, 27, 46, '#b8b8c8');
  } else {
    p.poly([[9, 47], [12, 34], [18, 29], [30, 29], [36, 34], [39, 47]], color);
    p.poly([[30, 29], [36, 34], [39, 47], [33, 47]], dark);
    if (look.body === 'dress') p.rect(19, 29, 10, 2, W); // a white collar
  }
  p.poly([[21, 29], [27, 29], [24, 33]], SKIN); // neck opening
  p.rect(21, 25, 6, 5, SKIN_DARK); // neck
}

function face(p: Pix) {
  p.ellipse(24, 17, 9, 10.5, SKIN);
  p.ellipse(14.6, 18, 1.5, 2.5, SKIN).ellipse(33.4, 18, 1.5, 2.5, SKIN);
  p.rect(19, 16, 2, 3, K).rect(27, 16, 2, 3, K);
  p.set(19, 16, W).set(27, 16, W);
}

function hairBack(p: Pix, look: Look, hair: string) {
  if (look.head === 'long' || look.head === 'longColor' || look.head === 'helmetLong') p.ellipse(24, 21, 12.5, 14, hair);
  if (look.head === 'short') p.ellipse(24, 16, 11.5, 11, hair);
  if (look.head === 'hood') p.ellipse(24, 19, 13.5, 15, hair);
}

function hairFront(p: Pix, look: Look, hair: string, color: string) {
  switch (look.head) {
    case 'cap':
      p.rect(14, 12, 3, 7, hair).rect(31, 12, 3, 7, hair);
      p.ellipse(24, 8, 11, 6.5, color);
      p.rect(13, 12, 22, 3, shade(color));
      p.rect(22, 5, 4, 3, W);
      break;
    case 'long':
    case 'longColor':
      p.ellipse(24, 9, 10, 5.5, hair);
      p.rect(14, 11, 3, 13, hair).rect(31, 11, 3, 13, hair);
      if (look.head === 'long') p.rect(15, 6, 18, 2, color); // hair band
      break;
    case 'bun':
      p.ellipse(24, 3.5, 4, 3.5, hair);
      p.ellipse(24, 9, 10, 5.5, hair);
      p.rect(14, 11, 2, 5, hair).rect(32, 11, 2, 5, hair);
      break;
    case 'crew':
      p.ellipse(24, 9, 9.5, 5, hair);
      p.rect(15, 11, 2, 5, hair).rect(31, 11, 2, 5, hair);
      p.rect(21, 22, 6, 1, hair); // mustache
      break;
    case 'short':
      p.ellipse(24, 9, 10, 5.5, hair);
      break;
    case 'helmet':
    case 'helmetLong':
      if (look.head === 'helmet') p.rect(15, 11, 2, 5, hair).rect(31, 11, 2, 5, hair);
      else p.rect(14, 11, 3, 13, hair).rect(31, 11, 3, 13, hair);
      p.ellipse(24, 8, 11.5, 7, color);
      p.rect(12, 12, 24, 2, shade(color)); // the brim
      p.rect(21, 3, 6, 5, '#f0f0d0').rect(22, 4, 4, 3, '#f8f8a0'); // the headlamp
      break;
    case 'hood':
      p.ellipse(24, 8, 11, 6, hair);
      p.rect(13, 10, 3, 15, hair).rect(32, 10, 3, 15, hair);
      break;
    case 'safari':
      p.rect(15, 11, 2, 5, hair).rect(31, 11, 2, 5, hair);
      p.ellipse(24, 12, 17, 3, shade(color)); // the wide brim
      p.ellipse(24, 7, 9, 5.5, color);
      p.rect(15, 9, 18, 2, shade(color, 0.5)); // the band
      break;
  }
}

/** A trainer (or anyone with a look) facing you, for the start and end of a battle. */
function front(look: Look): Img {
  const color = CLOTHES[look.color] ?? CLOTHES.blue;
  // Colored long hair (Paloma, the nurse); the bob is for older women, so it's gray.
  // A hood is the outfit's color, like the colored hair.
  const hair = look.head === 'longColor' || look.head === 'hood' ? color : look.head === 'short' ? GRAY_HAIR : HAIR;
  const p = new Pix(48, 48);
  hairBack(p, look, hair);
  body(p, look, color);
  face(p);
  p.rect(22, look.head === 'crew' ? 24 : 23, 4, 1, MOUTH);
  hairFront(p, look, hair, color);
  p.outline(K);
  return p.toCanvas();
}

/** The player from behind, looking up and to the right at the opponent. */
function back(look: Look): Img {
  const color = CLOTHES[look.color] ?? CLOTHES.red;
  const dark = shade(color);
  const p = new Pix(48, 48);
  p.poly([[3, 47], [7, 34], [15, 28], [35, 28], [41, 34], [45, 47]], color);
  p.poly([[35, 28], [41, 34], [45, 47], [38, 47]], dark);
  p.ellipse(33, 20, 2.5, 5, SKIN); // a bit of cheek: turned to the right
  if (look.head === 'cap') {
    p.ellipse(24, 17, 10, 11, HAIR);
    p.ellipse(34.5, 17, 1.5, 2.5, SKIN); // ear
    p.ellipse(24, 9, 11.5, 7, color);
    p.rect(31, 12, 11, 3, dark); // the cap's brim, pointing where you look
    p.rect(14, 8, 3, 2, dark);
  } else {
    // Long hair down over the shoulders, with a band in her color.
    p.ellipse(23, 20, 12, 15, HAIR);
    p.ellipse(34.5, 17, 1.5, 2.5, SKIN); // ear
    p.rect(13, 8, 22, 2, color);
  }
  p.outline(K);
  return p.toCanvas();
}

const cache = new Map<string, Img>();

/** A battle portrait for a look id (key in LOOKS). */
export function portrait(lookId: string, view: 'front' | 'back' = 'front'): Img {
  const key = `${lookId}:${view}`;
  let img = cache.get(key);
  if (!img) {
    const look = LOOKS[lookId] ?? LOOKS.man;
    img = view === 'front' ? front(look) : back(look);
    cache.set(key, img);
  }
  return img;
}

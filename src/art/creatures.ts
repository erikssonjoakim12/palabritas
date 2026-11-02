import { Pix, mirror, fromRows, trim, makeCanvas, type Img } from './pixel';
import { SPRITE_INK, VIPER as V, TREEFROG as F, DARTFROG as D, LUNAMOTH as M, DUENDE as U, CAPUCHIN as C, QUETZAL as Q, CADEJOS as J } from '../style/colors';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).
type Draw = (p: Pix) => void;

/** A big dog standing side-on, facing left (the Cadejos): coat, its shade, eye color. */
function cadejo(p: Pix, coat: string, shade: string, eye: string) {
  p.poly([[38, 22], [46, 12], [44, 24]], coat); // the tail
  p.ellipse(28, 28, 14, 8, coat);
  p.ellipse(30, 32, 11, 4, shade);
  for (const x of [17, 22, 32, 37]) p.rect(x, 32, 4, 11, x === 22 || x === 37 ? shade : coat);
  p.ellipse(13, 20, 8, 7, coat);
  p.ellipse(6, 23, 5, 3.5, coat); // the snout
  p.poly([[11, 14], [13, 6], [17, 14]], coat).poly([[15, 14], [19, 7], [20, 15]], shade); // the ears
  p.ellipse(11, 19, 1.8, 1.6, eye);
  p.set(2, 22, SPRITE_INK);
}

/** Placeholders for new Palabritas until the user's art arrives. */
const DRAW: Record<string, Draw> = {
  /** Cadenegro: huge and black, red eyes, goat hooves, a chain dragging from its neck. */
  cadenegro(p) {
    cadejo(p, J.black, J.blackLight, J.red);
    for (const x of [17, 22, 32, 37]) p.rect(x, 42, 4, 3, J.chain); // goat hooves
    for (let i = 0; i < 6; i++) p.ellipse(18 + i * 5, 24 + i * 4 - (i > 3 ? (i - 3) * 3 : 0), 1.8, 1.4, J.chain);
    p.line(18, 24, 44, 45, J.chain);
    p.outline(SPRITE_INK);
  },
  /** Cadeblanco: white, glowing a little like the moon, kind blue eyes. */
  cadeblanco(p) {
    cadejo(p, J.white, J.shade, J.blue);
    p.outline(SPRITE_INK);
  },
  /** The eyelash viper: a green coil, a raised head with spiky "eyelashes" over the eyes. */
  pestanita(p) {
    p.ellipse(24, 40, 15, 6, V.dark).ellipse(24, 39, 14, 5, V.green);
    p.ellipse(26, 33, 11, 4.5, V.dark).ellipse(26, 32, 10, 4, V.green);
    p.rect(19, 20, 6, 12, V.green).rect(23, 22, 2, 10, V.dark);
    p.ellipse(21, 19, 7, 5, V.green);
    for (const x of [16, 18, 23, 25]) p.poly([[x, 15], [x + 1, 11], [x + 2, 15]], V.lash);
    p.ellipse(18, 18, 1.6, 1.6, V.lash).ellipse(24, 18, 1.6, 1.6, V.lash);
    p.rect(18, 17, 1, 2, SPRITE_INK).rect(24, 17, 1, 2, SPRITE_INK);
    p.line(21, 23, 21, 26, V.tongue).set(20, 27, V.tongue).set(22, 27, V.tongue);
    for (const [x, y] of [[14, 40], [22, 41], [30, 40], [20, 33], [30, 32]]) p.ellipse(x, y, 1.5, 1, V.dark);
    p.outline(SPRITE_INK);
  },
  /** Oropelón: the golden morph, a bigger coil, the head held high. */
  oropelon(p) {
    p.ellipse(24, 41, 18, 6, V.goldDark).ellipse(24, 40, 17, 5, V.gold);
    p.ellipse(25, 33, 14, 5, V.goldDark).ellipse(25, 32, 13, 4.5, V.gold);
    p.ellipse(27, 25, 9, 4, V.goldDark).ellipse(27, 24, 8, 3.5, V.gold);
    p.rect(17, 12, 7, 12, V.gold).rect(22, 14, 2, 10, V.goldDark);
    p.ellipse(19, 11, 8, 5.5, V.gold);
    for (const x of [13, 15, 21, 23]) p.poly([[x, 7], [x + 1, 2], [x + 2, 7]], V.lash);
    p.ellipse(15, 10, 1.8, 1.8, V.lash).ellipse(23, 10, 1.8, 1.8, V.lash);
    p.rect(15, 9, 1, 2, SPRITE_INK).rect(23, 9, 1, 2, SPRITE_INK);
    p.line(19, 15, 19, 18, V.tongue).set(18, 19, V.tongue).set(20, 19, V.tongue);
    for (const [x, y] of [[12, 41], [22, 42], [33, 40], [18, 33], [32, 32], [27, 25]]) p.ellipse(x, y, 1.6, 1, V.goldDark);
    p.outline(SPRITE_INK);
  },
  /** The red-eyed tree frog: green, huge red eyes, blue flanks, orange toes. */
  ranojito(p) {
    p.ellipse(13, 42, 5, 3, F.foot).ellipse(35, 42, 5, 3, F.foot);
    p.ellipse(24, 36, 13, 9, F.green);
    p.ellipse(13, 37, 3, 5, F.flank).ellipse(35, 37, 3, 5, F.flank);
    p.ellipse(24, 39, 8, 5, F.belly);
    p.ellipse(17, 25, 6, 6, F.green).ellipse(31, 25, 6, 6, F.green);
    p.ellipse(17, 24, 4.5, 4.5, F.eye).ellipse(31, 24, 4.5, 4.5, F.eye);
    p.rect(16, 22, 2, 5, SPRITE_INK).rect(30, 22, 2, 5, SPRITE_INK);
    p.line(19, 33, 29, 33, F.dark);
    p.ellipse(18, 45, 2.5, 2, F.foot).ellipse(30, 45, 2.5, 2, F.foot);
    p.outline(SPRITE_INK);
  },
  /** Ranojón: bigger, a throat sac puffed out to sing for the rain. */
  ranojon(p) {
    p.ellipse(10, 43, 6, 3.5, F.foot).ellipse(38, 43, 6, 3.5, F.foot);
    p.ellipse(24, 34, 17, 11, F.green);
    p.ellipse(9, 35, 4, 7, F.flank).ellipse(39, 35, 4, 7, F.flank);
    p.ellipse(24, 38, 10, 7, F.belly);
    p.ellipse(24, 31, 6, 4, F.belly); // the throat sac
    p.ellipse(15, 20, 7, 7, F.green).ellipse(33, 20, 7, 7, F.green);
    p.ellipse(15, 19, 5.5, 5.5, F.eye).ellipse(33, 19, 5.5, 5.5, F.eye);
    p.rect(14, 16, 2, 7, SPRITE_INK).rect(32, 16, 2, 7, SPRITE_INK);
    p.ellipse(17, 46, 3, 2, F.foot).ellipse(31, 46, 3, 2, F.foot);
    p.outline(SPRITE_INK);
  },
  /** The poison dart frog: tiny, electric blue with black spots. */
  dardito(p) {
    p.ellipse(16, 42, 4, 2.5, D.dark).ellipse(32, 42, 4, 2.5, D.dark);
    p.ellipse(24, 37, 11, 8, D.blue);
    p.ellipse(24, 28, 9, 6, D.blue);
    p.ellipse(21, 34, 3, 2, D.light);
    for (const [x, y] of [[19, 38], [28, 36], [24, 41], [30, 40], [18, 32]]) p.ellipse(x, y, 1.8, 1.5, SPRITE_INK);
    p.ellipse(19, 26, 2.5, 2.5, SPRITE_INK).ellipse(29, 26, 2.5, 2.5, SPRITE_INK);
    p.set(18, 25, D.light).set(28, 25, D.light);
    p.outline(SPRITE_INK);
  },
  /** The luna moth's caterpillar: a plump green body in segments, pale moon-dots along its side. */
  lunarcito(p) {
    for (const [x, y, r] of [[8, 40, 5], [14, 38, 6], [21, 37, 6.5], [28, 37, 6.5], [35, 36, 6]]) p.ellipse(x, y, r, r, M.green);
    for (const x of [11, 18, 25, 32]) p.line(x, 33, x, 42, M.dark);
    for (const [x, y] of [[8, 38], [15, 35], [22, 34], [29, 34]]) p.ellipse(x, y, 1.5, 1.5, M.dot);
    p.ellipse(39, 29, 7, 7, M.green);
    p.ellipse(37, 28, 1.5, 2, SPRITE_INK).ellipse(42, 28, 1.5, 2, SPRITE_INK);
    p.line(37, 32, 41, 32, M.dark);
    for (const x of [10, 17, 24, 31]) p.rect(x, 43, 2, 2, M.dark);
    p.outline(SPRITE_INK);
  },
  /** Hojaluna: a cocoon wrapped in a dry leaf, hanging from a twig, glowing faintly, asleep. */
  hojaluna(p) {
    p.rect(22, 2, 4, 6, M.leafDark);
    p.ellipse(24, 26, 11, 18, M.leaf);
    p.line(24, 9, 24, 43, M.leafDark);
    for (const y of [16, 24, 32]) p.line(24, y, 17, y - 4, M.leafDark).line(24, y, 31, y - 4, M.leafDark);
    p.ellipse(24, 27, 5, 6, M.pale);
    p.line(21, 26, 23, 26, SPRITE_INK).line(25, 26, 27, 26, SPRITE_INK);
    for (const [x, y] of [[16, 20], [31, 30], [18, 36]]) p.set(x, y, M.dot);
    p.outline(SPRITE_INK);
  },
  /** Polilluna: pale green wings with yellow eyespots and long trailing tails, a fuzzy white body. */
  polilluna(p) {
    p.ellipse(13, 17, 12, 10, M.pale).ellipse(35, 17, 12, 10, M.pale);
    p.ellipse(15, 30, 9, 8, M.pale).ellipse(33, 30, 9, 8, M.pale);
    p.poly([[12, 34], [8, 46], [14, 38]], M.paleEdge).poly([[36, 34], [40, 46], [34, 38]], M.paleEdge);
    for (const [x, y] of [[12, 17], [36, 17]]) p.ellipse(x, y, 4, 4, M.eye).ellipse(x, y, 2, 2, M.eyeDark);
    p.line(4, 10, 20, 26, M.paleEdge).line(44, 10, 28, 26, M.paleEdge);
    p.ellipse(24, 24, 3.5, 11, M.body);
    p.line(22, 14, 16, 4, M.antenna).line(26, 14, 32, 4, M.antenna);
    p.ellipse(22, 16, 1, 1.2, SPRITE_INK).ellipse(26, 16, 1, 1.2, SPRITE_INK);
    p.outline(SPRITE_INK);
  },
  /** The duende: tiny, under a huge brown hat with a red band, a white beard, a cheeky grin. */
  duende(p) {
    p.rect(18, 40, 4, 5, U.boots).rect(26, 40, 4, 5, U.boots);
    p.ellipse(24, 34, 9, 8, U.shirt);
    p.ellipse(24, 24, 7, 6, U.skin);
    p.ellipse(24, 29, 6, 4, U.beard);
    p.ellipse(24, 25, 2, 2, U.skinDark);
    p.ellipse(21, 22, 1, 1.2, SPRITE_INK).ellipse(27, 22, 1, 1.2, SPRITE_INK);
    p.ellipse(24, 17, 22, 5, U.hat);
    p.ellipse(24, 11, 10, 8, U.hat);
    p.rect(14, 14, 20, 3, U.band);
    p.line(4, 19, 44, 19, U.hatDark);
    p.outline(SPRITE_INK);
  },
  /** Carablanquita: a small dark monkey with a white face and chest, a stone floating over its hand. */
  carablanquita(p) {
    p.poly([[32, 40], [42, 30], [44, 34], [34, 44]], C.fur);
    p.ellipse(22, 36, 9, 8, C.fur);
    p.ellipse(22, 37, 5, 5, C.white);
    p.ellipse(22, 22, 9, 8, C.white);
    p.ellipse(22, 24, 6, 5, C.face);
    p.ellipse(22, 16, 6, 3, C.fur);
    p.ellipse(19, 22, 1.3, 1.5, SPRITE_INK).ellipse(25, 22, 1.3, 1.5, SPRITE_INK);
    p.line(20, 27, 24, 27, C.furLight);
    p.rect(12, 32, 4, 8, C.fur);
    p.ellipse(10, 24, 5, 3, C.glow).ellipse(10, 23, 3.5, 2.5, C.stone);
    p.set(9, 22, C.white);
    p.outline(SPRITE_INK);
  },
  /** Carablanca: bigger, sitting tall, stones floating around it in a lilac glow. */
  carablanca(p) {
    p.poly([[30, 42], [44, 36], [46, 40], [32, 46]], C.fur);
    p.ellipse(24, 34, 12, 10, C.fur);
    p.ellipse(24, 34, 7, 7, C.white);
    p.ellipse(24, 18, 11, 9, C.white);
    p.ellipse(24, 20, 7, 6, C.face);
    p.ellipse(24, 11, 7, 3, C.fur);
    p.ellipse(21, 18, 1.5, 1.8, SPRITE_INK).ellipse(27, 18, 1.5, 1.8, SPRITE_INK);
    p.line(21, 24, 27, 24, C.furLight);
    for (const [x, y, r] of [[6, 14, 4], [42, 12, 3.5], [8, 30, 3]]) p.ellipse(x, y, r + 1.5, r + 0.5, C.glow).ellipse(x, y, r, r - 0.5, C.stone).set(x - 1, y - 1, C.white);
    p.outline(SPRITE_INK);
  },
  /** Quetzalito: a round, shining green chick with a red breast, a little crest and a short tail. */
  quetzalito(p) {
    p.poly([[28, 38], [40, 44], [38, 40]], Q.green);
    p.ellipse(22, 32, 11, 10, Q.green);
    p.ellipse(21, 36, 7, 6, Q.red);
    p.ellipse(22, 20, 8, 7, Q.green);
    p.poly([[19, 14], [22, 8], [25, 14]], Q.light);
    p.ellipse(26, 26, 5, 6, Q.shine);
    p.poly([[13, 20], [10, 22], [14, 22]], Q.beak);
    p.ellipse(18, 19, 1.5, 1.8, SPRITE_INK);
    p.rect(19, 42, 2, 3, Q.beak).rect(24, 42, 2, 3, Q.beak);
    p.outline(SPRITE_INK);
  },
  /** Quetzalón: perched tall, a crest like a crown, two tail feathers trailing far below it. */
  quetzalon(p) {
    p.poly([[22, 32], [30, 47], [33, 47], [26, 32]], Q.light);
    p.poly([[25, 32], [36, 47], [39, 47], [29, 32]], Q.green);
    p.ellipse(22, 22, 9, 12, Q.green);
    p.ellipse(20, 28, 6, 6, Q.red);
    p.ellipse(25, 18, 5, 8, Q.shine);
    p.ellipse(19, 9, 6, 6, Q.green);
    p.poly([[14, 6], [19, 0], [24, 6]], Q.light);
    p.poly([[13, 9], [9, 11], [14, 11]], Q.beak);
    p.ellipse(17, 8, 1.5, 1.8, SPRITE_INK);
    p.rect(17, 34, 2, 3, Q.beak).rect(22, 34, 2, 3, Q.beak);
    p.outline(SPRITE_INK);
  },
};

export interface CreatureArt {
  front: Img;
  back: Img;
}

/** Every Palabrita that has art (hand-made or a shape drawing). */
export const CREATURE_IDS = [...new Set([...Object.keys(PALABRITA_ART), ...Object.keys(DRAW)])];

const built: Record<string, CreatureArt> = {};

/**
 * A Palabrita's sprites, drawn the first time they're needed (drawing all of them at start-up took ~100 ms).
 * Hand-made pixel art (style/palabritas.ts) when it has it; otherwise its shape drawing, with the mirrored
 * front as the back view.
 */
export function creatureArt(id: string): CreatureArt {
  if (built[id]) return built[id];
  const art = PALABRITA_ART[id];
  if (art) {
    // Trimmed, so the feet stand on the ground however much empty space the file has.
    const img = (view: 'front' | 'back') => trim(fromRows(art[view], art.pal, `${id} ${view}`));
    return (built[id] = { front: img('front'), back: img('back') });
  }
  const p = new Pix(48, 48);
  DRAW[id](p);
  const front = p.toCanvas();
  return (built[id] = { front, back: mirror(front) });
}

/** Icon size: one map tile, like your character on the map (and Gold/Silver's party icons). */
export const ICON = 16;
const icons: Record<string, Img> = {};

/**
 * A Palabrita's 16x16 icon for lists (your team, the Palabridex), made from its front sprite: each icon pixel takes
 * the most common color of its part of the sprite (so the art's own colors, not a blur), with an outline around it.
 * Shown scaled up with hard pixels, it reads as pixel art. Hand-made icons could replace these one by one.
 */
export function creatureIcon(id: string): Img {
  if (icons[id]) return icons[id];
  const src = creatureArt(id).front;
  const { data } = src.getContext('2d')!.getImageData(0, 0, src.width, src.height);
  const fit = ICON - 2; // room for the outline
  const k = Math.max(src.width, src.height) / fit;
  const [w, h] = [Math.max(1, Math.round(src.width / k)), Math.max(1, Math.round(src.height / k))];
  const [ox, oy] = [Math.floor((ICON - w) / 2), ICON - 1 - h];
  const px: (string | null)[] = new Array(ICON * ICON).fill(null);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const count = new Map<string, number>();
      let cells = 0;
      for (let sy = Math.floor(y * k); sy < Math.min(src.height, Math.floor((y + 1) * k)); sy++)
        for (let sx = Math.floor(x * k); sx < Math.min(src.width, Math.floor((x + 1) * k)); sx++) {
          cells++;
          const i = (sy * src.width + sx) * 4;
          if (data[i + 3] < 128) continue;
          const c = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
          count.set(c, (count.get(c) ?? 0) + 1);
        }
      const solid = [...count.values()].reduce((a, b) => a + b, 0);
      if (solid * 2 < cells) continue; // mostly empty: transparent
      px[(oy + y) * ICON + ox + x] = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
  const c = makeCanvas(ICON, ICON);
  const g = c.getContext('2d')!;
  for (let y = 0; y < ICON; y++)
    for (let x = 0; x < ICON; x++) {
      let col = px[y * ICON + x];
      // The outline: empty pixels next to the Palabrita.
      if (!col && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => x + dx >= 0 && x + dx < ICON && px[(y + dy) * ICON + x + dx])) col = SPRITE_INK;
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  return (icons[id] = c);
}

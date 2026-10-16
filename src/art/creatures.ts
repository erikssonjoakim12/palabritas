import { Pix, mirror, fromRows, trim, type Img } from './pixel';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).
const K = '#1a1a26';
const W = '#ffffff';

type Draw = (p: Pix) => void;

const DRAW: Record<string, Draw> = {
  gotita(p) {
    const b = '#5aa8f0', d = '#2f6fc8';
    p.ellipse(24, 30, 14, 13, d);
    p.poly([[24, 4], [11, 26], [37, 26]], b);
    p.ellipse(22, 28, 13, 12, b);
    p.ellipse(17, 21, 2.5, 4, W);
    p.ellipse(19, 30, 2, 3, K).ellipse(29, 30, 2, 3, K);
    p.set(18, 29, W).set(28, 29, W);
    p.set(23, 35, K).set(24, 36, K).set(25, 35, K);
    p.rect(14, 34, 3, 1, '#f7a0b0').rect(31, 34, 3, 1, '#f7a0b0');
    p.outline('#183060');
  },
  pajarito(p) {
    const br = '#9a6a42', dk = '#6b4426', or = '#f39a2b';
    p.poly([[5, 26], [14, 24], [16, 32], [3, 35]], dk);
    p.ellipse(24, 30, 13, 11, br);
    p.ellipse(27, 33, 8, 7, '#f3dcb0');
    p.poly([[28, 9], [30, 3], [33, 9]], dk);
    p.ellipse(31, 17, 9, 9, br);
    p.poly([[39, 15], [46, 18], [39, 21]], or);
    p.ellipse(33, 15, 1.5, 2, K);
    p.set(33, 14, W);
    p.rect(35, 19, 2, 1, '#f39aa0');
    p.ellipse(19, 29, 8, 5, dk);
    p.rect(22, 41, 2, 4, or).rect(28, 41, 2, 4, or);
    p.rect(20, 45, 6, 1, or).rect(26, 45, 6, 1, or);
    p.outline('#3b2412');
  },
  conejito(p) {
    const wh = '#f4f4f4', gr = '#c9c9d6', pk = '#f6a6b8';
    p.ellipse(18, 11, 4, 10, wh).ellipse(30, 11, 4, 10, wh);
    p.ellipse(18, 12, 2, 7, pk).ellipse(30, 12, 2, 7, pk);
    p.ellipse(24, 37, 11, 9, gr);
    p.ellipse(23, 36, 10, 8, wh);
    p.ellipse(17, 45, 4, 2, wh).ellipse(31, 45, 4, 2, wh);
    p.ellipse(24, 24, 11, 9, wh);
    p.ellipse(19, 23, 1.5, 2, K).ellipse(29, 23, 1.5, 2, K);
    p.set(19, 22, W).set(29, 22, W);
    p.rect(23, 26, 2, 1, pk);
    p.set(22, 28, K).set(25, 28, K);
    p.rect(15, 26, 2, 1, pk).rect(32, 26, 2, 1, pk);
    p.stamp(22, 34, ['111', '001', '111', '001', '111'], gr);
    p.outline('#4a4a5a');
  },
  mariposita(p) {
    p.ellipse(13, 17, 11, 10, '#f37ab8').ellipse(35, 17, 11, 10, '#f37ab8');
    p.ellipse(16, 33, 8, 8, '#5ab8f0').ellipse(32, 33, 8, 8, '#5ab8f0');
    p.ellipse(11, 15, 4, 4, '#ffd84a').ellipse(37, 15, 4, 4, '#ffd84a');
    p.ellipse(15, 34, 3, 3, '#9a5ad0').ellipse(33, 34, 3, 3, '#9a5ad0');
    p.ellipse(24, 27, 3, 13, '#2a2238');
    p.ellipse(24, 12, 4, 4, '#2a2238');
    p.line(22, 9, 17, 3, '#2a2238').line(26, 9, 31, 3, '#2a2238');
    p.ellipse(17, 3, 1.5, 1.5, '#2a2238').ellipse(31, 3, 1.5, 1.5, '#2a2238');
    p.set(22, 12, W).set(26, 12, W);
    p.outline('#2a2238');
  },
  // ----- Placeholders for the starters' evolutions, until the real art arrives -----
  /** A dachshund in a burger: buns, patty, lettuce and cheese, the dog's head and tail sticking out. */
  hamburgueson(p) {
    const bun = '#e8a050', bunDk = '#c07830', dog = '#8a4a20', patty = '#5a2e14';
    p.ellipse(9, 22, 6, 6, dog).ellipse(6, 27, 3, 4, '#6c3717'); // head and ear
    p.poly([[40, 26], [46, 16], [44, 28]], dog); // tail
    p.ellipse(24, 38, 18, 5, bun).ellipse(24, 40, 17, 3, bunDk); // bottom bun
    p.rect(8, 31, 32, 4, patty);
    p.poly([[7, 30], [41, 30], [39, 33], [9, 33]], '#58b030'); // lettuce
    p.rect(9, 29, 30, 2, '#f8c838'); // cheese
    p.ellipse(24, 23, 17, 9, bun).ellipse(24, 27, 17, 3, bunDk); // top bun
    for (const [x, y] of [[16, 18], [22, 16], [29, 17], [34, 21], [19, 22], [27, 21]]) p.rect(x, y, 2, 1, '#fff4d0'); // sesame
    p.rect(14, 41, 3, 5, dog).rect(31, 41, 3, 5, dog); // legs
    p.set(7, 20, K).set(3, 23, K);
    p.rect(1, 23, 3, 2, '#e880a8'); // tongue
    p.outline('#3a1c08');
  },
  /** A grumpy storm cloud with raindrops. */
  nubarron(p) {
    const lt = '#c8d0e8', dk = '#8890b0', drop = '#5aa8f0';
    p.ellipse(14, 24, 10, 9, lt).ellipse(28, 18, 13, 12, lt).ellipse(37, 26, 9, 8, lt).ellipse(24, 28, 16, 8, lt);
    p.ellipse(25, 33, 17, 4, dk);
    p.ellipse(20, 23, 2, 3, K).ellipse(30, 23, 2, 3, K);
    p.set(19, 22, W).set(29, 22, W);
    p.line(17, 19, 22, 21, K).line(33, 19, 28, 21, K); // grumpy brows
    p.rect(23, 29, 4, 1, K);
    for (const [x, y] of [[13, 41], [22, 44], [31, 41], [38, 45], [8, 45]]) p.ellipse(x, y, 1.5, 2.5, drop);
    p.outline('#404868');
  },
  /** A young avocado tree: a slim trunk, leaves, and a little avocado with a face. */
  aguacatono(p) {
    const leaf = '#4aa84a', leafDk = '#2f6b2a', trunk = '#8b5a2b', fruit = '#2f5928', flesh = '#c9e27a';
    p.rect(22, 26, 4, 18, trunk).ellipse(24, 45, 8, 2, '#6c3717'); // trunk and roots
    p.ellipse(15, 15, 9, 6, leafDk).ellipse(33, 14, 9, 6, leafDk).ellipse(24, 9, 8, 7, leaf);
    p.ellipse(13, 19, 7, 4, leaf).ellipse(35, 18, 7, 4, leaf);
    p.ellipse(31, 30, 5, 7, fruit).ellipse(31, 31, 3, 5, flesh); // a little avocado
    p.set(30, 29, K).set(33, 29, K).set(31, 32, K).set(32, 32, K);
    p.outline('#163314');
  },
  // ----- Placeholders for the cave Palabritas, until the real art arrives -----
  /** A bat with big ears and spread wings. */
  ecolin(p) {
    const fur = '#7a6090', wing = '#5a4478', pink = '#e8a0c0';
    p.poly([[24, 26], [3, 13], [2, 31], [8, 26], [12, 34], [16, 28], [22, 34]], wing);
    p.poly([[24, 26], [45, 13], [46, 31], [40, 26], [36, 34], [32, 28], [26, 34]], wing);
    p.poly([[16, 18], [13, 4], [23, 14]], fur).poly([[32, 18], [35, 4], [25, 14]], fur);
    p.poly([[17, 15], [15, 8], [21, 14]], pink).poly([[31, 15], [33, 8], [27, 14]], pink);
    p.ellipse(24, 26, 10, 11, fur);
    p.ellipse(24, 31, 6, 5, '#a890b8');
    p.ellipse(20, 22, 2, 2.5, K).ellipse(28, 22, 2, 2.5, K);
    p.set(19, 21, W).set(27, 21, W);
    p.rect(22, 26, 5, 1, K).set(22, 27, W).set(26, 27, W); // mouth and little fangs
    p.rect(20, 37, 2, 3, '#4e3a68').rect(26, 37, 2, 3, '#4e3a68');
    p.outline('#2a1a38');
  },
  /** A round, hairy tarantula with eight legs. */
  ochopatas(p) {
    const fur = '#8a5a34', leg = '#5a3418', band = '#e08038';
    for (let i = 0; i < 4; i++) {
      const y = 22 + i * 5;
      p.line(18, y, 7, y - 6 + i * 2, leg).line(7, y - 6 + i * 2, 3, y + 6, leg).line(18, y + 1, 8, y - 5 + i * 2, leg);
      p.line(30, y, 41, y - 6 + i * 2, leg).line(41, y - 6 + i * 2, 45, y + 6, leg).line(30, y + 1, 40, y - 5 + i * 2, leg);
      p.set(7, y - 6 + i * 2, band).set(41, y - 6 + i * 2, band);
    }
    p.ellipse(24, 34, 11, 9, fur);
    p.ellipse(24, 36, 5, 3, band);
    p.ellipse(24, 22, 9, 8, fur);
    p.ellipse(20, 21, 2, 2.5, K).ellipse(28, 21, 2, 2.5, K);
    p.set(19, 20, W).set(27, 20, W);
    p.set(22, 17, K).set(26, 17, K).set(23, 16, K).set(25, 16, K); // the other little eyes
    p.rect(21, 27, 2, 2, '#f0e8e0').rect(25, 27, 2, 2, '#f0e8e0'); // fangs
    p.outline('#2a1408');
  },
  /** A rhinoceros beetle: a shiny round shell and a big horn. */
  cuernito(p) {
    const shell = '#3a5a8a', hi = '#6a92c8', dark = '#22385a', horn = '#d8c8a0';
    for (const y of [30, 35, 40]) p.line(14, y, 5, y + 4, dark).line(34, y, 43, y + 4, dark); // legs
    p.ellipse(24, 32, 14, 11, shell);
    p.line(24, 22, 24, 43, dark);
    p.ellipse(18, 28, 4, 3, hi).ellipse(30, 28, 3, 2, hi);
    p.ellipse(24, 19, 8, 5, dark);
    p.poly([[21, 17], [27, 17], [29, 3], [24, 8]], horn);
    p.ellipse(20, 19, 1.5, 1.5, W).ellipse(28, 19, 1.5, 1.5, W);
    p.outline('#101828');
  },
  sillon(p) {
    const rd = '#c8463e', dr = '#8e2a26', cu = '#e86a5a', wd = '#7a4a22';
    p.ellipse(24, 9, 14, 5, rd);
    p.rect(10, 8, 28, 22, rd);
    p.rect(4, 21, 9, 18, dr).rect(35, 21, 9, 18, dr);
    p.ellipse(8, 21, 5, 3, rd).ellipse(40, 21, 5, 3, rd);
    p.rect(13, 28, 22, 8, cu);
    p.rect(10, 36, 28, 6, rd);
    p.rect(8, 42, 3, 5, wd).rect(37, 42, 3, 5, wd);
    p.set(17, 13, dr).set(24, 11, dr).set(31, 13, dr);
    p.ellipse(18, 20, 3, 2, W).ellipse(30, 20, 3, 2, W);
    p.set(18, 20, K).set(30, 20, K).set(19, 20, K).set(29, 20, K);
    p.line(14, 15, 20, 17, K).line(34, 15, 28, 17, K);
    p.line(19, 32, 29, 32, dr);
    p.outline('#3a1210');
  },

};

export const CREATURE_ART: Record<string, { front: Img; back: Img }> = {};

/**
 * Hand-made pixel art (style/palabritas.ts) when a Palabrita has it; otherwise its shape
 * drawing, with the mirrored front as the back view.
 */
export function buildCreatureArt() {
  for (const [id, fn] of Object.entries(DRAW)) {
    const p = new Pix(48, 48);
    fn(p);
    const front = p.toCanvas();
    CREATURE_ART[id] = { front, back: mirror(front) };
  }
  for (const [id, art] of Object.entries(PALABRITA_ART)) {
    // Trimmed, so the feet stand on the ground however much empty space the file has.
    const img = (view: 'front' | 'back') => trim(fromRows(art[view], art.pal, `${id} ${view}`));
    CREATURE_ART[id] = { front: img('front'), back: img('back') };
  }
}

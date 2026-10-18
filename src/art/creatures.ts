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
  /** A round gray pebble with a carved petroglyph face and stick-figure arms. */
  piedrita(p) {
    const stone = '#a8a8b0', dark = '#7e7e88', carve = '#3a3a42';
    p.line(11, 30, 4, 23, carve).line(4, 23, 3, 18, carve).line(4, 23, 1, 22, carve);
    p.line(37, 30, 44, 23, carve).line(44, 23, 45, 18, carve).line(44, 23, 47, 22, carve);
    p.ellipse(24, 31, 15, 13, stone);
    p.ellipse(29, 36, 9, 6, dark);
    p.ellipse(19, 27, 2.5, 2.5, carve).ellipse(29, 27, 2.5, 2.5, carve);
    p.set(19, 27, stone).set(29, 27, stone); // carved ring eyes
    p.line(19, 35, 29, 35, carve).set(18, 34, carve).set(30, 34, carve); // a carved smile
    p.line(18, 43, 16, 47, carve).line(30, 43, 32, 47, carve);
    p.outline(K);
  },
  /** A tall standing stone covered in glowing carved spirals, with stone arms. */
  petroglifon(p) {
    const stone = '#908878', hi = '#b8b0a0', glow = '#a0e0d0', carve = '#3a3a42';
    p.poly([[14, 22], [2, 13], [5, 9], [15, 16]], stone).poly([[34, 22], [46, 13], [43, 9], [33, 16]], stone);
    p.poly([[14, 47], [11, 10], [18, 2], [30, 2], [37, 10], [34, 47]], stone);
    p.poly([[16, 46], [14, 11], [19, 5], [22, 5], [19, 12], [21, 46]], hi);
    for (const [x, y] of [[24, 24], [24, 37]]) {
      p.line(x - 4, y + 3, x + 4, y + 3, glow).line(x + 4, y + 3, x + 4, y - 3, glow).line(x + 4, y - 3, x - 3, y - 3, glow);
      p.line(x - 3, y - 3, x - 3, y + 1, glow).line(x - 3, y + 1, x + 2, y + 1, glow).line(x + 2, y + 1, x + 2, y - 1, glow);
    }
    p.rect(18, 11, 4, 3, carve).rect(27, 11, 4, 3, carve);
    p.set(19, 12, glow).set(28, 12, glow);
    p.outline(K);
  },
  /** A small clay cooking pot with painted zigzags, steam puffing from its lid. */
  ollita(p) {
    const clay = '#c87048', dark = '#904828', paint = '#f0d8b0', steam = '#f0f0f8';
    p.ellipse(18, 7, 4, 3, steam).ellipse(26, 4, 3, 2.5, steam).ellipse(31, 9, 3, 2, steam);
    p.rect(5, 26, 5, 7, clay).rect(38, 26, 5, 7, clay);
    p.ellipse(24, 32, 16, 13, clay);
    p.ellipse(31, 37, 8, 7, dark);
    p.rect(11, 15, 26, 4, dark);
    p.ellipse(24, 14, 5, 2, dark);
    for (let x = 12; x < 36; x += 4) p.line(x, 25, x + 2, 23, paint).line(x + 2, 23, x + 4, 25, paint);
    p.ellipse(19, 31, 2, 2.5, K).ellipse(29, 31, 2, 2.5, K);
    p.set(18, 30, W).set(28, 30, W);
    p.rect(22, 36, 4, 1, K);
    p.outline('#3a1810');
  },
  /** A big round clay water jar (tinaja) with a cork for a hat; water sloshes at its neck. */
  tinajon(p) {
    const clay = '#b86040', dark = '#80401f', cork = '#d8b070', water = '#5aa8f0';
    p.ellipse(24, 31, 21, 16, clay);
    p.ellipse(34, 36, 10, 9, dark);
    p.rect(15, 9, 18, 8, clay);
    p.rect(13, 8, 22, 3, dark);
    p.rect(17, 11, 14, 2, water);
    p.rect(18, 1, 12, 8, cork).rect(18, 1, 12, 2, '#b08850');
    for (let x = 8; x < 40; x += 6) p.line(x, 22, x + 3, 20, '#e8c8a0').line(x + 3, 20, x + 6, 22, '#e8c8a0');
    p.ellipse(18, 29, 2, 3, K).ellipse(30, 29, 2, 3, K);
    p.set(17, 28, W).set(29, 28, W);
    p.ellipse(24, 36, 3, 2, K);
    p.outline('#2a1008');
  },
  /** A squirrel with a huge two-tone bushy tail, mid-cartwheel. */
  ardillita(p) {
    const fur = '#c07838', light = '#f0c890', dark = '#7a4418';
    p.ellipse(33, 20, 13, 17, dark).ellipse(33, 19, 9, 13, light);
    p.ellipse(19, 31, 10, 11, fur);
    p.ellipse(19, 34, 5, 6, light);
    p.ellipse(16, 17, 8, 7, fur);
    p.poly([[11, 13], [10, 5], [15, 10]], fur).poly([[19, 11], [21, 4], [23, 11]], fur);
    p.ellipse(13, 16, 1.5, 2, K).ellipse(19, 16, 1.5, 2, K);
    p.set(12, 15, W).set(18, 15, W);
    p.ellipse(16, 20, 1.5, 1, dark);
    p.rect(12, 41, 4, 4, dark).rect(21, 41, 4, 4, dark);
    p.outline(K);
  },
  /** A big acrobatic squirrel with a red sweatband and a pom-pom tail. */
  ardillon(p) {
    const fur = '#b06830', light = '#f0c890', dark = '#6a3a14', band = '#d04048';
    p.ellipse(35, 18, 12, 16, dark).ellipse(35, 17, 9, 12, light);
    p.ellipse(20, 32, 12, 13, fur).ellipse(20, 35, 6, 7, light);
    p.ellipse(18, 14, 9, 8, fur);
    p.poly([[12, 10], [11, 1], [16, 7]], fur).poly([[21, 8], [24, 0], [26, 8]], fur);
    p.rect(10, 9, 17, 3, band);
    p.ellipse(15, 15, 1.5, 2, K).ellipse(21, 15, 1.5, 2, K);
    p.line(4, 26, 10, 30, fur).line(30, 26, 38, 22, fur);
    p.rect(12, 43, 5, 4, dark).rect(23, 43, 5, 4, dark);
    p.outline(K);
  },
  /** A tiny hummingbird with a shiny green throat, wings a blur, humming music notes. */
  colibri(p) {
    const green = '#3a9a58', throat = '#78e0a0', wing = '#c8e8f0', note = '#5860c8';
    p.ellipse(17, 18, 11, 6, wing).ellipse(31, 16, 11, 6, wing);
    p.ellipse(24, 28, 7, 10, green);
    p.ellipse(24, 30, 4, 5, throat);
    p.ellipse(24, 18, 6, 6, green);
    p.line(30, 18, 44, 20, '#3a3a42');
    p.ellipse(22, 17, 1.5, 1.5, K).set(21, 16, W);
    p.poly([[21, 37], [27, 37], [24, 46]], green);
    p.rect(6, 6, 2, 6, note).ellipse(5, 12, 2, 1.5, note).rect(38, 4, 2, 5, note).ellipse(37, 9, 2, 1.5, note);
    p.outline(K);
  },
  /** A bigger hummingbird with a needle beak and a glowing throat, leaving music notes behind. */
  zumbador(p) {
    const green = '#28804a', throat = '#f8e060', wing = '#d8f0f8', note = '#5860c8';
    p.ellipse(15, 18, 13, 7, wing).ellipse(33, 15, 13, 7, wing);
    p.ellipse(22, 29, 9, 12, green).ellipse(22, 31, 5, 6, throat);
    p.ellipse(22, 16, 7, 7, green);
    p.line(29, 16, 47, 14, '#3a3a42');
    p.ellipse(20, 15, 1.5, 1.5, K).set(19, 14, W);
    p.poly([[18, 40], [26, 40], [22, 47]], green);
    p.rect(3, 30, 2, 6, note).ellipse(2, 36, 2, 1.5, note).rect(40, 30, 2, 6, note).ellipse(39, 36, 2, 1.5, note);
    p.outline(K);
  },
  /** A baby porcupine with soft spines and a curly gripping tail. */
  espinita(p) {
    const spine = '#c8b090', body = '#8a6848', face = '#e8c8a0';
    for (let a = 0; a < 9; a++) {
      const ang = Math.PI + (a / 8) * Math.PI;
      p.line(24, 30, 24 + Math.cos(ang) * 18, 30 + Math.sin(ang) * 16, spine);
    }
    p.ellipse(24, 32, 15, 11, body);
    p.ellipse(15, 33, 7, 6, face);
    p.ellipse(13, 31, 1.5, 2, K).set(12, 30, W);
    p.ellipse(9, 35, 1.5, 1, K);
    p.line(39, 34, 45, 30, body).line(45, 30, 43, 25, body).line(43, 25, 40, 27, body);
    p.rect(17, 42, 4, 3, body).rect(28, 42, 4, 3, body);
    p.outline(K);
  },
  /** A round porcupine with a doctor's head mirror; its spines look like syringes. */
  puercoespin(p) {
    const spine = '#d8d8e0', body = '#6a5038', face = '#e8c8a0';
    for (let a = 0; a < 11; a++) {
      const ang = Math.PI + (a / 10) * Math.PI;
      p.line(24, 30, 24 + Math.cos(ang) * 22, 30 + Math.sin(ang) * 20, spine);
    }
    p.ellipse(24, 32, 18, 13, body);
    p.ellipse(14, 33, 8, 7, face);
    p.ellipse(12, 31, 1.5, 2, K).set(11, 30, W);
    p.ellipse(13, 23, 4, 3, '#f0f0f8').ellipse(13, 23, 2, 1.5, '#a0c8e0');
    p.rect(16, 43, 5, 4, body).rect(29, 43, 5, 4, body);
    p.outline(K);
  },
  /** A small ancient armadillo with a domed bony shell, cracked like old stone. */
  caparazonte(p) {
    const shell = '#a89878', dark = '#706048', skin = '#c8b090';
    p.ellipse(26, 30, 15, 12, shell);
    for (const x of [16, 22, 28, 34]) p.line(x, 20, x - 1, 40, dark);
    p.line(14, 30, 39, 30, dark);
    p.ellipse(10, 34, 6, 5, skin);
    p.ellipse(8, 32, 1.5, 2, K).set(7, 31, W);
    p.poly([[40, 34], [46, 38], [40, 38]], skin);
    p.rect(15, 40, 4, 4, skin).rect(31, 40, 4, 4, skin);
    p.outline(K);
  },
  /** A giant prehistoric armadillo with a huge dome shell and a spiked tail club. */
  gliptodon(p) {
    const shell = '#988868', dark = '#605038', skin = '#c0a888';
    p.ellipse(24, 26, 20, 16, shell);
    for (let y = 14; y < 40; y += 5) for (let x = 8 + (y % 2) * 2; x < 42; x += 6) p.ellipse(x, y, 1.5, 1.5, dark);
    p.ellipse(6, 32, 5, 5, skin);
    p.ellipse(4, 30, 1.5, 2, K);
    p.rect(42, 30, 4, 4, dark).set(46, 29, dark).set(46, 34, dark);
    p.rect(12, 40, 6, 6, skin).rect(30, 40, 6, 6, skin);
    p.outline(K);
  },
  /** Nicaragua's national bird: turquoise brows, green body, rust belly, a long tail with two racket tips. */
  guardabarranco(p) {
    const green = '#4a9a48', turq = '#40c8d0', rust = '#c06030', tail = '#2a7a90';
    p.line(28, 30, 40, 44, tail).line(29, 30, 41, 44, tail);
    p.line(26, 30, 30, 46, tail).line(27, 30, 31, 46, tail);
    p.ellipse(41, 44, 3, 2.5, tail).ellipse(31, 46, 3, 2.5, tail);
    p.ellipse(22, 26, 10, 9, green);
    p.ellipse(21, 30, 6, 5, rust);
    p.ellipse(18, 15, 7, 7, green);
    p.line(12, 12, 23, 11, turq);
    p.line(11, 16, 4, 18, '#3a3a42');
    p.ellipse(16, 15, 1.5, 1.5, K).set(15, 14, W);
    p.rect(19, 34, 2, 4, '#3a3a42').rect(24, 34, 2, 4, '#3a3a42');
    p.outline(K);
  },
  /** A chubby caterpillar with rainbow stripes and tiny pink feet. */
  gusanito(p) {
    const stripes = ['#e85858', '#f0a040', '#f0d850', '#68c060', '#5890e0', '#9070d0'];
    stripes.forEach((c, i) => p.ellipse(10 + i * 6, 32 - Math.sin(i / 1.6) * 4, 6, 7, c));
    p.ellipse(42, 24, 6, 7, '#68c060');
    p.ellipse(41, 22, 1.5, 2, K).set(40, 21, W);
    p.line(40, 17, 37, 11, K).line(44, 17, 46, 11, K);
    for (let i = 0; i < 6; i++) p.rect(8 + i * 6, 38, 2, 2, '#f0a0b8');
    p.outline(K);
  },
  /** A sleepy cocoon wrapped in leaves, colorful wing tips peeking out. */
  capullito(p) {
    const leaf = '#78b048', dark = '#4a7a28';
    p.line(24, 2, 24, 8, '#6a4a28');
    p.poly([[13, 40], [24, 46], [35, 40], [37, 18], [24, 7], [11, 18]], leaf);
    for (const y of [16, 24, 32]) p.line(13, y, 35, y + 4, dark);
    p.poly([[11, 28], [4, 22], [8, 34]], '#e86890').poly([[37, 28], [44, 22], [40, 34]], '#5890e0');
    p.line(19, 22, 22, 22, K).line(26, 22, 29, 22, K);
    p.outline(K);
  },
  /** A lean, fast hare with big feet and a number pattern on its fur. */
  liebron(p) {
    const fur = '#c8b090', light = '#f0e0c8', dark = '#8a7050';
    p.poly([[18, 14], [14, 0], [20, 2], [22, 13]], fur).poly([[26, 13], [28, 0], [33, 3], [30, 15]], fur);
    p.ellipse(24, 32, 11, 12, fur);
    p.ellipse(24, 34, 6, 8, light);
    p.ellipse(24, 18, 8, 7, fur);
    p.ellipse(21, 17, 1.5, 2, K).ellipse(27, 17, 1.5, 2, K);
    p.set(20, 16, W).set(26, 16, W);
    p.rect(30, 26, 2, 5, dark).rect(33, 26, 3, 1, dark).rect(33, 30, 3, 1, dark); // a "1" and "2" on its fur
    p.ellipse(15, 45, 7, 2.5, dark).ellipse(33, 45, 7, 2.5, dark);
    p.outline(K);
  },
  /** A floating red cushion with a tassel and sleepy eyes. */
  cojincito(p) {
    const red = '#d05050', dark = '#983030', gold = '#f0c050';
    p.poly([[8, 18], [24, 13], [40, 18], [42, 34], [24, 39], [6, 34]], red);
    p.poly([[24, 30], [40, 26], [42, 34], [24, 39]], dark);
    p.line(40, 18, 46, 12, gold).ellipse(46, 11, 2, 2, gold);
    p.line(17, 25, 21, 25, K).line(27, 25, 31, 25, K);
    p.ellipse(24, 31, 2, 1, K);
    p.ellipse(24, 45, 10, 2, '#c8c8d0');
    p.outline(K);
  },
  /** A big armadillo whose shell is a pile of dry leaves, with a flowering bush on its back. */
  hojarasco(p) {
    const leaf = '#c89848', dark = '#8a6428', skin = '#a89070';
    p.ellipse(26, 30, 18, 13, leaf);
    for (let i = 0; i < 7; i++) p.ellipse(13 + i * 4.5, 24 + (i % 2) * 6, 3, 2, dark);
    p.ellipse(26, 16, 9, 6, '#4a9a40');
    p.ellipse(22, 13, 2, 2, '#f080a0').ellipse(30, 14, 2, 2, '#f0e060');
    p.ellipse(8, 34, 6, 5, skin);
    p.ellipse(6, 32, 1.5, 2, K);
    p.rect(14, 41, 5, 5, skin).rect(32, 41, 5, 5, skin);
    p.outline(K);
  },
  /** A big purple bat with ears like satellite dishes and a wide mouth. */
  murcielon(p) {
    const fur = '#6a4888', wing = '#4a3070', ear = '#e8a0c0';
    p.poly([[24, 26], [1, 8], [0, 34], [7, 28], [11, 38], [16, 30], [22, 38]], wing);
    p.poly([[24, 26], [47, 8], [48, 34], [41, 28], [37, 38], [32, 30], [26, 38]], wing);
    p.ellipse(13, 9, 7, 8, fur).ellipse(35, 9, 7, 8, fur);
    p.ellipse(13, 9, 4, 5, ear).ellipse(35, 9, 4, 5, ear);
    p.ellipse(24, 25, 12, 12, fur);
    p.ellipse(19, 21, 2, 2.5, K).ellipse(29, 21, 2, 2.5, K);
    p.rect(18, 28, 12, 3, K).set(19, 29, W).set(28, 29, W);
    p.outline('#22103a');
  },
  /** A huge hairy tarantula with striped legs and eight eyes in a row. */
  taranton(p) {
    const fur = '#5a3818', band = '#e08038';
    for (let i = 0; i < 4; i++) {
      const y = 20 + i * 6;
      p.line(16, y, 4, y - 5 + i * 2, fur).line(4, y - 5 + i * 2, 1, y + 8, fur).line(16, y + 1, 5, y - 4 + i * 2, fur);
      p.line(32, y, 44, y - 5 + i * 2, fur).line(44, y - 5 + i * 2, 47, y + 8, fur).line(32, y + 1, 43, y - 4 + i * 2, fur);
      p.set(6, y - 4 + i * 2, band).set(42, y - 4 + i * 2, band).set(3, y + 3, band).set(45, y + 3, band);
    }
    p.ellipse(24, 34, 13, 11, fur).ellipse(24, 36, 6, 4, band);
    p.ellipse(24, 20, 11, 9, fur);
    for (let i = 0; i < 8; i++) p.set(17 + i * 2, 17, i % 2 ? K : '#f0d040');
    p.rect(20, 25, 2, 3, '#f0e8e0').rect(26, 25, 2, 3, '#f0e8e0');
    p.outline('#1a0a04');
  },
  /** A Hercules beetle with a long double horn and a rainbow-shiny shell. */
  herculeo(p) {
    const shell = '#3a7a6a', dark = '#1e4a40', horn = '#2a2a30';
    for (const y of [30, 36, 42]) p.line(13, y, 3, y + 4, dark).line(35, y, 45, y + 4, dark);
    p.ellipse(24, 33, 15, 12, shell);
    p.line(24, 22, 24, 45, dark);
    p.ellipse(17, 28, 4, 3, '#e8a0c0').ellipse(31, 28, 4, 3, '#a0d0f0').ellipse(18, 38, 3, 2, '#f0e080');
    p.ellipse(24, 19, 8, 5, dark);
    p.poly([[21, 17], [27, 17], [26, 1], [22, 4]], horn);
    p.poly([[22, 20], [26, 20], [30, 10], [27, 9]], horn);
    p.ellipse(20, 20, 1.5, 1.5, W).ellipse(28, 20, 1.5, 1.5, W);
    p.outline('#0a1410');
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

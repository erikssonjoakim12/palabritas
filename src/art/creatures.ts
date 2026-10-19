import { Pix, mirror, fromRows, trim, type Img } from './pixel';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).
const K = '#1a1a26';
const W = '#ffffff';

type Draw = (p: Pix) => void;

const DRAW: Record<string, Draw> = {
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
  /** A small red crab with one big claw and eyes on stalks. */
  cangrejito(p) {
    const red = '#d85040', dark = '#a03028';
    for (const x of [12, 16, 32, 36]) p.line(x, 34, x - (x < 24 ? 6 : -6), 42, dark);
    p.ellipse(24, 31, 13, 9, red).ellipse(26, 35, 10, 4, dark);
    p.ellipse(8, 22, 7, 6, red).poly([[3, 18], [8, 22], [2, 24]], '#f0f0e8'); // the big claw
    p.ellipse(39, 24, 4, 4, red);
    p.line(20, 24, 19, 15, dark).line(28, 24, 29, 15, dark);
    p.ellipse(19, 14, 2.5, 2.5, W).ellipse(29, 14, 2.5, 2.5, W).set(19, 14, K).set(29, 14, K);
    p.line(21, 30, 27, 30, K);
    p.outline(K);
  },
  /** A huge crab with boxing-glove claws. */
  cangrejon(p) {
    const red = '#c84030', dark = '#902820', glove = '#e84848';
    for (const x of [12, 16, 32, 36]) p.line(x, 36, x - (x < 24 ? 8 : -8), 46, dark);
    p.ellipse(24, 32, 16, 11, red).ellipse(26, 37, 12, 5, dark);
    p.ellipse(6, 20, 6, 7, glove).ellipse(42, 20, 6, 7, glove);
    p.line(10, 26, 14, 30, red).line(38, 26, 34, 30, red);
    p.line(20, 22, 18, 12, dark).line(28, 22, 30, 12, dark);
    p.ellipse(18, 11, 2.5, 2.5, W).ellipse(30, 11, 2.5, 2.5, W).set(18, 11, K).set(30, 11, K);
    p.line(19, 31, 29, 31, K);
    p.outline(K);
  },
  /** A green coconut with a cute face and a little palm-leaf tuft on top. */
  coquito(p) {
    const green = '#6ab040', dark = '#3a7a28', leaf = '#4a9a38';
    p.poly([[24, 12], [14, 4], [20, 10]], leaf).poly([[24, 12], [34, 3], [28, 10]], leaf).poly([[24, 12], [24, 1], [26, 11]], leaf);
    p.ellipse(24, 29, 16, 16, green);
    p.ellipse(30, 34, 9, 9, dark);
    p.ellipse(18, 27, 2, 2.5, K).ellipse(29, 27, 2, 2.5, K).set(17, 26, W).set(28, 26, W);
    p.ellipse(23, 34, 2, 1, K);
    p.outline(K);
  },
  /** A coconut-palm creature: a coconut head on a curved trunk, swaying frond arms. */
  cocotero(p) {
    const trunk = '#a87848', green = '#4a9a38', nut = '#8a5a30';
    p.poly([[22, 47], [27, 47], [31, 22], [25, 22]], trunk);
    for (const [x, y] of [[4, 18], [44, 14], [10, 6], [38, 4]]) p.line(28, 16, x, y, green).line(28, 17, x, y + 1, green);
    p.ellipse(28, 17, 8, 7, green);
    p.ellipse(24, 23, 4, 4, nut).ellipse(32, 23, 4, 4, nut);
    p.ellipse(25, 15, 1.5, 2, K).ellipse(31, 15, 1.5, 2, K);
    p.outline(K);
  },
  /** A big bull shark with a wide grin full of teeth and a scar. */
  mordiscon(p) {
    const blue = '#5a7898', belly = '#d8e0e8';
    p.poly([[2, 30], [40, 18], [46, 28], [40, 38], [6, 36]], blue);
    p.poly([[20, 22], [26, 6], [30, 20]], blue).poly([[2, 30], [0, 18], [8, 30]], blue).poly([[2, 34], [0, 44], [8, 34]], blue);
    p.poly([[10, 34], [40, 34], [40, 38], [6, 36]], belly);
    p.line(28, 32, 44, 30, K);
    for (let x = 30; x < 44; x += 3) p.set(x, 31, W);
    p.ellipse(38, 24, 1.8, 1.8, K).set(37, 23, W);
    p.line(32, 20, 36, 26, '#e8a0a0');
    p.outline(K);
  },
  /** A small round striped fish (mojarra) with big surprised eyes. */
  mojarrita(p) {
    const silver = '#b8c8d8', stripe = '#6a88a8', fin = '#e8a050';
    p.poly([[6, 26], [0, 16], [0, 36]], fin);
    p.ellipse(24, 26, 17, 12, silver);
    for (const x of [16, 22, 28]) p.line(x, 16, x, 36, stripe);
    p.poly([[20, 14], [28, 6], [32, 15]], fin);
    p.ellipse(34, 22, 4, 4, W).ellipse(34, 22, 2, 2, K);
    p.ellipse(40, 29, 2, 1.5, K);
    p.outline(K);
  },
  /** A brown pelican chick whose pouch looks like a little backpack. */
  pelicanito(p) {
    const brown = '#a88868', light = '#e8d8c0', beak = '#e8b848';
    p.ellipse(22, 32, 13, 11, brown).ellipse(20, 35, 7, 6, light);
    p.ellipse(28, 16, 7, 7, light);
    p.poly([[32, 16], [47, 20], [33, 20]], beak).ellipse(38, 24, 6, 4, '#d89838');
    p.ellipse(28, 14, 1.5, 2, K).set(27, 13, W);
    p.rect(17, 42, 3, 5, beak).rect(25, 42, 3, 5, beak);
    p.outline(K);
  },
  /** A big pelican whose beak pouch is a travel suitcase covered in stickers. */
  maleticano(p) {
    const brown = '#8a6848', light = '#e8d8c0', beak = '#e8b848', bag = '#7a4a28';
    p.poly([[4, 36], [12, 22], [22, 30]], brown);
    p.ellipse(20, 32, 15, 12, brown).ellipse(18, 36, 8, 6, light);
    p.ellipse(28, 12, 7, 7, light);
    p.poly([[32, 11], [47, 14], [34, 16]], beak);
    p.rect(30, 18, 16, 12, bag).rect(36, 16, 4, 2, K);
    p.rect(32, 20, 4, 3, '#58a8e8').rect(40, 24, 4, 3, '#e85858').rect(33, 25, 3, 3, '#f0d040');
    p.ellipse(28, 10, 1.5, 2, K);
    p.rect(14, 43, 3, 4, beak).rect(22, 43, 3, 4, beak);
    p.outline(K);
  },
  /** An olive ridley hatchling with big eyes and a heart-shaped shell. */
  paslamita(p) {
    const shell = '#7a8a48', skin = '#a8b878', dark = '#4a5a28';
    p.ellipse(8, 24, 6, 3, skin).ellipse(40, 24, 6, 3, skin).ellipse(12, 38, 5, 3, skin).ellipse(36, 38, 5, 3, skin);
    p.poly([[24, 44], [10, 30], [12, 20], [18, 17], [24, 22], [30, 17], [36, 20], [38, 30]], shell);
    p.line(24, 22, 24, 40, dark).line(16, 28, 32, 28, dark);
    p.ellipse(24, 13, 6, 5, skin);
    p.ellipse(21, 12, 2, 2.5, K).ellipse(27, 12, 2, 2.5, K).set(20, 11, W).set(26, 11, W);
    p.outline(K);
  },
  /** A big mother sea turtle with a wide olive shell and strong flippers. */
  paslamona(p) {
    const shell = '#6a7a40', skin = '#98a868', dark = '#3a4a20';
    p.poly([[2, 26], [12, 20], [14, 30]], skin).poly([[46, 26], [36, 20], [34, 30]], skin);
    p.ellipse(10, 42, 7, 3, skin).ellipse(38, 42, 7, 3, skin);
    p.ellipse(24, 32, 18, 13, shell);
    for (const [x, y] of [[18, 28], [30, 28], [24, 36], [16, 37], [32, 37]]) p.ellipse(x, y, 3.5, 3, dark);
    p.ellipse(24, 14, 7, 6, skin);
    p.ellipse(21, 13, 1.5, 2, K).ellipse(27, 13, 1.5, 2, K);
    p.outline(K);
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
  // ----- Placeholders for region 4's Palabritas, until the real art arrives (Brasita has the user's art) -----
  /** A bigger fire lizard with rock-hard dark scales and embers along its back. */
  brasaurio(p) {
    const body = '#5a3a34', belly = '#c8784a', ember = '#f08030', glow = '#f8d058';
    p.poly([[30, 34], [46, 30], [44, 36], [32, 40]], body); // tail
    p.ellipse(22, 32, 14, 9, body);
    p.ellipse(22, 35, 9, 5, belly);
    p.ellipse(10, 22, 8, 7, body); // head
    p.rect(12, 38, 4, 6, body).rect(26, 38, 4, 6, body);
    for (let i = 0; i < 5; i++) p.poly([[14 + i * 5, 24], [16 + i * 5, 18], [18 + i * 5, 24]], ember);
    p.ellipse(45, 31, 2, 3, glow);
    p.ellipse(8, 20, 1.5, 2, glow).set(4, 24, K).set(5, 24, K);
    p.outline('#201010');
  },
  /** A huge volcanic dragon-lizard: dark rock, lava glowing between its scales. */
  volcasaurio(p) {
    const rock = '#3a2a2a', lava = '#f06020', glow = '#f8c040';
    p.poly([[30, 36], [47, 40], [46, 46], [28, 44]], rock); // tail
    p.ellipse(24, 30, 16, 12, rock);
    p.ellipse(11, 16, 9, 8, rock); // head
    p.poly([[6, 9], [4, 2], [10, 8]], rock).poly([[14, 8], [16, 1], [18, 9]], rock); // horns
    p.rect(12, 38, 6, 8, rock).rect(28, 38, 6, 8, rock);
    p.line(14, 26, 34, 26, lava).line(16, 31, 36, 31, lava).line(18, 36, 32, 36, lava);
    p.line(20, 22, 24, 38, lava).line(30, 22, 28, 38, lava);
    for (let i = 0; i < 4; i++) p.poly([[18 + i * 6, 19], [21 + i * 6, 11], [24 + i * 6, 19]], lava);
    p.ellipse(9, 14, 2, 2, glow).rect(3, 19, 6, 1, glow);
    p.outline('#100808');
  },
  /** A red leafcutter ant carrying a leaf bigger than itself, wearing a tiny hard hat. */
  hormiguita(p) {
    const red = '#c84a30', leaf = '#58a040', hat = '#f0c030';
    p.poly([[22, 2], [44, 8], [36, 22], [20, 14]], leaf).line(22, 4, 38, 18, '#3a7028');
    p.ellipse(34, 32, 9, 7, red).ellipse(22, 31, 5, 4, red).ellipse(12, 26, 7, 6, red);
    for (const x of [18, 23, 28]) p.line(x, 33, x - 4, 42, K).line(x, 33, x + 4, 42, K);
    p.line(9, 21, 4, 14, K).line(15, 20, 18, 12, K);
    p.ellipse(12, 20, 6, 3, hat).rect(6, 21, 12, 1, hat);
    p.ellipse(9, 26, 1.5, 2, K).ellipse(15, 26, 1.5, 2, K);
    p.outline(K);
  },
  /** A big ant built from gray concrete blocks, carrying a stone slab. */
  hormigon(p) {
    const gray = '#9a9a9a', dark = '#6a6a6a', slab = '#c8c0b0';
    p.rect(8, 4, 32, 8, slab);
    p.rect(30, 26, 14, 12, gray).rect(18, 26, 10, 10, gray).rect(6, 18, 12, 12, gray);
    p.line(30, 32, 44, 32, dark).line(37, 26, 37, 38, dark).line(6, 24, 18, 24, dark);
    for (const x of [20, 26, 32, 38]) p.rect(x, 38, 3, 8, dark);
    p.line(12, 18, 14, 12, dark).line(36, 26, 34, 12, dark); // arms holding the slab
    p.rect(9, 22, 2, 3, K).rect(14, 22, 2, 3, K);
    p.outline('#2a2a2a');
  },
  /** A firefly whose glowing tail throws sparks like a firework. */
  chispita(p) {
    const body = '#4a3a2a', wing = '#d0e8f0', tail = '#f8d040', spark = '#f07030';
    p.ellipse(16, 16, 8, 6, wing).ellipse(30, 14, 8, 6, wing);
    p.ellipse(22, 24, 7, 6, body);
    p.ellipse(30, 32, 7, 6, tail);
    p.ellipse(14, 22, 6, 5, body);
    for (const [x, y] of [[40, 30], [42, 38], [36, 42], [44, 24], [38, 46]]) p.set(x, y, spark).set(x + 1, y, spark).set(x, y + 1, spark);
    p.line(12, 17, 8, 10, body).line(16, 17, 18, 10, body);
    p.ellipse(12, 22, 1.5, 2, W).ellipse(16, 22, 1.5, 2, W);
    p.outline(K);
  },
  /** A big beetle with a rocket-shaped shell and a trail of colorful sparks. */
  coheton(p) {
    const shell = '#c83838', stripe = '#f8d040', under = '#3a2a3a';
    for (const [x, y, c] of ([[8, 44, '#f07030'], [14, 40, '#58b0f0'], [6, 36, '#f8d040'], [16, 46, '#a060d0']] as const)) p.ellipse(x, y, 2, 2, c);
    p.poly([[22, 40], [16, 32], [30, 6], [40, 22], [34, 40]], shell);
    p.line(20, 32, 36, 30, stripe).line(24, 24, 38, 22, stripe);
    p.poly([[30, 6], [34, 2], [36, 12]], stripe);
    for (const y of [28, 34, 40]) p.line(18, y, 10, y + 3, under).line(36, y, 44, y + 3, under);
    p.ellipse(28, 14, 2, 2.5, W).ellipse(34, 16, 2, 2.5, W).set(28, 14, K).set(34, 16, K);
    p.outline(K);
  },
  /** A green parakeet with an orange forehead and a chatty open beak. */
  chocoyito(p) {
    const green = '#58b048', dark = '#3a8030', orange = '#f08838', beak = '#e8e0c0';
    p.poly([[26, 34], [30, 46], [22, 44]], dark); // tail
    p.ellipse(24, 28, 11, 12, green);
    p.ellipse(32, 28, 5, 9, dark); // wing
    p.ellipse(22, 14, 9, 8, green);
    p.ellipse(22, 8, 5, 3, orange);
    p.poly([[12, 14], [16, 12], [16, 18]], beak).poly([[12, 17], [16, 18], [15, 20]], '#c8a890');
    p.ellipse(20, 13, 2, 2.5, K).set(19, 12, W);
    p.rect(20, 39, 2, 4, '#8a6a4a').rect(26, 39, 2, 4, '#8a6a4a');
    p.outline('#1a3a14');
  },
  /** A big parakeet with flame-colored wing tips. */
  chocoyote(p) {
    const green = '#4a9a40', flame = '#f06020', yellow = '#f8c040', beak = '#e8e0c0';
    p.poly([[28, 34], [36, 47], [24, 45]], green);
    p.poly([[30, 24], [47, 14], [42, 26], [46, 30], [32, 34]], green); // spread wing
    p.poly([[42, 14], [47, 10], [47, 20]], flame).poly([[43, 27], [47, 26], [46, 32]], yellow);
    p.ellipse(22, 28, 11, 13, green);
    p.ellipse(20, 12, 9, 8, green);
    p.ellipse(20, 5, 6, 3, flame);
    p.poly([[10, 12], [14, 10], [14, 16]], beak);
    p.ellipse(18, 11, 2, 2.5, K).set(17, 10, W);
    p.outline('#1a3014');
  },
  /** A scruffy black vulture chick with a bald gray head, holding a tiny broom. */
  zopilotito(p) {
    const black = '#2e2a30', gray = '#a8a0a8', broom = '#c8a050', stick = '#8a5a2a';
    p.line(36, 14, 30, 40, stick);
    p.poly([[26, 38], [34, 38], [32, 46], [24, 46]], broom);
    p.ellipse(22, 30, 11, 11, black);
    p.poly([[12, 22], [8, 34], [16, 30]], black).poly([[30, 22], [36, 32], [30, 30]], black);
    p.ellipse(20, 14, 7, 7, gray);
    p.poly([[13, 14], [9, 17], [14, 18]], '#d8d0c0');
    p.ellipse(19, 12, 1.5, 2, K).set(18, 11, W);
    p.rect(18, 40, 2, 5, gray).rect(25, 40, 2, 5, gray);
    p.outline('#100c10');
  },
  /** A big black vulture with broad wings and a street-sweeper's cap. */
  zopiloton(p) {
    const black = '#2a2630', gray = '#a8a0a8', cap = '#f08838';
    p.poly([[24, 24], [2, 14], [4, 30], [14, 30]], black).poly([[24, 24], [46, 14], [44, 30], [34, 30]], black);
    p.ellipse(24, 30, 11, 12, black);
    p.ellipse(24, 14, 7, 7, gray);
    p.ellipse(24, 9, 7, 3, cap).rect(24, 9, 9, 2, cap);
    p.poly([[17, 15], [13, 18], [18, 19]], '#d8d0c0');
    p.ellipse(22, 14, 1.5, 2, K).ellipse(27, 14, 1.5, 2, K);
    p.rect(19, 41, 2, 5, gray).rect(27, 41, 2, 5, gray);
    p.outline('#100c10');
  },
  /** A fawn wearing a colorful festival mask with ribbons. */
  venadito(p) {
    const fur = '#c88a50', spots = '#f0e0c0', mask = '#e04848', ribbon = '#58b0f0';
    p.ellipse(28, 30, 12, 8, fur);
    for (const [x, y] of [[24, 27], [30, 26], [34, 30], [27, 32]]) p.ellipse(x, y, 1.5, 1.5, spots);
    for (const x of [19, 24, 32, 36]) p.rect(x, 36, 2, 10, fur);
    p.ellipse(16, 18, 7, 7, fur);
    p.poly([[10, 12], [6, 4], [13, 10]], fur).poly([[20, 12], [24, 4], [19, 10]], fur); // ears
    p.ellipse(15, 17, 7, 4, mask);
    p.line(22, 15, 30, 10, ribbon).line(22, 17, 32, 16, '#f8d040');
    p.ellipse(12, 17, 1.5, 1.5, K).ellipse(18, 17, 1.5, 1.5, K);
    p.ellipse(10, 23, 2, 1.5, K);
    p.outline('#3a2010');
  },
  /** A dancing stag-bull: antlers and bull horns, a festival mask and ribbons. */
  torovenado(p) {
    const fur = '#8a5a34', mask = '#e04848', horn = '#f0e8d0', ribbon = '#58b0f0';
    p.line(14, 10, 6, 2, horn).line(9, 5, 4, 8, horn).line(30, 10, 38, 2, horn).line(35, 5, 40, 8, horn); // antlers
    p.poly([[12, 14], [6, 12], [12, 18]], horn).poly([[32, 14], [38, 12], [32, 18]], horn); // bull horns
    p.ellipse(22, 16, 9, 8, fur);
    p.ellipse(22, 15, 9, 5, mask);
    p.ellipse(18, 15, 1.5, 1.5, K).ellipse(26, 15, 1.5, 1.5, K);
    p.ellipse(22, 34, 10, 11, fur);
    p.poly([[12, 30], [4, 22], [8, 32]], fur).poly([[32, 30], [42, 24], [36, 32]], fur); // dancing arms
    p.line(14, 28, 6, 40, ribbon).line(30, 28, 40, 40, '#f8d040').line(22, 26, 22, 44, '#a060d0');
    p.rect(16, 44, 4, 3, fur).rect(25, 44, 4, 3, fur);
    p.outline('#2a1408');
  },
  /** A baby sloth asleep in a striped Nicaraguan hammock. */
  perezosito(p) {
    const fur = '#a08060', face = '#e8d8b8', red = '#d84848', blue = '#4878c8', yellow = '#f0c840';
    p.line(2, 14, 10, 26, '#8a6a4a').line(46, 14, 38, 26, '#8a6a4a'); // ropes
    p.ellipse(24, 26, 9, 8, fur); // the sloth, curled up
    p.ellipse(22, 24, 5, 4, face);
    p.line(19, 24, 21, 24, K).line(23, 24, 25, 24, K); // closed eyes
    p.rect(21, 27, 2, 1, '#6a4a3a');
    for (let i = 0; i < 6; i++) p.poly([[8 + i * 5, 28 + Math.abs(i - 2.5) * -1], [13 + i * 5, 28 + Math.abs(i - 2.5) * -1], [13 + i * 5, 38], [8 + i * 5, 38]], [red, blue, yellow][i % 3]);
    p.ellipse(24, 38, 16, 3, red);
    p.stamp(32, 12, ['111', '0010', '01', '111'], '#6a6a8a'); // zzz
    p.outline(K);
  },
  /** An old oil lamp with a ghostly flame face. */
  lamparita(p) {
    const brass = '#c8a040', dark = '#8a6a28', glass = '#d0e8f0', flame = '#5890f0', core = '#c8e0f8';
    p.ellipse(24, 40, 12, 4, brass);
    p.rect(20, 32, 8, 8, dark);
    p.ellipse(24, 22, 10, 12, glass);
    p.ellipse(24, 24, 6, 9, flame);
    p.ellipse(24, 26, 3, 5, core);
    p.ellipse(22, 22, 1.5, 2, K).ellipse(26, 22, 1.5, 2, K);
    p.ellipse(24, 27, 1.5, 1, K);
    p.rect(18, 8, 12, 3, dark).line(24, 8, 24, 2, dark).ellipse(24, 2, 3, 2, brass);
    p.poly([[34, 30], [42, 26], [42, 32], [36, 34]], brass); // handle
    p.outline('#2a1a08');
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

import { Pix, mirror, fromRows, trim, makeCanvas, type Img } from './pixel';
import { SPRITE_INK, VIPER as V, TREEFROG as F, DARTFROG as D, LUNAMOTH as M, DUENDE as U, CAPUCHIN as C, QUETZAL as Q, CADEJOS as J, FRIGATE as R, LIZARD as L, TAPIR as T, MARGAY as G, CAIMAN as K, BASILISK as B, SALAMANDER as S, SERPENT as E } from '../style/colors';
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
  /** Tijeretita: a young frigatebird, black with a white head, a forked tail and a small yellow pouch. */
  tijeretita(p) {
    p.poly([[30, 34], [44, 40], [36, 34], [44, 32]], R.black); // the forked tail
    p.ellipse(24, 30, 10, 8, R.black);
    p.poly([[18, 26], [6, 18], [20, 32]], R.sheen); // a wing
    p.ellipse(16, 20, 7, 6, R.white);
    p.ellipse(18, 27, 4, 3, R.pouch);
    p.poly([[10, 19], [3, 22], [10, 22]], R.beak);
    p.ellipse(14, 18, 1.4, 1.6, SPRITE_INK);
    p.rect(21, 37, 2, 4, R.beak).rect(26, 37, 2, 4, R.beak);
    p.outline(SPRITE_INK);
  },
  /** Fragatón: wings spread wide, a huge glowing yellow pouch, a long forked tail. */
  fragaton(p) {
    p.poly([[2, 14], [20, 22], [16, 28]], R.black).poly([[46, 14], [28, 22], [32, 28]], R.black);
    p.poly([[22, 36], [16, 47], [24, 40], [32, 47], [26, 36]], R.black);
    p.ellipse(24, 28, 8, 9, R.black);
    p.ellipse(24, 32, 7, 7, R.pouch).ellipse(22, 30, 3, 3, R.pouchLight);
    p.ellipse(24, 15, 5, 5, R.black);
    p.poly([[20, 15], [12, 18], [20, 18]], R.beak);
    p.ellipse(23, 13, 1.4, 1.6, R.white);
    for (const [x, y] of [[14, 30], [34, 30], [24, 41]]) p.set(x, y, R.pouchLight);
    p.outline(SPRITE_INK);
  },
  /** Gequito: a small yellow-green gecko with big eyes, round toe pads and yellow spots. */
  gequito(p) {
    p.poly([[30, 36], [44, 40], [32, 40]], L.green); // the tail
    p.ellipse(22, 36, 11, 5, L.green);
    p.ellipse(10, 31, 7, 5, L.green);
    p.ellipse(8, 29, 2.5, 2.5, L.eye).set(8, 29, SPRITE_INK);
    for (const [x, y] of [[14, 41], [28, 41], [17, 31], [30, 32]]) p.ellipse(x, y, 2, 1.5, L.greenDark);
    for (const [x, y] of [[20, 34], [26, 35], [33, 38], [14, 30]]) p.ellipse(x, y, 1.3, 1.3, L.yellow);
    p.outline(SPRITE_INK);
  },
  /** Garrobón: a big dark spiny-tailed iguana on its front legs, a crest of spikes and splashes of yellow. */
  garrobon(p) {
    p.poly([[30, 40], [47, 34], [46, 38], [32, 44]], L.dark); // the tail
    for (let x = 34; x < 46; x += 3) p.poly([[x, 37 - (x - 34) / 3], [x + 1, 33 - (x - 34) / 3], [x + 2, 37 - (x - 34) / 3]], L.darkLight);
    p.ellipse(24, 35, 13, 8, L.dark);
    p.ellipse(22, 38, 9, 4, L.belly);
    p.ellipse(11, 24, 8, 7, L.dark);
    for (let x = 12; x < 32; x += 4) p.poly([[x, 28], [x + 2, 21], [x + 4, 28]], L.darkLight);
    p.rect(10, 30, 4, 12, L.dark).rect(30, 38, 5, 6, L.dark);
    p.ellipse(8, 22, 2, 2, L.eye).set(8, 22, SPRITE_INK);
    for (const [x, y] of [[18, 31], [25, 33], [31, 31], [14, 26], [38, 37], [11, 36]]) p.ellipse(x, y, 1.8, 1.4, L.yellow);
    p.outline(SPRITE_INK);
  },
  /** Dantito: a brown tapir calf with white zig-zag stripes, a short trunk. */
  dantito(p) {
    p.ellipse(26, 30, 14, 9, T.brown);
    for (const x of [15, 20, 31, 36]) p.rect(x, 34, 4, 9, T.brown);
    p.ellipse(12, 26, 7, 6, T.brownLight);
    p.poly([[6, 26], [2, 30], [6, 31]], T.brownLight); // the trunk
    for (const y of [25, 30, 35]) for (let x = 16; x < 38; x += 4) p.line(x, y, x + 2, y - 2, T.stripe).line(x + 2, y - 2, x + 4, y, T.stripe);
    p.ellipse(10, 24, 1.3, 1.5, SPRITE_INK);
    p.poly([[12, 19], [14, 16], [16, 20]], T.brownLight);
    p.outline(SPRITE_INK);
  },
  /** Dantón: big and grey-brown, a pale face, a long trunk crackling with sparks. */
  danton(p) {
    p.ellipse(26, 27, 18, 12, T.grey);
    for (const x of [12, 18, 32, 38]) p.rect(x, 33, 5, 12, T.greyDark);
    p.ellipse(10, 22, 8, 7, T.grey);
    p.ellipse(8, 21, 5, 4, T.pale);
    p.poly([[4, 22], [0, 30], [3, 31], [6, 24]], T.grey); // the trunk
    p.ellipse(8, 19, 1.4, 1.6, SPRITE_INK);
    p.poly([[11, 14], [13, 10], [15, 15]], T.pale);
    for (const [x, y] of [[1, 33], [4, 34], [0, 36]]) p.set(x, y, T.spark);
    p.outline(SPRITE_INK);
  },
  /** Tigrillo: a slim golden cat with dark rosettes, huge eyes and a long ringed tail, mid-leap. */
  tigrillo(p) {
    p.poly([[34, 26], [46, 14], [44, 12], [32, 24]], G.fur); // the tail, up
    for (const [x, y] of [[42, 15], [38, 19]]) p.ellipse(x, y, 1.5, 1.5, G.spot);
    p.ellipse(24, 30, 13, 7, G.fur);
    p.ellipse(22, 34, 8, 3, G.belly);
    for (const x of [14, 18, 30, 34]) p.rect(x, 34, 3, 9, G.fur);
    p.ellipse(11, 22, 7, 7, G.fur);
    p.poly([[6, 18], [7, 12], [11, 17]], G.fur).poly([[12, 16], [15, 11], [16, 17]], G.fur);
    p.ellipse(8, 21, 2.2, 2.4, G.eye).ellipse(13, 21, 2.2, 2.4, G.eye);
    p.set(8, 21, SPRITE_INK).set(13, 21, SPRITE_INK);
    p.ellipse(10, 26, 3, 2, G.belly);
    for (const [x, y] of [[20, 27], [26, 26], [31, 29], [24, 31], [17, 30], [29, 33]]) p.ellipse(x, y, 1.8, 1.5, G.spot);
    p.outline(SPRITE_INK);
  },
  /** Lagartito: a small olive caiman, low and long, eyes on top of its head, a little grin of teeth. */
  lagartito(p) {
    p.poly([[30, 36], [46, 38], [30, 41]], K.olive); // the tail
    p.ellipse(24, 37, 11, 5, K.olive);
    p.ellipse(22, 40, 8, 2, K.belly);
    p.poly([[4, 37], [14, 33], [16, 40], [4, 40]], K.olive); // the snout
    p.ellipse(13, 33, 3, 2.5, K.olive).ellipse(13, 32, 1.6, 1.6, K.eye).set(13, 32, SPRITE_INK);
    for (let x = 5; x < 14; x += 3) p.set(x, 39, K.tooth);
    for (const x of [16, 30]) p.rect(x, 40, 3, 4, K.oliveDark);
    for (const [x, y] of [[20, 34], [25, 33], [30, 34]]) p.ellipse(x, y, 1.5, 1, K.back);
    p.outline(SPRITE_INK);
  },
  /** Lagartón: a huge dark caiman, its back a row of ridges, its jaws open in a slow, toothy smile. */
  lagarton(p) {
    p.poly([[30, 34], [47, 40], [30, 42]], K.oliveDark); // the tail
    p.ellipse(24, 36, 15, 7, K.oliveDark);
    p.ellipse(22, 40, 11, 3, K.belly);
    p.poly([[0, 34], [14, 28], [16, 36], [2, 38]], K.oliveDark); // the upper jaw, open
    p.poly([[1, 41], [14, 38], [16, 42], [2, 42]], K.olive); // the lower jaw
    for (let x = 2; x < 14; x += 3) p.set(x, 37, K.tooth).set(x + 1, 39, K.tooth);
    p.ellipse(14, 28, 3.5, 3, K.oliveDark).ellipse(14, 27, 1.8, 1.8, K.eye).set(14, 27, SPRITE_INK);
    for (let x = 18; x < 40; x += 4) p.poly([[x, 30], [x + 2, 26], [x + 4, 30]], K.olive);
    for (const x of [14, 32]) p.rect(x, 41, 4, 5, K.oliveDark);
    p.outline(SPRITE_INK);
  },
  /** Basiliquito: a slim green lizard up on its back legs, mid-run, with a small crest and a long tail. */
  basiliquito(p) {
    p.poly([[26, 34], [46, 44], [44, 46], [24, 37]], B.green); // the tail
    for (let i = 0; i < 4; i++) p.ellipse(30 + i * 4, 37 + i * 2, 1, 1, B.stripe);
    p.ellipse(22, 30, 7, 9, B.green);
    p.ellipse(20, 33, 4, 5, B.belly);
    p.ellipse(15, 20, 6, 5, B.green);
    p.poly([[15, 15], [19, 9], [21, 16]], B.crest);
    p.ellipse(12, 19, 1.8, 1.8, B.eye).set(12, 19, SPRITE_INK);
    p.rect(20, 38, 3, 7, B.greenDark).rect(25, 37, 3, 6, B.greenDark); // the running legs
    p.rect(17, 45, 6, 1, B.greenDark).rect(25, 43, 6, 1, B.greenDark);
    p.outline(SPRITE_INK);
  },
  /** Basilisco: tall and fast, a great sail-like crest down its back, legs a blur over the water. */
  basilisco(p) {
    p.poly([[28, 32], [47, 44], [45, 47], [26, 36]], B.greenDark); // the tail
    p.ellipse(22, 27, 9, 11, B.green);
    p.ellipse(20, 31, 5, 6, B.belly);
    p.poly([[24, 12], [36, 16], [32, 32], [26, 30]], B.crest); // the back crest
    p.ellipse(14, 15, 7, 6, B.green);
    p.poly([[13, 9], [18, 1], [21, 11]], B.crest);
    p.ellipse(10, 14, 2, 2, B.eye).set(10, 14, SPRITE_INK);
    p.rect(18, 37, 4, 8, B.greenDark).rect(25, 36, 4, 7, B.greenDark);
    for (const x of [14, 18, 22, 26, 30]) p.set(x, 46, B.crest).set(x + 1, 45, B.crest);
    p.outline(SPRITE_INK);
  },
  /** Salamandrita: a small black salamander with glowing red and orange spots, curled on a warm stone. */
  salamandrita(p) {
    p.poly([[30, 38], [42, 32], [44, 34], [32, 41]], S.black); // the tail, curling up
    p.ellipse(24, 38, 10, 5, S.black);
    p.ellipse(12, 35, 6, 5, S.black);
    p.ellipse(9, 34, 1.8, 1.8, S.eye).set(9, 34, SPRITE_INK);
    for (const x of [16, 28]) p.rect(x, 41, 3, 4, S.dark);
    for (const [x, y, c] of [[20, 36, S.red], [26, 38, S.glow], [31, 36, S.red], [14, 32, S.glow], [38, 34, S.spark]] as const) p.ellipse(x, y, 1.6, 1.4, c);
    p.outline(SPRITE_INK);
  },
  /** Salamandrón: long and heavy, cracks of lava glowing all along its black back, smoke from its nostrils. */
  salamandron(p) {
    p.poly([[32, 34], [47, 30], [47, 34], [34, 40]], S.black); // the tail
    p.ellipse(24, 34, 14, 7, S.black);
    p.ellipse(10, 29, 8, 6, S.black);
    p.ellipse(7, 27, 2, 2, S.eye).set(7, 27, SPRITE_INK);
    for (const x of [14, 32]) p.rect(x, 38, 5, 7, S.dark);
    for (let x = 14; x < 40; x += 5) p.line(x, 29, x + 3, 33, S.glow).line(x + 3, 33, x + 1, 37, S.red);
    for (const [x, y] of [[3, 24], [1, 21], [4, 19]]) p.set(x, y, S.dark);
    p.outline(SPRITE_INK);
  },
  /** Culebrita: a little green snake coiled up, a ruff of turquoise and red feathers round its head. */
  culebrita(p) {
    p.ellipse(26, 40, 13, 5, E.green);
    p.ellipse(26, 35, 9, 4, E.light);
    p.ellipse(24, 31, 6, 3, E.green);
    p.poly([[14, 22], [10, 16], [16, 18], [18, 13], [21, 20], [24, 17], [22, 24]], E.feather); // the ruff
    p.poly([[16, 18], [18, 13], [19, 19]], E.red);
    p.ellipse(16, 25, 6, 5, E.green);
    p.poly([[9, 25], [12, 23], [12, 27]], E.gold); // the little beak
    p.ellipse(15, 24, 1.6, 1.6, E.gold).set(15, 24, SPRITE_INK);
    p.outline(SPRITE_INK);
  },
  /** Emplumón: the feathered serpent rising in coils, wide feathered wings, a crest of red and gold. */
  emplumon(p) {
    p.poly([[22, 14], [2, 2], [8, 14], [0, 18], [20, 22]], E.feather); // the wings
    p.poly([[28, 14], [46, 2], [42, 14], [48, 18], [30, 22]], E.feather);
    p.ellipse(26, 42, 14, 4, E.green);
    p.ellipse(28, 35, 8, 4, E.light);
    p.poly([[22, 34], [26, 18], [30, 18], [28, 34]], E.green); // the neck, rising
    p.ellipse(24, 15, 7, 5, E.green);
    p.poly([[22, 10], [24, 2], [27, 9], [30, 4], [30, 12]], E.red); // the crest
    p.poly([[15, 15], [18, 13], [18, 17]], E.gold); // the beak
    p.ellipse(22, 14, 1.8, 1.8, E.gold).set(22, 14, SPRITE_INK);
    for (let x = 14; x < 40; x += 5) p.set(x, 42, E.dark);
    p.outline(SPRITE_INK);
  },
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

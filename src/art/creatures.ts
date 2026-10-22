import { Pix, mirror, fromRows, trim, type Img } from './pixel';
import { PALABRITA_ART } from '../style/palabritas';

// Palabrita sprites: hand-made pixel art (style/palabritas.ts), or for the ones that don't have
// it yet, 48x48 drawings from simple shapes with a hard pixel outline (below).
const K = '#1a1a26';
const W = '#ffffff';

type Draw = (p: Pix) => void;

const DRAW: Record<string, Draw> = {
  // ----- Placeholders for region 4's Palabritas, until the user's art arrives -----
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

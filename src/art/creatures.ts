import { Pix, mirror, type Img } from './pixel';

// Creature portraits (48x48), drawn from simple shapes with a hard pixel outline.
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
  perrito(p) {
    const o = '#e88a3a', dk = '#a8521e', cr = '#fbe3b8';
    p.poly([[34, 32], [45, 16], [41, 27], [47, 24], [40, 38]], '#e83a2a');
    p.poly([[37, 31], [43, 21], [41, 32]], '#ffd23a');
    p.ellipse(26, 36, 13, 8, o);
    p.rect(16, 40, 4, 6, o).rect(31, 40, 4, 6, o);
    p.rect(16, 44, 4, 2, cr).rect(31, 44, 4, 2, cr);
    p.ellipse(24, 37, 5, 4, cr);
    p.ellipse(20, 22, 12, 11, o);
    p.ellipse(9, 23, 4, 8, dk).ellipse(31, 23, 4, 8, dk);
    p.ellipse(20, 27, 6, 4, cr);
    p.ellipse(20, 25, 2, 1.5, K);
    p.rect(19, 29, 3, 2, '#ff8aa0');
    p.ellipse(15, 20, 2, 2.5, K).ellipse(25, 20, 2, 2.5, K);
    p.set(14, 19, W).set(24, 19, W);
    p.outline('#3a1a08');
  },
  aguacatito(p) {
    const sk = '#2f6b2a', fl = '#c9e27a', pit = '#8b5a2b';
    p.ellipse(17, 46, 4, 2, sk).ellipse(31, 46, 4, 2, sk);
    p.ellipse(9, 31, 3, 2, sk).ellipse(39, 31, 3, 2, sk);
    p.ellipse(24, 18, 9, 10, sk);
    p.ellipse(24, 31, 14, 15, sk);
    p.ellipse(24, 19, 6, 7, fl);
    p.ellipse(24, 32, 11, 12, fl);
    p.ellipse(24, 35, 6, 6, pit);
    p.ellipse(22, 33, 2, 2, '#b07a45');
    p.ellipse(20, 24, 1.5, 2, K).ellipse(28, 24, 1.5, 2, K);
    p.set(20, 23, W).set(28, 23, W);
    p.set(23, 27, K).set(24, 28, K).set(25, 27, K);
    p.rect(23, 5, 2, 4, pit);
    p.poly([[25, 7], [31, 1], [34, 4], [27, 8]], '#4aa84a');
    p.outline('#163314');
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
  palomon(p) {
    const gy = '#a9a9c6', dg = '#7b7b9c';
    p.poly([[2, 30], [12, 25], [14, 37], [2, 41]], dg);
    p.ellipse(24, 31, 16, 12, gy);
    p.ellipse(20, 30, 11, 7, dg);
    p.line(12, 31, 28, 31, '#5a5a78').line(13, 34, 27, 34, '#5a5a78');
    p.ellipse(33, 17, 10, 10, gy);
    p.ellipse(31, 25, 8, 4, '#5ac0a0');
    p.ellipse(31, 28, 7, 2, '#9a6ad0');
    p.poly([[42, 15], [47, 17], [42, 20]], '#e0b070');
    p.ellipse(36, 14, 2, 2, '#e85030');
    p.set(36, 14, K);
    p.line(33, 10, 39, 12, K);
    p.rect(20, 42, 2, 5, '#e86a6a').rect(28, 42, 2, 5, '#e86a6a');
    p.outline('#2e2e44');
  },
};

export const CREATURE_ART: Record<string, { front: Img; back: Img }> = {};

export function buildCreatureArt() {
  for (const [id, draw] of Object.entries(DRAW)) {
    const p = new Pix(48, 48);
    draw(p);
    const front = p.toCanvas();
    CREATURE_ART[id] = { front, back: mirror(front) };
  }
}

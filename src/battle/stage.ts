// The battlefield: what's drawn (the Palabritas, the trainers, you, a thrown Palabola, the evolution scene) and how it
// moves (sliding in, lunging, blinking when hit, sinking when it faints, the ball's throw and shakes). battle.ts runs
// the battle and moves things here; this only draws them.
import { W, H } from '../engine/screen';
import { nextFrame, frames } from '../engine/loop';
import { sfx } from '../engine/sfx';
import { creatureArt } from '../art/creatures';
import { OBJECTS } from '../art/chars';
import { makeCanvas, type Img } from '../art/pixel';
import { EVOLUTION_OUTLINE, BLACK, BATTLE } from '../style/colors';
import { LINEUP_BALL, BALL_COLORS, FAINTED_COLORS, EMPTY_COLORS, drawPattern } from '../art/balls';
import type { Mon } from '../game/state';

/** Anything standing on the battlefield: a Palabrita, a trainer or you. */
export interface Fighter {
  img: Img;
  x: number;
  y: number;
  blink: number;
  sink: number;
  hidden: boolean;
  lunge: number;
  /** A Palabrita (not a trainer): it breathes (bobs a pixel) and hops when it comes out. */
  alive: boolean;
  /** Pixels up, while hopping out. */
  hop: number;
}

/**
 * Each side has a 56x56 slot (Gen 2's sprite size); sprites stand on its bottom, centered.
 * The opponent's slot ends at y=54, just above your health box.
 */
export const SLOT = 56;
export const ENEMY_POS = { x: 100, y: -2 };
export const ME_POS = { x: 4, y: 38 };

/** What's on the battlefield now. */
export const stage = {
  enemyF: null as Fighter | null,
  meF: null as Fighter | null,
  ball: null as { x: number; y: number; shake: number } | null,
  /** The screen flashes black (a wild encounter, an evolution's moment of change). */
  flash: false,
  /** The evolution scene: the whole screen is the evolving Palabrita (the battle waits behind it). */
  evo: null as { img: Img } | null,
  /** Gen 2 style row of Palabolas (one per Palabrita) shown when a trainer battle starts. */
  lineups: {} as { enemy?: Mon[]; me?: Mon[] },
};

/** Empty the battlefield (when a battle ends). */
export function clearStage() {
  Object.assign(stage, { enemyF: null, meF: null, ball: null, flash: false, evo: null, lineups: {} });
}

export const battleScene = {
  update() {
    for (const f of [stage.enemyF, stage.meF]) if (f && f.blink > 0) f.blink--;
  },
  render(g: CanvasRenderingContext2D) {
    g.fillStyle = stage.flash ? BLACK : BATTLE.bg;
    g.fillRect(0, 0, W, H);
    if (stage.evo) {
      // Centered over the text box, like Gold/Silver's evolution screen.
      const img = stage.evo.img;
      g.drawImage(img, Math.round((W - img.width) / 2), Math.round(48 - img.height / 2));
      return;
    }
    if (stage.flash) return;
    g.fillStyle = BATTLE.ground;
    g.beginPath();
    g.ellipse(128, 52, 24, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(32, 92, 24, 5, 0, 0, Math.PI * 2);
    g.fill();
    drawFighter(g, stage.enemyF, 0);
    drawFighter(g, stage.meF, 1);
    const ball = stage.ball;
    if (ball) g.drawImage(OBJECTS.palabola, Math.round(ball.x + ball.shake), Math.round(ball.y));
    if (stage.lineups.enemy) drawLineup(g, stage.lineups.enemy, 8, 14, false);
    if (stage.lineups.me) drawLineup(g, stage.lineups.me, 96, 80, true);
  },
};

/** How long a breath takes (ms): a Palabrita bobs up a pixel for half of it. */
const BREATH = 1000;

function drawFighter(g: CanvasRenderingContext2D, f: Fighter | null, phase: number) {
  if (!f || f.hidden || f.sink >= f.img.height) return;
  if (f.blink > 0 && Math.floor(f.blink / 4) % 2 === 0) return;
  const { width: w, height: fullH } = f.img;
  const h = fullH - f.sink; // fainting: it sinks into the ground
  const x = f.x + Math.floor((SLOT - w) / 2) + f.lunge;
  // Breathing (yours and the opponent's out of step), not while it's hit, lunging or fainting.
  const still = !f.alive || f.sink || f.lunge || f.blink || f.hop;
  const breath = still ? 0 : Math.floor(performance.now() / (BREATH / 2) + phase) % 2;
  const y = f.y + SLOT - fullH + f.sink - f.hop - breath;
  g.drawImage(f.img, 0, 0, w, h, Math.round(x), Math.round(y), w, h);
}

/** 6 slots: a ball per Palabrita (gray when fainted), empty outlines for the rest, on a bracket line. */
function drawLineup(g: CanvasRenderingContext2D, team: Mon[], x: number, y: number, tickLeft: boolean) {
  for (let i = 0; i < 6; i++) {
    const mon = team[i];
    drawPattern(g, LINEUP_BALL, x + i * 9, y, !mon ? EMPTY_COLORS : mon.hp > 0 ? BALL_COLORS : FAINTED_COLORS);
  }
  g.fillStyle = BALL_COLORS.k;
  g.fillRect(x - 3, y + 10, 6 * 9 + 4, 1);
  g.fillRect(tickLeft ? x - 3 : x + 6 * 9, y + 4, 1, 6);
}

export const fighter = (img: Img, x: number, y: number, alive = false): Fighter => ({ img, x, y, blink: 0, sink: 0, hidden: false, lunge: 0, alive, hop: 0 });
/** The opponent's side shows Palabritas from the front, yours from the back. Both start off-screen. */
export const enemyFighter = (mon: Mon) => fighter(creatureArt(mon.sp).front, -SLOT, ENEMY_POS.y, true);
export const myFighter = (mon: Mon) => fighter(creatureArt(mon.sp).back, W, ME_POS.y, true);

export async function lunge(f: Fighter, dir: number) {
  for (let i = 0; i <= 10; i++) {
    f.lunge = dir * (i <= 5 ? i : 10 - i) * 1.6;
    await nextFrame();
  }
  f.lunge = 0;
}

export async function hitAnim(f: Fighter) {
  f.blink = 24;
  await frames(24);
}

export async function sinkAnim(f: Fighter) {
  for (let i = 0; i <= 24; i++) {
    f.sink = Math.round((f.img.height * i) / 24);
    await nextFrame();
  }
  f.hidden = true;
}

/** Slide sideways to x (in from off-screen, or out to it). */
export async function slide(f: Fighter, toX: number) {
  const fromX = f.x;
  f.hidden = false;
  f.sink = 0;
  for (let i = 1; i <= 24; i++) {
    f.x = fromX + ((toX - fromX) * i) / 24;
    await nextFrame();
  }
  // A Palabrita arriving hops once (not one sliding away).
  if (f.alive && toX !== W && toX !== -SLOT) {
    for (let i = 1; i <= 14; i++) {
      f.hop = Math.round(Math.sin((Math.PI * i) / 14) * 4);
      await nextFrame();
    }
    f.hop = 0;
  }
}

export async function encounterFlash() {
  sfx('encounter');
  for (let i = 0; i < 6; i++) {
    stage.flash = i % 2 === 0;
    await frames(5);
  }
  stage.flash = false;
}

/** A Palabola thrown in an arc at the opponent, which goes inside it. */
export async function throwBall() {
  sfx('throw');
  const ball = (stage.ball = { x: 24, y: 80, shake: 0 });
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    ball.x = 24 + (122 - 24) * t;
    ball.y = 80 - 70 * t + 50 * t * t;
    await nextFrame();
  }
  stage.enemyF!.hidden = true;
  ball.y = 38;
  await frames(20);
}

/** The ball on the ground shakes, a number of times. */
export async function shakeBall(times: number) {
  const ball = stage.ball!;
  for (let k = 0; k < times; k++) {
    sfx('shake');
    for (let i = 0; i < 16; i++) {
      ball.shake = Math.sin((i / 16) * Math.PI * 2) * 3;
      await nextFrame();
    }
    ball.shake = 0;
    await frames(18);
  }
}

/** It broke out: the ball's gone and the opponent is back. */
export function breakOut() {
  stage.ball = null;
  stage.enemyF!.hidden = false;
}

/** A sprite as a solid outline (the evolution scene flashes between the two forms' outlines). */
export function silhouette(img: Img): Img {
  const c = makeCanvas(img.width, img.height);
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = EVOLUTION_OUTLINE;
  g.fillRect(0, 0, img.width, img.height);
  return c;
}

import { ctx, beginFrame } from './screen';
import { input } from './input';

export interface Scene {
  update(): void;
  render(g: CanvasRenderingContext2D): void;
}

let scene: Scene = { update() {}, render() {} };

export const setScene = (s: Scene) => {
  scene = s;
};
export const getScene = () => scene;

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
export async function frames(n: number) {
  for (let i = 0; i < n; i++) await nextFrame();
}

let alpha = 0;
/**
 * How far we are between the last update and the next one (0..1). On 90/120 Hz screens there
 * are more frames than updates; drawing moving things this much further keeps motion smooth.
 */
export const frameAlpha = () => alpha;

/** Fixed 60 updates per second, render every animation frame. */
export function startLoop() {
  let last = performance.now();
  let acc = 0;
  const STEP = 1000 / 60;
  const tick = (now: number) => {
    acc += Math.min(250, now - last);
    last = now;
    while (acc >= STEP) {
      scene.update();
      input.clearPressed();
      acc -= STEP;
    }
    alpha = acc / STEP;
    beginFrame();
    scene.render(ctx);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

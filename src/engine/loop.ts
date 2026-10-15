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

/**
 * Small jobs done in the spare time between frames, a few at a time, so they never make a
 * frame late (even while walking, every frame has lots of spare time).
 */
const jobs: (() => void)[] = [];
function runJobs(deadline?: IdleDeadline) {
  do jobs.shift()!();
  while (jobs.length && deadline && !deadline.didTimeout && deadline.timeRemaining() > 3);
  if (jobs.length) scheduleJobs();
}
function scheduleJobs() {
  if ('requestIdleCallback' in window) requestIdleCallback(runJobs, { timeout: 500 });
  else setTimeout(runJobs, 16);
}

/** Run each job when the browser has spare time, in order. */
export function whenIdle(...fns: (() => void)[]) {
  const wasEmpty = !jobs.length;
  jobs.push(...fns);
  if (wasEmpty && jobs.length) scheduleJobs();
}

/** Forget jobs that aren't needed anymore (e.g. preparing areas you walked away from). */
export const clearIdle = () => (jobs.length = 0);

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

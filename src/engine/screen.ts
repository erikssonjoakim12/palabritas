export { el } from './dom';

export const W = 160;
export const H = 144;

export const canvas = document.getElementById('screen') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d')!;
export const overlay = document.getElementById('overlay') as HTMLDivElement;

let textScale = 6;
let lastWidth = 0;
let lastHeight = 0;

/** Scale the 160x144 screen by a whole number of device pixels so it stays crisp. */
export function layout(force = false) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // The on-screen keyboard shrinks the height on some phones, so ignore height *shrinking*;
  // re-layout when the width changes or the height grows (e.g. the address bar disappears).
  if (!force && vw === lastWidth && vh <= lastHeight + 30) return;
  lastWidth = vw;
  lastHeight = vh;
  const dpr = window.devicePixelRatio || 1;
  // Portrait: Game Boy Color (screen on top, controls below).
  // Landscape: Game Boy Advance (controls on both sides of the screen).
  const landscape = vw > vh;
  const maxW = (landscape ? vw - 2 * 180 : vw - 28) * dpr;
  const maxH = (landscape ? vh - 40 : vh * 0.56) * dpr;
  const scale = Math.max(1, Math.floor(Math.min(maxW / W, maxH / H)));
  const cssPx = scale / dpr;
  canvas.width = W * scale;
  canvas.height = H * scale;
  canvas.style.width = `${W * cssPx}px`;
  canvas.style.height = `${H * cssPx}px`;
  ctx.imageSmoothingEnabled = false;
  document.documentElement.style.setProperty('--px', `${cssPx}px`);
  setTextScale(textScale);
  scaleFactor = scale;
}

/** Dialog text size in game pixels (5 = small, 6 = medium, 7 = large). */
export function setTextScale(s: number) {
  textScale = s;
  const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--px')) || 2;
  document.documentElement.style.setProperty('--fs', `${(px * s).toFixed(2)}px`);
}

export let scaleFactor = 1;

/** Draw in game coordinates; the canvas backing store is scaled up. */
export function beginFrame() {
  ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

/** Position helper for overlay elements, in game pixels. */
export const gp = (n: number) => `calc(var(--px) * ${n})`;

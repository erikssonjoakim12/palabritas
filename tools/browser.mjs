// The one place that starts a browser for tests and tools: headless and always silent
// (muted, and speech synthesis stubbed out). Tests must never use the speakers.
//   BROWSER=<path>         use another Edge/Chrome
//   PALABRITAS_URL=<url>   a dev server other than http://localhost:5181
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const BASE = process.env.PALABRITAS_URL ?? 'http://localhost:5181';

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export function launch() {
  const executablePath = CANDIDATES.find((p) => p && existsSync(p));
  if (!executablePath) throw new Error('No Edge or Chrome found: set BROWSER=<path to the browser>');
  return puppeteer.launch({ executablePath, headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
}

/** A new tab where the game can't speak. */
export async function newPage(browser) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
    // People who wander stay put, so tests find them where the map says (world.ts wander).
    window.__still = true;
  });
  return page;
}

/** A PNG's pixels, decoded by the browser: { width, height, data } with data as RGBA bytes, row by row. */
export async function readPng(page, file) {
  const url = 'data:image/png;base64,' + readFileSync(file).toString('base64');
  const { width, height, b64 } = await page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let s = '';
    for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode(...d.subarray(i, i + 0x8000));
    return { width: c.width, height: c.height, b64: btoa(s) };
  }, url);
  return { width, height, data: new Uint8Array(Buffer.from(b64, 'base64')) };
}

/** Save RGBA pixels ({ width, height, data }) as a PNG, encoded by the browser. */
export async function writePng(page, file, { width, height, data }) {
  const b64 = await page.evaluate((width, height, b64) => {
    const bytes = Uint8ClampedArray.from(atob(b64), (ch) => ch.charCodeAt(0));
    const c = Object.assign(document.createElement('canvas'), { width, height });
    c.getContext('2d').putImageData(new ImageData(bytes, width, height), 0, 0);
    return c.toDataURL('image/png').split(',')[1];
  }, width, height, Buffer.from(data).toString('base64'));
  writeFileSync(file, Buffer.from(b64, 'base64'));
}

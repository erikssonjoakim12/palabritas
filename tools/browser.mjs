// The one place that starts a browser for tests and tools: headless and always silent
// (muted, and speech synthesis stubbed out). Tests must never use the speakers.
//   BROWSER=<path>         use another Edge/Chrome
//   PALABRITAS_URL=<url>   a dev server other than http://localhost:5181
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

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
  });
  return page;
}

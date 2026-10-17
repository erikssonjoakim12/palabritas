// Run the browser tests: `npm test` runs them all, `npm test -- cave money` only those.
// Uses the dev server at PALABRITAS_URL (default http://localhost:5181). If none is running there, it
// starts one on that port and stops it afterwards. It never touches any other server (yours stays up).
import { spawn, execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { launch, newPage, BASE } from '../tools/browser.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const TIMEOUT = 300_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const wanted = process.argv.slice(2);
const files = readdirSync(HERE)
  .filter((f) => f.endsWith('.test.mjs'))
  .filter((f) => !wanted.length || wanted.some((w) => f.startsWith(w)))
  .sort();
if (!files.length) {
  console.log('No tests match', wanted.join(' '));
  process.exit(1);
}

const up = () => fetch(BASE).then((r) => r.ok, () => false);
let server = null;
if (!(await up())) {
  const port = new URL(BASE).port || '5181';
  console.log(`Starting a dev server on port ${port}...`);
  server = spawn('npx', ['vite', '--port', port, '--strictPort'], { cwd: ROOT, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await up()); i++) await sleep(500);
  if (!(await up())) {
    console.error('The dev server did not start.');
    stop();
    process.exit(1);
  }
}

function stop() {
  if (!server) return;
  if (process.platform === 'win32') execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
  else server.kill();
}

// Warm up once: the first visit compiles the dependencies, and Vite may reload the page while it does.
{
  const browser = await launch();
  const page = await newPage(browser);
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await browser.close();
}

const results = [];
for (const f of files) {
  const t0 = Date.now();
  const code = await new Promise((resolve) => {
    const p = spawn(process.execPath, [join(HERE, f)], { cwd: ROOT, stdio: 'inherit' });
    const timer = setTimeout(() => {
      console.log(`  ✗ timed out after ${TIMEOUT / 1000} s`);
      p.kill();
    }, TIMEOUT);
    p.on('exit', (c) => {
      clearTimeout(timer);
      resolve(c);
    });
  });
  results.push({ name: f.replace('.test.mjs', ''), ok: code === 0, secs: Math.round((Date.now() - t0) / 1000) });
  console.log('');
}
stop();

console.log('Summary');
for (const r of results) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name.padEnd(12)} ${r.secs} s`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `${failed} of ${results.length} tests FAILED` : `All ${results.length} tests passed`);
process.exit(failed ? 1 : 0);

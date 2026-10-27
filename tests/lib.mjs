// Shared helpers for the browser tests. Every test is silent (see tools/browser.mjs) and runs against
// the dev server (npm test starts one on port 5181 if none is running).
//
//   const t = await start('cave');                 // a phone-sized tab, ready on the title screen
//   await t.fromSave({ map: 'ruta4', x: 5, y: 30, party: [['gotita', 15]] });
//   const r = await t.play();                      // press through dialog, answer, fight... until the script ends
//   t.check('Raúl battled', r.said.some((s) => s.includes('Raúl')));
//   await t.end();                                 // prints ✓/✗, sets the exit code
//
// window.__game (dev builds) exposes the game: G (state), loadMap, warp, runScript, SCRIPTS, player,
// npcById, currentMap, tileAt, newMon, healParty, wildBattle...
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { launch, newPage, BASE } from '../tools/browser.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function start(name, { phone = true } = {}) {
  const out = join(HERE, 'out', name);
  mkdirSync(out, { recursive: true });
  const browser = await launch();
  const page = await newPage(browser);
  if (phone) {
    await page.emulate({
      viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',
    });
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const results = [];
  const game = (fn, arg) => page.evaluate(fn, arg);

  const t = {
    page,
    errors,
    game,
    out,

    // ---------- Getting into the game ----------

    /** The title screen of a brand-new game (no save). */
    async fresh() {
      await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
      await game(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle0' });
      await page.mouse.click(200, 200);
      await sleep(300);
    },

    /**
     * Start from a save: `party` is [[species, level, {hp...}?], ...]; the rest is merged into a new save
     * (map, x, y, dir, money, bag, ...); `flags` are added to the usual starting flags.
     */
    async fromSave({ party = [], flags = {}, ...rest } = {}) {
      await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
      await game(async ({ party, flags, rest }) => {
        const { newSave } = await import('/src/game/state.ts');
        const { newMon } = await import('/src/game/mon.ts');
        const save = Object.assign(newSave(), { name: 'Test', ...rest });
        save.party = party.map(([sp, level, extra]) => Object.assign(newMon(sp, level), extra));
        Object.assign(save.flags, { starter: party.length > 0, metCeiba: true, defenseTip: true }, flags);
        localStorage.setItem('palabritas.save.v1', JSON.stringify(save));
      }, { party, flags, rest });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.mouse.click(200, 200);
      await sleep(300);
      await t.press('z'); // CONTINUAR
      await t.waitIdle();
    },

    // ---------- Reading the screen ----------

    /** What's on screen right now. */
    ui: () =>
      game(() => {
        const panel = document.getElementById('challenge');
        const open = !panel.hidden && panel.innerHTML !== '';
        const c = window.__challenge;
        const lastMenu = [...document.querySelectorAll('.menu')].pop();
        return {
          challenge: open
            ? {
                result: !!panel.querySelector('.result'),
                input: !!panel.querySelector('.ch-input'),
                // A story choice (e.g. a listening quiz) has buttons but no challenge header.
                head: !!panel.querySelector('.ch-head'),
                choices: [...panel.querySelectorAll('.choices button')].map((b) => b.textContent),
                mode: c?.mode,
                es: c?.item?.es,
                en: c?.item?.en,
              }
            : null,
          map: window.__game?.G.save.map,
          menu: lastMenu ? [...lastMenu.querySelectorAll('.opt')].map((o) => o.textContent) : [],
          list: !!document.querySelector('.fullpanel .list-row'),
          text: document.querySelector('.textbox .tb-text')?.textContent ?? '',
          lock: window.__game?.G.lock ?? -1,
          battle: !!document.querySelector('.hud'),
        };
      }),
    pos: () => game(() => [window.__game.G.save.map, window.__game.G.save.x, window.__game.G.save.y]),
    save: () => game(() => JSON.parse(JSON.stringify(window.__game.G.save))),

    /** Wait until no script, menu or text is running (e.g. after loading or a warp). */
    async waitIdle(ms = 4000) {
      const end = Date.now() + ms;
      await sleep(300);
      while (Date.now() < end) {
        const s = await t.ui();
        if (s.lock === 0 && !s.text && !s.challenge && !s.menu.length) return;
        await sleep(100);
      }
    },

    // ---------- Doing things ----------

    async press(key, hold = 60) {
      await page.keyboard.down(key);
      await sleep(hold);
      await page.keyboard.up(key);
      await sleep(120);
    },

    /** Walk `steps` tiles (one key press per tile). Stops early when a text box opens; returns its text. */
    async walk(dir, steps = 1) {
      const key = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[dir];
      for (let i = 0; i < steps; i++) {
        await page.keyboard.down(key);
        await sleep(260);
        await page.keyboard.up(key);
        await sleep(60);
        const s = await t.ui();
        if (s.text || s.lock > 0) return s.text;
      }
      await sleep(250);
      return '';
    },

    /** Wait for the next text box to finish typing (e.g. after a battle's opening flash); '' if none comes. */
    async nextText(ms = 5000) {
      const end = Date.now() + ms;
      let last = '';
      while (Date.now() < end) {
        const { text } = await t.ui();
        if (text && text === last) return text;
        last = text;
        await sleep(150);
      }
      return last;
    },

    /** Teleport (no fade) and wait. */
    async warp(map, x, y, dir = 'down') {
      await game(([m, x, y, d]) => window.__game.loadMap(m, x, y, d), [map, x, y, dir]);
      await sleep(250);
    },

    /** Stand on a map at (x, y) facing someone, press A, and play out what happens (see play). */
    async talk(map, x, y, dir, opts) {
      await t.warp(map, x, y, dir);
      await t.press('z');
      return t.play(opts);
    },

    /** Pick a menu option by (part of) its text. */
    pick: (label) =>
      game((l) => {
        const opts = [...([...document.querySelectorAll('.menu')].pop()?.querySelectorAll('.opt') ?? []), ...document.querySelectorAll('.list-row')];
        const o = opts.find((x) => x.textContent.includes(l));
        if (!o) throw new Error(`no option "${l}" in: ${opts.map((x) => x.textContent).join(' | ')}`);
        o.click();
      }, label),

    /**
     * Answer the open challenge: right (the expected Spanish/meaning), wrong, or with your own `text`.
     * Returns false when it only switched a speaking challenge to writing (answer again next).
     */
    async answer({ right = true, text } = {}) {
      const done = await game(({ right, text }) => {
        const c = window.__challenge;
        const panel = document.getElementById('challenge');
        const btns = [...panel.querySelectorAll('.choices button')];
        if (btns.length) {
          const b = right ? btns.find((x) => x.textContent === c.item.en) : btns.find((x) => x.textContent !== c.item.en);
          (b ?? btns[0]).click();
          return true;
        }
        const inp = panel.querySelector('.ch-input');
        if (!inp) {
          // A speaking challenge: switch to writing first.
          [...panel.querySelectorAll('button')].find((b) => b.textContent.includes('Escribir'))?.click();
          return false;
        }
        inp.value = text ?? (right ? c.item.es : 'xyz qwerty');
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        return true;
      }, { right, text });
      await sleep(250);
      return done;
    },

    /**
     * Press through a script until it ends (nothing locked, no text): dialog is read with A, challenges
     * answered, menus decided by `choose(options, text)` (return an option's text, 'B' to cancel, or
     * undefined for the first option). In battles the default fights (LUCHAR) and uses the first move.
     *   right: answer correctly? true/false, or (n) => boolean for the n-th challenge (from 0)
     *   answers: texts to type, in order         choices: labels to click in story choice panels
     *   until(ui): stop as soon as this is true  max: safety limit
     * Returns { said: every text shown, answered: how many challenges }.
     */
    async play({ choose, right = true, answers = [], choices = [], until, max = 600 } = {}) {
      const said = [];
      let answered = 0;
      let idle = 0;
      for (let i = 0; i < max; i++) {
        const s = await t.ui();
        if (until?.(s)) break;
        if (s.challenge?.result) {
          await game(() => [...document.querySelectorAll('#challenge button')].find((b) => b.textContent.startsWith('Continuar'))?.click());
          await sleep(150);
          continue;
        }
        if (s.challenge && !s.challenge.head && s.challenge.choices.length && choices.length) {
          const want = choices.shift();
          await game((w) => [...document.querySelectorAll('#challenge .choices button')].find((b) => b.textContent.startsWith(w)).click(), want);
          await sleep(250);
          continue;
        }
        if (s.challenge) {
          const ok = typeof right === 'function' ? right(answered) : right;
          if (await t.answer({ right: ok, text: answers[0] })) {
            answers.shift();
            answered++;
          }
          continue;
        }
        if (s.menu.length) {
          let c = choose?.(s.menu, s.text);
          if (c === undefined) c = s.menu.includes('LUCHAR') ? 'LUCHAR' : s.menu[0];
          if (c === 'B') await page.keyboard.press('x');
          else await t.pick(c);
          await sleep(200);
          continue;
        }
        if (s.list) {
          await game(() => document.querySelector('.fullpanel .list-row').click());
          await sleep(200);
          continue;
        }
        if (s.text) {
          if (said[said.length - 1] !== s.text && !s.text.startsWith(said[said.length - 1] ?? '\u0000')) said.push(s.text);
          else said[said.length - 1] = s.text; // the text box types letter by letter
          idle = 0;
          await t.press('z');
          continue;
        }
        if (!until && s.lock === 0 && !s.battle && ++idle > 4) break;
        await sleep(120);
      }
      return { said, answered };
    },

    /** Start a wild battle right here. */
    async wild(sp, level) {
      // Not awaited in the page: the battle runs while play() drives it.
      await game(([sp, level]) => { window.__game.runScript(window.__game.SCRIPTS.__wild, { data: { sp, level } }); }, [sp, level]);
      await sleep(200);
    },

    async shot(name) {
      const clip = await game(() => {
        const r = document.getElementById('screen').getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      await page.screenshot({ path: join(out, `${name}.png`), clip });
    },

    // ---------- Results ----------

    check(label, ok, detail = '') {
      results.push({ label, ok: !!ok, detail });
      console.log(`  ${ok ? '✓' : '✗'} ${label}${detail !== '' ? `  (${typeof detail === 'string' ? detail : JSON.stringify(detail)})` : ''}`);
    },

    async end() {
      t.check('no errors in the page', errors.length === 0, errors.join(' | '));
      await browser.close();
      const failed = results.filter((r) => !r.ok).length;
      console.log(failed ? `FAIL ${name}: ${failed} of ${results.length} checks failed` : `PASS ${name}: ${results.length} checks`);
      process.exitCode = failed ? 1 : 0;
    },
  };
  console.log(`${name}`);
  return t;
}

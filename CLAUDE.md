# Palabritas — notes for Claude

A Pokémon Gold/Silver-style game for learning **Latin American Spanish**. Palabritas level up by learning
words: every attack, defense and catch is a Spanish challenge (tap, write, listen, speak). TypeScript +
Canvas + Vite, no framework. Played mostly on an Android phone; live at
https://erikssonjoakim12.github.io/palabritas/ (GitHub Pages deploys on every push to `main`).

The user is a Spanish beginner (Duolingo) who loves Gold/Silver. They play and give feedback; they
decide the big things and trust you with the rest.

**Read first:** [ROADMAP.md](ROADMAP.md) (where the game is going) · [PLAN_GYMS_2-4.md](PLAN_GYMS_2-4.md)
and [plans/](plans/) (what to build next, in detail) · [LEARNING_PLAN.md](LEARNING_PLAN.md) (how levels map to
Spanish) · [BIOMES.md](BIOMES.md) (animals per region).

## Commands

| | |
|---|---|
| `npm run dev` | dev server (the user runs their own for the phone: never stop it) |
| `npm run art` | the art review page (`/art.html`): every sprite, tile, map and the stitched world |
| `npm run typecheck` / `npm run build` | |
| `npm test` | every browser test; `npm test -- cave maps` runs some. Uses a dev server on **port 5181**, starting and stopping its own if none is there |

## Rules

- **Tests are always silent.** Start browsers only through `tools/browser.mjs` (muted, speech stubbed).
  The user once heard the game speak Spanish from the PC speakers during a test.
- **Only stop servers you started**, and only on port 5181. Never touch other ports.
- **Commit and push** finished, tested work (the user is used to that), with the attribution line the system
  gives you. Never commit the user's notes in `art-src/*.txt` unless asked.
- **Never break saves.** Changing ids, maps or flags needs a migration in `migrate()` (src/game/state.ts).
- **Spanish:** Latin American, natural, beginner-friendly at low levels. Every line has English for the EN
  button. `{o/a}` adapts to the player's gender (`list{o/a}` → lista/listo). Accept natural variants
  (`|` in content lines). When unsure of a regionalism, choose the neutral Latin American form.
- **Look:** strict Gold/Silver style with original art. Every color lives in `src/style/colors.ts`; tile,
  people and Palabrita art are rows of characters in `src/style/`. Keep new art in those palettes.
- **Code:** match the surrounding style. Clean, reusable, no copy-paste: if two places need it, make a
  helper. Comments explain *why*. Names (towns, people, Palabritas) live in one place in the data so they're
  easy to change.
- **New Palabritas** only as planned in `plans/palabritas.md`, or when the user asks. The user designs the
  real art; use placeholder drawings until then.
- Write numbers the user proposes down, but **double-check the arithmetic**: they've said theirs can be off.

## Where things are

| Area | Files |
|---|---|
| Start-up, dev hooks (`window.__game` for tests) | `src/main.ts`, `src/title.ts` |
| Game state, saves, migrations, flags | `src/game/state.ts` (`flag()`, `setFlag()`, `G.save`) |
| Learning: mastery, reviews, picking questions | `src/game/learning.ts`, `src/game/curriculum.ts` |
| Spanish content | `src/data/content/` (core list, one file per theme, practice topics) |
| Palabritas, moves, types | `src/data/species.ts`, `src/data/types.ts` |
| Trainers, items | `src/data/trainers.ts`, `src/data/items.ts`, `src/game/bag.ts` |
| Maps (every town, route, interior) | `src/world/maps/`: one file per region (`region1.ts`...), `kit.ts` (tile legend, types, shared rooms), `index.ts` |
| Scripts (every NPC, quest, trainer talk) | `src/world/scripts.ts` (`SCRIPTS`) |
| Overworld engine: walking, ledges, doors, gates, encounters, drawing | `src/world/world.ts`, `src/world/layout.ts` |
| Battles | `src/battle/battle.ts` |
| Dialog, menus, challenges | `src/ui/textbox.ts` (`say`, `info`), `src/ui/menu.ts` (`menu`, `ask`), `src/ui/challenge.ts` |
| Tile logic (solid, kinds, auto-edges) / tile art | `src/art/tiles.ts` / `src/style/tiles.ts` |
| People and objects | `src/style/people.ts` (heads, bodies, `LOOKS`, `OBJECTS_ART`), `src/art/portraits.ts` (battle portraits) |
| Palabrita art | `src/style/palabritas.ts` (the user's art), `src/art/creatures.ts` (placeholder drawings) |
| Art review page | `src/dev/art.ts` |
| Browser tests / tools | `tests/` (see below), `tools/` |

## Recipes

**A map** (in its region's file in src/world/maps/; a new region gets a new file, added in `index.ts`). Each row
is a string of tiles (legend at the top of `kit.ts`).
- **Outdoor** maps join seamlessly through `connections: { left: { to, offset } }`. The other map must
  connect back with the opposite direction and `-offset`. Put walkable tiles on both sides of the seam.
  `border` sets the tile drawn around the map (default: trees). The game draws every map within a few tiles
  of the current one in the world, connected or not. A `scenery: true` connection only places a map in
  the world (a mountain beside a route), and nobody walks across it.
- **Interiors** have `outdoor: false`, an exit mat `m` on the bottom row and `exit: { to, x, y }`. Reuse
  `HOUSE`, `CENTRO` and `centro(id, exit, extraNpcs)`.
- **Doors:** `doors: [{ x, y, to, tx, ty, dir? }]`. You arrive at (tx, ty) facing `dir` (default up).
- **Caves:** `encounters.everywhere: true` makes every step count as tall grass.
- **Check your work:** `npm test -- maps` checks every map (connections both ways, doors, NPCs, gates, and
  that every way out is reachable). Then look at the map on the art page (Maps, World).

**A trainer:**
1. Add `TRAINERS[id]` (name with its kind, e.g. 'Exploradora Daniela'; `defenseMode`; team).
2. Add an NPC: `{ id, x, y, look, dir, script: id, sight }`. Sight is how many tiles ahead it sees you, so
   put it where the path can't avoid its line of sight.
3. Add a script: `id: () => trainerFight(id, { intro, defeated, after })`. Each line is `[es, en]`.

A beaten trainer sets `beat:<id>`.

**A gate guard** (blocks a road until something happens): a `gates` entry on the map, with `opens()`, the
guard's spot, where they wait once the road is open, the road tiles, where you're sent back, and their lines.
No script needed.

**An item on the ground:** `itemBall(id, x, y, itemId)` in the map's NPCs. It's picked up once (flag
`item:<id>`).

**A wild Palabrita table:** `encounters: { rate, table: [{ sp, min, max, w }] }` (w = weight).

**A Palabrita:**
1. Add it to `SPECIES` (src/data/species.ts): types, `theme`, base stats, 4 moves (choose/type/listen/speak),
   catchRate, dex in Spanish and English.
2. Evolved forms use `evolution(from, level, {...})`: they keep the family's theme, moves and words.
3. Art: a placeholder drawing in `DRAW` (src/art/creatures.ts) until the user's art arrives.
4. Add it to `DEX_ORDER` (src/data/species.ts), next to its family.
5. `npm test -- data` checks it.

**The user's art** (PNG front + back, any size):
1. If it's upscaled, shrink it first: `node tools/unscale.mjs in.png out.png <cell size>`.
2. Then `K=16 node tools/exact.mjs <id> front.png back.png` prints an entry for `src/style/palabritas.ts`,
   with the colors matched to the master palette.
3. Check it on the art page. `tools/depixel.mjs` and `tools/fit.cjs` handle messy AI "pixel art".

**A theme** (a family's vocabulary):
1. Write one file in `src/data/content/` with one list, easiest first: 27 words (levels 2–10), then 40 short
   phrases (11–20), then sentences (3 per level from 21). About 117 lines reaches level ~37.
2. Lines look like `'el perro | el can = the dog'` (the first form is shown; the others are accepted too).
3. Import it in `index.ts` and add it to the `LATER` list (new lists never move words existing Palabritas have).
4. The same Spanish in two lists must have the same English (`npm test -- data` checks it).

The same Spanish in two lists is one shared item, which is fine and intended.

**A tile:**
1. Add an entry to `TILES` (src/art/tiles.ts): solid?, kind, ledge, look text.
2. Add a case in `render()`.
3. Add its art in `ART` (src/style/tiles.ts). Its palette goes in colors.ts.
4. Add its name in `TILE_NAMES` (src/dev/art.ts) and in the legend in maps/kit.ts.

Edges that join up with their neighbors (roofs, rock) are computed in art/tiles.ts.

**A person's look:** `LOOKS` in src/style/people.ts, as a head + body + clothing color. A new head needs
rows for down/up/side, a case in `src/art/portraits.ts` (`hairFront`/`hairBack`), and `isMaleLook` if it's
male. **An object:** `OBJECTS_ART` (people.ts) + `OBJECT_PALS` (colors.ts).

**A script or quest:**
- Add a function in `S` (src/world/scripts.ts): `async name(c) { ... }`.
- Use `lines()`, `say()`, `info()`, `ask()`, `menu()`, `challenge()`, `chooseText()`, `warp()`,
  `scriptedStep()`, `setFlag()`, `addItem()`.
- Name flags after what happened (`michiFound`, `medalBrisa`) and keep them in one script where possible.
- Quest challenges should use real items from the core or themes where possible, so answering counts toward
  mastery.

## Tests

`tests/*.test.mjs`, one per feature, on the helpers in `tests/lib.mjs`:

```js
const t = await start('cave');                            // a silent, phone-sized tab
await t.fromSave({ map: 'ruta4', x: 5, y: 30, party: [['gotita', 15]], flags: { medalBrisa: true } });
await t.walk('up', 3);                                     // stops early when someone talks
const r = await t.play();                                  // reads dialog, answers, fights... until done
t.check('Raúl battles', r.said.some((x) => x.includes('Raúl')));
await t.end();                                             // ✓/✗ per check, exit code
```

- `t.play({ choose, right, answers, choices, until })` drives anything. Other helpers: `t.wild(sp, level)`,
  `t.warp()`, `t.nextText()`, `t.ui()`, `t.save()`, `t.pos()`, `t.shot(name)` (screenshots go to
  `tests/out/`, which isn't committed), `t.game(fn)` (runs in the page; `window.__game` is the game).
- In the page, use `window.__game` for game modules. A fresh `import('/src/...')` can be a second copy after
  hot reloads (only `fromSave` uses imports, before the game starts).
- Add or extend a test with every feature, and run `npm test` before committing.

## Tools (`tools/`, all silent)

| | |
|---|---|
| Screenshots | `artclip.mjs` (one art-page section), `artpage.mjs`, `maps.mjs` (the game at given spots), `battleshot.mjs`, `widths.mjs`, `landscape.mjs`, `zoom.mjs`, `view.mjs`, `crop.mjs` |
| Art conversion | `unscale.mjs`, `exact.mjs`, `depixel.mjs`, `fit.cjs`, `measure.mjs`, `palette.mjs`, `icons.mjs` |
| Pace and performance | `sim.mjs` (answers needed per level, with the real learning code), `perf.mjs`, `evenness.mjs`, `sprites.mjs` |

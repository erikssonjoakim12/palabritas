# Phase 1 — groundwork

**Goal:** the systems every new region needs, the changes to existing Palabrita families, and the A2 core
Spanish for levels 21–35. There are no new regions yet. The game stays fully playable, and players with
existing saves notice only improvements.

**Read first:** CLAUDE.md · PLAN_GYMS_2-4.md (the overview) · [palabritas.md](palabritas.md) (family
changes, §1) · [content.md](content.md) (A2 core, §1). Do the sections below in order; commit after each
numbered section once `npm test` is green.

---

## 1. Dates in one place

Several features reset or wait by the real calendar day (fossil, rematches, lessons, the restaurant).
They all go through one helper so they can be changed or switched off in one place (plan §11).

```ts
// src/game/state.ts
/** Today's date as YYYY-MM-DD (local time). Tests can set window.__today = '2026-10-18'. */
export function today(): string
```

`learning.ts` already builds day strings for `goodDays`; make it use `today()` too.

**Test:** none on its own; it's covered by the rematch and fossil tests.

---

## 2. Map styles and the new tile slots

The regions need new looks: pines, adobe walls, clay-tile roofs, basalt rock, clay and basalt caves, sand,
night scenes. Add the data model now. Each region phase adds its tiles' art.

`MapDef` (and `MapLook` in art/tiles.ts) gets:

```ts
/** How this map's shared tiles look. All optional; the defaults are today's look. */
style?: {
  trees?: 'lowland' | 'pine' | 'dry';   // 'T': green/dry mix (default) | mostly pines, some green | mostly dry
  walls?: 'plain' | 'adobe';            // h, w, d...: cream (default) | warm ochre adobe
  rock?: 'rock' | 'basalt';             // '^', 'O': tan (default) | black volcanic
  cave?: 'cave' | 'clay' | 'basalt';    // '%', ';', 'e': brown (default) | red clay (the mine) | black (the lava tube)
};
night?: boolean;                        // drawn dark, with light around you (§10)
```

- Roof colors: add `clay` (terracotta) to `ROOFS`, used by Villa Ocote (`roof: 'clay'`).
- `ground` gets a new value, `'sand'`, for '.' on beach maps.
- **The tile image cache key must include the style.** Today the key has ground, roof and floor; add
  `JSON.stringify(style)`, or the parts that matter for the tile.
- **Tree mix by style:**
  - lowland: about 1 dry tree in 4 (as now).
  - pine: `'T'` draws the pine (`ART.pine`) 3 times in 4, and the green tree otherwise.
  - dry: about 3 dry trees in 4.
- Use the same `isDryTree` hash idea, with the share depending on the style.

**New tile characters**, reserved now so the regions don't clash. Art and logic come in the phase that
first uses them:

| Char | Tile | Solid | Kind / notes | Phase |
|---|---|---|---|---|
| `D` | tunnel mouth in a cliff you walk *south* into (the cave mouth turned 180°, half as tall) | no | `door` | 2 (Ruta 5) |
| `H` | wooden bridge / pier planks (drawn over water) | no | planks run across the water: check neighbors | 2 |
| `F` | plaza fountain (2×2: picks its quarter from neighbors) | yes | look: «Una fuente con agua fresca.» | 2 |
| `U` | market stall (awning + goods) | yes | the goods' text comes from a sign entry at that spot | 2 |
| `K` | mine rails on cave floor | no | | 2 |
| `W` | wooden mine support | yes | | 2 |
| `s` | sand | no | | 3 |
| `y` | cactus | yes | look: «¡Un cactus! Mejor no tocarlo.» | 3 |
| `z` | dry yellow tall grass (*zacate*) | no | `tallgrass` | 3 |
| `A` | lighthouse wall (white/red stripes; a lamp cap where the tile above isn't `A`) | yes | | 3 |
| `8` `2` `4` `6` | water current going up / down / left / right (numpad arrows) | no | `current` + dir (§14) | 3 |
| `i` | ash ground | no | | 4 |
| `j` | lava | yes | `water`-like, never walkable; glows | 4 |
| `X` | steam vent | yes | look: «¡Sale vapor caliente!» | 4 |
| `Z` | sugarcane field | no | `tallgrass` | 4 |
| `l` | cobblestone plaza | no | | 4 |
| `q` | church roof (white) | yes | joins like roofs | 4 |
| `N` | church bell tower | yes | look: «La campana de la iglesia.» | 4 |

Shorelines don't need a character. Where `'~'` touches sand or ground, draw a foam edge on the water side,
computed like the rock edges.

**Test:** `maps.test` (already there) must still pass. The art page shows each new tile once its phase adds it.

---

## 3. NPCs that walk (for cutscenes)

Today nobody but the player moves. Add to world.ts:

```ts
/** Walk an NPC along a path, one tile per step with the walking animation (awaitable). */
export async function walkNpc(id: string, path: Dir[], { speed = 1 } = {}): Promise<void>
/** Make an NPC appear at (x, y) (e.g. the rival arriving from off-screen) and walk. */
export function placeNpc(id: string, x: number, y: number, dir: Dir): void
```

- Movement is like the player's step: interpolate between tiles, alternate walk frames, about 16 frames per tile.
- NPC sprites move smoothly, not tile to tile.
- Steps into solid tiles or other NPCs are skipped, with a console warning in dev.

**Uses:** Lucas arriving for each rival battle, guards stepping aside, the parade and the hatchlings
(phase 3).

**Test:** a small cutscene test (`npm test -- cutscene`): place an NPC 3 tiles away, walk it next to the
player, check its final position.

---

## 4. The storage box (*Caja de Palabritas*)

- **Save data:** `box: Mon[]` (unlimited). Add `s.box ??= []` to `migrate()`.
- **Computer:** the `Q` tile in every Palacentro becomes usable. Add `script?: string` to `TileDef`. When
  `interact()` faces such a tile, it runs the script, so `Q` gets `script: 'computer'`.
- **The `computer` script:** «Encendiste la computadora. ¿Qué quieres hacer?» with
  `menu(['DEPOSITAR', 'RETIRAR', 'SALIR'])`.
  - **DEPOSITAR:** pick from the party (the same list as EQUIPO). You can't deposit your last Palabrita
    that can still fight: «¡No puedes dejar tu equipo vacío!» A deposited Palabrita is fully healed.
  - **RETIRAR:** a list of the box (name, level, sprite, like the party list; it scrolls). Withdrawing
    needs a free slot (team < 6): otherwise «Tu equipo está lleno.»
  - The Spanish menu labels are the learning bit; the EN button explains them.
- **Catching with a full team** now works: the Palabrita goes to the box with
  «¡X fue enviado a la Caja de Palabritas!» Remove the old "team is full" refusal in `throwPalabola`.
- **`giveMon(sp, level)`** in game/mon.ts: party if it has room, otherwise the box. It marks the Palabrita
  caught and returns `'party' | 'box'`. Gifts, the fossil and catching all use it.

**Test (storage.test):**
- Depositing with 2 in the team leaves 1, and the deposited one is healed.
- You can't deposit the last one.
- Withdrawing works.
- With 6 in the team, a catch goes to the box.
- `giveMon` with a full team goes to the box.

---

## 5. Items and shops

New `ITEM_DEFS` (prices in pesos):

| id | Name / plural | Price | Does |
|---|---|---|---|
| `superpocion` | Superpoción / Superpociones | 250 | heals 50 PS |
| `revivir` | Revivir / Revivires | 600 | a fainted Palabrita comes back with half its PS (bag or battle) |
| `repelente` | Repelente / Repelentes | 200 | no wild Palabritas for 100 steps (`G.save.repel`, counts down in `onStep`; then «El Repelente se acabó.») |
| `superbola` | Superbola / Superbolas | 200 | catching chance ×1.5 |

**Key items** (`key: true`): no price, never sold, shown in the bag. Using one from the bag says «Ahora
no.», unless it has a use (the fishing rod, §6).

| id | Name | From |
|---|---|---|
| `cana` | Caña de pescar | Don Lalo, Playa Carey (phase 3) |
| `fosil` | Fósil Caparazón | the echo room in Cueva del Eco (phase 2) |
| `sombrero` | Sombrero de Beto | the cave (phase 2) |
| `hamaca` | Hamaca | the market in Ciudad Chispa (phase 4) |
| `chocoyitoBebe` | Chocoyito bebé | the lava tube (phase 4) |
| `traje` | Pieza del traje (counts up to 5) | Ciudad Chispa (phase 4) |

**Shops per town:** replace the global `SHOP` with `SHOPS: Record<string, string[]>` keyed by shop map id.
The cashier script reads `SHOPS[currentMap().id]`.

| Shop | Sells |
|---|---|
| `tienda_brisa` | palabola, pocion |
| `tienda_ocote` | palabola, pocion, superpocion, repelente |
| `tienda_carey` | palabola, superbola, pocion, superpocion, repelente |
| `tienda_chispa` | palabola, superbola, pocion, superpocion, revivir, repelente |

**Ordering:**
- Each new name and plural must work in `gradeOrder` (lang/order.ts) and `amountOf`.
- Accept missing accents (superpocion) and the singular/plural that matches the number.
- Extend the shop test with one new item.

**In battle:** MOCHILA lists usable items: potions; Revivir (choose a fainted Palabrita); balls (wild
battles only).

---

## 6. Fishing

- With `cana` in the bag, pressing A while facing a `'~'` tile (or the `Pescar` option when using the rod
  from the bag next to water) runs the `fish` script:
  1. «{name} tiró la caña...»
  2. A wait of 1–3 s (the text box shows «...»).
  3. 75%: «¡Algo picó!» and a wild battle from `map.fishing` (or `FRESHWATER` if the map has none). 25%:
     «No pica nada...»
- `MapDef.fishing?: { table: EncounterEntry[] }`.
- The `FRESHWATER` default (in maps.ts) is `[{ sp: 'mojarrita', min: 8, max: 14, w: 100 }]`. Sea maps set
  their own (phase 3).
- The fisherman in Pueblo Amanecer gets one new line once you have the rod: «¡Tienes una caña! Prueba en el
  lago.»

**Test (fishing.test):**
- Give `cana`, face the lake in Amanecer and press A.
- With `Math.random` stubbed to always bite, a battle starts with a species from the table.

---

## 7. The bus (*el bus*, fast travel)

**Stops:** each town with a stop has `busStop: { x, y, dir }` (where you arrive) and a bus driver NPC,
`cobrador`, standing next to a sign.

| Town | Stop |
|---|---|
| Pueblo Amanecer | south of the lab |
| Villa Limón | by the south exit |
| Ciudad Brisa | by the Palacentro |
| Villa Ocote, Playa Carey, Ciudad Chispa | given in their region specs |

- **Visiting:** entering a town with a stop sets `bus:<mapId>`.
- **Opening:** the bus runs once `busOpen` is set (after the Medalla Barro, phase 2). Before that the driver
  says: «El bus todavía no llega hasta aquí. ¡Pronto!»
- **The `bus` script:**
  1. «¿A dónde vas?»
  2. A speaking/typing challenge. The answer is checked against the visited towns. Accept «Quiero ir a
     Villa Limón (, por favor)», «A Villa Limón», «Villa Limón», «Voy a Villa Limón». Accents don't matter;
     «Pueblo», «Villa», «Ciudad» and «Playa» are optional.
  3. «Son cuarenta pesos. ¿Está bien?» costs $40.
  4. A fade with the bus horn, then a warp to the stop.
  5. If nothing matched: «No conozco ese lugar. ¿Quieres ver la lista?», then a menu of visited towns, so
     nobody gets stuck.
- Use an ad-hoc item (`adHocItem`) for the grading, like the name prompt.

**Test (bus.test):**
- Before `busOpen`, the driver refuses.
- With two towns visited and $100, «Quiero ir a Villa Limón» takes you there and costs $40.
- A nonsense answer offers the list.

---

## 8. Rematches (*¡Revancha!*)

- `TrainerDef.rematch?: boolean`: true for route trainers, false (left out) for gym leaders, the rival,
  Equipo Silencio and gym trainers.
- **Remembering:** after a win, `G.save.rematch[id] = today()`. Add `s.rematch ??= {}` to `migrate()`.
- **Talking to a beaten rematch trainer:**
  - On a later day than `rematch[id]`: «¡Hola otra vez! ¿Quieres la revancha?», then `ask()`.
  - Yes: they fight with their team's levels raised to keep up, then `rematch[id] = today()`.
  - On the same day: their `after` line plus «¡Mañana quiero la revancha!»
- **Rematch levels:** each team level becomes `min(original + 8, max(original, lead − 1))`, where `lead` is
  your strongest Palabrita's level.
- **Prize money:** half the normal prize.
- `trainerFight` handles all of this, so trainer scripts don't change.
- Trainers who can see you don't stop you again for a rematch: you talk to them.

**Test (rematch.test):**
- Beat Niña Sofía.
- Talk again the same day: no battle.
- Set `window.__today` to tomorrow, talk again: «revancha» and a battle with higher levels.

---

## 9. Lessons at the school (*la escuela*)

**A reusable drill:**
- Take the loop out of `starterTraining` and put it in `drill(items, opts)`: challenge each item, `record`,
  re-queue misses, «¿Seguimos?» every 6, and an optional Palabrita shown during the drill.
- `starterTraining` uses `drill` (`npm test -- starter` must still pass).

**The teacher's script** (one per school; the town's topic is data):
- «¡Bienvenid{o/a} a la escuela! ¿Qué quieres estudiar hoy?» with a
  `menu(['CLASE PARTICULAR', 'TEMA DEL DÍA', 'Nada'])`.
- **CLASE PARTICULAR** ($200, once per day per school: `lesson:<mapId> = today()`):
  1. Pick a Palabrita.
  2. A drill of up to 10 of its current items: the level's new items first, then its review items (use
     `levelProgress`/`reviewItems`).
  3. This is real progress: the Palabrita can level up afterwards. Check level-ups after the drill, with
     the normal level-up messages.
- **TEMA DEL DÍA** (free, any time): 8 questions from the town's grammar topic (content.md §3), like Rita's
  present-tense lesson.
  - Topic items that are shared with the core or a theme count toward mastery; the rest are just practice.
- Villa Ocote, Playa Carey and Ciudad Chispa each have a school (topics in their region specs). Rita in
  Ciudad Brisa stays as she is.

**Test (lesson.test):**
- With $500, a private class takes $200 and asks up to 10 questions, then refuses the same day.
- The topic runs 8 questions.

---

## 10. Night scenes

- When `map.night` is set, `renderWorld` draws a dark blue layer over everything (`rgba(16, 24, 64, 0.55)`),
  then lights a soft circle around the player (about 40 px).
- Optionally, objects with `glow: true` (torches, lamps, fireworks) light a small circle of their own.
- **Night maps are separate maps** that share rows with their day map: the helper
  `night(map, id, changes)` returns a copy with `night: true`, a new id, and other NPCs or encounters.
  There's no day/night clock.
- **Uses:** the turtle beach (phase 3), Ciudad Chispa's festival night and the haunted house (phase 4).

**Test:** a screenshot on the art page (add a "night" version of one map to the Maps section).

---

## 11. The muted town

- `MapDef.muted?: () => boolean`. While it's true, talking to a person (`look`) on that map shows «…»
  (EN: «They try to speak, but no words come out!») instead of their script.
- Signs also show «…» (EN: «The letters have faded away.»).
- NPCs with `speaksWhenMuted: true` (Equipo Silencio, and the child with the message) still use their
  scripts.
- **Use:** Villa Ocote until the Silenciador is broken (phase 2).

**Test:** in phase 2's region test.

---

## 12. Changes to existing Palabrita families

As specified in [palabritas.md](palabritas.md) §1:
- **Gusanito → Capullito → Mariposita:** Mariposita becomes the third stage.
- **Pajarito → Palomón** at 14.
- **Conejito → Liebrón** at 18.
- **Cojincito → Sillón** at 18.
- **Hojadillo → Hojarasco** at 24.
- **Ecolín → Murcielón** at 22.
- **Ochopatas → Tarantón** at 24.
- **Cuernito → Hercúleo** at 26.

All new forms get placeholder art.

**Code changes:**
- `evolution()` takes an optional `catchRate` (evolved forms otherwise halve it each stage).
- **Word samples stay put:** add `seed?: string` to `Species`. The curriculum seeds a family's core sample
  with `SPECIES[firstForm(sp)].seed ?? firstForm(sp)`.
- Gusanito gets `seed: 'mariposita'` and Cojincito gets `seed: 'sillon'`. Existing Mariposita and Sillón
  then keep exactly the words they had.
- **Check** that `itemsUpTo('mariposita', 30)` is identical before and after: add it to `data.test`.

**Where they're found:**

| Place | Change |
|---|---|
| Ruta 1 | add Gusanito (2–3, w 30) |
| Ruta 2 | Mariposita → Gusanito (3–6) |
| Ruta 3 | Mariposita → Capullito (7–9, w 15) + Mariposita (10–11, w 15) |

**Trainers who had a too-young Mariposita** (it now evolves at 10):

| Trainer | Team now |
|---|---|
| Mateo | Gusanito 3, Pajarito 3 |
| Valeria | Gusanito 5, Capullito 5 |
| Andrés | Pajarito 5, Conejito 6, Gusanito 6 |
| Iván | Pajarito 7, Capullito 7 |
| Isabel (Ruta 3) | Capullito 9, Hojadillo 9 |

Valeria's "after" line stays (she paints butterflies; her Gusanitos will become them).

**Sillón:**
- Señor Ramos's haunted armchair becomes a **Cojincito**: `wildBattle('cojincito', 5)`. Its text: «¡No era el
  sillón... era el cojín!»
- Joven Marcos (Ruta 3) gets Cojincito 11 instead of Sillón 11.

**Keep:**
- Paloma's Palomón 12 (leaders may be a little young).
- Old saves' Mariposita and Sillón as they are.

---

## 13. The A2 core, levels 21–35

From [content.md](content.md) §1.
- `coreItemsPerLevel(level)` returns 4 for levels 21–40: 2 words + 2 sentences.
- Add a core band for 21–35 (the words and sentences, mixed in the order given).
- `npm test -- data` must show words at every level up to 30 for every Palabrita.
- Run `node tools/sim.mjs`. Answers per level for 21–30 should come out at about 18–26; note the numbers in
  the commit message.

---

## 14. Water currents (needed in phase 3, built here because it's engine work)

- `TileDef.current?: Dir`.
- **Stepping onto a current tile** pushes you one tile in its direction each step, without input, until you
  land on a non-current tile or would hit something solid.
- **Look:** you keep facing the way you came, and the sprite doesn't walk.
- **Test (cutscene.test):** a 3-tile current chain moves you 3 tiles.

---

## 15. Definition of done

- Everything above is in, every listed test exists, and `npm test` is all green.
- The art page shows the new Palabrita forms (placeholders) and the night map.
- ROADMAP.md: phase 1 is marked ✓.
- Committed and pushed, one commit per section.

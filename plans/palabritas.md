# Palabritas: how they're made, and what's planned

New Palabritas come only from this list, or when the user asks (CLAUDE.md). The user designs the real art;
placeholders stand in until it arrives.

## How a Palabrita's data is made

In `SPECIES` (src/data/species.ts), with the helpers `m(name, type, mode, level?)` and
`evolution(from, level, {...})`; the recipe is in CLAUDE.md ("A Palabrita").

- **Stats:** first stages total about 180–210; second stages about 250–290; three-stage families start lower;
  single-stage rare ones about 210–265.
- **Moves:** 4 per family, one per challenge mode: choose (tap), type (write), listen, speak. By default listen
  comes at 6 and speak at 10; weaker Palabritas learn theirs earlier, stronger ones later (the user's guide).
  Evolved forms share their family's moves, theme and words.
- **A theme** per new family as a rule (one file in src/data/content/); a few families share one (Gotita and
  Ecolín both teach el tiempo).
- **Look:** a one-line description, for the placeholder drawing and the user's art prompt.
- **Placeholder drawings** in `DRAW` (src/art/creatures.ts): 48×48, one clear silhouette, 2–3 main colors from the
  master palette and a hard outline. They only need to read as "a squirrel", not be pretty.
- **IDs** have no accents; **names** do. `DEX_ORDER` lists families in the order you meet them (`npm test -- data`
  checks every species is there once).
- **Trainer teams:** mostly Palabritas from the area, with a few from elsewhere for excitement; no evolved forms
  below their evolution level.

## Planned

| Palabrita | Where | Status |
|---|---|---|
| Rugidito → Rugidón (black jaguar) | the Templo del Jaguar's altar (region 5), a gift | built, placeholder drawings; the user designs the art ([region5-jungle.md](region5-jungle.md)) |
| Pestañita → Oropelón (eyelash viper), Ranojito → Ranojón (red-eyed tree frog), Dardito (poison dart frog) | the Selva del Jaguar, a viper in the temple | built 2026-10-29, placeholder drawings; they borrow the cuerpo, tiempo and colores words |
| A legendary, level 50 | the volcano island in the Lago de las Islas, after the 8th gym | the user's idea; nothing designed yet |
| More rainforest families | Villa Jaguar, gym 5 | ideas: the mono congo, the lapa roja, the danto ([BIOMES.md](../BIOMES.md) §2) |

**Content waiting for a Palabrita:** «En el restaurante» (src/data/content/trainers.ts, ordering food) isn't used
yet. The user wants to keep it: a future Palabrita may teach it.

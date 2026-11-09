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
| Rugidito → Rugidón (black jaguar) | the Templo del Jaguar's altar (region 5), a gift | built, with the user's art ([region5-jungle.md](region5-jungle.md)) |
| Pestañita → Oropelón (eyelash viper), Ranojito → Ranojón (red-eyed tree frog), Dardito (poison dart frog) | the Selva del Jaguar, a viper in the temple | built 2026-10-29, placeholder drawings; they borrow the cuerpo, tiempo and colores words |
| Gym 6's Psíquico families (2026-11-02): Lunarcito → Hojaluna (15) → Polilluna (30), the luna moth (Bicho, then Bicho/Psíquico; words: the night and dreams); Duende, no evolution, small and strong (Psíquico; hiding and finding); Carablanquita → Carablanca (26), the white-faced capuchin that makes stones float (Psíquico/Lucha; thinking and opinions); Quetzalito → Quetzalón (30) (Psíquico/Volador; wishes and hope) | rare in the wild before region 6: Lunarcito on Rutas 4–5, the Duende on Ruta 4 and in the canyon, Carablanquita in the Selva, Quetzalito above Ruta 10's stream. The gym 6 leader's team: Duende, Polilluna, Quetzalón, Carablanca (the ace, the user's favourite: total 336); a gym trainer may bring Petroglifón, not the leader | built, placeholder drawings |
| Gym 7's Eléctrico families (2026-11-02): Tijeretita → Fragatón (26), the frigatebird with a yellow pouch (Volador/Eléctrico; words: news and forecasts); Gequito → Garrobón (24), the gecko by the lamps that grows into a garrobo with yellow splashes (Eléctrico, then Eléctrico/Roca; light and electricity); Dantito → Dantón (32), the tapir, its calf striped like lightning (Eléctrico; caring for the planet); Tigrillo, the margay, no evolution, fast and strong like Jolteon (Eléctrico; calls and messages) | before surfing: Tijeretita on Ruta 6 and the turtle beach, Gequito on Ruta 7 and the volcano (Garrobón rare). After: Dantito in the Selva and swimming in the rivers, the Tigrillo rare in the Selva, Fragatón rare at sea. The stormy lake islands (gym 7) get them too, once built | built, placeholder drawings |
| Gym 8's Dragón families (2026-11-09, plans/region7-8.md): Lagartito → Lagartón (36), the caiman of the great lake (Agua, then Agua/Dragón; advice); Basiliquito → Basilisco (38), the lizard that runs on water (Normal, then Dragón; goals and effort); Salamandrita → Salamandrón (40), the lava salamander (Fuego, then Fuego/Dragón; emergencies); Culebrita → Emplumón (45), the feathered serpent (Dragón, then Dragón/Volador; legends) | Lagartito swimming in the rivers and lakes (common on the stormy lake, Lagartón rare there); Basiliquito in the Selva (rare) and on Ruta 11; Salamandrita in the crater (rare) and Ciudad Ceniza; Culebrita very rare in the jungle temple, rare in Ciudad Ceniza. Emplumón: Aurora's ace | built, placeholder drawings |
| A legendary, level 50 | the volcano island in the Lago de las Islas, after the 8th gym | the user's idea; nothing designed yet |
| More rainforest families | Villa Jaguar, gym 5 | ideas: the mono congo, the lapa roja, the danto ([BIOMES.md](../BIOMES.md) §2) |

**Content waiting for a Palabrita:** «En el restaurante» (src/data/content/trainers.ts, ordering food) isn't used
yet. The user wants to keep it: a future Palabrita may teach it.

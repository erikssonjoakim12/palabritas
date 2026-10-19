# Palabritas — learning plan

How a Palabrita's levels map to real Spanish learning, and what material is still to write.
Status: **levels 2–35 have their Spanish** (the A1 and A2 core in src/data/content/core.ts, 20 themes, school
topics). The rules below live in src/data/content/index.ts and src/game/curriculum.ts; `tools/sim.mjs` measures them.

## Two tracks in every level

- **Core Spanish:** the high-frequency words and sentences everyone needs, in one list, most useful first:
  ~650 A1 words (levels 2–20), then the A2 core (sentences and words, levels 21–35).
  - The **first 7 core words are universal** (levels 2–4): *hola, sí, no, yo, tú, gracias, por favor*.
  - **Starters walk the list in order**: all three teach the same ~119 most useful words by level 20, whichever
    one you pick. Starters can't be found in the wild before gym 4.
  - **Other kinds have their own fixed random sample** of each level's slice (the same for every Pajarito,
    different for a Conejito), so catching new kinds brings new words.
  - Mastered core words count for every Palabrita.
- **Theme:** each family's own vocabulary (dogs, food, weather, the sea...).
- **Shared items:** the same Spanish in two lists (e.g. *el agua* in the core and in two themes) is ONE item,
  counted at the lowest level any list has it. Master it once and it counts everywhere; a kind never gets the
  same item twice.

## Level rules

*A good answer = correct or almost (e.g. a missing accent), without 💡 help.*

- **New core items per level:** 2 + (level − 2) ÷ 2 for levels 2–20 (119 by level 20); for 21–40 a fixed
  schedule of 5–10 (`A2_CORE`).
- **New theme items per level:** 3 words (2–10), 4 short phrases (11–20), 3 sentences (21+).
- **Mastered after:** 1 good answer (levels 2–20), 2 (21–40), 2 on different days (41+).
- **Rolling review:** to level up, also re-answer **half of the items from 5 levels back** (level 12 reviews
  half of level 7). On top of that, spaced repetition brings mastered words back (loyalty).
- **The work per level never goes down** (the user's rule). Levels are planned by the answers they need: when
  the review shrinks, a level takes a few more new items to make up for it (`data.test` checks this).

Answers per level, measured with the real code (a starter):

| Levels | Answers per level |
|---|---|
| 2–20 | climbs from 5 to 21 |
| 21–24 | 23 |
| 25–30 | 24–26 |
| 31–34 | 27–28 |
| 35–40 | 30–32 |

### Levels 41–100 (sentences, to write later)

| Levels | Band | Grammar | Mastered after |
|---|---|---|---|
| 41–60 | **Conversación** (B1) | past vs imperfect, perfect, future, connectors, opinions | 2 answers on **different days** |
| 61–80 | **Fluidez** (B2) | subjunctive, conditionals with *si*, idioms | 2 answers, different days |
| 81–100 | **Maestría** (C1) | nuance, formal vs slang, regional variety (voseo) | 2 answers, different days |

## Themes

A theme belongs to a Palabrita family (not its type), and every new family gets its own: 20 so far (perro,
tiempo, comida, naturaleza, números, colores, casa, then cuerpo, cocina, deportes, música, salud, historia,
Latinoamérica, playa, frutas, mar, pesca, viaje, familia). Region 4 adds 8 more ([plans/content.md](plans/content.md)).

## Material still to write

| For | What |
|---|---|
| Region 4 | 8 themes, 2 school topics ([plans/content.md](plans/content.md)) |
| Levels 36–40 | the rest of the A2 core |
| Levels 41–60 | B1 core sentences and theme sentences |
| Levels 61–100 | B2–C1 sentences (a candidate for Claude-generated items) |

Latin American Spanish throughout; worth a native speaker's skim, but nothing waits for it.

## Decided

- **Gym leaders** work like any trainer: their Palabritas are stronger, so their words are harder. One battle mechanic.
- **Attack questions** come from your own Palabrita: its words at its level, the review it needs, older words.
- **Defense questions** come from the opponent: its exact kind's words (core sample + theme) of the level it
  mastered to get where it is (a level-7 Pajarito asks Pajarito's level-6 words; level 2 uses level 2).
  After level 20 that means sentences, so defending against strong Palabritas gets harder naturally.
- **Core list source:** written for this game, ordered by everyday spoken frequency and covering the CEFR A1/A2
  topics, with Latin American forms (celular, carro, computadora...) and alternatives accepted.
- **Saves keep their words:** a family's word sample is pinned (`seed`), so changing families never changes
  what an existing Palabrita has learned.

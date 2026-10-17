# Palabritas — learning plan

How a Palabrita's levels map to real Spanish learning, and what material we need to write.
Status: **levels 2-20 implemented** (core list in src/data/content/core.ts, per-kind words in src/game/curriculum.ts).
Still to write: the A2 core words and core sentences for levels 21+ (until then, levels 21+ only add theme sentences).

## Two tracks in every level

- **Core Spanish:** the high-frequency words everyone needs, ~650 A1 words and expressions in one list,
  most useful first.
  - The **first 7 core words are universal** (levels 2–4): *hola, sí, no, yo, tú, gracias, por favor*.
  - **Starters walk the list in order**: all three teach the same ~119 most useful words by level 20,
    whichever one you pick. Your starter is special; starters can't be found in the wild before Gym 4.
  - **Other kinds have their own fixed random sample** of each level's slice of the list (the same for every
    Pajarito, different for a Conejito), so catching new kinds brings new words.
  - Mastered core words count for every Palabrita.
- **Theme:** each Palabrita's own vocabulary (dogs, food, weather…).
- **Shared items:** the same Spanish in two lists (e.g. *el agua* in the core and in two themes) is ONE item.
  Master it once and it counts everywhere; a kind never gets the same item twice, so that level is just shorter.
  Nothing is left out of the core because a theme also teaches it.

## Level table

*A good answer = correct or almost (e.g. a missing accent), without 💡 help.*

- **New core words per level = 2 + (level − 2) ÷ 2, rounded down** (+1 every second level) → 119 by level 20.
- **New theme items per level:** 3 words (2–10), 4 short phrases (11–20), 3 sentences (21+).
- **Mastered after:** 1 good answer (levels 2–20), 2 (21–40), 2 on different days (41+).
- **Rolling review:** to level up, also re-answer **half of the items from 5 levels back** (level 12 reviews
  half of level 7). Same total amount as checkpoints every 5 levels, but spread evenly, and the 5-level gap
  is good spacing for memory. On top of that, spaced repetition brings mastered words back (loyalty).

Measured with the real game code (a starter, ~85% right answers; a wild battle ≈ 4–5 answers):

| Levels | Answers per level |
|---|---|
| 2–6 | 6–8 |
| 7–11 | 10–13 |
| 12–16 | 17–20 |
| 17–20 | 22–26 |
| 21–30 | 9–20 (only theme sentences until the A2 core is written) |

### Levels 21–100, per level (sentences)

| Levels | Band | New core | New theme | Mastered after |
|---|---|---|---|---|
| 21–40 | **Primeras oraciones** (A2): present tense, *ir a*, basic past, pronouns, comparisons | 2 words (A2 pool) + 2 sentences | 3 sentences | 2 good answers |
| 41–60 | **Conversación** (B1): past vs imperfect, perfect, future, connectors, opinions | 3 sentences | 3 sentences / dialogue lines | 2 answers on **different days** |
| 61–80 | **Fluidez** (B2): subjunctive, conditionals with *si*, idioms | 3 sentences | 3 dialogues | 2 answers, different days |
| 81–100 | **Maestría** (C1): nuance, formal vs slang, regional variety | 3 sentences | 3 longer listening/speaking items | 2 answers, different days |

Core sentences will also be drawn per kind from shared band pools, so new kinds bring new grammar examples too.

## Core coverage (by level 20)

| Raised to level 20 | Core words covered (of ~650) |
|---|---|
| A starter | ~120 (the most useful ones) |
| The 8 current kinds | ~460 |

## Themes

As many themes as learning Spanish needs: a theme belongs to a Palabrita family (not its type), and every new
family gets its own (gyms 2–4 add 18: see [PLAN_GYMS_2-4.md](PLAN_GYMS_2-4.md)). The first **7**:
El perro, El tiempo, La comida, La naturaleza, Los números, Los colores, La casa.
Ideas for later: La familia, El cuerpo, Los sentimientos, La ciudad, El viaje, El trabajo, La escuela, La salud,
La ropa, Las compras, Los deportes, La música, La tecnología.

## Material to write

| Phase | Covers | Core | Themes (×7) | Total |
|---|---|---|---|---|
| **A (next)** | levels 2–30 | ~650 A1 words (done) + ~200 A2 words + ~60 sentences for 21–30 | 27 words + 40 phrases + 30 sentences = 97 each → 679 (mostly exists already) | **≈ 1,440** |
| B | levels 31–40 | +~200 A2 words, ~60 sentences | 30 each → 210 | ≈ 470 |
| C | levels 41–60 | ~180 B1 sentences | 60 each → 420 | ≈ 600 |
| D | levels 61–100 | ~360 sentences | 120 each → 840 | ≈ 1,200 (candidate for Claude-generated items) |

Latin American Spanish throughout; worth a native speaker's skim per phase.

## Implementation notes (for later)

- Content: a core word pool (ordered easiest/most frequent first), core sentence pools per band, one list per theme.
- Starters walk the core list in order; other kinds derive a stable sample per level from their id.
- Leveling: all new items of the level mastered, plus the rolling review.
- Review half: a stable choice per item and level, so it doesn't change between sessions.
- START → PALABRITAS shows e.g. `Nuevas 5/8 · Repaso 12/20`.
- Existing players keep everything they've mastered.

## Decided

- **Gym leaders** work like any trainer: their Palabritas are stronger, so their words are harder. One battle mechanic.
- **Attack questions** come from your own Palabrita: its words at its level, the review it needs, older words.
- **Defense questions** come from the opponent: its exact kind's words (core sample + theme) of the level it
  mastered to get where it is (a level-7 Pajarito asks Pajarito's level-6 words; level 2 uses level 2).
  After level 20 that means sentences, so defending against strong Palabritas gets harder naturally.
- **Core list source:** written for this game, ordered by everyday spoken frequency and covering the CEFR A1 topics,
  with Latin American forms (celular, carro, computadora...) and alternatives accepted. Words a theme also
  teaches are shared items, not left out.

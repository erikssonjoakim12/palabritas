# Palabritas — game design (iteration 1)

A Game Boy Color–style monster-taming RPG (in the spirit of Pokémon Gold/Silver) where
your creatures grow by **you** learning Spanish. Latin American Spanish, phone-first
(Android Chrome), text-heavy, with listening (text-to-speech) and speaking (microphone).

## Core idea: words are experience

There is no XP from battles. A creature's **level is how much of its theme you have mastered**.

- Every creature has a **battle type** (the 17 types from Gen 2, in Spanish:
  Fuego, Agua, Planta, Volador…) and a **theme** (*tema*), a slice of Spanish:
  Salchichita (a dachshund in a hot dog bun) → talking to and about dogs, Sillón → the home (soft pillows, cleaning stains), and so on.
- Each theme is split into **tiers**, one per level. Tier 2 is what a level-2 creature is
  learning, tier 3 for level 3, etc. When every item in the creature's current tier is
  **mastered**, the creature levels up and the next tier unlocks.
- Tiers get harder: single words → adjectives and verbs → short phrases → full sentences in
  present tense → commands → past tense, comparisons → subjunctive and conditionals.
- Levels 2–12 are deliberately quick (3–4 short items per level) since the player
  already knows some Spanish. Iteration 1 has content up to level 15. Levels go to 100 later.

### The level curve

> **Being redesigned:** see [LEARNING_PLAN.md](LEARNING_PLAN.md) (core + theme tracks, bands, reviews). The section below describes what is implemented today.

Goal: a Palabrita at **level 60 ≈ B1** (you can keep most conversations going on its theme) and
**level 100 ≈ C1** (basically fluent on it). A team of Palabritas adds up to broad Spanish:
each theme brings its own vocabulary, while grammar follows the same bands in every theme.

**Items per level = 3 + (level − 1) ÷ 10** (rounded down): 3 for levels 2–10, 4 for 11–20, 5 for 21–30 … 12 for 91–100.
Each theme's content is ONE ordered list (easiest first) that the game splits into levels by this formula.

| Levels | Content | Items/level | Mastered after | Plus | ≈ Answers/level | ≈ Battles/level | ≈ Time/level |
|---|---|---|---|---|---|---|---|
| 2–10 | words, most basic phrases | 3 | 1 good answer | – | 4 | 1 | 2 min |
| 11–20 | short phrases | 4 | 2 good answers | – | 14 | 3 | 6 min |
| 21–40 | simple full sentences (present, *ir a*, basic past) | 5–6 | 2 good answers | review previous 5 levels | 42–50 | 9–11 | 20–25 min |
| 41–60 | longer sentences, mixed past, opinions, mini-dialogues (B1) | 7–8 | 2 good answers on **different days** | review previous 5 levels | ~60 | ~14 | ~30 min, over 2+ days |
| 61–80 | subjunctive, conditionals, idioms (B2) | 9–10 | 2 answers, different days | review | ~85 | ~19 | ~40 min, 2+ days |
| 81–100 | nuance, register, long listening/speaking (C1) | 11–12 | 2 answers, different days | review | ~100 | ~22 | ~50 min, 2+ days |

Measured with the real game code up to level 30 (a player answering right ~85% of the time); higher levels are estimates.
A wild battle has about 4–5 of your answers (~1.5–2 min). Roughly 45–50 hours of play takes one Palabrita
from 2 to 100 (about 5 months at 20 minutes a day).

- **Good answer** = correct or almost correct (e.g. a missing accent), without the 💡 help button.
- **Review (level 21+):** before leveling up, every item from the previous 5 levels must be answered well again
  since the Palabrita reached its current level (level 25 reviews levels 20–24). Battles mix these in automatically.
  Progress shows in START → PALABRITAS (`Sig. nivel 3/5 +repaso 12/25`) and on the details page.
- Content exists up to level 30 for now (117 items per theme).

### Control (lealtad): use it or lose it

Mastered items are scheduled for review with spaced repetition (1, 2, 4, 8, 16… days).
An item you haven't used well past its review date is **fading**.
A creature's **lealtad** (loyalty) is the share of its mastered items that aren't fading.
Below 70%, it may ignore your command. You get it back by answering a review
question correctly ("¡Háblale!"). Battles pick fading and due words first, so playing keeps
your team obedient.

## Names

The creatures are **Palabritas**, you catch them with **Palabolas**, and you heal them at the **Palacentro**.

## Battles

- Each creature has 4 moves, and **each move is a kind of challenge**:
  - 👆 **Elegir**: see Spanish, tap the meaning (weakest)
  - 🎧 **Escuchar**: hear Spanish, type what you heard
  - ⌨️ **Escribir**: see English, type the Spanish
  - 🎤 **Hablar**: see English, say it out loud (strongest). If you can't talk right now, you can switch to typing.
- Answer quality changes damage: perfect (accents too) on a non-tap move = **critical hit ×1.5**, close ×0.75,
  with 💡 help ×0.5, wrong = miss. Move power: tap 35, listen 45, write 55, speak 65.
- **Learning moves:** like Gen 2, a Palabrita starts with 2 moves (👆 tap, ⌨️ write). By default it learns 🎧 listen
  at level 6 and 🎤 speak at level 10, so the player gets used to each mechanic first. Each Palabrita can differ:
  weaker ones learn all 4 earlier, stronger ones later.
- **Level-ups happen last in a turn**, and only if your attack landed and your Palabrita is still standing.
  Training happens only in battles; the START menu is for looking at your Palabritas.
- Gen 2 type chart, same-type bonus, speed order.
- **Trainer battles** add *defense*: when the enemy attacks, you answer a question from the **opponent Palabrita's
  theme, at its level** (a stronger Palabrita asks harder things). A good answer reduces the damage.
- **Catching**: weaken it, throw a *Palabola*, and say or type the "magic word" (an item from its theme).
  A better answer gives a better catch chance.

## World (iteration 1)

```
Ciudad Brisa      Gym 1: Paloma (Volador) · present tense · Medalla Brisa
   │ Ruta 2       tall grass, trainer Mateo (question words)
Villa Limón       Palacentro · Doña Lupe's lost-cat quest → unlocks Palabolas
   │ Ruta 1       tall grass, trainer Sofía (greetings)
Pueblo Amanecer   home (Mamá heals) · Profesora Ceiba's lab (choose your starter)
```

**Starters:** Salchichita (Fuego · el perro), Gotita (Agua · el tiempo/weather), Aguacatito (Planta · la comida).
**Wild:** Pajarito (Volador · naturaleza), Conejito (Normal · números), Mariposita (Bicho · colores),
plus Sillón (Normal/Fantasma · la casa) hiding in a house in Villa Limón.

**The Michi quest** (Villa Limón): Doña Lupe's cat is lost. You have to *ask* villagers "¿Has visto a Michi?"
(typed or spoken), then *listen* to the baker's spoken answer to find where she is. Reward: Palabolas, and catching unlocks.

## Ideas parked for later

- **Evolution notes:** some Palabritas are very weak before evolving, others progress evenly (like Gen 2).
  The user loves evolving mid-battle (anime moments): trigger it at the end of a turn, like level-ups.

- **Evolutions tied to grammar milestones.** For example, Gotita → Nubarrón when you master the -ón
  augmentative and weather in the past tense. The new name itself teaches word-building.
- Claude-graded free-form sentences ("describe your creature in one sentence") with feedback.
- Pre-recorded natural voices instead of the browser's text-to-speech.
- More gyms following Gen 2's order: Bicho (irregular verbs), Normal (gustar), Fantasma (pretérito),
  Lucha (imperativo), Acero (ser/estar), Hielo (imperfecto), Dragón (subjuntivo).
- Shops (ordering in Spanish), day/night, phone calls from NPCs (listening practice), a rival.

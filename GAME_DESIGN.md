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

Full design and tables: [LEARNING_PLAN.md](LEARNING_PLAN.md). In short:

Goal: a Palabrita at **level 60 ≈ B1** (you can keep most conversations going on its theme) and
**level 100 ≈ C1** (basically fluent on it). A team of Palabritas adds up to broad Spanish.

- Every level teaches **core words** (a shared ~650-word A1 list: starters teach it in order, most useful first; other kinds learn their own sample)
  plus **theme items** (the Palabrita's own topic): words for levels 2–10, short phrases for 11–20, sentences from 21.
  The same Spanish in two lists is one shared item: master it once, it counts everywhere.
- New core words per level = 2 + (level − 2) ÷ 2 (119 by level 20). Theme: 3, 4, then 3 per level.
- **Good answer** = correct or almost correct (e.g. a missing accent), without the 💡 help button.
  Up to level 20 one good answer masters an item; 21–40 needs two; 41+ two on different days.
- **Rolling review:** before leveling up, half of the items from 5 levels back must be answered well again
  (level 12 reviews level 7). Battles mix these in automatically.
  Progress shows in START → PALABRITAS (`Nuevas 3/9 · Repaso 2/4`) and on the details page.
- Trainer defense questions (gym leaders too) come from the opponent's own kind: the words of the level it mastered to get where it is.
- Written content: core words to level 20, theme items to level 37.

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
  with 💡 help ×0.5, wrong = miss. Move power: tap 35, write 45, listen 55, speak 65 (learned in that order).
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

## Money and items

- Beating a trainer pays **the total stats of their Palabritas** in pesos ($): Sofía $42 ... Paloma ~$170.
  Losing (all Palabritas fainted) drops **half your money**, like Gold/Silver. Wild battles pay nothing.
- The **shop** (the first one is in Ciudad Brisa) sells Palabolas ($80) and Pociones ($120, heal 20 PS). To buy,
  you **ask the cashier in Spanish**, typed or spoken: «Quiero dos Palabolas, por favor», «Me da una poción»...
  Any natural phrasing with the right item and amount counts; accents and singular/plural make it perfect.
- **MOCHILA** (bag): in START to look at items and use Pociones, and in battle (using an item takes your turn;
  Palabolas only against wild Palabritas). Doña Lupe gives the first 5 Palabolas; after that, you buy them.

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

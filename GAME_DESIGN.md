# Palabritas — game design

A Game Boy Color–style monster-taming RPG (in the spirit of Pokémon Gold/Silver) where
your creatures grow by **you** learning Spanish. Latin American Spanish, phone-first
(Android Chrome), text-heavy, with listening (text-to-speech) and speaking (microphone).
Where the game is going: [ROADMAP.md](ROADMAP.md).

## Core idea: words are experience

There is no XP from battles. A creature's **level is how much of its theme you have mastered**.

- Every creature has a **battle type** (the 17 types from Gen 2, in Spanish:
  Fuego, Agua, Planta, Volador…) and a **theme** (*tema*), a slice of Spanish:
  Salchichita (a dachshund in a hot dog bun) → talking to and about dogs, Sillón → the home, and so on.
  A family (Salchichita → Hamburguesón → Nacatamastín) shares one theme and keeps its words when it evolves.
- Each level has its own items. When every new item of the current level is **mastered** (plus a short
  review of older ones), the creature levels up.
- Items get harder: single words → short phrases → full sentences (present tense, *ir a*, the past...).
  Every Palabrita has its Spanish up to level 50 today; levels go to 100 later.

### The level curve

Full design and tables: [LEARNING_PLAN.md](LEARNING_PLAN.md). In short:

Goal: a Palabrita at **level 60 ≈ B1** (you can keep most conversations going on its theme) and
**level 100 ≈ C1** (basically fluent on it). A team of Palabritas adds up to broad Spanish.

- Every level teaches **core Spanish** (one shared list, most useful first: starters teach it in order, other
  kinds learn their own sample) plus **theme items** (the Palabrita's own topic).
  The same Spanish in two lists is one shared item: master it once, it counts everywhere.
- **Good answer** = correct or almost correct (e.g. a missing accent), without the 💡 help button.
  Up to level 20 one good answer masters an item; 21–40 needs two; 41+ two on different days.
- **Rolling review:** before leveling up, half of the items from 5 levels back must be answered well again.
  Battles mix these in automatically. The work per level never goes down.
- Progress shows in START → PALABRITAS (`Nuevas 3/9 · Repaso 2/4`) and on the details page.
- Trainer defense questions (gym leaders too) come from the opponent's own kind: the words of the level it mastered to get where it is.

### Control (lealtad): use it or lose it

Mastered items are scheduled for review with spaced repetition (1, 2, 4, 8, 16… days).
An item you haven't used well past its review date is **fading**.
A creature's **lealtad** (loyalty) is the share of its mastered items that aren't fading.
Below 70%, it may ignore your command. You get it back by answering a review
question correctly ("¡Háblale!"). Battles pick fading and due words first, so playing keeps
your team obedient. The **schools** (one in every gym town) also offer REPASO: the words due for review.

## Names

The creatures are **Palabritas**, you catch them with **Palabolas**, and you heal them at the **Palacentro**.

## Battles

- Each creature has 4 moves, and **each move is a kind of challenge**:
  - 👆 **Elegir**: see Spanish, tap the meaning (weakest)
  - 🎧 **Escuchar**: hear Spanish, type what you heard
  - ⌨️ **Escribir**: see English, type the Spanish
  - 🎤 **Hablar**: see English, say it out loud (strongest). If you can't talk right now, you can switch to typing.
- A small colored symbol shows each move's type (a yellow lightning bolt for Eléctrico...).
- Answer quality changes damage: perfect (accents too) on a non-tap move is a **critical hit ×1.5** half the
  time, close ×0.75, with 💡 help ×0.5, wrong = miss. Move power: tap 35, write 45, listen 55, speak 65.
- **Learning moves:** like Gen 2, a Palabrita starts with 2 moves (👆 tap, ⌨️ write). By default it learns 🎧 listen
  at level 6 and 🎤 speak at level 10, so the player gets used to each mechanic first. Weaker Palabritas learn
  theirs earlier, stronger ones later; the starters learn their third move at 10 and their fourth at 16, once evolved.
- **Level-ups and evolutions happen last in a turn** (the "anime moment"), and only if your attack landed and
  your Palabrita is still standing. Training happens only in battles.
- Gen 2 type chart, same-type bonus, speed order.
- **Trainer battles** add *defense*: when the enemy attacks, you answer a question from the **opponent Palabrita's
  theme, at its level** (a stronger Palabrita asks harder things). A good answer reduces the damage.
- **Catching**: weaken it, throw a *Palabola*, and say or type the "magic word" (an item from its theme).
  A better answer gives a better catch chance.

## Money and items

- Beating a trainer pays **the total stats of their Palabritas** in córdobas (C$).
  Losing (all Palabritas fainted) drops **half your money**, like Gold/Silver. Wild battles pay nothing.
- **Shops** sell Palabolas, Superbolas, Pociones and more. To buy, you **ask the cashier in Spanish**, typed or
  spoken: «Quiero dos Palabolas, por favor», «Me da una poción»... Any natural phrasing with the right item and
  amount counts; accents and singular/plural make it perfect.
- **MOCHILA** (bag): in START to look at items and use them, and in battle (using an item takes your turn;
  Palabolas only against wild Palabritas). Key items (the fishing rod, the fossil...) have their own pocket.
- The **Caja de Palabritas** (the Palacentro computer) stores Palabritas when your team of 6 is full.

## The world

A Nicaragua-inspired country: farms and villages, pine highlands, the Pacific coast, volcanoes, and later
rainforest, lakes and cloud forest ([BIOMES.md](BIOMES.md)). Surf (after the 4th medal) and Fly (after the 5th)
are planned ([plans/surf-fly.md](plans/surf-fly.md)). Every quest is a Spanish task: asking villagers
about a lost cat, giving lost words back to a muted town, counting turtle eggs, taking restaurant orders.
Rival **Lucas** and the villains **Equipo Silencio** (who steal words) run through the story.
Day and night follow the phone's clock.

## Ideas parked for later

- **Evolutions tied to grammar milestones.** For example, an evolution when you master the -ón augmentative.
  The new name itself teaches word-building.
- Claude-graded free-form sentences ("describe your creature in one sentence") with feedback.
- Pre-recorded natural voices instead of the browser's text-to-speech.
- Phone calls from NPCs (listening practice).
- The bus (fast travel, ordering a ticket with *ir a*), once there are big roads.

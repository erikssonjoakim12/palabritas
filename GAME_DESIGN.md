# Palabritas — game design (iteration 1)

A Game Boy Color–style monster-taming RPG (in the spirit of Pokémon Gold/Silver) where
your creatures grow by **you** learning Spanish. Latin American Spanish, phone-first
(Android Chrome), text-heavy, with listening (text-to-speech) and speaking (microphone).

## Core idea: words are experience

There is no XP from battles. A creature's **level is how much of its theme you have mastered**.

- Every creature has a **battle type** (the 17 types from Gen 2, in Spanish:
  Fuego, Agua, Planta, Volador…) and a **theme** (*tema*), a slice of Spanish:
  Perrito → talking to and about dogs, Sillón → the home (soft pillows, cleaning stains), and so on.
- Each theme is split into **tiers**, one per level. Tier 2 is what a level-2 creature is
  learning, tier 3 for level 3, etc. When every item in the creature's current tier is
  **mastered**, the creature levels up and the next tier unlocks.
- Tiers get harder: single words → adjectives and verbs → short phrases → full sentences in
  present tense → commands → past tense, comparisons → subjunctive and conditionals.
- Levels 2–12 are deliberately quick (3–4 short items per level) since the player
  already knows some Spanish. Iteration 1 has content up to level 15. Levels go to 100 later.

### Mastery

Each item (word, phrase or sentence) earns points when answered correctly:

| Answer | Choose (tap) | Listen / Type / Speak |
|---|---|---|
| Perfect (accents too) | +1 | +2 |
| Close (missing accent, small typo, missing article) | +0.5 | +1 |
| Wrong | −1 | −1 |

2 points = mastered. Typing a word you already know perfectly masters it on the spot.
Brand-new words can be revealed with **💡 Ayuda**, but then the answer counts as "close" at best,
so you'll need to get it right once more later.

### Control (lealtad): use it or lose it

Mastered items are scheduled for review with spaced repetition (1, 2, 4, 8, 16… days).
An item you haven't used well past its review date is **fading**.
A creature's **lealtad** (loyalty) is the share of its mastered items that aren't fading.
Below 70%, it may ignore your command. You get it back by answering a review
question correctly ("¡Háblale!"). Battles pick fading and due words first, so playing keeps
your team obedient.

## Battles

- Each creature has 4 moves, and **each move is a kind of challenge**:
  - 👆 **Elegir**: see Spanish, tap the meaning (weakest)
  - 🎧 **Escuchar**: hear Spanish, type what you heard
  - ⌨️ **Escribir**: see English, type the Spanish
  - 🎤 **Hablar**: see English, say it out loud (strongest). If you can't talk right now, you can switch to typing.
- Answer quality changes damage: perfect on a hard move = **critical hit**, close = weaker hit, wrong = miss.
- Gen 2 type chart, same-type bonus, speed order.
- **Trainer battles** add *defense*: when the enemy attacks, answer their topic's question to halve the damage.
  The gym leader's topic is a grammar point (Gym 1: present tense).
- **Catching**: weaken it, throw an *Esfera*, and say or type the "magic word" (an item from its theme).
  A better answer gives a better catch chance.

## World (iteration 1)

```
Ciudad Brisa      Gym 1: Paloma (Volador) · present tense · Medalla Brisa
   │ Ruta 2       tall grass, trainer Mateo (question words)
Villa Limón       Centro de Criaturas · Doña Lupe's lost-cat quest → unlocks Esferas
   │ Ruta 1       tall grass, trainer Sofía (greetings)
Pueblo Amanecer   home (Mamá heals) · Profesora Ceiba's lab (choose your starter)
```

**Starters:** Perrito (Fuego · el perro), Gotita (Agua · el tiempo/weather), Aguacatito (Planta · la comida).
**Wild:** Pajarito (Volador · naturaleza), Conejito (Normal · números), Mariposita (Bicho · colores),
plus Sillón (Normal/Fantasma · la casa) hiding in a house in Villa Limón.

**The Michi quest** (Villa Limón): Doña Lupe's cat is lost. You have to *ask* villagers "¿Has visto a Michi?"
(typed or spoken), then *listen* to the baker's spoken answer to find where she is. Reward: Esferas, and catching unlocks.

## Ideas parked for later

- **Evolutions tied to grammar milestones.** For example, Gotita → Nubarrón when you master the -ón
  augmentative and weather in the past tense. The new name itself teaches word-building.
- Claude-graded free-form sentences ("describe your creature in one sentence") with feedback.
- Pre-recorded natural voices instead of the browser's text-to-speech.
- More gyms following Gen 2's order: Bicho (irregular verbs), Normal (gustar), Fantasma (pretérito),
  Lucha (imperativo), Acero (ser/estar), Hielo (imperfecto), Dragón (subjuntivo).
- Shops (ordering in Spanish), day/night, phone calls from NPCs (listening practice), a rival.

# A world that feels alive (the user, 2026-11-09)

Small touches that make the world feel lived in, chosen by the user from a longer list. Built in parts, one session
each, every part ending playable with its tests green. None of it changes saves (the weather and the people's spots
come from the clock and the flags already kept).

## Part 1 — Small movements on the map

Little animations, like Gold/Silver's, each drawn on the canvas with its colors in colors.ts. Check them on a phone
with `tools/perf.mjs` (they must not slow the walk).

- **Grass that moves:** tall grass shakes when you step into it, and its tips cover your feet (like Gold/Silver).
- **Footprints in the sand** that fade after a few seconds (beaches, the ash fields of Ciudad Ceniza).
- **Ripples** behind you when you swim (Surf), and a small splash as you get in.
- **Birds** pecking on paths and in clearings that fly off when you come near (a few per route, not in caves or towns
  at night).
- **Smoke** from a chimney or two in each town (a wood stove's smoke rising and drifting with the wind).
- **Waves** that roll onto the beaches and draw back (Playa Carey, the turtle beach, the lake shores).
- **A shadow under you** when you hop a ledge, and a puff of dust when you land.

## Part 2 — Greetings by the clock

The game already follows the phone's clock (day and night). Now the people do too.

- **Greetings by the hour:** «¡Buenos días!» (until 12), «¡Buenas tardes!» (until 19), «¡Buenas noches!» (from 19),
  with English for the EN button. One helper, used by the nurses in every Palacentro, the cashiers, Mom, and the
  people who say hello. A small, real piece of Spanish heard all the time.
- **A few people keep hours:** in each town, one or two people stand somewhere else in the morning, afternoon and
  night (the kids play outside after school; at night someone has gone home and says «Ya es tarde, ¿no?»). Shops and
  Palacentros never close: that would only get in the way.

## Part 3 — Weather

Each region has its own weather, chosen from the date and the hour (the same for a few hours, so it feels like a
real day; the same on every phone at the same time). Never in caves or houses, and never in the way: the fog story
keeps its own fog.

| Region | Weather |
|---|---|
| Farms and villages (Rutas 1–3, Brisa, Limón) | mostly sunny; now and then a light rain |
| Pine highlands (Ocote, Rutas 4–5) | morning mist; wind |
| Pacific coast (Carey, the beaches) | sun and sea wind; rare storms |
| The volcano (Chispa, the crater, Ceniza) | ash on the wind when the volcano is restless |
| Rainforest (Jaguar, the Selva) | the tropical afternoon shower: rain most afternoons |
| Cloud forest (Bruma, Ruta 10–11) | drizzle and low clouds |
| The stormy lake (Puerto Rayo) | its storm (built), with clear spells |

**How it makes the game better** (not just how it looks):
1. **Palabritas that come out in the rain** (frogs, Gotita's family, Lagartito), in the sun, or in the mist (the luna
   moth): a reason to come back to a route in another weather, and it fits each animal's habits. Shown on the wild
   Palabritas page.
2. **Weather in battle, gently:** rain makes Agua moves a little stronger and Fuego a little weaker, sun the other way
   (much milder than Gold/Silver's Rain Dance, so it never decides a battle on its own).
3. **Spanish about the weather:** people talk about it («¡Qué calor!», «Va a llover», «Hay mucha neblina»), and a
   **forecast board** in each Palacentro reads like a real one: «Pronóstico: lluvia en la Selva por la tarde». It is
   reading practice, and it tells you where the rain Palabritas are today.
4. **The look:** light rain (the storm's rain without the lightning), mist that drifts across the map, leaves or ash
   blowing in the wind, puddles in towns after rain.

## Part 4 — People who notice what you've done

Many people say the same thing from the first visit to the last. A helper in flows.ts gives someone different lines
as the story goes on (by medals and flags), and each town gets a few:

- **After you beat its gym:** «¡Tú venciste a Petra! Todo el pueblo habla de eso.»
- **Mom** has something new to say after each medal, and about the Palabrita you're traveling with.
- **Your Palabrita from their part of the country:** «¡Un Chocoyito! Aquí en Chispa los queremos mucho.»
- **After the story's big moments** (Equipo Silencio driven out, the boy found in the fog): the town is relieved, and
  says so.
- In later towns the lines use the past tense, so they review what you learned there.

## Pinned (later)

- **Your Palabrita walking behind you** (like HeartGold/SoulSilver), talking about how it feels («Gotita está feliz
  bajo la lluvia»). Waits for better overworld art: the small sprites aren't good enough for it yet (the user).
- **A weekly event:** one town with something only one day a week (the day's name in Spanish is part of it): a
  contest with a prize, or a day when a rare Palabrita can be caught. Which town, which day and what it is: to decide.

## Order

1, 2, 3, 4. Part 1 needs no Spanish; part 2 is quick; part 3 is the biggest (the wild tables, the battle change, the
board's lines); part 4 grows town by town.

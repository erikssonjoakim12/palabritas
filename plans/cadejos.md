# Los Cadejos: two legendary dogs (later: regions 6–7)

The legend (Central America): at night a dog follows travellers. The white **Cadejo** protects them; the black one
leads them astray. Here they are two legendary Palabritas, **Cadenegro** (Siniestro) and **Cadeblanco** (Psíquico),
both at level 50. Decided with the user on 2026-10-31. **The first meeting (the fog) is built as a demo** (below);
the rest is not built yet.

Psíquico does nothing to Siniestro: the white dog can't fight the black one, only lead you away from it.

## The story (the user's)

**First meeting: the fog outside the gym 6 city.** The road there from Ruta 4 (behind the thin tree, ruta5 80,2) is
easy; the fog lies on a path out of the city. Fainting before you find the boy sends you to the city's Palacentro,
close by; **after you find him, you wake up in his clearing, healed, with him beside you** (the user).

1. A grandmother in the city asks you to find her grandson, lost in the fog, and describes him (easy to recognize
   from it; lost trainers who only partly fit make it a real reading task).
2. You walk into the fog. The black dog appears; you follow it **5–10 times** (it waits, trots ahead, vanishes,
   appears again further on) until you are completely lost, facing tough wild Palabritas and trainers on the way.
3. The black dog doesn't lead you all the way to the boy (that would be too kind): you walk blindly a bit.
4. You find him. Talk to him and he **follows you** (like Pikachu in Pokémon Yellow).
5. Wandering on, you notice the fog is a little lighter in one direction. Following it, you see the white dog: it's
   why the fog eased. It leads you out, and once you're safely on the other side you can pet it. The boy follows
   you back to his grandmother.

**The fog is a little trippy:** you see a small gray-lit circle with drifting clouds hiding the rest, and the paths
shuffle, a bit randomized, so you really get lost. After the white dog appears, the fog gets more and more
deterministic: the lighter-fog direction (your circle of sight grows the right way, shrinks the wrong way) leads out.
The black dog's way is **fixed** (the road); only straying from it is random (the user). From the first patch, back the
way you came leads out again; deeper in, there is no way back until you find the boy (the user). **No healing** in the fog:
the black dog takes you on a dangerous journey. Dark as dusk at any hour. Wild Palabritas around **level 30**.
Once the boy is home **the fog lifts** and the patches settle into the dog's road, the same every time.

### The demo (built 2026-10-31)

Open the game with `?demo=niebla` (on the phone: `https://erikssonjoakim12.github.io/palabritas/?demo=niebla`). It
starts at the edge of the fog with your name and look (read from your game, never written: `G.demo`), a team at
33–35, Pociones and Palabolas. Doña Rosa and her grandson Tomás; Excursionista Rodrigo and Espeleólogo Ismael (who
"almost" fits the description: orange, but a helmet) on the road; placeholder dogs. Code: `src/world/region6.ts`
(the fog walk and the story), `src/world/maps/region6.ts` (the patches), world.ts (fog drawing, `near` NPCs,
`setFollower`, `wakeUp`); test: `tests/fog.test.mjs`.

When it becomes the real region 6:
- The trail (`niebla_borde`) joins the gym 6 city, and `G.save.heal` is the city's Palacentro.
- The fog walk's state isn't saved: a game saved inside the fog should load at the trail (a migration or a check on
  load).
- Once lifted, the patches are separate little maps joined by the walk; the onward road past the last patch (toward
  gym 7) is still to draw.
- Real Palabritas of the region instead of the borrowed night ones; the dogs' art from the user.

You hear **only parts of the legend** here («Mi abuela decía que de noche no hay que seguir a un perro negro...»).
No battle: neither dog can be caught yet. The fog story doesn't have to match the gym's theme.

**Second meeting: around or after gym 7.** The dogs come back, someone tells you **the whole tale**, and from then on
Cadenegro roams the wild and can be caught. Cadeblanco comes after.

## Catching them

- **Cadenegro roams** like Gen 2's legendary beasts: it appears **only at night or in fog**. It moves to another
  route when you change maps, and START → MAPA shows its last spot as two red eyes. It flees after its first turn and
  keeps its HP between meetings (our battles have no status conditions). Sometimes it doesn't fight but looks at you:
  «¿Lo sigues?». Following it is risky (an ambush, a hard trainer). It defends by listening (you hear it in the
  fog but can't see it).
- **Cadeblanco** is a normal battle: once Cadenegro is caught, at night, where it first saved you. It first asks you a
  question about what happened to you, in the region's grammar («¿Tuviste miedo?»). It defends by speaking.

## The Palabritas

| | Type | Level | Theme (vocabulary) |
|---|---|---|---|
| Cadenegro | Siniestro | 50 | the night and fears |
| Cadeblanco | Psíquico | 50 | the road and travelling |

Each needs a theme file (157 lines) and a placeholder drawing until the user's art. They should look unlike the black
jaguar: red eyes, goat hooves and dragging chains (all from the legend).

## Also decided

- Gym 6 doesn't need a puzzle (unless something fun comes up).
- The user: **trainer and wild levels feel too high overall** (the gym leaders' levels are good). Check the curve on
  the battles page before building region 6.
- New Palabritas for the coming gyms: more Psíquico, Eléctrico and Dragón, once this region is settled.
- The Elite Four's Fantasma member had El Cadejo in its idea: it keeps La Mocuana instead.

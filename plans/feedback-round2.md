# Feedback round 2 (the user, 2026-10-28)

Built in parts, one session each, every part ending playable with its tests green. Map names are as shown in the
game (map ids in brackets: ids stay as they are, for saves). The user approved the whole plan, including the
rivers joined with rapids (part 3).

Parts 1 (trainers out of the trees, invisible seams, the crater's rockfall), 2 (the museum's pieces, five house
layouts) and 3 (the west side shorter) are built (2026-10-28). Part 3 as built: Villa Ocote 3 rows shorter; Ruta 5
36 rows instead of 70; the Guardabarranco forks north of Ruta 9, its west arm leaving through rapids (westward
currents) to become Ruta 5's river; Ruta 9 grew a riverside trail up to Ruta 5's side (the one-way step stays);
Ruta 6, Playa Carey and the turtle beach moved up 34 rows; Ruta 7 steps down diagonally from Carey to Chispa.

## Part 4 — Cut, and the trees that guide you

**Cut** opens after the 5th medal (Villa Jaguar's gym), like Surf: no move to teach; Palabritas that can really cut
do it. **Which ones (the user, 2026-10-29):** Hojadillo and Hojarasco; Cangrejito and Cangrejón; Hormiguita and
Hormigón; Perezosito; Espadón; the whole Brasita line (Brasita, Brasaurio, Volcasaurio); Liebrón.

**Engine (to build):** facing a thin tree ('/', art/tiles.ts) with the medal and a cutter in the party: «¿Quieres
cortar el arbolito con Hormigón?»; cut trees come back when you leave the map, like Gold/Silver. Part of the same work
as Surf's: walking off a map's edge where there's no connection should take you into the map that's there in the
world (the temple's path north crosses from Ruta 4 into the temple's map that way).

**The thin trees are placed (2026-10-29):** '/' tiles, thin and twiggy so they look cuttable (the user's idea). Facing
one: «Un arbolito delgado bloquea el camino. Parece que se puede cortar.»
1. **North of Ruta 4** (ruta5 80,2), above the road, seen on your first walk west from the cave: a trail behind it
   goes north to the map's edge, toward gym 6 (the new area isn't built).
2. **South of Ruta 4 to the temple** (ruta5 23,17, by the grass south of the road): a trail through the pines down to
   the temple's clearing, a way home after gym 5.
3. **Ruta 9 → the water** (ruta10 5,4): a nook off the riverside trail, land on both sides, the bank beyond. It keeps
   players on the lake route (Surf) to Villa Jaguar.

Still to do here: **the river from the Villa Ocote side:** no walking along it. Its banks become **mangroves** (a new
tile: tangled roots in the water), with a few swimmers (trainers) on the water.

**Knowing where to go next** (the user's worry), all of these together:
- The tree north of Ruta 4 is visible from the very first walk on Ruta 4. You remember it.
- The gym 5 leader says it outright when giving the medal: with Cut you can open the path north of Ruta 4.
- The path north of the temple leads straight there, so after gym 5 the natural way out ends at that tree.
- START → MAPA shows the world, which helps too. No marker for the next goal (the user: not needed).

## Part 5 — Selva del Jaguar as a dungeon

The Selva leaves the world map and becomes its own place, with an entrance and an exit, so it can be as big as it
needs, and its darker shade no longer shows from the river.

- **The gate (my choice):** an old stone gateway swallowed by a ceiba tree's roots: two carved pillars with a
  jaguar head over the doorway, vines hanging down, darkness inside. The same carved stone as the temple, so it
  foreshadows it. It stands at Villa Jaguar's west edge; walking into the dark doorway takes you in (like a cave
  mouth). The exit is a matching gateway onto the temple's clearing.
- **Inside:** a maze of paths one tile wide, tall grass everywhere, dense jungle walls, a few dead ends with items,
  and jungle trainers (an explorer, a biologist, a photographer...).
- Villa Jaguar and the temple's clearing keep their places in the world.

## Part 6 — Rainforest Palabritas

Planned in plans/palabritas.md with the user (who designs them), for the Selva and gym 5 (Planta/Veneno). A snake
fits well. Ideas from the rainforest (BIOMES.md §2), with Nicaraguan names where there's one:
- the **eyelash viper**, a small green-and-yellow snake with "eyelashes" (Planta/Veneno);
- the **mono congo** (howler monkey): Nicaragua's loud one, heard before it's seen;
- the **lapa roja** (scarlet macaw);
- the **red-eyed tree frog**, and the **poison dart frog** (Veneno);
- the **danto** (tapir), big and gentle;
- the **jaguar**: the temple's (still an open question in region5-jungle.md).
Each family brings a theme (one file in src/data/content/).

## Order

Parts 4–6 come with region 5: Surf
(plans/surf-fly.md), the Selva and the temple (region5-jungle.md), gym 5, then Cut.

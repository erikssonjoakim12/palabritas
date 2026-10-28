# Feedback round 2 (the user, 2026-10-28)

Built in parts, one session each, every part ending playable with its tests green. Map names are as shown in the
game (map ids in brackets: ids stay as they are, for saves). Parts 1–3 polish what exists; 4–6 prepare region 5.

## Part 1 — Small fixes

1. **Trainers out of the trees.** Three trainers in Ruta 4 (`ruta5`) stand where a tree would be: Lucía (34,10),
   Armando (70,2) and Elena (14,10). Move each onto the path, or into the grass across from it, keeping a line of
   sight you can't avoid (4 tiles at most). The same check flags Javi, Mateo, Tomás and Andrés in Ruta 2 and
   Esteban and Andrea in Ruta 5 (`ruta6`): look at them too. Then add the rule to the maps test (no trainer with 5
   or more trees around them), so it doesn't come back.
2. **Invisible borders.** Where the same rock or mountain runs across the seam between two maps, the rock's edge
   pieces are drawn at the seam, so you see the border (Ruta 3 and Ruta 4, and others). Fix it once in the engine:
   the auto-edges look across the seam into the neighboring map (the world layout knows it), so every border gets
   it. Check every seam on the art page's World view.
3. **The crater.** The left side becomes a dead end of fallen lava rock (boulders and rubble, looking natural), so
   you go around the right side. Move the left trainer 1 tile left and 4 down, so you meet them before you see the
   dead end.

## Part 2 — Interiors

1. **The museum** (Villa Ocote) looks like a museum: display cases with fossils (the giant armadillo's shell and
   skeleton, Caparazonte's ancestor), pre-Columbian clay pots, a petroglyph stone, and the Huellas de Acahualinca
   (footprints thousands of years old, a real Nicaraguan treasure). Each one says something when you look at it.
2. **Houses that differ.** Today every house shares one room (`HOUSE`): the table, TV, bookshelf and bed in the
   same spots. Make 4–5 layouts (a kitchen corner, a hammock, plants, a desk, two beds...) and give neighboring
   houses different ones. New objects get art in the house style.

## Part 3 — The west side, shorter

The biggest map job: the maps form loops, so shortening one moves others (the maps test checks they still close).

1. **Villa Ocote:** the top and bottom rows of houses a few tiles closer, keeping a big plaza in the middle. The
   night version (`ocote_noche`, for the party) changes with it.
2. **Ruta 5** (`ruta6`, 70 rows) about **half as long**: keep the dry desert (the user's favorite) and the river,
   drop most of the first forest and the plain walking. Its trainers and items move into what's left.
3. **Ruta 6, Playa Carey and the turtle beach move up** with it. **Ruta 7** (`ruta8`) takes up the difference: a
   diagonal from Playa Carey (top left) down to Ciudad Chispa (bottom right), with the same parts (the lagoon, the
   farm, the sugarcane fields) in a new shape. Outdoor holes let a map be diagonal.
4. **Ruta 9** (`ruta10`) and the forest north of the crater lose rows where the loop needs it: Ruta 9 meets Ruta 5's
   side, so it follows Ruta 5 up.
5. **The rivers joined.** Today Ruta 5's river starts at the map's edge (it has no source). The Río Guardabarranco
   starts at the waterfall in the Cañón, runs through Ruta 4's pool and down past the temple to Ruta 9. Proposal:
   it splits in Ruta 9's lowlands, one arm east into the Lago de las Islas (as now) and one west through Ruta 5 to
   the Pacific. Where the west arm leaves, **rapids** you can't swim against, so Surf from Ruta 5's bridge isn't a
   shortcut to Villa Jaguar.
6. Saves on changed maps move to a safe spot (`migrate()`), and the region tests follow the new positions.

## Part 4 — Cut, and the trees that guide you

**Cut** opens after the 5th medal (Villa Jaguar's gym), like Surf: no move to teach; Palabritas that can really cut
do it. Which ones: to decide together (ideas: the leafcutter ants Hormiguita and Hormigón, whose move is already
«Cortar Hoja»; Cangrejón's claws; Espadón's sword). Engine: a small cuttable tree (solid until cut; cut trees come
back when you leave the map, like Gold/Silver), and «¿Quieres cortar el árbol con Hormigón?».

The trees can go in now (they're just trees until Cut exists):
1. **Ruta 9 → the water:** a cuttable tree on the way down to the river, land on both sides, so later you can
   reach it from the water too. It keeps players on the lake route (Surf) to Villa Jaguar.
2. **The river from the Villa Ocote side:** no walking along it. Its banks become **mangroves** (a new tile:
   tangled roots in the water), with a few swimmers (trainers) on the water.
3. **North of the Templo del Jaguar:** a cut path that comes out on Ruta 4, a way home after gym 5.
4. **North of Ruta 4:** a cuttable tree leading to a new area, toward gym 6.

**Knowing where to go next** (the user's worry), all of these together:
- The tree north of Ruta 4 is visible from the very first walk on Ruta 4: «Un arbolito bloquea el camino. Parece
  que se puede cortar.» You remember it.
- The gym 5 leader says it outright when giving the medal: with Cut you can open the path north of Ruta 4.
- The path north of the temple leads straight there, so after gym 5 the natural way out ends at that tree.
- Optional: START → MAPA marks the next goal with a small blinking flag.

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

Parts 1 and 2 any time. Part 3 next (it changes many maps at once). Parts 4–6 come with region 5: Surf
(plans/surf-fly.md), the Selva and the temple (region5-jungle.md), gym 5, then Cut.

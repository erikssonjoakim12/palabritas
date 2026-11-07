# The Volcán Chocoyo, redesigned (the user, 2026-11-07)

Make the volcano look like a volcano: a cone that rises from a round base to the crater, with sloping rocky sides,
instead of rectangles of rock. And around it, less big blocks of mountain: woods, ash fields and stray lava rocks.
The shape is agreed: [tests/out/volcano-cone.png](../tests/out/volcano-cone.png) (not committed; redraw with the
scratch overview tool if lost). The crater's outer rocky edge is the top; two straight sides run down to a base about
60 tiles wide, whose front edge is just above Ciudad Chispa. On the right the base runs into the lake, short of the
round island.

## How it connects today

Ciudad Chispa → up the front of the Volcán Chocoyo (`laderas`) → the cave at its top → the Tubo de Lava (`tubo`) →
up into the crater (`crater`) → out of the crater's west gate onto Ruta 9 (`ruta10`), down the ash gully and the ridge
to a one-way step → the field → Ruta 5. Between Ruta 7 (`ruta8`) and the volcano there's a 4-tile strip that belongs
to no map. The lake (`lago`) touches the volcano's east side.

## The look

- **Slope tiles** (new): rocky ground that clearly runs downhill, not cliff. One for each side, so the cone reads
  from the shading: the left flank falls down-left, the right one down-right, the front straight down. Solid, never
  walkable. Basalt colors from the master palette. First step: 2–3 designs on a small patch for the user to choose.
- **The foot of the volcano:** along the base's front arc, ash and dark lava boulders (`E`) where the slope meets the
  ground, a few steam vents.
- **The crater's rim stays** (the outer rocky edge is the top of the cone); the bubbling lava lake stays.
- **Around it, less mountain:** the big rock blocks top-left of the volcano (Ruta 9's upper part) become woods (dry
  trees, `t`) with stray lava rocks and patches of ash. The same at the foot on both sides.
- **On the lake side:** the slope runs into the water; a few lava rocks stand in the shallows.

## The way down the west side: sandboarding (the user, 2026-11-07)

No tunnel: you **slide down the west flank on a board**, like the tourists on the Cerro Negro near León, the
Nicaraguan volcano famous for volcano boarding. Only down, never up: the way back to the crater is the front path from
Ciudad Chispa, as now.

- **At the crater's west rim**, where the gate is today, a board rental: a guide with boards leaning on the rock.
  «¿Quieres bajar en tabla? ¡Es como en el Cerro Negro!». The first time she explains (and asks one safety word:
  «el casco», the helmet, a real item so it counts); afterwards just «¿Otra vez?». Free.
- **The ride** (2–3 seconds, a short cutscene in the real map, not a fade): you on the board (a new look, like the
  swimming one: `playerBoard`), sliding fast down the slope tiles in a straight line to the foot, the camera
  following, a trail of ash puffs behind you, a whoosh. It crosses from the crater's map into Ruta 9's on the way
  (the slide moves through solid slope tiles, so it needs its own movement: like scriptedStep, faster, ignoring
  solidity, crossing map edges).
- **The landing** at the foot, in Ruta 9's woods: a little skid and a dust cloud, «¡Qué rápido!», the board goes back
  up with the guide's helper (no item to carry).
- **One-way:** the slope tiles are solid, so walking up is impossible; Ruta 9 keeps its one-way step below.
- Fits **deportes** (the sports theme) for her lines; Spanish in the region's level.

## Steps (one per session, each ending playable with tests green)

1. **Slope tiles:** designs on a patch → the user picks → added as tiles (recipe in CLAUDE.md "A tile").
2. **A full mock-up** of the new outline with the real tiles (crater, slopes, the strip, Ruta 7's edge, the lake's
   edge, Ruta 9's upper part): shown to the user before any map changes.
3. **Build the volcano:** the crater and the slopes in the new outline; the strip given to a map (widen one, keeping
   every connection lined up: `npm test -- maps`); the lake's edge; the foot.
4. **Sandboarding:** the board look, the slide movement and its ash trail, the rental guide and the ride across the
   two maps; a test (rent, slide, land at the foot, can't walk back up).
5. **Ruta 9's upper part:** woods, lava rocks, ash where the rock blocks were; trainers and items moved where needed.
6. **Saves:** anyone standing where a walkable tile became solid is moved (loadMap already moves you off walls; add
   a migration where a whole area changes). Wild tables and trainers stay; check sight lines.

## Open questions for the user

- The slope tiles' look (step 1).
- How much of Ruta 9's upper part to turn into woods (all of the rock blocks, or keep a ridge)?

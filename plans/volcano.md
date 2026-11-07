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

## The way down the west side

The crater's west gate would now open onto the slope. Instead, a **short tunnel** through the flank: from the crater's
west side down to the foot, coming out in Ruta 9's woods. Either a new small cave map or a second branch of the Tubo de
Lava (to decide). Ruta 9 below keeps its one-way step, so it still can't be climbed from Ruta 5.

## Steps (one per session, each ending playable with tests green)

1. **Slope tiles:** designs on a patch → the user picks → added as tiles (recipe in CLAUDE.md "A tile").
2. **A full mock-up** of the new outline with the real tiles (crater, slopes, the strip, Ruta 7's edge, the lake's
   edge, Ruta 9's upper part): shown to the user before any map changes.
3. **Build the volcano:** the crater and the slopes in the new outline; the strip given to a map (widen one, keeping
   every connection lined up: `npm test -- maps`); the lake's edge; the foot.
4. **The west tunnel and Ruta 9's upper part:** woods, lava rocks, ash; the tunnel; trainers and items moved where
   needed.
5. **Saves:** anyone standing where a walkable tile became solid is moved (loadMap already moves you off walls; add
   a migration where a whole area changes). Wild tables and trainers stay; check sight lines.

## Open questions for the user

- The slope tiles' look (step 1).
- The west tunnel: its own small cave, or a branch of the Tubo de Lava?
- How much of Ruta 9's upper part to turn into woods (all of the rock blocks, or keep a ridge)?

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
- **The front path zigzags** up the slope (the user, 2026-11-07): a 2-tile ash path in switchbacks, left, right, left,
  right, from Ciudad Chispa to the cave at the top, inside the front's medium grey band (the user): long runs near the
  base, shorter ones up to the cave (each run as wide as the band at its height, ±0.22 rad from the crater's center), with small patches of dry tall grass (z) at the bends for the
  wild Palabritas and a few steam vents beside it. Draft: [tests/out/volcano-zigzag.png](../tests/out/volcano-zigzag.png)
  (scratch tools laderas-zigzag + cone-mock). Its trainers, Elsa and Lucas go on the runs, where the path can't avoid
  their sight.
- **On the lake side:** the slope runs into the water; a few lava rocks stand in the shallows.

## The way down the west side: sandboarding (the user, 2026-11-07)

No tunnel: you **slide down the west flank on a board**, like the tourists on the Cerro Negro near León, the
Nicaraguan volcano famous for volcano boarding. Only down, never up: the way back to the crater is the front path from
Ciudad Chispa, as now.

- **At the crater's west rim**, where the gate is today, a board rental: a guide with boards leaning on the rock.
  «¿Quieres bajar en tabla? ¡Es como en el Cerro Negro!». The first time she explains (and asks one safety word:
  «el casco», the helmet, a real item so it counts); afterwards just «¿Otra vez?». Free.
- **The ride** (2–3 seconds). First try it **in the map**; if that doesn't look good, a **cutscene** instead (a side view of
  you boarding down the black slope, the dust flying). In the map: you on the board (a new look, like the
  swimming one: `playerBoard`), sliding fast down the slope tiles in a straight line to the foot, the camera
  following, a trail of ash puffs behind you, a whoosh. It crosses from the crater's map into Ruta 9's on the way
  (the slide moves through solid slope tiles, so it needs its own movement: like scriptedStep, faster, ignoring
  solidity, crossing map edges).
- **The landing** at the west foot, **in Ruta 7** (the user, 2026-11-07: it makes more sense than Ruta 9), at the top
  of the small landing path (see the crater below): a little skid and a dust cloud, «¡Qué rápido!», the board goes back
  up with the guide's helper (no item to carry).
- **One-way:** the slope tiles are solid, so walking up is impossible.
- **Ruta 9's future is open** (the user is deciding): maybe it goes, and a new city takes its place, top-left of the
  volcano. If so, its trainers (six, Lidia with rematches) and its way to Ruta 5 move or go; the crater's west gate
  becomes the board rental. Until decided, Ruta 9 stays as it is.
- Fits **deportes** (the sports theme) for her lines; Spanish in the region's level.

## The crater, reordered (the user, 2026-11-07)

So the slide comes only after Equipo Silencio:
- **The fallen rock moves to the bottom-left** of the crater's walkway (it blocks the west side from below; today it
  lies on the west walkway, rows 8–12): you go round the east walkway to the top, as now.
- **At the top, a grunt guards the rocket boxes** where Don Sigilo stood (16, 2).
- **Don Sigilo waits at the west rim, just before the slide** (the board rental's spot). When he loses he escapes **on a
  board, sliding down the slope first** (the user, 2026-11-07): your first look at the ride. Then the guide comes out
  of hiding and offers you a board.
- **The way to Ruta 9 (the crater's top-left exit) is blocked with rock.** Ruta 9's upper part is then out of reach
  (only the crater led there): its three trainers (Vulcanólogo Óscar, Excursionista Lidia with rematches, Guardaparque
  Iván) and two items move to **a small extra path in Ruta 7 where the slide lands** (the user): you can only get onto it
  from the volcano; it ends in a ledge down into the rest of Ruta 7, so from Ruta 7 it can't be reached before the
  volcano. Part of Ruta 7 is reshaped to make room.
- Built together with the sandboarding (step 4): before the slide exists, the west rim would lead nowhere.

## Steps (one per session, each ending playable with tests green)

1. ✓ **Slope tiles** (built 2026-11-07: tile '`', its shade and gullies from MapStyle.volcano, the crater's center in each
   map's tiles; a sample on the art page). A first look (2026-11-07, [tests/out/volcano-slopes.png](../tests/out/volcano-slopes.png), redrawn
   by the scratch cone-mock tool): chunky basalt gravel lit from the left (left flank light, right dark, front between),
   erosion gullies fanning out from the crater. The user approves or adjusts → added as tiles: a few shades × with or
   without a gully, chosen per tile by its angle from the crater (recipe in CLAUDE.md "A tile").
2. **A full mock-up** of the new outline with the real tiles (crater, slopes, the strip, Ruta 7's edge, the lake's
   edge, Ruta 9's upper part): shown to the user before any map changes.
3. **Build the volcano:** the crater and the slopes in the new outline; the strip given to a map (widen one, keeping
   every connection lined up: `npm test -- maps`); the lake's edge; the foot.
4. **Sandboarding:** the board look, the slide movement and its ash trail, the rental guide and the ride from the crater
   down to Ruta 7; a test (rent, slide, land in Ruta 7, can't walk back up).
5. **Top-left of the volcano:** Ruta 9 redesigned (woods, lava rocks, ash) or replaced by a new city: the user decides.
6. **Saves:** anyone standing where a walkable tile became solid is moved (loadMap already moves you off walls; add
   a migration where a whole area changes). Wild tables and trainers stay; check sight lines.

## Open questions for the user

- The slope tiles' look (step 1).
- Ruta 9: keep it (redesigned with woods) or replace it with a new city?

# Field moves: Surf, Cut, Fly

Like Gold/Silver's HMs, but nothing to teach: Palabritas that can really do it, once you have the medals.
Who can, and how many medals: `FIELD_MOVES` in src/data/species.ts (the user's lists).

## Built (2026-10-29)

- **Surf** (4 medals; Mordisquito, Mordiscón, Paslamona, Espadón). Facing water: «El agua está tranquila. ¿Quieres
  nadar con Mordiscón?» (no swimmer: the rod, if you have it). Water is the way, land ends it; rapids (currents)
  carry you and can't be swum against. Each water map has its own wild Palabritas (`surf`: river, lake, sea).
  Don Tizón says it when he gives the 4th medal. You swim with your head above water (`playerSurf`): a placeholder
  until there's art of you riding your Palabrita.
- **Crossing into the world:** walking or swimming off a map's edge where there's no connection, or into a hole,
  takes you into the map that has that tile in the world (world/layout.ts `mapAcross`). The river runs on that way
  (Ruta 4 → the river → Villa Jaguar → the lake; the west arm to Ruta 5), and so does the temple's trail to Ruta 4.
  Every such crossing today is one we want (checked 2026-10-29: the river, the pier, the nook behind Ruta 9's thin
  tree, a small bank below Villa Jaguar, the temple's trail).
- **Cut** (5 medals; Hojadillo, Hojarasco, Cangrejito, Cangrejón, Hormiguita, Hormigón, Perezosito, Espadón, the
  Brasita line, Liebrón). Facing a thin tree ('/'): «¿Quieres cortarlo con Hormigón?»; it grows back when you leave
  the map. Three thin trees are placed (feedback-round2.md part 4).
- Test: tests/hms.test.mjs.

## Next

1. **Fly** (5 medals; Zopilotón, Maletícano, Palomón, Guardabarranco, Chocoyote): START → MAPA, pick a town you've
   been to, land outside its Palacentro. The save needs a list of visited towns.
2. **Surf's music**, and the riding sprite (the user's art).
3. **The 5th medal:** gym 5 in Villa Jaguar; its leader names Cut and the thin tree north of Ruta 4.
4. Later, maybe: climbing the Cañón's waterfall ('!', «Tal vez algún día puedas subirla...»).

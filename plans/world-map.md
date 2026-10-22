# The world map: tighter, joined up, no empty middle ✓

**Built** (2026-10-22), parts 1–5. Two slits are left on purpose: 2 tiles between the lake and Ruta 1, and 4×8
below the lake's corner (closing them means shifting Ruta 1, which many tests and saves use). In the game, map
edges draw trees there, so nobody sees them.

The user's wishes (October 2026): shorter Rutas 3 and 8; the volcano foreshadowed on Ruta 3 and Ruta 6; the
crater in the world; a one-way shortcut from the volcano to Ruta 6; nothing blank in the middle; a simple town
map. New cities (a lake town, the rainforest) wait for an expanded map: the middle only gets scenery now.

## The world, after

```
              Cañón
Ocote ──── Ruta 5 ─────────────
Ruta 6   Monte    Ruta 3 (shorter) ── Brisa
  │      del Eco    ░ black rocks          │
  ├── Ruta 10 ──┐ volcano cone   Lago      Ruta 2
  │  (one-way)  Cráter         (scenery)    │
Ruta 7  Pie del Volcán (slopes, shorter)  Limón
  │                                       Ruta 1
Carey ── Ruta 8 ── Chispa ── Ruta 9 ── Amanecer
Tortugas
```

## The loop (why Ruta 3 and Ruta 8 change together)

The outdoor maps form one loop: Brisa → Ruta 3 → Ruta 5 → Ocote → Rutas 6-7 → Carey → Ruta 8 → Chispa →
Ruta 9 → Amanecer → Rutas 1-2 → Brisa. Taking rows out of Ruta 3 *above* the Brisa road moves the whole west
side (Ruta 5, Ocote, Rutas 6-7, Carey, Tortugas) down by as many rows. Ruta 8 takes that up: today its road
drops 6 rows between Carey (y -8) and Chispa (y -2). So **Ruta 3 loses 6 rows above its road, and Ruta 8's road
becomes straight.** The maps test now checks that the loop closes and that no maps overlap.

## Parts (one commit each, `npm test` green)

1. **Shorter Ruta 3 and Ruta 8.** Ruta 3: 44 → ~32 rows (6 above the Brisa road, the rest below it), the same 7
   trainers. Ruta 8: 32 → ~24 rows, a straight road, the same 10 trainers; the sugarcane field keeps its one
   guarded entrance. A save standing on either map moves to a safe spot (`migrate()`).
2. **The volcano.** Volcán Chocoyo (`laderas`) a few rows shorter, without the rangers' station (it came
   after only two trainers):
   - Elsa stands outside where the station was and still gives the parakeet-chick quest (no bed: you rest at
     Ciudad Chispa's Palacentro, at the foot of the trail).
   - Lucas #3 waits at the foot of the trail, so you meet him rested, as the user first wanted.
   - Saves inside the station move outside it, and a heal point there moves to Chispa's Palacentro.
   - The crater joins the world on top of the slopes (still reached through the lava tube), and a volcano
     cone (scenery) rises above it, below Ruta 3.
3. **Ruta 10 and the foreshadowing.** A new route from the crater's west rim down to Ruta 6's dry forest:
   ash, black rock and dry trees, 2–3 trainers (levels ~26–30), wild Palabritas, an item. A ledge makes it
   one-way: from Ruta 6 you see the trail and the smoking volcano, but can't climb it. A black volcanic
   boulder tile (it sits on grass) along Ruta 3's bottom and Ruta 6's right edge.
4. **Filling the middle** with scenery maps (nobody walks there yet): Monte del Eco (the mountain Ruta 4's
   cave goes through), the volcano's west foot above Ruta 8, and a lake east of the volcano with islands, seen
   from Ruta 3's bottom, Rutas 1-2, Villa Limón and Ruta 9. (Later, maybe: Surf and the lake's islands.)
5. **A simple town map** in the start menu: the outdoor world drawn small (land, water, mountains, paths), the
   towns as squares, where you are blinking, and the name of the place under the cursor.

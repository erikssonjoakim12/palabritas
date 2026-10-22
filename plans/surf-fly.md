# Surf, Fly and Villa Jaguar (gym 5): plan

Surf and Fly aren't built yet. Villa Jaguar, its jungle and temple ([region5-jungle.md](region5-jungle.md)) and the
lake's swimmers are placed, waiting for Surf. Planned with the user, 2026-10-22.

## Decisions (the user)

- **Surf** opens after the 4th medal (Medalla Chispa). There's no move to teach: Palabritas that really swim can
  carry you, and the game tells you so. Only the big swimmers: **Mordisquito, Mordiscón, Paslamona** (the grown sea
  turtle; not Paslamita, the hatchling) and **Espadón** (the swordfish).
- **Fly** opens after the 5th medal, with big birds only: **Zopilotón**, **Maletícano**, **Palomón**,
  **Guardabarranco** and **Chocoyote**.
- **Villa Jaguar**: the rainforest town (gym 5, Planta/Veneno), north of the Río Guardabarranco, below Ruta 3's
  plateau. No road leads there: you come by the river. A placeholder is in the world (world/maps/region4.ts).
- **The dungeon**: El Templo del Jaguar ([region5-jungle.md](region5-jungle.md)). The lake's volcano island is kept
  for a legendary Palabrita at level 50, after the 8th gym. Swimmers (trainers) are in the lake now.

## How Surf works

- Facing water, with the Medalla Chispa and a swimmer in the party: «¿Quieres nadar con Mordiscón?» / "Do you want
  to swim with Mordiscón?" Yes, and you ride it (a sprite of you on its back) until you step onto land.
- On water: wild Palabritas on every step (each water map has its own table), and the music changes.
- How you find out: when Don Tizón gives the 4th medal, «¡Con cuatro medallas, las Palabritas grandes del agua ya
  te pueden llevar!» / "With four medals, big water Palabritas can carry you now!". With a swimmer in the party, it
  says which one; without one, someone tells you where to find one (Mordisquito by fishing on Ruta 8 or the lake,
  Paslamita on the turtle beach).
- Spanish: movement verbs (nadar, cruzar, remar, llegar) and the water words; the prompt itself is a small lesson.

**Engine work:**
1. A `swims` / `flies` flag on species (species.ts), and a helper for "who in the party can carry you".
2. The player's state `surfing`: water passable, land ends it; a riding sprite.
3. **Crossing through holes.** Today you only walk off a map's edge into a connected map. The river winds through
   other maps' holes (Ruta 3, Ruta 10, Villa Jaguar), so stepping into a hole should move you into the map that
   owns that tile in the world (world/layout.ts knows). That also joins Villa Jaguar's harbour to the river.
4. The river and the lake become maps you can swim: water tables, the islands to land on.
5. A test: a swimmer and the medal lets you swim, no swimmer doesn't, land ends it, the river reaches Villa Jaguar.

## Fly

- After the 5th medal, with a big bird in the party: START → MAPA, pick a town you've been to, and you land outside
  its Palacentro. The town map is ready for it; the save needs a list of visited towns.

## Villa Jaguar's dungeon: ideas

Inca temples are from the Andes (Peru). For a Nicaragua-inspired country, Mesoamerican ruins fit better: a stepped
pyramid like the Maya's, or the petroglyphs and stone statues of the Nicarao and Chorotega peoples. (Zapatera, an
island in Lake Nicaragua, really is full of old stone statues; Ometepe, the volcano island, of petroglyphs.)

1. **El Templo del Jaguar**, in town: a stepped pyramid, floor by floor. Carvings on the walls tell a legend, and
   each door opens when you tell what happened next: gym 5's Spanish is the past tense («¿Qué pasó?»), so the
   dungeon practices it. At the top, something rare (a jaguar Palabrita?).
2. **La Isla de las Estatuas**, one of the islets: stone statues that speak when you answer them; a side quest to
   collect their sayings.
3. **The volcano island's petroglyph cave**: Petroglifón's home (Roca/Psíquico), with carvings to read.

**Chosen (the user):** 1, the temple. The volcano island waits for the legendary (after gym 8).

## Order

1. Surf: the engine work above; the river and the lake swimmable; Villa Jaguar reachable.
2. Region 5's plan (Villa Jaguar, gym 5, the dungeon), in detail like plans/phase4-region4.md.
3. Fly, after gym 5.

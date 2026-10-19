# Palabritas — plan: gyms 2 to 4 ("part two")

Everything between the Breeze Medal and the fourth medal: places, story, side quests, Palabritas,
evolutions, Spanish, new systems and the order to build it in. Built phase by phase from the detailed specs in
[plans/](plans/README.md), with a playable game after every phase. **Status:** regions 2 and 3 are built (§2, §3);
region 4 is next ([plans/phase4-region4.md](plans/phase4-region4.md)).
Big picture: [ROADMAP.md](ROADMAP.md) · learning rules: [LEARNING_PLAN.md](LEARNING_PLAN.md) · animals: [BIOMES.md](BIOMES.md).

**At a glance**

| | |
|---|---|
| Regions | 3 (pine highlands · Pacific coast · volcanoes), each ending in a gym |
| New outdoor maps and dungeons | ~15 (6 routes, 3 towns, a mine, a turtle beach, a volcano in 3 parts) |
| New interiors | ~25 |
| New Palabritas | 46 (44 with placeholder art; Brasita and Mordisquito already have your art) |
| New themes | 21 (7 → 28): every new family has its own |
| Trainers | ~58, including a rival and a villain team |
| Side quests | 12, plus 3 story chapters |
| New systems | 13 (storage box, fishing, bus, rematches, lessons, gym puzzles, night scenes...) |
| New Spanish | ~3,700 lines (A2 core, 21 themes, 7 lesson topics, dialogue) |
| Play time, gym 1 → 4 | ~8–12 hours (3–5 weeks at 20–30 min a day; see §7) |

---

## 1. The adventure in one page

**The villains: Equipo Silencio.** A gang who think words only cause trouble. They catch Palabritas to lock
their words away, so people forget how to talk. ¡Shhh! Everywhere they strike, Spanish disappears, and you
win it back. Grunts are *Silenciosos/Silenciosas*; the admin is **Callada**; the boss is **Don Sigilo**.

**The rival: Lucas** (your neighbor in Pueblo Amanecer). After you left, Profesora Ceiba gave him the starter
that's strong against yours. Friendly, a bit of a show-off. He battles you three times.

**The route forms a loop.** From Ciudad Brisa you go west up into the pine highlands, south to the sea, and east
past the volcano, until you jump down the ledge into Pueblo Amanecer. That's the ledge you saw at the start
of the game.

```
                 (Cañón)                          Cueva
   [Villa Ocote]──────Ruta 5────────────────(del Eco)────Ruta 3────[Ciudad Brisa]
     │   (Mina de Barro, north)                                         │
   Ruta 6  (pine slopes → dry forest, river)                          Ruta 2
     │                                                                  │
   Ruta 7  (the coast)                                            [Villa Limón]
     │                                                                  │
   [Playa Carey]──(Playa de las Tortugas, south)                      Ruta 1
     │                                                                  │
   Ruta 8  (lagoon, sugarcane)──(Volcán Chocoyo)──[Ciudad Chispa]──Ruta 9──ledge──[Pueblo Amanecer]
```

| Region | Gym | Story chapter | Side quests | New themes (one per new family) |
|---|---|---|---|---|
| 2 · Pine highlands | **Villa Ocote**: Petra, Roca/Tierra, Medalla Barro | The muted town and the clay mine | Beto's hat · the echo room and a fossil · the lost oxen · the national bird | El cuerpo, La cocina, Los deportes, La música, La salud, La historia, Latinoamérica |
| 3 · Pacific coast | **Playa Carey**: Marina, Agua, Medalla Ola | The night of the turtles (*la arribada*) | The seafood restaurant · the fishing rod · the message in a bottle | La playa, Las frutas, El mar, La pesca, El viaje, La familia |
| 4 · Volcanoes | **Ciudad Chispa**: Don Tizón, Fuego, Medalla Chispa | The stolen fireworks and the volcano | A hammock for Mom · the lost parakeet chick · the haunted house · the Torovenado costumes · the legend of the Carreta Nagua | La fiesta, La conversación, La ciudad, La ropa, La rutina, Las emociones, Los animales, El trabajo |

---

## 2. Region 2 — the pine highlands ✓ built

Ciudad Brisa → Ruta 3 → Cueva del Eco → Ruta 5 → **Villa Ocote**, inspired by Nicaragua's north (pines, canyons,
pottery, Ice Age fossils). The code is the truth (src/world/maps/region1.ts and region2.ts, src/world/region2.ts); in short:
- **Story, the muted town:** nobody in Villa Ocote can speak. A message in the dirt sends you to the Mina de
  Barro, where you beat the Capataz Silencioso and break the Silenciador; the town talks again. Then the lost
  words (8 of them to give back) and the party at night.
- **Side quests:** Beto's hat, the echo room and its fossil (Caparazonte, revived the next day), Don Chepe's
  oxen, Gaby's bird (the guardabarranco in the Cañón del Guardabarranco). Lucas's first battle is on Ruta 5.
- **Gym 2, Petra (Roca/Tierra):** three riddle doors; Piedrita 17, Ollita 19, Petroglifón 21; Medalla Barro.
- **Changed from the plan:** the bus is paused (no big roads yet); the Cerro del Eco was left out; levels were
  raised (the user plays a lot before each gym) and are being play-tested.

## 3. Region 3 — the Pacific coast ✓ built

Villa Ocote → Ruta 6 → Ruta 7 → **Playa Carey** and the Playa de las Tortugas (src/world/region3.ts):
- **Ruta 6** winds down about twice Ruta 3's walking length: pine switchbacks, a fenced meadow, the river and
  bridge, dry forest. **Ruta 7** is the coast: sand, palms, tide pools, the bottle.
- **Story, la noche de la arribada:** the gym is closed; Tania the volunteer counts eggs with you (numbers to
  100), you beat 3 grunts and Callada, guide the hatchlings to the sea, and get **Paslamita**.
- **Lucas's second battle** is at the top of the turtle beach, after the town and its Palacentro (the user
  didn't want it right after Ruta 6's battles).
- **Side quests:** waiting tables at El Pelícano Feliz (daily), Don Lalo's fishing rod, the message in a bottle.
- **Gym 3, Marina (Agua):** ride the currents to her; Cangrejón 22, Maletícano 23, Mordiscón 25; Medalla Ola.

---

## 4. Region 4 — the volcanoes: Playa Carey → Ciudad Chispa (gym 4)

### Places
- **Ruta 8** (~120 steps). Inland through hot dry forest (dry trees, cacti), past a lagoon (water you'll SURF
  later) and huge **sugarcane fields**, a new kind of tall grass and the best place to train. A farm with cows.
  About 9 trainers.
- **Volcán Chocoyo** (dungeon in 3 parts), inspired by Masaya, where parakeets really nest inside the active
  crater:
  - Ash slopes with steam vents.
  - A lava tube (a cave).
  - The crater rim with the parakeet colony.
  - About 6 trainers (park rangers, volcanologists), Lucas near the top (rival battle #3) and Equipo Silencio
    at the crater.
- **Ciudad Chispa** (town, ~36×28, the biggest so far). A colonial church and plaza, an artisan market
  (hammocks, masks, pottery), the fireworks workshop (the gym), a haunted colonial house, Palacentro, shop
  (Revivir, Repelente), school and bus stop.
- **Ruta 9** (~60 steps). East to the plateau above Pueblo Amanecer. **Jump down the ledge home.** A hidden
  item waits on the plateau.

### Story: the stolen fireworks
1. Tonight is the big festival (fireworks and the Torovenado parade), but Equipo Silencio stole every firework.
   *«¡Qué ruido tan horrible! Esta noche, nadie va a hacer ruido.»* They're going to throw them into the
   crater.
2. The gym is closed: Don Tizón, the fireworks master, is desperate.
3. Climb the volcano. Beat Lucas, then the grunts, then **Don Sigilo** at the crater rim.
4. **Festival night** in Ciudad Chispa: fireworks over the plaza and the Torovenado parade. The gym opens.
   Don Sigilo escapes (*«¡Esto no se acaba aquí! ¡Shhh!»*), to come back in later regions.

### Side quests
| Quest | What you do | Spanish practiced | Reward |
|---|---|---|---|
| **Una hamaca para mamá** | Buy a hammock at the market by bargaining: *«¿Cuánto cuesta?», «Es muy caro», «¿Me lo deja en quinientos?»*. The final price depends on what you say. Take it home to Mom (via Ruta 9). She hangs it in your room, and a wild **Perezosito** (a sloth) is asleep in it. | prices, numbers, polite requests | Perezosito, a package from Mom |
| **El chocoyito perdido** | A ranger's parakeet chick fell into the lava tube. Find it and bring it back up, following her instructions (*arriba, abajo, dentro, fuera*). | directions, prepositions | Repelentes, Chocoyitos to catch on the crater rim |
| **La casa embrujada** | A colonial house where the lights flicker. A ghostly lamp whispers sentences, and you calm it by repeating what it said. Three rooms. Cojincitos and a rare Sillón live there. | listening (whole sentences) | **Lamparita**, money |
| **Los trajes del Torovenado** | The parade lost its costume: *la máscara, el sombrero, la capa, las botas, la falda*. People describe who has each piece (*«La señora del vestido azul tiene el sombrero»*). | clothes, describing people | you dance in the parade; **Venadito** (level 20) |
| **La leyenda de la Carreta Nagua** (small) | An old man on Ruta 9 tells the legend. Answer 3 questions about it. | listening to a story, the past tense | a key item; teases the Ghost-type Elite Four member |

### Gym 4: Taller de Pólvora — Don Tizón (Fuego)
- **Puzzle: light the torches in the right order.** The poem on the wall says: *«Primero, el fuego rojo.
  Después, el azul. Luego, el verde. Al final, el amarillo.»* Get the order wrong and it fizzles out, so you
  start again.
- **Gym trainers:** a fireworks maker, a fire juggler, a street-food cook.
- **Don Tizón's team:** Chocoyote 28, Cohetón 29, Brasaurio 32 (Brasita's second stage).
- **His Spanish:** the past tense (*«¡Ayer hice mil cohetes!»*).
- **Reward:** Medalla Chispa.

---

## 5. Palabritas

Each comes with types, a language theme (tied to that family, not its type: every new family gets its own), stats, 4 moves (one per challenge mode) and a dex entry.
The **Look** column is the one-line art brief to paste into your ChatGPT art prompt; placeholder drawings
are used until your art arrives.

### Changes to existing families
| Palabrita | Types | Theme | Evolution | Where | Look |
|---|---|---|---|---|---|
| **Gusanito** (new) | Bicho | colores | → Capullito at 7 | Rutas 1–2 (replaces wild Mariposita there) | a chubby caterpillar with rainbow stripes and tiny pink feet |
| **Capullito** (new) | Bicho | colores | → Mariposita at 10 | Ruta 2 | a sleepy cocoon wrapped in leaves, colorful wing tips peeking out |
| Pajarito → **Palomón** | | | Pajarito now evolves at **14** | | (both already exist) |
| **Liebrón** (new) | Normal | números | from Conejito at 18 | Ruta 6 | a lean, fast hare with big feet and a number pattern on its fur |
| **Cojincito** (new) | Normal/Fantasma | casa | → Sillón at 18 | the haunted house | a floating cushion with a tassel and sleepy eyes |
| **Hojarasco** (new) | Planta/Tierra | naturaleza | from Hojadillo at 24 | Ruta 8 | a big armadillo whose shell is a pile of dry leaves, with a flowering bush on its back |
| **Murcielón** (new) | Volador/Siniestro | tiempo | from Ecolín at 22 | the volcano's lava tube | a big bat with ears like satellite dishes and a wide mouth |
| **Tarantón** (new) | Bicho/Veneno | números | from Ochopatas at 24 | the lava tube | a huge hairy tarantula with striped legs and eight eyes in a row |
| **Hercúleo** (new) | Bicho/Lucha | colores | from Cuernito at 26 | sugarcane fields (rare) | a Hercules beetle with a long double horn and a rainbow-shiny shell |

### Region 2 — pine highlands
| Palabrita | Types | Theme | Evolution | Where | Look |
|---|---|---|---|---|---|
| **Piedrita** | Roca | el cuerpo | → Petroglifón at 18 | the mine | a round gray pebble with a petroglyph face and stick-figure arms carved on it |
| **Petroglifón** | Roca/Tierra | el cuerpo | | Petra; evolve it | a tall standing stone covered in glowing carved spirals and stick figures, with stone arms |
| **Ollita** | Tierra | la cocina | → Tinajón at 21 | the mine, around town | a small clay cooking pot with painted patterns, steam puffing from its lid |
| **Tinajón** | Tierra/Agua | la cocina | | Ruta 8 (rare) | a big round clay water jar (*tinaja*), water sloshing inside, a cork for a hat |
| **Ardillita** | Normal | los deportes | → Ardillón at 20 | Ruta 5, the pine woods | a squirrel with a huge two-tone bushy tail, doing a cartwheel |
| **Ardillón** | Normal/Lucha | los deportes | | evolve it | a big acrobatic squirrel with a sweatband and a tail like a cheerleader's pom-pom |
| **Colibrí** | Volador | la música | → Zumbador at 22 | Ruta 5, flowers in the canyon | a tiny hummingbird with a shiny green throat, wings a blur, humming music notes |
| **Zumbador** | Volador/Eléctrico | la música | | evolve it | a bigger hummingbird with a needle beak and a glowing throat, leaving a trail of music notes |
| **Espinita** | Normal | la salud | → Puercoespín at 22 | Ruta 5, the canyon | a baby porcupine with soft spines and a curly gripping tail |
| **Puercoespín** | Normal/Acero | la salud | | evolve it | a round porcupine with a doctor's head mirror, its spines like syringes |
| **Caparazonte** | Roca/Tierra | la historia | → Gliptodón at 30 | fossil (echo room, then the museum) | a small ancient armadillo with a domed bony shell, cracked like old stone |
| **Gliptodón** | Roca/Tierra | la historia | | | a giant prehistoric armadillo with a huge dome shell and a spiked tail club |
| **Guardabarranco** | Normal/Volador | Latinoamérica | | the canyon (rare) | Nicaragua's national bird: turquoise brows, green body, rust belly, a long tail with two racket tips |

### Region 3 — the coast
| Palabrita | Types | Theme | Evolution | Where | Look |
|---|---|---|---|---|---|
| **Cangrejito** | Agua | la playa | → Cangrejón at 22 | Ruta 7, the turtle beach, fishing | a small red crab with one big claw and eyes on stalks |
| **Cangrejón** | Agua/Lucha | la playa | | Marina | a huge crab with boxing-glove claws |
| **Coquito** | Planta | las frutas | → Cocotero at 26 | Ruta 7, the turtle beach | a green coconut with a cute face and a little palm-leaf tuft on top |
| **Cocotero** | Planta/Agua | las frutas | | Ruta 8 (rare) | a coconut-palm creature: a coconut head on a curved trunk, swaying frond arms |
| **Mordisquito** (your art) | Agua | el mar | → Mordiscón at 25 | fishing in the sea | (art exists) |
| **Mordiscón** | Agua/Siniestro | el mar | | Marina | a big bull shark with a wide grin full of teeth and a scar |
| **Mojarrita** | Agua | la pesca | | fishing everywhere | a small round striped fish (*mojarra*) with big surprised eyes |
| **Pelicanito** | Agua/Volador | el viaje | → Maletícano at 22 | Ruta 7, the pier | a brown pelican chick whose pouch looks like a little backpack |
| **Maletícano** | Agua/Volador | el viaje | | Marina | a big pelican whose beak pouch is a travel suitcase covered in stickers |
| **Paslamita** | Agua | la familia | → Paslamona at 28 | gift (*arribada*) | an olive ridley turtle hatchling with big eyes and a heart-shaped shell |
| **Paslamona** | Agua/Tierra | la familia | | | a big mother sea turtle with a wide olive shell and strong flippers |

### Region 4 — volcanoes
| Palabrita | Types | Theme | Evolution | Where | Look |
|---|---|---|---|---|---|
| **Hormiguita** | Bicho/Planta | el trabajo | → Hormigón at 22 | Ruta 8, the sugarcane fields | a red leafcutter ant carrying a leaf bigger than itself, wearing a tiny hard hat |
| **Hormigón** | Bicho/Roca | el trabajo | | Ruta 8 (rare) | a big ant built from gray concrete blocks (*hormigón* = concrete!), carrying a stone slab |
| **Brasita** (your art) | Fuego | los animales | → **Brasaurio** at 32 → **Volcasaurio** (Fuego/Dragón) at 50: late and very powerful | Ruta 8, the volcano, Ruta 9 (lower levels, rare); Brasaurio is Don Tizón's ace | (art exists) |
| **Chispita** | Fuego | la fiesta | → Cohetón at 26 | the volcano, Ciudad Chispa | a little firework spark: a star-shaped body with a fuse tail |
| **Cohetón** | Fuego/Eléctrico | la fiesta | | Don Tizón | a firework rocket with a grinning face, colorful stripes and a sparkling tail |
| **Chocoyito** | Normal/Volador | la conversación | → Chocoyote at 25 | the crater rim | a green parakeet (*chocoyo*) with an orange forehead and a chatty open beak |
| **Chocoyote** | Fuego/Volador | la conversación | | Don Tizón | a big parakeet with flame-colored wing tips, living in a volcano crater |
| **Zopilotito** | Volador/Siniestro | la ciudad | → Zopilotón at 28 | Ruta 8, the volcano slopes | a scruffy black vulture chick with a bald gray head, holding a tiny broom |
| **Zopilotón** | Volador/Siniestro | la ciudad | | evolve it (wild in later regions) | a big black vulture with broad wings and a street-sweeper's cap |
| **Venadito** | Normal | la ropa | → Torovenado (Normal/Lucha) at 30 | gift (costume quest) | a fawn wearing a colorful festival mask with ribbons |
| **Torovenado** | Fantasma/Lucha | la ropa | | | a dancing festival costume: bull horns, deer antlers, a mask and ribbons |
| **Perezosito** | Normal/Psíquico | la rutina | | gift (hammock quest) | a baby sloth asleep in a striped Nicaraguan hammock |
| **Lamparita** | Fantasma/Fuego | las emociones | | the haunted house | an old oil lamp with a ghostly flame face |

**Art priority** (if you want to make real art in order): gym leaders' aces and gifts first (Petroglifón,
Mordiscón, Cohetón, Paslamita, Caparazonte, Venadito, Brasaurio), then the commons you'll see most (Ardillita,
Colibrí, Cangrejito, Coquito, Chispita, Chocoyito, Gusanito, Hormiguita), then the rest.

**Words stay with the family.** Evolutions keep their words. When a new first stage goes in front of an
existing Palabrita (Gusanito before Mariposita, Cojincito before Sillón), the family
keeps the old word sample, so Mariposita and Sillón that players already have don't get new words.

---

## 6. What you learn

| Region | Levels | CEFR | Grammar | Topics (new themes) | Where it shows up |
|---|---|---|---|---|---|
| 2 · Pine highlands | 12–19 | A1 → A1+ | questions (*qué, dónde, cuánto...*), *gustar/encantar*, *hay*, first *ser/estar* | **El cuerpo**, **La cocina**, **Los deportes**, **La música**, **La salud**, **La historia**, **Latinoamérica** | Petra's riddles and speech; describing the hat; first directions; listening and speaking in the echo room; reading the child's message |
| 3 · Coast | 19–25 | A2 | the present tense in full (*tener, ir, hacer, querer, poder*), ***ir a* + verb**, ordering food, numbers to 100, directions | **La playa**, **Las frutas**, **El mar**, **La pesca**, **El viaje**, **La familia** | Marina's speech; the restaurant; the bottle map; counting turtle eggs; lessons |
| 4 · Volcanoes | 25–31 | A2 | daily routines and time (*me levanto, ¿a qué hora?*), shopping and prices, **first past tense** (*fui, hice, vi, comí, compré*), sequencing (*primero, luego, después, al final*), clothes | **La fiesta**, **La conversación**, **La ciudad**, **La ropa**, **La rutina**, **Las emociones**, **Los animales**, **El trabajo** | Don Tizón's speech; the torch poem; bargaining at the market; the Torovenado; the legend |

**Content to write** (Latin American Spanish, with a little Nicaraguan flavor in names and places):

| What | Size | Why |
|---|---|---|
| **A2 core, levels 21–35** | ~200 words + ~100 sentences, in the grammar order above | today the core stops at level 20 |
| **21 new themes**, one per new family | 117 lines each (27 words, 40 phrases, 50 sentences, so they reach level ~37) ≈ 2,450 lines | see §5; existing families keep their themes so saves don't change. **Latinoamérica** (the Guardabarranco) covers every Spanish-speaking country in Central and South America: countries, capitals, nationalities (*colombiano/colombiana*), *«¿De dónde eres?» «Soy de Perú»*, and one or two typical foods and words from each |
| **7 lesson topics** (grammar, like Rita's present tense) | ~25 each ≈ 175 lines | Preguntas, Gustar, Direcciones, Ir a, En el restaurante, De compras, El pasado |
| **Dialogue** | ~800 lines | NPCs, ~58 trainers, quests, story |

Quests use real items from the core and themes wherever possible, so every quest answer also counts toward
mastering words, and that's experience for your Palabritas.

---

## 7. The experience budget (why regions need more than long routes)

From level 21, every new item needs **2 good answers**, so levels get slower:

- One Palabrita from level 12 to 31: 7 levels × ~20 answers, then 12 levels × ~24, so **~430 answers**.
- A team of 4 (the other three a few levels behind): **~1,400 answers**. A wild battle gives 4–5 answers, and
  a trainer's Palabrita 3–4.

Where those answers come from, gyms 2–4:

| Source | Answers | Share |
|---|---|---|
| Route, dungeon, rival and villain trainers (~175 Palabritas) | ~600 | ~43% |
| Side quests and story (~15 × ~10 challenges) | ~150 | ~11% |
| Wild battles while walking through once | ~300 | ~21% |
| **The rest, by choice:** optional training spots, daily rematches, lessons, the restaurant | ~350 | ~25% |

**Rules for building regions:**
- One normal walk through a region (trainers, quests, the wild battles you run into) gives about 75% of what
  you need.
- The rest comes from varied, optional things, never from forced grinding:
  - a training spot per region (the canyon, the *zacatal* meadow, the sugarcane fields);
  - **daily rematches**;
  - **lessons** at the school;
  - the restaurant.
- Daily rematches and lessons also fit spaced repetition: a little every day beats cramming.
- At the end of each phase, measure with the simulation tool and tune the levels (like the -15% we just did).

---

## 8. New systems

| System | What it does | Notes |
|---|---|---|
| **Caja de Palabritas** (storage box) ✓ | Use the computer in any Palacentro to deposit and withdraw. Catches go to the box when your team is full. | |
| **New items** ✓ | Superpoción ($250, heals 50), Superbola ($200, easier catch), Revivir ($600), Repelente ($200, no wild battles for 100 steps; great in caves), and a key-items pocket (fishing rod, fossil, Beto's hat) | the bag and shop already exist |
| **Gifts and fossils** ✓ | One helper gives you a Palabrita (to the box if your team is full). The fossil revives "tomorrow" by the real date. | |
| **Fishing** ✓ | Face water and press A, with each map having its own fishing table | unlocked by the rod (region 3) |
| **El bus** (fast travel) | Colorful "chicken buses" stop in Amanecer, Limón, Brisa, Ocote, Carey and Chispa. Pay $40 and say where you're going: *«Quiero ir a Playa Carey.»* Only towns you've visited. | ⏸ paused (no big roads yet); practices *ir a* |
| **Rematches** ✓ | Trainers you've beaten can battle again the next day, their teams keeping pace with yours. Half the money. | 1–2 trainers per route, marked with a small «!» when ready |
| **Lessons** ✓ | The teacher at each school: a private class for one of your Palabritas (its current words and review) for money, or the town's grammar topic | like Profesora Ceiba's training, which you liked |
| **Riddle doors** (gym 2) ✓ | A door that opens after a correct answer | a kind of gate |
| **Currents** (gym 3) ✓ | Tiles that slide you until you stop | |
| **Torches** (gym 4) | Light them in order; a wrong order resets them | |
| **Tree style per map** ✓ | Pines in the highlands; the green/dry mix in the lowlands, mostly dry around the volcano | a map setting |
| **Night scenes** ✓ | A dark tint with a glow around you, for the *arribada*, the festival night and the haunted house | night maps are their own scenes. Separately, the phone's clock darkens every outdoor map from 19 to 6 (`DAY_CYCLE`), with lit windows |
| **The muted town** ✓ | While the flag is on, everyone on that map just says "…" | |
| **Cutscene walking** ✓ | NPCs walk set paths (the rival arriving, the parade) | reuses the trainer walk |

Nice to have, if there's time: animated water and lava (two frames, like Gold/Silver).

---

## 9. New tiles and people

Each tileset reuses the current art system (16×16 rows and palettes, with edges that join up by themselves).
Some are palette variants: the mine uses the cave tiles in clay red, and the volcano uses the mountain tiles
in black basalt.

| Region | Tiles |
|---|---|
| 2 | pines (the kept pine tile, plus a cooler grass color), clay-tile roofs, adobe and pine-wood walls, ox-cart, plaza fountain, pottery stalls, canyon walls with a river, rope bridge, clay mine (rails, supports, the Silenciador), petroglyph stone doors, morning mist (optional) |
| 3 | cacti and yellow dry grass (*zacate*) on Ruta 6, sand, shoreline (foam edges), open sea, pier planks, wooden bridge, boats, lighthouse, stilt houses, tide pools, current tiles, pool |
| 4 | basalt rock, ash ground, lava, steam vents, crater rim, sugarcane tall grass, cobblestone plaza, colonial church, market stalls with hammocks and masks, haunted house, torches, festival lights, bus stop |

**New trainer looks** (battle portraits come for free): cowboy (*sabanero*), surfer, lifeguard, swimmer,
fireworks maker, park ranger, birdwatcher, vendor, potter, and Equipo Silencio's hooded grunts, Callada and
Don Sigilo. New heads: cowboy hat, bandana and hood. The rest reuse existing heads in new colors.

### Levels (tune after you play; trainers.ts has the real numbers)
| Region | Wild | Route trainers | Rival | Villains | Gym trainers | Leader |
|---|---|---|---|---|---|---|
| 2 | 10–15 | 12–14 | 15 + 12 | grunts 13–15, Capataz 16 | 15–16 | 17 · 19 · **21** (raised) |
| 3 | 14–19 (fishing 10–22) | 15–20 | 22 + 19–20 | grunts 18–20, Callada 21–22 | 20–22 | 22 · 23 · **25** |
| 4 | 15–25 (user) | 18–26 (user) | 28 + 25–26 | grunts 23–25, Don Sigilo 27–29 | 25–26 | 28 · 29 · **32** |

---

## 10. Build order (one phase per session)

**The detailed specs for each phase are in [plans/](plans/README.md)**, with every map drawn and checked, every
trainer, quest step and line of dialogue, and the Spanish content. Build from those; this section is the summary.

Every phase ends with a playable game, all tests green, the art page checked, the pace measured, and a commit
and push.

1. ✓ **Groundwork.** The systems from §8 that everything else needs:
   - storage box, items, gifts, rematches, lessons, night scenes, the muted town, cutscene walking;
   - the changes to existing families (§5) with placeholder art;
   - the A2 core for levels 21–35.
2. ✓ **Region 2.**
   - Tiles, then Ruta 5's extension and bridge, the canyon, Villa Ocote and its interiors, the mine.
   - Lucas #1 and Equipo Silencio's first chapter.
   - Gym 2 and its 4 side quests.
   - The region's Palabritas and their 7 themes, and lesson topics (the bus is paused).
   - **Playable to the Medalla Barro.**
3. ✓ **Region 3.**
   - Tiles, fishing, Rutas 6–7, Playa Carey, the turtle beach (day and night).
   - Lucas #2, the *arribada*, gym 3 and its quests.
   - The region's Palabritas and their 6 themes.
   - **Playable to the Medalla Ola.**
4. **Region 4.**
   - Tiles, Ruta 8, the volcano, Ciudad Chispa (plus festival night), Ruta 9 and the jump home.
   - Lucas #3, Don Sigilo, gym 4 and its quests.
   - The region's Palabritas and their 8 themes.
   - **Playable to the Medalla Chispa.**
5. **Polish.** Update ROADMAP and LEARNING_PLAN, sort the Palabrita list by family, and make an art-brief file
   for the placeholders. A full test pass.

**Tests** (silent, as always): a walk-through per region (gates, doors, the story order), a trainer and route
check for every map, every quest played through once, catching and evolving, regression tests, and art page
screenshots.

---

## 11. Decisions (all made on 2026-10-17)

All eight are decided: two by you (✓) and the rest with my defaults (**Yes**). Any of them may change later,
so the build keeps them easy to change (see the rule below).

1. ✓ **Story:** Equipo Silencio plus rival Lucas? **Yes.**
2. ✓ **Themes — decided:** as many as learning Spanish needs. Themes belong to a family, not a type, so every new
   family gets its own: 21 new themes (7 → 28).
3. ✓ **Family changes:**
   - Gusanito → Capullito → Mariposita (Rutas 1–2 get Gusanito);
   - Pajarito → Palomón at 14;
   - Cojincito before Sillón;
   - ~~Garrobito before Brasita~~: changed on 2026-10-19, Brasita is the first stage (→ 32 → 50).

   **Yes.**
4. ✓ **Pace — decided:** as much play as the level curve needs. It should take time, but never get boring:
   variety (quests, training spots, rematches, lessons) instead of grinding.
5. ✓ **Art:** placeholders first; you make real art at your own pace from the Look column. **Yes.**
6. ✓ **Names:** towns, leaders, villains and Palabritas above. **Keep them; veto any you dislike.**
7. ✓ **Real dates:** the fossil revives tomorrow; rematches, lessons and the restaurant reset daily. **Yes.**
8. ✓ **Spanish check:** I write all ~3,700 lines carefully; a native speaker skims them when convenient.
   **Yes** (nothing waits for it).

**Rule for the build: decisions stay easy to change.**
- Names (towns, leaders, villains, the rival, Palabritas) live in the data, in one place each, so a rename is a
  one-line change. Scripts refer to them and never repeat them.
- The story is made of steps that check flags. Dropping Equipo Silencio or the rival later would mean
  replacing a few steps, not rewriting regions.
- Family changes are data: an evolution is one line, and the family's word sample is pinned so it can be
  reshuffled later without changing anyone's words.
- Daily resets read the date in one helper, so they can be turned off or changed in one place.
- Every theme is its own file, so it can be checked or rewritten on its own.

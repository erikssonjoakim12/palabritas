# Palabritas — roadmap

Where the game is going: mechanics, world, gyms, and what you learn along the way.
Status: **plan** (nothing below is built yet unless marked ✓). Learning details: [LEARNING_PLAN.md](LEARNING_PLAN.md).

## 1. Quick mechanic changes

| Change | Notes |
|---|---|
| **Critical hits are 50/50** ✓ | A perfect answer (not "tap the meaning") hits ×1.5 half the time and ×1 the other half. "Almost" stays ×0.75, help ×0.5, wrong = miss. |
| **Male voices for male characters** ✓ | Each character gets a voice: male or female (from their look). The game picks a male Spanish voice when the phone has one; if not, it lowers the pitch of the voice it has. Phones differ: Android usually has one Google es-MX/es-US voice; some have several. |
| **Choose boy or girl** ✓ | At the start of a new game. Changes your overworld sprite and battle portraits, and the Spanish people use with you: «¿Estás **listo/lista**?», «Bienvenido/Bienvenida», «¡Qué cansado/cansada!». That also teaches gender agreement. |

## 2. Evolutions (starters first) ✓

Like Gold/Silver: at a set level, at the end of a turn (mid-battle, the "anime moment"), with the evolution animation.
The theme and learned words stay; base stats go up; new name and art.

| Starter | Evolves at | Into (name ideas) | Type |
|---|---|---|---|
| Salchichita (dachshund hot dog) | Nv 16 | **Hamburguesón** (a burger dog) | Fuego |
| Gotita (raindrop) | Nv 16 | **Nubarrón** (a rain cloud; "nubarrón" = big storm cloud) | Agua |
| Aguacatito (avocado) | Nv 16 | **Aguacatoño** (a sapling: *aguacate* + *retoño*, "sprout") | Planta |

Level 16 = after the first gym (12), before the second (~19). A second evolution (~Nv 36) comes later;
reserved name: Aguacatoño → **Aguacatero** (the full avocado tree; *aguacatero* = avocado tree).
Placeholder art (shape drawings) until the real art arrives.

## 3. The world: a Nicaragua-inspired country

Seven biomes, each a **regional encounter pool** that overlaps with its neighbors (volcanoes sit in dry forest,
rainforest animals live along rivers). Animals, visual hooks and color directions: [BIOMES.md](BIOMES.md).

| Biome | Where in the game | Colors |
|---|---|---|
| Farms, villages, forest edges | Pueblo Amanecer, Villa Limón, Rutas 1-2 (now) | familiar, simple |
| Pine highlands (the north) | Ruta 3 to gym 2 (Villa Ocote) | pine green, clay red, misty blue-gray |
| Hot, dry forest | the trees of Rutas 1-2; Rutas 6 and 8 and around the volcano | tan, ochre, rust-red |
| Volcanoes and lava | around gym 4 | charcoal, ember orange, sulfur yellow |
| Tropical beaches and coasts | around gym 3 | (coast colors) |
| Lakes, rivers, wetlands | the lake archipelago, SURF routes | aqua, turquoise, muddy brown |
| Dense tropical rainforest | around gym 5 | emerald, teal, vivid warning colors |
| Cool mountain and cloud forest | the highlands (gym 7 proposal) | moss green, misty gray |

Nicaraguan flavor for later: **voseo** («vos sos», «¿qué querés?») is everyday Spanish there, plus
local words (*chunche*, *tuani*, *¡ideay!*, *va pues*). Great B1/B2 content: regional variety.

### Map changes, near term

- **Pueblo Amanecer** ✓: water to the south and east (for SURF later), and a **ledge** to the west: you can see a
  route down there but can't climb up to it yet. Later you come back from the other side and jump down.
- **Ruta 3** (west of Ciudad Brisa) — map ✓, 7 trainers ✓ (Ruta 2 looks), Hojadillo in the grass ✓, more Palabritas to come: an **officer** blocks it until you have the Breeze Medal ("only tough
  trainers may pass"). Mountains instead of trees; the path goes left, up, left; tall grass, **ledges**,
  mostly mandatory trainers; new common Palabritas from the dry-forest and farm pools (birds, bugs, small
  mammals: designs to come). A small **Palacentro** at the end, outside the cave.
- **Ruta 4: the cave** ("Cueva del Eco") — map ✓, wild Palabritas on every step ✓ (Ecolín, Ochopatas, Cuernito: placeholder art), 5 trainers ✓ (new kinds: Espeleólogo, Exploradora, Arqueólogo; you defend by listening); about as long as Ruta 3 (each ~100 steps). Bats, cave beetles, spiders (designs to come).
- **Ruta 5** ✓: out of the cave's tunnel high on the mountain (up and to the right of the way in, like the
  cave inside), down a clifftop trail and west over the ravine bridge to Villa Ocote; Lucas's first battle;
  the canyon path north. One river runs from the canyon's waterfall through Ruta 5's ravine to a pond.
- **Region 2** ✓ (mostly; see plans/phase2-region2.md): Villa Ocote (a bigger potters' town that lost its
  words), the clay mine and Equipo Silencio, Petra's gym (Medalla Barro), the Cañón del Guardabarranco,
  7 new Palabrita families with their themes, the lost words, Beto's hat, the echo room fossil (Caparazonte),
  Don Chepe's oxen and Gaby's bird.
- **Dry-forest trees** ✓: every tree so far is the dry tropical forest's (mostly green, some dry ones,
  mixed by themselves). The old pine is kept for a colder biome later, and a palm tree is ready for the beaches.

New world mechanics this needs:

| Mechanic | What |
|---|---|
| Ledges ✓ | One-way tiles: jump down (with a little hop), can't walk up. |
| Mountain/cliff tiles ✓ | Rocky walls and mountain ground for routes outside towns. |
| Cave tileset ✓ | Rock walls, cave floor, entrance; maybe darkness later. |
| Gate guards ✓ | Generalize Beto: "blocks the way until a flag/medal", reusable for every gate. |
| SURF (later) | Ride a Palabrita over water; needs a field-move system (like Gold/Silver's HMs). |

## 4. Gyms and the level curve

Leaders' strongest Palabrita goes from 12 to ~58; the Elite Four from 55 to 70.
Route trainers sit between the previous leader and the next one.

| # | City / habitat | Type | Team | Top level | Route trainers before it |
|---|---|---|---|---|---|
| 1 ✓ | Ciudad Brisa | Volador (birds) | 2 | 12 | 3-6 |
| 2 ✓ | Villa Ocote, a pine-highland town past the cave | Roca / Tierra | 3 | 21 | 12-18 |
| 3 ✓ | Playa Carey, a fishing village on the Pacific | Agua | 3 | 25 | 17-21 |
| 4 | volcano town | Fuego | 3 | 31 | 22-28 |
| 5 | rainforest town | Planta / Veneno | 3-4 | 37 | 28-34 |
| 6 | the lake archipelago, stormy | Eléctrico | 4 | 43 | 34-40 |
| 7 | cloud-forest highlands | Psíquico (emotions) | 4 | 50 | 40-47 |
| 8 | the old capital | Dragón | 5 | 58 | 47-55 |
| E4 | Elite Four | Lucha, Acero, Fantasma (folklore), ... | 4-5 each | 60 → 70 | 52-58 (Victory Road) |

Elite Four idea: Lucha (sports), Acero (construction/materials), Fantasma (Nicaraguan legends:
El Cadejo, La Mocuana, La Carreta Nagua), and the master with a mixed team at 65-70.

**Pace check:** from level 41, mastering a word needs good answers on two different days. Reaching ~58 for
gym 8 therefore takes weeks of daily play. That fits language learning (you can't cram to fluency), but the
story should expect it: regions get longer and richer, with side content, not just harder trainers.

## 5. What you learn, region by region

How people actually learn a language, in short:
- **Frequency first.** The ~1,000 most common words cover around 80% of everyday speech; ~2,000-3,000 cover
  most of it. (Our core list does this.)
- **Chunks before rules.** Learners use whole phrases («¿Me da...?», «Tengo que...») long before they know
  the grammar inside them.
- **A fairly stable order** for grammar: present → «ir a» + verb → past (preterite) → imperfect →
  pronouns/reflexives → perfect, future, conditional → subjunctive → if-clauses and nuance.
- **Comprehension, then production**: understanding comes first (tap, listen), then writing and speaking.
- **Spaced repetition** and **using words in context** make them stick (loyalty and reviews).

Mapped onto the game (each gym leader's battle uses that region's grammar):

| Stage | Levels | Gyms | CEFR | Grammar and topics |
|---|---|---|---|---|
| Words | 2-20 | 1-2 | A1 | core words, set phrases, present of common verbs, gustar, questions |
| First sentences | 21-30 | 3-4 | A2 | present tense in full, «ir a», shopping, directions, routines |
| Telling stories | 31-40 | 5 | A2 | preterite (what happened), imperfect (how it was) |
| Conversation | 41-50 | 6-7 | B1 | perfect, future, conditional, pronouns, feelings and wishes (Psychic gym: «Espero que...») |
| Opinions | 51-60 | 8, E4 | B1-B2 | subjunctive (doubts, advice), connectors, arguing a point |
| Fluency | 61-70 | E4 master | B2 | if-clauses, idioms, **voseo and Nicaraguan Spanish** |
| Mastery | 71-100 | post-game | C1 | nuance, formal vs. informal, long listening and speaking |

Each new kind of Palabrita brings a theme (sloths → the rainforest; turtles → lakes and boats...);
themes grow from the creatures, as you said.

## 6. Suggested order of work

1. **Quick changes:** 50/50 critical hits, boy/girl choice (with gendered Spanish), male/female voices.
2. **Evolutions** ✓ for the three starters (system + placeholder art).
3. **World mechanics** ✓: ledges, mountain/cliff tiles, cave tiles, reusable gate guards.
4. **Pueblo Amanecer** ✓ expansion (water south/east, the west ledge).
5. **Ruta 3, its Palacentro, and the cave** (maps ✓), with new Palabritas (your designs) and trainers (Nv 10-16).
6. **Content for levels 21-40** (A2 core words and sentences), needed before gym 3.
7. **Gym 2** ✓ and its town, then onward region by region.

The detailed plan for gyms 2-4 (places, story, side quests, Palabritas, Spanish, systems, build order):
[PLAN_GYMS_2-4.md](PLAN_GYMS_2-4.md).

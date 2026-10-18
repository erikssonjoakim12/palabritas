# Phase 2 — Region 2: the pine highlands (Ciudad Brisa → Villa Ocote, gym 2)

**Goal:** you can play from the Breeze Medal to the **Medalla Barro**.

**The route:**
1. Through the Cueva del Eco to Ruta 5, and over the bridge into Villa Ocote, a town where nobody can speak.
2. Down into the clay mine to beat Equipo Silencio.
3. Back up to beat Petra.
4. Side quests: Beto's hat, the echo room and its fossil, the lost oxen, and the national bird.

**Read first:** CLAUDE.md · PLAN_GYMS_2-4.md §2 · [phase1-groundwork.md](phase1-groundwork.md) (it must
be done) · [palabritas.md](palabritas.md) §2 · [content.md](content.md) §2 and §3.

**Work in this order:**
1. Tiles and looks (§1).
2. Maps (§2–§4); `npm test -- maps` after each map.
3. The Palabritas and their themes (§10–§11).
4. Trainers (§5).
5. The story (§6–§7).
6. Quests (§8).
7. The gym (§9).
8. Tests (§12).

Commit after each step. The maps below are drawn and checked: every way in and out is reachable, trainers
marked "in the way" can't be walked past, and seams line up with their neighbors. Paste them as they are.

---

## 1. Tiles, styles and looks for this region

| What | Notes |
|---|---|
| `D` dark passage ✓ **already built** (with the Ruta 5 fix) | Mountain rock with the cave mouth turned 180° and half as tall: the dark opening meets the ground north of it. Walkable; `kind: 'door'`. |
| `H` wooden bridge ✓ **already built** | Planks across the water: horizontal boards when there's water above and below, vertical ones when water is left and right. Rope rails on both edges. |
| `F` fountain | 2×2: stone rim, water inside, a spout. Each quarter picks its corner from its neighbors (like the table). |
| `U` market stall | A wooden counter under a striped awning, with goods on it: clay pots here. Indoors, the same tile works as pottery shelves. |
| `K` mine rails | Two rails with wooden sleepers on cave floor. |
| `W` wooden mine support | Two posts and a beam. |
| `Z` ladder ✓ **built** | A hole in the cave floor with a wooden ladder, standing away from the walls (Gold/Silver style): the mine's floors are joined by ladders, and you arrive on the ladder. The mine rows in §4.4 still show the first draft's `D`: the maps file is the truth. |
| style `trees: 'pine'` | Ruta 5, the canyon, Villa Ocote: `'T'` is mostly pines. |
| roof `'clay'` | Terracotta: Villa Ocote. |
| style `walls: 'adobe'` | Warm ochre walls: Villa Ocote. |
| style `cave: 'clay'` | Red clay walls and floor: the mine. |

**New objects** (`OBJECTS_ART` + `OBJECT_PALS`, 16×16, the 3-color sprite rules):

| Object | Looks like |
|---|---|
| `carreta` | an ox-cart with big wooden wheels |
| `palanca` | a lever on a post |
| `compuerta` | a wooden mine gate (it blocks the passage until opened) |
| `silenciador` | a gray machine with a funnel and a "Shhh" sign |
| `puertaPiedra` | a stone door carved with a spiral |
| `paredRota` | a cracked cave wall |
| `ecolinSombrero` | an Ecolín wearing a green hat |
| `buey` | an ox |
| `vitrina` | a museum display case |
| `palabra` | a lost word: a small glowing speech bubble with letters in it (§6.1) |
| `nota` | a folded paper (the Capataz's note, §6.1) |

**New looks** (`LOOKS`, plus heads where needed). Portraits come with them; add the hood to `portraits.ts`.

| Look | Head | Body | Color | Who |
|---|---|---|---|---|
| `silencioso` | `hood` (new: a black hood that covers the hair, the face showing) | pants | `black` (new color `#383848`) | Equipo Silencio grunts |
| `silenciosa` | `hood` | dress | `black` | Equipo Silencio grunts |
| `capataz` | `hood` | coat | `black` | the Capataz (the coat portrait is a lab coat: give `body()` a dark coat when the color is black) |
| `petra` | `bun` | dress | `brown` | the gym leader, a potter |
| `lenador` | `crew` | pants | `red` | woodcutter (trainer kind) |
| `campista` | `long` | pants | `teal` | camper (trainer kind) |
| `ornitologa` | `safari` | pants | `green` | Gaby the birdwatcher |
| `alfarero` | `crew` | coat | `brown` | potter (gym trainer kind) |
| `minera` | `helmetLong` | pants | `brown` | miner (gym trainer kind) |
| `lucas` | `cap` | pants | `teal` | the rival |

Also: `isMaleLook` gets `hood` for `silencioso` and `capataz`. Female grunts use the `silenciosa` look:
`isMaleLook` must check the look id, not only the head.

---

## 2. Where the new maps sit (world layout)

| Map | Size | World top-left | Connections (exact offsets) |
|---|---|---|---|
| `ruta5` ✓ **built** | 96×29 | (-116, -164) | add `left: { to: 'ocote', offset: -2 }`, `up: { to: 'canon', offset: -4 }`; it already has `down: { to: 'ruta3', offset: -56, scenery: true }`: keep it |
| `canon` | 24×30 | (-112, -194) | `down: { to: 'ruta5', offset: 4 }` |
| `ocote` ✓ **built, bigger** | 40×32 | (-156, -166) | `right: { to: 'ruta5', offset: -2 }` (Ruta 5 has `left: { to: 'ocote', offset: 2 }`); phase 3 adds `down: { to: 'ruta6', offset: -6 }` (the south road is x 22–23) |

The cave (`ruta4`) links Ruta 3 and Ruta 5 by doors. Inside, it climbs **up and to the right** (in at the
bottom left, out at the top right), so outside, Ruta 5's tunnel is up and to the right of the cave mouth on
Ruta 3: the tunnel is at world (-26, -159), the mouth at (-56, -133). The mountain between them is Ruta 5's
south-east rock and Ruta 3's top rock, which meet: Ruta 5 sits on Ruta 3 with a **scenery connection**
(`scenery: true`: it places the map in the world and is never walked across). The game draws every map within a
few tiles of the one you're on, connected or not. **One river** runs from the canyon's waterfall down the canyon,
bends left at its foot into Ruta 5's ravine, under the bridge, and ends in a round pond at the bottom of Ruta 5.
(A "Cerro del Eco" scenery map once filled the gap west of Ruta 3; it was removed: nothing needs it yet.)

---

## 3. Ruta 5

**Already built** (the fixes the user asked for): these rows, the tunnel doors both ways, the sign. Two gates
hold the unfinished roads closed: `obrero` on the west road and `derrumbe` on the canyon path. **To do in this
phase:**
- remove both gates;
- add the connections and `style: { trees: 'pine' }`;
- add the encounters, the trainers, Gaby and the Lucas trigger below.

You leave the cave walking **up** (its far exit is at the top right) and come out of a tunnel high on the
mountain, still walking up: up and to the right of where you went in (the user asked for this). A trail runs
west along the clifftop (rows 3–4), down past a clearing with tall grass (x 46–47), to the road (rows 11–12).
The road goes west past the canyon path and over the ravine bridge to Villa Ocote. South of the road, a
meadow with tall grass.

- `name: 'Ruta 5'`, `outdoor: true`, `ground: 'grass'`, `style: { trees: 'pine' }`.
- **Doors:**
  - `{ x: 90, y: 5, to: 'ruta4', tx: 52, ty: 1, dir: 'down' }`: the tunnel.
  - In `ruta4`, the far exit door is `{ x: 52, y: 0, to: 'ruta5', tx: 90, ty: 4, dir: 'up' }`.
- **Remove** the road worker's gate: the bridge is finished.
- **Encounters** (rate 0.12):

  | Palabrita | Levels | w |
  |---|---|---|
  | ardillita | 10–13 | 30 |
  | colibri | 10–13 | 25 |
  | espinita | 11–13 | 20 |
  | hojadillo | 10–12 | 15 |
  | pajarito | 10–12 | 10 |

- **Trainers and people:**

  | id | Where | Kind | Notes |
  |---|---|---|---|
  | `armando` | (70, 2) facing down, sight 2 | Leñador Armando, `lenador` | **in the way** (the clifftop trail: he sees both rows) |
  | `lucia` ✓ **built** | (34, 10) facing down, sight 2 | Pintora Lucía, `painter` | **in the way** (halfway along the road, in a gap in the pines) |
  | `elena` | (14, 10) facing down, sight 2 | Campista Elena, `campista` | **in the way** (the road west) |
  | `gaby` | (20, 8) facing left | Gaby the birdwatcher, `ornitologa` | quest NPC, §8.4 |

- **Trigger:** `(46..47, 10)`, the foot of the trail → `lucasRuta5` (rival battle #1, §7), only once.
- **Sign** (16, 13): «RUTA 5. Al oeste: Villa Ocote. Al norte: el Cañón del Guardabarranco.» / "ROUTE 5. West:
  Villa Ocote. North: Guardabarranco Canyon."

```
      'TTTTTT^~~^TTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==T........T.TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.TTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,.TTTTTTTTTTTTTTTT==============================================TTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==============================================TTTT',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^D^^^^^',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTT==.,,,,,,,,..TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTT==...........TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'T.T...^~~^TTTTTTTT==..T....T...TTTTTTTTTTTTTTT==.,,,,,,,,,,T^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^',
      'T.....^~~^TTTT.TTT==...........TTT.TTTTTTTTTTT==...........T^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '======HHHH======================================^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '======HHHH==================*===================^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'T.....^~~^TTTT..S.......,,,,,,.TTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^',
      'TT.T..^~~^TTTT,,,,,,,...,,,,,,.TTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^T^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,,...,,,,,,TTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,,...,,,,,,TTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTT.TTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTT,,,,,,TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^T^^^^^^^^^^^^^^^^^^^^T^^^^^^^^^^',
      'TTTTTT^~~^TTTT......TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^T^^^^^^^^^^^^T^^^^^^^^',
      'TTTTTT^~~^TTTT......TTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'TTTTTT^~~^TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
```

---

## 4. The canyon, the town, the mine and the cave

### 4.1 Cañón del Guardabarranco (`canon`)

A deep river canyon, like Somoto's: paths on both banks, three bridges, a waterfall pool at the top with a
grove on each side. **Optional.**

- `name: 'Cañón del Guardabarranco'`, `outdoor: true`, `ground: 'grass'`, `border: '^'`,
  `style: { trees: 'pine' }`.
- **Encounters** (rate 0.12):

  | Palabrita | Levels | w |
  |---|---|---|
  | colibri | 12–14 | 30 |
  | ardillita | 12–14 | 25 |
  | espinita | 12–15 | 25 |
  | mariposita | 12–13 | 15 |
  | guardabarranco | 13–15 | **5** (rare) |

- **People:**
  - `julio` (9, 18) facing left, sight 3: Pescador Julio (`fisher`).
  - `rosa` (16, 13) facing down, sight 2: Campista Rosa (`campista`).
  - Both are optional (it's a side area).
- **Item:** `itemBall('superpocion_canon', 3, 0, 'superpocion')`, in the west grove.
- **Fishing table** (once you have the rod, phase 3): mojarrita 10–14.

```
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^,,,,~~~~~~~~~,,,,,^^^',
      '^^^.......~~~........^^^',
      '^^^.T.....~~~......T.^^^',
      '^^^.......HHH........^^^',
      '^^^.......HHH........^^^',
      '^^^.......~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~.,,,,,,.^^^',
      '^^^,,,,,,.~~~........^^^',
      '^^^.......~~~......T.^^^',
      '^^^..*....HHH........^^^',
      '^^^.....T.HHH....*...^^^',
      '^^^.......~~~........^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^^^^....~~~.,,,,,,.^^^',
      '^^^.......~~~.,,,,,,.^^^',
      '^^^...T...~~~........^^^',
      '^^^.......HHH....T...^^^',
      '^^^.......HHH........^^^',
      '^^^....*..~~~.==.....^^^',
      '^^^,,,,,,.~~~.==..^^^^^^',
      '^^^,,,,,,.~~~.==..^^^^^^',
      '^^^,,,,,,.~~~.==..^^^^^^',
      '^^^,,,,,,^^^^^==^^^^^^^^',
      '^^^^^^^^^^^^^^==^^^^^^^^',
```

### 4.2 Villa Ocote (`ocote`)

**As built** (the user asked for a bigger town with extra houses): 40×32, see `src/world/maps.ts`. Besides the
buildings below it has a pottery workshop (`taller_ocote`, Don Ramiro), Doña Lucha's house (`casa_lucha`, the
healer), Doña Toña's house (`casa_tona`, the cook), Nando's house (`casa_nando`) and the old
couple's house (`casa_abuelos`). Every coordinate in this section is from the first, smaller draft: the map
file is the truth now.

- `name: 'Villa Ocote'`, `outdoor: true`, `ground: 'town'`, `roof: 'clay'`,
  `style: { trees: 'pine', walls: 'adobe' }`.
- `busStop: { x: 27, y: 9, dir: 'down' }`.
- `muted: () => !flag('silenciadorRoto')`.

**Doors** (`to` is the interior; arrive facing up at the interior's mat row − 1):

| Door at | Building | Interior id |
|---|---|---|
| (5, 8) | Palacentro | `centro_ocote` |
| (11, 8) | shop | `tienda_ocote` |
| (22, 8) | gym | `gym_ocote` |
| (5, 22) | museum | `museo_ocote` |
| (25, 22) | school | `escuela_ocote` |
| (5, 15) | Don Chepe's house | `casa_chepe` |
| (25, 15) | a family of potters | `casa_ocote2` |
| (19, 23) | Mía's house | `casa_mia` |
| (15, 3) | the mine | `mina1` (arrive at (5, 24) facing up) |

**Gates.** The user's rule: **nothing blocks the way to Villa Ocote** (Ruta 5's two gates go away in this phase).
In town, only the gym door waits for the quest: Petra's apprentice stands in it until the Silenciador is broken.
- `aprendiz` at `[22, 9, 'down']`, aside `[21, 9]`, road `[]`, back `'down'`,
  `opens: () => flag('silenciadorRoto')`.
  - Closed: «…» / "(He can't speak. He points north, toward the mine.)"
  - Open: «¡Petra te espera adentro!» / "Petra is waiting for you inside!"
- `guarda_sur` (look `officer`) at `[14, 26, 'up']`, aside `[13, 25]`, road `[[15, 26]]`, back `'up'`,
  `opens: () => flag('medalBarro')`.
  - Closed: «El camino al sur baja hasta el mar. Es largo y peligroso.» / "The road south goes down to the
    sea. It's long and dangerous." Then «Solo pueden pasar los entrenadores con la Medalla Barro.» / "Only
    trainers with the Clay Medal may pass."
  - Open: «¡Tienes la Medalla Barro! Buen viaje.» / "You have the Clay Medal! Have a good trip."
- **On a muted map, a gate guard says «…» like everyone else** (phase 1 §11 applies to gate lines too).

**People** (lines in §9):

| id | Where | Look | Notes |
|---|---|---|---|
| `chepe` | (28, 13) facing left | `man` | Don Chepe the ox-cart driver; quest §8.3 |
| `carreta` | (29, 14) | object `carreta` | |
| `cobrador_ocote` | (28, 9) facing down | `man` | the bus (phase 1 §7) |
| `nina_mensaje` | (13, 18) facing down | `girl` | Mía, who wrote the message |
| `vendedora` | (25, 11) facing up | `lady` | the pottery stall |
| `abuelo_ocote` | (18, 15) facing left | `granny` | an old man (`crew` look, gray) who tells town history |

**Signs** (they show «…» while muted):
- (4, 23) museum: «MUSEO DE VILLA OCOTE. Fósiles y piedras pintadas.» / "VILLA OCOTE MUSEUM. Fossils and
  painted stones."
- (28, 23) school: «ESCUELA. ¡Clases para entrenadores!» / "SCHOOL. Lessons for trainers!"
- (28, 8) bus stop: «PARADA DE BUS» / "BUS STOP"
- Pottery stalls at (23, 10), (24, 10), (26, 10): «Ollas, jarras y tinajas de barro.» / "Clay pots, jugs
  and water jars."

**Trigger:** the first time you enter (`!flag('mensajeLeido')`), on the road at (31, 9) and (31, 10), the
script `mensajeOcote` runs (§6).

```
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^O^^^^^^^^^^^^^^^^',
      'TT.............=..............TT',
      'TT.ooooo.rrrr..=....pppppp....TT',
      'TT.ooooo.rrrr..=..T.pppppp....TT',
      'TT.hwcwh.hwMh..=....hwGwwh....TT',
      'TT.hwdwh.hwdh..=....hhdhhh..S.TT',
      'TT.............=================',
      'TT......T......========UU=U=====',
      'TT.............=..............TT',
      'TT.rrrr....T========T...rrrr..TT',
      'TT.rrrr....==========...rrrr..TT',
      'TT.hwwh....====FF====...hwwh..TT',
      'TT.hwdh....====FF====...hdwh..TT',
      'TT.........==========.......T.TT',
      'TTT.....*..T========T......*..TT',
      'TT............==..............TT',
      'TT.rrrrrr.....==.......rrrrr..TT',
      'TT.rrrrrr.....==.rrrr..rrrrr..TT',
      'TT.hwwwwh.....==.rrrr..hwwwh..TT',
      'TT.hwdwwh.*...==.hwwh..hwdwh..TT',
      'TT..S......T..==.hwdh.......S.TT',
      'TT............==..............TT',
      'TT....T.......==.....*.T......TT',
      'TTTTTTTTTTTTTT==TTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTT==TTTTTTTTTTTTTTTT',
```

### 4.3 Interiors of Villa Ocote

| id | Rows | Exit | People |
|---|---|---|---|
| `centro_ocote` | `centro('centro_ocote', { to: 'ocote', x: 5, y: 9 })` | | the nurse, the machine |
| `tienda_ocote` | `tienda('tienda_ocote', { to: 'ocote', x: 11, y: 9 })`: make a `tienda()` helper from `tienda_brisa`'s rows and use it for both | | the cashier |
| `casa_chepe` | `HOUSE` | (5, 16) | `chepe_esposa` (lady) |
| `casa_ocote2` | `HOUSE` | (25, 16) | `alfarera_mama` (lady), `alfarero_nino` (boy) |
| `casa_mia` | `HOUSE` | (19, 24) | `mia_mama` (lady) |

`museo_ocote` (12×8, floor `+`), exit `{ to: 'ocote', x: 5, y: 23 }`, mats at (5, 7) and (6, 7):

```
      '############',
      '+kk+kk++kk++',
      '++++++++++++',
      '+kk++++++kk+',
      '++++++++++++',
      'P++++++++++P',
      '++++++++++++',
      '+++++mm+++++',
```

- **People:** `curadora` (6, 2) facing down (look `prof`, the museum curator Doña Inés).
- **Exhibits** (as signs on the table tiles):
  - (1, 1): «Un fósil de gliptodonte: un armadillo gigante de hace diez mil años.» / "A glyptodon fossil: a
    giant armadillo from ten thousand years ago."
  - (4, 1): «Una piedra con petroglifos: personas, soles y espirales.» / "A stone with petroglyphs: people,
    suns and spirals."
  - (8, 1): «Cerámica antigua de la región. ¡Los alfareros de hoy usan el mismo barro!» / "Ancient pottery
    from this region. Today's potters use the same clay!"
  - (1, 3): «Huellas muy antiguas, encontradas cerca de un lago.» / "Very old footprints, found near a lake."
  - (9, 3): «Un mapa de toda América, con un guardabarranco pintado.» / "A map of all the Americas, with a
    guardabarranco painted on it."

`escuela_ocote` (10×8, floor `_`), exit `{ to: 'ocote', x: 25, y: 23 }`, mat at (4, 7):

```
      '##L##L##L#',
      '__________',
      '__________',
      '_kk_kk_kk_',
      '__________',
      '_kk_kk_kk_',
      '__________',
      '____m_____',
```

- **People:**
  - `maestro_ocote` (4, 1) facing down (look `man`): the teacher, Profesor Rubén. His lessons use phase 1 §9;
    the topic of the day is `preguntas` on odd days of the month and `gustar` on even days.
  - `alumno1` (2, 4) facing up (boy) and `alumna1` (6, 6) facing up (girl).

`gym_ocote` (10×16, floor `_`), exit `{ to: 'ocote', x: 22, y: 9 }`, mats at (4, 15) and (5, 15). The `U`
tiles are pottery shelves; the gaps in each shelf row are where the stone doors stand.

```
      '##L####L##',
      '__________',
      '__________',
      'UUUU_UUUUU',
      '__________',
      '__________',
      '__________',
      'UUUUUU_UUU',
      '__________',
      '__________',
      '__________',
      'UU_UUUUUUU',
      '__________',
      '__________',
      '__________',
      '____mm____',
```

The people are in §9.

### 4.4 La Mina de Barro (`mina1`, `mina2`)

- `outdoor: false`, `banner: true`, `name: 'Mina de Barro'`, `floor: ';'`, `border: '%'`,
  `style: { cave: 'clay' }`.
- Encounters `everywhere: true`, rate 0.08.

**Floor 1** (36×26):
- **Exit:** `exit: { to: 'ocote', x: 15, y: 4 }` (the daylight `e` at (5, 25)).
- **Door:** `{ x: 31, y: 18, to: 'mina2', tx: 3, ty: 2, dir: 'down' }`.
- **Encounters:** piedrita 11–14 (w 40), ollita 11–14 (35), ochopatas 11–13 (15), ecolin 11–13 (10).

| id | Where | Notes |
|---|---|---|
| `silencioso1` | (4, 18) facing right, sight 2 | **in the way**; Silencioso |
| `silencioso2` | (10, 4) facing left, sight 2 | **in the way** (to the lever); Silenciosa |
| `palanca` | (12, 2), object | script `palanca`: «¿Jalas la palanca?» Sí sets `compuertaAbierta`, plays a rumble sfx, then `refreshNpcs()` |
| `compuerta` | (20, 9), object | `show: () => !flag('compuertaAbierta')`; talking to it: «La compuerta está cerrada. Tal vez hay una palanca...» / "The gate is closed. Maybe there's a lever..." |
| `pocion_mina` | (33, 7) | `itemBall(..., 'pocion')` |

```
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%;%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;;;;;;;;;;;%%',
      '%%;;;;;;;;;;;;;;;;;;;;;;;;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;;;;;;%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;KKKKKKKKKKK;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%;;;;;;;;;;;;;%%%%%%;;;W;;;;W;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;W;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;W;;;;;;D;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%;KKKKKKKKKKK;%%',
      '%%%%;;;%%%%%%%%%%%%%%;;;;;;;;;;;;;%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%e%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
```

**Floor 2** (30×24):
- **Door back up:** `{ x: 3, y: 1, to: 'mina1', tx: 31, ty: 19, dir: 'down' }`.
- **Encounters:** piedrita 13–15 (w 35), ollita 13–15 (30), ochopatas 13–15 (20), ecolin 13–15 (15).

| id | Where | Notes |
|---|---|---|
| `silencioso3` | (10, 9) facing up, sight 1 | **in the way**; Silencioso |
| `silencioso4` | (6, 16) facing left, sight 1 | **in the way**; Silenciosa |
| `capataz` | (22, 15) facing down, sight 3 | **in the way**; the Capataz; script §6 |
| `silenciador` | (22, 14), object | `show: () => !flag('silenciadorRoto')` |
| `petra_mina` | (22, 20), look `petra` | `show: () => flag('silenciadorRoto') && !flag('petraVolvio')`; she appears in the cutscene |
| `repelente_mina` | (26, 2) | `itemBall(..., 'repelente')` |

```
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%D%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;;;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;;;;%%%%%%%;;;;;;;;;;;;;%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%;;;;%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;%%%%%%%%%%%%%',
      '%%;;;;;%%%;%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%;;;%;;;%%%%;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;%%%%;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;%;;;;;;;;;;%%',
      '%%%%%;;%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%%;%%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;;;;;;;;;;;;%%',
      '%%%%;;;KKKKKKKKKKK;;;;;;;;;;%%',
      '%%%%;;;;;;;;;;;;;;;;;;;;;;;;%%',
      '%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
```

### 4.5 Cueva del Eco changes (`ruta4`)

Replace the rows: they add the **echo room** north of the pillar chamber, with a doorway at (6, 8)–(6, 9).

**New NPCs:**

| id | Where | Notes |
|---|---|---|
| `pared_eco` | (6, 9), object `paredRota` | `show: () => !flag('ecoAbierto')`, script `paredEco` (§8.2) |
| `fosil_cueva` | (6, 4) | `itemBall('fosil_cueva', 6, 4, 'fosil')` |
| `ecolin_sombrero` | (16, 33), object `ecolinSombrero` | `show: () => !flag('sombreroEncontrado')`, script `ecolinSombrero` (§8.1); in Rocío's side room |

The far exit door changes as in §3.

```
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%e%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%;;;;;;;;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%;;;;;;;;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;%%;;;%',
      '%%%;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;%',
      '%%%%%%;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;%%;;;;;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;%%;;;;;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;%%;;;;;;;;;;;;;;;;;;;%%%%%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;%%;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;%%;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;%%;;;;;;%%%%%%%%%%%;;;%%%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;%%;;;%%%%%;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;%%;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;;;%%%%%',
      '%%%%;;;%%%%%%%%%%%%%%%%%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%%%%%%%%%%%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%%%%;;%%%%%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%;;;;;;;;;%%%%%%;;;;;;;;;;;%%%%%',
      '%%;;;;;;;;;%%%;;;;%%;;;%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;;%%;;;%%;;%;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;;;;;;;;;;;;;%%;;%;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%e%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
```

---

## 5. Trainers

New `TRAINERS` entries. Route trainers get `rematch: true`; the rest don't.

```ts
armando: { id: 'armando', name: 'Leñador Armando', defenseMode: 'listen', rematch: true, team: [['ardillita', 12], ['pajarito', 12]] },
lucia: { id: 'lucia', name: 'Pintora Lucía', defenseMode: 'listen', rematch: true, team: [['hojadillo', 13], ['mariposita', 13]] },  // built; add rematch
elena: { id: 'elena', name: 'Campista Elena', defenseMode: 'listen', rematch: true, team: [['colibri', 12], ['espinita', 13]] },
julio: { id: 'julio', name: 'Pescador Julio', defenseMode: 'listen', rematch: true, team: [['hojadillo', 13], ['colibri', 13]] },
rosa: { id: 'rosa', name: 'Campista Rosa', defenseMode: 'listen', rematch: true, team: [['espinita', 13], ['ardillita', 14]] },
silencioso1: { id: 'silencioso1', name: 'Silencioso', defenseMode: 'listen', team: [['ollita', 13], ['piedrita', 13]] },
silencioso2: { id: 'silencioso2', name: 'Silenciosa', defenseMode: 'listen', team: [['ecolin', 13], ['ochopatas', 14]] },
silencioso3: { id: 'silencioso3', name: 'Silencioso', defenseMode: 'listen', team: [['piedrita', 14], ['ecolin', 14]] },
silencioso4: { id: 'silencioso4', name: 'Silenciosa', defenseMode: 'listen', team: [['ollita', 14], ['ochopatas', 15]] },
capataz: { id: 'capataz', name: 'Capataz Silencioso', defenseMode: 'listen', team: [['piedrita', 15], ['ollita', 15], ['piedrita', 16]] },
tito: { id: 'tito', name: 'Alfarero Tito', defenseMode: 'type', team: [['ollita', 15], ['piedrita', 15]] },
rosario: { id: 'rosario', name: 'Minera Rosario', defenseMode: 'type', team: [['piedrita', 16]] },
petra: { id: 'petra', name: 'Líder Petra', defenseMode: 'type', team: [['piedrita', 16], ['ollita', 17], ['petroglifon', 19]] },
lucas1: { id: 'lucas1', name: 'Lucas', defenseMode: 'type', team: [['<counter starter>', 15], ['pajarito', 12]] },  // §7
```

Lines (`trainerFight(id, { intro, defeated, after })`, each `[es, en]`):

| id | intro | defeated | after |
|---|---|---|---|
| armando | «¡Cuidado! Estoy cortando leña. Bueno... ¿luchamos?» / "Careful! I'm chopping firewood. Well... shall we battle?" | «¡Uf! Más fuerte que un pino.» / "Phew! Stronger than a pine." | «Los pinos de aquí huelen a ocote. ¡Me encanta ese olor!» / "The pines here smell of ocote. I love that smell!" |
| elena | «¡Hola! Acampo aquí todos los veranos. ¿Una batalla?» / "Hi! I camp here every summer. A battle?" | «¡Ay, se me apagó la fogata!» / "Oh, my campfire went out!" | «De noche se ven muchas estrellas en la montaña.» / "At night you can see lots of stars in the mountains." |
| julio | «¡Shh! Los peces se asustan. Bueno, ¡luchemos rápido!» / "Shh! The fish get scared. Well, let's battle fast!" | «Se me escapó... ¡como un pez!» / "It got away... like a fish!" | «Abajo del puente hay mojarras. Con una caña, ¡pescas muchas!» / "Under the bridge there are mojarras. With a rod you catch lots!" |
| rosa | «¿Viste el guardabarranco? ¡Yo tampoco! ¿Luchamos mientras esperamos?» / "Did you see the guardabarranco? Me neither! Shall we battle while we wait?" | «¡Qué buen{o/a} eres!» / "You're so good!" | «Dicen que vive al final del cañón, cerca de la cascada.» / "They say it lives at the end of the canyon, near the waterfall." |
| silencioso1 | «¡Shhh! ¡Silencio! Aquí no se habla.» / "Shhh! Silence! No talking here." | «¡Shhh! No le digas a nadie que perdí.» / "Shhh! Don't tell anyone I lost." | «El Capataz está abajo, con la máquina. ¡Shhh!» / "The Foreman is down below, with the machine. Shhh!" |
| silencioso2 | «¿Buscas la palanca? ¡No la vas a encontrar!» / "Looking for the lever? You won't find it!" | «Bueno... la palanca está ahí atrás.» / "Well... the lever is right back there." | «Las palabras solo causan problemas. ¿No crees?» / "Words only cause trouble. Don't you think?" |
| silencioso3 | «Cuando el Silenciador termine, ¡nadie va a hablar!» / "When the Silenciador is done, nobody will speak!" | «¿Cómo hablas tan bien?» / "How do you speak so well?" | «El jefe, Don Sigilo, dice que el silencio es oro.» / "The boss, Don Sigilo, says silence is golden." |
| silencioso4 | «¡No pasas! ¡Shhh!» / "You won't pass! Shhh!" | «¡Ay! Hablé demasiado.» / "Oh! I talked too much." | «El Capataz es muy fuerte. ¡Ten cuidado!» / "The Foreman is very strong. Be careful!" |
| capataz | §6 | | |
| tito | «Hago ollas con barro de la mina. ¿Y tú qué haces?» / "I make pots with clay from the mine. And what do you do?" | «¡Se me rompió una olla!» / "One of my pots broke!" | «Petra me enseñó todo. Es la mejor alfarera de Nicaragua.» / "Petra taught me everything. She's the best potter in Nicaragua." |
| rosario | «Trabajo en la mina. ¡Soy más dura que una piedra!» / "I work in the mine. I'm tougher than a rock!" | «Bueno... no tan dura.» / "Well... not that tough." | «La última puerta tiene la adivinanza más difícil.» / "The last door has the hardest riddle." |

---

## 6. The story: the muted town

**Flags:** `mensajeLeido`, `compuertaAbierta`, `silenciadorRoto`, `petraVolvio`, `medalBarro`, `busOpen`
(and the lost words' flags in §6.1).

**1. `mensajeOcote`** (the trigger at the east entrance, once):
- «En el suelo, alguien escribió algo con un palo...» / "Someone wrote something on the ground with a stick..."
- Then **a reading challenge**: `chooseText` with the message
  «¡AYUDA! Los Silenciosos se llevaron nuestras palabras. Están en la mina, al norte.» and the question
  «¿Dónde están los Silenciosos?», with the choices «En la mina», «En la escuela», «En el río».
- A wrong answer shows the message again.
- After: «¡Todos en el pueblo están callados! Hay que ir a la mina.» / "Everyone in town is silent! You have
  to go to the mine." Sets `mensajeLeido`.

**2. Muted:** every person says «…» (phase 1 §11). Exceptions with `speaksWhenMuted`: the Palacentro nurse,
the cashier and the bus driver. They're "too busy to notice", so the game stays playable. They each add one
line: «¿Tú puedes hablar? ¡Qué suerte! Aquí todos perdieron la voz.» / "You can talk? Lucky you! Everyone
here lost their voice."

**3. The mine:** the grunts and the lever (§4.4).

**4. The Capataz** (`capataz`, he spots you):
- «¡Shhh! ¿Quién eres tú? ¿Cómo puedes hablar?» / "Shhh! Who are you? How can you talk?"
- «Esta máquina es el Silenciador. Se come las palabras de todo el pueblo.» / "This machine is the
  Silenciador. It eats the whole town's words."
- «Don Sigilo dice: "Un mundo sin palabras es un mundo sin problemas." ¡Y yo estoy de acuerdo!» / "Don Sigilo
  says: 'A world without words is a world without trouble.' And I agree!"
- He battles you. Defeated: «¡No! ¡Mi máquina!» / "No! My machine!"

**5. The cutscene after the Capataz:**
1. The Silenciador shakes: a flash, three `bump` sounds.
2. «¡El Silenciador se rompió! Las palabras salen volando...» / "The Silenciador broke! The words are flying
   out..." Then `setFlag('silenciadorRoto')` and `refreshNpcs()`.
3. The Capataz: «Esto no se acaba aquí. ¡Don Sigilo se va a enterar! ¡Shhh!» / "This isn't over. Don Sigilo
   is going to hear about this! Shhh!" He walks off (`walkNpc`), then hides (`beat:capataz`, hidden by a
   `show`).
4. Petra walks in from the south (`placeNpc` at (22, 21), then `walkNpc` up to (22, 17)):
   - «¡Puedo hablar otra vez! Gracias, de verdad.» / "I can talk again! Thank you, really."
   - «Soy Petra, la líder del gimnasio de Villa Ocote. Vine sola a la mina... ¡qué tonta fui!» / "I'm Petra,
     the leader of the Villa Ocote gym. I came to the mine alone... how silly of me!"
   - «Ven a mi gimnasio cuando estés list{o/a}. ¡Te espero!» / "Come to my gym when you're ready. I'll be
     waiting!"
5. Fade, then warp to Villa Ocote (15, 4) facing down. Set `petraVolvio`. The town talks again; NPCs now use
   their "after" lines (§9).

### 6.1 Las palabras perdidas (the lost words)

The town's words were *stolen*, so getting them back should be the learning, not just a flag. The Silenciador
breaks, most words fly home, but **eight get lost on the way**. Each one belongs to one person, who can talk
again except for that one word. You find the words and give each back by **completing its owner's
sentence in Spanish**. It's optional: the gym only needs the mine (§6). But it sends you back through Ruta 5,
the canyon and the mine, which is the play time this region needs.

**Flags:** `palabra:<id>` (found), `devuelta:<id>` (given back), `palabrasDone` (all 8 back, then the party).
**Key item:** `palabras` «Palabras perdidas» (in `ITEM_DEFS` like `traje`): its count is found minus given
back. Using it from the bag lists the words you carry, each as `wordRow` (tap to hear it).

**Before the mine: muted, but not blank.** Instead of a bare «…», each muted person mimes. The Spanish stays
«…»; the EN button tells you what they do. (`MapDef.muted` from phase 1 §11 gets an optional per-NPC
`mime: string` for that EN line.)

| Person | Mime (EN) |
|---|---|
| `vendedora` | (She holds up a clay pot and opens her mouth, but nothing comes out.) |
| `abuelo_ocote` | (He points at the mine, then at his mouth, and shakes his head sadly.) |
| `chepe` | (He counts on his fingers: one, two... and looks around for something.) |
| `nina_mensaje` (Mía) | (She points at the ground, where she wrote the message.) |
| `lucas` | (Lucas stamps his foot. He looks furious that he can't talk.) |
| `cocinera` | (She pats some dough between her hands and sighs.) |
| `musico` | (He lifts his mallets over the marimba... and puts them down again.) |
| `curandera` | (She holds her head as if it hurts, then points at a little bottle.) |
| `futbolista` | (He bounces on his toes and mimes kicking something.) |
| anyone else | (They try to speak, but no words come out!) |

**The cutscene in the mine** (§6 step 5) gets one more line after «¡El Silenciador se rompió!»:
«¡Las palabras vuelan hacia el pueblo! Pero... algunas se perdieron por el camino.» / "The words are flying
back to town! But... some got lost on the way." The 8 word objects appear with the same `refreshNpcs()`.

**New people in Villa Ocote** (add to §4.2; all speak once `silenciadorRoto`):

| id | Where | Look | Who |
|---|---|---|---|
| `cocinera` | (8, 11) facing down | `lady` | Doña Toña, who makes tortillas |
| `musico` | (12, 16) facing right | `man` | Don Memo, the marimba player in the plaza |
| `curandera` | (10, 20) facing down | `granny` | Doña Lucha, who knows every remedy |
| `futbolista` | (9, 24) facing right | `boy` | Nando, who always wants to play |

**The lost words** (object `palabra`: a small glowing speech bubble with letters in it;
`show: () => flag('silenciadorRoto') && !flag('palabra:<id>')`). Use the real content item where it exists
(`itemBySpanish`) so answering counts toward mastery; otherwise `adHocItem`.

| id | The word | Content item | Lying at | Owner | Their sentence (the gap is the word) |
|---|---|---|---|---|---|
| `olla` | la olla | `cocina` | `mina1` (30, 13) | `vendedora` | «Esta ___ es de barro. ¿La quieres?» / "This ___ is made of clay. Do you want it?" |
| `tortilla` | la tortilla | core | `ocote` (3, 11), west of the plaza | `cocinera` | «Hago una ___ de maíz para el desayuno.» / "I make a corn ___ for breakfast." |
| `bueyes` | los bueyes | ad hoc | `ruta5` (53, 8), the clearing on the clifftop trail | `chepe` | «Mis ___ se llaman Lucero y Canelo.» / "My ___ are called Lucero and Canelo." (built; the oxen run off later, in §8.3) |
| `historia` | la historia | `historia` | `mina2` (8, 13) | `abuelo_ocote` | «Te voy a contar la ___ de Villa Ocote.» / "I'm going to tell you the ___ of Villa Ocote." |
| `marimba` | la marimba | `musica` | `ruta5` (3, 10), by the west road | `musico` | «Toco la ___ todas las noches en la plaza.» / "I play the ___ every night in the plaza." |
| `medicina` | la medicina | `salud` | `ocote` (29, 18), behind the school | `curandera` | «Para el dolor de cabeza, toma esta ___.» / "For a headache, take this ___." |
| `pelota` | la pelota | `deportes` | `ocote` (22, 4), by the mine | `futbolista` | «¿Jugamos con la ___?» / "Shall we play with the ___?" |
| `pregunta` | la pregunta | `preguntas` | `mina2` (24, 18), by the broken Silenciador | `maestro_ocote` | «Hoy tengo una ___ para ti.» / "Today I have a ___ for you." |

**Picking one up** (script `palabraPerdida`, the object's id tells which): `speak()` the word, then
«¡Una palabra perdida! Dice: «la olla».» / "A lost word! It says: 'la olla' (the pot)." Set `palabra:<id>`,
add one `palabras`, and `refreshNpcs()`.

**Talking to an owner** (one shared script `duenoPalabra`, looked up by NPC id):
- **Word not given back, and you don't have it:** they say their sentence with «…» in the gap, then «¡Ay, no
  me sale la palabra!» / "Oh, the word won't come out!" The EN shows the sentence with "___" and a hint
  ("something made of clay"), so you know what to look for.
- **You have it:** «¿Tienes mi palabra?» Then a `type` (or `speak`) challenge: label «Completa: «Esta ___ es
  de barro.»», answer = the word, `allowHelp: true`.
  - Right: they say the whole sentence, happily. Set `devuelta:<id>`, take one `palabras`, give the reward.
  - Wrong: «Mmm, no... esa no es mi palabra.» / "Hmm, no... that's not my word." Nothing changes; try again.
- **Given back:** their normal lines (§9).

| Owner | Thanks / reward |
|---|---|
| `vendedora` | «¡Mi olla! Llévate una, es un regalo.» / "My pot! Take one, it's a gift." 1 Superpoción |
| `cocinera` | «¡Ya puedo decirlo! Toma, para el camino.» / "I can say it now! Here, for the road." 2 Pociones |
| `chepe` | «¡Mis bueyes! ¡Ahora puedo pedir ayuda!» / "My oxen! Now I can ask for help!" **This starts §8.3**: before his word is back, Don Chepe can't ask for help with the oxen |
| `abuelo_ocote` | He tells the town's history (his §9 lines) and gives $200 |
| `musico` | He plays: a short marimba tune (a new `sfx('marimba')`, quiet). «¡La música volvió!» / "The music is back!" 1 Repelente |
| `curandera` | 2 Superpociones: «Para tus Palabritas. ¡La salud es lo primero!» / "For your Palabritas. Health comes first!" |
| `futbolista` | «¡Golazo!» / "What a goal!" 3 Palabolas |
| `maestro_ocote` | **This opens his lesson menu** (phase 1 §9): before, he can only say the gap sentence |

**All 8 back: «La fiesta de las palabras»** (`palabrasDone`):
1. The last thank-you ends with Mía running up (`placeNpc`, then `walkNpc`): «¡Todos hablan otra vez! ¡Esta
   noche hay fiesta en la plaza!» / "Everyone's talking again! Tonight there's a party in the plaza!"
2. Fade to `ocote_noche` (the same rows, `night: true`, phase 1 §10). The 8 owners stand around the fountain;
   Don Memo plays the marimba.
3. Each owner says one line **using their word** (a free review), e.g. «¡Qué rica la tortilla!» / "The
   tortilla is so tasty!", «¡Esta olla es para la sopa de la fiesta!» / "This pot is for the party soup!"
4. Petra: «Gracias a ti, Villa Ocote tiene todas sus palabras.» / "Thanks to you, Villa Ocote has all its
   words." She gives 5 Superbolas and 2 Revivir.
5. Fade back to day. Set `palabrasDone`. Afterwards the plaza's people mention the party now and then.

**A note for later (foreshadowing):** after the Capataz's battle, he drops a note: an object `nota` where he
stood. Reading it is a `chooseText`:
«Capataz: cuando termines aquí, ve al sur, a Playa Carey. Callada te espera allá. —Don Sigilo» / "Foreman:
when you're done here, go south to Playa Carey. Callada is waiting for you there. —Don Sigilo", with the
question «¿Quién espera en Playa Carey?» and the choices Callada / Petra / Mía. This points at phase 3's
turtle night.

**Objects to add to §1:** `palabra` (a glowing speech bubble with letters), `nota` (a folded paper).

**Tests:** add to `quests2.test`:
- after `silenciadorRoto`, a word can be picked up (`palabra:olla`, one `palabras`);
- an owner without the word says the gap sentence; with it, the right answer sets `devuelta:olla` and gives
  the reward, and a wrong one changes nothing;
- Don Chepe's oxen quest waits for his word;
- with all 8 back, the party runs and sets `palabrasDone`.

---

## 7. The rival: Lucas, battle #1

**The starter Lucas takes:**
- Add `starterPicked` to the save, set in `pickStarter`.
- **Migration:** take the first of salchichita/gotita/aguacatito found in `caught`.
- Lucas takes the one strong against yours: salchichita → **gotita**; gotita → **aguacatito**; aguacatito →
  **salchichita**.
- At level 15 his starter is still its first form (evolution is at 16).

**`lucasRuta5`** (trigger, once, flag `lucas1`):
1. A `!` over you. Lucas appears at (0, 11) and walks east along the road to (45, 11), next to the trail.
2. «¡{name}! ¡Por fin te alcancé!» / "{name}! I finally caught up with you!"
3. «Cuando te fuiste, la Profesora Ceiba me dio un Palabrita a mí también. ¡Mira!» / "When you left,
   Professor Ceiba gave me a Palabrita too. Look!"
4. «Elegí el más fuerte contra el tuyo. ¡Vamos a ver quién aprendió más palabras!» / "I chose the strongest
   one against yours. Let's see who learned more words!"
5. The battle (`lucas1`, levels in §5, look `lucas`).
   - Defeated: «¡Ay! Estudiaste mucho, ¿verdad?» / "Ugh! You studied a lot, didn't you?"
   - If you lose: the normal blackout, and he can be fought again later. The trigger stays until you win.
6. «Bueno, voy a Villa Ocote. ¡Dicen que el gimnasio es de tipo Roca!» / "Well, I'm going to Villa Ocote.
   They say the gym is Rock-type!" He walks west and disappears.

**Where else Lucas shows up:** in Villa Ocote before the mine, at (16, 12) by the fountain: «...» (muted
like everyone, and visibly angry). After the mine, he's gone (`show`).

---

## 8. Side quests

### 8.1 El sombrero de Beto (flags `sombreroEncontrado`, `sombreroDevuelto`)

1. **In the cave's side room:** talking to `ecolin_sombrero` gives «¡Un Ecolín con un sombrero verde!»,
   then a wild battle against Ecolín level 12.
   - If you win or catch it: «¡Se le cayó el sombrero!» / "It dropped the hat!", then `addItem('sombrero')`
     and `setFlag('sombreroEncontrado')`.
   - If you run away, it stays.
2. **Beto (Villa Limón)**, while you have the hat:
   - «¿Ese es mi sombrero? ¿De qué color es?» / "Is that my hat? What color is it?"
   - A speaking/typing challenge with the item `colores:verde`, or `adHocItem(['verde', 'Es verde'], …)`.
   - Right: «¡Sí, es mi sombrero verde! ¡Muchas gracias!» / "Yes, it's my green hat! Thank you so much!"
     Then remove `sombrero`, give 5 Palabolas and `setFlag('sombreroDevuelto')`.
   - Wrong: «Mmm, no... el mío es de otro color.» / "Hmm, no... mine is a different color." Try again.
3. Afterwards Beto says: «¡Con mi sombrero, el sol ya no me molesta!» / "With my hat, the sun doesn't bother
   me anymore!"

### 8.2 La sala del eco (flags `ecoAbierto`, `fosilEntregado`, `fosilDia`, `caparazonte`)

1. **The cracked wall:** talking to `pared_eco` shows «La pared tiene grietas. Del otro lado se oye un
   eco...» / "The wall is cracked. From the other side you hear an echo..." Then «¿Quieres gritar algo?» /
   "Do you want to shout something?"
2. **Yes: 5 echo rounds.** The wall "says" a word: `speak()` it, slowly the second time (it's an echo). You
   write it with a `listen` challenge.
   - **Words:** «hola», «eco», «cueva», «amigo», «¿hay alguien?». Use their core items where they exist,
     ad-hoc items otherwise.
   - A miss repeats that word.
3. After 5: «¡La pared tiembla... y se rompe!» Set `ecoAbierto` and `refreshNpcs()`. The fossil item ball
   is behind it.
4. **The museum curator**, Doña Inés:
   - Without the fossil: «Este museo guarda la historia de la región. ¿Sabías que aquí vivían armadillos
     gigantes?» / "This museum keeps the region's history. Did you know giant armadillos lived here?"
   - **With the fossil:** «¡Un fósil de caparazón! ¿Me lo prestas? Con mi máquina puedo despertarlo...
     pero tarda un día.» / "A shell fossil! Will you lend it to me? With my machine I can wake it up... but it
     takes a day."
     - Remove `fosil`, set `fosilEntregado` and `fosilDia = today()`.
     - The day itself is stored as `G.save.fossilDay`; flags are booleans.
   - **Same day:** «Todavía está durmiendo. ¡Vuelve mañana!» / "It's still sleeping. Come back tomorrow!"
   - **A later day:** «¡Despertó! Se llama Caparazonte. Vivió hace diez mil años... ¡y ahora es tuyo!» /
     "It woke up! It's called Caparazonte. It lived ten thousand years ago... and now it's yours!"
     Then `giveMon('caparazonte', 15)` and set `caparazonte`.

### 8.3 Los bueyes perdidos (flags `bueyes`, `buey1`, `buey2`, `bueyesDone`)

1. **Don Chepe** (once his lost word is back, `devuelta:bueyes`, §6.1):
   - «¡Ay, mis bueyes! Con el ruido de la mina, se escaparon.» / "Oh, my oxen! With the noise from the mine,
     they ran off."
   - «Uno se fue al norte del Cañón, cerca de la cascada. El otro está aquí en el pueblo, detrás de la
     escuela.» / "One went to the north of the canyon, near the waterfall. The other is here in town,
     behind the school."
   - Set `bueyes`.
   - Use `say` with the 🔊 replay: it's a listening moment. Ask once: «¿Dónde está el primer buey?» with
     choices «Cerca de la cascada», «En la mina», «En la playa».
2. **The oxen** (objects `buey`, `show: () => flag('bueyes') && !flag('bueyN')`):
   - `buey1` in the canyon at (19, 2).
   - `buey2` in Ocote at (25, 18): behind the school (its door faces south).
   - Talking to one: «¡Muuu!» Then «El buey te sigue hasta Don Chepe.» Set `bueyN` and `refreshNpcs()`.
3. **Don Chepe**, with both: «¡Mis bueyes! ¡Gracias, gracias!» Give 2 Superpociones and $300, and set
   `bueyesDone`.
   - Later: «Mañana llevamos la carreta al mercado. ¡Así es la vida en el campo!» / "Tomorrow we take the cart
     to the market. That's life in the countryside!"

### 8.4 El pájaro nacional (flags `gabyPregunta`, `gabyDone`)

1. **Gaby on Ruta 5:**
   - «Busco el guardabarranco, el ave nacional de Nicaragua.» / "I'm looking for the guardabarranco,
     Nicaragua's national bird."
   - «Tiene el pecho verde, el cuerpo color canela y la cola larga, con dos plumas como raquetas.» / "It has a
     green chest, a cinnamon body and a long tail, with two feathers like rackets."
2. **A reading challenge:** `chooseText` «¿Cuál es el guardabarranco?» with three descriptions:
   - «Un pájaro con la cola larga y dos plumas como raquetas» (right)
   - «Un pájaro pequeño con la cola corta y el pico amarillo»
   - «Un pájaro grande, negro, con la cabeza roja»
   - Right sets `gabyPregunta`: «¡Exacto! Dicen que vive en el cañón. Si atrapas uno, ¡enséñamelo!» / "Exactly!
     They say it lives in the canyon. If you catch one, show me!"
3. **With a Guardabarranco** in your team or box: «¡Es precioso! Gracias por enseñármelo.» Give 3
   Superbolas and set `gabyDone`.
   - Later: «El guardabarranco viaja por toda América. ¡Como yo!» / "The guardabarranco travels all over the
     Americas. Like me!"

---

## 9. Gym 2 and the town's people

### Gym 2: Gimnasio de Barro (`gym_ocote`)

**People:**
- `petra` (5, 1) facing down.
- `tito` (1, 9) facing right, **sight 8**.
- `rosario` (8, 5) facing left, **sight 8**.
- `guia_ocote` (7, 13) facing left (look `man`).

Both trainers are in the way: the shelf rows leave no way around their lines of sight.

**Stone doors:** objects `puertaPiedra` at (2, 11), (6, 7) and (4, 3) (ids `piedra1..3`), each
`show: () => !flag('adivinanzaN')`. Script `adivinanza`:
1. «La puerta tiene un dibujo y unas palabras...» / "The door has a drawing and some words..."
2. A riddle as a `chooseText` (with 🔊). The first wrong answer gives a hint; then try again. Right:
   «¡La puerta se abre!», a rumble, the flag set and `refreshNpcs()`.

| Door | Riddle | Answer | Wrong choices |
|---|---|---|---|
| 1 | «Tengo cuatro patas y digo "miau". ¿Quién soy?» / "I have four legs and say 'meow'. Who am I?" | el gato | el perro, el pájaro |
| 2 | «Soy de barro y en mí se cocina la sopa. ¿Qué soy?» / "I'm made of clay and soup is cooked in me. What am I?" | la olla | la mesa, el zapato |
| 3 | «Tengo cara, pero no tengo boca. Tengo manos, pero no tengo dedos. Doy la hora. ¿Qué soy?» / "I have a face but no mouth. I have hands but no fingers. I tell the time. What am I?" | el reloj | la luna, la puerta |

**The guide** (`guia_ocote`):
- «¡Hola! Petra usa Palabritas de tipo Roca y Tierra.» / "Hi! Petra uses Rock and Ground types."
- «El agua y las plantas son muy eficaces contra ellas.» / "Water and plants are super effective against
  them."
- «Para abrir las puertas, lee bien las adivinanzas.» / "To open the doors, read the riddles carefully."

**Petra** (`petra`, script `petra`, like Paloma's):
- **Intro:**
  - «¡Llegaste! ¿Te gusta el barro? ¡A mí me encanta! Con barro hago ollas, jarras... y Palabritas
    fuertes.» / "You made it! Do you like clay? I love it! With clay I make pots, jugs... and strong
    Palabritas."
  - «¿Sabes por qué me gusta tanto? Porque el barro es paciente, como aprender un idioma.» / "Do you know why
    I like it so much? Because clay is patient, like learning a language."
  - `ask('¿Estás list{o/a}?')`. No: «Vuelve cuando quieras. El barro siempre espera.» / "Come back whenever
    you want. Clay always waits."
- **The battle** (`petra`, look `petra`). Defeated: «¡Se me rompió todo! Bueno... así se aprende.» /
  "Everything broke! Well... that's how you learn."
- **After winning:**
  1. `setFlag('beat:petra')`, `setFlag('medalBarro')`, add `'Barro'` to medals, `sfx('badge')`.
  2. «¡{name} recibió la Medalla Barro!» / "{name} received the Clay Medal!"
  3. «Con esta medalla puedes bajar al sur, hasta el mar.» / "With this medal you can go south, down to the
     sea."
  4. «Y una cosa más: ¡el bus ya llega hasta Villa Ocote! Puedes viajar a los pueblos que conoces.» / "And one
     more thing: the bus now comes to Villa Ocote! You can travel to towns you know."
  5. Set `busOpen`.
- **Replace** the old "you finished the first part" message (after Paloma) with nothing: the adventure
  continues. Show a new one here only if Ruta 6 isn't built yet: «¡Felicidades! Terminaste la segunda parte
  de Palabritas.» (phase 3 removes it).

### What the people of Villa Ocote say

While muted, everyone says «…». After `petraVolvio`:

| id | Lines |
|---|---|
| `nina_mensaje` (Mía) | «¡Yo escribí el mensaje en el suelo! ¿Lo leíste?» / "I wrote the message on the ground! Did you read it?" · «Ahora puedo hablar todo lo que quiero. ¡Bla, bla, bla!» / "Now I can talk as much as I want. Blah, blah, blah!" |
| `abuelo_ocote` | «Hace muchos años, esta mina daba el mejor barro del país.» / "Many years ago, this mine gave the best clay in the country." · «Con ese barro, los alfareros de Villa Ocote hacían ollas para toda Nicaragua.» / "With that clay, the potters of Villa Ocote made pots for all of Nicaragua." |
| `vendedora` | «¿Te gustan mis ollas? ¡Las hago a mano!» / "Do you like my pots? I make them by hand!" · (a `chooseText` practice: «¿Cuál prefieres?» la olla grande / la jarra pequeña, with a friendly answer either way) |
| `chepe_esposa` | «Mi esposo cuida los bueyes como a sus hijos.» / "My husband looks after the oxen like his children." |
| `alfarera_mama` | «Toda mi familia trabaja con barro. ¡Hasta el niño!» / "My whole family works with clay. Even the boy!" |
| `alfarero_nino` | «¡Hice una ollita! Bueno... parece un plato.» / "I made a little pot! Well... it looks like a plate." |
| `mia_mama` | «Mía es muy valiente. ¡Escribió ese mensaje sola!» / "Mía is very brave. She wrote that message by herself!" |
| `alumno1` / `alumna1` | «¿Qué es más difícil: el español o las matemáticas?» / "What's harder: Spanish or math?" · «A mí me gusta mucho la clase de música.» / "I really like music class." |
| `maestro_ocote` | the lesson menu (phase 1 §9), once his lost word is back (§6.1) |
| `cocinera` (Doña Toña) | «¿Ya desayunaste? Aquí comemos gallo pinto con tortilla.» / "Have you had breakfast? Here we eat gallo pinto with tortillas." |
| `musico` (Don Memo) | «La marimba es el instrumento de Nicaragua. ¿Te gusta la música?» / "The marimba is Nicaragua's instrument. Do you like music?" |
| `curandera` (Doña Lucha) | «¿Te duele algo? Un té de manzanilla lo cura todo.» / "Does anything hurt? Chamomile tea cures everything." |
| `futbolista` (Nando) | «Cuando sea grande, ¡voy a jugar en la selección!» / "When I grow up, I'm going to play for the national team!" |

---

## 10. New Palabritas in this phase

- **New families:** Piedrita/Petroglifón, Ollita/Tinajón, Ardillita/Ardillón, Colibrí/Zumbador,
  Espinita/Puercoespín, Caparazonte/Gliptodón, and the Guardabarranco ([palabritas.md](palabritas.md) §2).
- **Art:** placeholder drawings from the Look column.
- **Not yet:** Hormiguita and Garrobito (phase 4) and the coast Palabritas.

## 11. Content in this phase

- **Themes:** cuerpo, cocina, deportes, musica, salud, historia, latinoamerica ([content.md](content.md)
  §2).
- **Topics:** preguntas, gustar (§3).
- Check them as content.md §4 says.

## 12. Tests

| Test | What it checks |
|---|---|
| `region2.test` | Cave far exit → Ruta 5 (you arrive at (24, 24) facing up) → Lucas's battle starts on the trigger → Villa Ocote (the message runs once; an NPC says «…») → the mine (the lever opens the gate; the Capataz is fought; the Silenciador breaks; Petra appears) → back in town an NPC talks normally → the gym (3 riddles, 2 trainers, Petra; you get `medalBarro` and `busOpen`) → the south guard lets you pass. Use `fromSave` checkpoints so each part can run alone. |
| `quests2.test` | Beto's hat; the echo room (5 rounds, the wall opens, the fossil); the museum (same day: waits; `__today` the next day: Caparazonte level 15 arrives); the oxen; Gaby. |
| `maps.test` | already checks every new map: it must stay green. |
| `data.test` | every new Palabrita has art, a theme and words. |

## 13. Done when

- All of the above is in, `npm test` is green, and the art page shows the new tiles, objects, looks and
  Palabritas.
- ROADMAP.md: phase 2 is marked ✓.
- Every commit is pushed.

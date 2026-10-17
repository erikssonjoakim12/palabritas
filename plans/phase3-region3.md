# Phase 3 — Region 3: the Pacific coast (Villa Ocote → Playa Carey, gym 3)

**Goal:** you can play from the Medalla Barro to the **Medalla Ola**.

**The route:**
1. Down Ruta 6 from the pine highlands, through dry forest, a big meadow and over a river.
2. Along the coast on Ruta 7 (rival battle #2).
3. Into the fishing village of Playa Carey.
4. On *la noche de la arribada*, you protect the sea turtles from Equipo Silencio.
5. Then Marina's surf school.
6. Side quests: the restaurant, the fishing rod, and a message in a bottle.

**Read first:** CLAUDE.md · PLAN_GYMS_2-4.md §3 · [phase2-region2.md](phase2-region2.md) (it must be
done) · [palabritas.md](palabritas.md) §3 · [content.md](content.md) §2 and §3.

**Work in this order:**
1. Tiles and looks (§1).
2. Maps (§2–§6); `npm test -- maps` after each.
3. Palabritas, themes and topics (§13).
4. Trainers (§7).
5. The story (§8–§9).
6. Quests (§10).
7. The gym (§11).
8. Tests (§14).

The maps below are drawn and checked (reachability, trainers marked "in the way", seams). The gym puzzle was
simulated: Marina can be reached, and the wrong currents lead back to the start.

---

## 1. Tiles, objects and looks

| What | Notes |
|---|---|
| `s` sand | Pale warm sand with a few darker grains. |
| `y` cactus | A tall columnar cactus on grass or sand. |
| `z` dry tall grass (zacate) | Yellow tufts, `kind: 'tallgrass'`. Also used as dune grass. |
| `A` lighthouse | White and red stripes; a lamp cap where the tile above isn't `A`. |
| shore foam | Where `~` touches land or sand: a light foam line on the water side (auto, like rock edges). |
| currents `8 2 4 6` | The engine is in phase 1 §14. Art: water with a white arrow, two frames if animation exists. |

**Objects:**

| Object | Looks like |
|---|---|
| `panga` | a small wooden fishing boat, on water |
| `botella` | a bottle in the sand with a rolled paper |
| `nido` | a little mound of sand with eggs |
| `tortuguita` | a hatchling |
| `brillo` | a sparkle on the sand (the bottle treasure) |
| `tienda` | a volunteers' tent |

**Looks:**

| Look | Head | Body | Color | Who |
|---|---|---|---|---|
| `surfista` | `long` | pants | `blue` | surfer (trainer kind) |
| `banista` | `longColor` | dress | `yellow` | swimmer (trainer kind) |
| `salvavidas` | `cap` | pants | `red` | lifeguard (trainer kind) |
| `vaquero` | `cowboy` (new: a wide hat with a dented crown) | pants | `brown` | cowboy (*sabanero*), trainer kind |
| `vaquera` | `cowboy` | dress | `khaki` | cowgirl, trainer kind |
| `observador` | `safari` | pants | `green` | birdwatcher (trainer kind) |
| `voluntaria` | `long` | pants | `green` | the turtle volunteer |
| `marina` | `longColor` | pants | `blue` | the gym leader, a lifeguard and surfer |
| `callada` | `hoodLong` (new: the hood over long hair) | dress | `black` | Equipo Silencio's admin |
| `farero` | `crew` | coat | `blue` | the lighthouse keeper |
| `lalo` | `cap` | pants | `brown` | Don Lalo; the same look as the Amanecer fisherman, his brother |

---

## 2. Where the new maps sit

| Map | Size | World top-left | Connections |
|---|---|---|---|
| `ruta6` | 36×70 | (-150, -134) | `up: { to: 'ocote', offset: -2 }`, `down: { to: 'ruta7', offset: 2 }` |
| `ruta7` | 32×46 | (-152, -64) | `up: { to: 'ruta6', offset: -2 }`, `down: { to: 'carey', offset: 0 }` |
| `carey` | 32×26 | (-152, -18) | `up: { to: 'ruta7', offset: 0 }`, `down: { to: 'tortugas', offset: 2 }`, `right: { to: 'ruta8', offset: 2 }` (Ruta 8 comes in phase 4; the east road ends at the guard until then) |
| `tortugas` | 34×22 | (-154, 8) | `up: { to: 'carey', offset: -2 }` |

Villa Ocote already has `down: { to: 'ruta6', offset: 2 }` from phase 2; add Ruta 6 and it connects.

---

## 3. Ruta 6

From the pine highlands down to the coast, in four parts:
1. A road winding through dense pines, with two grass clearings and a ledge shortcut.
2. Dry forest and the big **zacatal** meadow: the region's training spot, with a sandy track through it.
3. The river, crossed only by the bridge.
4. Dry forest going down, with a quick ledge route on the west side and sand at the bottom.

- `name: 'Ruta 6'`, `outdoor: true`, `ground: 'grass'`. Default tree style (lowland mix); `I` draws pines
  explicitly in the top part, and `t` dry trees.
- **Encounters** (rate 0.12):

  | Palabrita | Levels | w |
  |---|---|---|
  | conejito | 14–17 | 20 |
  | hojadillo | 14–17 | 20 |
  | ardillita | 14–16 | 15 |
  | colibri | 14–16 | 15 |
  | pajarito | 14–16 | 10 |
  | espinita | 15–17 | 10 |
  | ollita | 15–17 | 10 |

- **Fishing** (the river): mojarrita 12–18.
- **Item:** `itemBall('superbola_r6', 31, 44, 'superbola')`.
- **Signs:** (15, 2) «RUTA 6. Al sur: el mar.» / "ROUTE 6. South: the sea." Put an `S` tile at (15, 2):
  it's a pine in the rows, so make it the sign.

**Trainers:**

| id | Where | Kind | |
|---|---|---|---|
| `ramon` | (18, 8) up, sight 2 | Leñador Ramón | **in the way** |
| `laura` | (8, 18) right, sight 2 | Campista Laura | **in the way** |
| `esteban` | (11, 22) left, sight 2 | Vaquero Esteban | **in the way** |
| `juana` | (25, 30) left, sight 1 | Vaquera Juana | meadow, optional |
| `hugo` | (3, 35) right, sight 4 | Observador Hugo | optional |
| `mario` | (14, 40) left, sight 2 | Pescador Mario | **in the way** (the bridge) |
| `andrea` | (29, 56) left, sight 2 | Campista Andrea | |
| `tono` | (22, 63) left, sight 2 | Vaquero Toño | |

```
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII==IIIIIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIIII===============IIIII',
      'IIIIIIIIIIIIIIII===============IIIII',
      'IIIIIIIIIIIIIIIIII..........I==IIIII',
      'IIIIIIIIIIIIIIIIIII,,,,,,,,,I==IIIII',
      'IIIIIIIIIIIIIIIIIII,,,,,,,,,I==IIIII',
      'IIIIIIIIIIIIIIIIIII,,,,,,,,,I==IIIII',
      'IIIIIIIIIIIIIIIIIII,,,,,,,,,I==IIIII',
      'IIIIIIIIIIIIIIIIIIIvvvvvvvvvI==IIIII',
      'IIIIIIIII======================IIIII',
      'IIIIIIIII======================IIIII',
      'IIIIIIIII==IIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIII==I,,,,,,,,,IIIIIIIIIIIIIII',
      'IIIIIIII.==.,,,,,,,,,IIIIIIIIIIIIIII',
      'IIIIIIIII==I,,,,,,,,,IIIIIIIIIIIIIII',
      'IIIIIIIII==I,,,,,,,,,IIIIIIIIIIIIIII',
      'IIIIIIIII==IIIIIIIIIIIIIIIIIIIIIIIII',
      'IIIIIIIII==.IIIIIIIIIIIIIIIIIIIIIIII',
      'TT.......::.......................TT',
      'TT.y.....::.....................y.TT',
      'TT..zzzzz::::::::::::::::zzzzzzz..TT',
      'TT..zzzzz::::::::::::::::zzzzztz..TT',
      'TT..zzzzzzzzzzzzzzzzzzz::zzzzzzz..TT',
      'TT..zzzzzzzzzzzzzzzzzzz::zzzzzzz.tTT',
      'TT..zzzzzzzzzzzzzyyzzzz::zzzzzzz..TT',
      'TTt.zzzzyzzzzzzzzzzzzzz::zzzzzzz..TT',
      'TT..zzzzzzzzzzzzzzzzzzz::zzzzyzz..TT',
      'TT..zzzzzzzzzzzzzzzzzzz::zzzzzzz..TT',
      'TT..ztzzzzzz:::::::::::::zzzzzzz..TT',
      'TT..zzzzzzzz:::::::::::::zzzzzzz..TT',
      'TT..zzzzzzzz::zzzzzzzzzzzzzzzzzz..TT',
      'TT..zzzzzzzz::zzzzzzzzzzzzzzzzzz..TT',
      'TT....y.....::......t.......y.....TT',
      'TT..........::....................TT',
      'TT................................TT',
      'TT................................TT',
      'TT~~~~~~~~~~HH~~~~~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~HH~~~~~~~~~~~~~~~~~~~~TT',
      'TT..........::..........,,,,,,,,..TT',
      'TT..........::..........,,,,,,,,..TT',
      'TT..........::..........,,,,,,,,..TT',
      'TT..........::....................TT',
      'TT..........==TTTTTTTTTTTTTTTTTTTTTT',
      'TT..........==TTTTTTTTTTTTTTTTTTTTTT',
      'TT.,,,,,,,.T==TTTtTTTTTTTTTTTTTTTTTT',
      'TT.,,,,,,,.T==TTTTTTTTTTTTTTTTTTTTTT',
      'TT.,,,,,,,.T==TTTTTTTTTTTTTTTTTTTTTT',
      'TT.,,,,,,,.T=================TTTTTTT',
      'TT.,,,,,,,.T=================TTTTTTT',
      'TT.,,t,,,,.TTT.............==TTTTTTT',
      'TT.........TTT.,,,,,,,,,,TT==TTTTTTT',
      'TTvvvvvvvvvTTT.,,,,,,,,,,TT==.TTTTTT',
      'TT.........TTT.,,,,,,,,,,TT==TTTTTTT',
      'TT.,,,,,,,.TTT.,,,,,,,,,,TT==TTTTTTT',
      'TT.,,,,,,,.TTTTTTTTTTTTTTTT==TTTTTTT',
      'TT.,,,,,,,.TTTTTTT===========TTTTTTT',
      'TT.,,,,,,,.TTTTTTT===========TTTTTTT',
      'TT.........TTTTTTTTT==TTTTTTTTTTTTTT',
      'TTvvvvvvvvvTTTTTTTTT==.TTTTTTTTTTTTT',
      'TT......t..TTTTTTTTT==TTTTTTTTTTTTTT',
      'TT.........TTTTTTTTT==TTTTTTTTTTTTTT',
      'TTsssssssssssssJssss==TJTTTTTTTTTTTT',
      'TTssJsssssssssssssss==TTTTTTTTTTTTTT',
      'TTsssssssJssssssssss==TTTJTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTT',
```

---

## 4. Ruta 7

The coast: the sea on the west, dunes and palms, tide pools, and two rocky points with a gap at the road.
Lucas waits near the top.

- `name: 'Ruta 7'`, `outdoor: true`, `ground: 'sand'`, `border: 'T'`.
- **Encounters** (in the dune grass `z`, rate 0.12):

  | Palabrita | Levels | w |
  |---|---|---|
  | cangrejito | 15–18 | 30 |
  | coquito | 15–18 | 25 |
  | pelicanito | 16–18 | 25 |
  | pajarito | 15–17 | 10 |
  | hojadillo | 15–17 | 10 |

- **Fishing** (the sea):

  | Palabrita | Levels | w |
  |---|---|---|
  | mojarrita | 10–16 | 40 |
  | mordisquito | 14–20 | 30 |
  | cangrejito | 12–18 | 30 |

- **Trigger:** `(14..15, 6)` → `lucasRuta7` (rival #2, §9), once.

**Trainers:**

| id | Where | Kind | |
|---|---|---|---|
| `surfista1` | (13, 10) right, sight 1 | Surfista Nico | |
| `banista1` | (16, 17) left, sight 2 | Bañista Sara | **in the way** (the first rocky point) |
| `pescador_r7` | (9, 28) right, sight 3 | Pescador Chalo | |
| `surfista2` | (13, 35) right, sight 2 | Surfista Vale | **in the way** (the second point) |
| `banista2` | (20, 40) left, sight 4 | Bañista Maripaz | |
| `turista_r7` | (22, 26) down, sight 2 | Turista Jenny | |

**The bottle:** `botella` at (8, 20), object, `show: () => !flag('botellaLeida')`, script `botella` (§10.3).

```
      '~~~~~~~~TTTTTTTTTTTTTT==TTTTTTTT',
      '~~~~~~~~ssssssssssssss==ssTTTTTT',
      '~~~~~~~~ssssssssssJsss==ssTTTTTT',
      '~~~~~~~~sssJssssssssss==ssTTTTTT',
      '~~~~~~~~ssssss==========ssTTTTTT',
      '~~~~~~~~ssssss==========ssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~~~ssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~~~ssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~~~ssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==sssJssssssTTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~sszzzz==.sssssssssTTTTTT',
      '~~~~~~~~^^^^^^==^^^^^^^^^^TTTTTT',
      '~~~~~~~~^^^^^^==^^^^^^^^^^TTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssJs==szzzzzzzzsTTTTTT',
      '~~~~~~~~~~ssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~~~ssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==szzzzzzzzsTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~sszzzz==ssssssJsssTTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~sszzz.==ssssssssssTTTTTT',
      '~~~~~~~~^^^^^^==^^^^^^^^^^TTTTTT',
      '~~~~~~~~^^^^^^==^^^^^^^^^^TTTTTT',
      '~~~~~~~~sszzzz==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~sssJss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssJsTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~ssssss==ssssssssssTTTTTT',
      '~~~~~~~~sTTTTT==TTTTTTTTTTTTTTTT',
```

---

## 5. Playa Carey

A fishing village on a bay: the beach and pier on the west, the lighthouse on its rock point (north-west),
the surf school (the gym), the restaurant *El Pelícano Feliz*, Don Lalo's house.
- Roads: north (Ruta 7), south (the turtle beach), east (Ruta 8, guarded until the Medalla Ola).
- `name: 'Playa Carey'`, `outdoor: true`, `ground: 'sand'`, `roof: 'blue'`, `border: 'T'`.
- `busStop: { x: 15, y: 2, dir: 'down' }`.

**Doors:**

| At | Building | Interior | Arrive |
|---|---|---|---|
| (11, 5) | Palacentro | `centro_carey` | |
| (19, 5) | shop | `tienda_carey` | |
| (11, 17) | surf school | `gym_carey` | (5, 14) |
| (20, 16) | restaurant | `restaurante` | (5, 7) |
| (23, 7) | Don Lalo | `casa_lalo` | |
| (11, 22) | school | `escuela_carey` | |
| (24, 21) | a little house | `casa_carey2` | |

**Gates:**
- `guarda_este` (look `officer`) at `[31, 11, 'left']`, aside `[30, 12]`, road `[[31, 10]]`, back `'left'`,
  `opens: () => flag('medalOla')`.
  - Closed: «El camino al este va al volcán. ¡Es muy peligroso!» / "The road east goes to the volcano. It's
    very dangerous!" Then «Vuelve con la Medalla Ola.» / "Come back with the Wave Medal."
- `aprendiz_surf` (look `surfista`) at `[11, 18, 'down']`, aside `[12, 18]`, road `[]`,
  `opens: () => flag('arribadaDone')`.
  - Closed: «¡Marina no está! Está en la Playa de las Tortugas. ¡Esta noche es la arribada!» / "Marina isn't
    here! She's at Turtle Beach. Tonight is the arribada!"

**People:**

| id | Where | Notes |
|---|---|---|
| `cobrador_carey` | (16, 2) facing down | the bus |
| `pescadora_muelle` | (3, 12) facing right | on the pier: «¿Ves esas pangas? Salen al mar a las cuatro de la mañana.» / "See those boats? They go out to sea at four in the morning." |
| `farero` | (5, 5) facing down | the lighthouse keeper: «El faro guía a los barcos de noche. ¡Y a las tortugas también!» / "The lighthouse guides the ships at night. And the turtles too!" |
| `panga1` (3, 15), `panga2` (4, 9) | objects on water | |
| `surfista_pueblo` | (7, 19) facing right | «¡Las olas de aquí son perfectas para aprender a surfear!» / "The waves here are perfect for learning to surf!" |
| `nina_carey` | (18, 9) facing down | «¿Sabías que las tortugas vuelven a la playa donde nacieron?» / "Did you know turtles come back to the beach where they were born?" |

**Signs:**
- (13, 9): «PLAYA CAREY. Pescado fresco, olas y tortugas.» / "PLAYA CAREY. Fresh fish, waves and turtles."
- (22, 12): «EL PELÍCANO FELIZ. ¡La mejor sopa de pescado de la costa!» / "THE HAPPY PELICAN. The best fish
  soup on the coast!"
- (16, 1): «PARADA DE BUS» / "BUS STOP"

```
      '^^^^^^^~sTTTTT==TTTTTTTTTTTTTTTT',
      '^^AA^^^ss.....==S.........TTTTTT',
      '^^AA^^^ssooooo==.rrrr.....TTTTTT',
      '^^AA^^^ssooooo==.rrrr.....TTTTTT',
      '^^^^ssssshwcwh==.hwMh.rrrrTTTTTT',
      '^^^^ssssshwdwh==.hwdh.rrrrTTTTTT',
      '~~~~~~~ss.....==......hwwhTTTTTT',
      '~~~~~~~sJ.....==......hdwhTTTTTT',
      '~~~~~~~ss.....==..........TTTTTT',
      '~~~~~~~ss....S==........J.TTTTTT',
      '~~~~~~~ss=======================',
      '~~~~~~~ss=======================',
      '~HHHHHHHs.....==......S...TTTTTT',
      '~HHHHHHHs....J==.rrrrrrr..TTTTTT',
      '~~~~~~~ssppppp==.rrrrrrr..TTTTTT',
      '~~~~~~~ssppppp==.hwwwwwh..TTTTTT',
      '~~~~~~~sJhwGwh==.hwwdwwh..TTTTTT',
      '~~~~~~~sshhdhh==..........TTTTTT',
      '~~~~~~~ss.....==.......rrrTTTTTT',
      '~~~~~~~ssrrrr.==.......rrrTTTTTT',
      '~~~~~~~ssrrrr.==.......hwhTTTTTT',
      '~~~~~~~sJhwwh.==.......hdhTTTTTT',
      '~~~~~~~sshwdh.========....TTTTTT',
      '~~~~~~~ss.....========....TTTTTT',
      '~~~~~~~sssssss==....==TTTTTTTTTT',
      '~~~~~~~TTTTTTTTTTTTT==TTTTTTTTTT',
```

### Interiors

`centro_carey`, `tienda_carey` and `escuela_carey` use the helpers (`centro`, `tienda`, `escuela`: make
`escuela(id, exit, teacherLook)` from Villa Ocote's school in phase 2). The topic of the day alternates
`direcciones` / `ira`; the teacher is Profesora Mayra (look `lady`).

`casa_lalo` is `HOUSE`, with `lalo` at (2, 1) facing down (quest §10.2).

`casa_carey2` is `HOUSE`, with an old woman: «Mi abuelo pescaba tiburones en el lago. ¡Tiburones en agua
dulce!» / "My grandfather fished sharks in the lake. Sharks in fresh water!"

`restaurante` (12×9, floor `_`), exit `{ to: 'carey', x: 20, y: 17 }`, mat at (5, 8). The cook stands
behind the counter; you talk to him across it from (3, 3).

```
      '############',
      '++++++++++++',
      'CCCCCC++++++',
      '++++++++++++',
      '+kk++kk++kk+',
      '++++++++++++',
      '+kk++++++kk+',
      '++++++++++++',
      '+++++m++++++',
```

**People:**
- `cocinero` (3, 1) facing down (look `baker`).
- `dueno_restaurante` (9, 1) facing down (look `man`).
- `mesa1` (1, 5), `mesa2` (5, 5) and `mesa3` (9, 5), all facing up: the guests, quest §10.1.

---

## 6. Playa de las Tortugas (day and night)

A turtle reserve: dunes with grass, palms, the volunteers' hut, the nesting beach, and the sea along the
bottom.
- `name: 'Playa de las Tortugas'`, `outdoor: true`, `ground: 'sand'`.
- **Encounters** (rate 0.12): cangrejito 16–19 (w 40), coquito 16–19 (35), pelicanito 17–19 (25).
- **Fishing:** like Ruta 7's.
- **Door:** (16, 6) → `cabana_tortugas` (`HOUSE`; a second volunteer and a chart of turtle nests on the wall
  `u` with «Tortuga paslama: pone unos cien huevos.» / "Olive ridley turtle: lays about a hundred eggs.").

**People (day):**
- `voluntaria` (18, 8) facing down: the arribada starts here (§8).
- A sign at (19, 7): «RESERVA DE TORTUGAS. No toques los nidos.» / "TURTLE RESERVE. Don't touch the nests."

**The night version**, `tortugas_noche`: `night('tortugas', 'tortugas_noche', {...})` (phase 1 §10). The
same rows; no wild encounters. Its people are in §8.

```
      'TTTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTT',
      'TTssssssssssssssssssss==ssssssssTT',
      'TTszzzzzzzzzzsrrrrssss==sszzzzzzTT',
      'TTszzzzzzzzzzsrrrrssss==sszzzzzzTT',
      'TTszzzzzzzzzzshwwhssss==sszzzzzzTT',
      'TTszzzzzzzzzzshwdhssss==sszzzzzzTT',
      'TTszzzzzzzzzzssssssSsssssszzzzzzTT',
      'TTsssssssssssssssssssssssszzzzzzTT',
      'TTJssssssssssJssssssssssssssssssTT',
      'TTssssssssssssssssssJsssssssssssTT',
      'TTsssssJssssssssssssssssssssJsssTT',
      'TTssssssssssssssssssssssssssssssTT',
      'TTsssssssssssssssssssssssssssssJTT',
      'TTsJssssssssssssssssssssssssssssTT',
      'TTssssssssssssssssssssssssssssssTT',
      'TTssssssssssssssssssssssssssssssTT',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
```

---

## 7. Trainers

Route trainers get `rematch: true`. `defenseMode: 'listen'` for the region (the A2 listening level).

```ts
ramon: { id: 'ramon', name: 'Leñador Ramón', defenseMode: 'listen', rematch: true, team: [['ardillita', 15], ['colibri', 15]] },
laura: { id: 'laura', name: 'Campista Laura', defenseMode: 'listen', rematch: true, team: [['espinita', 15], ['ardillita', 16]] },
esteban: { id: 'esteban', name: 'Vaquero Esteban', defenseMode: 'listen', rematch: true, team: [['conejito', 16], ['hojadillo', 16]] },
juana: { id: 'juana', name: 'Vaquera Juana', defenseMode: 'listen', rematch: true, team: [['liebron', 18]] },
hugo: { id: 'hugo', name: 'Observador Hugo', defenseMode: 'listen', rematch: true, team: [['pajarito', 16], ['colibri', 17], ['palomon', 17]] },
mario: { id: 'mario', name: 'Pescador Mario', defenseMode: 'listen', rematch: true, team: [['mojarrita', 16], ['mojarrita', 17], ['mojarrita', 17]] },
andrea: { id: 'andrea', name: 'Campista Andrea', defenseMode: 'listen', rematch: true, team: [['ollita', 17], ['espinita', 18]] },
tono: { id: 'tono', name: 'Vaquero Toño', defenseMode: 'listen', rematch: true, team: [['liebron', 18], ['hojadillo', 18]] },
surfista1: { id: 'surfista1', name: 'Surfista Nico', defenseMode: 'listen', rematch: true, team: [['cangrejito', 18], ['pelicanito', 18]] },
banista1: { id: 'banista1', name: 'Bañista Sara', defenseMode: 'listen', rematch: true, team: [['coquito', 18], ['cangrejito', 18]] },
pescador_r7: { id: 'pescador_r7', name: 'Pescador Chalo', defenseMode: 'listen', rematch: true, team: [['mojarrita', 17], ['mordisquito', 18]] },
surfista2: { id: 'surfista2', name: 'Surfista Vale', defenseMode: 'listen', rematch: true, team: [['pelicanito', 19], ['mordisquito', 19]] },
banista2: { id: 'banista2', name: 'Bañista Maripaz', defenseMode: 'listen', rematch: true, team: [['coquito', 19], ['cangrejito', 19]] },
turista_r7: { id: 'turista_r7', name: 'Turista Jenny', defenseMode: 'choose', rematch: true, team: [['pelicanito', 19], ['coquito', 19]] },
silencioso8: { id: 'silencioso8', name: 'Silencioso', defenseMode: 'listen', team: [['cangrejito', 18], ['ecolin', 19]] },
silencioso9: { id: 'silencioso9', name: 'Silenciosa', defenseMode: 'listen', team: [['ochopatas', 19], ['piedrita', 19]] },
silencioso10: { id: 'silencioso10', name: 'Silencioso', defenseMode: 'listen', team: [['ecolin', 19], ['ollita', 20]] },
callada: { id: 'callada', name: 'Callada', defenseMode: 'listen', team: [['ochopatas', 21], ['ecolin', 21], ['petroglifon', 22]] },
surfista_gym: { id: 'surfista_gym', name: 'Surfista Kike', defenseMode: 'type', team: [['cangrejito', 20], ['mordisquito', 21]] },
salvavidas: { id: 'salvavidas', name: 'Salvavidas Fer', defenseMode: 'type', team: [['pelicanito', 21], ['cangrejito', 21]] },
banista_gym: { id: 'banista_gym', name: 'Bañista Tere', defenseMode: 'type', team: [['coquito', 21], ['pelicanito', 22]] },
marina: { id: 'marina', name: 'Líder Marina', defenseMode: 'type', team: [['cangrejon', 22], ['maleticano', 23], ['mordiscon', 25]] },
lucas2: { id: 'lucas2', name: 'Lucas', defenseMode: 'type', team: [['<counter starter, 2nd form>', 22], ['hojadillo', 19], ['palomon', 20]] },
```

Lines (each `[es, en]`):

| id | intro | defeated | after |
|---|---|---|---|
| ramon | «¡Hola! Bajo a la costa a vender leña. ¿Luchamos en el camino?» / "Hi! I'm going down to the coast to sell firewood. A battle on the way?" | «¡Me cortaste como a un pino!» / "You chopped me down like a pine!" | «Abajo hace mucho calor. ¡Lleva agua!» / "It's very hot down there. Bring water!" |
| laura | «¿Vas al mar? ¡Yo también! Pero primero, una batalla.» / "Going to the sea? Me too! But first, a battle." | «¡Ay! Mejor sigo caminando.» / "Oh! I'd better keep walking." | «En el zacatal hay muchas Palabritas. ¡Es perfecto para entrenar!» / "There are lots of Palabritas in the meadow. It's perfect for training!" |
| esteban | «¡Yija! Soy sabanero. Cuido el ganado en el llano. ¡A luchar!» / "Yee-haw! I'm a cowboy. I look after the cattle on the plain. Let's battle!" | «¡Me tumbaste del caballo!» / "You knocked me off my horse!" | «El zacatal está seco ahora. En mayo empiezan las lluvias.» / "The meadow is dry now. The rains start in May." |
| juana | «¿Buscas un reto? ¡Mi Liebrón es el más rápido del llano!» / "Looking for a challenge? My Liebrón is the fastest on the plain!" | «¡Más rápid{o/a} que una liebre!» / "Faster than a hare!" | «Cuando hace calor, descanso debajo de un árbol.» / "When it's hot, I rest under a tree." |
| hugo | «¡Shh! Estoy mirando pájaros. ¡Bueno, una batalla rápida!» / "Shh! I'm watching birds. Well, a quick battle!" | «Se fueron todos los pájaros...» / "All the birds flew away..." | «Hoy vi tres colibríes y un guardabarranco. ¡Qué día!» / "Today I saw three hummingbirds and a guardabarranco. What a day!" |
| mario | «Nadie cruza el puente sin luchar con Mario el pescador.» / "Nobody crosses the bridge without battling Mario the fisherman." | «Bueno, cruza. ¡Pero cuidado con el río!» / "OK, cross. But careful with the river!" | «Con una caña de pescar, en este río sacas mojarras todo el día.» / "With a fishing rod, you catch mojarras in this river all day." |
| andrea | «¡Ya casi llego al mar! ¿Luchamos antes?» / "I'm almost at the sea! Shall we battle first?" | «¡Uf! Necesito un coco.» / "Phew! I need a coconut." | «Abajo hay palmeras. ¡Eso quiere decir que el mar está cerca!» / "There are palm trees down there. That means the sea is close!" |
| tono | «¿Ves mis vacas? Bueno, no importa. ¡A luchar!» / "See my cows? Well, never mind. Let's battle!" | «¡Ni mis vacas corren tan rápido!» / "Not even my cows run that fast!" | «La costa está a cinco minutos. ¡Huele a mar!» / "The coast is five minutes away. It smells like the sea!" |
| surfista1 | «¡Hey! ¿Viste esas olas? ¡Están perfectas! Primero, una batalla.» / "Hey! Did you see those waves? They're perfect! First, a battle." | «¡Me revolcó la ola!» / "The wave tumbled me!" | «Para surfear hay que tener paciencia y equilibrio.» / "To surf you need patience and balance." |
| banista1 | «¡No pasas por estas rocas sin luchar conmigo!» / "You don't get past these rocks without battling me!" | «¡Ay, se me mojó la toalla!» / "Oh, my towel got wet!" | «Ponte bloqueador. ¡El sol de aquí quema mucho!» / "Put on sunscreen. The sun here burns a lot!" |
| pescador_r7 | «Hoy no pica nada. ¡Mejor una batalla!» / "Nothing's biting today. A battle is better!" | «Ni los peces ni las batallas...» / "Neither the fish nor the battles..." | «Don Lalo, en Playa Carey, regala cañas a los buenos estudiantes.» / "Don Lalo, in Playa Carey, gives rods to good students." |
| surfista2 | «¡Esta playa es mía! Bueno... de todos. Pero ¡lucha!» / "This beach is mine! Well... everyone's. But battle!" | «¡Wipeout total!» / "Total wipeout!" | «Marina es la mejor surfista del Pacífico. ¡Y la mejor líder!» / "Marina is the best surfer on the Pacific. And the best leader!" |
| banista2 | «¿Quieres un agua de coco? ¡Primero gáname!» / "Want some coconut water? Beat me first!" | «Toma, te la ganaste.» / "Here, you earned it." | «El agua de coco es dulce y fresca. ¡Me encanta!» / "Coconut water is sweet and fresh. I love it!" |
| turista_r7 | «Hello! Bueno... ¡Hola! Estoy de vacaciones. ¿Luchamos?» / "Hello! Well... Hi! I'm on vacation. Shall we battle?" | «¡Tu español es mejor que el mío!» / "Your Spanish is better than mine!" | «Mañana voy a ver las tortugas. ¡Qué emoción!» / "Tomorrow I'm going to see the turtles. How exciting!" |
| surfista_gym | «¡Bienvenid{o/a} a la escuela de surf! ¿Sabes nadar?» / "Welcome to the surf school! Can you swim?" | «¡Me caí de la tabla!» / "I fell off the board!" | «Si la corriente te lleva mal, vuelves al principio. ¡Mira bien las flechas!» / "If a current takes you the wrong way, you go back to the start. Watch the arrows!" |
| salvavidas | «Soy salvavidas. ¡Cuido a todos en la playa!» / "I'm a lifeguard. I look after everyone on the beach!" | «¡Necesito un salvavidas!» / "I need a life jacket!" | «Marina salvó a tres turistas el año pasado.» / "Marina saved three tourists last year." |
| banista_gym | «Marina está justo ahí. ¡Pero primero yo!» / "Marina is right there. But me first!" | «¡Vas a ganarle, ya verás!» / "You're going to beat her, you'll see!" | «Las Palabritas de Marina son de tipo Agua. ¡Usa plantas o electricidad!» / "Marina's Palabritas are Water type. Use plants or electricity!" |

---

## 8. The story: la noche de la arribada

**Flags:** `arribadaHablada`, `noche`, `huevosContados`, `beat:silencioso8..10`, `beat:callada`,
`tortuguitasAlMar`, `arribadaDone`, `medalOla`.

**1. Day, the volunteer** (`voluntaria` on the turtle beach):
- «¡Hola! Soy Tania, voluntaria de la reserva. Esta noche es la arribada: ¡miles de tortugas van a salir del
  mar para poner sus huevos!» / "Hi! I'm Tania, a volunteer at the reserve. Tonight is the arribada:
  thousands of turtles are going to come out of the sea to lay their eggs!"
- «Marina también va a ayudar. Pero dicen que unos Silenciosos quieren robar los huevos...» / "Marina is
  going to help too. But they say some Silenciosos want to steal the eggs..."
- `ask('¿Quieres esperar aquí hasta la noche?')`. Yes: fade out, «Esa noche...» / "That night...", then
  warp to `tortugas_noche` at the same spot. Set `noche`.

**2. Night: people and nests** on `tortugas_noche`:
- `voluntaria` (18, 8) and `marina` (21, 12).
- Nests `nido1..3` (objects) at (8, 14), (15, 15) and (26, 14).
- Grunts:
  - `silencioso8` at (7, 15), facing right, sight 2;
  - `silencioso9` at (14, 13), facing down, sight 2;
  - `silencioso10` at (27, 15), facing left, sight 2.
- `callada` at (20, 15), facing up.
- Hatchlings `tortuguita1..4` (objects) at (8, 16), (9, 16), (15, 16) and (16, 16), hidden until the end.

**3. Counting eggs** (Tania, the first time at night):
- «¡Ayúdame a contar los huevos! Yo los cuento y tú escribes el número.» / "Help me count the eggs! I count
  them and you write the number."
- 3 listening challenges: she *says* «Hay ochenta y cinco huevos», «sesenta y dos» and «cien».
- You write the number. Accept digits or words: there's a helper `digitsToWords` in lang/numbers.ts.
- Uses items from the `numeros` theme where they exist (the core has numbers to 100?). Otherwise ad-hoc
  items.
- Set `huevosContados`. Then: «¡Mira! ¡Allá! Unos Silenciosos están sacando huevos de los nidos!» / "Look!
  Over there! Some Silenciosos are taking eggs from the nests!"

**4. The grunts** (they spot you):
- silencioso8: «¡Shhh! Estos huevos valen mucho dinero.» / "Shhh! These eggs are worth a lot of money."
- silencioso9: «Las tortugas no necesitan tantos huevos. ¡Shhh!» / "Turtles don't need so many eggs.
  Shhh!"
- silencioso10: «¡Callada nos va a castigar si perdemos!» / "Callada is going to punish us if we lose!"

**5. Callada** (talk to her, after all 3 grunts):
- «...Habla más bajo. Aquí todo es demasiado ruidoso. Las olas. Los turistas. Las tortugas.» / "...Speak
  more quietly. Everything here is too noisy. The waves. The tourists. The turtles."
- «Con el dinero de los huevos, Don Sigilo va a comprar silencio para todo el país.» / "With the money from
  the eggs, Don Sigilo is going to buy silence for the whole country."
- The battle. Defeated: «...Bien. Pero el volcán no hace ruido para siempre. Ya verás.» / "...Fine. But the
  volcano doesn't stay noisy forever. You'll see." (This teases phase 4.)
- She and the grunts leave (`walkNpc` off-screen), then hide.

**6. The hatchlings:**
1. Marina: «¡Están naciendo! Tenemos que ayudarlas a llegar al mar. ¡Guíalas!» / "They're hatching! We have
   to help them reach the sea. Guide them!"
2. The hatchlings appear.
3. A speaking challenge: «¡Diles algo para animarlas!» / "Say something to encourage them!" Use
   `adHocItem(['¡Al mar!', '¡Por aquí!', '¡Vamos, tortuguitas!', '¡Vamos!'], 'To the sea! / This way! / Come on!')`.
4. Then `walkNpc` each hatchling down into the sea, one after the other, and hide them.
5. Set `tortuguitasAlMar`.

**7. The end of the night:**
1. Tania: «¡Lo lograste! Toma, esta tortuguita no quiere separarse de ti.» / "You did it! Here, this little
   turtle doesn't want to leave you."
2. `giveMon('paslamita', 18)`, then «¡{name} recibió a Paslamita!»
3. Marina: «Gracias por cuidar a las tortugas. Mañana te espero en la escuela de surf. ¡Prepárate!» /
   "Thanks for looking after the turtles. Tomorrow I'll wait for you at the surf school. Get ready!"
4. Fade out, then «A la mañana siguiente...» / "The next morning..."
5. Warp to Playa Carey (14, 21) facing up. Set `arribadaDone`: the gym gate opens.

---

## 9. The rival: Lucas, battle #2

- **`lucasRuta7`** (the trigger near the top of Ruta 7, once, flag `lucas2`).
- Lucas walks up from the south along the road.
- «¡{name}! ¿Ya tienes la Medalla Barro? ¡Yo también!» / "{name}! You have the Clay Medal already? Me too!"
- «Mi Palabrita evolucionó. ¡Mira qué fuerte está!» / "My Palabrita evolved. Look how strong it is!"
- The battle (`lucas2`).
  - Defeated: «¡No puede ser! ¿Cuántas palabras sabes?» / "It can't be! How many words do you know?"
  - After: «Voy a entrenar con las olas. ¡Nos vemos en el volcán!» / "I'm going to train with the waves.
    See you at the volcano!"
- He walks off south.

---

## 10. Side quests

### 10.1 El Pelícano Feliz: the waiter (flags `mesero1..3`; save `restauranteDia`)

1. **The owner:**
   - «¡Ay, mi mesero está enfermo! ¿Me ayudas? Tomas los pedidos de las mesas y se los dices al cocinero.» /
     "Oh, my waiter is sick! Will you help me? You take the tables' orders and tell the cook."
   - `ask`. Yes starts round 1.
2. **Each round:**
   1. Talk to the guest at the round's table. They *say* their order: `speak()` at normal speed, with a
      🔊 replay button.
   2. Go to the cook (across the counter) and say or write the order.
   3. **Grading:** a new helper `gradeDish(answer, required: string[])` in lang/order.ts. The answer must
      contain every required phrase. Accents, case, «un/una» and «por favor» don't matter.
   4. Right: the cook answers «¡Saliendo!» / "Coming right up!", and the guest thanks you. Wrong: «¿Qué
      pidió? No entiendo.» / "What did they order? I don't understand." Then listen to the guest again.

   | Round | Guest says | Required |
   |---|---|---|
   | 1 (table 1) | «Quisiera una sopa de pescado, por favor.» | `['sopa de pescado']` |
   | 2 (table 2) | «Para mí, pescado frito con arroz. Y para tomar, un refresco de naranja.» | `['pescado frito', 'arroz', 'refresco de naranja']` |
   | 3 (table 3) | «Para mí, gallo pinto con queso. Para mi hija, un jugo de mango. ¡Y la cuenta, por favor!» | `['gallo pinto', 'queso', 'jugo de mango']` |

3. **Rewards:**
   - The first time: $200, $300 and $500 per round, plus 2 Superpociones after round 3.
   - After that: once a day (`restauranteDia = today()`), all three rounds again for $150 each, with the
     guests' orders shuffled from a list of 6. Write 3 more orders in the same style.

### 10.2 La caña de pescar (flags `lalo`, `cana`)

1. **Don Lalo:**
   - «¡Hola! ¿Conoces a mi hermano? Vive en Pueblo Amanecer, al lado del lago.» / "Hi! Do you know my brother?
     He lives in Pueblo Amanecer, by the lake."
   - `ask`. Yes: «¡Él me enseñó a pescar!» / "He taught me to fish!" No: «Bueno, ¡ahora ya sabes que existe!»
     / "Well, now you know he exists!"
2. **A fishing lesson:** «¿Quieres aprender a pescar? Te hago cuatro preguntas.» / "Want to learn to fish?
   I'll ask you four questions."
   - 4 challenges with items from the `pesca` theme: la caña de pescar, el anzuelo, la carnada, picar.
   - Choose mode for unseen items, type for seen ones (like the starter training: use `drill`).
3. **The rod:**
   - «¡Muy bien! Toma esta caña. Prueba en el muelle o en cualquier río.» / "Very good! Take this rod. Try it
     on the pier or in any river."
   - `addItem('cana')` and set `cana`.
   - Then: «¡Y saluda a mi hermano de mi parte!» / "And say hi to my brother for me!"
4. **The brother** (the Amanecer fisherman) afterwards: «¿Viste a mi hermano Lalo? ¡Le encanta pescar más que
   a mí!» / "Did you see my brother Lalo? He loves fishing even more than me!"

### 10.3 Mensaje en una botella (flags `botellaLeida`, `item:tesoro_carey`)

1. **The bottle on Ruta 7:**
   - «Hay una botella en la arena. Adentro hay un papel...» / "There's a bottle in the sand. Inside there's a
     paper..."
   - Then the note (shown, and spoken with 🔊): «El tesoro está en Playa Carey, en la playa, al sur del
     muelle, al lado de la palmera.» / "The treasure is in Playa Carey, on the beach, south of the pier, next
     to the palm tree."
2. **A reading question:** `chooseText` «¿Dónde está el tesoro?»
   - «Al sur del muelle, al lado de la palmera» (right)
   - «En el faro»
   - «En el restaurante»
3. Right sets `botellaLeida` and hides the bottle.
4. **The treasure** in Playa Carey: `itemBall('tesoro_carey', 7, 16, 'revivir')` with the object `brillo`
   (a sparkle) and `show: () => flag('botellaLeida') && !flag('item:tesoro_carey')`.
   - Its script also gives 2 Superbolas: «¡Encontraste un tesoro! Un Revivir y dos Superbolas.»

---

## 11. Gym 3: Escuela de Surf (`gym_carey`)

A pool crossed on currents (phase 1 §14).
- **The route:** dock → current up → platform A → current right → platform C → current up → Marina's
  platform.
- **The wrong turns:** the current right from C, or the current left from A, sends you back to the dock.
- **The way out:** from Marina's platform, the current down the west side leads back to the dock.

The arrows are `8` up, `2` down, `4` left, `6` right.

```
      '############',
      'P++++++++++P',
      '++++++++++++',
      '2~~~~~~~~8~~',
      '2~~~~~~~~8~~',
      '2+++~~~~~8~~',
      '2+++6662~8~~',
      '2~8~~~~2~8~~',
      '2+++666+++2~',
      '2+++~~~+++2~',
      '2~8~~~~~~~2~',
      '2~8~~~~~~~2~',
      '2~8~~~~~~~2~',
      '2~8~~~~~~~2~',
      '++++++++++++',
      '+++++mm+++++',
```

- `outdoor: false`, `name: 'Gimnasio Ola'`, `floor: '+'`, `exit: { to: 'carey', x: 11, y: 18 }`.
- **People:**

  | id | Where | Notes |
  |---|---|---|
  | `marina` | (5, 1) facing down | |
  | `surfista_gym` | (3, 9) on platform A, facing left, sight 2 | |
  | `salvavidas` | (8, 9) on platform C, facing up, sight 1 | |
  | `banista_gym` | (9, 1) on the top platform, facing down, sight 1 | |
  | `guia_carey` | (7, 14) facing left | «¡Las corrientes te llevan solas! Mira bien las flechas antes de saltar.» / "The currents carry you by themselves! Look at the arrows carefully before you jump." Then: «Marina usa Palabritas de tipo Agua. Las plantas y la electricidad son muy eficaces.» / "Marina uses Water types. Plants and electricity are super effective." |

**Marina** (script `marina`):
- **Intro:**
  - «¡Llegaste! Anoche fuiste muy valiente con las tortugas.» / "You made it! Last night you were very brave
    with the turtles."
  - «Pero en el agua, ¡yo soy la reina! Vas a ver: te voy a ganar.» / "But in the water, I'm the queen! You'll
    see: I'm going to beat you."
  - `ask('¿Estás list{o/a}?')`.
- **The battle** (`marina`). Defeated: «¡Me revolcó la ola! Bueno... la ola eras tú.» / "The wave knocked me
  over! Well... the wave was you."
- **After:**
  1. Set `beat:marina` and `medalOla`, add `'Ola'` to medals, `sfx('badge')`.
  2. «¡{name} recibió la Medalla Ola!»
  3. «Con esta medalla puedes ir al este, hacia el volcán. Dicen que en Ciudad Chispa preparan una gran
     fiesta.» / "With this medal you can go east, toward the volcano. They say Ciudad Chispa is preparing a
     big festival."
  4. Remove phase 2's temporary "end of part two" message.

---

## 12. People of Playa Carey (more lines)

- **The Palacentro nurse:** the usual.
- **The shop:** `SHOPS.tienda_carey`.
- **The school teacher** (Profesora Mayra): the lesson menu. Her topic of the day alternates `direcciones` /
  `ira`.
- **After `arribadaDone`:**
  - `nina_carey`: «¡Vi las tortuguitas en la tele! ¡Dicen que tú las ayudaste!» / "I saw the little turtles
    on TV! They say you helped them!"
  - `pescadora_muelle`: «Gracias por cuidar la playa. Sin tortugas, el mar no es el mismo.» / "Thanks for
    looking after the beach. Without turtles, the sea isn't the same."

---

## 13. Palabritas and content

- **Palabritas:** Cangrejito/Cangrejón, Coquito/Cocotero, Mordisquito (the user's art)/Mordiscón,
  Mojarrita, Pelicanito/Maletícano, Paslamita/Paslamona ([palabritas.md](palabritas.md) §3).
- **Themes:** playa, frutas, mar, pesca, viaje, familia.
- **Topics:** direcciones, ira, restaurante ([content.md](content.md)).

## 14. Tests

| Test | What it checks |
|---|---|
| `region3.test` | Ocote's south gate with the medal → Ruta 6 → the bridge (Mario) → Ruta 7 (Lucas #2) → Playa Carey (the gym gate blocks) → the turtle beach: night → count eggs → 3 grunts + Callada → the hatchlings → Paslamita level 18 → Carey (the gate opens) → the gym: the currents to Marina, the battle, `medalOla` → the east guard lets you pass. |
| `quests3.test` | The restaurant: 3 rounds, right and wrong answers; the second time is the same day, so it's closed. The fishing rod: Lalo's lesson, then fishing on the pier starts a battle. The bottle: the reading question, then the treasure appears and gives a Revivir + 2 Superbolas. |
| `currents` | the gym's routes: from the dock to Marina, and both traps lead back to the dock. |
| `maps.test`, `data.test` | stay green. |

## 15. Done when

- All of the above is in, `npm test` is green, and the art page shows the new tiles, objects, looks and
  Palabritas, plus the night beach.
- ROADMAP.md: phase 3 is marked ✓.
- Every commit is pushed.

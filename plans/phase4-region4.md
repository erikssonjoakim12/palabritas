# Phase 4 — Region 4: volcanoes and dry forest (Playa Carey → Ciudad Chispa, gym 4)

**Goal:** you can play from the Medalla Ola to the **Medalla Chispa**.

**The route:**
1. East on Ruta 8, through hot dry forest, past a lagoon, a farm and sugarcane fields.
2. Into Ciudad Chispa, a colonial town preparing its big festival. But Equipo Silencio has stolen every
   firework.
3. Up the Volcán Chocoyo (the slopes, the lava tube, the crater) to beat Don Sigilo.
4. Festival night.
5. Don Tizón's fireworks workshop.
6. Ruta 9 leads home: you jump down the ledge into Pueblo Amanecer.
7. Side quests: a hammock for Mom, the lost parakeet chick, the haunted house, the Torovenado costumes, and
   the legend of the Carreta Nagua.

**Updated 2026-10-19** for what changed while regions 2 and 3 were built (the user's decisions are marked):
- **Files:** maps go in a new `src/world/maps/region4.ts` (add it in `maps/index.ts`); scripts in a new
  `src/world/region4.ts` (registered like `REGION3`); trainers in `src/data/trainers.ts`.
- **The bus is paused**, so Ciudad Chispa has no bus stop or bus driver.
- **Sugarcane is `|`**: `Z` is the mine ladder now.
- **Levels (user):** wild Palabritas 15–25 and trainers 18–26 (gym trainers too); Lucas 28, Don Sigilo 27–29 and
  Don Tizón 28·29·31 stay. Nothing in regions 1–3 is above these (checked).
- **Lucas #3 (user):** at the volcano's ranger station, after you can rest, not right after the rangers' battles (§10).
- **Day and night (user):** the clock only changes looks. The festival is still a story night scene. Lit torches
  and the festival get warm light like the windows (`art/lights.ts`).
- **Rematches:** 1–2 trainers per route (the user's rule): Ruta 8 has 2, the volcano 1, Ruta 9 1.
- **Tests:** only what's needed (the user's rule): one checkpoint test for the story, one for the quests.

**Read first:** CLAUDE.md · PLAN_GYMS_2-4.md §4 · src/world/region3.ts (how a region's story is built) ·
[palabritas.md](palabritas.md) §1 · [content.md](content.md) §1 and §2.

**Work in this order:**
1. Tiles and looks (§1).
2. Maps (§2–§7); `npm test -- maps` after each.
3. Palabritas, themes and topics (§14).
4. Trainers (§8).
5. The story (§9–§10).
6. Quests (§11).
7. The gym (§12).
8. Tests (§15).

The maps below are drawn and checked (reachability, trainers "in the way", seams, and the join with Pueblo
Amanecer's plateau).

---

## 1. Tiles, objects and looks

| What | Notes |
|---|---|
| `i` ash | Gray ground with darker grains. |
| `j` lava | Glowing orange with dark crust (2 frames if tiles animate). Solid. |
| `X` steam vent | A crack with white steam. Solid. |
| `|` sugarcane | Tall green stalks, `kind: 'tallgrass'`. (`Z` is the mine ladder.) |
| `l` cobblestone | Rounded gray stones. |
| `q` church roof | White or cream, joining like roofs. |
| `N` bell tower | White with a bell in an arch. |
| style `rock: 'basalt'` | `^` and `O` in black volcanic rock: the slopes and the crater. |
| style `cave: 'basalt'` | The lava tube. |
| style `trees: 'dry'` | Ruta 8 and Ciudad Chispa: mostly dry trees. |

**Objects:**

| Object | Looks like |
|---|---|
| `vaca` | a cow |
| `cajaCohetes` | a crate of fireworks |
| `chocoyitoBebe` | a tiny green chick |
| `antorchaRoja`, `antorchaAzul`, `antorchaVerde`, `antorchaAmarilla` | torches; each has an unlit and a lit image (lit ones give light like windows: `art/lights.ts`) |
| `puertaTaller` | a heavy wooden door |
| `lampara` | an old oil lamp with a ghostly face |
| `hamaca` | a striped hammock |
| `hamaquita` | the hammock with a face, asleep |

**Looks:**

| Look | Head | Body | Color | Who |
|---|---|---|---|---|
| `campesino` | `cowboy` | pants | `green` | farmer, trainer kind |
| `ciclista` | `cap` | pants | `yellow` | cyclist, trainer kind |
| `cortador` | `bandana` (new: a cloth tied over the hair) | pants | `brown` | sugarcane cutter, trainer kind |
| `guardaparque` | `safari` | pants | `green` | park ranger, trainer kind |
| `vulcanologo` | `helmet` | coat | `orange` | volcanologist, trainer kind |
| `polvorero` | `bandana` | pants | `red` | fireworks maker |
| `tizon` | `crew` | coat | `red` | the gym leader, the fireworks master |
| `sigilo` | `crew` | coat | `black` | Don Sigilo, Equipo Silencio's boss (the dark coat as for the Capataz) |

---

## 2. Where the new maps sit

| Map | Size | World top-left | Connections |
|---|---|---|---|
| `ruta8` | 44×32 | (-120, -20) | `left: { to: 'carey', offset: -2 }`, `right: { to: 'chispa', offset: -6 }` |
| `chispa` | 36×30 | (-76, -14) | `left: { to: 'ruta8', offset: 6 }`, `right: { to: 'ruta9', offset: -6 }`, `up: { to: 'laderas', offset: -4 }` |
| `ruta9` | 40×24 | (-40, -8) | `left: { to: 'chispa', offset: 6 }`, `right: { to: 'amanecer', offset: -8 }` |
| `laderas` | 30×34 | (-72, -48) | `down: { to: 'chispa', offset: 4 }` |
| `amanecer` (existing) | | | add `left: { to: 'ruta9', offset: 8 }` |

Add `right: { to: 'ruta8', offset: 2 }` to Playa Carey (its east road is rows 10–11). Its east gate then opens
with just `flag('medalOla')` (drop the `!!MAPS.ruta8` check). Checked again on 2026-10-19: Carey's east edge is
at world x −120 and Pueblo Amanecer's west edge at 0, so Ruta 8 + Ciudad Chispa + Ruta 9 (44 + 36 + 40 = 120)
still fit exactly, and nothing overlaps.

**The loop closes:** Pueblo Amanecer's west plateau joins Ruta 9. The plateau's ledge means you can come
home that way but not leave by it, as in Gold/Silver. From now on, every outdoor map is connected, so the
art page's World view shows the whole country.

The lava tube (`tubo`), the crater (`crater`) and the interiors are door-linked.

---

## 3. Ruta 8

- `name: 'Ruta 8'`, `outdoor: true`, `ground: 'grass'`, `style: { trees: 'dry' }`.
- **The lagoon:** fish from the pier.
- **The farm:** fenced, with cows (objects `vaca1`, `vaca2`: «¡Muuu!»). The farmer is a trainer by the road.
- **The sugarcane fields** (`|`): the training spot, reached only through the opening at (14–15, 18–19).

**Encounters** (rate 0.12):

| Palabrita | Levels | w |
|---|---|---|
| garrobito | 15–18 | 25 |
| hormiguita | 15–18 | 25 |
| zopilotito | 16–18 | 20 |
| hojadillo | 16–19 | 10 |
| liebron | 17–19 | 10 |
| cuernito | 17–19 | 5 |
| herculeo | 19–20 | 3 |
| tinajon | 18–20 | 2 |

**Fishing** (the lagoon): mojarrita 14–19 (w 60), mordisquito 17–20 (w 40).

**Item:** `itemBall('revivir_r8', 40, 28, 'revivir')`.

**Signs:** (2, 11) «RUTA 8. Al este: Ciudad Chispa y el volcán.» / "ROUTE 8. East: Ciudad Chispa and the
volcano." Put an `S` tile there (it's grass in the rows).

**Trainers:**

| id | Where | Kind | |
|---|---|---|---|
| `campesino` | (9, 14) right, sight 4 | Campesino Rigo | **in the way** |
| `vaquera_r8` | (24, 15) down, sight 2 | Vaquera Chela | **in the way** |
| `pescadora_r8` | (22, 10) down, sight 1 | Pescadora Iris | on the pier |
| `turista_r8` | (28, 11) left, sight 3 | Turista Mike | |
| `cortador` | (18, 25) right, sight 3 | Cortador Juan | in the cane |
| `cortadora` | (25, 23) left, sight 3 | Cortadora Lidia | in the cane |
| `granjero` | (37, 18) right, sight 2 | Granjero Pancho | **in the way** |
| `ciclista` | (39, 23) left, sight 2 | Ciclista Óscar | |

```
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTT......................TfffffffTT',
      'TTTTTTTTTTTT...~~~~~~~~~~~~~~~~...Tf.....fTT',
      'TTTTTTTTTTTT...~~~~~~~~~~~~~~~~...Tf.....fTT',
      'TTTTTTTTTTTT...~~~~~~~~~~~~~~~~...Tf.....fTT',
      'TTTTTTTTTTTT...~~~~~~~~~~~~~~~~...Tf.....fTT',
      'TTTTTTTTTTTT...~~~~~~~~~~~~~~~~...Tf.....fTT',
      'TTTTTTTTTTTT...~~~~~~HH~~~~~~~~...Tf.....fTT',
      'TT,,,,,,,,TT.........HH...,,,,,,..Tfff.fffTT',
      'TT,,,,,,,,TT.........HH...,,,,,,..T.......TT',
      'TT,,,,,,,,TT::::::::::::::::::::::T.......TT',
      '============::TTTTTTTTTTTTTTTTTTTTT.......TT',
      '============::TTTyTTTTTTTTTTTTTTTTT.......TT',
      'TTtTTTyTT.==::TTTTTTTTTTyTTTTTTTTTtT......TT',
      'TTTyTTTTTT==::TTTTTTTTTT.TTTTTTTTTTT......TT',
      'TTTTTTTTTT==============================TTTT',
      'TTTTTTTTTT==============================TTTT',
      'TTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTTTT.======',
      'TTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTTTTT======',
      'TTT||||||||||||||||||||||||||||||||T.......T',
      'TTT|||||:::::::::::::::::::::::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT||||||||||||||||||||||||||::||||T.,,,,,.T',
      'TTT|:::::::::::::::::::::::::::||||T.......T',
      'TTT||||||||||||||||||||||||||||||||T.......T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
```

---

## 4. Ciudad Chispa

A colonial town, inspired by Masaya, with the volcano on the horizon:
- the cobbled plaza with a fountain;
- the white church with two bell towers;
- a market with two rows of stalls (hammocks, masks, food);
- the fireworks workshop (the gym) and the haunted house.

**Basics:**
- `name: 'Ciudad Chispa'`, `outdoor: true`, `ground: 'town'`, `roof: 'red'`, `style: { trees: 'dry' }`.
- **Exits:** west to Ruta 8, east to Ruta 9, and north on the trail up the volcano (x 24–25).

**Doors:**

| At | Building | Interior | Arrive |
|---|---|---|---|
| (5, 6) | Palacentro | `centro_chispa` | |
| (29, 6) | shop | `tienda_chispa` | |
| (29, 12) | the workshop | `gym_chispa` | (5, 12) |
| (5, 19) | school | `escuela_chispa` | |
| (5, 26) | the haunted house | `casa_embrujada` | |
| (29, 18) | house 1 | `casa_tizon` | Don Tizón's family |
| (29, 26) | house 2 | `casa_chispa2` | |
| (18, 6) | the church | `iglesia` | |

**Gates:**
- `guardaparque_chispa` (look `guardaparque`) at `[24, 2, 'down']`, aside `[23, 2]`, road `[[25, 2]]`,
  back `'down'`, `opens: () => flag('cohetesRobados')`.
  - Closed: «El volcán está cerrado hoy. Hay mucho humo.» / "The volcano is closed today. There's a lot of
    smoke."
  - Open: «¡Los ladrones subieron al volcán! Ten cuidado, {name}.» / "The thieves went up the volcano! Be
    careful, {name}."
- `aprendiz_polvora` (look `polvorero`) at `[29, 13, 'down']`, aside `[28, 13]`, road `[]`,
  `opens: () => flag('fiestaDone')`.
  - Closed: «El taller está cerrado. Don Tizón está muy triste...» / "The workshop is closed. Don Tizón is
    very sad..."

**People:**

| id | Where | Notes |
|---|---|---|
| `hamaquera` | (12, 21) | the hammock stall, quest §11.1 |
| `mascarero` | (20, 21) | the mask stall, quest §11.4 |
| `fritanguera` | (24, 21) | the street-food stall, *fritanga*; a costume piece |
| `senora_azul` | (16, 16), look `cashier` | a lady in a blue dress; a costume piece |
| `nino_plaza` | (12, 11), look `boy` | a costume piece |

Remove the draft's `polvorero_triste`: the gate guard covers him.

**Signs:**
- (9, 12): «CIUDAD CHISPA. ¡La ciudad de las fiestas!» / "CIUDAD CHISPA. The city of festivals!"
- (26, 13): «TALLER DE PÓLVORA. Líder: Don Tizón.» / "FIREWORKS WORKSHOP. Leader: Don Tizón."
- (7, 14): «MERCADO DE ARTESANÍAS. ¡Hamacas, máscaras y más!» / "CRAFTS MARKET. Hammocks, masks and more!"
- Stalls:
  - row 20 x 10–12: «Hamacas hechas a mano.» / "Handmade hammocks."
  - x 19–21: «Máscaras y trajes de fiesta.» / "Masks and festival costumes."
  - x 23–25: «Vigorón, quesillo y tortillas.» / "Vigorón, quesillo and tortillas."

**Trigger:** entering the first time (the road tiles at x 0–1, rows 12–13) → `fiestaChispa` (§9).

```
      'TTTTTTTTTTTTTTTTTTTTTTTT::TTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTT::TTTTTTTTTT',
      'TT......................::........TT',
      'TT.ooooo.....NqqqqqqqqN.::.rrrr...TT',
      'TT.ooooo.....NqqqqqqqqN.::.rrrr...TT',
      'TT.hwcwh.....hwwwwwwwwh.::.hwMh...TT',
      'TT.hwdwh.....hhhhhdhhhh.::.hwdh...TT',
      'TT................ll....::........TT',
      'TT................ll....::........TT',
      'TT.T......tllllllllllllllt.pppppp.TT',
      'TT........llllllllllllllll.pppppp.TT',
      'TT........llllllllllllllll.hwGwwh.TT',
      '=======..Sllllllllllllllll.hhdhhh.TT',
      '=======...lllllllFFlllllllS.......TT',
      'TT.....S..lllllllFFlllllll........TT',
      'TT........llllllllllllllll.rrrr...TT',
      'TT.rrrrr..llllllllllllllll.rrrr...TT',
      'TT.rrrrr..llllllllllllllll.hwwh...TT',
      'TT.hwwwh..tllllllllllllllt.hwdh...TT',
      'TT.hwdwh........................T.TT',
      'TT........UUUlUUUUlUUUUUUU........TT',
      'TTT.......llllllllllllllll...=======',
      'TT........UUUUUlUUUUUUlUUU...=======',
      'TT.rrrrr....................rrrr..TT',
      'TT.rrrrr....................rrrr..TT',
      'TT.hhwhh....................hwwh..TT',
      'TT.hwdhhT...................hdwh..TT',
      'TT................................TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
```

### Interiors

- `centro_chispa`, `tienda_chispa`, `escuela_chispa` use the helpers. The teacher is Profesor Álvaro; the
  topic of the day alternates `compras` / `pasado`.
- `casa_tizon` is `HOUSE`: Don Tizón's daughter: «Mi papá hace los mejores cohetes de Nicaragua. ¡Cuando
  explotan parecen flores!» / "My dad makes the best rockets in Nicaragua. When they burst they look like
  flowers!"
- `casa_chispa2` is `HOUSE`: an old man who owns the haunted house, quest §11.3.
- `iglesia` (10×10, floor `+`), exit `{ to: 'chispa', x: 18, y: 7 }`:
  - Pews `n`, an altar `k` at the top, plants `P`.
  - `sacristan` (5, 2): a costume piece.
  - A sign: «Las fiestas patronales duran toda una semana.» / "The patron saint festivities last a whole
    week."

```
      '##P####P##',
      '++++kk++++',
      '++++++++++',
      '+nn++++nn+',
      '++++++++++',
      '+nn++++nn+',
      '++++++++++',
      '+nn++++nn+',
      '++++++++++',
      '++++mm++++',
```

- `casa_embrujada` (two rooms, both `night: true`; Palabritas everywhere, rate 0.1: cojincito 20–22 (w 70),
  sillon 22–24 (30)):

  **The hall** (10×8), exit `{ to: 'chispa', x: 5, y: 27 }`, door `{ x: 4, y: 0, to: 'cuarto_embrujado',
  tx: 3, ty: 5, dir: 'up' }`:

  ```
      '####d#####',
      '__________',
      '_kk____kk_',
      '__________',
      'L________L',
      '__________',
      '_n______n_',
      '____m_____',
  ```

  **The room** (8×7), the way back `{ x: 3, y: 6, to: 'casa_embrujada', tx: 4, ty: 1, dir: 'down' }` (a `d`
  tile at (3, 6)), and `lampara` (object) at (3, 1), quest §11.3:

  ```
      '########',
      '________',
      '_k____k_',
      '________',
      'B______B',
      '________',
      '___d____',
  ```

---

## 5. Ruta 9 and the way home

- `name: 'Ruta 9'`, `outdoor: true`, `ground: 'grass'` (default tree style).
- **Encounters** (rate 0.12):

  | Palabrita | Levels | w |
  |---|---|---|
  | garrobito | 22–25 | 30 |
  | zopilotito | 22–25 | 25 |
  | liebron | 22–25 | 20 |
  | palomon | 22–25 | 15 |
  | hormigon | 23–25 | 10 |

- **People:**
  - `abuelo_leyenda` (4, 8) facing right (look `granny`; make it a man: a `crew` head with gray hair, as in
    phase 2): the Carreta Nagua legend, §11.5.
  - Trainers (all optional): `campesina_r9` (7, 10) right, sight 2, Campesina Tula; `ciclista_r9` (31, 11)
    left, sight 2, Ciclista Bruno; `excursionista_r9` (18, 18) down, sight 2, Excursionista Lila.
- **Pueblo Amanecer:**
  - Add the connection.
  - Add `itemBall('meseta_amanecer', 2, 4, 'superpocion')` on the plateau: the route you could see from
    town at the very start.
  - Mom in `casa` gets the hammock scene (§11.1).

```
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT......TTTTTTTTTTTTTTTTTTTTTTT........T',
      'TT.,,,,.TTTTTTTTTTTTTTTTTTTTTTT.,,,,,,.T',
      'TT.,,,,.TTTTTTTTTTTTTTTTTTTTTTT.,,,,,,.T',
      'TT.,,,,.TTTTTTTTTTTTTTTTTTTTTTT.,,,,,,.T',
      'TT.,,,,.=======================.,,,,,,.T',
      'TT......=======================........T',
      'TT......==TTTTTTTTTTTTTTTTTTT==........T',
      'TT..t...==T.................T==....t...T',
      'TT......==T,,,,,,,,,,,,,,,,,T==........T',
      'TT......==T,,,,,,,,,t,,,,,,,T==........T',
      'TT......==T,,,,,,,,,,,,,,,,,T==........T',
      'TT......==T,,,,,,,,,,,,,,,,,T==........T',
      'TTTTTTTT==TTTTTTTTTTTTTTTTTTT==TTTTTTTTT',
      '==========TTTTTTTTTTTTTTTTTTT===========',
      '==========.TTTTTTTTTTTTTTTTTT===========',
      'TTTTTTTTTT.TTTTTTTTTTTTTTTTTT===========',
      'TTTTTTTTTT..................TTTTTTTTTTTT',
      'TTTTTTTTTTT.,,,t,,,,,,,,,,,.TTTTTTTTTTTT',
      'TTTTTTTTTTT.,,,,,,,,,,,t,,,.TTTTTTTTTTTT',
      'TTTTTTTTTTT.................TTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
```

---

## 6. Volcán Chocoyo

### 6.1 The slopes (`laderas`)

Three terraces of ash and black rock, joined by narrow passes, each guarded by a ranger or volcanologist.
Steam vents. The rangers' station on the middle terrace has a bed: rest heals you.

**Basics:**
- `name: 'Volcán Chocoyo'`, `outdoor: true`, `border: '^'`, `style: { rock: 'basalt' }`.
- **Encounters** (rate 0.12): chispita 19–22 (w 35), garrobito 19–21 (30), zopilotito 19–22 (20),
  chocoyito 20–22 (15).
- **Doors:**
  - (19, 16) → `estacion` (`HOUSE`-like, with the bed `B`). The ranger Doña Elsa (look `guardaparque`):
    «¿Estás cansad{o/a}? Descansa un poco en la cama.» / "Are you tired? Rest a bit on the bed."
    - The bed heals your team. Set `G.save.heal` here.
    - She also gives quest §11.2.
    - **Lucas is here** (rival #3, §10): he rests, then battles you before you go on up.
  - (14, 2) → `tubo` at (3, 22) facing up.

**People:**

| id | Where | Kind | |
|---|---|---|---|
| `guardaparque1` | (6, 20) left, sight 2 | Guardaparque Raquel | **in the way** |
| `vulcanologa1` | (23, 11) right, sight 2 | Vulcanóloga Clara | **in the way** |
| `guardaparque2` | (12, 4) right, sight 2 | Guardaparque Mauricio | **in the way** |


```
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^O^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^ii^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^iii^^^^^^^^^^^^^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^iiiiiXiiiiiii,,,,,,,iiii^^^',
      '^^^iiiiiiiiiiiii,,,,,,,iiii^^^',
      '^^^iiiiiiiiiiiii,,,,,,,iiii^^^',
      '^^^vvvvvvvvv^^^^^^^^^^^^ii^^^^',
      '^^^iiiiiiiii^^^^^^^^^^^^ii^^^^',
      '^^^iiiiiiiii^^^^^^^^^^^iii^^^^',
      '^^^iiiiiiiii^^^^^^^^^^^^ii^^^^',
      '^^^iiiiiiiiiiiiiirrrriiiiii^^^',
      '^^^iii,,,,,,,iiiirrrriiiiXi^^^',
      '^^^iii,,,X,,,iiiihwwhiiiiii^^^',
      '^^^iii,,,,,,,iiiihwdhiiiiii^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^^ii^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^ii^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^iii^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^ii^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^iiiii,,,,,,,,iiiiiiiiiii^^^',
      '^^^iiiii,,,,,,,,iiiiiiiiiii^^^',
      '^^^iiiii,,,,,,,,iiiiiiiiiii^^^',
      '^^^iiiii,,,,,,,,iiiiiiiiiii^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^::^^^^^^^^',
```

### 6.2 The lava tube (`tubo`)

- `outdoor: false`, `banner: true`, `name: 'Tubo de Lava'`, `floor: ';'`, `border: '%'`,
  `style: { cave: 'basalt' }`.
- **Encounters** (everywhere, rate 0.08):

  | Palabrita | Levels | w |
  |---|---|---|
  | ecolin | 20–22 | 30 |
  | murcielon | 21–23 | 20 |
  | ochopatas | 20–22 | 20 |
  | taranton | 22–23 | 10 |
  | chispita | 21–23 | 20 |

- **Exit:** `exit: { to: 'laderas', x: 14, y: 3 }` (the `e` at (3, 23)).
- **Door up:** `{ x: 36, y: 1, to: 'crater', tx: 5, ty: 24, dir: 'up' }`.
- **People:**
  - `vulcanologo2` (33, 12) left, sight 3: Vulcanólogo Erick, **in the way**.
  - `chocoyito_bebe` (5, 10), object, `show: () => flag('chocoyitoBusca') && !flag('chocoyitoEncontrado')`,
    quest §11.2.
  - `itemBall('revivir_tubo', 36, 17, 'revivir')`.

```
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%D%%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%;;;%%',
      '%%%%%%%%;;;;;;;;;;;;;%%%%%%%%%%%%%%;;;%%',
      '%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;%%;;;%%',
      '%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;%%;;;%%',
      '%%%%%%%%;;;;;;;;;;;;;;;;;;;;;;;;;%%;;;%%',
      '%%%%%%%%;;%%%%%%%%;;;%%%%%%%%%;;;%%;;;%%',
      '%%%%;;;;;;%%%%%%%%;;;%%%%%jjjj;;;%%;;;%%',
      '%%%%;;;;;;%%%%%%%%;;;%%%%%jjjj;;;%%;;;%%',
      '%%%%;;;;;;%%%%%%%%;;;%%%%%jjjj;;;%%;;;%%',
      '%%%%;;;;;;%%%%%%%%;;;%%%%%jjjj;;;;%;;;%%',
      '%%%%%%%%%%%%%%%%%%;;;%%%%%jjjj;;;%%;;;%%',
      '%%%%%%%%%%%%%%%%%%;;;%%%%%%%%%;;;%%;;;%%',
      '%%;;;;;;;;;;;;;;;;;;;%%%%%%%%%;;;%%;;;%%',
      '%%;;;;;;;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;%%',
      '%%;;;;;;;;;;;;;;;;;;;%%%%%%%%%;;;;;;;;%%',
      '%%;;;;;%%%%%jjjjj%%%%%%%%%%%%%;;;;;;;;%%',
      '%%;;;;;%%%%%jjjjj%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;%%%%%jjjjj%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;%%%%%jjjjj%%%%%%%%%%%%%%%%%%%%%%%',
      '%%;;;;;%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%%%e%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
```

### 6.3 The crater (`crater`)

A walkway of ash around the crater's lava lake. The parakeet colony nests on the east side. Equipo Silencio
has made camp on the north rim with the stolen fireworks.

- `name: 'Cráter del Chocoyo'`, `outdoor: true` (not in the world layout: door-linked), `border: '^'`,
  `style: { rock: 'basalt' }`.
- **Encounters** (grass only, rate 0.15): chocoyito 22–24 (w 75), chispita 22–24 (25).
- **Door:** `{ x: 5, y: 25, to: 'tubo', tx: 36, ty: 2, dir: 'down' }`.
- **People:**

  | id | Where | Notes |
  |---|---|---|
  | `silencioso5` | (5, 12) left, sight 2 | west rim |
  | `silencioso6` | (26, 17) right, sight 2 | east rim |
  | `silencioso7` | (9, 2) down, sight 2 | north rim |
  | `sigilo` | (16, 3) down, sight 1 | **in the way**; §9 |
  | `cohetes1`, `cohetes2` | (14, 2) and (18, 2), objects | `show: () => !flag('cohetesRecuperados')` |
  | `nido_chocoyos` | (30, 12), object | quest §11.2 |

- One of the rim grunts always stands in your way, whichever rim you take.

```
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^iiiiiiiiiiiiiiiiiiiiiiiiii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iiijjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjj^ii,,^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjiii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iijjjjjjjjjjjjjjjjjjjjjjii^^^',
      '^^^iiiiiiXiiiiiiiiiiiiiiiiiii^^^',
      '^^^iiiiiiiiiiiiiiiiiiiXiiiiii^^^',
      '^^^^^i^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^D^^^^^^^^^^^^^^^^^^^^^^^^^^',
```

---

## 7. Gym 4: Taller de Pólvora (`gym_chispa`)

- `outdoor: false`, `name: 'Taller de Pólvora'`, `floor: '+'`, `exit: { to: 'chispa', x: 29, y: 13 }`.
- **The torches:** 4 objects on row 5, at (1, 5) green, (3, 5) red, (8, 5) yellow and (10, 5) blue.
- **The poem:** a sign on the shelf at (2, 4): «Primero, el fuego rojo. Después, el azul. Luego, el verde. Al
  final, el amarillo.» / "First, the red fire. Then, the blue. Next, the green. Finally, the yellow." The
  poem is also spoken with 🔊.
- **The door:** `puertaTaller` objects at (5, 4) and (6, 4), with
  `show: () => !flag('puertaTallerAbierta')`.

**The `antorcha` script** (one for all four; the color comes from the object id):
1. «¿Enciendes la antorcha roja?» / "Light the red torch?" (the color in Spanish, gender-agreeing:
   roja / azul / verde / amarilla). Use `ask`.
2. Yes:
   - **The right one next:** it lights (the lit image; `G.save.torches = [...]`, or flags
     `antorcha1..4`).
   - **The wrong one:** «¡Pfff! Todas las antorchas se apagaron.» / "Pfff! All the torches went out." Reset.
3. All four lit: «¡La puerta del taller se abre!», a rumble, then set `puertaTallerAbierta`.

**People:**

| id | Where | Kind | |
|---|---|---|---|
| `polvorera` | (0, 6) right, **sight 11** | Polvorera Gloria | **in the way** |
| `malabarista` | (11, 10) left, **sight 11** | Malabarista Ricky | **in the way** |
| `fritanguero` | (1, 2) right, sight 4 | Fritanguero Neno | **in the way** |
| `tizon` | (5, 1) down | Don Tizón | §12 |
| `guia_chispa` | (8, 12) left | the guide | «¡Ojo! Para abrir la puerta, enciende las antorchas en el orden del poema.» / "Watch out! To open the door, light the torches in the poem's order." Then: «Don Tizón usa Palabritas de tipo Fuego. ¡El agua es tu mejor amiga!» / "Don Tizón uses Fire types. Water is your best friend!" |

```
      '############',
      'P++++++++++P',
      '++++++++++++',
      '++++++++++++',
      'UUUUU++UUUUU',
      '++++++++++++',
      '++++++++++++',
      '++++++++++++',
      'UUUUU++UUUUU',
      '++++++++++++',
      '++++++++++++',
      '++++++++++++',
      '++++++++++++',
      '+++++mm+++++',
```

---

## 8. Trainers

Levels: route trainers 18–26, rising along the way (the user, 2026-10-19). Rematches: Rigo and Lidia on Ruta 8,
Clara on the volcano, Bruno on Ruta 9.

```ts
campesino: { id: 'campesino', name: 'Campesino Rigo', defenseMode: 'listen', rematch: true, team: [['garrobito', 18], ['hormiguita', 18]] },
vaquera_r8: { id: 'vaquera_r8', name: 'Vaquera Chela', defenseMode: 'listen', team: [['liebron', 19], ['zopilotito', 19]] },
pescadora_r8: { id: 'pescadora_r8', name: 'Pescadora Iris', defenseMode: 'listen', team: [['mojarrita', 18], ['mojarrita', 19], ['mordisquito', 19]] },
turista_r8: { id: 'turista_r8', name: 'Turista Mike', defenseMode: 'choose', team: [['pelicanito', 19], ['coquito', 19]] },
cortador: { id: 'cortador', name: 'Cortador Juan', defenseMode: 'listen', team: [['hormiguita', 19], ['garrobito', 20]] },
cortadora: { id: 'cortadora', name: 'Cortadora Lidia', defenseMode: 'listen', rematch: true, team: [['zopilotito', 20], ['hormiguita', 20]] },
granjero: { id: 'granjero', name: 'Granjero Pancho', defenseMode: 'listen', team: [['conejito', 20], ['liebron', 21]] },
ciclista: { id: 'ciclista', name: 'Ciclista Óscar', defenseMode: 'listen', team: [['garrobito', 21], ['zopilotito', 21]] },
guardaparque1: { id: 'guardaparque1', name: 'Guardaparque Raquel', defenseMode: 'listen', team: [['chispita', 21], ['garrobito', 22]] },
vulcanologa1: { id: 'vulcanologa1', name: 'Vulcanóloga Clara', defenseMode: 'listen', rematch: true, team: [['chispita', 22], ['zopilotito', 22]] },
guardaparque2: { id: 'guardaparque2', name: 'Guardaparque Mauricio', defenseMode: 'listen', team: [['chocoyito', 22], ['garrobito', 23]] },
vulcanologo2: { id: 'vulcanologo2', name: 'Vulcanólogo Erick', defenseMode: 'listen', team: [['ecolin', 23], ['taranton', 23]] },
silencioso5: { id: 'silencioso5', name: 'Silencioso', defenseMode: 'listen', team: [['ecolin', 23], ['piedrita', 24]] },
silencioso6: { id: 'silencioso6', name: 'Silenciosa', defenseMode: 'listen', team: [['ochopatas', 24], ['ollita', 24]] },
silencioso7: { id: 'silencioso7', name: 'Silencioso', defenseMode: 'listen', team: [['petroglifon', 24], ['murcielon', 25]] },
sigilo: { id: 'sigilo', name: 'Don Sigilo', defenseMode: 'type', team: [['murcielon', 27], ['taranton', 28], ['petroglifon', 29]] },
lucas3: { id: 'lucas3', name: 'Lucas', defenseMode: 'type', team: [['<counter starter, 2nd form>', 28], ['hojarasco', 25], ['palomon', 25], ['cangrejon', 26]] },
polvorera: { id: 'polvorera', name: 'Polvorera Gloria', defenseMode: 'type', team: [['chispita', 25], ['chispita', 25]] },
malabarista: { id: 'malabarista', name: 'Malabarista Ricky', defenseMode: 'type', team: [['chocoyito', 25], ['garrobito', 26]] },
fritanguero: { id: 'fritanguero', name: 'Fritanguero Neno', defenseMode: 'type', team: [['garrobito', 26], ['chispita', 26]] },
tizon: { id: 'tizon', name: 'Líder Don Tizón', defenseMode: 'type', team: [['chocoyote', 28], ['coheton', 29], ['brasita', 31]] },
campesina_r9: { id: 'campesina_r9', name: 'Campesina Tula', defenseMode: 'listen', team: [['zopilotito', 24], ['liebron', 25]] },
ciclista_r9: { id: 'ciclista_r9', name: 'Ciclista Bruno', defenseMode: 'listen', rematch: true, team: [['garrobito', 25], ['hormigon', 25]] },
excursionista_r9: { id: 'excursionista_r9', name: 'Excursionista Lila', defenseMode: 'listen', team: [['palomon', 25], ['liebron', 26]] },
```

Lines (each `[es, en]`):

| id | intro | defeated | after |
|---|---|---|---|
| campesino | «Siembro maíz y frijoles. ¡Y entreno Palabritas en el descanso!» / "I grow corn and beans. And I train Palabritas on my break!" | «¡Se me secó la cosecha!» / "My harvest dried up!" | «En la época seca no llueve nada. Por eso cuidamos el agua.» / "In the dry season it doesn't rain at all. That's why we take care of the water." |
| vaquera_r8 | «¡Hola, vaquer{o/a}! ¿Lista la reata? ¡A luchar!» / "Hi, cowpoke! Lasso ready? Let's battle!" | «¡Me ganaste en buena ley!» / "You beat me fair and square!" | «El rancho de Pancho tiene las mejores vacas del país.» / "Pancho's ranch has the best cows in the country." |
| pescadora_r8 | «En esta laguna hay peces enormes. ¿Y entrenadores fuertes?» / "There are huge fish in this lagoon. And strong trainers?" | «¡Me pescaste a mí!» / "You caught me!" | «Algún día vas a poder nadar con tus Palabritas por aquí.» / "Someday you'll be able to swim with your Palabritas around here." |
| turista_r8 | «Hi! Perdón... ¡Hola! Vengo a ver el volcán. ¿Luchamos?» / "Hi! Sorry... Hi! I came to see the volcano. Shall we battle?" | «¡Wow! ¡Hablas muy bien!» / "Wow! You speak very well!" | «Dicen que en el cráter viven unos pericos verdes. ¡Qué raro!» / "They say green parakeets live in the crater. How strange!" |
| cortador | «¡Cortamos caña desde las cinco de la mañana! ¿Quieres probar?» / "We've been cutting cane since five in the morning! Want to try?" | «¡Ay, qué cansancio!» / "Oh, I'm so tired!" | «Con la caña se hace azúcar y... ¡ron! Pero eso es para adultos.» / "Cane makes sugar and... rum! But that's for grown-ups." |
| cortadora | «¡Cuidado, la caña es alta y te puedes perder!» / "Careful, the cane is tall and you can get lost!" | «¡Me perdí yo!» / "I got lost myself!" | «Aquí hay muchísimas Palabritas. ¡Es el mejor lugar para entrenar!» / "There are tons of Palabritas here. It's the best place to train!" |
| granjero | «¡Ey! Estas son mis vacas. ¡Y esta es mi batalla!» / "Hey! These are my cows. And this is my battle!" | «¡Muuu! Digo... ¡qué fuerte eres!» / "Moo! I mean... you're so strong!" | «Ciudad Chispa está aquí al lado. ¡Esta semana hay fiesta!» / "Ciudad Chispa is right next door. There's a festival this week!" |
| ciclista | «¡Pedaleo cien kilómetros al día! ¿Y tú?» / "I cycle a hundred kilometers a day! And you?" | «¡Se me pinchó la llanta!» / "I got a flat tire!" | «Desde aquí se ve el humo del volcán. ¡Siempre sale humo!» / "You can see the volcano's smoke from here. There's always smoke!" |
| guardaparque1 | «Este es un parque nacional. ¡Tienes que pasar mi prueba!» / "This is a national park. You have to pass my test!" | «Bueno, puedes subir.» / "Well, you can go up." | «No te acerques mucho al humo. ¡Es tóxico!» / "Don't get too close to the smoke. It's toxic!" |
| vulcanologa1 | «Estudio el volcán. ¡Y a los entrenadores que suben!» / "I study the volcano. And the trainers who climb it!" | «¡Hiciste erupción!» / "You erupted!" | «El volcán está activo, pero tranquilo. ¡Por ahora!» / "The volcano is active, but calm. For now!" |
| guardaparque2 | «Arriba están los Silenciosos. ¡Primero, demuéstrame que puedes con ellos!» / "The Silenciosos are up there. First, show me you can handle them!" | «¡Sí, puedes!» / "Yes, you can!" | «La cueva de lava es muy oscura. ¡No te pierdas!» / "The lava cave is very dark. Don't get lost!" |
| vulcanologo2 | «¿Sabías que esta cueva la hizo la lava hace mil años?» / "Did you know lava made this cave a thousand years ago?" | «¡Qué calor... de batalla!» / "What a hot... battle!" | «La salida al cráter está más adelante, a la derecha.» / "The way out to the crater is further ahead, on the right." |
| silencioso5 | «¡Shhh! Los cohetes hacen demasiado ruido. ¡Los vamos a tirar al volcán!» / "Shhh! Rockets make too much noise. We're going to throw them into the volcano!" | «¡Shhh! Perdí.» / "Shhh! I lost." | «Don Sigilo está arriba. ¡No va a perder!» / "Don Sigilo is up there. He won't lose!" |
| silencioso6 | «¡No pasas! Esta noche no va a haber fiesta.» / "You won't pass! There won't be a party tonight." | «¡Ay, qué ruido hago al perder!» / "Oh, what a noise I make when I lose!" | «Las fiestas... son muy ruidosas. ¡Shhh!» / "Parties... are so noisy. Shhh!" |
| silencioso7 | «¡Tú otra vez, {name}! Primero la mina, después las tortugas...» / "You again, {name}! First the mine, then the turtles..." | «¡Siempre tú!» / "Always you!" | «Don Sigilo te está esperando.» / "Don Sigilo is waiting for you." |
| polvorera | «Hago cohetes de todos los colores. ¿Cuál te gusta más?» / "I make rockets in every color. Which one do you like best?" | «¡Me salió un cohete apagado!» / "My rocket fizzled out!" | «El rojo es el más difícil de hacer.» / "Red is the hardest to make." |
| malabarista | «¡Hago malabares con fuego! ¿Ves? ¡Ups!» / "I juggle with fire! See? Oops!" | «¡Se me cayeron todas las antorchas!» / "I dropped all my torches!" | «Para ganar, como en los malabares: práctica, práctica, práctica.» / "To win, it's like juggling: practice, practice, practice." |
| fritanguero | «¿Hambre? ¡Primero la batalla, después el vigorón!» / "Hungry? First the battle, then the vigorón!" | «¡Se me quemó la tortilla!» / "My tortilla burned!" | «Don Tizón come vigorón todos los días. ¡Por eso tiene tanta energía!» / "Don Tizón eats vigorón every day. That's why he has so much energy!" |
| campesina_r9 | «¿Vas a Pueblo Amanecer? ¡Qué lindo pueblo! Pero primero...» / "Going to Pueblo Amanecer? What a lovely town! But first..." | «¡Saludos a tu mamá!» / "Say hi to your mom!" | «Al final del camino hay un barranco. ¡Puedes saltar!» / "At the end of the road there's a drop. You can jump!" |
| ciclista_r9 | «¡Vuelvo a casa en bici! ¿Una carrera? Bueno, una batalla.» / "I'm cycling home! A race? Well, a battle." | «¡Perdí la carrera!» / "I lost the race!" | «Con la medalla del volcán, ya tienes cuatro. ¡Qué bárbaro!» / "With the volcano's medal you have four already. Amazing!" |
| excursionista_r9 | «Camino desde Ciudad Chispa hasta el lago. ¿Luchamos en el camino?» / "I walk from Ciudad Chispa to the lake. Shall we battle on the way?" | «¡Uf! Me sentaré un rato.» / "Phew! I'll sit down a while." | «Este camino es antiguo. Mi abuelo dice que de noche pasa la Carreta Nagua...» / "This road is old. My grandfather says the Carreta Nagua passes by at night..." |
---

## 9. The story: the stolen fireworks

**Flags:** `cohetesRobados`, `beat:silencioso5..7`, `beat:sigilo`, `cohetesRecuperados`, `fiestaDone`,
`medalChispa`.

**1. `fiestaChispa`** (the trigger when you first enter):
1. Music plays, and people are decorating the plaza.
2. An explosion of sound (`sfx('alert')`, a screen flash). Don Tizón runs out of the workshop (`walkNpc`
   from his door to the plaza): «¡Ladrones! ¡Se robaron todos los cohetes de la fiesta!» / "Thieves! They
   stole all the festival's rockets!"
3. Two Silenciosos run up the volcano trail (`placeNpc` then `walkNpc` north, then hide): «¡Shhh! ¡Esta
   noche, nadie va a hacer ruido!» / "Shhh! Tonight, nobody's going to make noise!"
4. Don Tizón to you: «¡Tú eres {name}! Ayudaste en Villa Ocote y en Playa Carey.» / "You're {name}! You
   helped in Villa Ocote and Playa Carey."
5. «Por favor, recupera los cohetes. Sin cohetes no hay fiesta... y sin fiesta, ¡no abro el taller!» /
   "Please, get the rockets back. Without rockets there's no festival... and without a festival, I won't
   open the workshop!"
6. Set `cohetesRobados`: the trail opens.

**2. Don Sigilo** (on the crater's north rim):
- «¡Shhh! Así que tú eres {name}. Mis Silenciosos hablan mucho de ti... demasiado.» / "Shhh! So you're
  {name}. My Silenciosos talk a lot about you... too much."
- «Escucha: el mundo es un lugar muy ruidoso. Palabras, música, fiestas, cohetes... ¡Ruido, ruido, ruido!»
  / "Listen: the world is a very noisy place. Words, music, festivals, rockets... Noise, noise, noise!"
- «Yo quiero un país en silencio. Y empiezo esta noche, tirando los cohetes al volcán.» / "I want a silent
  country. And I'm starting tonight, by throwing the rockets into the volcano."
- The battle (look `sigilo`, his music is quieter). Defeated: «Imposible... ¿Cómo puede alguien aprender
  tantas palabras?» / "Impossible... How can anyone learn so many words?"
- «Esto no se acaba aquí. Algún día, todo el país va a estar en silencio. ¡Shhh!» / "This isn't over.
  Someday, the whole country will be silent. Shhh!" He leaves; hide him.
- The crates: «¡Recuperaste los cohetes!» Set `cohetesRecuperados` and `refreshNpcs()`.
- Fade, then «Bajas del volcán con los cohetes...» / "You come down the volcano with the rockets...", then
  warp to Ciudad Chispa (27, 13) facing up, next to the workshop.

**3. Don Tizón, after the crates:**
- «¡Los cohetes! ¡Eres increíble!» / "The rockets! You're incredible!"
- «Esta noche hay fiesta. ¿Vienes? ¡Hay desfile, música y fuegos artificiales!» / "Tonight there's a
  festival. Are you coming? There's a parade, music and fireworks!"
- `ask`. Yes: night (step 4).
- Later, the apprentice can start the festival again on any day: «¿Vamos a la fiesta de esta noche?» / "Shall
  we go to tonight's festival?"

**4. Festival night** (`chispa_noche`, `night: true`, plus a fireworks effect):
- **Fireworks:** a `fireworks` option on the map. `renderWorld` draws bursts: 3–5 colored dots that expand
  outward and fade over about 40 frames, launched every 30–60 frames over the plaza (screen y 10–60), with
  `sfx('levelup')` quietly for each burst, or a new short `pop` sound.
- **The parade:** dancers (looks `dancer1..4`, colorful dresses and masks) walk in a loop around the plaza
  with `walkNpc`.
- **The Torovenado:** if you finished §11.4, you dance in the parade. A cutscene: you walk with the dancers
  for a loop. Then the mask vendor gives `giveMon('mascarita', 20)`.
- **Don Tizón:** «¡Mira, {name}! ¡Este cohete es para ti!» / "Look, {name}! This rocket is for you!" A big
  burst. «Mañana te espero en el taller. ¡Ven list{o/a}!» / "Tomorrow I'll be waiting at the workshop. Come
  ready!"
- **Leaving:** walking off any edge or talking to the apprentice ends the night («A la mañana siguiente...»).
  Set `fiestaDone`: the workshop opens.

---

## 10. The rival: Lucas, battle #3

**At the ranger station** (`estacion`, the user's choice: not right after the rangers' battles). Lucas
(`lucas_estacion`, `show: () => !flag('lucas3')`) sits by the door. Flag `lucas3`.
1. Entering the first time (a trigger inside the door): «¡{name}! ¿Tú también vienes por los Silenciosos?» /
   "{name}! Are you after the Silenciosos too?" «Descansa primero en la cama. ¡Quiero una batalla justa!» /
   "Rest on the bed first. I want a fair fight!"
2. After the bed heals you (or if you talk to him, or walk to the door): «¡Ahora sí! ¡Esta vez sí te gano!» /
   "Now we're talking! This time I'll beat you for sure!"
3. The battle (`lucas3`). Defeated: «Otra vez... Bueno. Eres muy buen{o/a}, de verdad.» / "Again... OK.
   You're really good, honestly."
4. «Ve tú al cráter. Yo bajo a avisar a los guardaparques. ¡Ten cuidado!» / "You go to the crater. I'll go
   down and tell the rangers. Be careful!" He walks out and leaves. If you lose, he stays and asks again.

From here on, Lucas is a friend more than a rival. That pays off later.

---

## 11. Side quests

### 11.1 Una hamaca para mamá (flags `hamacaComprada`, `hamacaEntregada`, `hamaquita`)

1. **The hammock vendor (`hamaquera`):**
   - «¡Hamacas, hamacas! Hechas a mano aquí en Ciudad Chispa. ¿Te gusta esta?» / "Hammocks, hammocks!
     Handmade here in Ciudad Chispa. Do you like this one?"
   - The price starts at «novecientos córdobas»: $900 in the game.
2. **Bargaining**, up to 4 turns. Each turn is a `chooseText`: «¿Qué le dices?» with three phrases from the
   `compras` topic.
   - **A polite, good bargaining phrase** («¡Es muy caro!», «¿Me hace un descuento?», «¿Me la deja en
     quinientos?») lowers the price: 900 → 750 → 600 → 500.
   - **A rude or nonsense option** (e.g. «¡Dame la hamaca!», «No me gustan las hamacas») gets «¡Qué
     maleducad{o/a}!» / "How rude!" The price stays.
   - **«Me la llevo»** buys at the current price.
   - Speaking or typing your choice is welcome: show the options, then let them pick or say one.
3. **Buying:** check the money: «No tienes suficiente dinero.» / "You don't have enough money." Then
   `addItem('hamaca')` and set `hamacaComprada`.
   - The vendor: «Es para tu mamá, ¿verdad? ¡Qué lindo!» / "It's for your mom, right? How sweet!"
4. **Mom** (Pueblo Amanecer, with the hammock):
   - «¿Una hamaca? ¿De Ciudad Chispa? ¡Qué bonita! La voy a colgar en tu cuarto.» / "A hammock? From Ciudad
     Chispa? How pretty! I'll hang it in your room."
   - Remove it, set `hamacaEntregada`, and give 3 Superpociones: «Toma, para tu viaje.» / "Here, for your
     trip."
5. **The hammock in your room:** the object `hamaquita` at (1, 4) in `casa`, with
   `show: () => flag('hamacaEntregada') && !flag('hamaquita')`.
   - «¡La hamaca está roncando! ¿Qué es eso?» / "The hammock is snoring! What's that?"
   - Then `wildBattle('hamaquita', 22)`. Caught or beaten sets `hamaquita`; if you run, it stays.

### 11.2 El chocoyito perdido (flags `chocoyitoBusca`, `chocoyitoEncontrado`, `chocoyitoDone`)

1. **The ranger, Doña Elsa:**
   - «¡Ay! Un chocoyito bebé se cayó del nido. Creo que está dentro del tubo de lava.» / "Oh! A baby parakeet
     fell out of its nest. I think it's inside the lava tube."
   - «Entras, vas a la izquierda y sigues hacia arriba. Está en un rincón oscuro.» / "You go in, go left and
     keep going up. It's in a dark corner."
   - A `chooseText` «¿Dónde está el chocoyito?» with: «En el tubo de lava, a la izquierda» (right) / «En la
     laguna» / «En el taller».
   - Set `chocoyitoBusca`.
2. **The chick** in the tube: «¡Pío, pío!» Then `addItem('chocoyitoBebe')` and set `chocoyitoEncontrado`.
3. **The nest** in the crater: «¿Pones al chocoyito en el nido?» Yes: «¡Su mamá está feliz!» Remove the item
   and set `chocoyitoDone`.
4. **The ranger afterwards:** «¡Gracias! Toma, para que las Palabritas salvajes no te molesten.» / "Thanks!
   Here, so wild Palabritas don't bother you." Give 5 Repelentes.

### 11.3 La casa embrujada (flags `embrujadaHablada`, `lamparaCalmada`, `lamparita`)

1. **The owner (`casa_chispa2`):**
   - «Mi casa vieja está embrujada. De noche se mueven los muebles... ¡y una lámpara llora!» / "My old house is
     haunted. At night the furniture moves... and a lamp cries!"
   - «Si la calmas, te pago quinientos.» / "If you calm it, I'll pay you five hundred."
   - Set `embrujadaHablada`. The house is open whenever.
2. **The lamp** (the inner room):
   - «La lámpara te habla en voz muy baja...» / "The lamp speaks to you very quietly..."
   - 3 rounds: it *whispers* a sentence. Speak it softly with `speak(text, true)`. You repeat it in a listen
     challenge.
   - The sentences come from the `emociones` theme (real items): «Estoy muy triste», «Me siento sola», «Tengo
     miedo de la oscuridad».
   - After each: «La lámpara brilla un poco más...» / "The lamp glows a little brighter..."
3. **Calmed:**
   - «¡La lámpara ya no está triste! Ahora brilla de color rojo... ¿está enojada? ¡No, quiere jugar!» / "The
     lamp isn't sad anymore! Now it's glowing red... is it angry? No, it wants to play!"
   - Then `wildBattle('lamparita', 23)`. Afterwards set `lamparaCalmada`; caught sets `lamparita`.
4. **The owner:** «¡Gracias! Ya puedo dormir en mi casa.» / "Thanks! Now I can sleep in my house." Give $500.

### 11.4 Los trajes del Torovenado (flags `torovenado`, `traje1..5`, `torovenadoListo`)

1. **The mask vendor (`mascarero`)**, after `cohetesRecuperados`:
   - «¡Ay, el traje del Torovenado se perdió en el robo! La gente del pueblo encontró las piezas...» / "Oh, the
     Torovenado costume got lost in the theft! The townspeople found the pieces..."
   - «La señora del vestido azul tiene el sombrero. El niño de la plaza tiene la capa. La señora de la
     fritanga tiene las botas. El sacristán de la iglesia tiene la máscara. La niña de la escuela tiene la
     falda.» / "The lady in the blue dress has the hat. The boy in the square has the cape. The fritanga lady
     has the boots. The church sexton has the mask. The girl at the school has the skirt."
   - Spoken, with 🔊. Set `torovenado`.
2. **Each holder:**
   - «¡Hola! ¿Qué buscas?» / "Hi! What are you looking for?"
   - A speaking/typing challenge: name the piece they hold. Use the `ropa` theme item where it exists (la
     máscara, la capa, las botas, la falda; el sombrero is in the core).
   - Right: «¡Aquí está! Para el Torovenado.» Set `trajeN` and `addItem('traje')` (it counts up).
   - Wrong: «Mmm, no tengo eso.» / "Hmm, I don't have that."
3. **All 5:**
   - The vendor: «¡El traje está completo! Esta noche, ¡tú vas a bailar en el desfile!» / "The costume is
     complete! Tonight, you're going to dance in the parade!"
   - Set `torovenadoListo`. At the festival you dance, then get Mascarita (§9.4).
   - If the festival was already done: the apprentice offers it again.

### 11.5 La leyenda de la Carreta Nagua (flags `leyenda`)

1. **The old man on Ruta 9:**
   - «¿Quieres oír una leyenda? Es un poco de miedo...» / "Want to hear a legend? It's a little scary..."
   - Then (each line spoken with 🔊, in the past tense):
     - «Hace muchos años, en las noches oscuras, la gente oía un ruido en la calle.» / "Many years ago, on
       dark nights, people heard a noise in the street."
     - «Era una carreta vieja, tirada por dos bueyes flacos.» / "It was an old cart, pulled by two thin
       oxen."
     - «La manejaba la Muerte, y nadie se atrevía a mirarla.» / "Death drove it, and nobody dared to look
       at it."
     - «Por eso, cuando oyes una carreta de noche, ¡no salgas a la calle!» / "That's why, when you hear a cart
       at night, don't go out into the street!"
2. **3 comprehension questions** (`chooseText`):
   - «¿Qué oía la gente?» → «Un ruido en la calle» / «Una canción» / «Un perro»
   - «¿Qué tiraba la carreta?» → «Dos bueyes flacos» / «Un caballo» / «Nada»
   - «¿Qué no debes hacer?» → «Salir a la calle» / «Dormir» / «Comer»
3. **Done:** «¡Pusiste mucha atención! Toma esta campanita. Dicen que espanta a los fantasmas.» / "You paid
   close attention! Take this little bell. They say it scares ghosts away."
   - `addItem('campanita')`, a new key item (add it to `ITEM_DEFS` like `hamaca`) with no use yet: a teaser for the Ghost-type Elite Four member. Set
     `leyenda`.

---

## 12. Don Tizón (gym 4)

- **Intro:**
  - «¡{name}! Ayer salvaste la fiesta. Pero hoy... ¡hoy es una batalla de verdad!» / "{name}! Yesterday you
    saved the festival. But today... today is a real battle!"
  - «Ayer hice mil cohetes. Bueno, ¡novecientos noventa y nueve! Uno lo guardé para esta batalla.» /
    "Yesterday I made a thousand rockets. Well, nine hundred ninety-nine! I saved one for this battle."
  - `ask('¿Estás list{o/a}?')`.
- **The battle** (`tizon`, look `tizon`). Defeated: «¡Se me apagó la mecha! Fue la mejor batalla de mi vida.»
  / "My fuse went out! It was the best battle of my life."
- **After:**
  1. Set `beat:tizon` and `medalChispa`, add `'Chispa'` to medals, `sfx('badge')`.
  2. «¡{name} recibió la Medalla Chispa!»
  3. «¡Cuatro medallas! Eso es la mitad del camino.» / "Four medals! That's halfway."
  4. «Al este está tu pueblo, Pueblo Amanecer. ¿Por qué no visitas a tu mamá? ¡Seguro que te extraña!» /
     "East is your town, Pueblo Amanecer. Why don't you visit your mom? I'm sure she misses you!"
  5. Then: «¡Felicidades! Terminaste la segunda parte de Palabritas. ¡Pronto habrá más aventuras!»
     / "Congratulations! You finished part two of Palabritas. More adventures coming soon!"

---

## 13. The way home

Ruta 9 → the plateau → the ledge into Pueblo Amanecer.

**The first time you hop down** (flag `vueltaACasa`), a short scene with the neighbor and Mom:
- «¡{name}! ¡Volviste!» / "{name}! You came back!"
- At home, Mom: «¡Mi {name}! Cuatro medallas... ¡Estoy tan orgullosa!» / "My {name}! Four medals... I'm so
  proud!"
- She heals the team, as she always does.
- If you have the hammock, the hammock scene (§11.1) happens here.

---

## 14. Palabritas and content

- **Palabritas** ([palabritas.md](palabritas.md) §4): Garrobito/Brasita (the user's art), Hormiguita/
  Hormigón, Chispita/Cohetón, Chocoyito/Chocoyote, Zopilotito/Zopilotón, Mascarita/Torovenado, Hamaquita,
  Lamparita.
- **Themes:** fiesta, conversacion, ciudad, ropa, rutina, emociones, animales, trabajo.
- **Topics:** compras, pasado ([content.md](content.md)).

## 15. Tests

Keep them short (the user's rule: only what's strictly necessary), in checkpoints like region3.test.

| Test | What it checks |
|---|---|
| `region4.test` | Carey's east gate → Ruta 8 → Ciudad Chispa (the theft cutscene; the trail opens) → the slopes (the bed heals; Lucas #3 at the station) → the tube → the crater (a rim grunt + Don Sigilo; the crates) → back in Chispa: the festival night (fireworks drawn, the parade moves) → the workshop: the wrong torch order resets, the right one opens the door, the 3 trainers, Don Tizón, `medalChispa` → Ruta 9 → hop down into Amanecer. |
| `quests4.test` | The hammock: bargaining lowers the price, buying needs money, Mom takes it, and the snoring hammock gives a Hamaquita battle. The chick. The haunted house: 3 rounds, then the Lamparita battle and $500. Torovenado: 5 pieces by name, then the parade gives Mascarita. The legend: 3 questions and the bell. |
| `maps.test`, `data.test` | stay green; the art page's World view now shows the whole loop. |

## 16. Done when

- All of the above is in, `npm test` is green, and the art page shows everything new, the World loop and both
  night maps.
- ROADMAP.md: phase 4 is marked ✓.
- Every commit is pushed.

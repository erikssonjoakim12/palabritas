# Gym 5: Ortiga's garden in Villa Jaguar

Planta/Veneno, the past tense (ROADMAP §4–5). After the temple: the leader went into the silent jungle and is back
once the jaguar is saved. The medal opens Cut. Fly moves to the 6th medal (the user, 2026-10-30).

## The leader

**Ortiga** (the nettle), Villa Jaguar's *yerbera*: she knows every plant in the jungle, the ones that heal and the
ones that sting. Kind, a bit prickly, laughs at herself («Soy como la ortiga: suave... ¡pero si me tocas, pico!»).
**Medalla Espina** (Thorn). Her gym is her garden under a glass roof: **Jardín de Ortiga** (`gym_jaguar`).

| | Team |
|---|---|
| Líder Ortiga (`type`) | Dardito 36, Hojarasco 37, Ranojón 37, **Oropelón 39** |
| Jardinera Azucena (`choose`) | Pestañita 33, Coquito 33 |
| Yerbero Chepe (`listen`) | Dardito 34, Hojarasco 34 |
| Botánica Iris (`type`) | Ranojito 34, Cocotero 35 |

Levels: ROADMAP said 37 at the top, but Comandante Mutis already has 37 and the jaguar is 40, so the leader's ace
is 39 (still under gym 6's 43). No evolved form below its level (Oropelón 32, Ranojón 33, Hojarasco 24, Cocotero 26).

## The puzzle: follow yesterday's steps

Hidden nettles (*ortigas*) grow in the grass. Ortiga's diary, by the entrance, tells how she walked to her chair
yesterday; every other way has nettles on it. Step on one: «¡Ay! Había ortigas escondidas en el pasto. ¡Pican
mucho!» and you run back to the entrance. Learning point: the preterite of everyday verbs (*entré, doblé, crucé,
caminé, subí, llegué*), read for meaning.

The diary (a sign at 5,15):
> «Diario de Ortiga. Ayer entré a mi jardín. En la fuente, doblé a la izquierda. Crucé el puente y caminé entre las
> orquídeas. En el árbol de cacao, doblé a la derecha. Después, subí por el camino del medio... ¡y llegué a mi silla
> sin una sola picadura!»
>
> "Ortiga's diary. Yesterday I went into my garden. At the fountain, I turned left. I crossed the bridge and walked
> among the orchids. At the cacao tree, I turned right. Then I went up the middle path... and reached my chair
> without a single sting!"

The map (14×17, checked: only the diary's way avoids every nettle, and each trainer stands where that way can't
get past them). `x` is a new tile, a thorny hedge (*zarza*); `n` marks a hidden nettle (a trigger on plain grass,
drawn as `.`); the letters 1–3 are the trainers, `O` is Ortiga.

```
##############
#xxxxxPOPxxxx#   O Ortiga (7,1), cacao plants beside her chair
#x..........x#
#x.xxxx.xxx.x#
#xnxxxx.3xxnx#   3 Iris (8,4) looks left at the middle path; nettles (2,4) (11,4)
#P..........x#   P the cacao tree (1,5)
#x*xxxxxxxxnx#   * orchids; nettle (11,6)
#x*2xxxxxxx.x#   2 Chepe (3,7) looks left at the orchids
#x*xxxxxxxx.x#
#~H~~~~~~~~H~#   two bridges over a stream
#x.xxxxxxxx.x#
#x.xxxxxxxx.x#
#x....FF.n..x#   F the fountain; nettle (9,12)
#xxx1.FF..xxx#   1 Azucena (4,13) looks up at the way left
#xxxx......xx#
#xxxxS..xxxxx#   S the diary; the guide stands by the door
#xxxxxmmxxxxx#
```

**The guide** (like Taller de Pólvora's): «¡Hola! Cuidado: aquí hay ortigas escondidas en el pasto. Lee el diario
de Ortiga: ella sabe por dónde caminar.» / "Hi! Careful: there are nettles hidden in the grass. Read Ortiga's
diary: she knows where to walk."

## The trainers' lines (all in the past tense)

- **Azucena:** «Ayer regué todas las plantas del jardín. ¡Hoy toca una batalla!» / beaten «¡Ay! Me marchité.» /
  after «¿Leíste el diario de Ortiga? Yo lo leí tres veces.»
- **Chepe:** «Esta mañana encontré una orquídea nueva. ¡No la pises!» / «Perdí... pero la orquídea está bien.» /
  «Ortiga me enseñó todo: qué plantas curan y qué plantas pican.»
- **Iris:** «¡Llegaste al camino del medio! ¿Quién te dijo por dónde caminar?» / «Leíste bien el diario.» /
  «La líder está ahí arriba, en su silla. ¡Suerte!»

## Ortiga

- If a nettle got you: «¡Te picaron mis ortigas! No te preocupes: a mí también me picaron cuando era niña.»
- «Me llamo Ortiga. Como la planta: soy suave... ¡pero si me tocas, pico!» / "My name is Ortiga. Like the plant: I'm
  soft... but if you touch me, I sting!"
- «Ayer fui a la selva. Encontré a Federico y me contó todo: Mutis, la máquina, la jaguar... Gracias, {name}.» /
  "Yesterday I went to the jungle. I found Federico and he told me everything: Mutis, the machine, the jaguar...
  Thank you, {name}."
- ready «¿Estás list{o/a}?» · not ready «Las plantas tienen paciencia. Yo también.» / "Plants are patient. So am I."
- outro «¡Me ganaste! Fue como una tormenta en la selva.» / "You beat me! It was like a storm in the jungle."
- after: «Con esta medalla, tus Palabritas pueden cortar arbolitos delgados. Hojarasco, Hormigón, Perezosito...
  ¡ellos saben cortar!» · «Al norte de la Ruta 4 hay un arbolito así. Detrás empieza un camino nuevo.» · «Y para
  volver a casa: cerca del templo hay otro, en el camino a la Ruta 4.» Then the end-of-part message, like Don Tizón's.
- beaten: «Ayer una ortiga me picó... ¡otra vez! Nunca aprendo.» / "Yesterday a nettle stung me... again! I never
  learn."

## Villa Jaguar's buildings

The town has no interiors yet. Doors: the Palacentro (5,12) with `centro()`, the shop (14,5) with `tienda()`, two
houses (13,12) and (20,12) with `casa()` and different `HOUSES` layouts (their people come with the townspeople
step), the gym (22,5). **The gym's door is gated** until `jaguarPiedra`: a gardener in front of it (22,6),
«La líder Ortiga se fue a la selva. Dice que está demasiado callada... Yo la espero aquí.» / "Leader Ortiga went into
the jungle. She says it's far too quiet... I'm waiting for her here."

## To build (one session)

1. The thorny hedge tile `x` (art in the jungle palette), the nettle triggers and the run back to the door.
2. `gym_jaguar`, Villa Jaguar's doors and interiors, the gate.
3. Trainers, Ortiga's look and portrait (placeholder from existing heads), `gymLeader('ortiga', …)`, Medalla Espina.
4. tests/gym5.test.mjs: the gate before and after the temple; a nettle sends you back; the diary's way reaches
   Ortiga; winning gives the medal and Cut works on Ruta 4's tree.

Later in region 5 (plans/region5-jungle.md): the townspeople, the temple's puzzles, the jaguar's roar. Fly comes
with gym 6 (plans/surf-fly.md).

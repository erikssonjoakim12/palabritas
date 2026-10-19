# Palabritas still to add (region 4)

Regions 2 and 3's Palabritas and the family changes are in the game (src/data/species.ts). Region 4's are below,
ready to paste into `src/data/species.ts`: the object entries go inside `SPECIES`, the `evolution()` calls after it (as Hamburguesón's are today). It uses the existing helper `m(name, type, mode, level?)`, and
`evolution(from, level, {...})` with an optional `catchRate`.

**How the data is built:**
- **Stats:**
  - first stages total about 180–210;
  - second stages about 250–290;
  - three-stage families start lower;
  - single-stage rare ones about 210–265.
- **Moves:**
  - 4 per family, one per challenge mode: choose (tap), type (write), listen, speak.
  - Without a level, listen comes at 6 and speak at 10.
  - Evolved forms share their family's moves, theme and words.
- **Look:** the one-line description for the placeholder drawing, and for the user's art prompt later.
- **Placeholder drawings:** simple shapes in `DRAW` (src/art/creatures.ts), 48×48, one clear silhouette,
  2–3 main colors from the master palette and a hard outline. They only need to read as "a squirrel", not be
  pretty.
- **IDs** have no accents; **names** do.
- **Where** a Palabrita lives and at what level is in the region specs.

---

## 1. Region 4 — volcanoes and dry forest

```ts
brasita: {   // the user's art; a late, powerful family (the user: 32 and 50)
  id: 'brasita', name: 'Brasita', types: ['Fuego'], theme: 'animales',
  base: { hp: 45, atk: 60, def: 45, spd: 55 },
  moves: [m('Brasas', 'Fuego', 'choose'), m('Coletazo', 'Normal', 'type'), m('Calor del Sol', 'Fuego', 'listen'), m('Llamarada', 'Fuego', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Toma el sol en las piedras del volcán. Las brasas de su cola nunca se apagan.', en: 'It sunbathes on the volcano’s rocks. The embers on its tail never go out.' },
},
evolution('brasita', 32, { id: 'brasaurio', name: 'Brasaurio', types: ['Fuego'], base: { hp: 70, atk: 92, def: 70, spd: 80 },
  dex: { es: 'Su piel es dura como la roca volcánica. Cuando ruge, le salen chispas de la boca.', en: 'Its skin is as hard as volcanic rock. When it roars, sparks fly from its mouth.' } });
evolution('brasaurio', 50, { id: 'volcasaurio', name: 'Volcasaurio', types: ['Fuego', 'Dragón'], base: { hp: 95, atk: 125, def: 95, spd: 105 },
  dex: { es: 'Dicen que duerme dentro del volcán. Cuando despierta, toda la montaña tiembla.', en: 'They say it sleeps inside the volcano. When it wakes up, the whole mountain shakes.' } });

hormiguita: {
  id: 'hormiguita', name: 'Hormiguita', types: ['Bicho', 'Planta'], theme: 'trabajo',
  base: { hp: 40, atk: 56, def: 50, spd: 52 },
  moves: [m('Pellizco', 'Bicho', 'choose'), m('Cortar Hoja', 'Planta', 'type'), m('Trabajo en Equipo', 'Normal', 'listen'), m('Hoja Gigante', 'Planta', 'speak')],
  catchRate: 0.55,
  dex: { es: 'Trabaja todo el día. Lleva hojas más grandes que su cuerpo.', en: 'It works all day. It carries leaves bigger than its body.' },
},
evolution('hormiguita', 22, { id: 'hormigon', name: 'Hormigón', types: ['Bicho', 'Roca'], base: { hp: 66, atk: 84, def: 92, spd: 40 },
  dex: { es: 'Su cuerpo es de cemento. Ayuda a construir casas y puentes.', en: 'Its body is made of concrete. It helps build houses and bridges.' } });

chispita: {   // a firefly (the user: mix with animals)
  id: 'chispita', name: 'Chispita', types: ['Bicho', 'Fuego'], theme: 'fiesta',
  base: { hp: 38, atk: 56, def: 36, spd: 68 },
  moves: [m('Chispa', 'Fuego', 'choose'), m('Zumbido', 'Bicho', 'type'), m('Luz de Fiesta', 'Fuego', 'listen'), m('Fuegos Artificiales', 'Fuego', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Una luciérnaga con la cola llena de chispas. Le encantan las fiestas y la música.', en: 'A firefly with a tail full of sparks. It loves parties and music.' },
},
evolution('chispita', 26, { id: 'coheton', name: 'Cohetón', types: ['Bicho', 'Fuego'], base: { hp: 58, atk: 90, def: 54, spd: 96 },
  dex: { es: 'Un escarabajo enorme. Cuando se emociona, sale disparado al cielo como un cohete y deja una estela de colores.', en: 'A huge beetle. When it gets excited, it shoots into the sky like a rocket and leaves a trail of colors.' } });

chocoyito: {
  id: 'chocoyito', name: 'Chocoyito', types: ['Normal', 'Volador'], theme: 'conversacion',
  base: { hp: 42, atk: 46, def: 40, spd: 66 },
  moves: [m('Picotazo', 'Volador', 'choose'), m('Charla', 'Normal', 'type'), m('Repetir', 'Normal', 'listen'), m('Grito del Volcán', 'Fuego', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Repite todo lo que oye. Si le hablas en español, ¡te contesta en español!', en: 'It repeats everything it hears. Talk to it in Spanish and it answers in Spanish!' },
},
evolution('chocoyito', 25, { id: 'chocoyote', name: 'Chocoyote', types: ['Fuego', 'Volador'], base: { hp: 64, atk: 72, def: 58, spd: 90 },
  dex: { es: 'Hace su nido dentro del cráter del volcán. El humo no le molesta.', en: 'It nests inside the volcano’s crater. The smoke doesn’t bother it.' } });

zopilotito: {
  id: 'zopilotito', name: 'Zopilotito', types: ['Volador', 'Siniestro'], theme: 'ciudad',
  base: { hp: 50, atk: 48, def: 46, spd: 50 },
  moves: [m('Picotazo', 'Volador', 'choose'), m('Barrer', 'Normal', 'type'), m('Vuelo en Círculos', 'Volador', 'listen'), m('Sombra Negra', 'Siniestro', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Limpia las calles de la ciudad. Sin él, todo estaría sucio.', en: 'It cleans the city streets. Without it, everything would be dirty.' },
},
evolution('zopilotito', 28, { id: 'zopiloton', name: 'Zopilotón', types: ['Volador', 'Siniestro'], base: { hp: 80, atk: 74, def: 66, spd: 70 },
  dex: { es: 'Vuela en círculos sobre la ciudad. Desde arriba, conoce todas las calles.', en: 'It circles over the city. From above, it knows every street.' } });

venadito: {   // a fawn in a festival mask (the user: mix with animals)
  id: 'venadito', name: 'Venadito', types: ['Normal'], theme: 'ropa',
  base: { hp: 46, atk: 52, def: 46, spd: 60 },
  moves: [m('Cornada', 'Normal', 'choose'), m('Disfraz', 'Normal', 'type'), m('Desfile', 'Normal', 'listen'), m('Baile del Toro', 'Lucha', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Un venadito que se pone una máscara de fiesta. ¡Le encanta disfrazarse y bailar!', en: 'A fawn that puts on a festival mask. It loves dressing up and dancing!' },
},
evolution('venadito', 30, { id: 'torovenado', name: 'Torovenado', types: ['Normal', 'Lucha'], base: { hp: 74, atk: 86, def: 70, spd: 80 },
  dex: { es: 'Baila en el desfile del Torovenado. Tiene cuernos de toro y astas de venado.', en: 'It dances in the Torovenado parade. It has a bull’s horns and a deer’s antlers.' } });

perezosito: {   // a sloth asleep in the hammock (the user: instead of a hammock)
  id: 'perezosito', name: 'Perezosito', types: ['Normal', 'Psíquico'], theme: 'rutina',
  base: { hp: 80, atk: 40, def: 60, spd: 30 },
  moves: [m('Bostezo', 'Normal', 'choose'), m('Balanceo', 'Normal', 'type'), m('Canción de Cuna', 'Psíquico', 'listen'), m('Siesta', 'Psíquico', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Duerme en una hamaca casi todo el día. Se despierta tarde, desayuna... ¡y vuelve a dormir!', en: 'It sleeps in a hammock most of the day. It wakes up late, has breakfast... and goes back to sleep!' },
},

lamparita: {
  id: 'lamparita', name: 'Lamparita', types: ['Fantasma', 'Fuego'], theme: 'emociones',
  base: { hp: 50, atk: 64, def: 48, spd: 62 },
  moves: [m('Llama Fantasma', 'Fantasma', 'choose'), m('Luz Triste', 'Fuego', 'type'), m('Susurro', 'Fantasma', 'listen'), m('Fuego Azul', 'Fuego', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Cambia de color con su humor: azul si está triste, rojo si está enojada.', en: 'It changes color with its mood: blue when sad, red when angry.' },
},
```

| Palabrita | Look |
|---|---|
| Brasita | (the user's art) |
| Brasaurio | a bigger fire lizard with rock-hard dark scales and embers along its back |
| Volcasaurio | a huge volcanic dragon-lizard, lava glowing between its scales |
| Hormiguita | a red leafcutter ant carrying a leaf bigger than itself, wearing a tiny hard hat |
| Hormigón | a big ant built from gray concrete blocks, carrying a stone slab |
| Chispita | a firefly whose glowing tail throws sparks like a firework |
| Cohetón | a big beetle with a rocket-shaped shell and a trail of colorful sparks |
| Chocoyito | a green parakeet (*chocoyo*) with an orange forehead and a chatty open beak |
| Chocoyote | a big parakeet with flame-colored wing tips |
| Zopilotito | a scruffy black vulture chick with a bald gray head, holding a tiny broom |
| Zopilotón | a big black vulture with broad wings and a street-sweeper's cap |
| Venadito | a fawn wearing a colorful festival mask with ribbons |
| Torovenado | a dancing stag-bull: deer antlers and bull horns, a festival mask and ribbons |
| Perezosito | a baby sloth asleep in a striped Nicaraguan hammock |
| Lamparita | an old oil lamp with a ghostly flame face |

---

## 2. The Palabrita list order (`DEX_ORDER`, src/data/species.ts)

Append region 4's families in the order you meet them:

```
brasita brasaurio volcasaurio hormiguita hormigon zopilotito zopiloton chocoyito chocoyote chispita coheton
lamparita perezosito venadito torovenado
```

`data.test` should check that every species is in `DEX_ORDER` exactly once.

---

## 3. Art priority (for the user, whenever they want to make real art)

Done so far: the starters' three stages, Pajarito, Palomón, Conejito, Liebrón, Hojadillo, Mordisquito, Brasita.

1. Gym leaders' strongest Palabritas and the gifts: Petroglifón, Mordiscón, Cohetón, Paslamita,
   Caparazonte, Venadito, Brasaurio.
2. The ones you meet most: Ardillita, Colibrí, Espinita, Cangrejito, Coquito, Chispita, Chocoyito,
   Gusanito, Hormiguita.
3. Everything else.

To bring art in, use the recipe in CLAUDE.md ("The user's art").

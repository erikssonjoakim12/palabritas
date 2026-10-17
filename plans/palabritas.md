# Palabritas for gyms 2–4: the full sheet

Ready to paste into `src/data/species.ts`: the object entries go inside `SPECIES`, the `evolution()` calls after it (as Hamburguesón's are today). It uses the existing helper `m(name, type, mode, level?)`, and
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

## 1. Changes to existing families (phase 1)

```ts
// Gusanito → Capullito → Mariposita. Mariposita moves from its own entry to the third stage.
// seed keeps the family's word sample exactly what Mariposita had (existing saves don't change).
gusanito: {
  id: 'gusanito', name: 'Gusanito', types: ['Bicho'], theme: 'colores', seed: 'mariposita',
  base: { hp: 40, atk: 36, def: 40, spd: 44 },
  moves: [m('Polvillo', 'Bicho', 'choose'), m('Seda', 'Bicho', 'type'), m('Arcoíris', 'Normal', 'listen', 5), m('Vuelo Colorido', 'Bicho', 'speak', 8)],
  catchRate: 0.65,
  dex: { es: 'Come hojas todo el día. Sus rayas tienen todos los colores del arcoíris.', en: 'It eats leaves all day. Its stripes have every color of the rainbow.' },
},
evolution('gusanito', 7, { id: 'capullito', name: 'Capullito', types: ['Bicho'], base: { hp: 46, atk: 28, def: 66, spd: 28 },
  dex: { es: 'Duerme envuelto en hojas. Adentro, sus alas cambian de color.', en: 'It sleeps wrapped in leaves. Inside, its wings change color.' } });
evolution('capullito', 10, { id: 'mariposita', name: 'Mariposita', types: ['Bicho', 'Volador'], catchRate: 0.3,
  base: { hp: 42, atk: 44, def: 45, spd: 60 }, dex: /* keep Mariposita's current dex */ });

// Pajarito → Palomón (Palomón keeps its name, types, stats and dex; it now uses Pajarito's moves).
evolution('pajarito', 14, { id: 'palomon', /* keep the rest of Palomón's current entry */ catchRate: 0.25 });

evolution('conejito', 18, { id: 'liebron', name: 'Liebrón', types: ['Normal'], base: { hp: 62, atk: 66, def: 55, spd: 88 },
  dex: { es: 'Corre tan rápido que cuenta sus pasos de mil en mil.', en: 'It runs so fast it counts its steps a thousand at a time.' } });

// Cojincito → Sillón (seed keeps Sillón's words).
cojincito: {
  id: 'cojincito', name: 'Cojincito', types: ['Normal', 'Fantasma'], theme: 'casa', seed: 'sillon',
  base: { hp: 44, atk: 38, def: 54, spd: 32 },
  moves: /* Sillón's current moves */ [m('Cojinazo', 'Normal', 'choose'), m('Resorte', 'Normal', 'type'), m('Crujido', 'Fantasma', 'listen', 7), m('Siesta Eterna', 'Fantasma', 'speak', 12)],
  catchRate: 0.5,
  dex: { es: 'Un cojín que flota de noche. Si te sientas encima, se ríe.', en: 'A cushion that floats at night. If you sit on it, it laughs.' },
},
evolution('cojincito', 18, { id: 'sillon', /* keep Sillón's current name, types, base and dex */ catchRate: 0.25 });

evolution('hojadillo', 24, { id: 'hojarasco', name: 'Hojarasco', types: ['Planta', 'Tierra'], base: { hp: 72, atk: 72, def: 90, spd: 50 },
  dex: { es: 'Su caparazón es un montón de hojas secas. En primavera le salen flores.', en: 'Its shell is a pile of dry leaves. In spring, flowers grow on it.' } });
evolution('ecolin', 22, { id: 'murcielon', name: 'Murcielón', types: ['Volador', 'Siniestro'], base: { hp: 68, atk: 70, def: 60, spd: 88 },
  dex: { es: 'Sus orejas oyen una hoja caer al otro lado de la cueva.', en: 'Its ears hear a leaf fall on the other side of the cave.' } });
evolution('ochopatas', 24, { id: 'taranton', name: 'Tarantón', types: ['Bicho', 'Veneno'], base: { hp: 66, atk: 80, def: 64, spd: 64 },
  dex: { es: 'Tiene ocho ojos en fila. Con cuatro mira adelante y con cuatro, atrás.', en: 'It has eight eyes in a row. Four look ahead and four look behind.' } });
evolution('cuernito', 26, { id: 'herculeo', name: 'Hercúleo', types: ['Bicho', 'Lucha'], base: { hp: 72, atk: 92, def: 80, spd: 48 },
  dex: { es: 'Levanta cien veces su peso. Su caparazón brilla con todos los colores.', en: 'It lifts a hundred times its weight. Its shell shines with every color.' } });
```

| New form | Look |
|---|---|
| Gusanito | a chubby caterpillar with rainbow stripes and tiny pink feet |
| Capullito | a sleepy cocoon wrapped in leaves, colorful wing tips peeking out |
| Liebrón | a lean, fast hare with big feet and a number pattern on its fur |
| Cojincito | a floating red cushion with a tassel and sleepy eyes |
| Hojarasco | a big armadillo whose shell is a pile of dry leaves, with a flowering bush on its back |
| Murcielón | a big purple bat with ears like satellite dishes and a wide mouth |
| Tarantón | a huge hairy tarantula with striped legs and eight eyes in a row |
| Hercúleo | a Hercules beetle with a long double horn and a rainbow-shiny shell |

---

## 2. Region 2 — pine highlands

```ts
piedrita: {
  id: 'piedrita', name: 'Piedrita', types: ['Roca'], theme: 'cuerpo',
  base: { hp: 48, atk: 52, def: 70, spd: 28 },
  moves: [m('Lanzarrocas', 'Roca', 'choose'), m('Cabezazo', 'Normal', 'type'), m('Grabado', 'Roca', 'listen'), m('Avalancha', 'Roca', 'speak')],
  catchRate: 0.45,
  dex: { es: 'Tiene una cara dibujada hace mil años. Cuando se aburre, se dibuja otra.', en: 'It has a face drawn a thousand years ago. When it gets bored, it draws a new one.' },
},
evolution('piedrita', 18, { id: 'petroglifon', name: 'Petroglifón', types: ['Roca', 'Tierra'], base: { hp: 70, atk: 78, def: 96, spd: 36 },
  dex: { es: 'Las espirales de su cuerpo brillan de noche. Cuenta historias muy antiguas.', en: 'The spirals on its body glow at night. It tells very old stories.' } });

ollita: {
  id: 'ollita', name: 'Ollita', types: ['Tierra'], theme: 'cocina',
  base: { hp: 50, atk: 46, def: 62, spd: 40 },
  moves: [m('Tapazo', 'Normal', 'choose'), m('Barro', 'Tierra', 'type'), m('Hervor', 'Fuego', 'listen'), m('Olla Exprés', 'Tierra', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Siempre tiene algo rico cocinándose adentro. Nadie sabe qué es.', en: 'There’s always something tasty cooking inside. Nobody knows what it is.' },
},
evolution('ollita', 21, { id: 'tinajon', name: 'Tinajón', types: ['Tierra', 'Agua'], base: { hp: 80, atk: 62, def: 84, spd: 44 },
  dex: { es: 'Guarda agua fresca todo el año. En los días de calor, la comparte con todos.', en: 'It keeps fresh water all year. On hot days it shares it with everyone.' } });

ardillita: {
  id: 'ardillita', name: 'Ardillita', types: ['Normal'], theme: 'deportes',
  base: { hp: 42, atk: 48, def: 38, spd: 70 },
  moves: [m('Voltereta', 'Normal', 'choose'), m('Patada', 'Lucha', 'type'), m('Silbato', 'Normal', 'listen'), m('Salto Mortal', 'Lucha', 'speak')],
  catchRate: 0.55,
  dex: { es: 'Hace ejercicio todas las mañanas. Su cola es más grande que su cuerpo.', en: 'It exercises every morning. Its tail is bigger than its body.' },
},
evolution('ardillita', 20, { id: 'ardillon', name: 'Ardillón', types: ['Normal', 'Lucha'], base: { hp: 64, atk: 72, def: 56, spd: 90 },
  dex: { es: 'Gana todas las carreras del bosque. Después, hace cien abdominales.', en: 'It wins every race in the forest. Then it does a hundred sit-ups.' } });

colibri: {
  id: 'colibri', name: 'Colibrí', types: ['Volador'], theme: 'musica',
  base: { hp: 36, atk: 44, def: 36, spd: 80 },
  moves: [m('Pico Fino', 'Volador', 'choose'), m('Tararear', 'Normal', 'type'), m('Melodía', 'Normal', 'listen'), m('Concierto', 'Volador', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Mueve las alas ochenta veces por segundo. Su zumbido suena como una canción.', en: 'It beats its wings eighty times a second. Its hum sounds like a song.' },
},
evolution('colibri', 22, { id: 'zumbador', name: 'Zumbador', types: ['Volador', 'Eléctrico'], base: { hp: 54, atk: 64, def: 50, spd: 104 },
  dex: { es: 'Cuando canta, las flores se abren. Su garganta brilla como una lámpara.', en: 'When it sings, flowers open. Its throat shines like a lamp.' } });

espinita: {
  id: 'espinita', name: 'Espinita', types: ['Normal'], theme: 'salud',
  base: { hp: 46, atk: 44, def: 52, spd: 38 },
  moves: [m('Pinchazo', 'Normal', 'choose'), m('Agujas', 'Acero', 'type'), m('Cola Prensil', 'Normal', 'listen'), m('Lluvia de Púas', 'Acero', 'speak')],
  catchRate: 0.5,
  dex: { es: 'De bebé, sus púas son suaves. Le encanta comer fruta madura.', en: 'As a baby its spines are soft. It loves to eat ripe fruit.' },
},
evolution('espinita', 22, { id: 'puercoespin', name: 'Puercoespín', types: ['Normal', 'Acero'], base: { hp: 72, atk: 70, def: 84, spd: 48 },
  dex: { es: 'Cuida a los Palabritas heridos del bosque. Dicen que sus púas curan.', en: 'It looks after hurt Palabritas in the forest. They say its spines heal.' } });

caparazonte: {
  id: 'caparazonte', name: 'Caparazonte', types: ['Roca', 'Tierra'], theme: 'historia',
  base: { hp: 52, atk: 56, def: 78, spd: 24 },
  moves: [m('Caparazón', 'Normal', 'choose'), m('Excavar', 'Tierra', 'type'), m('Eco Antiguo', 'Roca', 'listen'), m('Cola Maza', 'Roca', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Vivió hace diez mil años. Un museo lo despertó, ¡y ahora quiere ver el mundo!', en: 'It lived ten thousand years ago. A museum woke it up, and now it wants to see the world!' },
},
evolution('caparazonte', 30, { id: 'gliptodon', name: 'Gliptodón', types: ['Roca', 'Tierra'], base: { hp: 90, atk: 84, def: 110, spd: 30 },
  dex: { es: 'Su caparazón es grande como un carro. Antes, los gliptodontes vivían en toda América.', en: 'Its shell is as big as a car. Long ago, glyptodons lived all over the Americas.' } });

guardabarranco: {
  id: 'guardabarranco', name: 'Guardabarranco', types: ['Normal', 'Volador'], theme: 'latinoamerica',
  base: { hp: 60, atk: 62, def: 58, spd: 84 },
  moves: [m('Picotazo', 'Volador', 'choose'), m('Cola Raqueta', 'Normal', 'type'), m('Canto del Barranco', 'Normal', 'listen'), m('Vuelo Turquesa', 'Volador', 'speak')],
  catchRate: 0.15,
  dex: { es: 'Es el ave nacional de Nicaragua. Viaja por toda América y conoce muchos países.', en: 'It’s Nicaragua’s national bird. It travels all over the Americas and knows many countries.' },
},
```

| Palabrita | Look |
|---|---|
| Piedrita | a round gray pebble with a petroglyph face and stick-figure arms carved on it |
| Petroglifón | a tall standing stone covered in glowing carved spirals and stick figures, with stone arms |
| Ollita | a small clay cooking pot with painted patterns, steam puffing from its lid |
| Tinajón | a big round clay water jar (*tinaja*), water sloshing inside, a cork for a hat |
| Ardillita | a squirrel with a huge two-tone bushy tail, doing a cartwheel |
| Ardillón | a big acrobatic squirrel with a sweatband and a tail like a pom-pom |
| Colibrí | a tiny hummingbird with a shiny green throat, wings a blur, humming music notes |
| Zumbador | a bigger hummingbird with a needle beak and a glowing throat, leaving music notes behind |
| Espinita | a baby porcupine with soft spines and a curly gripping tail |
| Puercoespín | a round porcupine with a doctor's head mirror, its spines like syringes |
| Caparazonte | a small ancient armadillo with a domed bony shell, cracked like old stone |
| Gliptodón | a giant prehistoric armadillo with a huge dome shell and a spiked tail club |
| Guardabarranco | turquoise brows, green body, rust belly, a long tail with two racket-shaped tips |

---

## 3. Region 3 — the coast

```ts
cangrejito: {
  id: 'cangrejito', name: 'Cangrejito', types: ['Agua'], theme: 'playa',
  base: { hp: 42, atk: 58, def: 56, spd: 36 },
  moves: [m('Pinza', 'Normal', 'choose'), m('Burbuja', 'Agua', 'type'), m('Ola', 'Agua', 'listen'), m('Martillazo', 'Agua', 'speak')],
  catchRate: 0.55,
  dex: { es: 'Camina de lado por la playa. Si ve una toalla, se la lleva.', en: 'It walks sideways along the beach. If it sees a towel, it takes it.' },
},
evolution('cangrejito', 22, { id: 'cangrejon', name: 'Cangrejón', types: ['Agua', 'Lucha'], base: { hp: 66, atk: 92, def: 80, spd: 40 },
  dex: { es: 'Sus pinzas son guantes de boxeo. Practica en la playa todos los días.', en: 'Its claws are boxing gloves. It trains on the beach every day.' } });

coquito: {
  id: 'coquito', name: 'Coquito', types: ['Planta'], theme: 'frutas',
  base: { hp: 50, atk: 44, def: 58, spd: 36 },
  moves: [m('Cabezazo', 'Normal', 'choose'), m('Agua de Coco', 'Agua', 'type'), m('Hoja de Palma', 'Planta', 'listen'), m('Lluvia de Cocos', 'Planta', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Cae de las palmeras cuando hay viento. Por dentro tiene agua dulce y fresca.', en: 'It falls from palm trees when it’s windy. Inside it has sweet, fresh water.' },
},
evolution('coquito', 26, { id: 'cocotero', name: 'Cocotero', types: ['Planta', 'Agua'], base: { hp: 80, atk: 70, def: 76, spd: 48 },
  dex: { es: 'Da sombra a toda la playa. Los turistas descansan debajo de él.', en: 'It shades the whole beach. Tourists rest underneath it.' } });

mordisquito: {   // the user's art (style/palabritas.ts)
  id: 'mordisquito', name: 'Mordisquito', types: ['Agua'], theme: 'mar',
  base: { hp: 46, atk: 60, def: 42, spd: 58 },
  moves: [m('Aleta', 'Agua', 'choose'), m('Mordisco', 'Siniestro', 'type'), m('Remolino', 'Agua', 'listen'), m('Tiburonazo', 'Agua', 'speak')],
  catchRate: 0.4,
  dex: { es: 'Nada en el mar desde que nace. Si se le cae un diente, le crece otro.', en: 'It swims in the sea from birth. If it loses a tooth, a new one grows.' },
},
evolution('mordisquito', 25, { id: 'mordiscon', name: 'Mordiscón', types: ['Agua', 'Siniestro'], base: { hp: 74, atk: 98, def: 62, spd: 80 },
  dex: { es: 'Algunos viven en el gran lago de Nicaragua: ¡un tiburón de agua dulce!', en: 'Some live in Nicaragua’s great lake: a freshwater shark!' } });

mojarrita: {
  id: 'mojarrita', name: 'Mojarrita', types: ['Agua'], theme: 'pesca',
  base: { hp: 38, atk: 34, def: 40, spd: 58 },
  moves: [m('Salpicar', 'Agua', 'choose'), m('Coletazo', 'Normal', 'type'), m('Burbujitas', 'Agua', 'listen'), m('Gran Salto', 'Normal', 'speak')],
  catchRate: 0.7,
  dex: { es: 'El pez más común del río. Salta tan alto que a veces cae en el bote del pescador.', en: 'The most common fish in the river. It jumps so high it sometimes lands in the fisherman’s boat.' },
},

pelicanito: {
  id: 'pelicanito', name: 'Pelicanito', types: ['Agua', 'Volador'], theme: 'viaje',
  base: { hp: 48, atk: 46, def: 44, spd: 56 },
  moves: [m('Picotazo', 'Volador', 'choose'), m('Clavado', 'Agua', 'type'), m('Viento de Mar', 'Volador', 'listen'), m('Vuelo Largo', 'Volador', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Lleva sus cosas en la bolsa del pico. Siempre está listo para viajar.', en: 'It carries its things in its beak pouch. It’s always ready to travel.' },
},
evolution('pelicanito', 22, { id: 'maleticano', name: 'Maletícano', types: ['Agua', 'Volador'], base: { hp: 70, atk: 70, def: 64, spd: 76 },
  dex: { es: 'Ha volado a todos los países de América. Su bolsa está llena de recuerdos.', en: 'It has flown to every country in the Americas. Its pouch is full of souvenirs.' } });

paslamita: {
  id: 'paslamita', name: 'Paslamita', types: ['Agua'], theme: 'familia',
  base: { hp: 52, atk: 40, def: 60, spd: 40 },
  moves: [m('Placaje', 'Normal', 'choose'), m('Pistola Agua', 'Agua', 'type'), m('Arena Mojada', 'Tierra', 'listen'), m('Gran Ola', 'Agua', 'speak')],
  catchRate: 0.45,
  dex: { es: 'Nace en la arena y corre al mar. De grande, vuelve a la misma playa para tener a sus bebés.', en: 'It hatches in the sand and runs to the sea. As an adult it returns to the same beach to have its babies.' },
},
evolution('paslamita', 28, { id: 'paslamona', name: 'Paslamona', types: ['Agua', 'Tierra'], base: { hp: 96, atk: 64, def: 92, spd: 44 },
  dex: { es: 'Cada año vuelve a su playa con miles de tortugas. ¡Es la noche de la arribada!', en: 'Every year it returns to its beach with thousands of turtles. It’s the night of the arribada!' } });
```

| Palabrita | Look |
|---|---|
| Cangrejito | a small red crab with one big claw and eyes on stalks |
| Cangrejón | a huge crab with boxing-glove claws |
| Coquito | a green coconut with a cute face and a little palm-leaf tuft on top |
| Cocotero | a coconut-palm creature: a coconut head on a curved trunk, swaying frond arms |
| Mordisquito | (the user's art) |
| Mordiscón | a big bull shark with a wide grin full of teeth and a scar |
| Mojarrita | a small round striped fish (*mojarra*) with big surprised eyes |
| Pelicanito | a brown pelican chick whose pouch looks like a little backpack |
| Maletícano | a big pelican whose beak pouch is a travel suitcase covered in stickers |
| Paslamita | an olive ridley turtle hatchling with big eyes and a heart-shaped shell |
| Paslamona | a big mother sea turtle with a wide olive shell and strong flippers |

---

## 4. Region 4 — volcanoes and dry forest

```ts
garrobito: {
  id: 'garrobito', name: 'Garrobito', types: ['Normal'], theme: 'animales',
  base: { hp: 44, atk: 50, def: 44, spd: 60 },
  moves: [m('Coletazo', 'Normal', 'choose'), m('Arañazo', 'Normal', 'type'), m('Calor del Sol', 'Fuego', 'listen'), m('Llamarada', 'Fuego', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Pasa el día tomando el sol en las piedras. Le dicen «garrobo» en Nicaragua.', en: 'It spends the day sunbathing on rocks. In Nicaragua they call it «garrobo».' },
},
evolution('garrobito', 24, { id: 'brasita', name: 'Brasita', types: ['Fuego'], base: { hp: 64, atk: 82, def: 60, spd: 80 },   // the user's art
  dex: { es: 'Vive cerca de los volcanes. Las brasas de su cola nunca se apagan.', en: 'It lives near volcanoes. The embers on its tail never go out.' } });

hormiguita: {
  id: 'hormiguita', name: 'Hormiguita', types: ['Bicho', 'Planta'], theme: 'trabajo',
  base: { hp: 40, atk: 56, def: 50, spd: 52 },
  moves: [m('Pellizco', 'Bicho', 'choose'), m('Cortar Hoja', 'Planta', 'type'), m('Trabajo en Equipo', 'Normal', 'listen'), m('Hoja Gigante', 'Planta', 'speak')],
  catchRate: 0.55,
  dex: { es: 'Trabaja todo el día. Lleva hojas más grandes que su cuerpo.', en: 'It works all day. It carries leaves bigger than its body.' },
},
evolution('hormiguita', 22, { id: 'hormigon', name: 'Hormigón', types: ['Bicho', 'Roca'], base: { hp: 66, atk: 84, def: 92, spd: 40 },
  dex: { es: 'Su cuerpo es de cemento. Ayuda a construir casas y puentes.', en: 'Its body is made of concrete. It helps build houses and bridges.' } });

chispita: {
  id: 'chispita', name: 'Chispita', types: ['Fuego'], theme: 'fiesta',
  base: { hp: 38, atk: 56, def: 36, spd: 68 },
  moves: [m('Chispa', 'Fuego', 'choose'), m('Pirueta', 'Normal', 'type'), m('Petardo', 'Fuego', 'listen'), m('Fuegos Artificiales', 'Fuego', 'speak')],
  catchRate: 0.5,
  dex: { es: 'Nace cuando alguien enciende un cohete. Le encantan las fiestas y la música.', en: 'It’s born when someone lights a rocket. It loves parties and music.' },
},
evolution('chispita', 26, { id: 'coheton', name: 'Cohetón', types: ['Fuego', 'Eléctrico'], base: { hp: 58, atk: 90, def: 54, spd: 96 },
  dex: { es: 'Sube al cielo y explota en mil colores, ¡pero siempre vuelve a casa!', en: 'It flies into the sky and bursts into a thousand colors, but it always comes home!' } });

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

mascarita: {
  id: 'mascarita', name: 'Mascarita', types: ['Fantasma', 'Normal'], theme: 'ropa',
  base: { hp: 46, atk: 52, def: 46, spd: 60 },
  moves: [m('Susto', 'Fantasma', 'choose'), m('Disfraz', 'Normal', 'type'), m('Desfile', 'Normal', 'listen'), m('Baile del Toro', 'Lucha', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Una máscara de fiesta con vida. Se pone ropa de colores para bailar.', en: 'A festival mask that’s alive. It puts on colorful clothes to dance.' },
},
evolution('mascarita', 30, { id: 'torovenado', name: 'Torovenado', types: ['Fantasma', 'Lucha'], base: { hp: 74, atk: 86, def: 70, spd: 80 },
  dex: { es: 'Baila en el desfile del Torovenado. Tiene cuernos de toro y de venado.', en: 'It dances in the Torovenado parade. It has a bull’s horns and a deer’s antlers.' } });

hamaquita: {
  id: 'hamaquita', name: 'Hamaquita', types: ['Normal'], theme: 'rutina',
  base: { hp: 80, atk: 40, def: 60, spd: 30 },
  moves: [m('Bostezo', 'Normal', 'choose'), m('Balanceo', 'Normal', 'type'), m('Canción de Cuna', 'Psíquico', 'listen'), m('Siesta', 'Psíquico', 'speak')],
  catchRate: 0.3,
  dex: { es: 'Se despierta tarde, se baña, desayuna... ¡y vuelve a dormir!', en: 'It wakes up late, takes a bath, has breakfast... and goes back to sleep!' },
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
| Garrobito | a small spiny-tailed iguana (*garrobo*) sunbathing, orange spines along its back |
| Brasita | (the user's art) |
| Hormiguita | a red leafcutter ant carrying a leaf bigger than itself, wearing a tiny hard hat |
| Hormigón | a big ant built from gray concrete blocks, carrying a stone slab |
| Chispita | a little firework spark: a star-shaped body with a fuse tail |
| Cohetón | a firework rocket with a grinning face, colorful stripes and a sparkling tail |
| Chocoyito | a green parakeet (*chocoyo*) with an orange forehead and a chatty open beak |
| Chocoyote | a big parakeet with flame-colored wing tips |
| Zopilotito | a scruffy black vulture chick with a bald gray head, holding a tiny broom |
| Zopilotón | a big black vulture with broad wings and a street-sweeper's cap |
| Mascarita | a colorful floating festival mask with ribbons |
| Torovenado | a dancing festival costume: bull horns, deer antlers, a mask and ribbons |
| Hamaquita | a striped Nicaraguan hammock that's always asleep, with a little face in the middle |
| Lamparita | an old oil lamp with a ghostly flame face |

---

## 5. The Palabrita list order (`DEX_ORDER`)

Families together, in the order you meet them:

```
salchichita hamburgueson gotita nubarron aguacatito aguacatono
pajarito palomon conejito liebron gusanito capullito mariposita cojincito sillon
hojadillo hojarasco ecolin murcielon ochopatas taranton cuernito herculeo
ardillita ardillon colibri zumbador espinita puercoespin piedrita petroglifon ollita tinajon
caparazonte gliptodon guardabarranco
cangrejito cangrejon coquito cocotero pelicanito maleticano mojarrita mordisquito mordiscon paslamita paslamona
garrobito brasita hormiguita hormigon zopilotito zopiloton chocoyito chocoyote chispita coheton
lamparita hamaquita mascarita torovenado
```

`data.test` should check that every species is in `DEX_ORDER` exactly once.

---

## 6. Art priority (for the user, whenever they want to make real art)

1. Gym leaders' strongest Palabritas and the gifts: Petroglifón, Mordiscón, Cohetón, Paslamita,
   Caparazonte, Mascarita.
2. The ones you meet most: Ardillita, Colibrí, Espinita, Cangrejito, Coquito, Chispita, Chocoyito,
   Gusanito, Garrobito.
3. Everything else.

To bring art in, use the recipe in CLAUDE.md ("The user's art").

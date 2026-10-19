# Spanish content still to write (region 4)

The content for gyms 2–3 is in the game (src/data/content/): the A2 core for levels 21–40 (core.ts), 13 new
themes and 5 school topics. What's left is region 4's: the 8 themes and 2 school topics below. Latin American Spanish (with some Nicaraguan words, marked); the English is
what the EN button shows.

**How content works** (src/data/content/, see CLAUDE.md "A theme"):
- A line is `'spanish | other accepted forms = english'`. The first Spanish form is the one shown.
- The **same Spanish in two lists is one shared item** (it keeps the English of the list built first:
  the core, then the themes in the order of `build`).
  - Never use the same Spanish with a different meaning in two lists ("la receta" can't be both recipe and
    prescription).
  - The same Spanish twice in **one** list makes the build throw.
- A theme is one list, easiest first: 27 words (levels 2–10, 3 per level), 40 short phrases (11–20, 4 per
  level), then sentences (3 per level from 21). **157 lines reach level 50** (every theme in the game has that).
- After adding content, `npm test -- data` checks every Palabrita has words at every level to 30. Then run
  `node tools/sim.mjs` to see answers per level.

**Writing the rest:**
- §1 gives each theme's 27 words in full, and what its 40 phrases and 50 sentences should cover, with
  examples (use them; they count toward the 40 and 50).
- Write the rest in the same style:
  - short and natural, for a beginner;
  - Latin American;
  - accept the common variants with `|`;
  - gendered forms as `cansado | cansada`.
- Sentences follow the grammar order of the core at those levels (core.ts): present tense, *ir a*, *gustar*,
  routines, comparisons, directions, shopping; the past tense from about level 31.

---

## 1. The 8 themes still to write

One file each in `src/data/content/<id>.ts`, in the shape of `perro.ts`; then import each one and add it
to the `build` list in `index.ts`. The theme ids are the `theme` values in
[palabritas.md](palabritas.md).

### La fiesta (`fiesta`): Parties

**Family:** Chispita → Cohetón. **Focus:** Celebrations: birthdays (the piñata!), fireworks, festivals, inviting and thanking.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la piñata = the piñata',
    'las velas = the candles',
    'el globo = the balloon',
    'la invitación = the invitation',
    'los fuegos artificiales = the fireworks',
    'el cohete = the rocket, the firework',
    'el disfraz = the costume',
    'el invitado | la invitada = the guest',
    'la sorpresa = the surprise',
    'divertirse = to have fun',
    'brindar = to toast',
    'el Año Nuevo = New Year',
    'el desfile = the parade',
    'la feria = the fair',
    'los dulces = the candy',
    'la decoración = the decoration',
    'el baile = the dance',
    'la pólvora = the gunpowder, the fireworks',
    'el mariachi = the mariachi band',
    'la comida típica = the traditional food',
    'los vecinos = the neighbors',
    'la serenata = the serenade',
    'aplaudir = to clap',
    'el santo patrono = the patron saint',
    'las fiestas patronales = the patron saint festivities',
    'el cumpleañero | la cumpleañera = the birthday person',
    'el pastel de cumpleaños = the birthday cake',
```

**Levels 11–20, 40 short phrases:** invitations and answers, wishes, party moments.

Examples:

- ¡Feliz cumpleaños! — Happy birthday!
- ¿Quieres venir a mi fiesta? — Do you want to come to my party?
- ¡Qué divertido! — What fun!
- Gracias por invitarme — Thanks for inviting me
- ¡Dale, dale, dale! — Hit it, hit it, hit it! (piñata song)
- ¡Feliz Año Nuevo! — Happy New Year!

**Levels 21+, 50 sentences:** planning a party (ir a), a party that happened, Nicaraguan festivals (patronales, the fireworks of Masaya).

Examples:

- Vamos a hacer una fiesta sorpresa — We’re going to throw a surprise party
- Rompimos la piñata en el patio — We broke the piñata in the yard
- En Masaya hay fuegos artificiales en las fiestas — In Masaya there are fireworks at the festivals
- Todos bailaron hasta la medianoche — Everyone danced until midnight
- Mi mamá preparó un pastel enorme — My mom made a huge cake
- Los invitados trajeron regalos — The guests brought presents

### La conversación (`conversacion`): Small talk

**Family:** Chocoyito → Chocoyote. **Focus:** The little chunks that make a conversation work: greetings, reactions, fillers, polite exits.

**Note:** Keep each line a natural chunk; the English explains how it is used.

**Levels 2–10, the 27 words (in this order):**

```ts
    '¿Qué tal? = How’s it going?',
    '¿Cómo te va? = How are you doing?',
    'Más o menos = So-so',
    'Igualmente = Likewise',
    'El gusto es mío = The pleasure is mine',
    '¡Qué barbaridad! = Wow! (surprise or shock)',
    '¡No me digas! = No way!',
    'Claro = Of course',
    'Exacto = Exactly',
    'A ver = Let’s see',
    'Mira = Look',
    'Oye = Hey, listen',
    'O sea = I mean',
    'Pues... = Well...',
    'Déjame pensar = Let me think',
    '¡Qué bien! = Great!',
    '¡Qué buena onda! = How cool!',
    'Con mucho gusto = Gladly (a common reply to thanks)',
    'No hay problema = No problem',
    'Me tengo que ir = I have to go',
    'Cuídate = Take care',
    '¡Qué gusto verte! = So nice to see you!',
    'Ahí vamos = Hanging in there',
    '¿Y qué más? = And what else?',
    'Fíjate que... = You know what...',
    'Ya veo = I see',
    '¡Ideay! = Hey! / What?! (Nicaraguan)',
```

**Levels 11–20, 40 short phrases:** opening and closing a chat, reacting to news, asking someone to repeat, keeping a conversation going.

Examples:

- ¿Qué hay de nuevo? — What’s new?
- Saludos a tu familia — Say hi to your family
- ¿Me lo repites? — Can you repeat that?
- ¿Cómo se dice "bird" en español? — How do you say "bird" in Spanish?
- Tienes razón — You’re right
- Nos vemos pronto — See you soon

**Levels 21+, 50 sentences:** whole little exchanges: meeting someone, catching up, polite disagreement.

Examples:

- Hace mucho tiempo que no te veo — I haven’t seen you in a long time
- ¿Qué has hecho últimamente? — What have you been up to lately?
- Perdona, no te entendí bien — Sorry, I didn’t understand you well
- Creo que no, pero tal vez tienes razón — I don’t think so, but maybe you’re right
- Fue un placer hablar contigo — It was a pleasure talking with you
- Te llamo mañana, ¿está bien? — I’ll call you tomorrow, OK?

### La ciudad (`ciudad`): The city

**Family:** Zopilotito → Zopilotón. **Focus:** Streets and places, getting around, keeping the city clean.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la acera = the sidewalk',
    'la basura = the trash',
    'el basurero = the trash can',
    'la alcaldía = the town hall',
    'el tráfico = the traffic',
    'el taxi = the taxi',
    'el ruido = the noise',
    'reciclar = to recycle',
    'el bombero | la bombera = the firefighter',
    'la estación de policía = the police station',
    'el correo = the post office',
    'la gasolinera = the gas station',
    'el estacionamiento = the parking lot',
    'el rótulo = the sign',
    'la catedral = the cathedral',
    'el monumento = the monument',
    'el vendedor ambulante = the street vendor',
    'el kiosco = the kiosk',
    'la fuente = the fountain',
    'el vecindario = the neighborhood',
    'el cruce = the intersection',
    'la rotonda = the roundabout',
    'el andén = the platform, the sidewalk',
    'limpiar la calle = to clean the street',
    'el cementerio = the cemetery',
    'el techo = the roof',
    'la torre = the tower',
```

**Levels 11–20, 40 short phrases:** asking where places are, traffic and noise, keeping things clean.

Examples:

- Hay mucho tráfico — There’s a lot of traffic
- No tires basura — Don’t throw trash
- ¿Dónde está la alcaldía? — Where is the town hall?
- Toma un taxi — Take a taxi
- Hay mucho ruido aquí — It’s very noisy here
- La catedral está en el centro — The cathedral is downtown

**Levels 21+, 50 sentences:** describing your city, directions with landmarks (Nicaraguans give directions from landmarks: "de la iglesia, dos cuadras al lago"), city life.

Examples:

- De la iglesia, dos cuadras al norte — From the church, two blocks north
- León tiene la catedral más grande de Centroamérica — León has the largest cathedral in Central America
- Los bomberos llegaron muy rápido — The firefighters arrived very fast
- Reciclamos el plástico y el papel — We recycle plastic and paper
- Mi ciudad es pequeña pero muy bonita — My city is small but very pretty
- Por la noche la plaza se llena de gente — At night the square fills with people

### La ropa (`ropa`): Clothes

**Family:** Venadito → Torovenado. **Focus:** Clothes beyond the core list, getting dressed, describing outfits and costumes.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la falda = the skirt',
    'la blusa = the blouse',
    'la camiseta = the T-shirt',
    'los calcetines | las medias = the socks',
    'el cinturón = the belt',
    'la gorra = the cap',
    'la bufanda = the scarf',
    'los guantes = the gloves',
    'las botas = the boots',
    'las sandalias = the sandals',
    'el abrigo = the coat',
    'el suéter = the sweater',
    'la corbata = the tie',
    'la capa = the cape',
    'la máscara = the mask',
    'el pañuelo = the handkerchief, the bandana',
    'los aretes = the earrings',
    'el collar = the necklace',
    'ponerse = to put on',
    'quitarse = to take off',
    'de rayas = striped',
    'de cuadros = checked',
    'elegante = elegant',
    'cómodo = comfortable',
    'apretado = tight',
    'flojo = loose',
    'el traje = the suit, the costume',
```

**Levels 11–20, 40 short phrases:** what you put on, how it fits, colors and patterns.

Examples:

- ¿Qué te vas a poner? — What are you going to wear?
- Esa camisa te queda bien — That shirt suits you
- Me pongo la gorra — I put on my cap
- Quítate los zapatos — Take off your shoes
- una falda de colores — a colorful skirt
- Me queda apretado — It’s tight on me

**Levels 21+, 50 sentences:** describing what someone is wearing, the Torovenado costumes, shopping for clothes.

Examples:

- La señora del vestido azul tiene el sombrero — The woman in the blue dress has the hat
- Para el desfile, me pongo una máscara y una capa — For the parade, I put on a mask and a cape
- Busco una camiseta de mi talla — I’m looking for a T-shirt in my size
- En el Torovenado la gente se disfraza — At the Torovenado people dress up
- Mi abuelo siempre usa sombrero — My grandfather always wears a hat
- Ayer compré unas botas nuevas — Yesterday I bought some new boots

### La rutina (`rutina`): Daily routine

**Family:** Perezosito (a sloth in a hammock). **Focus:** The day from waking up to sleeping, time and frequency, rest and naps.

**Note:** Reflexive routine verbs (levantarse, acostarse, bañarse...) are in the core; here, use them in sentences rather than as words.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la siesta = the nap',
    'desayunar = to have breakfast',
    'cenar = to have dinner',
    'merendar = to have a snack',
    'la merienda = the afternoon snack',
    'madrugar = to get up early',
    'tender la cama = to make the bed',
    'hacer ejercicio = to exercise',
    'ir al trabajo = to go to work',
    'relajarse = to relax',
    'bostezar = to yawn',
    'roncar = to snore',
    'la almohada = the pillow',
    'la cobija = the blanket',
    'el pijama = the pajamas',
    'la costumbre = the habit',
    'cada mañana = every morning',
    'de lunes a viernes = Monday to Friday',
    'por la tarde = in the afternoon',
    'por la noche = at night',
    'de vez en cuando = from time to time',
    'casi nunca = almost never',
    'a menudo = often',
    'temprano en la mañana = early in the morning',
    'el horario de trabajo = the work schedule',
    'hacer las compras = to do the shopping',
    'sacar la basura = to take out the trash',
```

**Levels 11–20, 40 short phrases:** what you do and when, how often, sleep and naps.

Examples:

- Todos los días me levanto a las seis — Every day I get up at six
- Tomo una siesta después de almorzar — I take a nap after lunch
- ¿Qué haces los fines de semana? — What do you do on weekends?
- Casi nunca madrugo — I almost never get up early
- Me acuesto a las diez — I go to bed at ten
- Primero desayuno, luego me baño — First I have breakfast, then I bathe

**Levels 21+, 50 sentences:** a whole day in order, weekdays vs weekends, what someone did yesterday.

Examples:

- De lunes a viernes trabajo en la oficina — Monday to Friday I work in the office
- Los sábados me levanto tarde y descanso — On Saturdays I get up late and rest
- Ayer me desperté a las cinco porque hacía calor — Yesterday I woke up at five because it was hot
- Mi papá ronca muy fuerte — My dad snores very loudly
- Antes de dormir, me lavo los dientes — Before sleeping, I brush my teeth
- En la hamaca la siesta es más rica — In the hammock a nap is nicer

### Las emociones (`emociones`): Feelings

**Family:** Lamparita. **Focus:** Naming feelings, asking how someone feels and why, comforting.

**Note:** "La paciencia" also appears in La pesca: same meaning, so it is one shared item. Keep the English identical.

**Levels 2–10, the 27 words (in this order):**

```ts
    'alegre = cheerful',
    'celoso = jealous',
    'avergonzado = embarrassed',
    'confundido = confused',
    'enamorado = in love',
    'la alegría = the joy',
    'la tristeza = the sadness',
    'el enojo = the anger',
    'la vergüenza = the embarrassment',
    'los celos = the jealousy',
    'extrañar = to miss (someone)',
    'sentirse = to feel',
    'calmarse = to calm down',
    'animar = to cheer up',
    'de buen humor = in a good mood',
    'de mal humor = in a bad mood',
    'harto = fed up',
    'agradecido = grateful',
    'decepcionado = disappointed',
    'esperanzado = hopeful',
    'el ánimo = the spirit, the mood',
    'el abrazo = the hug',
    'la calma = the calm',
    'tímido = shy',
    'valiente = brave',
    'la soledad = the loneliness',
    'la paciencia = the patience',
```

**Levels 11–20, 40 short phrases:** how do you feel and why, comforting someone, missing people.

Examples:

- Me siento feliz — I feel happy
- ¿Por qué estás triste? — Why are you sad?
- Te extraño — I miss you
- ¡Qué miedo! — How scary!
- No te preocupes — Don’t worry
- ¡Ánimo! — Cheer up! / You can do it!

**Levels 21+, 50 sentences:** feelings with reasons (porque), how something made you feel, the lamp’s changing colors.

Examples:

- Estoy nervioso porque mañana tengo un examen — I’m nervous because I have an exam tomorrow
- Cuando estoy triste, escucho música — When I’m sad, I listen to music
- Me sentí muy orgulloso de mi hermana — I felt very proud of my sister
- Extraño a mis abuelos que viven lejos — I miss my grandparents who live far away
- La lámpara se pone azul cuando está triste — The lamp turns blue when it’s sad
- Un abrazo siempre me pone de buen humor — A hug always puts me in a good mood

### Los animales (`animales`): Animals

**Family:** Brasita → Brasaurio → Volcasaurio. **Focus:** Animals of Nicaragua (the garrobo, monkeys, the sloth) and the farm, where they live and what they eat.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el garrobo | la iguana = the spiny-tailed iguana',
    'la serpiente = the snake',
    'el mono = the monkey',
    'el armadillo = the armadillo',
    'el venado = the deer',
    'el zorro = the fox',
    'el conejo = the rabbit',
    'la rana = the frog',
    'el loro = the parrot',
    'el águila = the eagle',
    'el búho = the owl',
    'la abeja = the bee',
    'la mariposa = the butterfly',
    'la hormiga = the ant',
    'la araña = the spider',
    'el murciélago = the bat',
    'el perezoso = the sloth',
    'el jaguar = the jaguar',
    'el cocodrilo = the crocodile',
    'el cerdo | el chancho = the pig',
    'la gallina = the hen',
    'el burro = the donkey',
    'la oveja = the sheep',
    'la cabra = the goat',
    'el toro = the bull',
    'salvaje = wild',
    'la cola larga = the long tail',
```

**Levels 11–20, 40 short phrases:** naming animals and what they do, wild or farm, likes and fears.

Examples:

- Los monos viven en los árboles — Monkeys live in trees
- ¿Qué come el garrobo? — What does the garrobo eat?
- Tengo miedo de las serpientes — I’m afraid of snakes
- El perezoso es muy lento — The sloth is very slow
- las gallinas de mi abuela — my grandmother’s hens
- ¡Mira, un venado! — Look, a deer!

**Levels 21+, 50 sentences:** describing animals (comparisons: más rápido que...), animals of Nicaragua, a visit to a farm.

Examples:

- El jaguar es más rápido que el venado — The jaguar is faster than the deer
- El garrobo toma el sol en las piedras — The garrobo sunbathes on the rocks
- En la finca hay vacas, cerdos y gallinas — On the farm there are cows, pigs and hens
- Los murciélagos salen de noche — Bats come out at night
- Ayer vimos monos en el bosque — Yesterday we saw monkeys in the forest
- La abeja hace miel — The bee makes honey

### El trabajo (`trabajo`): Work

**Family:** Hormiguita → Hormigón. **Focus:** Jobs and workplaces, tools, working hours, what people do.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el trabajador | la trabajadora = the worker',
    'el albañil = the bricklayer',
    'el ingeniero | la ingeniera = the engineer',
    'el campesino | la campesina = the farmer',
    'el cocinero | la cocinera = the cook',
    'el carpintero | la carpintera = the carpenter',
    'el mecánico | la mecánica = the mechanic',
    'el abogado | la abogada = the lawyer',
    'el vendedor | la vendedora = the seller',
    'el sueldo | el salario = the salary',
    'la empresa = the company',
    'la herramienta = the tool',
    'el martillo = the hammer',
    'el clavo = the nail',
    'la pala = the shovel',
    'el casco = the hard hat',
    'el cemento = the cement',
    'el turno = the shift',
    'la entrevista = the interview',
    'contratar = to hire',
    'renunciar = to quit',
    'jubilarse = to retire',
    'el negocio = the business',
    'el empleado | la empleada = the employee',
    'la fábrica = the factory',
    'el campo = the countryside, the field',
    'trabajar en equipo = to work as a team',
```

**Levels 11–20, 40 short phrases:** asking what someone does, where and when they work, tools.

Examples:

- ¿En qué trabajas? — What do you do for work?
- Soy cocinero | Soy cocinera — I’m a cook
- Trabajo de lunes a viernes — I work Monday to Friday
- Pásame el martillo — Pass me the hammer
- Hoy tengo el turno de noche — Today I have the night shift
- Mi mamá tiene su propio negocio — My mom has her own business

**Levels 21+, 50 sentences:** describing a job, a job interview, what someone built (preterite).

Examples:

- El albañil construyó la casa en tres meses — The bricklayer built the house in three months
- En la entrevista me preguntaron por qué quiero trabajar aquí — In the interview they asked me why I want to work here
- Mi abuelo fue campesino toda su vida — My grandfather was a farmer all his life
- Las hormigas trabajan en equipo — Ants work as a team
- Quiero ser ingeniera cuando sea grande — I want to be an engineer when I grow up
- Ganamos un buen sueldo — We earn a good salary

---

## 2. Grammar topics for Ciudad Chispa's school

Practice topics like Rita's present-tense lesson: add them to `src/data/content/trainers.ts` and to the
`build` list.
- Each has 3 difficulty tiers. The teacher asks 8 questions, starting with the easiest tier you haven't
  mastered yet.
- Lines that are also in the core or a theme are shared items (fine).

### De compras (`compras`): Shopping and bargaining. School: Ciudad Chispa (and the market quest)

```ts
export const compras: ThemeSource = {
  id: 'compras',
  name: 'De compras',
  en: 'Shopping and bargaining',
  tiers: {
    1: [
      '¿Cuánto cuesta? = How much is it?',
      'Es muy caro = It’s very expensive',
      'Es barato = It’s cheap',
      'Me lo llevo = I’ll take it',
      'Solo estoy mirando = I’m just looking',
      '¿Tiene otro color? = Do you have another color?',
      'cien córdobas = a hundred córdobas',
      'la última oferta = the last offer',
    ],
    2: [
      '¿Me lo deja en quinientos? = Will you let me have it for five hundred?',
      '¿Me hace un descuento? = Can you give me a discount?',
      'Es mi último precio = It’s my final price',
      'No tengo tanto dinero = I don’t have that much money',
      '¿Lo tiene más grande? = Do you have it bigger?',
      'Es para un regalo = It’s for a present',
      '¿Aceptan tarjeta? = Do you take cards?',
      'Está bien, trato hecho = OK, it’s a deal',
    ],
    3: [
      'Esta hamaca está muy bonita, ¿cuánto vale? = This hammock is very pretty, how much is it?',
      'En la otra tienda está más barata = In the other shop it’s cheaper',
      'Si compro dos, ¿me hace precio? = If I buy two, will you give me a better price?',
      'Le doy cuatrocientos y no más = I’ll give you four hundred and no more',
      'Está hecha a mano en Masaya = It’s handmade in Masaya',
      'La quiero para mi mamá = I want it for my mom',
      'Muchas gracias, que le vaya bien = Thank you very much, have a good day',
      'Vuelvo más tarde, voy a pensarlo = I’ll come back later, I’m going to think about it',
    ],
  },
};
```

### El pasado (`pasado`): The past (preterite). School: Ciudad Chispa

```ts
export const pasado: ThemeSource = {
  id: 'pasado',
  name: 'El pasado',
  en: 'The past (preterite)',
  tiers: {
    1: [
      'Hablé = I spoke',
      'Comí = I ate',
      'Viví = I lived',
      'Fui = I went',
      'Hice = I did, I made',
      'Vi = I saw',
      'Tuve = I had',
      'Dije = I said',
    ],
    2: [
      'Ayer compré una hamaca = Yesterday I bought a hammock',
      'Anoche vi los fuegos artificiales = Last night I saw the fireworks',
      '¿Qué hiciste ayer? = What did you do yesterday?',
      'Fuimos al volcán = We went to the volcano',
      'Ella bailó toda la noche = She danced all night',
      'Tuvimos mucha suerte = We were very lucky',
      'Comimos vigorón en el parque = We ate vigorón in the park',
      'No dijo nada = He didn’t say anything',
    ],
    3: [
      'El año pasado viajé a Masaya con mi familia = Last year I traveled to Masaya with my family',
      'Don Tizón hizo mil cohetes ayer = Don Tizón made a thousand rockets yesterday',
      'Subimos al cráter y vimos la lava = We climbed to the crater and saw the lava',
      '¿Cuándo llegaste a Ciudad Chispa? = When did you get to Ciudad Chispa?',
      'Encontré al chocoyito en la cueva = I found the little parakeet in the cave',
      'Los Silenciosos se llevaron los cohetes = The Silenciosos took the rockets',
      'Primero llovió y después salió el sol = First it rained and then the sun came out',
      'Fue la mejor fiesta de mi vida = It was the best party of my life',
    ],
  },
};
```

---

## 3. Checks after writing content

- `npm build` must not throw (a duplicate inside one list throws).
- `npm test -- data`: words at every level up to 30, for every Palabrita.
- Add a check to `data.test`: no Spanish key appears in two lists with different English (print them, then
  fix them).
- `node tools/sim.mjs`: answers per level for 21–30 should be about 18–26.
- **A native speaker's skim** is welcome but never blocks shipping. Keep a list of anything you were unsure
  about in the commit message.

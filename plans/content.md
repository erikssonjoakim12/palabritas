# Spanish content for gyms 2–4

Everything the Palabritas teach from here on: the A2 core for levels 21–35, the 21 new themes, and the
grammar topics for the schools. Latin American Spanish (with some Nicaraguan words, marked); the English is
what the EN button shows.

**How content works** (src/data/content/, see CLAUDE.md "A theme"):
- A line is `'spanish | other accepted forms = english'`. The first Spanish form is the one shown.
- The **same Spanish in two lists is one shared item** (it keeps the English of the list built first:
  the core, then the themes in the order of `build`).
  - Never use the same Spanish with a different meaning in two lists ("la receta" can't be both recipe and
    prescription).
  - The same Spanish twice in **one** list makes the build throw.
- A theme is one list, easiest first: 27 words (levels 2–10, 3 per level), 40 short phrases (11–20, 4 per
  level), then sentences (3 per level from 21). **117 lines reach level ~37.**
- After adding content, `npm test -- data` checks every Palabrita has words at every level to 30. Then run
  `node tools/sim.mjs` to see answers per level.

**Writing the rest:**
- §2 gives each theme's 27 words in full, and what its 40 phrases and 50 sentences should cover, with
  examples (use them; they count toward the 40 and 50).
- Write the rest in the same style:
  - short and natural, for a beginner;
  - Latin American;
  - accept the common variants with `|`;
  - gendered forms as `cansado | cansada`.
- Sentences follow the grammar order of the core at those levels (§1): present tense, *ir a*, *gustar*,
  routines, comparisons, directions, shopping; the past tense from about level 31.

---

## 1. The A2 core, levels 21–35

Add these as a new band in `src/data/content/core.ts`: `{ from: 21, to: 35, lines: [...] }`. Also make
`coreItemsPerLevel` return 4 for levels 21–40 (2 words + 2 sentences; see phase 1 §13).
- Each level's block is about 20 lines: around 8 new words and 12 sentences that use known words in that
  level's grammar.
- The band is spread evenly, so each level gets its own block, and every Palabrita learns its own sample of 4.
- These lines were checked against the A1 core: no line repeats an A1 item or one of its accepted forms.

```ts
    {
      from: 21,
      to: 35,
      lines: [
        // 21 | The present tense in full: -ar verbs (yo, tú, él/ella, nosotros, ellos)
        'cocinar = to cook',
        'planchar = to iron',
        'lavar = to wash',
        'contar = to count, to tell',
        'ahorrar = to save (money)',
        'prestar = to lend',
        'cobrar = to charge',
        'tratar de = to try to',
        'Nosotros hablamos español = We speak Spanish',
        'Ellos trabajan mucho = They work a lot',
        '¿Tú estudias o trabajas? = Do you study or work?',
        'Mi hermana canta muy bien = My sister sings very well',
        'Cocinamos juntos los domingos = We cook together on Sundays',
        '¿Dónde trabajas? = Where do you work?',
        'Ustedes caminan muy rápido = You (all) walk very fast',
        'Siempre pago con tarjeta = I always pay by card',
        '¿Me prestas tu lápiz? = Will you lend me your pencil?',
        'Mis amigos llegan mañana = My friends arrive tomorrow',
        'Ella escucha música en el bus = She listens to music on the bus',
        'Trato de ahorrar dinero = I try to save money',
        // 22 | -er and -ir verbs
        'sacudir = to shake, to dust',
        'barrer = to sweep',
        'devolver = to give back, to return',
        'describir = to describe',
        'discutir = to argue, to discuss',
        'cumplir = to fulfill, to turn (an age)',
        'prometer = to promise',
        'esconder = to hide',
        'Vivimos en una casa pequeña = We live in a small house',
        '¿Qué lees? = What are you reading?',
        'Mis abuelos viven en el campo = My grandparents live in the countryside',
        'Aprendo algo nuevo cada día = I learn something new every day',
        'Ellos venden fruta en el mercado = They sell fruit at the market',
        '¿A qué hora abren? = What time do you open?',
        'Debes beber más agua = You should drink more water',
        'Mañana cumplo veinte años = Tomorrow I turn twenty',
        'Te prometo que voy a llegar a tiempo = I promise I’ll arrive on time',
        '¿Recibes muchos mensajes? = Do you get a lot of messages?',
        'Escribimos una carta a la abuela = We’re writing a letter to grandma',
        'El gato se esconde debajo de la cama = The cat hides under the bed',
        // 23 | Irregular "yo": tengo, hago, pongo, salgo, vengo, digo, traigo, conozco, sé, doy, veo
        'la cita = the appointment, the date',
        'el plan = the plan',
        'la reunión = the meeting',
        'reconocer = to recognize',
        'obedecer = to obey',
        'traducir = to translate',
        'valer = to be worth',
        'el mensaje = the message',
        'Hago la tarea por la noche = I do my homework at night',
        'Salgo de casa a las siete = I leave home at seven',
        '¿Conoces a mi amigo? = Do you know my friend?',
        'Vengo del trabajo = I’m coming from work',
        'Pongo la mesa = I set the table',
        'Traigo pan para todos = I’m bringing bread for everyone',
        'Te digo la verdad = I’m telling you the truth',
        'Doy un paseo por el parque = I take a walk in the park',
        'Tengo una cita con el doctor = I have an appointment with the doctor',
        'No conozco esta ciudad = I don’t know this city',
        '¿Cuánto vale? = How much is it worth?',
        'Mi Palabrita me obedece = My Palabrita obeys me',
        // 24 | ser and estar
        'asustado = scared',
        'callado = quiet',
        'orgulloso = proud',
        'despierto = awake',
        'dormido = asleep',
        'mojado = wet',
        'seco = dry',
        'roto = broken',
        'Soy de Nicaragua = I’m from Nicaragua',
        'Estoy en la escuela = I’m at school',
        'La tienda está cerrada = The shop is closed',
        'Mi hermano es alto = My brother is tall',
        'Hoy estoy muy cansado | Hoy estoy muy cansada = Today I’m very tired',
        'El mercado está lejos de aquí = The market is far from here',
        'La película es aburrida = The movie is boring',
        'Estoy aburrido | Estoy aburrida = I’m bored',
        'La sopa está muy caliente = The soup is very hot',
        'Mi abuela es muy simpática = My grandmother is very nice',
        '¿Estás despierto? | ¿Estás despierta? = Are you awake?',
        'El celular está roto = The phone is broken',
        // 25 | ir a + verb: plans
        'pasado mañana = the day after tomorrow',
        'esta noche = tonight',
        'la semana que viene = next week',
        'el mes que viene = next month',
        'dentro de una hora = in an hour',
        'algún día = someday',
        'la meta = the goal',
        'el sueño = the dream, the sleepiness',
        'Voy a comer = I’m going to eat',
        '¿Qué vas a hacer mañana? = What are you going to do tomorrow?',
        'Vamos a la playa el fin de semana = We’re going to the beach on the weekend',
        'Va a llover = It’s going to rain',
        'Voy a estudiar más = I’m going to study more',
        'Mis padres van a viajar = My parents are going to travel',
        '¿Vas a venir a la fiesta? = Are you going to come to the party?',
        'Esta noche vamos a cenar afuera = Tonight we’re going to eat out',
        'Algún día voy a hablar español muy bien = Someday I’m going to speak Spanish very well',
        'No voy a olvidar este día = I’m not going to forget this day',
        '¿A qué hora vas a llegar? = What time are you going to arrive?',
        'Mi meta es ganar ocho medallas = My goal is to win eight medals',
        // 26 | querer, poder, preferir... (stem-changing verbs) + infinitive
        'preferir = to prefer',
        'almorzar = to have lunch',
        'costar = to cost',
        'soler = to usually do',
        'servir = to serve, to work (a machine)',
        'medir = to measure',
        'despedirse = to say goodbye',
        'acordarse = to remember',
        '¿Puedes ayudarme? = Can you help me?',
        'Quiero aprender español = I want to learn Spanish',
        'Prefiero el té = I prefer tea',
        '¿Cuándo vuelves? = When are you coming back?',
        'La clase empieza a las nueve = The class starts at nine',
        'Duermo ocho horas = I sleep eight hours',
        '¿Cuánto cuestan las piñas? = How much are the pineapples?',
        'Almorzamos a las doce = We have lunch at twelve',
        'Suelo caminar por la mañana = I usually walk in the morning',
        'Esta máquina no sirve = This machine doesn’t work',
        'No me acuerdo de su nombre = I don’t remember his name',
        'Pienso que tienes razón = I think you’re right',
        // 27 | gustar, encantar, interesar, doler (me, te, le, nos, les)
        'encantar = to love (something)',
        'interesar = to interest',
        'doler = to hurt',
        'molestar = to bother',
        'aburrir = to bore',
        'el pasatiempo = the hobby',
        'el ajedrez = chess',
        'pintar = to paint',
        'Me gusta bailar = I like to dance',
        '¿Te gustan las películas? = Do you like movies?',
        'A mi mamá le encanta el café = My mom loves coffee',
        'Nos gusta mucho la playa = We really like the beach',
        'No me gustan los lunes = I don’t like Mondays',
        'Me duele la cabeza = My head hurts',
        '¿Qué te interesa? = What are you interested in?',
        'Le duelen los pies = His feet hurt',
        '¿Les gusta la comida nicaragüense? = Do you (all) like Nicaraguan food?',
        'Me molesta el ruido = The noise bothers me',
        'Mi pasatiempo favorito es pintar = My favorite hobby is painting',
        'A mí también me gusta = I like it too',
        // 28 | Daily routine: reflexive verbs and the time
        'secarse = to dry yourself',
        'acostarse = to go to bed',
        'lavarse = to wash (yourself)',
        'peinarse = to comb your hair',
        'afeitarse = to shave',
        'el cepillo de dientes = the toothbrush',
        'el despertador = the alarm clock',
        'la rutina = the routine',
        'Me levanto a las seis = I get up at six',
        '¿A qué hora te acuestas? = What time do you go to bed?',
        'Primero me ducho y después desayuno = First I shower and then I have breakfast',
        'Los domingos me despierto tarde = On Sundays I wake up late',
        'Son las tres y media = It’s half past three',
        'Es la una = It’s one o’clock',
        'Me lavo los dientes después de comer = I brush my teeth after eating',
        'Son las ocho menos cuarto = It’s a quarter to eight',
        'Mi hermano se baña por la noche = My brother bathes at night',
        'Nos vestimos rápido = We get dressed fast',
        'El despertador suena a las seis = The alarm clock rings at six',
        '¿Te peinas antes de salir? = Do you comb your hair before going out?',
        // 29 | Comparisons
        'más que = more than',
        'menos que = less than',
        'tan como = as ... as',
        'igual que = the same as',
        'parecido = similar',
        'distinto = different',
        'el doble = double, twice as much',
        'la mitad = half',
        'Mi hermano es mayor que yo = My brother is older than me',
        'El tren es más rápido que el bus = The train is faster than the bus',
        'Este libro es mejor = This book is better',
        'Soy tan alto como mi papá | Soy tan alta como mi papá = I’m as tall as my dad',
        'La fruta es más barata en el mercado = Fruit is cheaper at the market',
        'Hoy hace menos calor que ayer = It’s less hot today than yesterday',
        'Es el mejor día del año = It’s the best day of the year',
        'Tu Palabrita es igual que la mía = Your Palabrita is the same as mine',
        'Este es el doble de grande = This one is twice as big',
        'Mi casa es parecida a la tuya = My house is similar to yours',
        'Ella es la menor de la familia = She’s the youngest in the family',
        'Nadie corre tan rápido como él = Nobody runs as fast as him',
        // 30 | Directions: where things are, and how to get there
        'la cuadra = the block',
        'la parada = the stop',
        'girar | doblar = to turn',
        'cruzar = to cross',
        'la avenida = the avenue',
        'el barrio = the neighborhood',
        'al lado de = next to',
        'a la vuelta de la esquina = around the corner',
        'Gira a la derecha = Turn right',
        'Sigue derecho dos cuadras = Go straight two blocks',
        '¿Cómo llego al parque? = How do I get to the park?',
        'El banco está al lado de la farmacia = The bank is next to the pharmacy',
        'Cruza el puente = Cross the bridge',
        'Toma el bus en la parada = Take the bus at the stop',
        'La escuela está a la vuelta de la esquina = The school is around the corner',
        'Dobla a la izquierda en el semáforo = Turn left at the traffic light',
        '¿Está lejos de aquí? = Is it far from here?',
        'Está a diez minutos a pie = It’s ten minutes on foot',
        'Mi barrio es muy tranquilo = My neighborhood is very quiet',
        'Perdón, ¿dónde queda el museo? = Excuse me, where is the museum?',
        // 31 | Shopping: prices, sizes, money
        'el precio = the price',
        'el descuento = the discount',
        'la oferta = the special offer',
        'la talla = the size (clothes)',
        'el efectivo = cash',
        'el cambio = the change (money)',
        'la cuenta = the bill, the check',
        'probarse = to try on',
        '¿Cuánto cuesta esta camisa? = How much is this shirt?',
        'Es muy caro = It’s very expensive',
        '¿Me hace un descuento? = Can you give me a discount?',
        'Me llevo estos zapatos = I’ll take these shoes',
        '¿Tiene una talla más grande? = Do you have a bigger size?',
        '¿Puedo pagar con tarjeta? = Can I pay by card?',
        'Aquí tiene su cambio = Here’s your change',
        '¿Me puedo probar este vestido? = Can I try on this dress?',
        'La cuenta, por favor = The check, please',
        'Solo tengo efectivo = I only have cash',
        'Estos están en oferta = These are on sale',
        'Lo dejo en quinientos córdobas = I’ll let you have it for five hundred córdobas',
        // 32 | The past (preterite) of -ar verbs: what you did
        'compré = I bought',
        'hablé = I spoke',
        'trabajé = I worked',
        'llegué = I arrived',
        'anoche = last night',
        'anteayer = the day before yesterday',
        'la semana pasada = last week',
        'el año pasado = last year',
        '¿Qué compraste? = What did you buy?',
        'Ayer hablé con mi abuela = Yesterday I talked with my grandmother',
        'Anoche cenamos en casa = Last night we had dinner at home',
        'El año pasado viajé a Costa Rica = Last year I traveled to Costa Rica',
        '¿Ya terminaste? = Did you finish already?',
        'Mi papá cocinó gallo pinto = My dad cooked gallo pinto',
        'Llegamos tarde = We arrived late',
        '¿Dónde trabajaste antes? = Where did you work before?',
        'La semana pasada estudié mucho = Last week I studied a lot',
        'Mis amigos bailaron toda la noche = My friends danced all night',
        '¿Escuchaste eso? = Did you hear that?',
        'Ella me ayudó con la tarea = She helped me with my homework',
        // 33 | The past of -er and -ir verbs
        'comí = I ate',
        'bebí = I drank',
        'viví = I lived',
        'salí = I went out, I left',
        'aprendí = I learned',
        'escribí = I wrote',
        'perdí = I lost',
        'conocí = I met',
        '¿Qué comiste? = What did you eat?',
        'Viví dos años en México = I lived in Mexico for two years',
        'Salimos a caminar = We went out for a walk',
        'Perdí mis llaves = I lost my keys',
        'Ayer aprendí una palabra nueva = Yesterday I learned a new word',
        'Conocí a tu hermana = I met your sister',
        '¿Recibiste mi mensaje? = Did you get my message?',
        'Mi Palabrita aprendió un ataque nuevo = My Palabrita learned a new attack',
        '¿A qué hora saliste? = What time did you leave?',
        'Ellos vendieron su carro = They sold their car',
        'Abrí la ventana porque hacía calor = I opened the window because it was hot',
        'Escribí tu nombre en la arena = I wrote your name in the sand',
        // 34 | Irregular pasts: fui, hice, tuve, estuve, pude, dije, vi, di
        'fui = I went, I was',
        'hice = I did, I made',
        'tuve = I had',
        'estuve = I was (somewhere, for a while)',
        'pude = I could, I managed to',
        'dije = I said',
        'vi = I saw',
        'vine = I came',
        'Fui al mercado = I went to the market',
        '¿Qué hiciste el fin de semana? = What did you do on the weekend?',
        'Tuve un día muy largo = I had a very long day',
        'Estuve en la playa toda la tarde = I was at the beach all afternoon',
        'No pude dormir = I couldn’t sleep',
        'Vi una película muy buena = I saw a very good movie',
        '¿Qué te dijo? = What did he tell you?',
        '¿Adónde fueron ustedes? = Where did you (all) go?',
        'Hicimos un pastel para mamá = We made a cake for mom',
        'Mi abuelo me dio un regalo = My grandfather gave me a present',
        '¿Viniste en bus? = Did you come by bus?',
        'El examen fue fácil = The exam was easy',
        // 35 | Telling a little story: time words and connectors
        'de repente = suddenly',
        'al final = in the end',
        'al principio = at first',
        'después de = after',
        'antes de = before',
        'sin embargo = however',
        'una vez = once',
        'hace dos días = two days ago',
        'Primero fui al parque y después comí = First I went to the park and then I ate',
        'De repente empezó a llover = Suddenly it started to rain',
        'Hace dos días vi un guardabarranco = Two days ago I saw a guardabarranco',
        'Me levanté tarde, por eso llegué tarde = I got up late, that’s why I arrived late',
        'Al final ganamos el partido = In the end we won the game',
        'Antes de dormir, leo un poco = Before sleeping, I read a little',
        'Una vez vi un volcán de noche = Once I saw a volcano at night',
        'Al principio no entendí nada = At first I didn’t understand anything',
        'Después de la escuela, jugamos fútbol = After school, we played soccer',
        'Estaba cansado, sin embargo seguí caminando = I was tired; however, I kept walking',
        'Luego llegó mi hermano con un perro = Then my brother arrived with a dog',
        'Fue un día increíble = It was an incredible day',
      ],
    },
```

---

## 2. The 21 new themes

One file each in `src/data/content/<id>.ts`, in the shape of `perro.ts`; then import each one and add it
to the `build` list in `index.ts`. The theme ids are the `theme` values in
[palabritas.md](palabritas.md).

### El cuerpo (`cuerpo`): The body

**Family:** Piedrita → Petroglifón. **Focus:** Body parts beyond the core list, moving and pointing (petroglyphs are stick figures!), describing people.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el hombro = the shoulder',
    'la rodilla = the knee',
    'el codo = the elbow',
    'la uña = the nail',
    'la ceja = the eyebrow',
    'la frente = the forehead',
    'la mejilla | el cachete = the cheek',
    'el labio = the lip',
    'la lengua = the tongue',
    'el diente = the tooth',
    'el pecho = the chest',
    'la cintura = the waist',
    'el tobillo = the ankle',
    'la muñeca = the wrist',
    'la piel = the skin',
    'la sangre = the blood',
    'el músculo = the muscle',
    'la garganta = the throat',
    'el pulgar = the thumb',
    'la barbilla = the chin',
    'la pestaña = the eyelash',
    'señalar = to point',
    'tocar con el dedo = to touch with your finger',
    'sentarse = to sit down',
    'pararse = to stand up',
    'agacharse = to crouch down',
    'estirarse = to stretch',
```

**Levels 11–20, 40 short phrases:** commands with the body (a "Simón dice" game), what hurts, describing hair and eyes, left/right hand and foot.

Examples:

- ¡Levanta la mano! — Raise your hand!
- Cierra los ojos — Close your eyes
- Tócate la nariz — Touch your nose
- Me duele la rodilla — My knee hurts
- el pelo rizado — curly hair
- Simón dice: ¡siéntate! — Simon says: sit down!

**Levels 21+, 50 sentences:** describing people (pelo, ojos, alto/bajo), small injuries, exercise, what a petroglyph shows.

Examples:

- Tiene el pelo negro y los ojos verdes — She has black hair and green eyes
- Me corté el dedo — I cut my finger
- Mi abuelo tiene las manos grandes — My grandfather has big hands
- Este dibujo tiene dos brazos y una cabeza — This drawing has two arms and a head
- Hay que estirarse antes de correr — You have to stretch before running
- Me lavo la cara con agua fría — I wash my face with cold water

### La cocina (`cocina`): Cooking

**Family:** Ollita → Tinajón. **Focus:** Pots, tools and verbs of cooking, with Nicaraguan dishes (gallo pinto, nacatamal, vigorón).

**Note:** Avoid "la receta" here and in La salud (recipe vs prescription): choose one list for it (here: "la receta = the recipe").

**Levels 2–10, the 27 words (in this order):**

```ts
    'la olla = the pot',
    'la sartén = the frying pan',
    'la cuchara = the spoon',
    'el cuchillo = the knife',
    'el tenedor = the fork',
    'el plato = the plate, the dish',
    'el vaso = the glass',
    'la taza = the cup',
    'el horno = the oven',
    'la estufa = the stove',
    'hervir = to boil',
    'freír = to fry',
    'mezclar = to mix',
    'calentar = to heat up',
    'pelar = to peel',
    'la sal = the salt',
    'el azúcar = the sugar',
    'el aceite = the oil',
    'la cebolla = the onion',
    'el ajo = the garlic',
    'el tomate = the tomato',
    'el frijol | los frijoles = the bean',
    'picante = spicy',
    'crudo = raw',
    'cocido = cooked',
    'delicioso | rico = delicious',
    'la tinaja = the clay water jar',
```

**Levels 11–20, 40 short phrases:** kitchen commands, tasting, recipes in short steps, "a fuego lento", what is missing.

Examples:

- a fuego lento — on low heat
- una pizca de sal — a pinch of salt
- ¡Huele delicioso! — It smells delicious!
- Pon el agua a hervir — Put the water on to boil
- Falta sal — It needs salt
- ¿Qué vamos a cocinar? — What are we going to cook?

**Levels 21+, 50 sentences:** a recipe for gallo pinto step by step (primero, luego, después), who cooks at home, comparing dishes.

Examples:

- Primero fríes la cebolla — First you fry the onion
- El gallo pinto lleva arroz y frijoles — Gallo pinto has rice and beans
- Mi abuela hace los mejores nacatamales — My grandmother makes the best nacatamales
- La sopa necesita más tiempo — The soup needs more time
- No toques la olla, está caliente — Don’t touch the pot, it’s hot
- Ayer cociné para toda la familia — Yesterday I cooked for the whole family

### Los deportes (`deportes`): Sports

**Family:** Ardillita → Ardillón. **Focus:** Sports, with baseball first: it is Nicaragua’s favorite. Playing, winning, cheering.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el béisbol = baseball',
    'la pelota = the ball',
    'el bate = the bat',
    'el gol = the goal',
    'el jugador = the player',
    'el árbitro = the referee',
    'la cancha = the field, the court',
    'el estadio = the stadium',
    'el entrenador = the coach',
    'la carrera = the race',
    'la medalla = the medal',
    'el campeón | la campeona = the champion',
    'el básquetbol = basketball',
    'el voleibol = volleyball',
    'el boxeo = boxing',
    'patear = to kick',
    'lanzar = to throw, to pitch',
    'batear = to bat',
    'atrapar = to catch',
    'entrenar = to train',
    'empatar = to tie (a game)',
    'la camiseta del equipo = the team shirt',
    'el ejercicio = the exercise',
    'sudar = to sweat',
    'la meta | la línea de llegada = the finish line',
    'el aficionado = the fan',
    'el marcador = the score',
```

**Levels 11–20, 40 short phrases:** cheering, asking who won, what you play and when, score talk.

Examples:

- ¡Gol! — Goal!
- ¡Vamos, equipo! — Come on, team!
- ¿Quién ganó? — Who won?
- Juego béisbol los sábados — I play baseball on Saturdays
- ¡Qué buen partido! — What a good game!
- Vamos tres a uno — It’s three to one

**Levels 21+, 50 sentences:** favorite teams and players, a game that happened (preterite), training routines.

Examples:

- El béisbol es el deporte más popular de Nicaragua — Baseball is the most popular sport in Nicaragua
- Mi equipo ganó el campeonato — My team won the championship
- Entreno tres veces por semana — I train three times a week
- El árbitro no vio la falta — The referee didn’t see the foul
- Corrí la carrera en veinte minutos — I ran the race in twenty minutes
- Me gusta más jugar que mirar — I like playing more than watching

### La música (`musica`): Music

**Family:** Colibrí → Zumbador. **Focus:** Instruments (with the marimba), singing, listening, loud and soft.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la guitarra = the guitar',
    'el piano = the piano',
    'el tambor = the drum',
    'la marimba = the marimba',
    'la flauta = the flute',
    'el violín = the violin',
    'la trompeta = the trumpet',
    'el cantante | la cantante = the singer',
    'la banda = the band',
    'el concierto = the concert',
    'la voz = the voice',
    'el ritmo = the rhythm',
    'la nota = the note',
    'la letra = the lyrics',
    'el volumen = the volume',
    'a todo volumen = at full volume',
    'suave = soft, gentle',
    'afinado = in tune',
    'desafinado = out of tune',
    'silbar = to whistle',
    'tararear = to hum',
    'ensayar = to rehearse',
    'aplaudir = to clap',
    'el público = the audience',
    'el escenario = the stage',
    'la canción de cuna = the lullaby',
    'los audífonos = the headphones',
```

**Levels 11–20, 40 short phrases:** asking what music people like, instruments you play, volume, applause.

Examples:

- ¡Qué bonita canción! — What a beautiful song!
- ¿Tocas algún instrumento? — Do you play an instrument?
- Sube el volumen — Turn up the volume
- Más despacio, por favor — Slower, please
- ¡Otra! ¡Otra! — Encore! Encore!
- Toco la guitarra — I play the guitar

**Levels 21+, 50 sentences:** a concert you went to, Nicaraguan music (marimba, Carlos Mejía Godoy), practicing.

Examples:

- La marimba es muy típica de Nicaragua — The marimba is very typical of Nicaragua
- Ensayamos todos los jueves — We rehearse every Thursday
- Anoche fuimos a un concierto — Last night we went to a concert
- Mi hermana canta en una banda — My sister sings in a band
- Esta canción me pone feliz — This song makes me happy
- Aprendí a tocar el piano de niño — I learned to play the piano as a child

### La salud (`salud`): Health

**Family:** Espinita → Puercoespín. **Focus:** Feeling sick, the doctor and the pharmacy, getting better.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el consultorio = the doctor’s office',
    'la enfermera | el enfermero = the nurse',
    'la medicina = the medicine',
    'la pastilla = the pill',
    'la fiebre = the fever',
    'la tos = the cough',
    'la gripe = the flu',
    'el resfriado | la gripa = the cold',
    'la herida = the wound',
    'la curita = the band-aid',
    'la inyección = the shot, the injection',
    'la vacuna = the vaccine',
    'el termómetro = the thermometer',
    'la ambulancia = the ambulance',
    'la clínica = the clinic',
    'el dolor de cabeza = the headache',
    'el dolor de estómago = the stomachache',
    'sano = healthy',
    'toser = to cough',
    'estornudar = to sneeze',
    'cuidarse = to take care of yourself',
    'curar = to heal, to cure',
    'mejorarse = to get better',
    'vomitar = to throw up',
    'la alergia = the allergy',
    'la cita médica = the doctor’s appointment',
    'el jarabe = the syrup (medicine)',
```

**Levels 11–20, 40 short phrases:** saying what is wrong, the doctor’s questions, get-well wishes.

Examples:

- Me siento mal — I feel bad
- Tengo fiebre — I have a fever
- ¿Qué te pasa? — What’s wrong with you?
- ¡Que te mejores! — Get well soon!
- ¡Salud! — Bless you!
- Tómate la pastilla — Take the pill

**Levels 21+, 50 sentences:** a visit to the doctor, advice (tienes que, debes), staying healthy.

Examples:

- Tengo que ir al médico — I have to go to the doctor
- Debes descansar y beber mucha agua — You should rest and drink lots of water
- Me duele la garganta desde ayer — My throat has hurt since yesterday
- El médico me dio un jarabe — The doctor gave me a syrup
- Para estar sano, hay que comer frutas — To be healthy, you have to eat fruit
- Ya me siento mejor, gracias — I already feel better, thanks

### La historia (`historia`): History

**Family:** Caparazonte → Gliptodón. **Focus:** Old things, museums, fossils and legends: the past tense in context.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el fósil = the fossil',
    'antiguo = ancient, old',
    'el siglo = the century',
    'la época = the era, the time',
    'el dinosaurio = the dinosaur',
    'la piedra = the stone',
    'la cueva = the cave',
    'el rey = the king',
    'la reina = the queen',
    'el héroe | la heroína = the hero',
    'la leyenda = the legend',
    'la ruina | las ruinas = the ruin',
    'la pirámide = the pyramid',
    'el petroglifo = the petroglyph',
    'los antepasados = the ancestors',
    'la cerámica = the pottery',
    'el tesoro = the treasure',
    'descubrir = to discover',
    'excavar = to dig',
    'contar una historia = to tell a story',
    'recordar el pasado = to remember the past',
    'el arqueólogo | la arqueóloga = the archaeologist',
    'moderno = modern',
    'hace mucho tiempo = a long time ago',
    'el monumento = the monument',
    'la estatua = the statue',
    'el volcán = the volcano',
```

**Levels 11–20, 40 short phrases:** story openers and time expressions, how old things are, museum talk.

Examples:

- Había una vez... — Once upon a time...
- hace mil años — a thousand years ago
- Esto es muy antiguo — This is very old
- ¿De qué época es? — What era is it from?
- en el siglo pasado — in the last century
- No se puede tocar — You can’t touch it

**Levels 21+, 50 sentences:** short histories in the preterite: who built what, what was found, a legend told simply.

Examples:

- Los mayas construyeron pirámides — The Maya built pyramids
- Este fósil tiene diez mil años — This fossil is ten thousand years old
- Un niño descubrió la cueva — A boy discovered the cave
- Hace mucho tiempo, aquí vivían animales enormes — A long time ago, huge animals lived here
- Mi abuelo me contó una leyenda — My grandfather told me a legend
- Los antepasados dibujaron en las piedras — The ancestors drew on the stones

### Latinoamérica (`latinoamerica`): Latin America

**Family:** Guardabarranco. **Focus:** Every Spanish-speaking country of Central and South America (plus the Caribbean): countries, nationalities, capitals, one or two typical things each.

**Note:** Nationalities for Guatemala, Honduras, El Salvador, Costa Rica, Panamá, Venezuela, Ecuador, Bolivia, Uruguay, Paraguay, Cuba, República Dominicana and Puerto Rico go in the phrases.

**Levels 2–10, the 27 words (in this order):**

```ts
    'México = Mexico',
    'Guatemala = Guatemala',
    'Honduras = Honduras',
    'El Salvador = El Salvador',
    'Nicaragua = Nicaragua',
    'Costa Rica = Costa Rica',
    'Panamá = Panama',
    'Colombia = Colombia',
    'Venezuela = Venezuela',
    'Ecuador = Ecuador',
    'Perú = Peru',
    'Bolivia = Bolivia',
    'Chile = Chile',
    'Argentina = Argentina',
    'Uruguay = Uruguay',
    'Paraguay = Paraguay',
    'Cuba = Cuba',
    'República Dominicana = the Dominican Republic',
    'Puerto Rico = Puerto Rico',
    'nicaragüense = Nicaraguan',
    'mexicano | mexicana = Mexican',
    'colombiano | colombiana = Colombian',
    'argentino | argentina = Argentinian',
    'peruano | peruana = Peruvian',
    'chileno | chilena = Chilean',
    'la capital = the capital',
    'la bandera = the flag',
```

**Levels 11–20, 40 short phrases:** where people are from, nationality agreement (-o/-a), capitals, flags, "Soy de...".

Examples:

- Soy de México — I’m from Mexico
- Ella es colombiana — She’s Colombian
- La capital de Perú es Lima — The capital of Peru is Lima
- Él es costarricense | Él es tico — He’s Costa Rican
- la bandera de Nicaragua — the flag of Nicaragua
- Somos nicaragüenses — We’re Nicaraguan

**Levels 21+, 50 sentences:** one fact per country (food, landscape, a word), travel plans, comparing countries.

Examples:

- El café de Colombia es muy famoso — Colombian coffee is very famous
- En Perú están las montañas de los Andes — The Andes mountains are in Peru
- En Argentina dicen "che" — In Argentina they say "che"
- Panamá tiene un canal muy grande — Panama has a very big canal
- En Nicaragua hay muchos volcanes — There are many volcanoes in Nicaragua
- Quiero visitar todos los países de América — I want to visit every country in the Americas

### La playa (`playa`): The beach

**Family:** Cangrejito → Cangrejón. **Focus:** A day at the beach: sand, waves, sun, swimming, safety.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la arena = the sand',
    'la ola = the wave',
    'la concha = the shell',
    'el traje de baño = the swimsuit',
    'la toalla = the towel',
    'el bloqueador = the sunscreen',
    'la sombrilla = the beach umbrella',
    'el castillo de arena = the sandcastle',
    'la orilla = the shore',
    'la marea = the tide',
    'el cangrejo = the crab',
    'la palmera = the palm tree',
    'el atardecer = the sunset',
    'las gafas de sol | los lentes de sol = the sunglasses',
    'el salvavidas = the lifeguard, the life jacket',
    'la tabla de surf = the surfboard',
    'bucear = to dive',
    'surfear = to surf',
    'tomar el sol = to sunbathe',
    'quemarse = to get sunburned',
    'flotar = to float',
    'el hielo = the ice',
    'la hamaca = the hammock',
    'el pozo = the tide pool, the well',
    'la gorra = the cap',
    'las chancletas = the flip-flops',
    'el agua de coco = the coconut water',
```

**Levels 11–20, 40 short phrases:** going to the beach, the water and the sun, safety warnings.

Examples:

- ¡Vamos a la playa! — Let’s go to the beach!
- El agua está fría — The water is cold
- Ponte bloqueador — Put on sunscreen
- ¡Cuidado con las olas! — Watch out for the waves!
- No te alejes de la orilla — Don’t go far from the shore
- ¡Qué bonito atardecer! — What a beautiful sunset!

**Levels 21+, 50 sentences:** a day at the beach told in order, San Juan del Sur style surf talk, what you bring.

Examples:

- Llevamos comida, toallas y una sombrilla — We bring food, towels and an umbrella
- Las olas están muy grandes hoy — The waves are very big today
- Me quemé porque no me puse bloqueador — I got sunburned because I didn’t put on sunscreen
- Hicimos un castillo de arena enorme — We made a huge sandcastle
- Mi hermano aprendió a surfear — My brother learned to surf
- Por la tarde vimos el atardecer — In the afternoon we watched the sunset

### Las frutas (`frutas`): Fruit

**Family:** Coquito → Cocotero. **Focus:** Tropical fruit, ripeness and taste, buying fruit and drinks (refrescos naturales).

**Levels 2–10, the 27 words (in this order):**

```ts
    'el coco = the coconut',
    'el mango = the mango',
    'la papaya = the papaya',
    'el banano | el guineo = the banana',
    'el plátano = the plantain',
    'la sandía = the watermelon',
    'el melón = the melon',
    'la naranja = the orange',
    'el limón = the lime, the lemon',
    'la manzana = the apple',
    'la pera = the pear',
    'la guayaba = the guava',
    'el jocote = the jocote (a small tropical plum)',
    'el mamón = the mamón (Spanish lime)',
    'la pitahaya = the dragon fruit',
    'el marañón = the cashew fruit',
    'maduro = ripe',
    'pasado = overripe',
    'dulce = sweet',
    'ácido = sour',
    'jugoso = juicy',
    'exprimir = to squeeze',
    'la semilla = the seed',
    'la cáscara = the peel, the shell',
    'el racimo = the bunch',
    'la cosecha = the harvest',
    'el refresco natural = the fresh fruit drink',
```

**Levels 11–20, 40 short phrases:** buying fruit (quantities), ripe or not, favorite fruit, drinks.

Examples:

- ¿Me da un kilo de mangos? — Can I have a kilo of mangoes?
- Este mango está maduro — This mango is ripe
- un jugo de naranja — an orange juice
- Está muy ácido — It’s very sour
- Mi fruta favorita es la piña — My favorite fruit is pineapple
- una docena de bananos — a dozen bananas

**Levels 21+, 50 sentences:** what grows where, making a drink step by step, the market.

Examples:

- En Nicaragua hay mangos en abril — In Nicaragua there are mangoes in April
- El refresco de pitahaya es de color morado — Dragon fruit drink is purple
- Primero pelas la papaya y después la cortas — First you peel the papaya and then you cut it
- Compramos frutas en el mercado — We buy fruit at the market
- Los cocos caen cuando hay viento — Coconuts fall when it’s windy
- La sandía tiene muchas semillas — Watermelon has lots of seeds

### El mar (`mar`): The sea

**Family:** Mordisquito → Mordiscón. **Focus:** Life in the sea and on boats: fish and sea animals, sailing, the lake with freshwater sharks.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el tiburón = the shark',
    'el delfín = the dolphin',
    'la ballena = the whale',
    'la tortuga = the turtle',
    'el pulpo = the octopus',
    'la medusa = the jellyfish',
    'la estrella de mar = the starfish',
    'el barco = the ship',
    'la lancha = the motorboat',
    'el capitán | la capitana = the captain',
    'el puerto = the port',
    'la isla = the island',
    'el océano = the ocean',
    'el fondo del mar = the bottom of the sea',
    'la aleta = the fin',
    'el ancla = the anchor',
    'el faro = the lighthouse',
    'la gaviota = the seagull',
    'profundo = deep',
    'salado = salty',
    'hundirse = to sink',
    'navegar = to sail',
    'la corriente = the current',
    'el submarino = the submarine',
    'el arrecife = the reef',
    'el marinero = the sailor',
    'el lago = the lake',
```

**Levels 11–20, 40 short phrases:** animals you see, boats, deep or shallow, sea warnings.

Examples:

- El mar está tranquilo — The sea is calm
- ¡Hay un tiburón! — There’s a shark!
- Vamos en lancha — Let’s go by boat
- ¿Sabes nadar? — Can you swim?
- El agua es muy profunda aquí — The water is very deep here
- Las ballenas cantan — Whales sing

**Levels 21+, 50 sentences:** a boat trip, what lives where, the shark of Lake Nicaragua, the lighthouse.

Examples:

- En el lago de Nicaragua hay tiburones — There are sharks in Lake Nicaragua
- Vimos delfines desde el barco — We saw dolphins from the boat
- El faro ayuda a los barcos de noche — The lighthouse helps ships at night
- El pulpo tiene ocho brazos — The octopus has eight arms
- El capitán dijo que viene una tormenta — The captain said a storm is coming
- Las tortugas nadan miles de kilómetros — Turtles swim thousands of kilometers

### La pesca (`pesca`): Fishing

**Family:** Mojarrita. **Focus:** Fishing in rivers and lakes: the rod, waiting, the catch, Nicaraguan fish (guapote, mojarra, tilapia).

**Note:** "el pescado" (fish as food) vs "el pez" (the animal, in the core): teach the difference in a phrase.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la caña de pescar = the fishing rod',
    'el anzuelo = the hook',
    'la carnada = the bait',
    'el pescador | la pescadora = the fisherman',
    'pescar = to fish',
    'el río = the river',
    'el bote = the boat',
    'la canoa = the canoe',
    'la red = the net',
    'la mojarra = the mojarra (a fish)',
    'el guapote = the guapote (a fish)',
    'la tilapia = the tilapia',
    'el pescado = the fish (to eat)',
    'picar = to bite (fish)',
    'soltar = to let go',
    'la lombriz = the worm',
    'el remo = the oar',
    'remar = to row',
    'la cubeta | el balde = the bucket',
    'el sombrero de paja = the straw hat',
    'la paciencia = the patience',
    'grandote = huge',
    'chiquito = tiny',
    'escaparse = to escape',
    'el muelle = the dock',
    'el amanecer = the dawn',
    'la escama = the scale (of a fish)',
```

**Levels 11–20, 40 short phrases:** the moments of fishing, luck, size of the catch.

Examples:

- ¡Pica! ¡Pica! — It’s biting!
- Se me escapó — It got away
- Hoy no pica nada — Nothing is biting today
- ¡Qué pez tan grande! — What a big fish!
- Hay que tener paciencia — You have to be patient
- Jala la caña — Pull the rod

**Levels 21+, 50 sentences:** a fishing trip told in the past, how to fish step by step, eating the catch.

Examples:

- Salimos a pescar al amanecer — We went fishing at dawn
- Mi abuelo pescó un guapote enorme — My grandfather caught a huge guapote
- Primero pones la carnada en el anzuelo — First you put the bait on the hook
- Soltamos los peces pequeños — We let the small fish go
- La tilapia frita es deliciosa — Fried tilapia is delicious
- Esperamos dos horas y no pescamos nada — We waited two hours and caught nothing

### El viaje (`viaje`): Travel

**Family:** Pelicanito → Maletícano. **Focus:** Traveling: tickets, buses and planes, hotels, borders, souvenirs.

**Levels 2–10, the 27 words (in this order):**

```ts
    'la reservación = the reservation',
    'la frontera = the border',
    'el turista | la turista = the tourist',
    'la mochila = the backpack',
    'la llegada = the arrival',
    'la salida = the departure, the exit',
    'el vuelo = the flight',
    'el equipaje = the luggage',
    'la aduana = the customs',
    'empacar = to pack',
    'el horario = the schedule',
    'de ida y vuelta = round trip',
    'la recepción = the front desk',
    'la llave = the key',
    'el recuerdo = the souvenir, the memory',
    'la guía = the guide (book or person)',
    'la terminal = the terminal',
    'el asiento = the seat',
    'la ventanilla = the window (bus, plane)',
    'el pasillo = the aisle',
    'retrasado = delayed',
    'cancelado = canceled',
    'el cajero automático = the ATM',
    'el hostal = the hostel',
    'la estación de buses = the bus station',
    'hacer turismo = to go sightseeing',
    'perder el bus = to miss the bus',
```

**Levels 11–20, 40 short phrases:** buying tickets, times, at the hotel, asking for help as a tourist.

Examples:

- Un boleto de ida y vuelta, por favor — A round-trip ticket, please
- ¿A qué hora sale el bus? — What time does the bus leave?
- Tengo una reservación — I have a reservation
- ¡Buen viaje! — Have a good trip!
- ¿Dónde está la terminal? — Where is the terminal?
- Prefiero la ventanilla — I prefer the window seat

**Levels 21+, 50 sentences:** plans for a trip (ir a), a trip that happened (preterite), problems on the road.

Examples:

- El próximo mes vamos a viajar a Panamá — Next month we’re going to travel to Panama
- Perdimos el bus y llegamos tarde — We missed the bus and arrived late
- En la frontera revisaron nuestras maletas — At the border they checked our suitcases
- Compré recuerdos para toda la familia — I bought souvenirs for the whole family
- El vuelo está retrasado una hora — The flight is delayed an hour
- Me gusta viajar en bus porque veo los pueblos — I like traveling by bus because I see the towns

### La familia (`familia`): Family

**Family:** Paslamita → Paslamona. **Focus:** The wider family, growing up, family events, who looks like whom.

**Levels 2–10, the 27 words (in this order):**

```ts
    'el nieto | la nieta = the grandchild',
    'el sobrino | la sobrina = the nephew, the niece',
    'el cuñado | la cuñada = the brother-in-law, the sister-in-law',
    'el suegro | la suegra = the father-in-law, the mother-in-law',
    'los gemelos | las gemelas = the twins',
    'el hijo único | la hija única = the only child',
    'los hermanos = the siblings',
    'los parientes = the relatives',
    'el padrino = the godfather',
    'la madrina = the godmother',
    'la boda = the wedding',
    'el bisabuelo | la bisabuela = the great-grandparent',
    'el hermanito | la hermanita = the little brother, the little sister',
    'el apellido = the last name',
    'parecerse = to look alike',
    'criar = to raise (children)',
    'llevarse bien = to get along',
    'pelear = to fight',
    'el hogar = the home',
    'la reunión familiar = the family gathering',
    'el mayor | la mayor = the oldest',
    'el menor | la menor = the youngest',
    'adoptar = to adopt',
    'la generación = the generation',
    'el nido = the nest',
    'la cría = the baby animal',
    'el huevo de tortuga = the turtle egg',
```

**Levels 11–20, 40 short phrases:** talking about your family, ages, who looks like whom, family words for turtles too.

Examples:

- Tengo dos hermanos — I have two siblings
- ¿Cuántos hermanos tienes? — How many siblings do you have?
- Me parezco a mi mamá — I look like my mom
- Soy hijo único | Soy hija única — I’m an only child
- Mi familia es grande — My family is big
- Nos llevamos muy bien — We get along very well

**Levels 21+, 50 sentences:** describing family members, family gatherings, a turtle mother and her hatchlings.

Examples:

- Mi abuela tiene ocho nietos — My grandmother has eight grandchildren
- Los domingos comemos todos juntos — On Sundays we all eat together
- La tortuga pone cien huevos en la arena — The turtle lays a hundred eggs in the sand
- Mi sobrino nació el año pasado — My nephew was born last year
- Mis padres se casaron en León — My parents got married in León
- Las crías corren al mar de noche — The hatchlings run to the sea at night

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

**Family:** Mascarita → Torovenado. **Focus:** Clothes beyond the core list, getting dressed, describing outfits and costumes.

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

**Family:** Hamaquita. **Focus:** The day from waking up to sleeping, time and frequency, rest and naps.

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

**Family:** Garrobito → Brasita. **Focus:** Animals of Nicaragua (the garrobo, monkeys, the sloth) and the farm, where they live and what they eat.

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

## 3. Grammar topics for the schools

Practice topics like Rita's present-tense lesson: add them to `src/data/content/trainers.ts` (rename the
file to `topics.ts` if you like) and to the `build` list.
- Each has 3 difficulty tiers. The teacher asks 8 questions, starting with the easiest tier you haven't
  mastered yet.
- Lines that are also in the core or a theme are shared items (fine).

### Las preguntas (`preguntas`): Questions. School: Villa Ocote

```ts
export const preguntas: ThemeSource = {
  id: 'preguntas',
  name: 'Las preguntas',
  en: 'Questions',
  tiers: {
    1: [
      '¿Qué es esto? = What is this?',
      '¿Quién es ella? = Who is she?',
      '¿Dónde vives? = Where do you live?',
      '¿Cuándo es tu cumpleaños? = When is your birthday?',
      '¿Cómo se llama tu perro? = What is your dog called?',
      '¿Por qué lloras? = Why are you crying?',
      '¿Cuántos años tienes? = How old are you?',
      '¿Cuál es tu color favorito? = What is your favorite color?',
    ],
    2: [
      '¿Qué quieres comer? = What do you want to eat?',
      '¿Con quién vas a la escuela? = Who do you go to school with?',
      '¿De dónde es tu mamá? = Where is your mom from?',
      '¿Adónde vas? = Where are you going?',
      '¿Cuánto cuesta el pan? = How much is the bread?',
      '¿Cómo estás hoy? = How are you today?',
      '¿A qué hora empieza? = What time does it start?',
      '¿Para qué es esto? = What is this for?',
    ],
    3: [
      '¿Qué haces los domingos? = What do you do on Sundays?',
      '¿Quiénes son tus amigos? = Who are your friends?',
      '¿Por qué no vienes con nosotros? = Why don’t you come with us?',
      '¿Cuántas Palabritas tienes? = How many Palabritas do you have?',
      '¿Dónde está la mina? = Where is the mine?',
      '¿Cómo se dice "clay" en español? = How do you say "clay" in Spanish?',
      '¿Cuál prefieres, el rojo o el azul? = Which do you prefer, the red or the blue?',
      '¿Desde cuándo vives aquí? = Since when have you lived here?',
    ],
  },
};
```

### Gustar y encantar (`gustar`): Liking things. School: Villa Ocote

```ts
export const gustar: ThemeSource = {
  id: 'gustar',
  name: 'Gustar y encantar',
  en: 'Liking things',
  tiers: {
    1: [
      'Me gusta el café = I like coffee',
      'Me gustan los perros = I like dogs',
      '¿Te gusta bailar? = Do you like to dance?',
      'No me gusta el frío = I don’t like the cold',
      'Le gusta cantar = He likes to sing',
      'Nos gusta la playa = We like the beach',
      'Me encanta la música = I love music',
      'No me gustan las arañas = I don’t like spiders',
    ],
    2: [
      'A ella le gustan las flores = She likes flowers',
      '¿Les gusta el fútbol? = Do you (all) like soccer?',
      'A mi papá le encanta cocinar = My dad loves cooking',
      'Me gusta más el mango = I like mango more',
      'A nosotros nos encantan las fiestas = We love parties',
      'A mí no, pero a mi hermano sí = Not me, but my brother does',
      '¿Qué te gusta hacer? = What do you like to do?',
      'Me gusta mucho leer = I really like reading',
    ],
    3: [
      'A los niños les encantan los dulces = Kids love candy',
      'Me gustaría viajar a Perú = I would like to travel to Peru',
      'Te va a gustar este libro = You’re going to like this book',
      'No me gustó la película = I didn’t like the movie',
      '¿Te gustó la comida? = Did you like the food?',
      'A mi abuela le molesta el ruido = The noise bothers my grandmother',
      'Nos interesa la historia = We’re interested in history',
      'Me duelen los pies de tanto caminar = My feet hurt from so much walking',
    ],
  },
};
```

### Las direcciones (`direcciones`): Directions. School: Playa Carey

```ts
export const direcciones: ThemeSource = {
  id: 'direcciones',
  name: 'Las direcciones',
  en: 'Directions',
  tiers: {
    1: [
      'a la derecha = on the right',
      'a la izquierda = on the left',
      'todo recto | derecho = straight ahead',
      'al norte = to the north',
      'al sur = to the south',
      'al este = to the east',
      'al oeste = to the west',
      'aquí cerca = near here',
    ],
    2: [
      'Gira a la izquierda = Turn left',
      'Sigue recto | Sigue derecho = Keep going straight',
      'Está al lado del faro = It’s next to the lighthouse',
      'Está detrás de la iglesia = It’s behind the church',
      'Cruza la calle = Cross the street',
      'Camina dos cuadras = Walk two blocks',
      'Está enfrente del mercado = It’s across from the market',
      'Sube la colina = Go up the hill',
    ],
    3: [
      '¿Cómo llego a la playa? = How do I get to the beach?',
      'Del muelle, tres cuadras al sur = From the dock, three blocks south',
      'La tienda está entre la escuela y el banco = The shop is between the school and the bank',
      'Sigue esta calle hasta el final = Follow this street to the end',
      'Está a cinco minutos caminando = It’s five minutes on foot',
      'Al llegar a la esquina, gira a la derecha = When you reach the corner, turn right',
      'No está lejos, te acompaño = It’s not far, I’ll go with you',
      'Perdón, ¿me puede decir dónde está el faro? = Excuse me, can you tell me where the lighthouse is?',
    ],
  },
};
```

### Ir a + verbo (`ira`): Plans: going to.... School: Playa Carey

```ts
export const ira: ThemeSource = {
  id: 'ira',
  name: 'Ir a + verbo',
  en: 'Plans: going to...',
  tiers: {
    1: [
      'Voy a nadar = I’m going to swim',
      'Vas a ganar = You’re going to win',
      'Va a llover = It’s going to rain',
      'Vamos a comer = We’re going to eat',
      'Van a bailar = They’re going to dance',
      'Voy a dormir = I’m going to sleep',
      'Vas a ver = You’ll see',
      'Vamos a jugar = Let’s play',
    ],
    2: [
      'Mañana voy a pescar = Tomorrow I’m going to fish',
      '¿Qué vas a hacer hoy? = What are you going to do today?',
      'Esta noche vamos a ver las tortugas = Tonight we’re going to see the turtles',
      'Mi hermana va a surfear = My sister is going to surf',
      'No voy a llegar tarde = I’m not going to be late',
      'Van a abrir el gimnasio = They’re going to open the gym',
      '¿Vas a comer pescado? = Are you going to eat fish?',
      'Voy a llamar a mi mamá = I’m going to call my mom',
    ],
    3: [
      'El sábado vamos a ir a la isla en lancha = On Saturday we’re going to go to the island by boat',
      'Cuando sea grande, voy a ser salvavidas = When I grow up, I’m going to be a lifeguard',
      'Te voy a ganar, ¡vas a ver! = I’m going to beat you, you’ll see!',
      'Este año voy a aprender a surfear = This year I’m going to learn to surf',
      '¿A qué hora vas a volver? = What time are you going to come back?',
      'Vamos a ayudar a las tortugas = We’re going to help the turtles',
      'No van a creer lo que vi = You’re not going to believe what I saw',
      'Primero vamos a comer y después vamos a nadar = First we’re going to eat and then we’re going to swim',
    ],
  },
};
```

### En el restaurante (`restaurante`): At the restaurant. School: Playa Carey (and the waiter quest)

```ts
export const restaurante: ThemeSource = {
  id: 'restaurante',
  name: 'En el restaurante',
  en: 'At the restaurant',
  tiers: {
    1: [
      'el menú = the menu',
      'la mesa para dos = the table for two',
      'el mesero | la mesera = the waiter',
      'la bebida = the drink',
      'el postre = the dessert',
      'la propina = the tip',
      'Para mí... = For me...',
      'Quisiera... = I would like...',
    ],
    2: [
      'Quisiera una sopa de pescado = I’d like a fish soup',
      'Para mí, un jugo de piña = For me, a pineapple juice',
      '¿Qué me recomienda? = What do you recommend?',
      'Sin hielo, por favor = Without ice, please',
      '¿Me trae la cuenta? = Can you bring me the check?',
      'La comida está deliciosa = The food is delicious',
      '¿Tienen comida vegetariana? = Do you have vegetarian food?',
      'Una mesa para tres, por favor = A table for three, please',
    ],
    3: [
      'Quisiera el pescado frito con arroz y ensalada = I’d like the fried fish with rice and salad',
      'Para tomar, dos refrescos de naranja = To drink, two orange drinks',
      'Disculpe, esto no es lo que pedí = Excuse me, this isn’t what I ordered',
      '¿El plato del día viene con sopa? = Does the dish of the day come with soup?',
      'Todo estuvo muy rico, gracias = Everything was very tasty, thanks',
      '¿Podemos pagar por separado? = Can we pay separately?',
      'Para la niña, un vaso de leche = For the girl, a glass of milk',
      'De postre quiero un helado de coco = For dessert I want a coconut ice cream',
    ],
  },
};
```

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

## 4. Checks after writing content

- `npm build` must not throw (a duplicate inside one list throws).
- `npm test -- data`: words at every level up to 30, for every Palabrita.
- Add a check to `data.test`: no Spanish key appears in two lists with different English (print them, then
  fix them).
- `node tools/sim.mjs`: answers per level for 21–30 should be about 18–26.
- **A native speaker's skim** is welcome but never blocks shipping. Keep a list of anything you were unsure
  about in the commit message.

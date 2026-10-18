import type { ThemeSource } from './index';

// Practice topics for NPC lessons. Tiers here are just difficulty bands.

// Rita's lesson: the present tense of regular verbs. Subject pronouns are optional in
// Spanish, so both "Yo hablo" and "Hablo" are accepted.
export const presente: ThemeSource = {
  id: 'presente',
  name: 'El presente',
  en: 'Present tense',
  tiers: {
    1: [
      'Yo hablo | Hablo = I speak',
      'Tú hablas | Hablas = You speak',
      'Ella canta | Canta = She sings',
      'Nosotros caminamos | Caminamos = We walk',
      'Ustedes bailan | Bailan = You all dance',
      'Ellos trabajan | Trabajan = They work',
    ],
    2: [
      'Yo como | Como = I eat',
      'Tú bebes | Bebes = You drink',
      'Él corre | Corre = He runs',
      'Nosotros comemos | Comemos = We eat',
      'Ellos aprenden | Aprenden = They learn',
      'Yo vivo | Vivo = I live',
      'Tú escribes | Escribes = You write',
    ],
    3: [
      'Ella abre la ventana | Abre la ventana = She opens the window',
      'Nosotros vivimos aquí | Vivimos aquí = We live here',
      'Ellos escriben cartas | Escriben cartas = They write letters',
      '¿Hablas español? = Do you speak Spanish?',
      'Paloma entrena pájaros = Paloma trains birds',
      'Yo estudio español | Estudio español = I study Spanish',
      'Los pájaros cantan en la mañana = The birds sing in the morning',
    ],
  },
};

// School topics (one pair per school; plans/content.md §3). Villa Ocote: questions, and liking things.
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

// Playa Carey's school: directions, and plans with «ir a». The restaurant (El Pelícano Feliz) uses «restaurante».
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

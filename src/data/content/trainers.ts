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

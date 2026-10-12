import type { ThemeSource } from './index';

// Topics trainers quiz you on when they attack (answer well to defend).
// Tiers here are just difficulty bands; trainers pick from tiers up to their level.

export const saludos: ThemeSource = {
  id: 'saludos',
  name: 'Saludos',
  en: 'Greetings',
  tiers: {
    1: ['hola = hello', 'adiós = goodbye', 'gracias = thank you', 'por favor = please'],
    2: ['buenos días = good morning', 'buenas tardes = good afternoon', 'buenas noches = good night', 'de nada = you’re welcome'],
    3: [
      '¿Cómo estás? = How are you?',
      'Estoy bien = I’m fine',
      'Mucho gusto = Nice to meet you',
      'Hasta luego = See you later',
      'Lo siento = I’m sorry',
      '¿Cómo te llamas? = What’s your name?',
    ],
  },
};

export const preguntas: ThemeSource = {
  id: 'preguntas',
  name: 'Preguntas',
  en: 'Question words',
  tiers: {
    1: ['¿Qué? = What?', '¿Dónde? = Where?', '¿Cuándo? = When?', '¿Quién? = Who?'],
    2: ['¿Por qué? = Why?', '¿Cómo? = How?', '¿Cuánto? = How much?', '¿Cuál? = Which?'],
    3: [
      '¿Dónde vives? = Where do you live?',
      '¿Qué haces? = What are you doing?',
      '¿De dónde eres? = Where are you from?',
      '¿Quién es ella? = Who is she?',
      '¿Por qué no? = Why not?',
      '¿Qué es esto? = What is this?',
    ],
  },
};

// Gym 1 (Paloma): the present tense of regular verbs. Subject pronouns are optional in
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

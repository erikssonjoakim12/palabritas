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

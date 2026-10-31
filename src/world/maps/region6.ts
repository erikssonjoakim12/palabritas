import { flag } from '../../game/state';
import type { MapDef, NpcDef } from './kit';

/*
  Region 6 (plans/cadejos.md), so far only the fog outside the gym 6 city, played as a demo (?demo=niebla). The fog
  is a handful of small patches: walking off one leads into another, chosen by the fog walk (world/region6.ts),
  never by the world. Openings are 2 tiles wide with a straight way in at least 3 tiles deep, where the dogs wait.
*/

/** Who is in the patch of fog you're in: world/region6.ts decides as you walk in, and the maps' NPCs show by it. */
export const inFog = new Set<string>();

/** The fog lifts once Tomás is home (his grandmother's script): the patches settle into one fixed road. */
const lifted = () => flag('tomasEnCasa');

/** Wild Palabritas in the fog, on every step: night creatures and ghosts, around level 30 (the user, 2026-10-31). */
const FOG_WILD = {
  rate: 0.07,
  everywhere: true,
  table: [
    { sp: 'murcielon', min: 28, max: 31, w: 30 },
    { sp: 'lamparita', min: 28, max: 31, w: 20 },
    { sp: 'taranton', min: 28, max: 31, w: 20 },
    { sp: 'zopiloton', min: 29, max: 32, w: 15 },
    { sp: 'perezosito', min: 28, max: 30, w: 15 },
  ],
};

/** A patch of fog: the dogs (placed by the fog walk wherever they wait), and whoever else is lost in it. */
const patch = (id: string, rows: string[], [x, y]: [number, number], npcs: NpcDef[] = []): MapDef => ({
  id,
  name: 'La niebla',
  outdoor: true,
  floor: '.',
  ground: 'grass',
  style: { trees: 'pine' },
  fog: 'patch',
  fogLifts: lifted,
  wakeUp: 'despertarNiebla',
  rows,
  encounters: FOG_WILD,
  npcs: [
    { id: 'cadenegro', x, y, object: 'cadenegro', dir: 'left', script: 'cadenegro', near: 3, glow: 'eyes', mirrors: true, show: () => inFog.has('cadenegro') },
    { id: 'cadeblanco', x, y, object: 'cadeblanco', dir: 'left', script: 'cadeblanco', near: 3, glow: 'body', mirrors: true, show: () => inFog.has('cadeblanco') },
    ...npcs,
  ],
});
/** Someone lost in the fog, there only when the fog walk says so. */
const lost = (def: NpcDef): NpcDef => ({ ...def, show: () => inFog.has(def.id) });

export const REGION6_MAPS: Record<string, MapDef> = {
  /** Where the trail from the city meets the fog (the demo starts here; one day it joins the gym 6 city). */
  niebla_borde: {
    id: 'niebla_borde',
    name: 'Borde de la niebla',
    outdoor: true,
    floor: '.',
    ground: 'grass',
    style: { trees: 'pine' },
    fog: 'edge',
    fogLifts: lifted,
    rows: [
      'IIIII==IIIII',
      'IIII,==,IIII',
      'III,,==,,III',
      'II,,.==.,,II',
      'I,,..==..,,I',
      'I,...==...,I',
      'I....==....I',
      'I.S..==....I',
      'I....==....I',
      'I....==....I',
      'I....==....I',
      'IIIIIIIIIIII',
    ],
    triggers: [{ x: 5, y: 0, script: 'nieblaEntrar' }, { x: 6, y: 0, script: 'nieblaEntrar' }],
    signs: [{ x: 2, y: 7, es: '¡Cuidado! Niebla espesa. No te salgas del camino.', en: 'Careful! Thick fog. Don’t leave the path.' }],
    npcs: [
      { id: 'abuela_niebla', x: 7, y: 8, look: 'granny', dir: 'left', script: 'abuela_niebla' },
      { id: 'tomas_casa', x: 8, y: 8, look: 'tomas', dir: 'left', script: 'tomasSigue', show: () => flag('tomasEnCasa') },
      { id: 'cadeblanco_borde', x: 6, y: 3, object: 'cadeblanco', dir: 'left', script: 'cadeblancoBorde', glow: 'body', mirrors: true, show: () => flag('nieblaSalida') && !flag('cadeblancoAcariciado') },
    ],
  },
  niebla1: patch('niebla1', [
    'IIIII==IIIII',
    'II,,,==,,,II',
    'I,,,.==.,,,I',
    'I,,..==..,,I',
    '===..==..===',
    '===..==..===',
    'I,,..==..,,I',
    'I,,,.==.,,,I',
    'II,,,==,,,II',
    'IIIII==IIIII',
  ], [5, 4]),
  niebla2: patch('niebla2', [
    'III==IIIIIII',
    'II,==,,IIIII',
    'I,,==,,,,III',
    'I,.==...,,,I',
    '===..::..===',
    '===..::..===',
    'I,,..::.,,,I',
    'I,,,,..,,,II',
    'II,,,,,,IIII',
    'IIIIIIIIIIII',
  ], [5, 5], [
    lost({ id: 'excursionista_rodrigo', x: 6, y: 1, look: 'hiker', dir: 'left', script: 'excursionista_rodrigo', sight: 3 }),
  ]),
  niebla3: patch('niebla3', [
    'IIIIIII==III',
    'I,,,,,,==,II',
    'I,II,,,==,,I',
    'I,II,.....,I',
    'I,,,,..,,,,I',
    'I,,..,,,,..I',
    'I,..,,,..===',
    'I,..==...===',
    'II,,==,,,,II',
    'IIII==IIIIII',
  ], [5, 4]),
  niebla4: patch('niebla4', [
    'IIII==IIIIII',
    'II,,==,,,III',
    'I,,,==,,,,,I',
    'I~~~HH~~~~~I',
    'I,,,==,,,,,I',
    '===.==..,,,I',
    '===.....,,,I',
    'I,,,..,,,,II',
    'II,,..,,IIII',
    'IIII..IIIIII',
  ], [5, 5]),
  niebla5: patch('niebla5', [
    'IIIIII==IIII',
    'I,,,,,==,,,I',
    'I,,..====,,I',
    'I,.==~~~=.,I',
    '===.~~~~.===',
    '===.~~~~.===',
    'I,.==~~==.,I',
    'I,,..====,,I',
    'I,,,,==,,,,I',
    'IIIII==IIIII',
  ], [8, 4], [
    lost({ id: 'espeleologo_ismael', x: 9, y: 1, look: 'espeleologo', dir: 'left', script: 'espeleologo_ismael', sight: 3 }),
  ]),
  niebla6: patch('niebla6', [
    'IIIIIIIIIIII',
    'IIII,,,,IIII',
    'II,,,**,,,II',
    'I,,*,,,,*,,I',
    '===,,..,,===',
    '===..**..===',
    'I,,,,..,,,,I',
    'II,,,..,,,II',
    'IIII,..,IIII',
    'IIIII..IIIII',
  ], [5, 4]),
  /** The clearing where Tomás waits by two old trees (the fog walk always ends up here after a while). */
  niebla_claro: patch('niebla_claro', [
    'IIIII==IIIII',
    'II,,,..,,,II',
    'I,,......,,I',
    'I,...**...,I',
    '===.*TT*.===',
    '===.*..*.===',
    'I,...**...,I',
    'I,,......,,I',
    'II,,,..,,,II',
    'IIIII..IIIII',
  ], [3, 4], [
    lost({ id: 'tomas_niebla', x: 5, y: 5, look: 'tomas', dir: 'down', script: 'tomasNiebla' }),
  ]),
};

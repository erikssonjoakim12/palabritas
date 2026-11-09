import { casa, centro, tienda, itemBall, boulder, HOUSES, type MapDef, type EncounterEntry } from './kit';

/*
  Region 8 (plans/region7-8.md): Ciudad Ceniza, the old capital, on Ruta 9's place and the river's land below the
  volcano (it starts where Ruta 9 started, so a save there keeps its spot). Old streets half-swallowed by the black
  lava of 1610, a ruined church sticking out of the rock, newer houses built on top; lava fields with tall grass
  around it. Every way in is blocked by a boulder (Strength, the 7th medal): from Ruta 5's road, and from the river,
  where a little pier lands you behind one. Gym 8, Dragón: Doña Aurora's archive.
*/

/** The gym 8 town. */
export const TOWN8 = 'Ciudad Ceniza';

/** The lava fields: the salamander's home, the feathered serpent rare in the ruins (plans/region7-8.md). */
const CENIZA_WILD: EncounterEntry[] = [
  { sp: 'salamandrita', min: 34, max: 44, w: 22 },
  { sp: 'salamandron', min: 40, max: 46, w: 4 },
  { sp: 'zopiloton', min: 34, max: 44, w: 10 },
  { sp: 'gequito', min: 32, max: 40, w: 10 },
  { sp: 'garrobon', min: 36, max: 46, w: 8 },
  { sp: 'culebrita', min: 36, max: 44, w: 4 },
  { sp: 'hormigon', min: 34, max: 42, w: 10 },
  { sp: 'petroglifon', min: 34, max: 44, w: 8 },
  { sp: 'chocoyote', min: 34, max: 42, w: 8 },
  { sp: 'brasita', min: 30, max: 31, w: 5 },
];
/** The ruined church: what's left of it says so (the tiles' own look is for a church that's still standing). */
const RUINS = { es: 'La vieja iglesia. La lava entró en 1610, y nadie la volvió a abrir.', en: 'The old church. The lava came in in 1610, and nobody ever opened it again.' };

export const REGION8_MAPS: Record<string, MapDef> = {
  ceniza: {
    id: 'ceniza',
    name: TOWN8,
    outdoor: true,
    floor: '.',
    ground: 'ash',
    roof: 'charcoal',
    style: { rock: 'basalt', trees: 'dry' },
    rows: [
      'TTTTT^                                                                    ',
      'TTTTT^                                                                    ',
      '=====^                                                                    ',
      '=E===^                                                                    ',
      'T.==.^^^^^                                                                ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^                                                                    ',
      'T.==.^^^S^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^            ^^^',
      'T.....==========================.......................^^^^              ^',
      'T.....==......................==.^^........................H              ',
      'T.....==.ooooo..rrrr..NqqqqqN.==.^^^........,,,,,,,,,,,^^^^^^^            ',
      'T.....==.ooooo..rrrr..NqEqq^N.==..^^^.......,,,,,,,,,,,......^^           ',
      'T.....==.hwcwh..hwMh..hw^wEwhY==...^^..^^^^.,,,,,,,,,,,.......^^          ',
      'T.....==.hwdwh..hwdh..h^EEh^h.==...^^^^^^^..,,,,,,,,,,,........^^^        ',
      'T.....==Y...................g.==....^^^.....,,,,,,,,,,,.....E....^^       ',
      'T.....==g....g......gS........==......E.....,,,,,,,,,,,...........^^      ',
      'T.....==========================........................,,,,,,,,,,,^^^    ',
      'T.....==========================..................E.....,,,,,,,,,,,..^^^^^',
      'T.....==......................==........................,,,,,,,,,,,......^',
      'T.....==.rrrrr.rrrrr..pppppp..==.............E..........,,,,,,,,,,,......^',
      'T.....==.rrrrr.rrrrr..pppppp.Y==........................,,,,,,,,,,,......^',
      'T.....==.hwwwh.hwwwh..hwGwwh..==..............,,,,,,,...,,,,,,,,,,,..E...^',
      'T.....==.hwdwh.hwdwh..hhdhhhg.==..............,,,,,,,...,,,,,,,,,,,......^',
      'T.....==......g.........=.....==..............,,,,,,,....................^',
      'T.....==========================........^^^...,,,,,,,...........E........^',
      'T................................E....^^^^....,,,,,,,....................^',
      'T.......,,,,,,,,,,,.................^^^^.................................^',
      'T.......,,,,,,,,,,,......E.....^^^^^^^...................................^',
      'T.......,,,,,,,,,,,........^^^^^^^^^.....^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      'T.......,,,,,,,,,,,......^^^^^^..........^                                ',
      'T.......,,,,,,,,,,,....^^^^...E..........^                                ',
      'T.,,,,,,,,...........^^^^...,,,,,,,,,,,..^                                ',
      'T.,,,,,,,,.E.......^^^^.....,,,,,,,,,,,..^                                ',
      'T.,,,,,,,,.....^^^^^^.E.....,,,,,,,,,,,..^                                ',
      'T.,,,,,,,,..^^^^^^^.........,,,,,,,,,,,..^                                ',
      'T.,,,,,,,,..^^^.............,,,,,,,,,,,..^                                ',
      'T.,,,,,,,,....E.............,,,,,,,,,,,..^                                ',
      'T........................................^                                ',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT                                ',
    ],
    connections: { left: { to: 'ruta6', offset: 27 } },
    encounters: { rate: 0.12, table: CENIZA_WILD },
    signs: [
      { x: 8, y: 13, es: `${TOWN8.toUpperCase()}. La capital antigua, construida sobre la lava.`, en: `${TOWN8.toUpperCase()}. The ancient capital, built on the lava.` },
      { x: 21, y: 21, es: 'Aquí estaba la plaza mayor. Debajo de la lava, dicen, todavía están las campanas.', en: 'The main square was here. Under the lava, they say, the bells are still there.' },
      ...[[22, 16], [22, 17], [28, 16], [28, 17]].map(([x, y]) => ({ x, y, ...RUINS })),
    ],
    doors: [
      { x: 11, y: 19, to: 'centro_ceniza', tx: 4, ty: 7 },
      { x: 18, y: 19, to: 'tienda_ceniza', tx: 4, ty: 6 },
      { x: 11, y: 28, to: 'casa_ceniza1', tx: 4, ty: 6 },
      { x: 17, y: 28, to: 'casa_ceniza2', tx: 4, ty: 6 },
      { x: 24, y: 28, to: 'gym_ceniza', tx: 5, ty: 12 },
    ],
    npcs: [
      // The ways in: Ruta 5's road, and the pier on the river.
      boulder('roca_ceniza_camino', 1, 2),
      boulder('roca_ceniza_muelle', 58, 15),
      { id: 'bombero_julio', x: 4, y: 8, look: 'bombero', dir: 'left', script: 'bombero_julio', sight: 2 },
      { id: 'vulcanologa_eva', x: 50, y: 14, look: 'vulcanologo', dir: 'down', script: 'vulcanologa_eva', sight: 2 },
      { id: 'arqueologo_saul', x: 14, y: 31, look: 'arqueologo', dir: 'down', script: 'arqueologo_saul', sight: 3 },
      { id: 'excursionista_pili', x: 60, y: 25, look: 'exploradora', dir: 'left', script: 'excursionista_pili', sight: 3 },
      { id: 'guardaparque_nestor', x: 35, y: 40, look: 'guardaparque', dir: 'left', script: 'guardaparque_nestor', sight: 3 },
      { id: 'cronista_amalia', x: 36, y: 24, look: 'historiadora', dir: 'left', script: 'cronista_amalia', sight: 4 },
      { id: 'abuela_ceniza', x: 25, y: 21, look: 'granny', dir: 'down', script: 'abuela_ceniza' },
      { id: 'nina_ceniza', x: 15, y: 21, look: 'girl', dir: 'down', script: 'nina_ceniza', wanders: true },
      { id: 'vecino_ceniza', x: 33, y: 28, look: 'campesino', dir: 'left', script: 'vecino_ceniza', turns: true },
      itemBall('ceniza_superbola', 70, 30, 'superbola'),
      itemBall('ceniza_revivir', 2, 42, 'revivir'),
    ],
  },
  centro_ceniza: centro('centro_ceniza', { to: 'ceniza', x: 11, y: 20 }, [{ id: 'viajero_ceniza', x: 1, y: 5, look: 'hiker', dir: 'right', script: 'viajero_ceniza' }]),
  tienda_ceniza: tienda('tienda_ceniza', { to: 'ceniza', x: 18, y: 20 }),
  casa_ceniza1: casa('casa_ceniza1', 'Casa', { to: 'ceniza', x: 11, y: 29 }, [{ id: 'senora_ceniza', x: 4, y: 2, look: 'lady', dir: 'down', script: 'senora_ceniza' }], { rows: HOUSES.cocina }),
  casa_ceniza2: casa('casa_ceniza2', 'Casa', { to: 'ceniza', x: 17, y: 29 }, [{ id: 'abuelo_ceniza', x: 5, y: 2, look: 'abuelo', dir: 'down', script: 'abuelo_ceniza' }]),
  // The archive of the old capital, in what's left of its fort: Doña Aurora's gym (Dragón).
  gym_ceniza: {
    id: 'gym_ceniza',
    name: 'Archivo de la ciudad antigua',
    outdoor: false,
    floor: '+',
    rows: [
      '############',
      'LL+++RR+++LL',
      '+++++RR+++++',
      'L+LL++++LL+L',
      '++++++++++++',
      'LL+++LL+++LL',
      '++++++++++++',
      '+LL++++++LL+',
      '++++++++++++',
      'L+++LLLL+++L',
      '++++++++++++',
      '++++++++++++',
      'P++++++++++P',
      '+++++mm+++++',
    ],
    exit: { to: 'ceniza', x: 24, y: 29 },
    npcs: [
      { id: 'historiadora_clara', x: 0, y: 10, look: 'historiadora', dir: 'right', script: 'historiadora_clara', sight: 4 },
      { id: 'restaurador_efren', x: 11, y: 8, look: 'restaurador', dir: 'left', script: 'restaurador_efren', sight: 4 },
      { id: 'archivera_luz', x: 0, y: 4, look: 'archivera', dir: 'right', script: 'archivera_luz', sight: 4 },
      { id: 'aurora', x: 5, y: 1, look: 'aurora', dir: 'down', script: 'aurora' },
      { id: 'guia_ceniza', x: 8, y: 12, look: 'lady', dir: 'left', script: 'guia_ceniza' },
    ],
  },
};

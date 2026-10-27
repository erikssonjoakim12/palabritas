import { fanfare } from '../audio/bgm';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag, today } from '../game/state';
import { addItem, takeItem, itemCount } from '../game/bag';
import { giveMon, lucasStarter } from '../game/mon';
import { record } from '../game/learning';
import { itemBySpanish, adHocItem } from '../data/content';
import { info, say, setSpeaker } from '../ui/textbox';
import { ask } from '../ui/menu';
import { challenge, chooseText } from '../ui/challenge';
import { trainerBattle, wildBattle } from '../battle/battle';
import { TRAINERS } from '../data/trainers';
import { speak } from '../lang/speech';
import { warp, refreshNpcs, walkNpc, placeNpc, approachPlayer, setFade, fadeOut, currentMap, type ScriptFn } from './world';
import { MAPS, gateOf, type Line } from './maps';
import { lines, trainerFight, blackout, talkMode } from './scripts';
import { teacher } from './school';

/*
  Region 2: Villa Ocote, the town that lost its words, the Mina de Barro and Petra's gym.
  The story: a message on the ground sends you to the mine; Equipo Silencio's
  Capataz runs the Silenciador there; when it breaks, the town talks again and Petra opens her gym.
  While the town is muted (MapDef.muted), people only mime: the engine shows «…» instead of these scripts.
*/

/** Shuffle a copy (for answer choices). */
const shuffled = <T>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);

/** A reading or listening choice: ask until the right option is picked. */
async function untilRight(label: string, en: string, right: string, wrong: string[], retry: Line, replay?: string) {
  const options = shuffled([right, ...wrong]);
  while (true) {
    const i = await chooseText(label, en, options, replay);
    if (options[i] === right) return sfx('right');
    sfx('wrong');
    await lines(retry);
  }
}

// ---------- The story ----------

/** The east entrance, the first time: the message scratched in the dirt. */
async function mensajeOcote() {
  if (flag('mensajeLeido')) return;
  sfx('alert');
  await info('En el suelo, alguien escribió algo con un palo...', { en: 'Someone wrote something on the ground with a stick...' });
  const message = '¡AYUDA! Los Silenciosos se llevaron nuestras palabras. Están en la mina, al norte.';
  await untilRight(
    `«${message}» ¿Dónde están los Silenciosos?`,
    'Read the message on the ground: where are the Silenciosos?',
    'En la mina',
    ['En la escuela', 'En el río'],
    ['Mmm, no. Lee el mensaje otra vez.', 'Hmm, no. Read the message again.'],
  );
  await lines(['¡Todos en el pueblo están callados! Hay que ir a la mina.', 'Everyone in town is silent! You have to go to the mine.']);
  setFlag('mensajeLeido');
}

/** The lever in the mine: it opens the wooden gate further in. */
async function palanca() {
  if (flag('compuertaAbierta')) return lines(['La palanca ya está abajo.', 'The lever is already down.']);
  if (!(await ask('Es una palanca vieja. ¿La jalas?', { en: 'It’s an old lever. Do you pull it?' }))) return;
  for (let i = 0; i < 3; i++) {
    sfx('bump');
    await frames(12);
  }
  setFlag('compuertaAbierta');
  refreshNpcs();
  await info('¡Se oye un ruido muy fuerte a lo lejos! Algo se abrió.', { en: 'A loud noise echoes in the distance! Something opened.' });
}

/** The Capataz guards the Silenciador; beating him breaks it, and Petra comes back. */
async function capataz() {
  if (flag('silenciadorRoto')) return;
  await lines(
    ['¡Shhh! ¿Quién eres tú? ¿Cómo puedes hablar?', 'Shhh! Who are you? How can you talk?'],
    ['Esta máquina es el Silenciador. Se come las palabras de todo el pueblo.', 'This machine is the Silenciador. It eats the whole town’s words.'],
    ['Don Sigilo dice: «Un mundo sin palabras es un mundo sin problemas». ¡Y yo estoy de acuerdo!', 'Don Sigilo says: "A world without words is a world without trouble." And I agree!'],
  );
  const res = await trainerBattle(TRAINERS.capataz, { look: 'capataz', outro: ['¡No! ¡Mi máquina!', 'No! My machine!'] });
  if (res === 'lose') return blackout();
  setFlag('beat:capataz');

  // The Silenciador shakes and breaks.
  for (let i = 0; i < 3; i++) {
    sfx('bump');
    setFade(0.5);
    await frames(4);
    setFade(0);
    await frames(14);
  }
  setFlag('silenciadorRoto');
  refreshNpcs();
  await info('¡El Silenciador se rompió! Las palabras salen volando...', { en: 'The Silenciador broke! The words are flying out...' });
  await info('¡Las palabras vuelan hacia el pueblo! Pero... algunas se perdieron por el camino.', {
    en: 'The words are flying back to town! But... some got lost on the way.',
  });
  await lines(['Esto no se acaba aquí. ¡Don Sigilo se va a enterar! ¡Shhh!', 'This isn’t over. Don Sigilo is going to hear about this! Shhh!']);
  await walkNpc('capataz', ['right', 'right', 'right', 'up', 'up']);
  setFlag('capatazHuyo');
  refreshNpcs();

  // Petra comes up from the south, just below you.
  placeNpc('petra_mina', 22, 21, 'up');
  const stop = G.save.x === 22 ? G.save.y + 1 : 17;
  await walkNpc('petra_mina', Array(Math.max(0, 21 - stop)).fill('up'));
  await lines(
    ['¡Puedo hablar otra vez! Gracias, de verdad.', 'I can talk again! Thank you, really.'],
    ['Soy Petra, la líder del gimnasio de Villa Ocote. Vine sola a la mina... ¡qué tonta fui!', 'I’m Petra, the leader of the Villa Ocote gym. I came to the mine alone... how silly of me!'],
    ['Ven a mi gimnasio cuando estés list{o/a}. ¡Te espero!', 'Come to my gym when you’re ready. I’ll be waiting!'],
  );
  setFlag('petraVolvio');
  await warp('ocote', 19, 4, 'down');
  await info('¡Se oyen voces por todo el pueblo! Villa Ocote habla otra vez.', { en: 'Voices everywhere in town! Villa Ocote is talking again.' });
}

/** The note the Capataz dropped as he ran: it points at Equipo Silencio's next plan (phase 3). */
async function notaCapataz() {
  await info('Es una nota. ¡Se le cayó al Capataz!', { en: 'It’s a note. The Capataz dropped it!' });
  const note = 'Capataz: cuando termines aquí, ve al sur, a Playa Carey. Callada te espera allá. —Don Sigilo';
  await untilRight(
    `«${note}» ¿Quién espera en Playa Carey?`,
    'Read the note: who is waiting at Playa Carey?',
    'Callada',
    ['Petra', 'Mía'],
    ['Mmm, no. Lee la nota otra vez.', 'Hmm, no. Read the note again.'],
  );
  await lines(['Equipo Silencio tiene otro plan... en la playa.', 'Equipo Silencio has another plan... at the beach.']);
  setFlag('notaLeida');
  refreshNpcs();
}

// ---------- The lost words ----------

/*
  When the Silenciador broke, eight words got lost on the way home. Each one belongs to one person in Villa
  Ocote, who can talk again except for that word. You find them (glowing speech bubbles in town, on Ruta 4 and
  in the mine) and give each back by completing its owner's sentence in Spanish. All eight: a party.
  Flags: palabra:<id> (found), devuelta:<id> (given back), palabrasDone. The key item 'palabras' counts the
  words you carry.
*/
interface LostWord {
  word: string;
  en: string;
  /** Their sentence, with ___ where the word goes. */
  gap: Line;
  /** What to look for, while the word is missing (English). */
  hint: string;
  thanks: Line;
  /** What they say at the party, using their word. */
  party: Line;
  look: string;
  reward: () => Promise<void>;
}

const give = async (id: string, n: number, es: string, en: string) => {
  addItem(id, n);
  sfx('caught');
  await info(`¡{name} recibió ${es}!`, { en: `{name} received ${en}!` });
};
const pay = async (n: number) => {
  G.save.money += n;
  sfx('caught');
  await info(`¡{name} recibió ${n}!`, { en: `{name} received ${n}!` });
};

export const LOST_WORDS: Record<string, LostWord> = {
  olla: {
    word: 'la olla', en: 'the pot', look: 'lady',
    gap: ['Esta ___ es de barro. ¿La quieres?', 'This ___ is made of clay. Do you want it?'],
    hint: 'something made of clay, for cooking',
    thanks: ['¡Mi olla! «Esta olla es de barro.» ¡Ya lo puedo decir! Toma, un regalo.', 'My pot! "This pot is made of clay." I can say it now! Here, a gift.'],
    party: ['¡Esta olla es para la sopa de la fiesta!', 'This pot is for the party soup!'],
    reward: () => give('superpocion', 1, 'una Superpoción', 'a Super Potion'),
  },
  tortilla: {
    word: 'la tortilla', en: 'the tortilla', look: 'lady',
    gap: ['Hago una ___ de maíz para el desayuno.', 'I make a corn ___ for breakfast.'],
    hint: 'something round and flat, made of corn',
    thanks: ['¡Una tortilla de maíz! Ya puedo decirlo. Toma, para el camino.', 'A corn tortilla! I can say it now. Here, for the road.'],
    party: ['¡Prueben la tortilla! Está calientita.', 'Try the tortilla! It’s nice and warm.'],
    reward: () => give('pocion', 2, 'dos Pociones', 'two Potions'),
  },
  bueyes: {
    word: 'los bueyes', en: 'the oxen', look: 'man',
    gap: ['Mis ___ se llaman Lucero y Canelo.', 'My ___ are called Lucero and Canelo.'],
    hint: 'big strong animals that pull his cart',
    thanks: ['¡Los bueyes! «Mis bueyes se llaman Lucero y Canelo.» ¡Gracias, muchach{o/a}!', 'The oxen! "My oxen are called Lucero and Canelo." Thank you, kid!'],
    party: ['Mañana llevo los bueyes al mercado... ¡pero hoy bailo!', 'Tomorrow I take the oxen to market... but today I dance!'],
    reward: () => pay(150),
  },
  historia: {
    word: 'la historia', en: 'the history, the story', look: 'abuelo',
    gap: ['Te voy a contar la ___ de Villa Ocote.', 'I’m going to tell you the ___ of Villa Ocote.'],
    hint: 'what old people tell about the past',
    thanks: ['¡La historia! Ahora sí te la puedo contar...', 'The history! Now I can tell it to you...'],
    party: ['Esta noche también es parte de la historia de Villa Ocote.', 'Tonight is also part of Villa Ocote’s history.'],
    reward: () => pay(200),
  },
  marimba: {
    word: 'la marimba', en: 'the marimba', look: 'musico',
    gap: ['Toco la ___ todas las noches en la plaza.', 'I play the ___ every night in the plaza.'],
    hint: 'a wooden instrument you play with mallets',
    thanks: ['¡La marimba! ¡La música volvió! Toma, para que nada te moleste en el camino.', 'The marimba! The music is back! Here, so nothing bothers you on the road.'],
    party: ['¡Y ahora... la marimba!', 'And now... the marimba!'],
    reward: () => give('repelente', 1, 'un Repelente', 'a Repel'),
  },
  medicina: {
    word: 'la medicina', en: 'the medicine', look: 'granny',
    gap: ['Para el dolor de cabeza, toma esta ___.', 'For a headache, take this ___.'],
    hint: 'what you take when you’re sick',
    thanks: ['¡La medicina! Toma, para tus Palabritas. ¡La salud es lo primero!', 'The medicine! Here, for your Palabritas. Health comes first!'],
    party: ['Si alguien baila demasiado, ¡aquí tengo medicina!', 'If anyone dances too much, I have medicine here!'],
    reward: () => give('superpocion', 2, 'dos Superpociones', 'two Super Potions'),
  },
  pelota: {
    word: 'la pelota', en: 'the ball', look: 'boy',
    gap: ['¿Jugamos con la ___?', 'Shall we play with the ___?'],
    hint: 'something round you kick',
    thanks: ['¡La pelota! ¡Golazo! Toma, te las regalo.', 'The ball! What a goal! Here, they’re yours.'],
    party: ['¡Después de la fiesta, todos a jugar con la pelota!', 'After the party, everyone come play with the ball!'],
    reward: () => give('palabola', 3, 'tres Palabolas', 'three Palabolas'),
  },
  pregunta: {
    word: 'la pregunta', en: 'the question', look: 'man',
    gap: ['Hoy tengo una ___ para ti.', 'Today I have a ___ for you.'],
    hint: 'what you ask when you want to know something',
    thanks: ['¡La pregunta! Sin preguntas no hay escuela. ¡Gracias!', 'The question! Without questions there’s no school. Thank you!'],
    party: ['Tengo una pregunta: ¿quién quiere más tortillas?', 'I have a question: who wants more tortillas?'],
    reward: async () => {},
  },
};
const LOST_IDS = Object.keys(LOST_WORDS);

/** Picking up a lost word (an object 'palabra_<id>'). */
const palabraPerdida: ScriptFn = async (c) => {
  const id = c.npc!.def.id.replace('palabra_', '');
  const w = LOST_WORDS[id];
  sfx('alert');
  speak(w.word);
  await info(`¡Una palabra perdida! Dice: «${w.word}».`, { en: `A lost word! It says: "${w.word}" (${w.en}).` });
  setFlag(`palabra:${id}`);
  addItem('palabras');
  refreshNpcs();
  await info('¿De quién será? Alguien en Villa Ocote la está buscando.', { en: 'Whose could it be? Someone in Villa Ocote is looking for it.' });
};

/** The bag's lost words: the ones you carry. */
async function verPalabras() {
  const carried = LOST_IDS.filter((id) => flag(`palabra:${id}`) && !flag(`devuelta:${id}`)).map((id) => LOST_WORDS[id]);
  if (!carried.length) return info('No llevas ninguna palabra perdida.', { en: 'You aren’t carrying any lost words.' });
  await info(`Llevas: ${carried.map((w) => `«${w.word}»`).join(', ')}.`, { en: `You carry: ${carried.map((w) => `"${w.word}" (${w.en})`).join(', ')}.` });
}

/**
 * A townsperson who lost a word: until it's back they stumble over it; with the word in your bag you complete
 * their sentence (it counts as practice). Afterwards, their usual lines.
 */
const owner = (id: string, usual: ScriptFn): ScriptFn => async (c) => {
  const w = LOST_WORDS[id];
  if (flag(`devuelta:${id}`)) return usual(c);
  const [gapEs, gapEn] = w.gap;
  if (!flag(`palabra:${id}`)) {
    await say(gapEs.replace('___', '…'), { en: `(A word is missing: "${gapEn}". Something like: ${w.hint}.)` });
    return lines(['¡Ay, no me sale la palabra!', 'Oh, the word won’t come out!']);
  }
  await lines(['¿Tienes mi palabra? ¡Ayúdame a decirlo!', 'Do you have my word? Help me say it!']);
  const item = itemBySpanish(w.word) ?? adHocItem([w.word], w.en);
  const r = await challenge({ item, mode: 'type', title: '💬 Palabra perdida', label: `Completa: «${gapEs}»`, allowHelp: true });
  record(item, r.mode, r.grade, r.helped);
  if (r.grade === 'wrong') return lines(['Mmm, no... esa no es mi palabra.', 'Hmm, no... that’s not my word.']);
  setFlag(`devuelta:${id}`);
  takeItem('palabras');
  sfx('levelup');
  await lines(w.thanks);
  await w.reward();
  if (LOST_IDS.every((k) => flag(`devuelta:${k}`))) await fiesta();
};

/** All eight words are back: the town throws a party in the plaza that night. */
async function fiesta() {
  await lines(['¡Todos hablan otra vez! ¡Esta noche hay fiesta en la plaza!', 'Everyone’s talking again! Tonight there’s a party in the plaza!']);
  await fadeOut(16);
  await warp('ocote_noche', 19, 16, 'up', false);
  await info('Esa noche, todo Villa Ocote se reúne alrededor de la fuente...', { en: 'That night, all of Villa Ocote gathers around the fountain...' });
  for (const id of LOST_IDS) {
    setSpeaker(LOST_WORDS[id].look);
    if (id === 'marimba') sfx('levelup');
    await say(LOST_WORDS[id].party[0], { en: LOST_WORDS[id].party[1] });
  }
  setSpeaker('petra');
  await lines(['Gracias a ti, Villa Ocote tiene todas sus palabras.', 'Thanks to you, Villa Ocote has all its words.']);
  setSpeaker();
  await give('superbola', 5, 'cinco Superbolas', 'five Super Balls');
  await give('revivir', 2, 'dos Revivir', 'two Revives');
  setFlag('palabrasDone');
  await warp('ocote', 19, 16, 'down', false);
}

// ---------- Ruta 4 and the canyon ----------


/**
 * Rival battle #1, as you step into the mine where Villa Ocote's silence comes from (the user: on Ruta 4, right
 * after the cave, he was too hard; here Ocote's Palacentro is on the way). Lucas comes in behind you and walks right
 * up to you.
 */
async function lucasMina() {
  if (flag('lucas1')) return;
  sfx('alert');
  setFlag('lucasAqui');
  placeNpc('lucas', 5, 24, 'up');
  await lines(['¡{name}! ¡Espera!', '{name}! Wait!']);
  await approachPlayer('lucas');
  await lines(
    ['¡Por fin te alcancé! ¿Tú también vas a la mina? Dicen que el silencio del pueblo viene de aquí.', 'I finally caught up with you! Are you going into the mine too? They say the town’s silence comes from here.'],
    ['¿Te acuerdas de mi Palabrita? ¡La entrené todos los días!', 'Remember my Palabrita? I’ve trained it every day!'],
    ['¡Vamos a ver quién aprendió más palabras!', 'Let’s see who learned more words!'],
  );
  const lucas = { ...TRAINERS.lucas1, team: [[lucasStarter(), 15], ['pajarito', 12]] as [string, number][] };
  const res = await trainerBattle(lucas, { look: 'lucas', outro: ['¡Ay! Estudiaste mucho, ¿verdad?', 'Ugh! You studied a lot, didn’t you?'] });
  setFlag('lucas1'); // won or lost: no second chance (the user), do better next time
  if (res === 'lose') {
    await lines(['¡Te gané! ¡Entrena más y nos vemos!', 'I beat you! Train more, and see you around!']);
    setFlag('lucasAqui', false);
    refreshNpcs();
    return blackout();
  }
  await lines(['Uf... Bueno, tú busca el silencio. Yo vuelvo al pueblo a curar a mis Palabritas.', 'Phew... OK, you go find the silence. I’m going back to town to heal my Palabritas.']);
  await walkNpc('lucas', ['down', 'down', 'down']);
  setFlag('lucasAqui', false);
  refreshNpcs();
}

/** Gaby the birdwatcher: describe the guardabarranco, then show her one. */
async function gaby() {
  if (flag('gabyDone')) return lines(['El guardabarranco viaja por toda América. ¡Como yo!', 'The guardabarranco travels all over the Americas. Like me!']);
  const hasBird = [...G.save.party, ...G.save.box].some((m) => m.sp === 'guardabarranco');
  if (flag('gabyPregunta')) {
    if (!hasBird) return lines(['Dicen que vive en el cañón. Si atrapas uno, ¡enséñamelo!', 'They say it lives in the canyon. If you catch one, show me!']);
    await lines(['¡Un guardabarranco! ¡Es precioso! Gracias por enseñármelo.', 'A guardabarranco! It’s beautiful! Thank you for showing me.']);
    addItem('superbola', 3);
    sfx('caught');
    await info('¡{name} recibió tres Superbolas!', { en: '{name} received three Super Balls!' });
    return setFlag('gabyDone');
  }
  await lines(
    ['Busco el guardabarranco, el ave nacional de Nicaragua.', 'I’m looking for the guardabarranco, Nicaragua’s national bird.'],
    ['Tiene el pecho verde, el cuerpo color canela y la cola larga, con dos plumas como raquetas.', 'It has a green chest, a cinnamon body and a long tail, with two feathers like rackets.'],
  );
  await untilRight(
    '¿Cuál es el guardabarranco?',
    'Which one is the guardabarranco?',
    'Un pájaro con la cola larga y dos plumas como raquetas',
    ['Un pájaro pequeño con la cola corta y el pico amarillo', 'Un pájaro grande, negro, con la cabeza roja'],
    ['Mmm, no. Escucha otra vez: la cola larga, con dos plumas como raquetas.', 'Hmm, no. Listen again: a long tail, with two feathers like rackets.'],
  );
  setFlag('gabyPregunta');
  await lines(['¡Exacto! Dicen que vive en el cañón. Si atrapas uno, ¡enséñamelo!', 'Exactly! They say it lives in the canyon. If you catch one, show me!']);
}

// ---------- Side quests ----------

/** Beto's hat: an Ecolín wears it in the cave's side room. */
async function ecolinSombrero() {
  sfx('alert');
  await lines(['¡Un Ecolín con un sombrero verde!', 'An Ecolín wearing a green hat!']);
  const res = await wildBattle('ecolin', 12);
  if (res === 'lose') return blackout();
  if (res === 'run') return;
  await info('¡Se le cayó el sombrero! Es verde... ¿de quién será?', { en: 'It dropped the hat! It’s green... whose could it be?' });
  addItem('sombrero');
  setFlag('sombreroEncontrado');
  refreshNpcs();
}

/** Beto, once his road is open: he wants his hat back. */
async function betoSombrero() {
  if (flag('sombreroDevuelto')) return lines(['¡Con mi sombrero, el sol ya no me molesta!', 'With my hat, the sun doesn’t bother me anymore!']);
  if (!itemCount('sombrero')) return lines(...(gateOf(currentMap(), 'beto')!.open as Line[]));
  await lines(['¿Ese es mi sombrero? A ver... ¿de qué color es?', 'Is that my hat? Let’s see... what color is it?']);
  const item = itemBySpanish('verde') ?? adHocItem(['verde', 'Es verde'], 'green');
  const r = await challenge({ item, mode: talkMode(), title: '🎩 El sombrero', label: '¿De qué color es el sombrero? · What color is the hat?' });
  record(item, r.mode, r.grade, r.helped);
  if (r.grade === 'wrong') return lines(['Mmm, no... el mío es de otro color.', 'Hmm, no... mine is a different color.']);
  takeItem('sombrero');
  setFlag('sombreroDevuelto');
  await lines(['¡Sí, es mi sombrero verde! ¡Muchas gracias!', 'Yes, it’s my green hat! Thank you so much!']);
  addItem('palabola', 5);
  sfx('caught');
  await info('¡{name} recibió cinco Palabolas!', { en: '{name} received five Palabolas!' });
}

/** The echo room's cracked wall: shout, and write what the echo says back. Five rounds break it. */
const ECHO: [string, string][] = [['hola', 'hello'], ['eco', 'echo'], ['la cueva', 'the cave'], ['amigo', 'friend'], ['¿Hay alguien?', 'Is anybody there?']];
async function paredEco() {
  await lines(['La pared tiene grietas. Del otro lado se oye un eco...', 'The wall is cracked. From the other side you hear an echo...']);
  if (!(await ask('¿Quieres gritar algo?', { en: 'Do you want to shout something?' }))) return;
  await info('¡Escucha el eco y escribe lo que dice!', { en: 'Listen to the echo and write what it says!' });
  for (const [es, en] of ECHO) {
    const item = itemBySpanish(es) ?? adHocItem([es], en);
    while (true) {
      const r = await challenge({ item, mode: 'listen', title: '🔊 El eco' });
      record(item, r.mode, r.grade, r.helped);
      if (r.grade !== 'wrong') break;
      await lines(['El eco se apagó... ¡Otra vez!', 'The echo faded... Again!']);
    }
  }
  for (let i = 0; i < 3; i++) {
    sfx('bump');
    await frames(10);
  }
  setFlag('ecoAbierto');
  refreshNpcs();
  await info('¡La pared tiembla... y se rompe! Detrás hay una sala escondida.', { en: 'The wall shakes... and breaks! Behind it is a hidden room.' });
}

/** The museum curator: she wakes the shell fossil up overnight (Caparazonte). */
async function curadora() {
  if (flag('caparazonte')) return lines(['¿Cómo está Caparazonte? ¡Cuídalo mucho! Es parte de la historia.', 'How is Caparazonte? Take good care of it! It’s part of history.']);
  if (flag('fosilEntregado')) {
    if (G.save.fossilDay === today()) return lines(['Todavía está durmiendo. ¡Vuelve mañana!', 'It’s still sleeping. Come back tomorrow!']);
    await lines(['¡Despertó! Se llama Caparazonte. Vivió hace diez mil años... ¡y ahora es tuyo!', 'It woke up! It’s called Caparazonte. It lived ten thousand years ago... and now it’s yours!']);
    const where = giveMon('caparazonte', 15);
    sfx('caught');
    await info('¡{name} recibió a Caparazonte!', { en: '{name} received Caparazonte!' });
    if (where === 'box') await info('Tu equipo está lleno: Caparazonte fue a la Caja de Palabritas.', { en: 'Your team is full: Caparazonte went to the storage box.' });
    return setFlag('caparazonte');
  }
  if (itemCount('fosil')) {
    await lines(['¡Un fósil de caparazón! Con mi máquina puedo despertarlo... pero tarda un día.', 'A shell fossil! With my machine I can wake it up... but it takes a day.']);
    if (!(await ask('¿Me lo prestas?', { en: 'Will you lend it to me?' }))) return lines(['Está bien. Si cambias de idea, aquí estoy.', 'All right. If you change your mind, I’m here.']);
    takeItem('fosil');
    setFlag('fosilEntregado');
    G.save.fossilDay = today();
    return lines(['¡Gracias! Vuelve mañana para ver qué pasa.', 'Thank you! Come back tomorrow to see what happens.']);
  }
  await lines(
    ['¡Bienvenid{o/a} al museo! Este museo guarda la historia de la región.', 'Welcome to the museum! This museum keeps the history of the region.'],
    ['¿Sabías que aquí vivían armadillos gigantes? ¡Mira el fósil!', 'Did you know giant armadillos lived here? Look at the fossil!'],
  );
}

/** Don Chepe's oxen ran off with the noise from the mine: one in the canyon, one behind the school. */
async function chepeBueyes() {
  if (flag('bueyesDone')) return lines(['Mañana llevamos la carreta al mercado. ¡Así es la vida en el campo!', 'Tomorrow we take the cart to the market. That’s life in the countryside!']);
  const where = 'Uno se fue al norte del cañón, cerca de la cascada. El otro está aquí en el pueblo, detrás de la escuela.';
  if (flag('bueyes')) {
    if (!flag('buey1') || !flag('buey2')) return say(where, { en: 'One went to the north of the canyon, near the waterfall. The other is here in town, behind the school.' });
    await lines(['¡Lucero! ¡Canelo! ¡Mis bueyes! ¡Gracias, gracias!', 'Lucero! Canelo! My oxen! Thank you, thank you!']);
    addItem('superpocion', 2);
    G.save.money += 300;
    sfx('caught');
    await info('¡{name} recibió dos Superpociones y $300!', { en: '{name} received two Super Potions and $300!' });
    return setFlag('bueyesDone');
  }
  await lines(['¡Ay, mis bueyes! Con el ruido de la mina, se escaparon.', 'Oh, my oxen! With the noise from the mine, they ran off.']);
  speak(where);
  await untilRight(
    '¿Dónde está el primer buey?',
    '🎧 Listen to Don Chepe: where is the first ox?',
    'Cerca de la cascada',
    ['En la mina', 'En la playa'],
    ['Mmm, no. ¡Escucha otra vez!', 'Hmm, no. Listen again!'],
    where,
  );
  setFlag('bueyes');
  refreshNpcs();
  await lines(['¡Eso! Y el otro está detrás de la escuela. ¿Me ayudas a traerlos?', 'That’s it! And the other one is behind the school. Will you help me bring them back?']);
}

/** An ox: it follows you back to Don Chepe. */
const buey: ScriptFn = async (c) => {
  sfx('alert');
  await lines(['¡Muuu!', 'Moo!']);
  await info('El buey te sigue hasta Don Chepe.', { en: 'The ox follows you back to Don Chepe.' });
  setFlag(c.npc!.def.id);
  refreshNpcs();
};

// ---------- The gym ----------

interface Riddle {
  q: Line;
  answer: string;
  wrong: string[];
  hint: Line;
}

/** The three stone doors in Petra's gym, bottom to top. */
const RIDDLES: Record<string, Riddle> = {
  piedra1: {
    q: ['Tengo cuatro patas y digo «miau». ¿Quién soy?', 'I have four legs and say "meow". Who am I?'],
    answer: 'el gato',
    wrong: ['el perro', 'el pájaro'],
    hint: ['Una pista: vive en la casa y toma leche.', 'A hint: it lives in the house and drinks milk.'],
  },
  piedra2: {
    q: ['Soy de barro y en mí se cocina la sopa. ¿Qué soy?', 'I’m made of clay and soup is cooked in me. What am I?'],
    answer: 'la olla',
    wrong: ['la mesa', 'el zapato'],
    hint: ['Una pista: está en la cocina, como Ollita.', 'A hint: it’s in the kitchen, like Ollita.'],
  },
  piedra3: {
    q: ['Tengo cara, pero no tengo boca. Tengo manos, pero no tengo dedos. Doy la hora. ¿Qué soy?', 'I have a face but no mouth. I have hands but no fingers. I tell the time. What am I?'],
    answer: 'el reloj',
    wrong: ['la luna', 'la puerta'],
    hint: ['Una pista: lo miras para saber si llegas tarde.', 'A hint: you look at it to know if you’re late.'],
  },
};

const adivinanza: ScriptFn = async (c) => {
  const id = c.npc!.def.id;
  const r = RIDDLES[id];
  await info('La puerta tiene un dibujo y unas palabras...', { en: 'The door has a drawing and some words...' });
  const options = shuffled([r.answer, ...r.wrong]);
  let hinted = false;
  while (true) {
    speak(r.q[0]);
    const i = await chooseText(r.q[0], `A riddle: ${r.q[1]}`, options, r.q[0]);
    if (options[i] === r.answer) break;
    sfx('wrong');
    await lines(hinted ? ['Mmm, no. Lee otra vez.', 'Hmm, no. Read it again.'] : r.hint);
    hinted = true;
  }
  sfx('right');
  await info(`«${r.answer[0].toUpperCase()}${r.answer.slice(1)}». ¡La puerta se abre!`, { en: 'The door opens!' });
  sfx('bump');
  setFlag(`adivinanza:${id}`);
  refreshNpcs();
};

async function petra() {
  if (flag('medalBarro')) {
    return lines(
      ['El barro es paciente, como aprender un idioma. ¡Sigue practicando!', 'Clay is patient, like learning a language. Keep practicing!'],
      ['El camino al sur baja hasta el mar. ¡Allá te espera otra aventura!', 'The road south goes down to the sea. Another adventure is waiting for you there!'],
    );
  }
  await lines(
    ['¡Llegaste! ¿Te gusta el barro? ¡A mí me encanta! Con barro hago ollas, jarras... y Palabritas fuertes.', 'You made it! Do you like clay? I love it! With clay I make pots, jugs... and strong Palabritas.'],
    ['¿Sabes por qué me gusta tanto? Porque el barro es paciente, como aprender un idioma.', 'Do you know why I like it so much? Because clay is patient, like learning a language.'],
  );
  if (!(await ask('¿Estás list{o/a}?', { en: 'Are you ready?' }))) return lines(['Vuelve cuando quieras. El barro siempre espera.', 'Come back whenever you want. Clay always waits.']);
  const res = await trainerBattle(TRAINERS.petra, { look: 'petra', outro: ['¡Se me rompió todo! Bueno... así se aprende.', 'Everything broke! Well... that’s how you learn.'] });
  if (res === 'lose') return blackout();
  setFlag('beat:petra');
  setFlag('medalBarro');
  G.save.medals.push('Barro');
  fanfare('medalla', 'badge');
  await info('¡{name} recibió la Medalla Barro!', { en: '{name} received the Clay Medal!' });
  await lines(['Con esta medalla puedes bajar al sur, hasta el mar.', 'With this medal you can go south, down to the sea.']);
  if (!MAPS.ruta6) {
    await info('¡Felicidades! Terminaste la segunda parte de Palabritas.', { en: 'Congratulations! You finished the second part of Palabritas.' });
    await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', {
      en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!',
    });
  }
}

// ---------- People ----------

/** Someone with a few lines, the same each time. */
const talk = (...ls: Line[]): ScriptFn => () => lines(...ls);

export const REGION2: Record<string, ScriptFn> = {
  mensajeOcote,
  notaCapataz,
  lucasMina,
  gaby,
  ecolinSombrero,
  betoSombrero,
  paredEco,
  curadora,
  buey,
  lucas: talk(['¡Te voy a ganar la próxima vez!', 'I’m going to beat you next time!']),
  armando: () =>
    trainerFight('armando', {
      intro: ['¡Cuidado! Estoy cortando leña. Bueno... ¿luchamos?', 'Careful! I’m chopping firewood. Well... shall we battle?'],
      defeated: ['¡Uf! Más fuerte que un pino.', 'Phew! Stronger than a pine.'],
      after: ['Los pinos de aquí huelen a ocote. ¡Me encanta ese olor!', 'The pines here smell of ocote. I love that smell!'],
    }),
  elena: () =>
    trainerFight('elena', {
      intro: ['¡Hola! Acampo aquí todos los veranos. ¿Una batalla?', 'Hi! I camp here every summer. A battle?'],
      defeated: ['¡Ay, se me apagó la fogata!', 'Oh, my campfire went out!'],
      after: ['De noche se ven muchas estrellas en la montaña.', 'At night you can see lots of stars in the mountains.'],
    }),
  julio: () =>
    trainerFight('julio', {
      intro: ['¡Shh! Los peces se asustan. Bueno, ¡luchemos rápido!', 'Shh! The fish get scared. Well, let’s battle fast!'],
      defeated: ['Se me escapó... ¡como un pez!', 'It got away... like a fish!'],
      after: ['Abajo del puente hay tilapias. Con una caña, ¡pescas muchas!', 'Under the bridge there are tilapias. With a rod you catch lots!'],
    }),
  rosa: () =>
    trainerFight('rosa', {
      intro: ['¿Viste el guardabarranco? ¡Yo tampoco! ¿Luchamos mientras esperamos?', 'Did you see the guardabarranco? Me neither! Shall we battle while we wait?'],
      defeated: ['¡Qué buen{o/a} eres!', 'You’re so good!'],
      after: ['Dicen que vive al final del cañón, cerca de la cascada.', 'They say it lives at the end of the canyon, near the waterfall.'],
    }),
  palabraPerdida,
  verPalabras,
  palanca,
  capataz,
  adivinanza,
  petra,

  compuerta: talk(['La compuerta está cerrada. Tal vez hay una palanca...', 'The gate is closed. Maybe there’s a lever...']),
  carreta: talk(['La carreta de Don Chepe. ¡Las ruedas son enormes!', 'Don Chepe’s ox-cart. The wheels are huge!']),

  silencioso1: () =>
    trainerFight('silencioso1', {
      intro: ['¡Shhh! ¡Silencio! Aquí no se habla.', 'Shhh! Silence! No talking here.'],
      defeated: ['¡Shhh! No le digas a nadie que perdí.', 'Shhh! Don’t tell anyone I lost.'],
      after: ['El Capataz está abajo, con la máquina. ¡Shhh!', 'The Foreman is down below, with the machine. Shhh!'],
    }),
  silencioso2: () =>
    trainerFight('silencioso2', {
      intro: ['¿Buscas la palanca? ¡No la vas a encontrar!', 'Looking for the lever? You won’t find it!'],
      defeated: ['Bueno... la palanca está ahí atrás.', 'Well... the lever is right back there.'],
      after: ['Las palabras solo causan problemas. ¿No crees?', 'Words only cause trouble. Don’t you think?'],
    }),
  silencioso3: () =>
    trainerFight('silencioso3', {
      intro: ['Cuando el Silenciador termine, ¡nadie va a hablar!', 'When the Silenciador is done, nobody will speak!'],
      defeated: ['¿Cómo hablas tan bien?', 'How do you speak so well?'],
      after: ['El jefe, Don Sigilo, dice que el silencio es oro.', 'The boss, Don Sigilo, says silence is golden.'],
    }),
  silencioso4: () =>
    trainerFight('silencioso4', {
      intro: ['¡No pasas! ¡Shhh!', 'You won’t pass! Shhh!'],
      defeated: ['¡Ay! Hablé demasiado.', 'Oh! I talked too much.'],
      after: ['El Capataz es muy fuerte. ¡Ten cuidado!', 'The Foreman is very strong. Be careful!'],
    }),
  petra_mina: talk(['¡Gracias otra vez! Te espero en el gimnasio.', 'Thanks again! I’ll be waiting at the gym.']),

  tito: () =>
    trainerFight('tito', {
      intro: ['Hago ollas con barro de la mina. ¿Y tú qué haces?', 'I make pots with clay from the mine. And what do you do?'],
      defeated: ['¡Se me rompió una olla!', 'One of my pots broke!'],
      after: ['Petra me enseñó todo. Es la mejor alfarera de Nicaragua.', 'Petra taught me everything. She’s the best potter in Nicaragua.'],
    }),
  rosario: () =>
    trainerFight('rosario', {
      intro: ['Trabajo en la mina. ¡Soy más dura que una piedra!', 'I work in the mine. I’m tougher than a rock!'],
      defeated: ['Bueno... no tan dura.', 'Well... not that tough.'],
      after: ['La última puerta tiene la adivinanza más difícil.', 'The last door has the hardest riddle.'],
    }),
  guia_ocote: talk(
    ['¡Hola! Petra usa Palabritas de tipo Roca y Tierra.', 'Hi! Petra uses Rock and Ground types.'],
    ['El agua y las plantas son muy eficaces contra ellas.', 'Water and plants are super effective against them.'],
    ['Para abrir las puertas, lee bien las adivinanzas.', 'To open the doors, read the riddles carefully.'],
  ),

  // Villa Ocote, once it can talk again.
  mia: talk(
    ['¡Yo escribí el mensaje en el suelo! ¿Lo leíste?', 'I wrote the message on the ground! Did you read it?'],
    ['Ahora puedo hablar todo lo que quiero. ¡Bla, bla, bla!', 'Now I can talk as much as I want. Blah, blah, blah!'],
  ),
  abuelo_ocote: owner('historia', talk(
    ['Hace muchos años, esta mina daba el mejor barro del país.', 'Many years ago, this mine gave the best clay in the country.'],
    ['Con ese barro, los alfareros de Villa Ocote hacían ollas para toda Nicaragua.', 'With that clay, the potters of Villa Ocote made pots for all of Nicaragua.'],
    ['¿Y sabes por qué el pueblo se llama así? El ocote es la madera del pino. ¡Arde muy bien y huele rico!', 'And do you know why the town has this name? Ocote is pine wood. It burns well and smells nice!'],
  )),
  vendedora: owner('olla', async () => {
    await lines(['¿Te gustan mis ollas? ¡Las hago a mano!', 'Do you like my pots? I make them by hand!']);
    const i = await chooseText('¿Cuál prefieres?', 'Which one do you prefer?', ['La olla grande', 'La jarra pequeña']);
    await lines(
      i === 0
        ? ['¡La olla grande! Perfecta para cocinar gallo pinto para toda la familia.', 'The big pot! Perfect for cooking gallo pinto for the whole family.']
        : ['¡La jarra pequeña! Ideal para tomar agua fresquita.', 'The little jug! Ideal for drinking nice cool water.'],
    );
  }),
  chepe: owner('bueyes', chepeBueyes),
  lucas_ocote: talk(['...', '(Lucas can’t talk either.)']),
  musico: owner('marimba', async () => {
    await lines(['La marimba es el instrumento de Nicaragua.', 'The marimba is Nicaragua’s instrument.']);
    if (await ask('¿Te gusta la música?', { en: 'Do you like music?' })) await lines(['¡A mí también! La música alegra el pueblo.', 'Me too! Music makes the town happy.']);
    else await lines(['¿No? ¡Pues escucha esto!', 'No? Well, listen to this!']);
    sfx('levelup');
  }),
  futbolista: owner('pelota', talk(
    ['¡Cuando sea grande, voy a jugar en la selección!', 'When I grow up, I’m going to play for the national team!'],
    ['¿Sabías que en Nicaragua el deporte más popular es el béisbol? Pero a mí me gusta más el fútbol.', 'Did you know that in Nicaragua the most popular sport is baseball? But I like soccer more.'],
  )),
  cocinera: owner('tortilla', talk(
    ['¿Ya desayunaste? Aquí comemos gallo pinto con tortilla.', 'Have you had breakfast? Here we eat gallo pinto with tortillas.'],
    ['Las tortillas se hacen con masa de maíz. ¡Y se cocinan en el comal!', 'Tortillas are made with corn dough. And they’re cooked on the comal (griddle)!'],
  )),
  curandera: owner('medicina', talk(
    ['¿Te duele algo? Un té de manzanilla lo cura todo.', 'Does anything hurt? Chamomile tea cures everything.'],
    ['Mis plantas curan a la gente... ¡y a las Palabritas también!', 'My plants heal people... and Palabritas too!'],
  )),
  chepe_esposa: talk(['Mi esposo cuida los bueyes como a sus hijos.', 'My husband looks after the oxen like his children.']),
  alfarera_mama: talk(['Toda mi familia trabaja con barro. ¡Hasta el niño!', 'My whole family works with clay. Even the boy!']),
  alfarero_nino: talk(['¡Hice una ollita! Bueno... parece un plato.', 'I made a little pot! Well... it looks like a plate.']),
  mia_mama: talk(['Mía es muy valiente. ¡Escribió ese mensaje sola!', 'Mía is very brave. She wrote that message by herself!']),
  nando_papa: talk(['Nando juega fútbol todo el día. ¡Hasta en la cocina!', 'Nando plays soccer all day. Even in the kitchen!']),
  abuela_ocote: talk(
    ['Llevo setenta años en Villa Ocote. Nunca había visto un silencio así.', 'I’ve lived seventy years in Villa Ocote. I’d never seen a silence like that.'],
    ['Gracias a ti, otra vez oigo a los pájaros... y a mi esposo roncar.', 'Thanks to you, I can hear the birds again... and my husband snoring.'],
  ),
  abuelo_dormido: talk(['Zzz... Zzz...', '(He’s fast asleep.)']),
  ramiro: talk(
    ['Este es el taller. Aquí hacemos ollas, jarras y tinajas.', 'This is the workshop. Here we make pots, jugs and water jars.'],
    ['Primero amasamos el barro, luego le damos forma y después lo cocinamos en el horno.', 'First we knead the clay, then we shape it, and after that we bake it in the kiln.'],
    ['Petra aprendió aquí, conmigo. ¡Ahora es mejor que yo!', 'Petra learned here, with me. Now she’s better than me!'],
  ),
  // Profesor Rubén: Villa Ocote's topics are questions and liking things.
  maestro_ocote: owner('pregunta', teacher(['preguntas', 'gustar'])),
  alumno1: talk(['¿Qué es más difícil: el español o las matemáticas?', 'What’s harder: Spanish or math?']),
  alumna1: talk(['A mí me gusta mucho la clase de música.', 'I really like music class.']),
};

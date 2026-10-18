import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag } from '../game/state';
import { info } from '../ui/textbox';
import { ask } from '../ui/menu';
import { chooseText } from '../ui/challenge';
import { trainerBattle } from '../battle/battle';
import { TRAINERS } from '../data/trainers';
import { speak } from '../lang/speech';
import { warp, refreshNpcs, walkNpc, placeNpc, setFade, type ScriptFn } from './world';
import { MAPS, type Line } from './maps';
import { lines, trainerFight, blackout } from './scripts';

/*
  Region 2: Villa Ocote, the town that lost its words, the Mina de Barro and Petra's gym.
  The story (plans/phase2-region2.md §6): a message on the ground sends you to the mine; Equipo Silencio's
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
  sfx('badge');
  await info('¡{name} recibió la Medalla Barro!', { en: '{name} received the Clay Medal!' });
  await lines(
    ['Con esta medalla puedes bajar al sur, hasta el mar.', 'With this medal you can go south, down to the sea.'],
    ['Y una cosa más: ¡pronto el bus va a llegar hasta Villa Ocote! Vas a poder viajar a los pueblos que conoces.', 'And one more thing: soon the bus will come all the way to Villa Ocote! You’ll be able to travel to towns you know.'],
  );
  setFlag('busOpen');
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
  abuelo_ocote: talk(
    ['Hace muchos años, esta mina daba el mejor barro del país.', 'Many years ago, this mine gave the best clay in the country.'],
    ['Con ese barro, los alfareros de Villa Ocote hacían ollas para toda Nicaragua.', 'With that clay, the potters of Villa Ocote made pots for all of Nicaragua.'],
    ['¿Y sabes por qué el pueblo se llama así? El ocote es la madera del pino. ¡Arde muy bien y huele rico!', 'And do you know why the town has this name? Ocote is pine wood. It burns well and smells nice!'],
  ),
  async vendedora() {
    await lines(['¿Te gustan mis ollas? ¡Las hago a mano!', 'Do you like my pots? I make them by hand!']);
    const i = await chooseText('¿Cuál prefieres?', 'Which one do you prefer?', ['La olla grande', 'La jarra pequeña']);
    await lines(
      i === 0
        ? ['¡La olla grande! Perfecta para cocinar gallo pinto para toda la familia.', 'The big pot! Perfect for cooking gallo pinto for the whole family.']
        : ['¡La jarra pequeña! Ideal para tomar agua fresquita.', 'The little jug! Ideal for drinking nice cool water.'],
    );
  },
  chepe: talk(
    ['¡Buenas! Soy Don Chepe. Con mi carreta llevo las ollas del pueblo al mercado.', 'Hello! I’m Don Chepe. With my cart I take the town’s pots to the market.'],
    ['Mis bueyes se llaman Lucero y Canelo. ¡Son muy fuertes y muy tranquilos!', 'My oxen are called Lucero and Canelo. They’re very strong and very calm!'],
  ),
  lucas_ocote: talk(['...', '(Lucas can’t talk either.)']),
  musico: async () => {
    await lines(['La marimba es el instrumento de Nicaragua.', 'The marimba is Nicaragua’s instrument.']);
    if (await ask('¿Te gusta la música?', { en: 'Do you like music?' })) await lines(['¡A mí también! La música alegra el pueblo.', 'Me too! Music makes the town happy.']);
    else await lines(['¿No? ¡Pues escucha esto!', 'No? Well, listen to this!']);
    sfx('levelup');
  },
  futbolista: talk(
    ['¡Cuando sea grande, voy a jugar en la selección!', 'When I grow up, I’m going to play for the national team!'],
    ['¿Sabías que en Nicaragua el deporte más popular es el béisbol? Pero a mí me gusta más el fútbol.', 'Did you know that in Nicaragua the most popular sport is baseball? But I like soccer more.'],
  ),
  cocinera: talk(
    ['¿Ya desayunaste? Aquí comemos gallo pinto con tortilla.', 'Have you had breakfast? Here we eat gallo pinto with tortillas.'],
    ['Las tortillas se hacen con masa de maíz. ¡Y se cocinan en el comal!', 'Tortillas are made with corn dough. And they’re cooked on the comal (griddle)!'],
  ),
  curandera: talk(
    ['¿Te duele algo? Un té de manzanilla lo cura todo.', 'Does anything hurt? Chamomile tea cures everything.'],
    ['Mis plantas curan a la gente... ¡y a las Palabritas también!', 'My plants heal people... and Palabritas too!'],
  ),
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
  curadora: talk(
    ['¡Bienvenid{o/a} al museo! Este museo guarda la historia de la región.', 'Welcome to the museum! This museum keeps the history of the region.'],
    ['¿Sabías que aquí vivían armadillos gigantes? ¡Mira el fósil!', 'Did you know giant armadillos lived here? Look at the fossil!'],
  ),
  async maestro_ocote() {
    await lines(
      ['¡Hola! Soy el profesor Rubén. Hoy practicamos las preguntas: ¿qué?, ¿dónde?, ¿cuándo?', 'Hi! I’m Professor Rubén. Today we’re practicing questions: what?, where?, when?'],
      ['A ver... ¿cómo se pregunta «Where is the mine?»', 'Let’s see... how do you ask "Where is the mine?"'],
    );
    await untilRight(
      '«Where is the mine?»',
      'Choose the right question.',
      '¿Dónde está la mina?',
      ['¿Qué es la mina?', '¿Cuándo es la mina?'],
      ['Casi. «Dónde» es para lugares. ¡Otra vez!', 'Almost. "Dónde" is for places. Again!'],
    );
    await lines(['¡Muy bien! «Dónde» es para preguntar por un lugar.', 'Very good! "Dónde" is for asking about a place.']);
  },
  alumno1: talk(['¿Qué es más difícil: el español o las matemáticas?', 'What’s harder: Spanish or math?']),
  alumna1: talk(['A mí me gusta mucho la clase de música.', 'I really like music class.']),
};

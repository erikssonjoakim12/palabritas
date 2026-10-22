import { fanfare } from '../audio/bgm';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag } from '../game/state';
import { addItem, takeItem, itemCount, money } from '../game/bag';
import { giveMon } from '../game/mon';
import { itemBySpanish, adHocItem } from '../data/content';
import { challenge, chooseText } from '../ui/challenge';
import { wildBattle } from '../battle/battle';
import { SPECIES } from '../data/species';
import { TRAINERS } from '../data/trainers';
import { trainerBattle } from '../battle/battle';
import { info, setSpeaker } from '../ui/textbox';
import { ask } from '../ui/menu';
import { launchFirework } from '../art/fireworks';
import { warp, refreshNpcs, walkNpc, fadeOut, type ScriptFn, type ScriptCtx } from './world';
import type { Line } from './maps';
import { TORCHES } from './maps/region4';
import { lines, trainerFight, blackout, heal, talkMode } from './scripts';
import { lucasStarter } from './region2';
import { teacher } from './school';

/*
  Region 4: the volcanoes and dry forest (plans/phase4-region4.md). Ruta 8 east from Playa Carey, Ciudad Chispa
  (getting ready for its festival), the Volcán Chocoyo, and Ruta 9 home to Pueblo Amanecer.
  The story: the fireworks are stolen when you arrive; you get them back from Don Sigilo in the crater (Lucas
  battles you at the foot of the trail), the festival night follows, then Don Tizón's torch puzzle and
  battle. Side quests: a hammock for Mom (bargaining), the lost parakeet chick, the haunted house's lamp, the
  Torovenado costume, and the legend of the Carreta Nagua.
*/

/** Lines said by someone other than the person you talked to (Don Tizón in a cutscene...). */
async function as(look: string, ...ls: Line[]) {
  setSpeaker(look);
  await lines(...ls);
  setSpeaker();
}

// ---------- The story: the stolen fireworks ----------

/** Walking into Ciudad Chispa the first time: a bang, and two Silenciosos run up the volcano with the fireworks. */
async function fiestaChispa() {
  if (flag('cohetesRobados')) return;
  await lines(['¡Qué alegre está la ciudad! Todos preparan la fiesta.', 'How cheerful the city is! Everyone is getting the festival ready.']);
  sfx('alert');
  await info('¡¡BUM!!', { en: 'BOOM!!' });
  setFlag('robo');
  refreshNpcs();
  await as('tizon', ['¡Ladrones! ¡Se robaron todos los cohetes de la fiesta!', 'Thieves! They stole all the festival’s rockets!']);
  await as('silencioso', ['¡Shhh! ¡Esta noche, nadie va a hacer ruido!', 'Shhh! Tonight, nobody’s going to make noise!']);
  const up = Array(9).fill('up');
  await Promise.all([walkNpc('ladron1', up, { speed: 1.5 }), walkNpc('ladron2', up, { speed: 1.5 })]);
  setFlag('cohetesRobados');
  refreshNpcs();
  await as(
    'tizon',
    ['¡Tú eres {name}! Ayudaste en Villa Ocote y en Playa Carey.', 'You’re {name}! You helped in Villa Ocote and Playa Carey.'],
    ['Por favor, recupera los cohetes. Sin cohetes no hay fiesta... y sin fiesta, ¡no abro el taller!', 'Please, get the rockets back. Without rockets there’s no festival... and without a festival, I won’t open the workshop!'],
    ['Los ladrones subieron al volcán. El camino está al norte de la plaza.', 'The thieves went up the volcano. The trail is north of the square.'],
  );
}

/** Don Tizón's thanks, the first time and whenever you talk to him before the festival. */
async function invitacion() {
  await lines(['Esta noche hay fiesta. ¿Vienes? ¡Hay desfile, música y fuegos artificiales!', 'Tonight there’s a festival. Are you coming? There’s a parade, music and fireworks!']);
  if (await ask('¿Vas a la fiesta?', { en: 'Are you going to the festival?' })) return festival();
  await lines(['Bueno, aquí te espero. ¡Avísame cuando estés list{o/a}!', 'OK, I’ll wait for you here. Let me know when you’re ready!']);
}

/** Elsa, the volcano's park ranger: the lost parakeet chick. */
async function elsa() {
  if (!flag('elsaHablada')) {
    await lines(['Soy Elsa, guardaparque del volcán. ¡Qué valiente eres, subiendo con tanto humo!', 'I’m Elsa, the volcano’s park ranger. You’re so brave, climbing with all this smoke!']);
    setFlag('elsaHablada');
  }
  if (!flag('chocoyitoBusca')) await chocoyitoBusca();
  else if (flag('chocoyitoDone') && !flag('chocoyitoPremio')) {
    await lines(['¡Gracias por salvar al chocoyito! Toma, para que las Palabritas salvajes no te molesten.', 'Thanks for saving the baby parakeet! Here, so wild Palabritas don’t bother you.']);
    setFlag('chocoyitoPremio');
    await gift('repelente', 5, 'cinco Repelentes', 'five Repels');
  }
  await lines(['¡Ten cuidado allá arriba!', 'Be careful up there!']);
}

/**
 * Lucas, rival #3, at the foot of the volcano trail: you come straight from Ciudad Chispa's Palacentro, rested
 * (the user's choice: never right after a row of battles).
 */
async function lucasVolcan() {
  if (flag('lucas3')) return;
  await as(
    'lucas',
    ['¡{name}! ¿Tú también vienes por los Silenciosos?', '{name}! Are you after the Silenciosos too?'],
    ['¡Espera! Antes de subir, ¡una batalla! ¡Esta vez sí te gano!', 'Wait! Before we climb, a battle! This time I’ll beat you for sure!'],
  );
  const starter = lucasStarter();
  const team: [string, number][] = [[SPECIES[starter].evolves?.to ?? starter, 28], ['hojarasco', 25], ['palomon', 25], ['cangrejon', 26]];
  const res = await trainerBattle({ ...TRAINERS.lucas3, team }, { look: 'lucas', outro: ['Otra vez... Bueno. Eres muy buen{o/a}, de verdad.', 'Again... OK. You’re really good, honestly.'] });
  if (res === 'lose') return blackout();
  setFlag('lucas3');
  await as('lucas', ['Ve tú al cráter. Yo bajo a avisar a los guardaparques. ¡Ten cuidado!', 'You go to the crater. I’ll go down and tell the rangers. Be careful!']);
  refreshNpcs();
}

/** Don Sigilo, Equipo Silencio's boss, on the crater's north rim with the stolen fireworks. */
async function sigilo() {
  if (flag('beat:sigilo')) return;
  await lines(
    ['¡Shhh! Así que tú eres {name}. Mis Silenciosos hablan mucho de ti... demasiado.', 'Shhh! So you’re {name}. My Silenciosos talk a lot about you... too much.'],
    ['Escucha: el mundo es un lugar muy ruidoso. Palabras, música, fiestas, cohetes... ¡Ruido, ruido, ruido!', 'Listen: the world is a very noisy place. Words, music, festivals, rockets... Noise, noise, noise!'],
    ['Yo quiero un país en silencio. Y empiezo esta noche, tirando los cohetes al volcán.', 'I want a silent country. And I’m starting tonight, by throwing the rockets into the volcano.'],
  );
  const res = await trainerBattle(TRAINERS.sigilo, { look: 'sigilo', outro: ['Imposible... ¿Cómo puede alguien aprender tantas palabras?', 'Impossible... How can anyone learn so many words?'] });
  if (res === 'lose') return blackout();
  setFlag('beat:sigilo');
  await lines(['Esto no se acaba aquí. Algún día, todo el país va a estar en silencio. ¡Shhh!', 'This isn’t over. Someday, the whole country will be silent. Shhh!']);
  await walkNpc('sigilo', ['left', 'left', 'left', 'left', 'left', 'left'], { speed: 1.5 });
  setFlag('sigiloSeFue');
  sfx('caught');
  await info('¡Recuperaste los cohetes!', { en: 'You got the rockets back!' });
  setFlag('cohetesRecuperados');
  refreshNpcs();
  await fadeOut(24);
  await info('Bajas del volcán con los cohetes...', { en: 'You come down the volcano with the rockets...' });
  await warp('chispa', 27, 13, 'right', false);
  await as('tizon', ['¡Los cohetes! ¡Eres increíble!', 'The rockets! You’re incredible!']);
  setSpeaker('tizon');
  await invitacion();
  setSpeaker();
}

/** The festival night: fireworks, the parade around the fountain, and Don Tizón's rocket. */
async function festival() {
  await fadeOut(24);
  await info('Esa noche...', { en: 'That night...' });
  await warp('chispa_noche', 17, 17, 'up', false);
  await frames(30);
  await info('¡Empieza el desfile!', { en: 'The parade begins!' });
  // The dancers go once around the fountain, all at the same time, each from its own corner.
  const loop: ('up' | 'down' | 'left' | 'right')[] = [...Array(5).fill('right'), ...Array(3).fill('down'), ...Array(5).fill('left'), ...Array(3).fill('up')];
  const from = (i: number) => [...loop.slice(i), ...loop.slice(0, i)];
  await Promise.all([walkNpc('bailarina1', from(0)), walkNpc('bailarin1', from(5)), walkNpc('bailarina2', from(8)), walkNpc('bailarin2', from(13))]);
  if (flag('torovenadoListo') && !flag('venaditoRecibido')) await torovenadoDance();
  if (flag('fiestaDone')) return;
  await as('tizon', ['¡Mira, {name}! ¡Este cohete es para ti!', 'Look, {name}! This rocket is for you!']);
  launchFirework(true);
  sfx('levelup');
  await frames(50);
  await as('tizon', ['Mañana te espero en el taller. ¡Ven list{o/a}!', 'Tomorrow I’ll be waiting at the workshop. Come ready!']);
}

/** Ending the night: the next morning, the workshop opens. */
async function endFestival() {
  if (!(await ask('¿Ya te vas a dormir?', { en: 'Are you going to bed already?' }))) return lines(['¡Disfruta la fiesta!', 'Enjoy the festival!']);
  await fadeOut(24);
  await info('A la mañana siguiente...', { en: 'The next morning...' });
  setFlag('fiestaDone');
  await warp('chispa', 29, 14, 'up', false);
}

// ---------- The gym: Taller de Pólvora ----------

/** A torch: light them in the poem's order (red, blue, green, yellow) to open the door; a wrong one puts all out. */
async function antorcha(c: ScriptCtx) {
  const t = TORCHES.find((x) => `antorcha${x.color}` === c.npc?.def.id);
  if (!t) return;
  if (!(await ask(`¿Enciendes la antorcha ${t.es}?`, { en: `Light the ${t.color === 'Roja' ? 'red' : t.color === 'Azul' ? 'blue' : t.color === 'Verde' ? 'green' : 'yellow'} torch?` }))) return;
  const next = TORCHES.find((x) => !flag(`antorcha:${x.color}`));
  if (next !== t) {
    for (const x of TORCHES) setFlag(`antorcha:${x.color}`, false);
    refreshNpcs();
    sfx('wrong');
    return info('¡Pfff! Todas las antorchas se apagaron.', { en: 'Pfff! All the torches went out.' });
  }
  setFlag(`antorcha:${t.color}`);
  sfx('right');
  refreshNpcs();
  if (TORCHES.every((x) => flag(`antorcha:${x.color}`))) {
    await frames(20);
    sfx('door');
    await info('¡La puerta del taller se abre!', { en: 'The workshop door opens!' });
    setFlag('puertaTallerAbierta');
    refreshNpcs();
  }
}

/** Don Tizón, gym 4: the Medalla Chispa. */
async function tizon() {
  if (flag('medalChispa')) return lines(['¡Qué batalla! Cada vez que veo un cohete, me acuerdo de ti.', 'What a battle! Every time I see a rocket, I think of you.']);
  await lines(
    ['¡{name}! Ayer salvaste la fiesta. Pero hoy... ¡hoy es una batalla de verdad!', '{name}! Yesterday you saved the festival. But today... today is a real battle!'],
    ['Ayer hice mil cohetes. Bueno, ¡novecientos noventa y nueve! Uno lo guardé para esta batalla.', 'Yesterday I made a thousand rockets. Well, nine hundred ninety-nine! I saved one for this battle.'],
  );
  if (!(await ask('¿Estás list{o/a}?', { en: 'Are you ready?' }))) return lines(['¡La mecha está encendida! Te espero.', 'The fuse is lit! I’ll wait for you.']);
  const res = await trainerBattle(TRAINERS.tizon, { look: 'tizon', outro: ['¡Se me apagó la mecha! Fue la mejor batalla de mi vida.', 'My fuse went out! It was the best battle of my life.'] });
  if (res === 'lose') return blackout();
  setFlag('beat:tizon');
  setFlag('medalChispa');
  G.save.medals.push('Chispa');
  fanfare('medalla', 'badge');
  await info('¡{name} recibió la Medalla Chispa!', { en: '{name} received the Spark Medal!' });
  await lines(
    ['¡Cuatro medallas! Eso es la mitad del camino.', 'Four medals! That’s halfway.'],
    ['Al este está tu pueblo, Pueblo Amanecer. ¿Por qué no visitas a tu mamá? ¡Seguro que te extraña!', 'East is your town, Pueblo Amanecer. Why don’t you visit your mom? I’m sure she misses you!'],
  );
  await info('¡Felicidades! Terminaste la cuarta parte de Palabritas.', { en: 'Congratulations! You finished the fourth part of Palabritas.' });
  await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', { en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!' });
}

// ---------- Home ----------

/** The first time you hop down the ledge into Pueblo Amanecer from Ruta 9: Mom is so proud. */
async function vueltaACasa() {
  if (flag('vueltaACasa') || !flag('cohetesRobados')) return;
  setFlag('vueltaACasa');
  await as('fisher', ['¡{name}! ¡Volviste! ¡Viniste por el camino de la meseta!', '{name}! You’re back! You came by the plateau road!']);
  await info('Mamá sale corriendo de la casa...', { en: 'Mom comes running out of the house...' });
  await as(
    'mom',
    [G.save.medals.length >= 4 ? '¡Mi {name}! Cuatro medallas... ¡Estoy tan orgullosa!' : '¡Mi {name}! ¡Qué alegría verte!', G.save.medals.length >= 4 ? 'My {name}! Four medals... I’m so proud!' : 'My {name}! What a joy to see you!'],
    ['Ven, descansa un poco. Tus Palabritas se ven cansadas.', 'Come, rest a little. Your Palabritas look tired.'],
  );
  await heal();
  await info('Tus Palabritas se recuperaron.', { en: 'Your Palabritas recovered.' });
  if (itemCount('hamaca')) await hamacaParaMama();
}

// ---------- Side quests ----------

const shuffled = <T>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);
/** A multiple-choice question: true when the right answer (the first option) is picked. */
async function question(label: string, en: string, right: string, wrong: string[]) {
  const options = shuffled([right, ...wrong]);
  return options[await chooseText(label, en, options)] === right;
}
const gift = async (id: string, n: number, es: string, en: string) => {
  addItem(id, n);
  sfx('caught');
  await info(`¡{name} recibió ${es}!`, { en: `{name} received ${en}!` });
};
/** A real content item when there is one (answering counts toward mastery), else a one-off. */
const item = (es: string, en: string) => itemBySpanish(es) ?? adHocItem([es], en);

// ----- Una hamaca para mamá: bargaining in Spanish, then Mom, then the sloth asleep in it -----

const PRICES = [900, 750, 600, 500];
const GOOD = ['¡Es muy caro!', '¿Me hace un descuento?', '¿Me la deja en quinientos?'];
const RUDE = ['¡Dame la hamaca!', 'No me gustan las hamacas.', '¡Qué hamaca tan fea!'];
const BUY = 'Me la llevo.';
const LEAVE = 'Mejor no, gracias.';

async function hamaquera() {
  if (flag('hamacaComprada')) return lines(['¿Le gustó la hamaca a tu mamá? ¡Son las mejores de Masaya!', 'Did your mom like the hammock? They’re the best in Masaya!']);
  await lines(['¡Hamacas, hamacas! Hechas a mano aquí en Ciudad Chispa. ¿Te gusta esta?', 'Hammocks, hammocks! Handmade here in Ciudad Chispa. Do you like this one?']);
  let step = 0;
  for (let turn = 0; ; turn++) {
    const price = PRICES[step];
    await lines([`Cuesta ${price} córdobas.`, `It costs ${price} córdobas (${price} in the game).`]);
    const options = shuffled([GOOD[turn % GOOD.length], RUDE[turn % RUDE.length], BUY, LEAVE]);
    const said = options[await chooseText('¿Qué le dices?', 'What do you say? (Bargain politely to lower the price.)', options)];
    if (said === LEAVE) return lines(['¡Aquí estoy si cambias de idea!', 'I’m here if you change your mind!']);
    if (RUDE.includes(said)) {
      await lines(['¡Qué maleducad{o/a}! Así no se habla.', 'How rude! That’s no way to talk.']);
      continue;
    }
    if (said === BUY) {
      if (G.save.money < price) return lines(['No tienes suficiente dinero. ¡Vuelve cuando tengas más!', 'You don’t have enough money. Come back when you have more!']);
      G.save.money -= price;
      sfx('caught');
      addItem('hamaca');
      setFlag('hamacaComprada');
      await info(`¡{name} compró la hamaca por ${money(price)}!`, { en: `{name} bought the hammock for ${money(price)}!` });
      return lines(['Es para tu mamá, ¿verdad? ¡Qué lindo!', 'It’s for your mom, right? How sweet!']);
    }
    if (step === PRICES.length - 1) {
      await lines(['¡No, no! Quinientos es mi último precio.', 'No, no! Five hundred is my final price.']);
      continue;
    }
    step++;
    await lines(['Mmm... Bueno, porque eres muy amable.', 'Hmm... OK, because you’re very polite.']);
  }
}

/** Mom gets the hammock (talking to her, or coming home over the plateau). */
export async function hamacaParaMama() {
  setSpeaker('mom');
  await lines(
    ['¿Una hamaca? ¿De Ciudad Chispa? ¡Qué bonita! La voy a colgar en tu cuarto.', 'A hammock? From Ciudad Chispa? How pretty! I’ll hang it in your room.'],
    ['Toma, para tu viaje.', 'Here, for your trip.'],
  );
  setSpeaker();
  takeItem('hamaca');
  setFlag('hamacaEntregada');
  await gift('superpocion', 3, 'tres Superpociones', 'three Super Potions');
}

async function perezositoHamaca() {
  await info('¡La hamaca está roncando! ¿Qué es eso?', { en: 'The hammock is snoring! What’s that?' });
  sfx('alert');
  await lines(['¡Hay un perezoso dormido en la hamaca!', 'There’s a sloth asleep in the hammock!']);
  const res = await wildBattle('perezosito', 22);
  if (res === 'lose') return blackout();
  if (res === 'run') return;
  setFlag('perezosito');
  refreshNpcs();
}

// ----- El chocoyito perdido: directions from the ranger, the lava tube, the nest -----

async function chocoyitoBusca() {
  await lines(
    ['¡Ay! Un chocoyito bebé se cayó del nido. Creo que está dentro del tubo de lava.', 'Oh! A baby parakeet fell out of its nest. I think it’s inside the lava tube.'],
    ['Entras, vas a la izquierda y sigues hacia arriba. Está en un rincón oscuro.', 'You go in, go left and keep going up. It’s in a dark corner.'],
  );
  while (!(await question('¿Dónde está el chocoyito?', 'Where is the baby parakeet?', 'En el tubo de lava, a la izquierda', ['En la laguna', 'En el taller']))) {
    await lines(['No, no. Escucha otra vez: en el tubo de lava, a la izquierda.', 'No, no. Listen again: in the lava tube, on the left.']);
  }
  setFlag('chocoyitoBusca');
  refreshNpcs();
  await lines(['¡Eso! Su nido está en el cráter, del lado este.', 'That’s it! Its nest is in the crater, on the east side.']);
}

async function chocoyitoBebe() {
  await info('¡Pío, pío!', { en: 'Cheep, cheep!' });
  addItem('chocoyitoBebe');
  setFlag('chocoyitoEncontrado');
  sfx('caught');
  refreshNpcs();
  await info('¡{name} encontró al chocoyito bebé!', { en: '{name} found the baby parakeet!' });
}

async function nidoChocoyos() {
  if (!itemCount('chocoyitoBebe')) return lines(['Un nido de chocoyos. ¡Pío, pío!', 'A parakeets’ nest. Cheep, cheep!']);
  if (!(await ask('¿Pones al chocoyito en el nido?', { en: 'Put the baby parakeet in the nest?' }))) return;
  takeItem('chocoyitoBebe');
  setFlag('chocoyitoDone');
  sfx('heal');
  await info('¡Su mamá está feliz!', { en: 'Its mom is happy!' });
}

// ----- La casa embrujada: the lamp whispers its feelings; you repeat them -----

const LAMP = [
  ['Estoy muy triste', 'I’m very sad'],
  ['Me siento solo', 'I feel lonely'],
  ['Tengo miedo de la oscuridad', 'I’m afraid of the dark'],
];

async function duenoEmbrujada() {
  if (flag('lamparaCalmada') && !flag('embrujadaPagada')) {
    await lines(['¡Gracias! Ya puedo dormir en mi casa.', 'Thanks! Now I can sleep in my house.']);
    G.save.money += 500;
    setFlag('embrujadaPagada');
    sfx('caught');
    return info(`¡{name} recibió ${money(500)}!`, { en: `{name} received ${money(500)}!` });
  }
  if (flag('embrujadaPagada')) return lines(['Mi casa está tranquila otra vez. ¡Gracias!', 'My house is quiet again. Thanks!']);
  await lines(
    ['Mi casa vieja está embrujada. De noche se mueven los muebles... ¡y una lámpara llora!', 'My old house is haunted. At night the furniture moves... and a lamp cries!'],
    ['Si la calmas, te pago quinientos.', 'If you calm it, I’ll pay you five hundred.'],
    ['La casa está en la esquina, al sur de la escuela.', 'The house is on the corner, south of the school.'],
  );
  setFlag('embrujadaHablada');
}

async function lampara() {
  await info('La lámpara te habla en voz muy baja...', { en: 'The lamp speaks to you very quietly...' });
  for (const [es, en] of LAMP) {
    while (true) {
      const r = await challenge({ item: item(es, en), mode: 'listen', title: '🏮 La lámpara', label: 'La lámpara susurra. Escribe lo que dice. · The lamp whispers. Write what it says.' });
      if (r.grade !== 'wrong') break;
      await info('La lámpara suspira...', { en: 'The lamp sighs...' });
    }
    await info('La lámpara brilla un poco más...', { en: 'The lamp glows a little brighter...' });
  }
  await info('¡La lámpara ya no está triste! Ahora brilla de color rojo... ¿está enojada? ¡No, quiere jugar!', {
    en: 'The lamp isn’t sad anymore! Now it’s glowing red... is it angry? No, it wants to play!',
  });
  const res = await wildBattle('lamparita', 23);
  if (res === 'lose') return blackout();
  setFlag('lamparaCalmada');
  refreshNpcs();
}

// ----- Los trajes del Torovenado: five people found the costume's pieces; name each one -----

/** A piece of the costume, who holds it, and what they say otherwise. */
interface Piece {
  id: string;
  es: string;
  en: string;
  who: Line;
}
const PIECES: Piece[] = [
  { id: 'sombrero', es: 'el sombrero', en: 'the hat', who: ['Esta semana son las fiestas patronales. ¡Me encanta mi vestido azul!', 'This week is the patron saint festival. I love my blue dress!'] },
  { id: 'capa', es: 'la capa', en: 'the cape', who: ['¡Esta noche hay cohetes! ¡Bum, bum, bum!', 'Tonight there are rockets! Boom, boom, boom!'] },
  { id: 'botas', es: 'las botas', en: 'the boots', who: ['¿Un vigorón? Yuca, chicharrón y ensalada de repollo. ¡Riquísimo!', 'A vigorón? Cassava, pork rinds and cabbage salad. Delicious!'] },
  { id: 'mascara', es: 'la máscara', en: 'the mask', who: ['Bienvenid{o/a} a la iglesia. Las campanas suenan todos los domingos.', 'Welcome to the church. The bells ring every Sunday.'] },
  { id: 'falda', es: 'la falda', en: 'the skirt', who: ['En el mercado siempre pido un descuento. ¡Es parte de la diversión!', 'At the market I always ask for a discount. It’s part of the fun!'] },
];
const piecesFound = () => PIECES.filter((p) => flag(`traje:${p.id}`)).length;

/** Someone holding a piece of the costume: name it in Spanish and they give it to you. */
const holder = (piece: Piece): ScriptFn => async () => {
  if (!flag('torovenado') || flag(`traje:${piece.id}`)) return lines(piece.who);
  await lines(['¡Hola! ¿Qué buscas?', 'Hi! What are you looking for?']);
  const r = await challenge({ item: item(piece.es, piece.en), mode: talkMode(), title: '🎭 El Torovenado', label: '¿Qué pieza del traje buscas? · Which costume piece are you looking for?' });
  if (r.grade === 'wrong') return lines(['Mmm, no tengo eso.', 'Hmm, I don’t have that.']);
  setFlag(`traje:${piece.id}`);
  addItem('traje');
  sfx('caught');
  await lines(['¡Aquí está! Para el Torovenado.', 'Here it is! For the Torovenado.']);
  if (piecesFound() === PIECES.length) await info('¡Tienes las cinco piezas! Llévaselas al vendedor de máscaras.', { en: 'You have all five pieces! Take them to the mask seller.' });
};

async function mascarero() {
  if (!flag('cohetesRecuperados')) return lines(['Máscaras de toro, de venado, de diablito... ¡Para el desfile del Torovenado!', 'Bull masks, deer masks, little devil masks... For the Torovenado parade!']);
  if (!flag('torovenado')) {
    await lines(
      ['¡Ay, el traje del Torovenado se perdió en el robo! La gente del pueblo encontró las piezas...', 'Oh, the Torovenado costume got lost in the theft! The townspeople found the pieces...'],
      ['La señora del vestido azul tiene el sombrero. El niño de la plaza tiene la capa.', 'The lady in the blue dress has the hat. The boy in the square has the cape.'],
      ['La señora de la fritanga tiene las botas. El sacristán de la iglesia tiene la máscara.', 'The fritanga lady has the boots. The church sexton has the mask.'],
      ['La niña de la escuela tiene la falda.', 'The girl at the school has the skirt.'],
    );
    return setFlag('torovenado');
  }
  if (piecesFound() < PIECES.length) return lines([`Tienes ${piecesFound()} de 5 piezas. ¡Sigue buscando!`, `You have ${piecesFound()} of 5 pieces. Keep looking!`]);
  if (!flag('torovenadoListo')) {
    setFlag('torovenadoListo');
    await lines(['¡El traje está completo! Esta noche, ¡tú vas a bailar en el desfile!', 'The costume is complete! Tonight, you’re going to dance in the parade!']);
  }
  if (flag('venaditoRecibido')) return lines(['¡Bailaste muy bien en el desfile!', 'You danced really well in the parade!']);
  if (!flag('fiestaDone')) return lines(['¡Te veo en el desfile!', 'See you at the parade!']);
  if (await ask('¡Esta noche hay otro desfile! ¿Vamos?', { en: 'There’s another parade tonight! Shall we go?' })) await festival();
}

/** At the festival, with the costume: you dance, and the mask seller's fawn comes with you. */
async function torovenadoDance() {
  await info('¡{name} baila en el desfile con el traje del Torovenado!', { en: '{name} dances in the parade in the Torovenado costume!' });
  sfx('levelup');
  await as('man', ['¡Qué bien bailaste! Este venadito no se quiere separar de ti. ¡Llévatelo!', 'You danced so well! This little fawn doesn’t want to leave you. Take it with you!']);
  const where = giveMon('venadito', 20);
  setFlag('venaditoRecibido');
  sfx('caught');
  await info('¡{name} recibió a Venadito!', { en: '{name} received Venadito!' });
  if (where === 'box') await info('Tu equipo está lleno: Venadito fue a la Caja de Palabritas.', { en: 'Your team is full: Venadito went to the storage box.' });
}

// ----- La leyenda de la Carreta Nagua: a story in the past tense, then three questions -----

async function abueloLeyenda() {
  if (flag('leyenda')) return lines(['De noche, si oyes una carreta... ¡no salgas a la calle!', 'At night, if you hear a cart... don’t go out into the street!']);
  if (!(await ask('¿Quieres oír una leyenda? Es un poco de miedo...', { en: 'Want to hear a legend? It’s a little scary...' }))) return lines(['Otro día, entonces.', 'Another day, then.']);
  await lines(
    ['Hace muchos años, en las noches oscuras, la gente oía un ruido en la calle.', 'Many years ago, on dark nights, people heard a noise in the street.'],
    ['Era una carreta vieja, tirada por dos bueyes flacos.', 'It was an old cart, pulled by two thin oxen.'],
    ['La manejaba la Muerte, y nadie se atrevía a mirarla.', 'Death drove it, and nobody dared to look at it.'],
    ['Por eso, cuando oyes una carreta de noche, ¡no salgas a la calle!', 'That’s why, when you hear a cart at night, don’t go out into the street!'],
  );
  const right =
    (await question('¿Qué oía la gente?', 'What did people hear?', 'Un ruido en la calle', ['Una canción', 'Un perro'])) &&
    (await question('¿Qué tiraba la carreta?', 'What pulled the cart?', 'Dos bueyes flacos', ['Un caballo', 'Nada'])) &&
    (await question('¿Qué no debes hacer?', 'What mustn’t you do?', 'Salir a la calle', ['Dormir', 'Comer']));
  if (!right) return lines(['Mmm... ¿estabas escuchando? Vuelve y te la cuento otra vez.', 'Hmm... were you listening? Come back and I’ll tell it again.']);
  await lines(['¡Pusiste mucha atención! Toma esta campanita. Dicen que espanta a los fantasmas.', 'You paid close attention! Take this little bell. They say it scares ghosts away.']);
  setFlag('leyenda');
  await gift('campanita', 1, 'una Campanita', 'a Little bell');
}

const talk = (...ls: Line[]): ScriptFn => () => lines(...ls);
const fight = (id: string, intro: Line, defeated: Line, after: Line): ScriptFn => () => trainerFight(id, { intro, defeated, after });

export const REGION4: Record<string, ScriptFn> = {
  // ---------- The story ----------
  fiestaChispa,
  tizon_plaza: talk(['Por favor, {name}, recupera los cohetes. ¡Están en el volcán!', 'Please, {name}, get the rockets back. They’re on the volcano!']),
  ladron: talk(['¡Shhh!', 'Shhh!']),
  tizon_taller: invitacion,
  elsa,
  lucasVolcan,
  sigilo,
  cohetes: talk(['Son las cajas de cohetes de Ciudad Chispa. ¡Están llenas!', 'They’re Ciudad Chispa’s crates of rockets. They’re full!']),
  tizon_fiesta: talk(['¡Qué fiesta tan bonita! Y todo gracias a ti, {name}.', 'What a beautiful festival! And all thanks to you, {name}.']),
  aprendiz_fiesta: endFestival,
  bailarin: talk(['¡A bailar! ¡Que viva la fiesta!', 'Let’s dance! Long live the festival!']),
  antorcha,
  antorchaEncendida: talk(['La antorcha está encendida.', 'The torch is lit.']),
  puertaTaller: talk(['Una puerta muy pesada. Al lado hay un poema escrito en la pared.', 'A very heavy door. Next to it, a poem is written on the wall.']),
  tizon,
  guia_chispa: talk(
    ['¡Ojo! Para abrir la puerta, enciende las antorchas en el orden del poema.', 'Watch out! To open the door, light the torches in the poem’s order.'],
    ['Don Tizón usa Palabritas de tipo Fuego. ¡El agua es tu mejor amiga!', 'Don Tizón uses Fire types. Water is your best friend!'],
  ),
  vueltaACasa,

  // ---------- Side quests ----------
  hamaquera,
  perezositoHamaca,
  chocoyitoBebe,
  nidoChocoyos,
  dueno_embrujada: duenoEmbrujada,
  lampara,
  mascarero,
  senora_azul: holder(PIECES[0]),
  nino_plaza: holder(PIECES[1]),
  fritanguera: holder(PIECES[2]),
  sacristan: holder(PIECES[3]),
  nina_escuela_chispa: holder(PIECES[4]),
  abuelo_leyenda: abueloLeyenda,

  // ---------- Trainers ----------
  cortadora_marta: fight(
    'cortadora_marta',
    ['Aquí en la caña se esconden las mejores Palabritas. ¡Y yo!', 'The best Palabritas hide here in the cane. And so do I!'],
    ['¡Me cortaste el paso!', 'You cut me off!'],
    ['Si vienes a entrenar, aquí hay Palabritas todo el día.', 'If you come to train, there are Palabritas here all day.'],
  ),
  cortador_wilmer: fight(
    'cortador_wilmer',
    ['¡Ey! Estaba descansando a la sombra. ¿Una batalla rápida?', 'Hey! I was resting in the shade. A quick battle?'],
    ['¡Bueno, vuelvo a mi siesta!', 'Well, back to my nap!'],
    ['La caña se corta en la época seca, de enero a abril.', 'The cane is cut in the dry season, from January to April.'],
  ),
  excursionista_noel: fight(
    'excursionista_noel',
    ['Subí por este lado para ver el lago desde arriba. ¿Luchamos?', 'I came up this side to see the lake from above. Shall we battle?'],
    ['¡Qué vista y qué batalla!', 'What a view, and what a battle!'],
    ['Desde aquí se ven el lago y las islas. ¡Vale la pena subir!', 'From here you can see the lake and the islands. It’s worth the climb!'],
  ),
  vulcanologa_sara: fight(
    'vulcanologa_sara',
    ['Mido la temperatura del volcán todos los días. ¡Hoy está caliente, como yo!', 'I measure the volcano’s temperature every day. Today it’s hot, like me!'],
    ['¡Me bajó la temperatura!', 'My temperature dropped!'],
    ['Si el humo cambia de color, hay que avisar a todo el pueblo.', 'If the smoke changes color, the whole town has to be warned.'],
  ),
  fotografo_max: fight(
    'fotografo_max',
    ['¡Sonríe! Bueno, primero una batalla, después la foto.', 'Smile! Well, a battle first, then the photo.'],
    ['¡Salí movido en la foto!', 'I came out blurry in the photo!'],
    ['Las mejores fotos del volcán son al amanecer.', 'The best photos of the volcano are at sunrise.'],
  ),
  polvorera: fight('polvorera', ['Hago cohetes de todos los colores. ¿Cuál te gusta más?', 'I make rockets in every color. Which one do you like best?'], ['¡Me salió un cohete apagado!', 'My rocket fizzled out!'], ['El rojo es el más difícil de hacer.', 'Red is the hardest to make.']),
  malabarista: fight('malabarista', ['¡Hago malabares con fuego! ¿Ves? ¡Ups!', 'I juggle with fire! See? Oops!'], ['¡Se me cayeron todas las antorchas!', 'I dropped all my torches!'], ['Para ganar, como en los malabares: práctica, práctica, práctica.', 'To win, it’s like juggling: practice, practice, practice.']),
  fritanguero: fight('fritanguero', ['¿Hambre? ¡Primero la batalla, después el vigorón!', 'Hungry? First the battle, then the vigorón!'], ['¡Se me quemó la tortilla!', 'My tortilla burned!'], ['Don Tizón come vigorón todos los días. ¡Por eso tiene tanta energía!', 'Don Tizón eats vigorón every day. That’s why he has so much energy!']),
  campesino: fight('campesino', ['Siembro maíz y frijoles. ¡Y entreno Palabritas en el descanso!', 'I grow corn and beans. And I train Palabritas on my break!'], ['¡Se me secó la cosecha!', 'My harvest dried up!'], ['En la época seca no llueve nada. Por eso cuidamos el agua.', 'In the dry season it doesn’t rain at all. That’s why we take care of the water.']),
  vaquera_r8: fight('vaquera_r8', ['¡Hola, vaquer{o/a}! ¿Lista la reata? ¡A luchar!', 'Hi, cowpoke! Lasso ready? Let’s battle!'], ['¡Me ganaste en buena ley!', 'You beat me fair and square!'], ['El rancho de Pancho tiene las mejores vacas del país.', 'Pancho’s ranch has the best cows in the country.']),
  pescadora_r8: fight('pescadora_r8', ['En esta laguna hay peces enormes. ¿Y entrenadores fuertes?', 'There are huge fish in this lagoon. And strong trainers?'], ['¡Me pescaste a mí!', 'You caught me!'], ['Algún día vas a poder nadar con tus Palabritas por aquí.', 'Someday you’ll be able to swim with your Palabritas around here.']),
  turista_r8: fight('turista_r8', ['Hi! Perdón... ¡Hola! Vengo a ver el volcán. ¿Luchamos?', 'Hi! Sorry... Hi! I came to see the volcano. Shall we battle?'], ['¡Wow! ¡Hablas muy bien!', 'Wow! You speak very well!'], ['Dicen que en el cráter viven unos pericos verdes. ¡Qué raro!', 'They say green parakeets live in the crater. How strange!']),
  cortador: fight('cortador', ['¡Cortamos caña desde las cinco de la mañana! ¿Quieres probar?', 'We’ve been cutting cane since five in the morning! Want to try?'], ['¡Ay, qué cansancio!', 'Oh, I’m so tired!'], ['Con la caña se hace azúcar y... ¡ron! Pero eso es para adultos.', 'Cane makes sugar and... rum! But that’s for grown-ups.']),
  cortadora: fight('cortadora', ['¡Cuidado, la caña es alta y te puedes perder!', 'Careful, the cane is tall and you can get lost!'], ['¡Me perdí yo!', 'I got lost myself!'], ['Aquí hay muchísimas Palabritas. ¡Es el mejor lugar para entrenar!', 'There are tons of Palabritas here. It’s the best place to train!']),
  granjero: fight('granjero', ['¡Ey! Estas son mis vacas. ¡Y esta es mi batalla!', 'Hey! These are my cows. And this is my battle!'], ['¡Muuu! Digo... ¡qué fuerte eres!', 'Moo! I mean... you’re so strong!'], ['Ciudad Chispa está aquí al lado. ¡Esta semana hay fiesta!', 'Ciudad Chispa is right next door. There’s a festival this week!']),
  ciclista: fight('ciclista', ['¡Pedaleo cien kilómetros al día! ¿Y tú?', 'I cycle a hundred kilometers a day! And you?'], ['¡Se me pinchó la llanta!', 'I got a flat tire!'], ['Desde aquí se ve el humo del volcán. ¡Siempre sale humo!', 'You can see the volcano’s smoke from here. There’s always smoke!']),
  guardaparque1: fight('guardaparque1', ['Este es un parque nacional. ¡Tienes que pasar mi prueba!', 'This is a national park. You have to pass my test!'], ['Bueno, puedes subir.', 'Well, you can go up.'], ['No te acerques mucho al humo. ¡Es tóxico!', 'Don’t get too close to the smoke. It’s toxic!']),
  vulcanologa1: fight('vulcanologa1', ['Estudio el volcán. ¡Y a los entrenadores que suben!', 'I study the volcano. And the trainers who climb it!'], ['¡Hiciste erupción!', 'You erupted!'], ['El volcán está activo, pero tranquilo. ¡Por ahora!', 'The volcano is active, but calm. For now!']),
  guardaparque2: fight('guardaparque2', ['Arriba están los Silenciosos. ¡Primero, demuéstrame que puedes con ellos!', 'The Silenciosos are up there. First, show me you can handle them!'], ['¡Sí, puedes!', 'Yes, you can!'], ['La cueva de lava es muy oscura. ¡No te pierdas!', 'The lava cave is very dark. Don’t get lost!']),
  vulcanologo2: fight('vulcanologo2', ['¿Sabías que esta cueva la hizo la lava hace mil años?', 'Did you know lava made this cave a thousand years ago?'], ['¡Qué calor... de batalla!', 'What a hot... battle!'], ['La salida al cráter está más adelante, a la derecha.', 'The way out to the crater is further ahead, on the right.']),
  silencioso5: fight('silencioso5', ['¡Shhh! Los cohetes hacen demasiado ruido. ¡Los vamos a tirar al volcán!', 'Shhh! Rockets make too much noise. We’re going to throw them into the volcano!'], ['¡Shhh! Perdí.', 'Shhh! I lost.'], ['Don Sigilo está arriba. ¡No va a perder!', 'Don Sigilo is up there. He won’t lose!']),
  silencioso6: fight('silencioso6', ['¡No pasas! Esta noche no va a haber fiesta.', 'You won’t pass! There won’t be a party tonight.'], ['¡Ay, qué ruido hago al perder!', 'Oh, what a noise I make when I lose!'], ['Las fiestas... son muy ruidosas. ¡Shhh!', 'Parties... are so noisy. Shhh!']),
  silencioso7: fight('silencioso7', ['¡Tú otra vez, {name}! Primero la mina, después las tortugas...', 'You again, {name}! First the mine, then the turtles...'], ['¡Siempre tú!', 'Always you!'], ['Don Sigilo te está esperando.', 'Don Sigilo is waiting for you.']),
  campesina_r9: fight('campesina_r9', ['¿Vas a Pueblo Amanecer? ¡Qué lindo pueblo! Pero primero...', 'Going to Pueblo Amanecer? What a lovely town! But first...'], ['¡Saludos a tu mamá!', 'Say hi to your mom!'], ['Al final del camino hay un barranco. ¡Puedes saltar!', 'At the end of the road there’s a drop. You can jump!']),
  ciclista_r9: fight('ciclista_r9', ['¡Vuelvo a casa en bici! ¿Una carrera? Bueno, una batalla.', 'I’m cycling home! A race? Well, a battle.'], ['¡Perdí la carrera!', 'I lost the race!'], ['Con la medalla del volcán, ya tienes cuatro. ¡Qué bárbaro!', 'With the volcano’s medal you have four already. Amazing!']),
  excursionista_r9: fight('excursionista_r9', ['Camino desde Ciudad Chispa hasta el lago. ¿Luchamos en el camino?', 'I walk from Ciudad Chispa to the lake. Shall we battle on the way?'], ['¡Uf! Me sentaré un rato.', 'Phew! I’ll sit down a while.'], ['Este camino es antiguo. Mi abuelo dice que de noche pasa la Carreta Nagua...', 'This road is old. My grandfather says the Carreta Nagua passes by at night...']),

  // ---------- People ----------
  vaca: talk(['¡Muuu!', 'Moo!']),
  hija_tizon: talk(['Mi papá hace los mejores cohetes de Nicaragua. ¡Cuando explotan parecen flores!', 'My dad makes the best rockets in Nicaragua. When they burst they look like flowers!']),
  maestro_chispa: teacher(['compras', 'pasado']),
  alumno_chispa: talk(['Ayer fui al volcán con mi papá. ¡Vimos mucho humo!', 'Yesterday I went to the volcano with my dad. We saw lots of smoke!']),
};

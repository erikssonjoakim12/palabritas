import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag } from '../game/state';
import { shuffled } from '../game/random';
import { addItem, takeItem, itemCount, money } from '../game/bag';
import { wordItem } from '../data/content';
import { chooseText } from '../ui/challenge';
import { trainerBattle, wildBattle } from '../battle/battle';
import { TRAINERS } from '../data/trainers';
import { info, setSpeaker } from '../ui/textbox';
import { ask } from '../ui/menu';
import { launchFirework } from '../art/fireworks';
import { refreshNpcs, walkNpc, warp, type ScriptFn, type ScriptCtx } from './world';
import type { Line } from './maps';
import { TORCHES } from './maps/region4';
import { lines, as, talk, cutTo, talkMode, heal, blackout, fight, rivalBattle, gymLeader, gift, pay, receiveMon, practice, practiceUntilRight, question, untilRight } from './flows';
import { teacher } from './school';

/*
  Region 4: the volcanoes and dry forest. Ruta 7 east from Playa Carey, Ciudad Chispa
  (getting ready for its festival), the Volcán Chocoyo, and Ruta 8 home to Pueblo Amanecer.
  The story: the fireworks are stolen when you arrive; you get them back from Don Sigilo in the crater (Lucas
  battles you at the foot of the trail), the festival night follows, then Don Tizón's torch puzzle and
  battle. Side quests: a hammock for Mom (bargaining), the lost parakeet chick, the haunted house's lamp, the
  Torovenado costume, and the legend of the Carreta Nagua.
*/

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
  const won = await rivalBattle('lucas3', ['Otra vez... Bueno. Eres muy buen{o/a}, de verdad.', 'Again... OK. You’re really good, honestly.'], ['¡Por fin te gané! Ahora ve tú al cráter... ¡y ten cuidado!', 'I finally beat you! Now you go to the crater... and be careful!']);
  refreshNpcs();
  if (!won) return blackout();
  await as('lucas', ['Ve tú al cráter. Yo bajo a avisar a los guardaparques. ¡Ten cuidado!', 'You go to the crater. I’ll go down and tell the rangers. Be careful!']);
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
  await cutTo(['Bajas del volcán con los cohetes...', 'You come down the volcano with the rockets...'], 'chispa', 27, 13, 'right');
  await as('tizon', ['¡Los cohetes! ¡Eres increíble!', 'The rockets! You’re incredible!']);
  setSpeaker('tizon');
  await invitacion();
  setSpeaker();
}

// ---------- Region 5: the Templo del Jaguar (plans/region5-jungle.md) ----------

/** Villa Jaguar's people: the silent jungle until the jaguar is saved, then her and her cub. */
const untilJaguar = (before: Line[], after: Line[]): ScriptFn => () => lines(...(flag('jaguarPiedra') ? after : before));

/** Gallo pinto in the kitchen: Chepe's mom feeds you (and your Palabritas). */
async function mamaChepe() {
  await lines(
    ['Hoy cociné gallo pinto, como todos los días. ¡Siéntate a comer!', 'Today I cooked gallo pinto, like every day. Sit down and eat!'],
    ['Mi hijo Chepe trabaja con Ortiga, en el jardín. Dice que las ortigas pican mucho.', 'My son Chepe works with Ortiga, in the garden. He says the nettles sting a lot.'],
  );
  await heal();
  await info('{name} comió gallo pinto. ¡Tus Palabritas también comieron y se recuperaron!', { en: '{name} ate gallo pinto. Your Palabritas ate too and recovered!' });
}

/** Federico at the temple's clearing: the legend, Equipo Silencio, the cub. */
function federicoTemplo() {
  if (flag('rugiditoRecibido'))
    return lines(
      ['La leyenda dice: «Cuando su hijo ruja, la selva despertará». ¡Cuida mucho a Rugidito!', 'The legend says: "When her child roars, the jungle will wake." Take good care of Rugidito!'],
      ['Cuando aprenda a rugir, vuelve al altar. Quiero ver qué pasa...', 'When it learns to roar, come back to the altar. I want to see what happens...'],
    );
  return lines(
    ['¡{name}! Soy Federico, ¿te acuerdas? Nos vimos en la Cueva del Eco.', '{name}! I’m Federico, remember? We met in the Echo Cave.'],
    ['Las paredes de este templo cuentan una leyenda: hace mil años, una jaguar negra cuidó la selva.', 'This temple’s walls tell a legend: a thousand years ago, a black jaguar looked after the jungle.'],
    ['Cada mañana rugió, y la selva despertó. Dicen que todavía vive arriba, en el altar.', 'Every morning she roared, and the jungle woke up. They say she still lives up there, at the altar.'],
    ['Pero hace unos días entró Equipo Silencio con una máquina. Desde entonces, la selva está callada.', 'But a few days ago Equipo Silencio went in with a machine. Since then, the jungle has been quiet.'],
    ['Y este cachorro llora aquí, solo. Creo que es el hijo de la jaguar...', 'And this cub cries here, all alone. I think it’s the jaguar’s child...'],
  );
}

/** The cub by the temple's doorway, before you raise it: it tries to roar. */
async function cachorroJaguar() {
  await info('(Un cachorro de jaguar negro. Abre la boca para rugir...)', { en: '(A black jaguar cub. It opens its mouth to roar...)' });
  await info('«¡Miau!»', { en: '"Mew!"' });
  await info('(Solo le sale un maullido. Mira hacia el templo, muy triste.)', { en: '(Only a mew comes out. It looks at the temple, very sad.)' });
}

/**
 * The top of the temple. Comandante Mutis and her new Silenciador have taken the jaguar's voice. You beat Mutis;
 * the machine sparks and the confused jaguar leaps at you (a guardian battle: no catching, no running). Calm again
 * but voiceless, she lies down and turns to stone, as in the legend. Her cub comes up the stairs and goes with you.
 */
async function altarJaguar() {
  if (flag('jaguarPiedra')) return;
  if (!flag('beat:mutis')) {
    await as('mutis',
      ['¡Shhh! Llegas tarde, {name}. Soy la Comandante Mutis, de Equipo Silencio.', 'Shhh! You’re too late, {name}. I’m Commander Mutis, of Equipo Silencio.'],
      ['¿Ves esta máquina? Es un Silenciador nuevo. Ya le quitó la voz a la jaguar.', 'See this machine? It’s a new Silenciador. It has already taken the jaguar’s voice.'],
      ['Sin su rugido, la selva no despierta. ¡Pronto, todo el país va a dormir en silencio!', 'Without her roar, the jungle doesn’t wake. Soon the whole country will sleep in silence!'],
    );
    const res = await trainerBattle(TRAINERS.mutis, { look: 'mutis', outro: ['¡Shhh! ¿Cómo es posible?', 'Shhh! How is that possible?'] });
    if (res === 'lose') return blackout();
    setFlag('beat:mutis');
    await as('mutis', ['No importa. La jaguar ya no tiene voz... y ahora está furiosa. ¡Suerte, {name}!', 'It doesn’t matter. The jaguar has no voice anymore... and now she’s furious. Good luck, {name}!']);
    sfx('door');
    setFlag('mutisSeFue');
    refreshNpcs();
    await info('(Mutis baja corriendo por la escalera.)', { en: '(Mutis runs off down the stairs.)' });
  }
  sfx('alert');
  await info('¡El Silenciador hace un ruido horrible y echa chispas!', { en: 'The Silenciador makes a horrible noise and throws sparks!' });
  await info('¡La jaguar salta del altar! Está muy confundida.', { en: 'The jaguar leaps from the altar! She’s very confused.' });
  if ((await wildBattle('rugidon', 40, { guardian: true })) === 'lose') return blackout();
  await info('El Silenciador se rompe en mil pedazos.', { en: 'The Silenciador breaks into a thousand pieces.' });
  await info('La jaguar se calma. Abre la boca para rugir... pero no sale nada.', { en: 'The jaguar calms down. She opens her mouth to roar... but nothing comes out.' });
  await info('Se acuesta junto al altar, muy cansada. Poco a poco... se vuelve de piedra, como en la leyenda.', { en: 'She lies down by the altar, very tired. Little by little... she turns to stone, as in the legend.' });
  setFlag('jaguarPiedra');
  refreshNpcs();
  await frames(40);
  await info('Se oyen pasitos en la escalera...', { en: 'Little footsteps on the stairs...' });
  await info('¡Es el cachorro! Se acurruca junto a la estatua de su mamá.', { en: 'It’s the cub! It curls up next to its mother’s statue.' });
  await info('«¡Miau!»', { en: '"Mew!"' });
  await info('Después te mira a ti. Parece que quiere ir contigo.', { en: 'Then it looks at you. It seems to want to come with you.' });
  setFlag('rugiditoRecibido');
  await receiveMon('rugidito', 25);
  await info('En el altar hay palabras talladas: «Cuando su hijo ruja, la selva despertará».', { en: 'Words are carved on the altar: "When her child roars, the jungle will wake."' });
}

/** The mother's statue on the altar. One day, her grown child's roar may wake her (plans/region5-jungle.md). */
const estatuaJaguar = talk(['(La estatua de la jaguar negra. Parece que espera algo.)', '(The black jaguar’s statue. It seems to be waiting for something.)']);

/** The festival night: fireworks, the parade around the fountain, and Don Tizón's rocket. */
async function festival() {
  await cutTo(['Esa noche...', 'That night...'], 'chispa_noche', 17, 17, 'up');
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
  setFlag('fiestaDone');
  await cutTo(['A la mañana siguiente...', 'The next morning...'], 'chispa', 29, 14, 'up');
}

// ---------- The gym: Taller de Pólvora ----------

/** A torch: light them in the poem's order (red, blue, green, yellow) to open the door; a wrong one puts all out. */
async function antorcha(c: ScriptCtx) {
  const t = TORCHES.find((x) => `antorcha${x.color}` === c.npc?.def.id);
  if (!t) return;
  if (!(await ask(`¿Enciendes la antorcha ${t.es}?`, { en: `Light the ${t.en} torch?` }))) return;
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

/** Don Tizón, gym 4: the Medalla Chispa, and the end of this part of the game. */
async function tizon() {
  const won = await gymLeader('tizon', {
    medal: ['Chispa', 'Spark'],
    intro: [
      ['¡{name}! Ayer salvaste la fiesta. Pero hoy... ¡hoy es una batalla de verdad!', '{name}! Yesterday you saved the festival. But today... today is a real battle!'],
      ['Ayer hice mil cohetes. Bueno, ¡novecientos noventa y nueve! Uno lo guardé para esta batalla.', 'Yesterday I made a thousand rockets. Well, nine hundred ninety-nine! I saved one for this battle.'],
    ],
    ready: ['¿Estás list{o/a}?', 'Are you ready?'],
    notReady: ['¡La mecha está encendida! Te espero.', 'The fuse is lit! I’ll wait for you.'],
    outro: ['¡Se me apagó la mecha! Fue la mejor batalla de mi vida.', 'My fuse went out! It was the best battle of my life.'],
    after: [
      ['¡Cuatro medallas! Eso es la mitad del camino.', 'Four medals! That’s halfway.'],
      ['Al este está tu pueblo, Pueblo Amanecer. ¿Por qué no visitas a tu mamá? ¡Seguro que te extraña!', 'East is your town, Pueblo Amanecer. Why don’t you visit your mom? I’m sure she misses you!'],
    ],
    beaten: [['¡Qué batalla! Cada vez que veo un cohete, me acuerdo de ti.', 'What a battle! Every time I see a rocket, I think of you.']],
  });
  if (!won) return;
  // Surf opens with the 4th medal (plans/surf-fly.md).
  await as('tizon', ['Con cuatro medallas, las Palabritas grandes del agua ya te pueden llevar. ¡Prueba en el río o en el lago!', 'With four medals, big water Palabritas can carry you now. Try the river or the lake!']);
  await info('¡Felicidades! Terminaste la cuarta parte de Palabritas.', { en: 'Congratulations! You finished the fourth part of Palabritas.' });
  await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', { en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!' });
}

// ---------- Gym 5: Jardín de Ortiga (plans/gym5.md) ----------

/** A nettle hidden in the grass: off the diary's way. It stings, and you run back to the door. */
async function ortigas() {
  sfx('hit');
  await info('¡Ay! Había ortigas escondidas en el pasto. ¡Pican mucho!', { en: 'Ouch! There were nettles hidden in the grass. They really sting!' });
  setFlag('ortigaPicada');
  await info('{name} vuelve corriendo a la entrada.', { en: '{name} runs back to the entrance.' });
  await warp('gym_jaguar', 6, 15, 'up', false);
}

/** Ortiga, gym 5: the Medalla Espina, and Cut. */
async function ortiga() {
  const won = await gymLeader('ortiga', {
    medal: ['Espina', 'Thorn'],
    intro: [
      ...(flag('ortigaPicada') ? [['¡Te picaron mis ortigas! No te preocupes: a mí también me picaron cuando era niña.', 'My nettles stung you! Don’t worry: they stung me too when I was a girl.'] as Line] : []),
      ['Me llamo Ortiga. Como la planta: soy suave... ¡pero si me tocas, pico!', 'My name is Ortiga. Like the plant: I’m soft... but if you touch me, I sting!'],
      ['Ayer, en el templo, te vi subir. Federico me contó lo demás: Mutis, la máquina, la jaguar... Gracias, {name}.', 'Yesterday, at the temple, I saw you go up. Federico told me the rest: Mutis, the machine, the jaguar... Thank you, {name}.'],
    ],
    ready: ['¿Estás list{o/a}?', 'Are you ready?'],
    notReady: ['Las plantas tienen paciencia. Yo también.', 'Plants are patient. So am I.'],
    outro: ['¡Me ganaste! Fue como una tormenta en la selva.', 'You beat me! It was like a storm in the jungle.'],
    after: [
      ['Con esta medalla, tus Palabritas pueden cortar arbolitos delgados. Hojarasco, Hormigón, Perezosito... ¡ellos saben cortar!', 'With this medal, your Palabritas can cut thin little trees. Hojarasco, Hormigón, Perezosito... they know how to cut!'],
      ['Al norte de la Ruta 4 hay un arbolito así. Detrás empieza un camino nuevo.', 'North of Route 4 there’s a little tree like that. Behind it a new path begins.'],
      ['Y para volver a casa: cerca del templo hay otro, en el camino a la Ruta 4.', 'And to get back home: near the temple there’s another one, on the path to Route 4.'],
    ],
    beaten: [['Ayer una ortiga me picó... ¡otra vez! Nunca aprendo.', 'Yesterday a nettle stung me... again! I never learn.']],
  });
  if (!won) return;
  await info('¡Felicidades! Terminaste la quinta parte de Palabritas.', { en: 'Congratulations! You finished the fifth part of Palabritas.' });
  await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', { en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!' });
}

// ---------- Home ----------

/** The first time you hop down the ledge into Pueblo Amanecer from Ruta 8: Mom is so proud. */
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
    await lines([`Cuesta ${price} córdobas.`, `It costs ${price} córdobas.`]);
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
  await as(
    'mom',
    ['¿Una hamaca? ¿De Ciudad Chispa? ¡Qué bonita! La voy a colgar en tu cuarto.', 'A hammock? From Ciudad Chispa? How pretty! I’ll hang it in your room.'],
    ['Toma, para tu viaje.', 'Here, for your trip.'],
  );
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
  await untilRight('¿Dónde está el chocoyito?', 'Where is the baby parakeet?', 'En el tubo de lava, a la izquierda', ['En la laguna', 'En el taller'], [
    'No, no. Escucha otra vez: en el tubo de lava, a la izquierda.',
    'No, no. Listen again: in the lava tube, on the left.',
  ]);
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
    setFlag('embrujadaPagada');
    return pay(500);
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
    await practiceUntilRight({ item: wordItem(es, en), mode: 'listen', title: '🏮 La lámpara', label: 'La lámpara susurra. Escribe lo que dice. · The lamp whispers. Write what it says.' }, () =>
      info('La lámpara suspira...', { en: 'The lamp sighs...' }),
    );
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
  const r = await practice({ item: wordItem(piece.es, piece.en), mode: talkMode(), title: '🎭 El Torovenado', label: '¿Qué pieza del traje buscas? · Which costume piece are you looking for?' });
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
  setFlag('venaditoRecibido');
  await receiveMon('venadito', 20);
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

export const REGION4: Record<string, ScriptFn> = {
  // ---------- The story ----------
  fiestaChispa,
  tizon_plaza: talk(['Por favor, {name}, recupera los cohetes. ¡Están en el volcán!', 'Please, {name}, get the rockets back. They’re on the volcano!']),
  ladron: talk(['¡Shhh!', 'Shhh!']),
  tizon_taller: invitacion,
  elsa,
  lucasVolcan,
  sigilo,
  federicoTemplo,
  cachorroJaguar,
  altarJaguar,
  estatuaJaguar,
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
  ortigas,
  ortiga,
  guia_jaguar: () =>
    flag('jaguarPiedra')
      ? lines(
          ['¡Hola! Cuidado: aquí hay ortigas escondidas en el pasto. Lee el diario de Ortiga: ella sabe por dónde caminar.', 'Hi! Careful: there are nettles hidden in the grass. Read Ortiga’s diary: she knows where to walk.'],
          ['Ortiga usa Palabritas de tipo Planta y Veneno. ¡El fuego y los voladores les ganan a las plantas!', 'Ortiga uses Plant and Poison types. Fire and flyers beat plants!'],
        )
      : lines(
          ['La líder Ortiga no está. Se fue al Templo del Jaguar: dice que la selva está demasiado callada.', 'Leader Ortiga isn’t here. She went to the Jaguar Temple: she says the jungle is far too quiet.'],
          ['Los otros entrenadores fueron con ella. Yo cuido el jardín... ¡y las ortigas!', 'The other trainers went with her. I’m looking after the garden... and the nettles!'],
        ),
  abuela_jaguar: untilJaguar(
    [
      ['Antes, los monos congo nos despertaban cada mañana. ¡Gritaban muy fuerte!', 'The howler monkeys used to wake us every morning. They howled really loud!'],
      ['Pero hace unos días, la selva se calló. Ni un mono, ni un pájaro...', 'But a few days ago, the jungle went quiet. Not a monkey, not a bird...'],
    ],
    [
      ['Dicen que la jaguar se volvió de piedra... y que tú cuidas a su hijo.', 'They say the jaguar turned to stone... and that you look after her child.'],
      ['Cuando él ruja, los monos van a volver. ¡Yo lo sé!', 'When he roars, the monkeys will come back. I know it!'],
    ],
  ),
  nino_jaguar: untilJaguar(
    [
      ['Ayer fui a la selva con mi papá. ¡No escuchamos ni un pájaro!', 'Yesterday I went into the jungle with my dad. We didn’t hear a single bird!'],
      ['Mi papá dice que es por la gente de negro.', 'My dad says it’s because of the people in black.'],
    ],
    [
      ['¿Tú viste a la jaguar? ¿Era muy grande? ¿Rugió?', 'Did you see the jaguar? Was she really big? Did she roar?'],
      ['¡Qué suerte! Yo nunca la vi.', 'Lucky you! I never saw her.'],
    ],
  ),
  cacaotera: talk(
    ['¿Probaste el cacao de Villa Jaguar? Mi abuela plantó estos árboles hace cincuenta años.', 'Have you tried Villa Jaguar’s cacao? My grandmother planted these trees fifty years ago.'],
    ['Con el cacao hacemos chocolate... y pinolillo, con maíz y cacao. ¡Es la bebida de Nicaragua!', 'With cacao we make chocolate... and pinolillo, with corn and cacao. It’s Nicaragua’s drink!'],
  ),
  vecina_jaguar: untilJaguar(
    [['Anoche no pude dormir. ¡Había demasiado silencio!', 'Last night I couldn’t sleep. It was too quiet!']],
    [['Anoche dormí mejor. Bueno... todavía hay silencio, pero ahora hay esperanza.', 'Last night I slept better. Well... it’s still quiet, but now there’s hope.']],
  ),
  guia_selva: talk(
    ['Por aquí se va a la selva. Es un laberinto: ¡no te pierdas!', 'This way to the jungle. It’s a labyrinth: don’t get lost!'],
    ['Ayer entró un grupo de turistas. Salieron muy cansados... ¡pero felices!', 'Yesterday a group of tourists went in. They came out very tired... but happy!'],
  ),
  lanchero: talk(
    ['Llegaste por el río, ¿verdad? Aquí todo llega en lancha: la comida, las cartas... ¡y los visitantes!', 'You came by the river, right? Everything arrives here by boat: food, letters... and visitors!'],
    ['El río baja hasta el Lago de las Islas. Allá hay nadadores muy fuertes.', 'The river runs down to the Lago de las Islas. There are very strong swimmers there.'],
  ),
  viajera_jaguar: untilJaguar(
    [['Vine a ver la selva, pero está tan callada que da miedo.', 'I came to see the jungle, but it’s so quiet it’s scary.']],
    [['Hoy escuché un pajarito en la selva. ¡Solo uno! Pero es un comienzo.', 'Today I heard a little bird in the jungle. Just one! But it’s a start.']],
  ),
  abuelo_jaguar: untilJaguar(
    [['Antes, la jaguar rugía cada mañana y yo me levantaba. Ahora duermo hasta tarde... ¡y no me gusta!', 'The jaguar used to roar every morning and I’d get up. Now I sleep till late... and I don’t like it!']],
    [
      ['Mi abuelo me contó la leyenda cuando yo era niño: «Cuando su hijo ruja, la selva despertará».', 'My grandfather told me the legend when I was a boy: "When her child roars, the jungle will wake."'],
      ['Nunca pensé que la iba a ver de verdad.', 'I never thought I’d see it for real.'],
    ],
  ),
  mama_chepe: mamaChepe,
  ortigaTemplo: talk(
    ['Soy Ortiga, la líder del gimnasio de Villa Jaguar. Vine porque la selva está demasiado callada.', 'I’m Ortiga, the gym leader of Villa Jaguar. I came because the jungle is far too quiet.'],
    ['Federico dice que Equipo Silencio está adentro. Son muchos... ¿Tú vas a subir? ¡Ten mucho cuidado!', 'Federico says Equipo Silencio is inside. There are a lot of them... Are you going up? Be very careful!'],
  ),
  jardinera_azucena: fight('jardinera_azucena', ['Ayer regué todas las plantas del jardín. ¡Hoy toca una batalla!', 'Yesterday I watered all the plants in the garden. Today it’s battle time!'], ['¡Ay! Me marchité.', 'Oh! I wilted.'], ['¿Leíste el diario de Ortiga? Yo lo leí tres veces.', 'Did you read Ortiga’s diary? I read it three times.']),
  yerbero_chepe: fight('yerbero_chepe', ['Esta mañana encontré una orquídea nueva. ¡No la pises!', 'This morning I found a new orchid. Don’t step on it!'], ['Perdí... pero la orquídea está bien.', 'I lost... but the orchid is fine.'], ['Ortiga me enseñó todo: qué plantas curan y qué plantas pican.', 'Ortiga taught me everything: which plants heal and which plants sting.']),
  botanica_iris: fight('botanica_iris', ['¡Llegaste al camino del medio! ¿Quién te dijo por dónde caminar?', 'You made it to the middle path! Who told you where to walk?'], ['Leíste bien el diario.', 'You read the diary well.'], ['La líder está ahí arriba, en su silla. ¡Suerte!', 'The leader is up there, in her chair. Good luck!']),

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
  vulcanologo_oscar: fight(
    'vulcanologo_oscar',
    ['Estudio las rocas negras. ¡Todas vienen del volcán!', 'I study the black rocks. They all come from the volcano!'],
    ['¡Eres más dur{o/a} que una roca!', 'You’re tougher than a rock!'],
    ['Hace cien años, la lava bajó por aquí. Por eso todo es negro.', 'A hundred years ago, the lava came down here. That’s why everything is black.'],
  ),
  excursionista_lidia: fight(
    'excursionista_lidia',
    ['Bajo del volcán por el camino viejo. ¿Una batalla antes de seguir?', 'I’m coming down the volcano by the old trail. A battle before we go on?'],
    ['¡Uf! Mejor sigo bajando.', 'Phew! I’d better keep going down.'],
    ['Este camino baja hasta la Ruta 5. ¡Es un atajo a Villa Ocote!', 'This trail goes down to Route 5. It’s a shortcut to Villa Ocote!'],
  ),
  guardaparque_ivan: fight(
    'guardaparque_ivan',
    ['Cuido el camino del volcán. ¡A ver si estás list{o/a}!', 'I look after the volcano trail. Let’s see if you’re ready!'],
    ['¡Muy bien! Puedes bajar.', 'Very good! You can go down.'],
    ['Desde abajo no se puede subir: el escalón es muy alto.', 'You can’t climb up from below: the step is too high.'],
  ),
  nadador_tomas: fight(
    'nadador_tomas',
    ['¡Nado en el lago todas las mañanas! ¿Y tú, cómo llegaste hasta aquí?', 'I swim in the lake every morning! And you, how did you get out here?'],
    ['¡Glu, glu! Tragué agua.', 'Glug, glug! I swallowed water.'],
    ['Las islas pequeñas se llaman isletas. ¡En el lago hay muchísimas!', 'The little islands are called islets. There are loads of them in the lake!'],
  ),
  nadadora_elena: fight(
    'nadadora_elena',
    ['El agua está fresquita. ¡Perfecta para una batalla!', 'The water is nice and cool. Perfect for a battle!'],
    ['¡Qué rápid{o/a} eres!', 'You’re so fast!'],
    ['Dicen que en la isla del volcán vive una Palabrita muy antigua.', 'They say a very ancient Palabrita lives on the volcano island.'],
  ),
  nadador_rodolfo: fight(
    'nadador_rodolfo',
    ['¡Voy a cruzar el lago entero! Pero primero, una batalla.', 'I’m going to swim across the whole lake! But first, a battle.'],
    ['Necesito descansar en una isleta.', 'I need to rest on an islet.'],
    ['El río lleva a un pueblo en la selva. ¡Allá hace mucho calor!', 'The river leads to a town in the jungle. It’s really hot there!'],
  ),
  nadadora_lucia: fight(
    'nadadora_lucia',
    ['Practico para una carrera. ¿Me ayudas con una batalla?', 'I’m training for a race. Will you help me with a battle?'],
    ['¡Ay, me cansé!', 'Oh, I’m tired!'],
    ['Con cuatro medallas, las Palabritas grandes del agua te pueden llevar.', 'With four medals, big water Palabritas can carry you.'],
  ),
  nadadora_rosa: fight(
    'nadadora_rosa',
    ['¡El río baja desde el cañón! ¿Nadamos juntos? Primero, una batalla.', 'The river comes down from the canyon! Shall we swim together? A battle first.'],
    ['¡Me llevó la corriente!', 'The current carried me away!'],
    ['No se puede salir del río: hay manglares por todos lados. Sigue hasta Villa Jaguar.', 'You can’t get out of the river: there are mangroves everywhere. Keep going to Villa Jaguar.'],
  ),
  nadador_chema: fight(
    'nadador_chema',
    ['¡Cuidado con los manglares! Sus raíces están en el agua.', 'Careful with the mangroves! Their roots are in the water.'],
    ['¡Uf, qué fuerte!', 'Phew, so strong!'],
    ['Muchos peces viven entre las raíces de los manglares.', 'Lots of fish live among the mangrove roots.'],
  ),
  nadadora_ivania: fight(
    'nadadora_ivania',
    ['Aquí el río se divide. ¡No nades hacia los rápidos!', 'Here the river splits. Don’t swim toward the rapids!'],
    ['¡Perdí!', 'I lost!'],
    ['Los rápidos van al oeste, hasta el mar.', 'The rapids go west, all the way to the sea.'],
  ),
  nadador_pancho: fight(
    'nadador_pancho',
    ['¿Oyes eso? Son monos congo. ¡La selva está cerca!', 'Hear that? Howler monkeys. The jungle is close!'],
    ['¡Me ganaste!', 'You beat me!'],
    ['Dicen que en el templo de la selva duerme un jaguar enorme.', 'They say a huge jaguar sleeps in the jungle temple.'],
  ),
  nadadora_karla: fight(
    'nadadora_karla',
    ['Ya casi llegas a Villa Jaguar. ¡Pero primero, conmigo!', 'You’re almost at Villa Jaguar. But first, me!'],
    ['¡Qué batalla!', 'What a battle!'],
    ['El muelle de Villa Jaguar está ahí adelante.', 'Villa Jaguar’s pier is just ahead.'],
  ),
  exploradora_ines: fight(
    'exploradora_ines',
    ['¡Llevo tres días perdida en esta selva! ¿Tú sabes salir?', 'I’ve been lost in this jungle for three days! Do you know the way out?'],
    ['¡Ay! Y ahora, ¿por dónde?', 'Oh! And now, which way?'],
    ['Un truco: camina siempre con la mano en los árboles de la izquierda.', 'A trick: always walk with your hand on the trees to your left.'],
  ),
  biologa_maite: fight(
    'biologa_maite',
    ['Estudio las mariposas de la selva. ¡Hay más de mil tipos!', 'I study the jungle’s butterflies. There are over a thousand kinds!'],
    ['¡Se me escaparon todas!', 'They all got away!'],
    ['Desde hace días la selva está muy callada. Ni los monos congo gritan.', 'For days the jungle has been very quiet. Not even the howler monkeys shout.'],
  ),
  fotografo_rene: fight(
    'fotografo_rene',
    ['¡Quiero una foto del jaguar negro! ¿Lo viste?', 'I want a photo of the black jaguar! Have you seen it?'],
    ['¡Uy, salió borrosa!', 'Oops, it came out blurry!'],
    ['Vi a unas personas de negro con una máquina rara. Iban al templo.', 'I saw some people in black with a strange machine. They were going to the temple.'],
  ),
  silencioso11: fight(
    'silencioso11',
    ['¡Shhh! Nadie pasa al templo. Son órdenes de la Comandante Mutis.', 'Shhh! Nobody goes to the temple. Commander Mutis’s orders.'],
    ['¡Shhh! No le digas a la comandante que perdí.', 'Shhh! Don’t tell the commander I lost.'],
    ['Cuando el jaguar se calle, toda la selva se va a dormir. ¡Silencio para siempre!', 'When the jaguar falls silent, the whole jungle will go to sleep. Silence forever!'],
  ),
  silenciosa12: fight('silenciosa12', ['¡Shhh! Este templo ahora es de Equipo Silencio.', 'Shhh! This temple belongs to Equipo Silencio now.'], ['¡Shhh! Qué vergüenza.', 'Shhh! How embarrassing.'], ['La comandante está arriba, con la jaguar.', 'The commander is upstairs, with the jaguar.']),
  buscatesoros_leo: fight('buscatesoros_leo', ['¡Busco el tesoro del jaguar! ¡No me lo vas a quitar!', 'I’m looking for the jaguar’s treasure! You won’t take it from me!'], ['¡Ay, mis tesoros!', 'Oh, my treasures!'], ['Aquí no hay oro. Solo piedras con dibujos... ¡qué aburrido!', 'There’s no gold here. Just stones with drawings... how boring!']),
  silencioso13: fight('silencioso13', ['¿Oíste algo? Yo no. ¡Aquí ya nadie hace ruido!', 'Did you hear something? I didn’t. Nobody makes noise here anymore!'], ['¡Shhh! Perdí en silencio.', 'Shhh! I lost quietly.'], ['El nuevo Silenciador es mucho más fuerte que el de la mina.', 'The new Silenciador is much stronger than the one in the mine.']),
  arqueologo_tito: fight('arqueologo_tito', ['Estas paredes cuentan una historia en pasado: «El jaguar rugió, y la selva despertó».', 'These walls tell a story in the past: "The jaguar roared, and the jungle woke."'], ['¡Qué batalla! Parece de leyenda.', 'What a battle! Like something from a legend.'], ['Fui a la universidad para leer estas piedras. ¡Y todavía no las entiendo todas!', 'I went to university to read these stones. And I still don’t understand them all!']),
  silenciosa14: fight('silenciosa14', ['¡No vas a llegar al altar! ¡Shhh!', 'You won’t reach the altar! Shhh!'], ['¡Shhh! ¡No grites!', 'Shhh! Don’t shout!'], ['Mutis dice que el silencio es paz. Pero... la selva se ve tan triste.', 'Mutis says silence is peace. But... the jungle looks so sad.']),
  silencioso15: fight('silencioso15', ['¡Shhh! Desde aquí arriba vigilo todo el templo.', 'Shhh! From up here I watch the whole temple.'], ['¡No vi venir eso!', 'I didn’t see that coming!'], ['Escuché un maullido abajo. ¿Hay un gato en el templo?', 'I heard a mew downstairs. Is there a cat in the temple?']),
  buscatesoros_vero: fight('buscatesoros_vero', ['Este cuarto escondido es mío. ¡Lo encontré primero!', 'This hidden room is mine. I found it first!'], ['¡Bueno, bueno! Te lo presto.', 'Okay, okay! You can borrow it.'], ['En la pared dice: «La jaguar cuidó a su hijo». Qué bonito, ¿no?', 'The wall says: "The jaguar cared for her child." Lovely, isn’t it?']),
  pescador_lago: talk(['¿Ves las islas? Sin bote no se puede llegar. ¡Algún día voy a ir!', 'See the islands? You can’t get there without a boat. Someday I’ll go!']),
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

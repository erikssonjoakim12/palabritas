import { overlay, el, gp } from '../engine/screen';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag, saveGame } from '../game/state';
import { newMon, healParty, markCaught } from '../game/mon';
import { record, pickFromTheme, isLearned, isUnseen } from '../game/learning';
import { itemsBetween } from '../game/curriculum';
import { SPECIES, STARTER_LEVEL, type Mode } from '../data/species';
import { THEMES, adHocItem } from '../data/content';
import { TRAINERS } from '../data/trainers';
import { say, info, closeText } from '../ui/textbox';
import { ask, menu } from '../ui/menu';
import { challenge, chooseText } from '../ui/challenge';
import { spriteCanvas } from '../ui/party';
import { startMenu } from '../ui/startmenu';
import { wildBattle, trainerBattle } from '../battle/battle';
import { speak, canListen } from '../lang/speech';
import { SCRIPTS, scriptedStep, warp, currentMap, refreshNpcs, npcById, type ScriptCtx } from './world';
import { MINI_BALL, BALL_COLORS, drawPattern } from '../art/balls';

type Line = [es: string, en: string];

async function lines(...ls: Line[]) {
  for (const [es, en] of ls) await say(es, { en });
}

const talkMode = (): Mode => (canListen() ? 'speak' : 'type');

// ---------- Shared flows ----------

async function blackout() {
  await info('{name} corre de vuelta a un lugar seguro...', { en: '{name} hurries back to a safe place...' });
  healParty();
  const h = G.save.heal;
  await warp(h.map, h.x, h.y, 'down');
  await info('Tus Palabritas se recuperaron.', { en: 'Your Palabritas recovered.' });
}

/**
 * Gold/Silver's healing: the Palabolas go into the machine one by one, flash, and the
 * healing jingle plays.
 */
async function healingMachine() {
  const machine = npcById('maquina');
  if (!machine) return heal();
  const count = Math.max(1, G.save.party.length);
  // 6 slots of 4x4 in the machine's tray; each holds a mini Palabola (teal top, white bottom).
  const slots: [number, number][] = [[2, 3], [6, 3], [10, 3], [2, 7], [6, 7], [10, 7]];
  const FLASH = { t: '#f8f8b0', w: '#f8f8b0' };
  let shown = 0;
  let flash = false;
  machine.overlay = (g, x, y) => {
    for (let i = 0; i < shown; i++) drawPattern(g, MINI_BALL, x + slots[i][0], y + slots[i][1], flash ? FLASH : BALL_COLORS);
  };
  for (let i = 0; i < count && i < 6; i++) {
    shown = i + 1;
    sfx('blip');
    await frames(14);
  }
  sfx('heal');
  healParty();
  for (let k = 0; k < 10; k++) {
    flash = !flash;
    await frames(8);
  }
  machine.overlay = undefined;
}

async function heal() {
  sfx('heal');
  healParty();
  await frames(70);
}

interface TrainerLines {
  intro: Line;
  defeated: Line;
  after: Line;
}

async function trainerFight(id: string, l: TrainerLines) {
  if (flag(`beat:${id}`)) return lines(l.after);
  await lines(l.intro);
  if (!flag('defenseTip')) {
    setFlag('defenseTip');
    await info('Contra entrenadores, ¡puedes defenderte! Si respondes bien cuando te atacan, recibes menos daño.', {
      en: 'Against trainers you can defend! Answer well when they attack and you take less damage.',
    });
  }
  const res = await trainerBattle(TRAINERS[id]);
  if (res === 'lose') return blackout();
  setFlag(`beat:${id}`);
  await lines(l.defeated);
}

const MICHI_Q = adHocItem(
  ['¿Has visto a Michi?', '¿Viste a Michi?', '¿Has visto al gato?', '¿Viste al gato?', '¿Has visto a la gata?', '¿Viste a la gata?', '¿Has visto a mi gata?'],
  'Have you seen Michi?',
);

/** Ask someone "¿Has visto a Michi?" out loud (or typed). */
async function askAboutMichi(): Promise<boolean> {
  const r = await challenge({
    item: MICHI_Q,
    mode: talkMode(),
    title: 'Pregunta',
    label: 'Pregunta: «Have you seen Michi?» · Ask about Michi',
  });
  record(MICHI_Q, r.mode, r.grade, r.helped);
  return r.grade !== 'wrong';
}

function showCreature(sp: string) {
  const box = el('div', 'box');
  Object.assign(box.style, { left: gp(48), top: gp(6), padding: gp(4) });
  const c = spriteCanvas(sp, 48);
  Object.assign(c.style, { width: gp(56), height: gp(56), imageRendering: 'pixelated', display: 'block' });
  box.appendChild(c);
  overlay.appendChild(box);
  return () => box.remove();
}

// ---------- Scripts ----------

const S: Record<string, (c: ScriptCtx) => Promise<void>> = {
  startMenu: () => startMenu(),

  async __wild(c) {
    const { sp, level } = c.data as { sp: string; level: number };
    const res = await wildBattle(sp, level);
    if (res === 'lose') await blackout();
  },

  // ----- Pueblo Amanecer -----

  async needStarter() {
    if (flag('starter')) return;
    await lines(
      ['¡Espera, {name}! Es peligroso ir a la hierba alta sin una Palabrita.', 'Wait! It’s dangerous to go into the tall grass without a Palabrita.'],
      ['La Profesora Ceiba está en su laboratorio. ¡Ve a verla!', 'Professor Ceiba is in her lab. Go and see her!'],
    );
    await scriptedStep('down');
  },

  async lucas() {
    if (!flag('starter')) {
      await lines(['¡Hola, {name}! Dicen que la Profesora Ceiba tiene Palabritas nuevas.', 'Hi! They say Professor Ceiba has some new Palabritas.']);
    } else {
      await lines(['¡Qué Palabrita tan bonita! Al norte está la Ruta 1.', 'What a pretty Palabrita! Route 1 is to the north.']);
    }
  },

  /** Sam explains the game in English, for players who have never played Pokémon. */
  async sam() {
    const en = (text: string) => say(text, { voice: false });
    if (!flag('beat:sam')) {
      // First meeting: like a trainer, he spots you and comes over to say hi (only once).
      setFlag('beat:sam');
      await say('¡Hola! ¡Hola! Me llamo Sam.', { en: 'Hi! Hi! My name is Sam.' });
      await en("Sorry, I saw you're new here! I just moved here to learn Spanish too.");
      const want = await ask('Want me to explain how this game works? (In English!)', { voice: false }, ['Yes, please!', 'No, thanks']);
      if (!want) {
        await en("OK! If you ever have questions, just come and talk to me. I'm always around here.");
        return;
      }
    } else {
      await say('¡Hola otra vez!', { en: 'Hi again!' });
    }
    const TOPICS: [string, string[]][] = [
      ['Palabritas', [
        'Palabritas are creatures that grow stronger when YOU learn Spanish.',
        'Each one teaches everyday Spanish plus its own theme: dogs, weather, food, numbers... Every level brings new words.',
        'Professor Ceiba, in the lab next door, wants to talk to you. She has something important to tell you!',
      ]],
      ['Battles', [
        'Walk into tall grass to meet wild Palabritas. In battle, every attack is a Spanish question.',
        'Answer well and your attack hits. A perfect answer, accents included, is a critical hit! A wrong answer misses.',
        'Against trainers you also answer a question when THEY attack. Answer well and you take less damage.',
      ]],
      ['Moves', [
        'There are four kinds of moves: tap the meaning, write it in Spanish, write what you hear, and say it out loud.',
        'Harder moves hit harder. A Palabrita starts with two kinds and learns the others as it levels up.',
        'If you need the 💡 help button, your attack only does half damage.',
      ]],
      ['Leveling up', [
        'There is no XP here. Your Palabrita levels up when you master the new words of its level, plus a quick review of older ones.',
        'You can see which words it needs in START, PALABRITAS, DETALLES.',
        'Mastered words come back for review on later days. If you forget them, your Palabrita stops obeying you!',
      ]],
      ['Catching', [
        'First weaken a wild Palabrita. Then throw a Palabola and say one of its words.',
        'The better your answer, the easier it is to catch. Doña Lupe in Villa Limón makes Palabolas.',
      ]],
      ['Controls', [
        'A talks and confirms, B goes back (hold B to run), START opens the menu.',
        'Tap the speaker button to hear any Spanish line again, and EN to see the English translation.',
        'If your Palabritas get hurt, heal them at the Palacentro, or at home with your mom.',
      ]],
    ];
    while (true) {
      await say('What do you want to know?', { voice: false, noWait: true });
      const i = await menu([...TOPICS.map((t) => t[0]), 'Bye'], { cancel: true, columns: 2, pos: { left: 0, right: 0, bottom: 48 } });
      if (i < 0 || i >= TOPICS.length) break;
      for (const line of TOPICS[i][1]) await en(line);
    }
    await say('¡Hasta luego! ¡Buena suerte!', { en: 'See you later! Good luck!' });
  },

  async pescador() {
    await lines(['¡Hola! El mar está muy tranquilo hoy.', 'Hi! The sea is very calm today.']);
    const likes = await ask('¿Te gusta pescar?', { en: 'Do you like fishing?' }, ['Sí, me gusta.', 'No, no me gusta.']);
    if (likes) await lines(['¡A mí también! Me gusta mucho.', 'Me too! I like it a lot.']);
    else await lines(['¿No? ¡Pues a mí me encanta!', 'No? Well, I love it!']);
  },

  async mama() {
    if (!flag('starter')) {
      await lines(
        ['¡Buenos días, {name}! ¿Dormiste bien?', 'Good morning! Did you sleep well?'],
        ['La Profesora Ceiba te está buscando. Su laboratorio está al lado.', 'Professor Ceiba is looking for you. Her lab is next door.'],
      );
      await lines(['¡Ah! Sam, el chico de afuera, habla inglés. Te puede explicar cómo funciona todo.', 'Oh! Sam, the boy outside, speaks English. He can explain how everything works.']);
      await info('Consejo: toca 🔊 para oír otra vez y EN para ver la traducción. Pulsa START para el menú.', {
        en: 'Tip: tap 🔊 to hear it again and EN to see the translation. Press START for the menu.',
      });
      return;
    }
    if (await ask('¡Hola, cariño! ¿Quieres descansar un rato?', { en: 'Hi, sweetie! Do you want to rest for a while?' })) {
      await heal();
      G.save.heal = { map: 'casa', x: 2, y: 4 };
      await lines(['¡Tus Palabritas están llenas de energía! ¡Cuídate mucho!', 'Your Palabritas are full of energy! Take care!']);
    } else {
      await lines(['Bueno. ¡Cuídate mucho!', 'OK. Take good care!']);
    }
  },

  async ceiba() {
    if (!flag('starter')) {
      if (G.save.starterChoice) return starterTraining(G.save.starterChoice);
      if (flag('metCeiba')) {
        return lines(['¿Ya elegiste? Las Palabolas están en la mesa.', 'Have you chosen yet? The Palabolas are on the table.']);
      }
      await lines(
        ['¡Hola, {name}! Soy la Profesora Ceiba. ¡Te estaba esperando!', 'Hi! I’m Professor Ceiba. I was waiting for you!'],
        ['En esta región, las Palabritas crecen con las palabras.', 'In this region, Palabritas grow with words.'],
        ['Cada Palabrita te enseña palabras: las más útiles y las de su tema. Cuando dominas las de su nivel, ¡sube de nivel!', 'Each Palabrita teaches you words: the most useful ones and those of its theme. When you master the ones for its level, it levels up!'],
        ['En la batalla, cada ataque es un reto: elegir, escribir, escuchar o hablar.', 'In battle, every attack is a challenge: choose, write, listen or speak.'],
        ['¡Hablar es el ataque más fuerte! Y si respondes perfecto, con acentos, es un golpe crítico.', 'Speaking is the strongest attack! And a perfect answer, accents included, is a critical hit.'],
        ['Pero ojo: si no usas las palabras, tu Palabrita las olvida... y deja de obedecerte.', 'But careful: if you don’t use the words, your Palabrita forgets them... and stops obeying you.'],
        ['En la mesa hay tres Palabolas. Elige una... ¡pero primero tendrás que demostrar que eres un buen entrenador!', 'There are three Palabolas on the table. Pick one... but first you’ll have to show me you’re a good trainer!'],
      );
      setFlag('metCeiba');
      return;
    }
    if (!flag('palabolas')) {
      return lines(
        ['Ve al norte, a Villa Limón, y visita a mi amiga Doña Lupe. ¡Creo que necesita ayuda!', 'Go north to Lemon Village and visit my friend Doña Lupe. I think she needs help!'],
        ['Tus Palabritas se hacen fuertes luchando. En START, elige PALABRITAS para ver sus poderes.', 'Your Palabritas get stronger by battling. In START, choose PALABRITAS to see their powers.'],
      );
    }
    if (!flag('medalBrisa')) {
      return lines(['El Gimnasio de Ciudad Brisa está al norte de la Ruta 2. ¡Tú puedes!', 'The Breeze City Gym is north of Route 2. You can do it!']);
    }
    await lines(['¡La Medalla Brisa! Estoy muy orgullosa de ti.', 'The Breeze Medal! I’m very proud of you.']);
  },

  async ayudante() {
    await lines(
      ['Un consejo: para escribir acentos, mantén pulsada la letra: e → é, n → ñ.', 'A tip: to type accents, press and hold the letter: e → é, n → ñ.'],
      ['Si no conoces una palabra nueva, toca 💡 Ayuda. Pero solo cuenta como «casi».', 'If you don’t know a new word, tap 💡 Ayuda. But it only counts as "almost".'],
      ['¿La prueba de la profesora? Si te equivocas, no pasa nada: ella repite las palabras.', 'The professor’s test? If you get one wrong, no problem: she repeats the words.'],
    );
  },

  starter_salchichita: () => pickStarter('salchichita'),
  starter_gotita: () => pickStarter('gotita'),
  starter_aguacatito: () => pickStarter('aguacatito'),

  async ana() {
    if (flag('anaMet')) {
      return lines(
        ['¿Sabías que en español hay dos formas de decir «you»?', 'Did you know Spanish has two ways to say "you"?'],
        ['«Tú» con amigos, y «usted» con personas mayores o desconocidas.', '"Tú" with friends, and "usted" with older people or strangers.'],
      );
    }
    await lines(['¡Hola! Soy Ana, tu vecina. ¿Cómo te llamas?', 'Hi! I’m Ana, your neighbor. What’s your name?']);
    const name = G.save.name;
    const item = adHocItem([`Me llamo ${name}`, `Soy ${name}`, `Mi nombre es ${name}`], 'My name is …');
    const r = await challenge({
      item,
      mode: talkMode(),
      title: 'Ana',
      label: `Responde: «My name is ${name}»`,
      validate: (a) => (/^\s*(me llamo|soy|mi nombre es)\s+\S+/i.test(a) ? 'perfect' : null),
    });
    if (r.grade === 'wrong') {
      return lines(['¿Perdón? No te entendí. ¡Inténtalo otra vez!', 'Sorry? I didn’t understand. Try again!']);
    }
    setFlag('anaMet');
    await lines(['¡Mucho gusto, {name}!', 'Nice to meet you!']);
  },

  // ----- Ruta 1 -----

  sofia: () =>
    trainerFight('sofia', {
      intro: ['¡Hola! ¿Quieres luchar conmigo?', 'Hi! Do you want to battle me?'],
      defeated: ['¡Ay! ¡Qué fuerte eres!', 'Oh! You’re so strong!'],
      after: ['Cuando ataco, tienes que saber las palabras de mi Conejito: ¡los números!', 'When I attack, you need to know my Conejito’s words: numbers!'],
    }),

  // ----- Villa Limón -----

  async carmen() {
    if (flag('michiQuest') && !flag('askedCarmen')) {
      await info('Pregúntale a Carmen por Michi.', { en: 'Ask Carmen about Michi.' });
      if (!(await askAboutMichi())) return lines(['¿Perdón? No te entendí.', 'Sorry? I didn’t understand you.']);
      setFlag('askedCarmen');
      return lines(
        ['No, no la he visto.', 'No, I haven’t seen her.'],
        ['Pero pregúntale a Don Pepe, el panadero. ¡Él ve todo desde su ventana!', 'But ask Don Pepe, the baker. He sees everything from his window!'],
      );
    }
    if (flag('askedCarmen') && !flag('michiFound')) {
      return lines(['La panadería de Don Pepe está al norte, cerca de las flores.', 'Don Pepe’s bakery is to the north, near the flowers.']);
    }
    await lines(['Los limones de Villa Limón son los mejores del mundo.', 'The lemons of Lemon Village are the best in the world.']);
  },

  /** Beto blocks the road to Ruta 2 until you have Palabolas. */
  async beto() {
    if (flag('palabolas')) {
      return lines(
        ['¡Ya tienes Palabolas! Puedes pasar a la Ruta 2.', 'You have Palabolas now! You can go to Route 2.'],
        ['Si ves mi sombrero allí, ¡avísame!', 'If you see my hat there, let me know!'],
      );
    }
    await lines(
      ['¡Alto! No puedes ir a la Ruta 2.', 'Stop! You can’t go to Route 2.'],
      ['Las Palabritas salvajes de allí son muy traviesas. ¡Ayer una me robó el sombrero!', 'The wild Palabritas there are very naughty. Yesterday one stole my hat!'],
      ['Sin Palabolas no te dejo pasar. Doña Lupe las hace... pero hoy está muy triste.', 'I won’t let you through without Palabolas. Doña Lupe makes them... but she’s very sad today.'],
    );
  },

  /** Stepping past Beto on the free side of the road. */
  async betoStops() {
    if (flag('palabolas')) return;
    sfx('alert');
    await SCRIPTS.beto({});
    await scriptedStep('down');
  },

  async diego() {
    await lines(['¿Sabías? Si hablas en vez de escribir, ¡tus ataques son más fuertes!', 'Did you know? If you speak instead of writing, your attacks are stronger!']);
  },

  async pepe() {
    if (flag('askedCarmen') && !flag('michiLocated')) {
      await info('Pregúntale a Don Pepe por Michi.', { en: 'Ask Don Pepe about Michi.' });
      if (!(await askAboutMichi())) return lines(['¿Cómo? No te entendí bien.', 'What? I didn’t quite understand you.']);
      const answer = 'Sí, la vi hace un rato. Está detrás de la panadería, al lado de las flores.';
      await info('Don Pepe te responde. ¡Escucha bien!', { en: 'Don Pepe answers. Listen carefully!' });
      const options = [
        'Detrás de la panadería, al lado de las flores',
        'En el río, debajo del puente',
        'En la casa de Doña Lupe',
        'Arriba de un limonero',
      ];
      const order = [...options].sort(() => Math.random() - 0.5);
      while (true) {
        speak(answer);
        const i = await chooseText('¿Dónde está Michi?', '🎧 Listen to Don Pepe: where is Michi?', order, answer);
        if (order[i] === options[0]) break;
        sfx('wrong');
        await lines(['Mmm, no. ¡Escucha otra vez!', 'Hmm, no. Listen again!']);
      }
      sfx('right');
      setFlag('michiLocated');
      return say(answer, { speakNow: true, en: 'Yes, I saw her a while ago. She’s behind the bakery, next to the flowers.' });
    }
    if (flag('michiLocated') && !flag('michiFound')) {
      return lines(['Michi está detrás de la panadería, al lado de las flores.', 'Michi is behind the bakery, next to the flowers.']);
    }
    await lines(
      ['¡Bienvenidos a la Panadería Don Pepe! El pan está recién hecho.', 'Welcome to Don Pepe’s Bakery! The bread is freshly baked.'],
      ['¿Sabías? En México, el pan dulce se come en el desayuno.', 'Did you know? In Mexico, sweet bread is eaten at breakfast.'],
    );
  },

  async michi() {
    sfx('alert');
    await lines(['¡Miau!', 'Meow!']);
    await info('¡Es Michi! Parece que tiene hambre. Michi te sigue.', { en: 'It’s Michi! She looks hungry. Michi follows you.' });
    setFlag('michiFound');
    refreshNpcs();
  },

  async lupe() {
    if (!flag('michiQuest')) {
      await lines(
        ['¡Ay, ay, ay! ¡Mi gata Michi se perdió!', 'Oh dear! My cat Michi is lost!'],
        ['Hoy no puedo hacer Palabolas. Estoy muy preocupada.', 'I can’t make Palabolas today. I’m very worried.'],
        ['¿Me ayudas a buscarla? Pregúntale a la gente: «¿Has visto a Michi?»', 'Will you help me find her? Ask people: "Have you seen Michi?"'],
        ['Empieza con Carmen. Siempre está en la plaza.', 'Start with Carmen. She’s always in the square.'],
      );
      setFlag('michiQuest');
      return;
    }
    if (!flag('michiFound')) {
      return lines(['¿La encontraste? Pregunta: «¿Has visto a Michi?»', 'Did you find her? Ask: "Have you seen Michi?"']);
    }
    if (!flag('palabolas')) {
      sfx('caught');
      await lines(
        ['¡Michi! ¡Mi gatita linda! ¡Muchísimas gracias, {name}!', 'Michi! My pretty kitty! Thank you so much!'],
        ['Yo hago Palabolas. Toma, te regalo cinco.', 'I make Palabolas. Here, I’ll give you five.'],
      );
      G.save.palabolas += 5;
      setFlag('palabolas');
      sfx('levelup');
      await info('¡{name} recibió 5 Palabolas!', { en: '{name} received 5 Palabolas!' });
      await lines(
        ['Para atrapar una Palabrita salvaje, primero debilítala un poco.', 'To catch a wild Palabrita, first weaken it a bit.'],
        ['Luego lanza una Palabola y dile una de sus palabras en español. ¡Si lo dices bien, es más fácil atraparla!', 'Then throw a Palabola and say one of its words in Spanish. Say it well and it’s easier to catch!'],
        ['Ah, y el Señor Ramos dice que su sillón hace ruidos raros... ¡Qué cosa tan extraña!', 'Oh, and Mr. Ramos says his armchair makes strange noises... How strange!'],
      );
      return;
    }
    if (G.save.palabolas === 0) {
      G.save.palabolas += 5;
      await lines(['¿Se te acabaron las Palabolas? Toma cinco más.', 'Did you run out of Palabolas? Here are five more.']);
      return;
    }
    await lines(['Michi está muy feliz. ¡Gracias otra vez!', 'Michi is very happy. Thanks again!']);
  },

  async ramos() {
    if (flag('sillonDone')) return lines(['¡Por fin puedo dormir tranquilo! Gracias.', 'At last I can sleep in peace! Thanks.']);
    await lines(['Mi sillón hace ruidos raros por la noche... ¡Creo que está vivo!', 'My armchair makes strange noises at night... I think it’s alive!']);
    if (flag('palabolas')) await lines(['Si es una Palabrita, ¡atrápala! Yo prefiero una silla normal.', 'If it’s a Palabrita, catch it! I’d rather have a normal chair.']);
  },

  async sillon() {
    if (!flag('palabolas')) {
      return lines(['Es un sillón muy cómodo... ¿Se movió un poco?', 'It’s a very comfy armchair... Did it just move a little?']);
    }
    sfx('alert');
    await lines(['¡El sillón se movió! ¡Es una Palabrita!', 'The armchair moved! It’s a Palabrita!']);
    const res = await wildBattle('sillon', 5);
    if (res === 'lose') return blackout();
    if (res === 'caught' || res === 'win') setFlag('sillonDone');
  },

  async enfermera() {
    await lines(['¡Hola! Bienvenidos al Palacentro.', 'Hi! Welcome to the Palacentro.']);
    if (await ask('¿Quieres que cure a tus Palabritas?', { en: 'Would you like me to heal your Palabritas?' })) {
      await lines(['Un momento, por favor...', 'One moment, please...']);
      await healingMachine();
      G.save.heal = { map: currentMap().id, x: 4, y: 3 };
      await lines(['¡Listo! Tus Palabritas están sanas. ¡Vuelve pronto!', 'Done! Your Palabritas are healthy. Come back soon!']);
    } else {
      await lines(['¡Vuelve pronto!', 'Come back soon!']);
    }
  },

  async maquina() {
    await lines(['Es la máquina que cura a las Palabritas.', 'It’s the machine that heals Palabritas.']);
  },

  async olvidadizo() {
    await lines(
      ['Mi Pajarito no me hace caso... Creo que olvidé sus palabras.', 'My Pajarito won’t listen to me... I think I forgot its words.'],
      ['Hay que repasar un poco cada día. ¡Si no, la lealtad baja!', 'You have to review a little every day. Otherwise loyalty drops!'],
    );
  },

  // ----- Ruta 2 -----

  mateo: () =>
    trainerFight('mateo', {
      intro: ['¡Oye! ¿Por qué me miras? ¡Vamos a luchar!', 'Hey! Why are you looking at me? Let’s battle!'],
      defeated: ['¿Qué? ¿Cómo? ¿Por qué perdí?', 'What? How? Why did I lose?'],
      after: ['Las preguntas son importantes: qué, dónde, cuándo, quién, por qué y cómo.', 'Questions matter: what, where, when, who, why and how.'],
    }),

  tomas: () =>
    trainerFight('tomas', {
      intro: ['¡Camino por esta ruta todos los días! ¿Luchamos?', 'I walk this route every day! Shall we battle?'],
      defeated: ['¡Uf! Necesito descansar.', 'Phew! I need to rest.'],
      after: ['Si tus Palabritas están cansadas, vuelve al Palacentro de Villa Limón.', 'If your Palabritas are tired, go back to the Lemon Village Palacentro.'],
    }),

  valeria: () =>
    trainerFight('valeria', {
      intro: ['¡Estoy pintando mariposas! ¿De qué color es la tuya?', 'I’m painting butterflies! What color is yours?'],
      defeated: ['¡Qué lástima! Mi dibujo no está terminado.', 'What a shame! My drawing isn’t finished.'],
      after: ['Cada Palabrita sabe palabras diferentes. ¡Atrapa muchas y aprende más!', 'Every Palabrita knows different words. Catch many and learn more!'],
    }),

  andres: () =>
    trainerFight('andres', {
      intro: ['¿Vas al gimnasio? ¡Primero tienes que pasar por mí!', 'Going to the gym? First you have to get past me!'],
      defeated: ['Estás listo para Paloma... creo.', 'You’re ready for Paloma... I think.'],
      after: ['El Palomón de Paloma es muy fuerte. ¡Entrena bien antes de entrar!', 'Paloma’s Palomón is very strong. Train well before you go in!'],
    }),

  async lola() {
    await lines([
      '¡Hola! Cuando tu Palabrita sube de nivel, a veces aprende un ataque nuevo. ¡Mira sus poderes en START, PALABRITAS!',
      'Hi! When your Palabrita levels up, it sometimes learns a new move. See its powers in START, PALABRITAS!',
    ]);
  },

  // ----- Ciudad Brisa -----

  async marta() {
    await lines(['En Ciudad Brisa siempre hace viento. ¡Por eso a Paloma le encanta!', 'It’s always windy in Breeze City. That’s why Paloma loves it!']);
  },

  async rita() {
    await lines(['Paloma siempre habla en presente: yo hablo, tú hablas, ella habla...', 'Paloma always speaks in the present: I speak, you speak, she speaks...']);
    if (!(await ask('¿Quieres practicar el presente conmigo?', { en: 'Do you want to practice the present tense with me?' }))) {
      return lines(['Bueno, ¡otro día será!', 'OK, another day then!']);
    }
    const recent: string[] = [];
    let right = 0;
    for (let i = 0; i < 4; i++) {
      const item = pickFromTheme('presente', 3, recent);
      recent.push(item.id);
      const r = await challenge({ item, mode: i % 2 ? 'type' : 'choose', title: `Rita ${i + 1}/4` });
      record(item, r.mode, r.grade, r.helped);
      if (r.grade !== 'wrong') right++;
    }
    await lines(
      [`¡Muy bien! ${right} de 4.`, `Very good! ${right} out of 4.`],
      ['Recuerda: -o para yo, -as o -es para tú, -a o -e para él y ella.', 'Remember: -o for I, -as/-es for you, -a/-e for he/she.'],
    );
  },

  async guia() {
    await lines(
      ['¡Hola! ¿Vas a retar a Paloma?', 'Hi! Are you going to challenge Paloma?'],
      ['Paloma usa Palabritas de tipo Volador. Los ataques Eléctricos y de Roca son muy eficaces contra ellas.', 'Paloma uses Flying-type Palabritas. Electric and Rock attacks are super effective against them.'],
      ['Cuando te ataque, tendrás que escribir las palabras de sus Palabritas para defenderte. ¡Las del Palomón son difíciles!', 'When she attacks, you’ll have to write her Palabritas’ words to defend yourself. Palomón’s are hard!'],
    );
  },

  ivan: () =>
    trainerFight('ivan', {
      intro: ['¡Los pájaros son libres como el viento! ¡Y yo también!', 'Birds are free as the wind! And so am I!'],
      defeated: ['¡Me desplumaste!', 'You plucked all my feathers!'],
      after: ['Paloma es muy fuerte. ¡Buena suerte!', 'Paloma is very strong. Good luck!'],
    }),

  async paloma() {
    if (flag('medalBrisa')) return lines(['Sigue entrenando. ¡El cielo es el límite!', 'Keep training. The sky’s the limit!']);
    await lines(
      ['¡Hola! Soy Paloma, la líder del Gimnasio de Ciudad Brisa.', 'Hi! I’m Paloma, leader of the Breeze City Gym.'],
      ['Aquí hablamos en presente: lo que hacemos ahora y lo que hacemos siempre.', 'Here we speak in the present: what we do now and what we always do.'],
      ['Cuando te ataque, tendrás que escribir las palabras de mis Palabritas para defenderte.', 'When I attack, you’ll have to write my Palabritas’ words to defend yourself.'],
    );
    if (!(await ask('¿Empezamos?', { en: 'Shall we begin?' }))) return lines(['Vuelve cuando quieras.', 'Come back whenever you want.']);
    const res = await trainerBattle(TRAINERS.paloma);
    if (res === 'lose') return blackout();
    setFlag('beat:paloma');
    setFlag('medalBrisa');
    G.save.medals.push('Brisa');
    await lines(['¡Increíble! ¡Hablas muy bien español!', 'Incredible! You speak Spanish really well!']);
    sfx('badge');
    await info('¡{name} recibió la Medalla Brisa!', { en: '{name} received the Breeze Medal!' });
    await lines(
      ['Esta medalla demuestra que entiendes hasta a los Palabritas más fuertes.', 'This medal shows you understand even the strongest Palabritas.'],
      ['Sigue entrenando. ¡El cielo es el límite!', 'Keep training. The sky’s the limit!'],
    );
    await info('¡Felicidades! Terminaste la primera parte de Palabritas.', { en: 'Congratulations! You finished the first part of Palabritas.' });
    await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', {
      en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!',
    });
  },
};

async function pickStarter(sp: string) {
  if (!flag('metCeiba')) {
    return lines(['Mejor habla primero con la Profesora Ceiba.', 'Better talk to Professor Ceiba first.']);
  }
  const chosen = G.save.starterChoice;
  if (chosen) {
    if (chosen === sp) return starterTraining(sp);
    return lines([`Ya elegiste a ${SPECIES[chosen].name}. ¡Habla con la Profesora Ceiba!`, `You already chose ${SPECIES[chosen].name}. Talk to Professor Ceiba!`]);
  }
  const s = SPECIES[sp];
  const theme = THEMES[s.theme];
  const hide = showCreature(sp);
  try {
    await say(`${s.name}: tipo ${s.types.join('/')}. Su tema es «${theme.name}».`, {
      en: `${s.name}: ${s.types.join('/')} type. Its theme is "${theme.en}".`,
    });
    if (!(await ask(`¿Eliges a ${s.name}?`, { en: `Do you choose ${s.name}?` }))) return;
  } finally {
    hide();
  }
  G.save.starterChoice = sp;
  await starterTraining(sp);
}

/**
 * Professor Ceiba's test: before you get your starter, master its first words (levels 2-4).
 * New words come as "tap the meaning", missed ones come back as "write it". Progress is
 * saved after every answer, so you can stop and come back to her later.
 */
async function starterTraining(sp: string) {
  const s = SPECIES[sp];
  const words = itemsBetween(sp, 2, STARTER_LEVEL - 1);
  const queue = words.filter((i) => !isLearned(i));
  if (words.every(isUnseen)) {
    await lines(
      [`¡${s.name}! Muy buena elección. Pero antes de dártelo, quiero ver si eres un buen entrenador.`, `${s.name}! Great choice. But before I give it to you, I want to see if you’re a good trainer.`],
      [`Si no sabes sus primeras palabras, ¡no te va a obedecer! Son ${words.length} palabras.`, `If you don’t know its first words, it won’t obey you! There are ${words.length} words.`],
      ['Las palabras nuevas te las enseño primero. Si te equivocas, no pasa nada: la repetimos después.', 'I’ll show you the new words first. If you get one wrong, no problem: we’ll repeat it later.'],
    );
  } else if (queue.length) {
    await lines([`¿Seguimos con las palabras de ${s.name}?`, `Shall we continue with ${s.name}’s words?`]);
  }
  closeText();
  const hide = showCreature(sp);
  try {
    let asked = 0;
    while (queue.length) {
      const item = queue.shift()!;
      const done = words.length - queue.length - 1;
      const r = await challenge({ item, mode: isUnseen(item) ? 'choose' : 'type', title: `Palabras ${done}/${words.length}` });
      record(item, r.mode, r.grade, r.helped);
      saveGame();
      if (!isLearned(item)) queue.push(item);
      if (++asked % 6 === 0 && queue.length) {
        if (!(await ask('¡Vas muy bien! ¿Seguimos?', { en: 'You’re doing great! Shall we continue?' }))) {
          return lines(['Muy bien. Vuelve a hablar conmigo cuando quieras seguir.', 'All right. Talk to me again whenever you want to continue.']);
        }
      }
    }
  } finally {
    hide();
  }
  G.save.starterChoice = undefined;
  G.save.party.push(newMon(sp, STARTER_LEVEL));
  markCaught(sp);
  setFlag('starter');
  sfx('caught');
  await lines([`¡Excelente! Ya sabes las primeras palabras de ${s.name}.`, `Excellent! You know ${s.name}’s first words now.`]);
  await info(`¡{name} recibió a ${s.name}!`, { en: `{name} received ${s.name}!` });
  refreshNpcs();
  await lines(
    [`¡${s.name} es perfecto para ti!`, `${s.name} is perfect for you!`],
    ['Ahora ve al norte, a Villa Limón, y visita a mi amiga Doña Lupe. ¡Creo que necesita ayuda!', 'Now go north to Lemon Village and visit my friend Doña Lupe. I think she needs help!'],
    ['En la hierba alta hay Palabritas salvajes. ¡Usa tus palabras para luchar!', 'Wild Palabritas live in the tall grass. Use your words to fight!'],
  );
}

export function registerScripts() {
  Object.assign(SCRIPTS, S);
}

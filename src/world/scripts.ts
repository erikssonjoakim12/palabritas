import { overlay, el, gp } from '../engine/screen';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag } from '../game/state';
import { newMon, healParty, markCaught } from '../game/mon';
import { record, pickFromTheme } from '../game/learning';
import { SPECIES, type Mode } from '../data/species';
import { THEMES, adHocItem } from '../data/content';
import { TRAINERS } from '../data/trainers';
import { say, info } from '../ui/textbox';
import { ask, menu } from '../ui/menu';
import { challenge, chooseText } from '../ui/challenge';
import { spriteCanvas } from '../ui/party';
import { startMenu } from '../ui/startmenu';
import { wildBattle, trainerBattle } from '../battle/battle';
import { speak, canListen } from '../lang/speech';
import { SCRIPTS, scriptedStep, warp, currentMap, refreshNpcs, npcById, type ScriptCtx } from './world';
import { HEAL_BALL } from '../style/colors';

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
  const MINI = ['.tt.', 'tttt', 'wwww', '.ww.'];
  let shown = 0;
  let flash = false;
  machine.overlay = (g, x, y) => {
    for (let i = 0; i < shown; i++) {
      const [sx, sy] = slots[i];
      MINI.forEach((row, dy) =>
        [...row].forEach((ch, dx) => {
          if (ch === '.') return;
          g.fillStyle = flash ? '#f8f8b0' : ch === 't' ? HEAL_BALL[0] : HEAL_BALL[1];
          g.fillRect(x + sx + dx, y + sy + dy, 1, 1);
        }),
      );
    }
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
        'Each one has a theme: dogs, weather, food, numbers... It learns the words of its theme.',
        'Professor Ceiba, in the lab next door, will give you your first one.',
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
        'There is no XP here. Your Palabrita levels up when you master all the words of its current level.',
        'You can see which words it needs in START, PALABRITAS, DETALLES.',
        'Mastered words come back for review on later days. If you forget them, your Palabrita stops obeying you!',
      ]],
      ['Catching', [
        'First weaken a wild Palabrita. Then throw a Palabola and say a word from its theme.',
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
      if (flag('metCeiba')) {
        return lines(['¿Ya elegiste? Las Palabolas están en la mesa.', 'Have you chosen yet? The Palabolas are on the table.']);
      }
      await lines(
        ['¡Hola, {name}! Soy la Profesora Ceiba. ¡Te estaba esperando!', 'Hi! I’m Professor Ceiba. I was waiting for you!'],
        ['En esta región, las Palabritas crecen con las palabras.', 'In this region, Palabritas grow with words.'],
        ['Cada Palabrita tiene un tema. Cuando dominas las palabras de su tema, ¡sube de nivel!', 'Each Palabrita has a theme. When you master its words, it levels up!'],
        ['En la batalla, cada ataque es un reto: elegir, escuchar, escribir o hablar.', 'In battle, every attack is a challenge: choose, listen, write or speak.'],
        ['¡Hablar es el ataque más fuerte! Y si respondes perfecto, con acentos, es un golpe crítico.', 'Speaking is the strongest attack! And a perfect answer, accents included, is a critical hit.'],
        ['Pero ojo: si no usas las palabras, tu Palabrita las olvida... y deja de obedecerte.', 'But careful: if you don’t use the words, your Palabrita forgets them... and stops obeying you.'],
        ['En la mesa hay tres Palabolas. ¡Elige a tu primera Palabrita!', 'There are three Palabolas on the table. Choose your first Palabrita!'],
      );
      setFlag('metCeiba');
      return;
    }
    if (!flag('palabolas')) {
      return lines(
        ['Ve al norte, a Villa Limón. Mi amiga Doña Lupe hace Palabolas para atrapar Palabritas.', 'Go north to Lemon Village. My friend Doña Lupe makes Palabolas for catching Palabritas.'],
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
    );
  },

  starter_salchichita: (c) => pickStarter('salchichita', c),
  starter_gotita: (c) => pickStarter('gotita', c),
  starter_aguacatito: (c) => pickStarter('aguacatito', c),

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
      after: ['Cuando ataco, tú respondes con saludos. ¡Practica los saludos!', 'When I attack, you answer with greetings. Practice your greetings!'],
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
        ['Luego lanza una Palabola y dile algo de su tema en español. ¡Si lo dices bien, es más fácil atraparla!', 'Then throw an Palabola and say something from its theme in Spanish. Say it well and it’s easier to catch!'],
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
      ['Cuando te ataque, tendrás que escribir verbos en presente para defenderte.', 'When she attacks, you’ll have to write present-tense verbs to defend yourself.'],
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
      ['Cuando te ataque, tendrás que escribir verbos en presente para defenderte.', 'When I attack, you’ll have to write present-tense verbs to defend yourself.'],
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
      ['Esta medalla demuestra que dominas el presente.', 'This medal shows you’ve mastered the present tense.'],
      ['Sigue entrenando. ¡El cielo es el límite!', 'Keep training. The sky’s the limit!'],
    );
    await info('¡Felicidades! Terminaste la primera parte de Palabritas.', { en: 'Congratulations! You finished the first part of Palabritas.' });
    await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', {
      en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!',
    });
  },
};

async function pickStarter(sp: string, _c: ScriptCtx) {
  if (!flag('metCeiba')) {
    return lines(['Mejor habla primero con la Profesora Ceiba.', 'Better talk to Professor Ceiba first.']);
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
  G.save.party.push(newMon(sp, 2));
  markCaught(sp);
  setFlag('starter');
  sfx('caught');
  await info(`¡{name} recibió a ${s.name}!`, { en: `{name} received ${s.name}!` });
  refreshNpcs();
  await lines(
    [`¡${s.name} es perfecto para ti!`, `${s.name} is perfect for you!`],
    ['Ahora ve al norte, a Villa Limón. Mi amiga Doña Lupe hace Palabolas para atrapar Palabritas.', 'Now go north to Lemon Village. My friend Doña Lupe makes Palabolas for catching Palabritas.'],
    ['En la hierba alta hay Palabritas salvajes. ¡Usa tus palabras para luchar!', 'Wild Palabritas live in the tall grass. Use your words to fight!'],
  );
}

export function registerScripts() {
  Object.assign(SCRIPTS, S);
}

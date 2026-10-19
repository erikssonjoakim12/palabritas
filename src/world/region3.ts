import { fanfare } from '../audio/bgm';
import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import { G, flag, setFlag, today } from '../game/state';
import { addItem, money } from '../game/bag';
import { giveMon } from '../game/mon';
import { record } from '../game/learning';
import { itemBySpanish, adHocItem } from '../data/content';
import { SPECIES } from '../data/species';
import { info, setSpeaker } from '../ui/textbox';
import { ask } from '../ui/menu';
import { challenge, chooseText } from '../ui/challenge';
import { trainerBattle } from '../battle/battle';
import { TRAINERS } from '../data/trainers';
import { speak } from '../lang/speech';
import { gradeDish } from '../lang/order';
import { warp, refreshNpcs, walkNpc, placeNpc, fadeOut, type ScriptFn } from './world';
import type { Line } from './maps';
import { lines, trainerFight, blackout, talkMode } from './scripts';
import { lucasStarter } from './region2';
import { drill, teacher } from './school';

/*
  Region 3: the Pacific coast (PLAN_GYMS_2-4.md §3). Down Ruta 6 to the sea, along Ruta 7 to Playa Carey,
  la noche de la arribada on the turtle beach (Equipo Silencio and Callada), and Marina's surf school.
*/

const shuffled = <T>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);
/** Someone with a few lines, the same each time. */
const talk = (...ls: Line[]): ScriptFn => () => lines(...ls);
/** Lines that change once the arribada is over. */
const beforeAfter = (before: Line[], after: Line[]): ScriptFn => () => lines(...(flag('arribadaDone') ? after : before));
const gift = async (id: string, n: number, es: string, en: string) => {
  addItem(id, n);
  sfx('caught');
  await info(`¡{name} recibió ${es}!`, { en: `{name} received ${en}!` });
};

// ---------- The rival: Lucas, battle #2 (the turtle beach, after Playa Carey and its Palacentro) ----------

async function lucasPlaya() {
  if (flag('lucas2')) return;
  sfx('alert');
  setFlag('lucasPlaya');
  placeNpc('lucas_playa', G.save.x, 10, 'up');
  await walkNpc('lucas_playa', Array(Math.max(0, 10 - (G.save.y + 1))).fill('up'));
  await lines(
    ['¡{name}! ¿Vienes a ver las tortugas? ¡Yo también!', '{name}! Have you come to see the turtles? Me too!'],
    ['¿Ya tienes la Medalla Barro? ¡Yo también!', 'You have the Clay Medal already? Me too!'],
    ['Mi Palabrita evolucionó. ¡Mira qué fuerte está!', 'My Palabrita evolved. Look how strong it is!'],
  );
  const starter = lucasStarter();
  const team: [string, number][] = [[SPECIES[starter].evolves?.to ?? starter, 22], ['hojadillo', 19], ['palomon', 20]];
  const res = await trainerBattle({ ...TRAINERS.lucas2, team }, { look: 'lucas', outro: ['¡No puede ser! ¿Cuántas palabras sabes?', 'It can’t be! How many words do you know?'] });
  if (res === 'lose') {
    setFlag('lucasPlaya', false);
    refreshNpcs();
    return blackout();
  }
  setFlag('lucas2');
  await lines(['Voy a entrenar con las olas. ¡Nos vemos en el volcán!', 'I’m going to train with the waves. See you at the volcano!']);
  await walkNpc('lucas_playa', ['down', 'down', 'down', 'down', 'down', 'down']);
  setFlag('lucasPlaya', false);
  refreshNpcs();
}

// ---------- La noche de la arribada ----------

/** Tania in the day: she tells you about tonight, and you wait for it with her. */
async function voluntaria() {
  if (flag('arribadaDone')) {
    return lines(['¡Gracias otra vez! Las tortuguitas ya están en el mar.', 'Thanks again! The baby turtles are in the sea now.'], ['Dentro de muchos años, van a volver a esta misma playa.', 'Many years from now, they’ll come back to this very beach.']);
  }
  if (!flag('arribadaHablada')) {
    await lines(
      ['¡Hola! Soy Tania, voluntaria de la reserva. Esta noche es la arribada: ¡miles de tortugas van a salir del mar para poner sus huevos!', 'Hi! I’m Tania, a volunteer at the reserve. Tonight is the arribada: thousands of turtles are going to come out of the sea to lay their eggs!'],
      ['Marina también va a ayudar. Pero dicen que unos Silenciosos quieren robar los huevos...', 'Marina is going to help too. But they say some Silenciosos want to steal the eggs...'],
    );
    setFlag('arribadaHablada');
  }
  if (!(await ask('¿Quieres esperar aquí hasta la noche?', { en: 'Do you want to wait here until night?' }))) return lines(['Está bien. ¡Vuelve antes de que oscurezca!', 'All right. Come back before it gets dark!']);
  await fadeOut(24);
  await info('Esa noche...', { en: 'That night...' });
  await warp('tortugas_noche', G.save.x, G.save.y, G.save.dir, false);
}

/** The numbers Tania counts aloud: you write them. */
const EGGS: [string, string][] = [['ochenta y cinco', '85'], ['sesenta y dos', '62'], ['cien', '100']];

/** Tania at night: counting eggs, then (after Callada) the hatchlings' gift. */
async function voluntariaNoche() {
  if (flag('huevosContados')) {
    if (!flag('beat:callada')) return lines(['¡Rápido! ¡Esos Silenciosos se llevan los huevos!', 'Quick! Those Silenciosos are taking the eggs!']);
    return lines(['¡Mira, están naciendo! Ayuda a Marina con las tortuguitas.', 'Look, they’re hatching! Help Marina with the baby turtles.']);
  }
  await lines(['¡Ayúdame a contar los huevos! Yo los cuento y tú escribes el número.', 'Help me count the eggs! I count them and you write the number.']);
  for (const [es, digits] of EGGS) {
    const item = itemBySpanish(es) ?? adHocItem([es, digits], digits);
    while (true) {
      const r = await challenge({ item, mode: 'listen', title: '🥚 Los huevos', label: 'Tania cuenta. ¿Cuántos huevos hay? Escribe el número.' });
      record(item, r.mode, r.grade, r.helped);
      if (r.grade !== 'wrong') break;
      await lines(['Mmm, no. ¡Escucha otra vez!', 'Hmm, no. Listen again!']);
    }
  }
  setFlag('huevosContados');
  refreshNpcs();
  sfx('alert');
  await lines(['¡Mira! ¡Allá! ¡Unos Silenciosos están sacando huevos de los nidos!', 'Look! Over there! Some Silenciosos are taking eggs from the nests!']);
}

/** Callada, Equipo Silencio's admin: after her three grunts. Then the hatchlings, and the end of the night. */
async function callada() {
  if (!['silencioso8', 'silencioso9', 'silencioso10'].every((id) => flag(`beat:${id}`))) {
    return lines(['...Shhh. Primero, mis Silenciosos.', '...Shhh. My Silenciosos first.']);
  }
  await lines(
    ['...Habla más bajo. Aquí todo es demasiado ruidoso. Las olas. Los turistas. Las tortugas.', '...Speak more quietly. Everything here is too noisy. The waves. The tourists. The turtles.'],
    ['Con el dinero de los huevos, Don Sigilo va a comprar silencio para todo el país.', 'With the money from the eggs, Don Sigilo is going to buy silence for the whole country.'],
  );
  const res = await trainerBattle(TRAINERS.callada, { look: 'callada', outro: ['...Bien. Pero el volcán no hace ruido para siempre. Ya verás.', '...Fine. But the volcano doesn’t stay noisy forever. You’ll see.'] });
  if (res === 'lose') return blackout();
  setFlag('beat:callada');
  // She and her grunts leave.
  await Promise.all([
    walkNpc('callada', ['right', 'right', 'right', 'up', 'up', 'up']),
    walkNpc('silencioso8', ['up', 'up', 'up']),
    walkNpc('silencioso9', ['up', 'up', 'up']),
    walkNpc('silencioso10', ['up', 'up', 'up']),
  ]);
  setFlag('silenciososHuyen');
  refreshNpcs();
  await hatchlings();
}

const HATCHLINGS = ['tortuguita1', 'tortuguita2', 'tortuguita3', 'tortuguita4'];

async function hatchlings() {
  setSpeaker('marina');
  await lines(['¡Están naciendo! Tenemos que ayudarlas a llegar al mar. ¡Guíalas!', 'They’re hatching! We have to help them reach the sea. Guide them!']);
  setSpeaker();
  setFlag('naciendo');
  refreshNpcs();
  await frames(20);
  const cheer = adHocItem(['¡Al mar!', '¡Por aquí!', '¡Vamos, tortuguitas!', '¡Vamos!'], 'To the sea! / This way! / Come on, little turtles!');
  while (true) {
    const r = await challenge({ item: cheer, mode: talkMode(), title: '🐢 ¡Ánimo!', label: '¡Diles algo para animarlas! · Say something to cheer them on!', allowHelp: true });
    if (r.grade !== 'wrong') break;
    await lines(['¡Más fuerte! ¡Que te oigan!', 'Louder! Let them hear you!']);
  }
  for (const id of HATCHLINGS) {
    await walkNpc(id, ['down', 'down'], { speed: 1.5 });
    sfx('blip');
    setFlag(`${id}:mar`);
    refreshNpcs();
  }
  setFlag('tortuguitasAlMar');
  setSpeaker('voluntaria');
  await lines(['¡Lo lograste! Toma, esta tortuguita no quiere separarse de ti.', 'You did it! Here, this little turtle doesn’t want to leave you.']);
  setSpeaker();
  const where = giveMon('paslamita', 18);
  sfx('caught');
  await info('¡{name} recibió a Paslamita!', { en: '{name} received Paslamita!' });
  if (where === 'box') await info('Tu equipo está lleno: Paslamita fue a la Caja de Palabritas.', { en: 'Your team is full: Paslamita went to the storage box.' });
  setSpeaker('marina');
  await lines(['Gracias por cuidar a las tortugas. Mañana te espero en la escuela de surf. ¡Prepárate!', 'Thanks for looking after the turtles. Tomorrow I’ll wait for you at the surf school. Get ready!']);
  setSpeaker();
  await fadeOut(24);
  await info('A la mañana siguiente...', { en: 'The next morning...' });
  setFlag('arribadaDone');
  await warp('carey', 14, 21, 'up', false);
}

// ---------- Side quests ----------

/** El Pelícano Feliz: take the guests' orders and tell the cook. Three rounds; again once a day. */
const ORDERS: { say: string; en: string; need: string[] }[] = [
  { say: 'Quisiera una sopa de pescado, por favor.', en: 'I’d like a fish soup, please.', need: ['sopa de pescado'] },
  { say: 'Para mí, pescado frito con arroz. Y para tomar, un refresco de naranja.', en: 'For me, fried fish with rice. And to drink, an orange drink.', need: ['pescado frito', 'arroz', 'refresco de naranja'] },
  { say: 'Para mí, gallo pinto con queso. Para mi hija, un jugo de mango. ¡Y la cuenta, por favor!', en: 'For me, gallo pinto with cheese. For my daughter, a mango juice. And the check, please!', need: ['gallo pinto', 'queso', 'jugo de mango'] },
  { say: 'Quiero una tortilla con queso y un café, por favor.', en: 'I want a tortilla with cheese and a coffee, please.', need: ['tortilla', 'queso', 'cafe'] },
  { say: 'Para mí, camarones al ajillo y una limonada.', en: 'For me, garlic shrimp and a lemonade.', need: ['camarones al ajillo', 'limonada'] },
  { say: 'Una ensalada de frutas y un vaso de agua, por favor.', en: 'A fruit salad and a glass of water, please.', need: ['ensalada de frutas', 'agua'] },
];
const FIRST_PAY = [200, 300, 500];
const DAILY_PAY = 150;
const TABLES = ['mesa1', 'mesa2', 'mesa3'];

async function duenoRestaurante() {
  const shift = G.save.restaurante;
  if (shift && shift.round < 3) return lines(['¡Rápido, las mesas esperan! Toma el pedido y díselo al cocinero.', 'Quick, the tables are waiting! Take the order and tell the cook.']);
  const firstTime = !flag('mesero3');
  if (!firstTime && G.save.restauranteDia === today()) return lines(['¡Gracias por tu ayuda hoy! Vuelve mañana si quieres trabajar otra vez.', 'Thanks for your help today! Come back tomorrow if you want to work again.']);
  await lines(
    firstTime
      ? ['¡Ay, mi mesero está enfermo! ¿Me ayudas? Tomas los pedidos de las mesas y se los dices al cocinero.', 'Oh, my waiter is sick! Will you help me? You take the tables’ orders and tell the cook.']
      : ['¡Hola otra vez! Hoy hay mucha gente. ¿Me ayudas con las mesas?', 'Hi again! There are lots of people today. Will you help me with the tables?'],
  );
  if (!(await ask('¿Me ayudas?', { en: 'Will you help me?' }))) return lines(['Bueno, si cambias de idea, aquí estoy.', 'OK, if you change your mind, I’m here.']);
  const orders = firstTime ? [0, 1, 2] : shuffled([0, 1, 2, 3, 4, 5]).slice(0, 3);
  G.save.restaurante = { round: 0, orders, heard: false };
  await lines(['¡Gracias! Empieza con la primera mesa, a la izquierda.', 'Thanks! Start with the first table, on the left.']);
}

const guest: ScriptFn = async (c) => {
  const shift = G.save.restaurante;
  const table = TABLES.indexOf(c.npc!.def.id);
  if (!shift || shift.round !== table) return lines(['¡Qué rico huele aquí!', 'It smells so good in here!']);
  const order = ORDERS[shift.orders[table]];
  await lines(['¡Hola! Ya sé qué quiero.', 'Hi! I know what I want.']);
  speak(order.say);
  await chooseText(`«${order.say}»`, '🎧 Remember the order, then tell the cook (behind the counter).', ['¡Muy bien, ya vuelvo!'], order.say);
  shift.heard = true;
};

async function cocinero() {
  const shift = G.save.restaurante;
  if (!shift || shift.round >= 3) return lines(['¡Aquí cocinamos el mejor pescado de la costa!', 'Here we cook the best fish on the coast!']);
  if (!shift.heard) return lines(['¿Qué pidió la mesa? Primero pregúntale.', 'What did the table order? Ask them first.']);
  const order = ORDERS[shift.orders[shift.round]];
  const item = adHocItem([order.say], order.en);
  const r = await challenge({
    item,
    mode: talkMode(),
    title: '🍽️ El pedido',
    label: `¿Qué pidió la mesa ${shift.round + 1}? Díselo al cocinero.`,
    allowHelp: false,
    validate: (answer) => gradeDish(answer, order.need),
  });
  if (r.grade === 'wrong') {
    shift.heard = false;
    return lines(['¿Qué pidió? No entiendo. Pregúntale otra vez.', 'What did they order? I don’t understand. Ask them again.']);
  }
  await lines(['¡Saliendo!', 'Coming right up!']);
  const firstTime = !flag('mesero3');
  const pay = firstTime ? FIRST_PAY[shift.round] : DAILY_PAY;
  shift.round++;
  shift.heard = false;
  if (firstTime) setFlag(`mesero${shift.round}`);
  G.save.money += pay;
  sfx('caught');
  await info(`¡La mesa está feliz! Ganaste ${money(pay)}.`, { en: `The table is happy! You earned ${money(pay)}.` });
  if (shift.round < 3) return;
  G.save.restauranteDia = today();
  if (firstTime) await gift('superpocion', 2, 'dos Superpociones', 'two Super Potions');
  await lines(['¡Eres el mejor mesero de la costa!', 'You’re the best waiter on the coast!']);
}

/** Don Lalo: a fishing lesson, then the rod. */
async function lalo() {
  if (flag('cana')) return lines(['¿Ya pescaste algo? ¡Prueba en el muelle!', 'Did you catch anything yet? Try the pier!'], ['¡Y saluda a mi hermano de mi parte!', 'And say hi to my brother for me!']);
  if (!flag('lalo')) {
    if (await ask('¡Hola! ¿Conoces a mi hermano? Vive en Pueblo Amanecer, al lado del lago.', { en: 'Hi! Do you know my brother? He lives in Pueblo Amanecer, by the lake.' })) {
      await lines(['¡Él me enseñó a pescar!', 'He taught me to fish!']);
    } else await lines(['Bueno, ¡ahora ya sabes que existe!', 'Well, now you know he exists!']);
    setFlag('lalo');
  }
  if (!(await ask('¿Quieres aprender a pescar? Te hago cuatro preguntas.', { en: 'Want to learn to fish? I’ll ask you four questions.' }))) return lines(['Cuando quieras, aquí estoy.', 'Whenever you want, I’m here.']);
  const words = ['la caña de pescar', 'el anzuelo', 'la carnada', 'picar'].map((es) => itemBySpanish(es)!).filter(Boolean);
  const finished = await drill(words, { title: (d, t) => `Pesca ${d + 1}/${t}` });
  if (!finished) return lines(['Bueno, seguimos otro día.', 'OK, we’ll continue another day.']);
  await lines(['¡Muy bien! Toma esta caña. Prueba en el muelle o en cualquier río.', 'Very good! Take this rod. Try it on the pier or in any river.']);
  addItem('cana');
  setFlag('cana');
  sfx('caught');
  await info('¡{name} recibió la Caña de pescar!', { en: '{name} received the Fishing rod!' });
  await lines(['¡Y saluda a mi hermano de mi parte!', 'And say hi to my brother for me!']);
}

/** The message in a bottle on Ruta 7: read it, and find the treasure in Playa Carey. */
async function botella() {
  await info('Hay una botella en la arena. Adentro hay un papel...', { en: 'There’s a bottle in the sand. Inside there’s a paper...' });
  const note = 'El tesoro está en Playa Carey, en la playa, al sur del muelle, al lado de la palmera.';
  speak(note);
  const right = 'Al sur del muelle, al lado de la palmera';
  const options = shuffled([right, 'En el faro', 'En el restaurante']);
  while (true) {
    const i = await chooseText(`«${note}» ¿Dónde está el tesoro?`, 'Read the note: where is the treasure?', options, note);
    if (options[i] === right) break;
    sfx('wrong');
    await lines(['Mmm, no. Lee el papel otra vez.', 'Hmm, no. Read the paper again.']);
  }
  sfx('right');
  setFlag('botellaLeida');
  refreshNpcs();
  await lines(['¡Hay un tesoro en Playa Carey!', 'There’s a treasure in Playa Carey!']);
}

async function tesoro() {
  sfx('caught');
  addItem('revivir');
  addItem('superbola', 2);
  setFlag('item:tesoro_carey');
  refreshNpcs();
  await info('¡Encontraste un tesoro! Un Revivir y dos Superbolas.', { en: 'You found a treasure! A Revive and two Super Balls.' });
}

// ---------- Gym 3: Marina's surf school ----------

async function marina() {
  if (flag('medalOla')) return lines(['¡Qué buena batalla! El mar siempre te va a recordar.', 'What a great battle! The sea will always remember you.']);
  await lines(
    ['¡Llegaste! Anoche fuiste muy valiente con las tortugas.', 'You made it! Last night you were very brave with the turtles.'],
    ['Pero en el agua, ¡yo soy la reina! Vas a ver: te voy a ganar.', 'But in the water, I’m the queen! You’ll see: I’m going to beat you.'],
  );
  if (!(await ask('¿Estás list{o/a}?', { en: 'Are you ready?' }))) return lines(['¡Las olas te esperan!', 'The waves are waiting for you!']);
  const res = await trainerBattle(TRAINERS.marina, { look: 'marina', outro: ['¡Me revolcó la ola! Bueno... la ola eras tú.', 'The wave knocked me over! Well... the wave was you.'] });
  if (res === 'lose') return blackout();
  setFlag('beat:marina');
  setFlag('medalOla');
  G.save.medals.push('Ola');
  fanfare('medalla', 'badge');
  await info('¡{name} recibió la Medalla Ola!', { en: '{name} received the Wave Medal!' });
  await lines(['Con esta medalla puedes ir al este, hacia el volcán. Dicen que en Ciudad Chispa preparan una gran fiesta.', 'With this medal you can go east, toward the volcano. They say Ciudad Chispa is preparing a big festival.']);
}

// ---------- Trainers ----------

const fight = (id: string, intro: Line, defeated: Line, after: Line): ScriptFn => () => trainerFight(id, { intro, defeated, after });

export const REGION3: Record<string, ScriptFn> = {
  lucasPlaya,
  voluntaria,
  voluntariaNoche,
  callada,
  duenoRestaurante,
  guest,
  cocinero,
  lalo,
  botella,
  tesoro,
  marina,
  maestra_carey: teacher(['direcciones', 'ira']),

  ramon: fight('ramon', ['¡Hola! Bajo a la costa a vender leña. ¿Luchamos en el camino?', 'Hi! I’m going down to the coast to sell firewood. A battle on the way?'], ['¡Me cortaste como a un pino!', 'You chopped me down like a pine!'], ['Abajo hace mucho calor. ¡Lleva agua!', 'It’s very hot down there. Bring water!']),
  laura: fight('laura', ['¿Vas al mar? ¡Yo también! Pero primero, una batalla.', 'Going to the sea? Me too! But first, a battle.'], ['¡Ay! Mejor sigo caminando.', 'Oh! I’d better keep walking.'], ['En el zacatal hay muchas Palabritas. ¡Es perfecto para entrenar!', 'There are lots of Palabritas in the meadow. It’s perfect for training!']),
  esteban: fight('esteban', ['¡Yija! Soy sabanero. Cuido el ganado en el llano. ¡A luchar!', 'Yee-haw! I’m a cowboy. I look after the cattle on the plain. Let’s battle!'], ['¡Me tumbaste del caballo!', 'You knocked me off my horse!'], ['El zacatal está seco ahora. En mayo empiezan las lluvias.', 'The meadow is dry now. The rains start in May.']),
  juana: fight('juana', ['¿Buscas un reto? ¡Mi Liebrón es el más rápido del llano!', 'Looking for a challenge? My Liebrón is the fastest on the plain!'], ['¡Más rápid{o/a} que una liebre!', 'Faster than a hare!'], ['Cuando hace calor, descanso debajo de un árbol.', 'When it’s hot, I rest under a tree.']),
  hugo: fight('hugo', ['¡Shh! Estoy mirando pájaros. ¡Bueno, una batalla rápida!', 'Shh! I’m watching birds. Well, a quick battle!'], ['Se fueron todos los pájaros...', 'All the birds flew away...'], ['Hoy vi tres colibríes y un guardabarranco. ¡Qué día!', 'Today I saw three hummingbirds and a guardabarranco. What a day!']),
  mario: fight('mario', ['Nadie cruza el puente sin luchar con Mario el pescador.', 'Nobody crosses the bridge without battling Mario the fisherman.'], ['Bueno, cruza. ¡Pero cuidado con el río!', 'OK, cross. But careful with the river!'], ['Con una caña de pescar, en este río sacas mojarras todo el día.', 'With a fishing rod, you catch mojarras in this river all day.']),
  andrea: fight('andrea', ['¡Ya casi llego al mar! ¿Luchamos antes?', 'I’m almost at the sea! Shall we battle first?'], ['¡Uf! Necesito un coco.', 'Phew! I need a coconut.'], ['Abajo hay palmeras. ¡Eso quiere decir que el mar está cerca!', 'There are palm trees down there. That means the sea is close!']),
  tono: fight('tono', ['¿Ves mis vacas? Bueno, no importa. ¡A luchar!', 'See my cows? Well, never mind. Let’s battle!'], ['¡Ni mis vacas corren tan rápido!', 'Not even my cows run that fast!'], ['La costa está a cinco minutos. ¡Huele a mar!', 'The coast is five minutes away. It smells like the sea!']),
  surfista1: fight('surfista1', ['¡Hey! ¿Viste esas olas? ¡Están perfectas! Primero, una batalla.', 'Hey! Did you see those waves? They’re perfect! First, a battle.'], ['¡Me revolcó la ola!', 'The wave tumbled me!'], ['Para surfear hay que tener paciencia y equilibrio.', 'To surf you need patience and balance.']),
  banista1: fight('banista1', ['¡No pasas por estas rocas sin luchar conmigo!', 'You don’t get past these rocks without battling me!'], ['¡Ay, se me mojó la toalla!', 'Oh, my towel got wet!'], ['Ponte bloqueador. ¡El sol de aquí quema mucho!', 'Put on sunscreen. The sun here burns a lot!']),
  pescador_r7: fight('pescador_r7', ['Hoy no pica nada. ¡Mejor una batalla!', 'Nothing’s biting today. A battle is better!'], ['Ni los peces ni las batallas...', 'Neither the fish nor the battles...'], ['Don Lalo, en Playa Carey, regala cañas a los buenos estudiantes.', 'Don Lalo, in Playa Carey, gives rods to good students.']),
  surfista2: fight('surfista2', ['¡Esta playa es mía! Bueno... de todos. Pero ¡lucha!', 'This beach is mine! Well... everyone’s. But battle!'], ['¡Me caí de la tabla!', 'I fell off the board!'], ['Marina es la mejor surfista del Pacífico. ¡Y la mejor líder!', 'Marina is the best surfer on the Pacific. And the best leader!']),
  banista2: fight('banista2', ['¿Quieres un agua de coco? ¡Primero gáname!', 'Want some coconut water? Beat me first!'], ['Toma, te la ganaste.', 'Here, you earned it.'], ['El agua de coco es dulce y fresca. ¡Me encanta!', 'Coconut water is sweet and fresh. I love it!']),
  turista_r7: fight('turista_r7', ['Hello! Bueno... ¡Hola! Estoy de vacaciones. ¿Luchamos?', 'Hello! Well... Hi! I’m on vacation. Shall we battle?'], ['¡Tu español es mejor que el mío!', 'Your Spanish is better than mine!'], ['Mañana voy a ver las tortugas. ¡Qué emoción!', 'Tomorrow I’m going to see the turtles. How exciting!']),
  silencioso8: fight('silencioso8', ['¡Shhh! Estos huevos valen mucho dinero.', 'Shhh! These eggs are worth a lot of money.'], ['¡Shhh! ¡Perdí!', 'Shhh! I lost!'], ['Callada se va a enojar...', 'Callada is going to be angry...']),
  silencioso9: fight('silencioso9', ['Las tortugas no necesitan tantos huevos. ¡Shhh!', 'Turtles don’t need so many eggs. Shhh!'], ['¡Ay! Hablé demasiado.', 'Oh! I talked too much.'], ['Callada está junto a la orilla. ¡Shhh!', 'Callada is by the shore. Shhh!']),
  silencioso10: fight('silencioso10', ['¡Callada nos va a castigar si perdemos!', 'Callada is going to punish us if we lose!'], ['¡Nos va a castigar!', 'She’s going to punish us!'], ['...Shhh.', '...Shhh.']),
  surfista_gym: fight('surfista_gym', ['¡Bienvenid{o/a} a la escuela de surf! ¿Sabes nadar?', 'Welcome to the surf school! Can you swim?'], ['¡Me caí de la tabla!', 'I fell off the board!'], ['Si la corriente te lleva mal, vuelves al principio. ¡Mira bien las flechas!', 'If a current takes you the wrong way, you go back to the start. Watch the arrows!']),
  salvavidas: fight('salvavidas', ['Soy salvavidas. ¡Cuido a todos en la playa!', 'I’m a lifeguard. I look after everyone on the beach!'], ['¡Necesito un salvavidas!', 'I need a life jacket!'], ['Marina salvó a tres turistas el año pasado.', 'Marina saved three tourists last year.']),
  banista_gym: fight('banista_gym', ['Marina está justo ahí. ¡Pero primero yo!', 'Marina is right there. But me first!'], ['¡Vas a ganarle, ya verás!', 'You’re going to beat her, you’ll see!'], ['Las Palabritas de Marina son de tipo Agua. ¡Usa plantas o electricidad!', 'Marina’s Palabritas are Water type. Use plants or electricity!']),

  // ---------- People ----------
  lucas_playa: talk(['¡La próxima vez te gano!', 'Next time I’ll beat you!']),
  marinaNoche: () => lines(...(flag('beat:callada') ? [['¡Las tortuguitas! ¡Guíalas al mar!', 'The baby turtles! Guide them to the sea!'] as Line] : [['Hay que detener a Callada. ¡Yo cuido los nidos!', 'We have to stop Callada. I’ll guard the nests!'] as Line])),
  nido: talk(['Un nido de tortuga. Los huevos están calientitos en la arena.', 'A turtle nest. The eggs are nice and warm in the sand.']),
  tortuguita: talk(['¡Es una tortuguita! Mira hacia el mar.', 'It’s a baby turtle! It’s looking toward the sea.']),
  panga: talk(['Una panga de pescadores. Huele a pescado.', 'A fishermen’s boat. It smells like fish.']),
  voluntario2: talk(['Cada nido tiene unos cien huevos.', 'Each nest has about a hundred eggs.'], ['Solo una de cada mil tortuguitas llega a ser adulta. ¡Por eso las cuidamos!', 'Only one in a thousand baby turtles grows up. That’s why we look after them!']),
  farero: talk(['El faro guía a los barcos de noche. ¡Y a las tortugas también!', 'The lighthouse guides the ships at night. And the turtles too!']),
  pescadora_muelle: beforeAfter(
    [['¿Ves esas pangas? Salen al mar a las cuatro de la mañana.', 'See those boats? They go out to sea at four in the morning.']],
    [['Gracias por cuidar la playa. Sin tortugas, el mar no es el mismo.', 'Thanks for looking after the beach. Without turtles, the sea isn’t the same.']],
  ),
  surfista_pueblo: talk(['¡Las olas de aquí son perfectas para aprender a surfear!', 'The waves here are perfect for learning to surf!']),
  nina_carey: beforeAfter(
    [['¿Sabías que las tortugas vuelven a la playa donde nacieron?', 'Did you know turtles come back to the beach where they were born?']],
    [['¡Vi las tortuguitas en la tele! ¡Dicen que tú las ayudaste!', 'I saw the little turtles on TV! They say you helped them!']],
  ),
  abuela_carey: talk(['Mi abuelo pescaba tiburones en el lago. ¡Tiburones en agua dulce!', 'My grandfather fished sharks in the lake. Sharks in fresh water!']),
  guia_carey: talk(
    ['¡Las corrientes te llevan solas! Mira bien las flechas antes de saltar.', 'The currents carry you by themselves! Look at the arrows carefully before you jump.'],
    ['Marina usa Palabritas de tipo Agua. Las plantas y la electricidad son muy eficaces.', 'Marina uses Water types. Plants and electricity are super effective.'],
  ),
};

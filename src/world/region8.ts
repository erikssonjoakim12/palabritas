import { info } from '../ui/textbox';
import { talk, fight, gymLeader, lines } from './flows';
import { TOWN8 } from './maps/region8';
import type { ScriptFn } from './world';

/*
  Region 8 (plans/region7-8.md): Ciudad Ceniza, the old capital in the lava. Behind its boulders (Strength), the lava
  fields' trainers, the ruined church and its storyteller, and gym 8: Doña Aurora's archive (Dragón).
*/

/** The historian of the old capital: gym 8 (Dragón). */
async function aurora() {
  const won = await gymLeader('aurora', {
    medal: ['Ceniza', 'Ash'],
    intro: [
      ['Bienvenid{o/a} al archivo, {name}. Aquí guardamos la memoria de la ciudad antigua.', 'Welcome to the archive, {name}. Here we keep the memory of the ancient city.'],
      ['Soy Aurora. Llevo cuarenta años leyendo lo que la lava no pudo quemar.', 'I’m Aurora. I’ve spent forty years reading what the lava couldn’t burn.'],
      ['Y aprendí que las palabras duran más que las piedras. ¿Las tuyas también?', 'And I learned that words last longer than stones. Do yours too?'],
    ],
    ready: ['¿Quieres escribir tu nombre en la historia de esta ciudad?', 'Do you want to write your name in this city’s history?'],
    notReady: ['La historia sabe esperar. Yo también.', 'History knows how to wait. So do I.'],
    go: ['Entonces despierta, Emplumón. ¡Hay alguien que quiere conocer la leyenda!', 'Then wake up, Emplumón. Someone wants to meet the legend!'],
    outro: ['Increíble... Escribiré esta batalla en el libro de la ciudad.', 'Incredible... I’ll write this battle in the city’s book.'],
    handOver: [['Te ganaste la Medalla Ceniza. Es tan antigua como estas piedras.', 'You’ve earned the Ash Medal. It’s as old as these stones.']],
    after: [
      ['Ocho medallas. Pocas personas han llegado tan lejos, {name}.', 'Eight medals. Few people have come this far, {name}.'],
      ['Dicen que los mejores entrenadores del país te esperan al otro lado del mar.', 'They say the best trainers in the country are waiting for you on the other side of the sea.'],
      ['Pero esa es otra historia. Hoy, descansa: te lo ganaste.', 'But that’s another story. Today, rest: you’ve earned it.'],
    ],
    beaten: [['Cada día escribo un poco más de tu historia. ¡Ya llevo tres páginas!', 'Every day I write a little more of your story. I’m already on page three!']],
  });
  if (!won) return;
  await info('¡Felicidades! Terminaste la octava parte de Palabritas.', { en: 'Congratulations! You finished the eighth part of Palabritas.' });
  await info('Sigue entrenando a tus Palabritas y atrapando nuevas. ¡Pronto habrá más aventuras!', { en: 'Keep training your Palabritas and catching new ones. More adventures are coming soon!' });
}

/** The storyteller by the ruined church: the legend of the feathered serpent and the year the lava came. */
async function abuelaCeniza() {
  await lines(
    ['¿Quieres oír una leyenda? Siéntate, que es larga.', 'Do you want to hear a legend? Sit down, it’s a long one.'],
    ['Hace más de cuatrocientos años, esta era la capital. Había iglesia, plaza y mercado.', 'More than four hundred years ago, this was the capital. There was a church, a square and a market.'],
    ['Un día, en 1610, la tierra tembló y el volcán despertó. La lava bajó por las calles.', 'One day, in 1610, the earth shook and the volcano woke up. The lava came down the streets.'],
    ['Dicen que una serpiente con plumas verdes voló sobre la ciudad y avisó a todos.', 'They say a snake with green feathers flew over the city and warned everyone.'],
    ['Nadie se quedó atrás. La gente se fue a construir una ciudad nueva... y la vieja se quedó dormida.', 'Nobody was left behind. The people went to build a new city... and the old one fell asleep.'],
    ['Si ves una culebrita con plumas entre las ruinas, salúdala de mi parte.', 'If you see a little feathered snake among the ruins, say hello to it from me.'],
  );
}

export const REGION8: Record<string, ScriptFn> = {
  // ----- The lava fields -----
  bombero_julio: fight(
    'bombero_julio',
    ['¡Alto! Soy bombero. Por aquí no se pasa sin una prueba de valor.', 'Stop! I’m a firefighter. Nobody goes through here without a test of courage.'],
    ['¡Apagaste mi fuego!', 'You put out my fire!'],
    ['Si alguna vez ves humo en las casas, avísame. Para eso estamos.', 'If you ever see smoke in the houses, tell me. That’s what we’re here for.'],
  ),
  vulcanologa_eva: fight(
    'vulcanologa_eva',
    ['Mido la temperatura de la lava vieja. ¡Todavía está tibia, después de cuatrocientos años!', 'I measure the old lava’s temperature. It’s still warm, after four hundred years!'],
    ['Mis números no mienten: ganaste tú.', 'My numbers don’t lie: you won.'],
    ['Las salamandras duermen en las grietas calientes. Se nota que les gusta.', 'The salamanders sleep in the warm cracks. You can tell they like it.'],
  ),
  arqueologo_saul: fight(
    'arqueologo_saul',
    ['¡Encontré una campana debajo de la lava! Bueno, casi. ¿Una batalla mientras tanto?', 'I found a bell under the lava! Well, almost. A battle in the meantime?'],
    ['Bueno, seguiré excavando.', 'Well, I’ll keep digging.'],
    ['Cada piedra de esta ciudad tiene una historia.', 'Every stone in this city has a story.'],
  ),
  excursionista_pili: fight(
    'excursionista_pili',
    ['¡Entré empujando una roca! ¿Tú también? ¡Entonces eres fuerte!', 'I got in by pushing a boulder! You too? Then you’re strong!'],
    ['Sí, eres fuerte. Muy fuerte.', 'Yes, you’re strong. Very strong.'],
    ['Me gustan los retos. Por eso vine hasta aquí.', 'I like challenges. That’s why I came all the way here.'],
  ),
  guardaparque_nestor: fight(
    'guardaparque_nestor',
    ['Cuido los campos de lava. Hay que tener cuidado: el suelo está caliente.', 'I look after the lava fields. You have to be careful: the ground is hot.'],
    ['Buena batalla. Tienes los pies firmes.', 'Good battle. You keep your feet steady.'],
    ['Del río suben los lagartos a tomar el sol en las rocas negras.', 'The caimans come up from the river to sunbathe on the black rocks.'],
  ),
  cronista_amalia: fight(
    'cronista_amalia',
    ['Escribo la crónica de la ciudad. Tu batalla será el capítulo de hoy.', 'I write the city’s chronicle. Your battle will be today’s chapter.'],
    ['Capítulo de hoy: «La gran victoria de {name}».', 'Today’s chapter: “{name}’s great victory.”'],
    ['Doña Aurora, la líder del gimnasio, fue mi maestra.', 'Doña Aurora, the gym leader, was my teacher.'],
  ),

  // ----- The town -----
  abuela_ceniza: abuelaCeniza,
  nina_ceniza: talk(
    ['¡Mi casa está construida sobre la lava! Cuando llueve, el suelo echa vapor.', 'My house is built on the lava! When it rains, the ground steams.'],
  ),
  vecino_ceniza: talk(
    [`${TOWN8} se quedó vacía cuatrocientos años. Ahora volvimos unas pocas familias.`, `${TOWN8} stayed empty for four hundred years. Now a few families have come back.`],
    ['Nadie entra sin mover las rocas de la entrada. Así estamos tranquilos.', 'Nobody gets in without moving the boulders at the entrance. That way it’s peaceful here.'],
  ),
  viajero_ceniza: talk(
    ['Llegué en bote por el río, y tuve que empujar una roca para entrar. ¡Menos mal que mi Palabrita es fuerte!', 'I came by boat up the river, and I had to push a boulder to get in. Good thing my Palabrita is strong!'],
  ),
  senora_ceniza: talk(
    ['En las paredes de mi casa hay piedras de la iglesia vieja. Aquí todo se aprovecha.', 'There are stones from the old church in the walls of my house. Here everything gets used.'],
  ),
  abuelo_ceniza: talk(
    ['Mi abuelo decía: si el volcán ruge, no corras; camina rápido y no mires atrás.', 'My grandpa used to say: if the volcano roars, don’t run; walk quickly and don’t look back.'],
  ),
  guia_ceniza: talk(
    ['¡Hola! Te doy un consejo: los dragones resisten el fuego, el agua, las plantas y la electricidad.', 'Hi! Here’s a tip: dragons resist fire, water, plants and electricity.'],
    ['Pero un dragón contra otro dragón... ¡eso sí duele!', 'But one dragon against another dragon... that really hurts!'],
  ),
  historiadora_clara: fight(
    'historiadora_clara',
    ['Silencio, por favor: estás en un archivo. Bueno... una batalla sí está permitida.', 'Quiet, please: you’re in an archive. Well... a battle is allowed.'],
    ['Lo apuntaré en el libro de visitas.', 'I’ll note it in the visitors’ book.'],
    ['Las leyendas de esta ciudad llenan tres estantes enteros.', 'This city’s legends fill three whole shelves.'],
  ),
  restaurador_efren: fight(
    'restaurador_efren',
    ['Restauro libros quemados, página por página. ¡Tengo mucha paciencia!', 'I restore burned books, page by page. I have a lot of patience!'],
    ['Paciencia sí tengo. Suerte, hoy no.', 'Patience I have. Luck, not today.'],
    ['Doña Aurora sabe leer hasta las páginas más quemadas.', 'Doña Aurora can read even the most burned pages.'],
  ),
  archivera_luz: fight(
    'archivera_luz',
    ['Cada libro está en su lugar. ¿Y tú? ¿Sabes cuál es tu lugar?', 'Every book is in its place. And you? Do you know what your place is?'],
    ['Tu lugar es... adelante. Pasa.', 'Your place is... ahead. Go on.'],
    ['El Emplumón de Doña Aurora es tan viejo como la leyenda.', 'Doña Aurora’s Emplumón is as old as the legend.'],
  ),
  aurora,
};

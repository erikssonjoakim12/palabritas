import { talk, fight, gymLeader } from './flows';
import { TOWN7 } from './maps/region7';
import type { ScriptFn } from './world';

/*
  Region 7 (plans/region7-8.md): Ruta 11 through the rainy cloud forest, and Puerto Rayo on its stormy lake. Gym 7 is
  the lighthouse keeper's house: Trueno's Eléctrico team, and the Medalla Rayo, the 7th: with it, Strength.
*/

/** The lighthouse keeper: gym 7 (Eléctrico). */
const trueno = () =>
  gymLeader('trueno', {
    medal: ['Rayo', 'Lightning'],
    intro: [
      ['¡Ahoy, {name}! Pasa, pasa, que afuera llueve a cántaros.', 'Ahoy, {name}! Come in, come in, it’s pouring outside.'],
      ['Soy Trueno, el farero. Cuido la luz que guía a los barcos cuando hay tormenta.', 'I’m Trueno, the lighthouse keeper. I look after the light that guides the boats when there’s a storm.'],
      ['Y la tormenta me enseñó una cosa: la energía hay que usarla bien, o te quema.', 'And the storm taught me one thing: energy has to be used well, or it burns you.'],
    ],
    ready: ['¿Estás list{o/a} para la tormenta?', 'Are you ready for the storm?'],
    notReady: ['Bien pensado. Con este tiempo, nadie sale sin paraguas.', 'Good thinking. In this weather, nobody goes out without an umbrella.'],
    go: ['¡Que caigan los rayos!', 'Let the lightning strike!'],
    outro: ['¡Qué tormenta! Hace años que nadie me apagaba la luz así.', 'What a storm! It’s been years since anyone put my light out like that.'],
    handOver: [['Te ganaste la Medalla Rayo. Brilla como el faro en la noche.', 'You’ve earned the Lightning Medal. It shines like the lighthouse at night.']],
    after: [
      ['Con siete medallas, tus Palabritas más fuertes pueden mover rocas enormes.', 'With seven medals, your strongest Palabritas can move huge boulders.'],
      ['Elige FUERZA en el menú de tus Palabritas, o habla con una roca, y empújala caminando.', 'Choose FUERZA in your Palabritas menu, or talk to a boulder, and push it by walking.'],
      ['Dicen que junto al volcán hay una ciudad antigua, cerrada por las rocas de la lava. Nadie ha entrado en años.', 'They say there’s an ancient city by the volcano, closed off by the lava’s boulders. Nobody has gone in for years.'],
    ],
    beaten: [['Cuando hay tormenta, enciendo el faro y pienso en nuestra batalla.', 'When there’s a storm, I light the lighthouse and think about our battle.']],
  });

export const REGION7: Record<string, ScriptFn> = {
  // ----- Ruta 11 -----
  excursionista_hugo: fight(
    'excursionista_hugo',
    ['¡Qué lluvia! Pero un buen excursionista nunca se queda en casa.', 'What rain! But a good hiker never stays home.'],
    ['¡Uf! Estoy empapado... y derrotado.', 'Phew! I’m soaked... and beaten.'],
    ['Si sigues el camino hacia el este, llegas al lago de las tormentas.', 'If you follow the path east, you reach the lake of storms.'],
  ),
  ornitologa_irene: fight(
    'ornitologa_irene',
    ['¡Shh! Estoy esperando a un quetzal. Bueno... mientras tanto, ¡luchemos!', 'Shh! I’m waiting for a quetzal. Well... in the meantime, let’s battle!'],
    ['¡Ay! Y el quetzal todavía no viene.', 'Oh! And the quetzal still isn’t here.'],
    ['Con la lluvia, los pájaros se esconden. Hay que tener paciencia.', 'In the rain, the birds hide. You have to be patient.'],
  ),
  campista_leo: fight(
    'campista_leo',
    ['Mi tienda de campaña se mojó toda. ¡Por lo menos tengo ganas de pelear!', 'My tent got all wet. At least I feel like battling!'],
    ['Perdí la batalla y la tienda. ¡Qué día!', 'I lost the battle and the tent. What a day!'],
    ['Mañana vuelvo a intentarlo. Con sol, espero.', 'Tomorrow I’ll try again. With sun, I hope.'],
  ),
  pintora_luisa: fight(
    'pintora_luisa',
    ['Pinto la lluvia. ¿Sabes lo difícil que es pintar algo que se mueve?', 'I paint the rain. Do you know how hard it is to paint something that moves?'],
    ['Mi cuadro se mojó... pero me gusta cómo quedó.', 'My painting got wet... but I like how it turned out.'],
    ['A veces los errores son los mejores cuadros.', 'Sometimes mistakes are the best paintings.'],
  ),
  guardaparque_tono: fight(
    'guardaparque_tono',
    ['Cuido este bosque. Y a los que pasan por él los pongo a prueba.', 'I look after this forest. And I test the ones who come through it.'],
    ['Pasaste la prueba. El bosque está en buenas manos.', 'You passed the test. The forest is in good hands.'],
    ['El río baja hasta el lago. Allá abajo está ' + TOWN7 + '.', 'The river runs down to the lake. Down there is ' + TOWN7 + '.'],
  ),
  fotografa_nora: fight(
    'fotografa_nora',
    ['¡Quiero una foto de un rayo! Mientras espero... ¿una batalla?', 'I want a photo of a lightning bolt! While I wait... a battle?'],
    ['¡Click! Esa foto de tu victoria quedó perfecta.', 'Click! That photo of your victory came out perfect.'],
    ['Los rayos son rápidos. Hay que estar list{o/a} siempre.', 'Lightning is fast. You always have to be ready.'],
  ),

  // ----- Puerto Rayo: the lake -----
  nadador_kiko: fight(
    'nadador_kiko',
    ['¡Con lluvia o sin lluvia, yo nado todos los días!', 'Rain or no rain, I swim every day!'],
    ['¡Glub! Me tragué medio lago.', 'Glub! I swallowed half the lake.'],
    ['Cuidado con los lagartos. Parecen troncos, pero no lo son.', 'Watch out for the caimans. They look like logs, but they aren’t.'],
  ),
  nadadora_vale: fight(
    'nadadora_vale',
    ['¡Nado de isla en isla! ¿Me alcanzas?', 'I swim from island to island! Can you catch me?'],
    ['¡Eres más rápid{o/a} que una tijereta!', 'You’re faster than a frigatebird!'],
    ['Desde el agua, el faro se ve precioso de noche.', 'From the water, the lighthouse looks beautiful at night.'],
  ),
  pescador_ruben: fight(
    'pescador_ruben',
    ['En esta isla nadie me molesta... ¡hasta ahora!', 'On this island nobody bothers me... until now!'],
    ['Se me escapó el pez y la batalla.', 'Both the fish and the battle got away from me.'],
    ['Un lagarto viejo vive bajo mi isla. Me da consejos cuando no pican los peces.', 'An old caiman lives under my island. It gives me advice when the fish aren’t biting.'],
  ),
  pescadora_rayo: talk(
    ['Aquí llueve casi todos los días. Las casas están en las islas, y nos movemos por los puentes.', 'It rains here almost every day. The houses are on the islands, and we get around on the bridges.'],
    ['Si nadas con una Palabrita, cuidado: en el lago viven los lagartos.', 'If you swim with a Palabrita, careful: the caimans live in the lake.'],
  ),
  nino_rayo: talk(
    ['¡El farero Trueno es el líder del gimnasio! Habla por la radio con los barcos.', 'Trueno the lighthouse keeper is the gym leader! He talks to the boats on the radio.'],
    ['Sus Palabritas son eléctricas. ¡Una vez apagó todas las luces del pueblo!', 'His Palabritas are electric. Once he turned off all the lights in town!'],
  ),
  vecino_rayo: talk(
    [`Bienvenid{o/a} a ${TOWN7}. Las tormentas vienen del lago y se van al volcán.`, `Welcome to ${TOWN7}. The storms come from the lake and go off to the volcano.`],
    ['El muelle lleva a las islas. ¡No te resbales!', 'The pier leads to the islands. Don’t slip!'],
  ),
  viajera_rayo: talk(
    ['Al sur de las islas hay un camino que baja hasta la Ruta 3, cerca de Ciudad Brisa.', 'South of the islands there’s a path that goes down to Route 3, near Ciudad Brisa.'],
    ['Hay un saltito que solo se baja. Para subir, hay que cortar el arbolito de al lado.', 'There’s a little ledge you can only jump down. To come up, you have to cut the little tree beside it.'],
  ),
  pescador_casa_rayo: talk(
    ['Mi abuelo construyó esta casa sobre el agua. Cuando hay tormenta, se mueve un poquito.', 'My grandpa built this house over the water. When there’s a storm, it moves a little.'],
  ),
  abuela_rayo: talk(
    ['Antes llegábamos aquí en bote. Ahora los jóvenes vuelan con sus Palabritas.', 'Before, we came here by boat. Now the young people fly with their Palabritas.'],
    ['Yo prefiero el bote. ¡Y una hamaca!', 'I prefer the boat. And a hammock!'],
  ),
  guia_rayo: talk(
    ['¡Hola! Te doy un consejo: las Palabritas eléctricas no le hacen nada a las de tipo Tierra.', 'Hi! Here’s a tip: Electric Palabritas do nothing to Ground types.'],
    ['El equipo del farero se defiende escuchando. ¡Abre bien los oídos!', 'The lighthouse keeper’s crew defends by listening. Keep your ears open!'],
  ),
  electricista_rolando: fight(
    'electricista_rolando',
    ['Yo arreglo los cables del faro. ¿Sabes cuánta electricidad hay aquí?', 'I fix the lighthouse’s cables. Do you know how much electricity there is in here?'],
    ['¡Cortocircuito!', 'Short circuit!'],
    ['El farero es muy fuerte. Su Dantón es como una tormenta.', 'The lighthouse keeper is very strong. His Dantón is like a storm.'],
  ),
  meteorologa_ines: fight(
    'meteorologa_ines',
    ['Pronóstico de hoy: lluvia, viento... ¡y una derrota para ti!', 'Today’s forecast: rain, wind... and a defeat for you!'],
    ['Mi pronóstico falló. Pasa a menudo.', 'My forecast was wrong. It happens often.'],
    ['Mañana: nublado, con probabilidad de revancha.', 'Tomorrow: cloudy, with a chance of a rematch.'],
  ),
  marinera_paz: fight(
    'marinera_paz',
    ['¡Todos a bordo! Esta batalla va a ser movida.', 'All aboard! This battle is going to be rough.'],
    ['¡Hombre al agua! Bueno... mujer al agua.', 'Man overboard! Well... woman overboard.'],
    ['El capitán, digo, el farero, te espera arriba.', 'The captain, I mean, the lighthouse keeper, is waiting for you upstairs.'],
  ),
  trueno,
};

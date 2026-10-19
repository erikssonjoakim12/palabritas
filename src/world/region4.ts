import { flag } from '../game/state';
import type { ScriptFn } from './world';
import type { Line } from './maps';
import { lines, trainerFight } from './scripts';
import { teacher } from './school';

/*
  Region 4: the volcanoes and dry forest (plans/phase4-region4.md). Ruta 8 east from Playa Carey, Ciudad Chispa
  (getting ready for its festival), the Volcán Chocoyo, and Ruta 9 home to Pueblo Amanecer.
  Built in stages: the trainers and people here; the story (the stolen fireworks, Lucas #3, Don Sigilo, the
  festival, Don Tizón's torches) and the side quests come next.
*/

const talk = (...ls: Line[]): ScriptFn => () => lines(...ls);
const fight = (id: string, intro: Line, defeated: Line, after: Line): ScriptFn => () => trainerFight(id, { intro, defeated, after });

export const REGION4: Record<string, ScriptFn> = {
  // ---------- Trainers ----------
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
  hamaquera: talk(['¡Hamacas, hamacas! Hechas a mano aquí en Ciudad Chispa.', 'Hammocks, hammocks! Handmade here in Ciudad Chispa.']),
  mascarero: talk(['Máscaras de toro, de venado, de diablito... ¡Para el desfile del Torovenado!', 'Bull masks, deer masks, little devil masks... For the Torovenado parade!']),
  fritanguera: talk(['¿Un vigorón? Yuca, chicharrón y ensalada de repollo. ¡Riquísimo!', 'A vigorón? Cassava, pork rinds and cabbage salad. Delicious!']),
  senora_azul: talk(['Esta semana son las fiestas patronales. ¡Me encanta mi vestido azul!', 'This week is the patron saint festival. I love my blue dress!']),
  nino_plaza: talk(['¡Esta noche hay cohetes! ¡Bum, bum, bum!', 'Tonight there are rockets! Boom, boom, boom!']),
  hija_tizon: talk(['Mi papá hace los mejores cohetes de Nicaragua. ¡Cuando explotan parecen flores!', 'My dad makes the best rockets in Nicaragua. When they burst they look like flowers!']),
  dueno_embrujada: talk(['Mi casa vieja está embrujada. De noche se mueven los muebles... ¡y una lámpara llora!', 'My old house is haunted. At night the furniture moves... and a lamp cries!']),
  sacristan: talk(['Bienvenid{o/a} a la iglesia. Las campanas suenan todos los domingos.', 'Welcome to the church. The bells ring every Sunday.']),
  maestro_chispa: teacher(['compras', 'pasado']),
  nina_escuela_chispa: talk(['En el mercado siempre pido un descuento. ¡Es parte de la diversión!', 'At the market I always ask for a discount. It’s part of the fun!']),
  alumno_chispa: talk(['Ayer fui al volcán con mi papá. ¡Vimos mucho humo!', 'Yesterday I went to the volcano with my dad. We saw lots of smoke!']),
  elsa: talk(['Soy Elsa, guardaparque del volcán. ¿Estás cansad{o/a}? Descansa un poco en la cama.', 'I’m Elsa, the volcano’s park ranger. Are you tired? Rest a bit on the bed.']),
  abuelo_leyenda: () =>
    lines(
      flag('leyenda')
        ? ['De noche, si oyes una carreta... ¡no salgas a la calle!', 'At night, if you hear a cart... don’t go out into the street!']
        : ['Este camino es muy viejo. Mi abuelo me contaba leyendas de aquí.', 'This road is very old. My grandfather used to tell me legends from here.'],
    ),
};

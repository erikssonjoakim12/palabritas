import type { ThemeSource } from './index';

// Weather (and "tiempo" also means time!).
export const tiempo: ThemeSource = {
  id: 'tiempo',
  name: 'El tiempo',
  en: 'Weather',
  tiers: {
    2: ['la lluvia = the rain', 'el sol = the sun', 'la nube = the cloud'],
    3: ['el agua = the water', 'el viento = the wind', 'la nieve = the snow'],
    4: ['el cielo = the sky', 'la gota = the drop', 'el río = the river'],
    5: ['llover = to rain', 'nevar = to snow', 'brillar = to shine'],
    6: ['frío = cold', 'caliente = hot', 'mojado = wet'],
    7: ['Hace sol = It’s sunny', 'Hace frío = It’s cold', 'Hace calor = It’s hot', 'Hace viento = It’s windy'],
    8: [
      'Está lloviendo | Llueve = It’s raining',
      'Está nublado = It’s cloudy',
      'Está nevando | Nieva = It’s snowing',
      'Hay tormenta = There’s a storm',
    ],
    9: ['el paraguas = the umbrella', 'el relámpago = the lightning', 'el trueno = the thunder', 'el arcoíris = the rainbow'],
    10: [
      '¿Qué tiempo hace? = What’s the weather like?',
      'Hoy hace buen tiempo = The weather is nice today',
      'Hace mal tiempo = The weather is bad',
      'Mañana va a llover = Tomorrow it’s going to rain',
    ],
    11: ['la primavera = the spring', 'el verano = the summer', 'el otoño = the autumn', 'el invierno = the winter'],
    12: [
      'Llevo un paraguas = I’m carrying an umbrella',
      'Me mojé con la lluvia = I got wet in the rain',
      'La tormenta da miedo = The storm is scary',
      'El sol sale a las seis = The sun rises at six',
    ],
    13: [
      'Cuando llueve, me quedo en casa = When it rains, I stay home',
      'En invierno hace mucho frío = In winter it’s very cold',
      'Las nubes cubren el cielo = The clouds cover the sky',
      'Después de la lluvia sale el arcoíris = After the rain the rainbow comes out',
      'El viento mueve los árboles = The wind moves the trees',
    ],
    14: [
      'Ayer llovió todo el día = Yesterday it rained all day',
      'Anoche hubo una tormenta = Last night there was a storm',
      'Está empezando a llover = It’s starting to rain',
      'Creo que va a nevar = I think it’s going to snow',
      'Hace más calor que ayer = It’s hotter than yesterday',
    ],
    15: [
      'Cuando era niño, nevaba mucho | Cuando era niña, nevaba mucho = When I was a child, it snowed a lot',
      'El río creció por la lluvia = The river rose because of the rain',
      'Si llueve mañana, no iremos a la playa = If it rains tomorrow, we won’t go to the beach',
      'La tormenta duró toda la noche = The storm lasted all night',
      'Ojalá haga sol el sábado = I hope it’s sunny on Saturday',
    ],
  },
};

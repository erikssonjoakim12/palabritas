import type { ThemeSource } from './index';

// Talking to and about dogs.
export const perro: ThemeSource = {
  id: 'perro',
  name: 'El perro',
  en: 'Dogs',
  tiers: {
    2: ['el perro = the dog', 'el perrito | el cachorro = the puppy', 'el hueso = the bone'],
    3: ['la cola = the tail', 'la pata = the paw', 'la oreja = the ear'],
    4: ['ladrar = to bark', 'correr = to run', 'jugar = to play'],
    5: ['la correa = the leash', 'la pelota = the ball', 'la comida = the food'],
    6: ['bueno = good', 'grande = big', 'pequeño | chico = small'],
    7: [
      '¡Ven! | ¡Ven aquí! = Come! (to a dog)',
      '¡Siéntate! = Sit!',
      '¡Quieto! = Stay!',
      '¡Buen perro! = Good dog!',
    ],
    8: [
      'El perro es grande = The dog is big',
      'La perrita es pequeña = The (female) puppy is small',
      'El perro tiene hambre = The dog is hungry',
      'El perro tiene sed = The dog is thirsty',
    ],
    9: ['peludo = furry', 'juguetón = playful', 'cariñoso = affectionate', 'travieso = naughty'],
    10: [
      'Tengo un perro = I have a dog',
      '¿Tienes perro? | ¿Tienes un perro? = Do you have a dog?',
      'Mi perro se llama Max = My dog is called Max',
      '¿Cómo se llama tu perro? = What is your dog called?',
    ],
    11: [
      'El perro mueve la cola = The dog wags its tail',
      'El perro ladra mucho = The dog barks a lot',
      'El perro duerme en su cama = The dog sleeps in its bed',
      'El perro come dos veces al día = The dog eats twice a day',
    ],
    12: [
      '¡Dame la pata! = Give me your paw!',
      '¡Suelta la pelota! = Drop the ball!',
      '¡Acuéstate! = Lie down!',
      '¡No muerdas! = Don’t bite!',
    ],
    13: [
      'Saco a pasear al perro | Paseo al perro = I take the dog for a walk',
      'Le doy de comer al perro = I feed the dog',
      'Voy a bañar al perro = I’m going to give the dog a bath',
      'Le pongo la correa = I put the leash on it',
      'El perro necesita agua fresca = The dog needs fresh water',
    ],
    14: [
      'El perro está jugando en el parque = The dog is playing in the park',
      'El perro está durmiendo = The dog is sleeping',
      'Mi perro es más grande que tu gato = My dog is bigger than your cat',
      'El cachorro aprende rápido = The puppy learns quickly',
      'Hay que cepillarle el pelo = You have to brush its fur',
    ],
    15: [
      'Ayer el perro corrió en la playa = Yesterday the dog ran on the beach',
      'El perro se escapó del jardín = The dog escaped from the garden',
      'Lo llevé al veterinario = I took him to the vet',
      'El perro me esperó en la puerta = The dog waited for me at the door',
      'Encontré la pelota debajo del sofá = I found the ball under the sofa',
    ],
  },
};

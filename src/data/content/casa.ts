import type { ThemeSource } from './index';

// The home: furniture, softness, cleaning.
export const casa: ThemeSource = {
  id: 'casa',
  name: 'La casa',
  en: 'The home',
  tiers: {
    2: ['la casa = the house', 'la silla = the chair', 'la mesa = the table'],
    3: ['el sillón = the armchair', 'el sofá = the sofa', 'la cama = the bed'],
    4: ['la almohada = the pillow', 'el cojín = the cushion', 'la cobija | la manta = the blanket'],
    5: ['la puerta = the door', 'la ventana = the window', 'el cuarto | la habitación = the room'],
    6: ['suave = soft', 'cómodo = comfortable', 'esponjoso = fluffy'],
    7: ['la cocina = the kitchen', 'el baño = the bathroom', 'la sala = the living room', 'el piso = the floor'],
    8: [
      'El sillón es cómodo = The armchair is comfortable',
      'La almohada es suave = The pillow is soft',
      'La casa es grande = The house is big',
      'El cojín es esponjoso = The cushion is fluffy',
    ],
    9: ['limpio = clean', 'sucio = dirty', 'la mancha = the stain', 'el jabón = the soap'],
    10: ['limpiar = to clean', 'barrer = to sweep', 'lavar = to wash', 'sentarse = to sit down'],
    11: [
      'Me siento en el sillón = I sit in the armchair',
      'El gato duerme en el cojín = The cat sleeps on the cushion',
      'Abro la ventana = I open the window',
      'Cierro la puerta = I close the door',
    ],
    12: [
      'Hay una mancha en el sofá = There’s a stain on the sofa',
      'Limpio la mancha con agua y jabón = I clean the stain with soap and water',
      'Barro el piso = I sweep the floor',
      'Lavo las cobijas = I wash the blankets',
    ],
    13: [
      'Mi casa tiene tres cuartos = My house has three rooms',
      'El sofá está en la sala = The sofa is in the living room',
      'No pongas los pies en el sillón = Don’t put your feet on the armchair',
      'Hay que sacudir los cojines = You have to fluff up the cushions',
      '¿Dónde está el baño? = Where is the bathroom?',
    ],
    14: [
      'Estoy limpiando la cocina = I’m cleaning the kitchen',
      'Ayer compramos un sillón nuevo = Yesterday we bought a new armchair',
      'La mancha no sale = The stain won’t come out',
      'Este cojín es más suave que ese = This cushion is softer than that one',
      'Se me cayó el café en la alfombra = I spilled coffee on the rug',
    ],
    15: [
      'Cuando era niño, saltaba en la cama | Cuando era niña, saltaba en la cama = When I was a child, I jumped on the bed',
      'Si limpias la mancha ahora, no quedará marca = If you clean the stain now, it won’t leave a mark',
      'Quiero que ordenes tu cuarto = I want you to tidy your room',
      'Ya habíamos limpiado la casa cuando llegaron = We had already cleaned the house when they arrived',
      'Ojalá el sillón no estuviera tan sucio = I wish the armchair weren’t so dirty',
    ],
  },
};

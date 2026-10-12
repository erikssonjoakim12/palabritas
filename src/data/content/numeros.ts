import type { ThemeSource } from './index';

// Numbers, counting, time and days.
export const numeros: ThemeSource = {
  id: 'numeros',
  name: 'Los números',
  en: 'Numbers',
  tiers: {
    2: ['uno = one', 'dos = two', 'tres = three'],
    3: ['cuatro = four', 'cinco = five', 'seis = six'],
    4: ['siete = seven', 'ocho = eight', 'nueve = nine'],
    5: ['diez = ten', 'cero = zero', 'el número = the number'],
    6: ['once = eleven', 'doce = twelve', 'quince = fifteen'],
    7: ['veinte = twenty', 'treinta = thirty', 'cincuenta = fifty', 'cien = one hundred'],
    8: [
      'dos conejos = two rabbits',
      'tres zanahorias = three carrots',
      'muchos conejos = many rabbits',
      'pocos conejos = few rabbits',
    ],
    9: [
      'Tengo cinco años = I am five years old',
      '¿Cuántos años tienes? = How old are you?',
      '¿Cuántos hay? = How many are there?',
      'Hay diez conejos = There are ten rabbits',
    ],
    10: ['primero = first', 'segundo = second', 'tercero = third', 'último = last'],
    11: [
      'Es la una = It’s one o’clock',
      'Son las dos = It’s two o’clock',
      'Son las tres y media = It’s half past three',
      '¿Qué hora es? = What time is it?',
    ],
    12: ['el lunes = Monday', 'el martes = Tuesday', 'el miércoles = Wednesday', 'el fin de semana = the weekend'],
    13: [
      'Dos más dos son cuatro = Two plus two is four',
      'Diez menos tres son siete = Ten minus three is seven',
      'Cuento hasta diez = I count to ten',
      'El conejo salta tres veces = The rabbit jumps three times',
      'Tengo veinte monedas = I have twenty coins',
    ],
    14: [
      'Son las cinco y cuarto = It’s quarter past five',
      'Nos vemos a las ocho = See you at eight',
      'La clase empieza a las nueve = Class starts at nine',
      'Cuesta cincuenta pesos = It costs fifty pesos',
      'Hay más de cien conejos = There are more than a hundred rabbits',
    ],
    15: [
      'Mi abuela nació en mil novecientos cincuenta = My grandma was born in 1950',
      'El año tiene doce meses = The year has twelve months',
      'La semana pasada conté doscientos conejos = Last week I counted two hundred rabbits',
      'Si tuviera mil pesos, compraría zanahorias = If I had a thousand pesos, I’d buy carrots',
      'Ayer salté el doble que hoy = Yesterday I jumped twice as much as today',
    ],
  },
};

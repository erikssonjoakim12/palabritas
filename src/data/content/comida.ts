import type { ThemeSource } from './index';

// Food, with Latin American words (la papa, los frijoles, el jugo).
export const comida: ThemeSource = {
  id: 'comida',
  name: 'La comida',
  en: 'Food',
  tiers: {
    2: ['el aguacate = the avocado', 'el pan = the bread', 'la fruta = the fruit'],
    3: ['la manzana = the apple', 'el plátano | la banana = the banana', 'el huevo = the egg'],
    4: ['la papa = the potato', 'el arroz = the rice', 'los frijoles = the beans'],
    5: ['comer = to eat', 'tomar | beber = to drink', 'cocinar = to cook'],
    6: ['rico | sabroso = tasty', 'dulce = sweet', 'picante = spicy'],
    7: ['el desayuno = the breakfast', 'el almuerzo = the lunch', 'la cena = the dinner', 'el jugo = the juice'],
    8: [
      'Tengo hambre = I’m hungry',
      'Tengo sed = I’m thirsty',
      'Está muy rico = It’s very tasty',
      'Quiero agua = I want water',
    ],
    9: ['el tomate = the tomato', 'la cebolla = the onion', 'el limón = the lemon', 'la tortilla = the tortilla'],
    10: [
      '¿Qué quieres comer? = What do you want to eat?',
      'Me gusta el aguacate = I like avocado',
      'No me gusta la cebolla = I don’t like onion',
      'Me gustan las frutas = I like fruit (plural)',
    ],
    11: [
      'La cuenta, por favor = The check, please',
      'Quisiera un café = I would like a coffee',
      '¿Cuánto cuesta? = How much does it cost?',
      'Para llevar = To go (takeaway)',
    ],
    12: [
      'Corto el tomate = I cut the tomato',
      'Pelo el aguacate = I peel the avocado',
      'Hiervo el agua = I boil the water',
      'Le pongo sal | Pongo sal = I add salt',
    ],
    13: [
      'Para hacer guacamole necesitas aguacate = To make guacamole you need avocado',
      'Desayuno huevos con frijoles = I have eggs with beans for breakfast',
      'Mi abuela cocina muy bien = My grandma cooks very well',
      '¿Me pasas la sal? = Can you pass me the salt?',
      'La sopa está demasiado caliente = The soup is too hot',
    ],
    14: [
      'Estoy preparando la cena = I’m making dinner',
      'Ayer comí tacos = Yesterday I ate tacos',
      'Fuimos a un restaurante = We went to a restaurant',
      'El mango es más dulce que el limón = The mango is sweeter than the lemon',
      'Hay que lavar la fruta = You have to wash the fruit',
    ],
    15: [
      'Cuando era niño, comía mucho pan | Cuando era niña, comía mucho pan = When I was a child, I ate a lot of bread',
      'Si tienes hambre, te preparo algo = If you’re hungry, I’ll make you something',
      'Nunca había probado el mole = I had never tried mole',
      'La comida que cocinaste estaba deliciosa = The food you cooked was delicious',
      'Quiero que pruebes este postre = I want you to try this dessert',
    ],
  },
};

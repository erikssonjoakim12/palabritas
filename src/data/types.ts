// The 17 types from Gen 2, with their Spanish names, and the Gen 2 type chart.

export type Type =
  | 'Normal' | 'Fuego' | 'Agua' | 'Eléctrico' | 'Planta' | 'Hielo' | 'Lucha' | 'Veneno' | 'Tierra'
  | 'Volador' | 'Psíquico' | 'Bicho' | 'Roca' | 'Fantasma' | 'Dragón' | 'Siniestro' | 'Acero';

// attacker -> defender -> multiplier (only entries that differ from 1)
const CHART: Partial<Record<Type, Partial<Record<Type, number>>>> = {
  Normal: { Roca: 0.5, Fantasma: 0, Acero: 0.5 },
  Fuego: { Fuego: 0.5, Agua: 0.5, Planta: 2, Hielo: 2, Bicho: 2, Roca: 0.5, Dragón: 0.5, Acero: 2 },
  Agua: { Fuego: 2, Agua: 0.5, Planta: 0.5, Tierra: 2, Roca: 2, Dragón: 0.5 },
  Eléctrico: { Agua: 2, Eléctrico: 0.5, Planta: 0.5, Tierra: 0, Volador: 2, Dragón: 0.5 },
  Planta: { Fuego: 0.5, Agua: 2, Planta: 0.5, Veneno: 0.5, Tierra: 2, Volador: 0.5, Bicho: 0.5, Roca: 2, Dragón: 0.5, Acero: 0.5 },
  Hielo: { Fuego: 0.5, Agua: 0.5, Planta: 2, Hielo: 0.5, Tierra: 2, Volador: 2, Dragón: 2, Acero: 0.5 },
  Lucha: { Normal: 2, Hielo: 2, Veneno: 0.5, Volador: 0.5, Psíquico: 0.5, Bicho: 0.5, Roca: 2, Fantasma: 0, Siniestro: 2, Acero: 2 },
  Veneno: { Planta: 2, Veneno: 0.5, Tierra: 0.5, Roca: 0.5, Fantasma: 0.5, Acero: 0 },
  Tierra: { Fuego: 2, Eléctrico: 2, Planta: 0.5, Veneno: 2, Volador: 0, Bicho: 0.5, Roca: 2, Acero: 2 },
  Volador: { Eléctrico: 0.5, Planta: 2, Lucha: 2, Bicho: 2, Roca: 0.5, Acero: 0.5 },
  Psíquico: { Lucha: 2, Veneno: 2, Psíquico: 0.5, Siniestro: 0, Acero: 0.5 },
  Bicho: { Fuego: 0.5, Planta: 2, Lucha: 0.5, Veneno: 0.5, Volador: 0.5, Psíquico: 2, Fantasma: 0.5, Siniestro: 2, Acero: 0.5 },
  Roca: { Fuego: 2, Hielo: 2, Lucha: 0.5, Tierra: 0.5, Volador: 2, Bicho: 2, Acero: 0.5 },
  Fantasma: { Normal: 0, Psíquico: 2, Fantasma: 2, Siniestro: 0.5, Acero: 0.5 },
  Dragón: { Dragón: 2, Acero: 0.5 },
  Siniestro: { Lucha: 0.5, Psíquico: 2, Fantasma: 2, Siniestro: 0.5, Acero: 0.5 },
  Acero: { Fuego: 0.5, Agua: 0.5, Eléctrico: 0.5, Hielo: 2, Roca: 2, Acero: 0.5 },
};

export function effectiveness(attack: Type, defender: Type[]): number {
  return defender.reduce((m, d) => m * (CHART[attack]?.[d] ?? 1), 1);
}

export const TYPE_COLORS: Record<Type, string> = {
  Normal: '#a8a878', Fuego: '#f08030', Agua: '#6890f0', Eléctrico: '#f8d030', Planta: '#78c850',
  Hielo: '#98d8d8', Lucha: '#c03028', Veneno: '#a040a0', Tierra: '#e0c068', Volador: '#a890f0',
  Psíquico: '#f85888', Bicho: '#a8b820', Roca: '#b8a038', Fantasma: '#705898', Dragón: '#7038f8',
  Siniestro: '#705848', Acero: '#b8b8d0',
};

export interface SquadPlayer {
  id: string;
  name: string;
  number: number;
  role: string;
  power: number;
  curve: number;
}

const ARCHETYPES = [
  { id: 'finisher', name: 'Le Finisseur', number: 9, role: 'PLACEMENT', power: 82, curve: 72 },
  { id: 'rocket', name: 'La Fusée', number: 7, role: 'PUISSANCE', power: 96, curve: 55 },
  { id: 'artist', name: 'Le Maestro', number: 10, role: 'EFFET', power: 70, curve: 97 },
  { id: 'captain', name: 'Le Capitaine', number: 8, role: 'SANG-FROID', power: 84, curve: 84 },
  { id: 'diamond', name: 'Le Diamant', number: 11, role: 'PRÉCISION', power: 76, curve: 89 },
  { id: 'outsider', name: 'L’Outsider', number: 19, role: 'IMPRÉVISIBLE', power: 90, curve: 78 }
] as const;

export const getRoster = (countryCode: string): SquadPlayer[] => ARCHETYPES.map((player) => ({
  ...player,
  id: `${countryCode}-${player.id}`
}));

export const defaultSquad = (countryCode: string): string[] => getRoster(countryCode).slice(0, 5).map((player) => player.id);

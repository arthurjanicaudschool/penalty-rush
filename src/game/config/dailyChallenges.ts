export type ChallengeType = 'score' | 'goals' | 'corners' | 'variety' | 'strong_keeper' | 'accuracy' | 'streak';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  keeperBonus?: number;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'score-6000', title: 'Objectif 6 000', description: 'Dépasse 6 000 points en 5 tirs.', type: 'score', target: 6000 },
  { id: 'four-goals', title: 'Presque parfait', description: 'Marque au moins 4 penalties.', type: 'goals', target: 4 },
  { id: 'two-corners', title: 'Nettoie les coins', description: 'Trouve 2 lucarnes.', type: 'corners', target: 2 },
  { id: 'variety', title: 'Imprévisible', description: 'Vise 3 zones différentes.', type: 'variety', target: 3 },
  { id: 'outsider', title: 'Mode outsider', description: 'Le gardien est plus réactif.', type: 'strong_keeper', target: 3, keeperBonus: 0.14 },
  { id: 'precision-70', title: 'Chirurgical', description: 'Termine avec au moins 70 % de précision.', type: 'accuracy', target: 70 },
  { id: 'streak-four', title: 'Série brûlante', description: 'Enchaîne 4 buts sans rater.', type: 'streak', target: 4 }
];

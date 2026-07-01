export type ShotOutcome = 'goal' | 'saved' | 'miss';
export type ShotZone = 'top-left' | 'top-right' | 'low-left' | 'low-right' | 'center';

export interface ShotInput {
  dx: number;
  dy: number;
  distance: number;
  duration: number;
  curve: number;
}

export interface ShotResult {
  outcome: ShotOutcome;
  zone: ShotZone;
  points: number;
  power: number;
  accuracy: number;
  isCorner: boolean;
  isPerfect: boolean;
  targetX: number;
  targetY: number;
  keeperX: number;
  keeperY: number;
  curve: number;
}

export interface GameResult {
  score: number;
  goals: number;
  accuracy: number;
  corners: number;
  streak: number;
  country: string;
  challengeId: string;
  challengeComplete: boolean;
  zones: ShotZone[];
}

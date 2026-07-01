import type { ShotResult } from '../types';

export class ScoreSystem {
  score = 0;
  goals = 0;
  streak = 0;
  bestStreak = 0;
  corners = 0;

  addShot(result: ShotResult): number {
    if (result.outcome !== 'goal') { this.streak = 0; return 0; }
    this.goals += 1;
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    if (result.isCorner) this.corners += 1;
    const multiplier = 1 + Math.max(0, this.streak - 1) * 0.15;
    const awarded = Math.round(result.points * multiplier);
    this.score += awarded;
    return awarded;
  }

  addPerfectGameBonus(): number {
    if (this.goals !== 5) return 0;
    this.score += 2500;
    return 2500;
  }
}

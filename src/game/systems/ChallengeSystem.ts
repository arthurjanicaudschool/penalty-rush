import { DAILY_CHALLENGES, type DailyChallenge } from '../config/dailyChallenges';
import type { GameResult } from '../types';

export class ChallengeSystem {
  static getToday(date = new Date()): DailyChallenge {
    const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
    return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length];
  }

  static isComplete(challenge: DailyChallenge, result: Omit<GameResult, 'challengeComplete'>): boolean {
    if (challenge.type === 'score') return result.score >= challenge.target;
    if (challenge.type === 'goals' || challenge.type === 'strong_keeper') return result.goals >= challenge.target;
    if (challenge.type === 'corners') return result.corners >= challenge.target;
    if (challenge.type === 'accuracy') return result.accuracy >= challenge.target;
    if (challenge.type === 'streak') return result.streak >= challenge.target;
    return new Set(result.zones).size >= challenge.target;
  }
}

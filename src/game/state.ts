import type { GameResult } from './types';
import { defaultSquad } from './config/rosters';

const COUNTRY_KEY = 'penalty-rush-country';
const BEST_KEY = 'penalty-rush-best';
const LAST_RESULT_KEY = 'penalty-rush-last-result';
const SQUAD_KEY = 'penalty-rush-squad';

export const gameState = {
  country: localStorage.getItem(COUNTRY_KEY) ?? 'FR',
  challengeMode: false,
  squad: (() => {
    try { return JSON.parse(localStorage.getItem(SQUAD_KEY) ?? '[]') as string[]; } catch { return []; }
  })(),
  get bestScore(): number { return Number(localStorage.getItem(BEST_KEY) ?? 0); },
  selectCountry(code: string) { this.country = code; localStorage.setItem(COUNTRY_KEY, code); },
  getSquad(): string[] {
    const valid = this.squad.filter((id) => id.startsWith(`${this.country}-`));
    return valid.length === 5 ? valid : defaultSquad(this.country);
  },
  selectSquad(ids: string[]) { this.squad = ids.slice(0, 5); localStorage.setItem(SQUAD_KEY, JSON.stringify(this.squad)); },
  saveResult(result: GameResult) {
    localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
    if (result.score > this.bestScore) localStorage.setItem(BEST_KEY, String(result.score));
  },
  getLastResult(): GameResult | null {
    const value = localStorage.getItem(LAST_RESULT_KEY);
    if (!value) return null;
    try { return JSON.parse(value) as GameResult; } catch { return null; }
  }
};

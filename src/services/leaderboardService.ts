import { supabase } from './supabase';
import type { GameResult } from '../game/types';

export interface LeaderboardEntry {
  id: string;
  username: string;
  country: string;
  score: number;
  goals: number;
  createdAt: string;
  isPlayer?: boolean;
}

const KEY = 'penalty-rush-scores';
const SEED: LeaderboardEntry[] = [
  { id: 'seed-1', username: 'Striker94', country: 'BR', score: 11980, goals: 5, createdAt: new Date().toISOString() },
  { id: 'seed-2', username: 'LeMur', country: 'FR', score: 10650, goals: 5, createdAt: new Date().toISOString() },
  { id: 'seed-3', username: 'AtlasKick', country: 'MA', score: 9720, goals: 4, createdAt: new Date().toISOString() },
  { id: 'seed-4', username: 'SamuraiShot', country: 'JP', score: 8880, goals: 4, createdAt: new Date().toISOString() },
  { id: 'seed-5', username: 'Teranga', country: 'SN', score: 7950, goals: 4, createdAt: new Date().toISOString() }
];

const today = (): string => new Date().toISOString().slice(0, 10);
const localEntries = (): LeaderboardEntry[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as LeaderboardEntry[]; } catch { return []; }
};

export const leaderboardService = {
  async submit(result: GameResult): Promise<void> {
    if (supabase) {
      const anonymousId = localStorage.getItem('penalty-rush-player-id') ?? crypto.randomUUID();
      localStorage.setItem('penalty-rush-player-id', anonymousId);
      const { data: player } = await supabase.from('players').upsert({ anonymous_id: anonymousId, country: result.country, last_seen_at: new Date().toISOString() }, { onConflict: 'anonymous_id' }).select('id').single();
      if (player) await supabase.from('scores').insert({ player_id: player.id, score: result.score, goals: result.goals, accuracy: result.accuracy, country: result.country, challenge_id: result.challengeId });
      return;
    }
    const entries = localEntries();
    entries.push({ id: crypto.randomUUID(), username: 'Toi', country: result.country, score: result.score, goals: result.goals, createdAt: new Date().toISOString(), isPlayer: true });
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-30)));
  },

  async getDaily(country?: string): Promise<LeaderboardEntry[]> {
    if (supabase) {
      let query = supabase.from('scores').select('id, score, goals, country, created_at, players(username)').gte('created_at', `${today()}T00:00:00`).order('score', { ascending: false }).limit(50);
      if (country) query = query.eq('country', country);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row) => ({ id: row.id as string, username: ((row.players as unknown as { username?: string } | null)?.username ?? 'Anonyme'), country: row.country as string, score: row.score as number, goals: row.goals as number, createdAt: row.created_at as string }));
    }
    const entries = [...SEED, ...localEntries()].filter((entry) => entry.createdAt.slice(0, 10) === today() && (!country || entry.country === country));
    return entries.sort((a, b) => b.score - a.score).slice(0, 50);
  },

  subscribe(country: string | undefined, onUpdate: (entries: LeaderboardEntry[]) => void): () => void {
    let active = true;
    const refresh = () => { void this.getDaily(country).then((entries) => { if (active) onUpdate(entries); }).catch(() => undefined); };
    if (supabase) {
      const client = supabase;
      const channel = client.channel(`scores-live-${country ?? 'global'}-${crypto.randomUUID()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, refresh)
        .subscribe();
      return () => { active = false; void client.removeChannel(channel); };
    }
    const timer = window.setInterval(refresh, 3000);
    const storage = (event: StorageEvent) => { if (event.key === KEY) refresh(); };
    window.addEventListener('storage', storage);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('storage', storage); };
  }
};

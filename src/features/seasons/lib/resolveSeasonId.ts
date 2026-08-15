import { DEFAULT_SEASON_ID } from '../api/seed';

export function resolveSeasonId(seasonId?: string, createdAt?: string): string {
  if (seasonId) return seasonId;
  if (createdAt && /^\d{4}/.test(createdAt)) return `season-${createdAt.slice(0, 4)}`;
  return DEFAULT_SEASON_ID;
}

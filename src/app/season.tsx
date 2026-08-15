import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SEASON_ID, SEED_SEASONS } from '@/features/seasons/api/seed';
import { useSeasons } from '@/features/seasons/hooks/useSeasons';

const STORAGE_KEY = 'cropoptimize.season';

type SeasonIdContextValue = {
  seasonId: string;
  setSeasonId: (id: string) => void;
};

const SeasonIdContext = createContext<SeasonIdContextValue | null>(null);

function readStoredId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SEASON_ID;
    const known = SEED_SEASONS.find((season) => season.id === raw || season.name === raw);
    return known?.id ?? raw;
  } catch {
    return DEFAULT_SEASON_ID;
  }
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [seasonId, setSeasonIdState] = useState(readStoredId);

  const value = useMemo(
    () => ({
      seasonId,
      setSeasonId: (next: string) => {
        setSeasonIdState(next);
        localStorage.setItem(STORAGE_KEY, next);
      },
    }),
    [seasonId],
  );

  return <SeasonIdContext.Provider value={value}>{children}</SeasonIdContext.Provider>;
}

export function useSeason() {
  const context = useContext(SeasonIdContext);
  if (!context) {
    throw new Error('useSeason must be used within SeasonProvider');
  }

  const { data: seasons = [] } = useSeasons();
  const current = seasons.find((season) => season.id === context.seasonId) ?? seasons[0];

  useEffect(() => {
    if (current && current.id !== context.seasonId) {
      context.setSeasonId(current.id);
    }
  }, [current, context]);

  return {
    seasonId: current?.id ?? context.seasonId,
    seasonName: current?.name ?? '',
    seasons,
    setSeasonId: context.setSeasonId,
  };
}

import { DEFAULT_ORGANIZATION_ID } from '@/features/auth/api/seed';
import type { Season } from '../model/types';
import { DEFAULT_SEASON_ID, SEED_SEASONS } from './seed';

const STORAGE_KEY = 'cropoptimize.seasons.v1';

function normalize(seasons: Season[]): Season[] {
  return seasons.map((season) => ({
    ...season,
    organizationId: season.organizationId ?? DEFAULT_ORGANIZATION_ID,
  }));
}

function readStore(): Season[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize([...SEED_SEASONS]);
    const parsed = JSON.parse(raw) as Season[];
    return Array.isArray(parsed) && parsed.length > 0 ? normalize(parsed) : normalize([...SEED_SEASONS]);
  } catch {
    return normalize([...SEED_SEASONS]);
  }
}

function writeStore(seasons: Season[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seasons));
}

function sortSeasons(seasons: Season[]): Season[] {
  return [...seasons].sort((left, right) => right.name.localeCompare(left.name, 'ru', { numeric: true }));
}

let memoryStore = sortSeasons(readStore());

function createSeasonRecord(organizationId: string, name: string): Season {
  return { id: crypto.randomUUID(), organizationId, name };
}

export function seedSeasonsForOrganization(organizationId: string): Season[] {
  const created = ['2026', '2025', '2024'].map((name) => createSeasonRecord(organizationId, name));
  memoryStore = sortSeasons([...created, ...memoryStore]);
  writeStore(memoryStore);
  return created;
}

export const seasonRepository = {
  defaultId: DEFAULT_SEASON_ID,

  list(organizationId: string): Season[] {
    return memoryStore
      .filter((season) => season.organizationId === organizationId)
      .map((season) => ({ ...season }));
  },

  create(name: string, organizationId: string): Season {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Укажите название сезона');
    }
    if (
      memoryStore.some(
        (season) =>
          season.organizationId === organizationId && season.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      throw new Error('Сезон с таким названием уже есть');
    }
    const season = createSeasonRecord(organizationId, trimmed);
    memoryStore = sortSeasons([season, ...memoryStore]);
    writeStore(memoryStore);
    return { ...season };
  },

  rename(id: string, name: string): Season {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Укажите название сезона');
    }
    const current = memoryStore.find((season) => season.id === id);
    if (!current) {
      throw new Error('Сезон не найден');
    }
    if (
      memoryStore.some(
        (season) =>
          season.id !== id &&
          season.organizationId === current.organizationId &&
          season.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      throw new Error('Сезон с таким названием уже есть');
    }
    const next = { ...current, name: trimmed };
    memoryStore = sortSeasons(memoryStore.map((season) => (season.id === id ? next : season)));
    writeStore(memoryStore);
    return { ...next };
  },

  remove(id: string): void {
    const current = memoryStore.find((season) => season.id === id);
    if (!current) {
      throw new Error('Сезон не найден');
    }
    const inOrg = memoryStore.filter((season) => season.organizationId === current.organizationId);
    if (inOrg.length <= 1) {
      throw new Error('Нельзя удалить последний сезон');
    }
    memoryStore = memoryStore.filter((season) => season.id !== id);
    writeStore(memoryStore);
  },
};

import { DEFAULT_ORGANIZATION_ID } from '@/features/auth/api/seed';
import type { Season } from '../model/types';

export const DEFAULT_SEASON_ID = 'season-2026';

export const SEED_SEASONS: Season[] = [
  { id: 'season-2026', organizationId: DEFAULT_ORGANIZATION_ID, name: '2026' },
  { id: 'season-2025', organizationId: DEFAULT_ORGANIZATION_ID, name: '2025' },
  { id: 'season-2024', organizationId: DEFAULT_ORGANIZATION_ID, name: '2024' },
];

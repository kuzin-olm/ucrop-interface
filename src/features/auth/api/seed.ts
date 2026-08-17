import type { AuthUser, Organization } from '../model/types';

export const DEFAULT_ORGANIZATION_ID = 'org-south';

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: DEFAULT_ORGANIZATION_ID,
    name: 'Агрохолдинг Юг',
    region: 'Краснодарский край',
    plan: 'pro',
  },
];

export const SEED_USERS: AuthUser[] = [
  {
    id: 'user-anna',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Анна Соколова',
    email: 'anna@agro.local',
    password: 'demo123',
    role: 'Агроном',
    status: 'active',
    lastLoginAt: '2026-08-16T08:12:00',
  },
  {
    id: 'user-igor',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Игорь Белов',
    email: 'igor@agro.local',
    password: 'demo123',
    role: 'Аналитик',
    status: 'active',
    lastLoginAt: '2026-08-14T15:40:00',
  },
  {
    id: 'user-maria',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Мария Орлова',
    email: 'maria@agro.local',
    password: 'demo123',
    role: 'Агроном',
    status: 'active',
  },
];

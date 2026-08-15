import type { AuthUser, Organization } from '../model/types';

export const DEFAULT_ORGANIZATION_ID = 'org-south';

export const SEED_ORGANIZATIONS: Organization[] = [
  { id: DEFAULT_ORGANIZATION_ID, name: 'Агрохолдинг Юг' },
];

export const SEED_USERS: AuthUser[] = [
  {
    id: 'user-anna',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Анна Соколова',
    email: 'anna@agro.local',
    password: 'demo123',
    role: 'Агроном',
  },
  {
    id: 'user-igor',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Игорь Белов',
    email: 'igor@agro.local',
    password: 'demo123',
    role: 'Аналитик',
  },
  {
    id: 'user-maria',
    organizationId: DEFAULT_ORGANIZATION_ID,
    name: 'Мария Орлова',
    email: 'maria@agro.local',
    password: 'demo123',
    role: 'Агроном',
  },
];

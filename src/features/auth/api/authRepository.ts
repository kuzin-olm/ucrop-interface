import { seedSeasonsForOrganization } from '@/features/seasons/api/seasonRepository';
import type { AuthUser, Organization, PublicUser, Session } from '../model/types';
import { DEFAULT_ORGANIZATION_ID, SEED_ORGANIZATIONS, SEED_USERS } from './seed';

const ORG_KEY = 'cropoptimize.organizations.v1';
const USERS_KEY = 'cropoptimize.users.v1';
const SESSION_KEY = 'cropoptimize.session';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let organizations = readJson<Organization[]>(ORG_KEY, [...SEED_ORGANIZATIONS]);
let users = readJson<AuthUser[]>(USERS_KEY, [...SEED_USERS]);

function writeOrgs(): void {
  localStorage.setItem(ORG_KEY, JSON.stringify(organizations));
}

function writeUsers(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(user: AuthUser): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const authRepository = {
  defaultOrganizationId: DEFAULT_ORGANIZATION_ID,

  getSession(): Session | null {
    return readJson<Session | null>(SESSION_KEY, null);
  },

  setSession(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getUser(id: string): PublicUser | null {
    const user = users.find((item) => item.id === id);
    return user ? toPublic(user) : null;
  },

  getOrganization(id: string): Organization | null {
    return organizations.find((item) => item.id === id) ?? null;
  },

  login(email: string, password: string): { user: PublicUser; organization: Organization } {
    const normalized = normalizeEmail(email);
    const user = users.find((item) => item.email === normalized);
    if (!user || user.password !== password) {
      throw new Error('Неверный email или пароль');
    }
    const organization = organizations.find((item) => item.id === user.organizationId);
    if (!organization) {
      throw new Error('Организация не найдена');
    }
    this.setSession({ userId: user.id });
    return { user: toPublic(user), organization };
  },

  register(input: {
    name: string;
    organizationName: string;
    email: string;
    password: string;
  }): { user: PublicUser; organization: Organization } {
    const name = input.name.trim();
    const organizationName = input.organizationName.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!name) throw new Error('Укажите имя');
    if (!organizationName) throw new Error('Укажите название организации');
    if (!email || !email.includes('@')) throw new Error('Укажите корректный email');
    if (password.length < 4) throw new Error('Пароль должен быть не короче 4 символов');
    if (users.some((item) => item.email === email)) {
      throw new Error('Пользователь с таким email уже есть');
    }

    const organization: Organization = { id: crypto.randomUUID(), name: organizationName };
    const user: AuthUser = {
      id: crypto.randomUUID(),
      organizationId: organization.id,
      name,
      email,
      password,
      role: 'Администратор',
    };

    organizations = [...organizations, organization];
    users = [...users, user];
    writeOrgs();
    writeUsers();
    seedSeasonsForOrganization(organization.id);
    this.setSession({ userId: user.id });

    return { user: toPublic(user), organization };
  },
};

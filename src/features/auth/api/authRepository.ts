import { employeeRoleLabel, parseEmployeeRole } from '@/features/employees/lib/roles';
import type { EmployeeRole, EmployeeStatus } from '@/features/employees/model/types';
import { seedSeasonsForOrganization } from '@/features/seasons/api/seasonRepository';
import type { AuthUser, Organization, PublicUser, Session, UserStatus } from '../model/types';
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

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    status: user.status === 'inactive' ? 'inactive' : 'active',
    role: employeeRoleLabel(parseEmployeeRole(user.role)),
  };
}

let organizations = readJson<Organization[]>(ORG_KEY, [...SEED_ORGANIZATIONS]);
let users = readJson<AuthUser[]>(USERS_KEY, [...SEED_USERS]).map(normalizeUser);

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
    if (!user || !user.password || user.password !== password) {
      throw new Error('Неверный email или пароль');
    }
    if (user.status === 'inactive') {
      throw new Error('Доступ отключён. Обратитесь к администратору.');
    }
    if (user.inviteToken) {
      throw new Error('Примите приглашение по ссылке и задайте пароль.');
    }
    const organization = organizations.find((item) => item.id === user.organizationId);
    if (!organization) {
      throw new Error('Организация не найдена');
    }
    const next: AuthUser = { ...user, lastLoginAt: new Date().toISOString(), status: 'active' };
    users = users.map((item) => (item.id === user.id ? next : item));
    writeUsers();
    this.setSession({ userId: user.id });
    return { user: toPublic(next), organization };
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
      role: employeeRoleLabel('admin'),
      status: 'active',
      lastLoginAt: new Date().toISOString(),
    };

    organizations = [...organizations, organization];
    users = [...users, user];
    writeOrgs();
    writeUsers();
    seedSeasonsForOrganization(organization.id);
    this.setSession({ userId: user.id });

    return { user: toPublic(user), organization };
  },

  listByOrganization(organizationId: string): AuthUser[] {
    return users
      .filter((user) => user.organizationId === organizationId)
      .map((user) => ({ ...user }));
  },

  inviteEmployee(input: {
    organizationId: string;
    name: string;
    email: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    inviteToken: string;
    inviteExpiresAt: string;
  }): AuthUser {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    if (!name) throw new Error('Укажите ФИО');
    if (!email || !email.includes('@')) throw new Error('Укажите корректный email');
    if (users.some((item) => item.email === email)) {
      throw new Error('Пользователь с таким email уже есть');
    }
    const user: AuthUser = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      name,
      email,
      password: '',
      role: employeeRoleLabel(input.role),
      status: input.status,
      inviteToken: input.inviteToken,
      inviteExpiresAt: input.inviteExpiresAt,
    };
    users = [user, ...users];
    writeUsers();
    return { ...user };
  },

  updateEmployee(input: {
    id: string;
    name: string;
    role: EmployeeRole;
    status: EmployeeStatus;
  }): AuthUser {
    const current = users.find((item) => item.id === input.id);
    if (!current) throw new Error('Сотрудник не найден');
    const name = input.name.trim();
    if (!name) throw new Error('Укажите ФИО');

    const nextRole = employeeRoleLabel(input.role);
    const nextStatus: UserStatus = input.status;
    const activeAdmins = users.filter(
      (item) =>
        item.organizationId === current.organizationId &&
        item.id !== current.id &&
        parseEmployeeRole(item.role) === 'admin' &&
        item.status !== 'inactive',
    );
    const becomesNonAdmin = parseEmployeeRole(nextRole) !== 'admin' || nextStatus === 'inactive';
    if (parseEmployeeRole(current.role) === 'admin' && current.status !== 'inactive' && becomesNonAdmin && activeAdmins.length === 0) {
      throw new Error('Нельзя снять последнего администратора');
    }

    const next: AuthUser = {
      ...current,
      name,
      role: nextRole,
      status: nextStatus,
    };
    users = users.map((item) => (item.id === current.id ? next : item));
    writeUsers();
    return { ...next };
  },

  getInvite(token: string): { user: PublicUser; organization: Organization } | null {
    const user = users.find((item) => item.inviteToken === token);
    if (!user) return null;
    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt).getTime() < Date.now()) return null;
    const organization = organizations.find((item) => item.id === user.organizationId);
    if (!organization) return null;
    return { user: toPublic(user), organization };
  },

  acceptInvite(token: string, password: string): { user: PublicUser; organization: Organization } {
    if (password.length < 4) throw new Error('Пароль должен быть не короче 4 символов');
    const invited = this.getInvite(token);
    if (!invited) throw new Error('Ссылка недействительна или уже использована');
    if (invited.user.status === 'inactive') {
      throw new Error('Доступ отключён. Обратитесь к администратору.');
    }
    const next: AuthUser = {
      ...users.find((item) => item.id === invited.user.id)!,
      password,
      inviteToken: undefined,
      inviteExpiresAt: undefined,
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };
    users = users.map((item) => (item.id === next.id ? next : item));
    writeUsers();
    this.setSession({ userId: next.id });
    return { user: toPublic(next), organization: invited.organization };
  },
};

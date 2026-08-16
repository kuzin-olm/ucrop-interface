export type Organization = {
  id: string;
  name: string;
};

export type UserStatus = 'active' | 'inactive';

export type AuthUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status?: UserStatus;
  lastLoginAt?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
};

export type PublicUser = Omit<AuthUser, 'password'>;

export type Session = {
  userId: string;
};

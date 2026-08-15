export type Organization = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

export type PublicUser = Omit<AuthUser, 'password'>;

export type Session = {
  userId: string;
};

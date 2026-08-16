export type EmployeeRole = 'admin' | 'agronomist' | 'analyst';
export type EmployeeStatus = 'active' | 'inactive';

export type Employee = {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  lastLoginAt?: string;
  invitePending: boolean;
};

export type InviteEmployeeInput = {
  organizationId: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  inviteToken: string;
  inviteExpiresAt: string;
};

export type UpdateEmployeeInput = {
  id: string;
  fullName: string;
  role: EmployeeRole;
  status: EmployeeStatus;
};

export type EmployeeFilters = {
  query: string;
  role: 'all' | EmployeeRole;
  status: 'all' | EmployeeStatus;
};

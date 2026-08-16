import type { EmployeeRole, EmployeeStatus } from './types';

export const EMPLOYEE_ROLE_LABEL: Record<EmployeeRole, string> = {
  admin: 'Администратор',
  agronomist: 'Агроном',
  analyst: 'Аналитик',
};

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
};

export const EMPLOYEE_ROLES: EmployeeRole[] = ['admin', 'agronomist', 'analyst'];
export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['active', 'inactive'];

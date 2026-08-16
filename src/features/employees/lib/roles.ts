import { EMPLOYEE_ROLE_LABEL } from '../model/labels';
import type { EmployeeRole } from '../model/types';

export function parseEmployeeRole(value: string): EmployeeRole {
  if (value === 'admin' || value === EMPLOYEE_ROLE_LABEL.admin) return 'admin';
  if (value === 'analyst' || value === EMPLOYEE_ROLE_LABEL.analyst) return 'analyst';
  return 'agronomist';
}

export function employeeRoleLabel(role: EmployeeRole): string {
  return EMPLOYEE_ROLE_LABEL[role];
}

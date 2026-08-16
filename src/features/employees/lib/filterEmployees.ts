import type { Employee, EmployeeFilters } from '../model/types';

export function filterEmployees(employees: Employee[], filters: EmployeeFilters): Employee[] {
  const query = filters.query.trim().toLowerCase();
  return employees.filter((employee) => {
    const matchesQuery =
      query.length === 0 ||
      employee.fullName.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query);
    const matchesRole = filters.role === 'all' || employee.role === filters.role;
    const matchesStatus = filters.status === 'all' || employee.status === filters.status;
    return matchesQuery && matchesRole && matchesStatus;
  });
}

export function hasActiveEmployeeFilters(filters: EmployeeFilters): boolean {
  return filters.query.trim().length > 0 || filters.role !== 'all' || filters.status !== 'all';
}

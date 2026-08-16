import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/format';
import { EMPLOYEE_ROLE_LABEL } from '../model/labels';
import type { Employee } from '../model/types';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import styles from './EmployeesTable.module.css';

type EmployeesTableProps = {
  employees: Employee[];
  selectedId: string | null;
  onEdit: (employee: Employee) => void;
};

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function EmployeesTable({ employees, selectedId, onEdit }: EmployeesTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Сотрудник</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Последний вход</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee.id}
              tabIndex={0}
              className={cn(employee.id === selectedId && styles.selected)}
              onClick={() => onEdit(employee)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onEdit(employee);
                }
              }}
            >
              <td>
                <div className={styles.person}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(employee.fullName)}
                  </span>
                  <div>
                    <div className={styles.name}>{employee.fullName}</div>
                    <div className={styles.email}>{employee.email}</div>
                  </div>
                </div>
              </td>
              <td>{EMPLOYEE_ROLE_LABEL[employee.role]}</td>
              <td>
                <EmployeeStatusBadge status={employee.status} />
              </td>
              <td className={employee.lastLoginAt ? undefined : styles.muted}>
                {employee.lastLoginAt ? formatDateTime(employee.lastLoginAt) : 'Никогда'}
                {employee.invitePending ? <div className={styles.hint}>Приглашение отправлено</div> : null}
              </td>
              <td>
                <button
                  type="button"
                  className={styles.edit}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(employee);
                  }}
                >
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

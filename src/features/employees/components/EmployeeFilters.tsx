import { cn } from '@/shared/lib/cn';
import { EMPLOYEE_ROLE_LABEL, EMPLOYEE_ROLES, EMPLOYEE_STATUS_LABEL, EMPLOYEE_STATUSES } from '../model/labels';
import type { EmployeeFilters as EmployeeFiltersState, EmployeeRole, EmployeeStatus } from '../model/types';
import styles from './EmployeeFilters.module.css';

type EmployeeFiltersProps = {
  value: EmployeeFiltersState;
  canReset: boolean;
  onChange: (next: EmployeeFiltersState) => void;
  onReset: () => void;
};

export function EmployeeFilters({ value, canReset, onChange, onReset }: EmployeeFiltersProps) {
  return (
    <div className={styles.row}>
      <label className={styles.field}>
        <span className={styles.label}>Роль</span>
        <select
          className={cn(styles.select, value.role !== 'all' && styles.active)}
          value={value.role}
          onChange={(event) =>
            onChange({ ...value, role: event.target.value as EmployeeFiltersState['role'] })
          }
        >
          <option value="all">Все роли</option>
          {EMPLOYEE_ROLES.map((role: EmployeeRole) => (
            <option key={role} value={role}>
              {EMPLOYEE_ROLE_LABEL[role]}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Статус</span>
        <select
          className={cn(styles.select, value.status !== 'all' && styles.active)}
          value={value.status}
          onChange={(event) =>
            onChange({ ...value, status: event.target.value as EmployeeFiltersState['status'] })
          }
        >
          <option value="all">Все статусы</option>
          {EMPLOYEE_STATUSES.map((status: EmployeeStatus) => (
            <option key={status} value={status}>
              {EMPLOYEE_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className={styles.reset} onClick={onReset} disabled={!canReset}>
        Сбросить фильтры
      </button>
    </div>
  );
}

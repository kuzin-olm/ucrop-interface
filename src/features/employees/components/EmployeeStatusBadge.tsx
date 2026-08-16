import { cn } from '@/shared/lib/cn';
import { EMPLOYEE_STATUS_LABEL } from '../model/labels';
import type { EmployeeStatus } from '../model/types';
import styles from './EmployeeStatusBadge.module.css';

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <span className={cn(styles.badge, styles[status])}>{EMPLOYEE_STATUS_LABEL[status]}</span>;
}

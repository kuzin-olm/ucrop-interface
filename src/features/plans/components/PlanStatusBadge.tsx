import { cn } from '@/shared/lib/cn';
import { PLAN_STATUS_LABEL } from '../model/labels';
import type { PlanStatus } from '../model/types';
import styles from './PlanStatusBadge.module.css';

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <span className={cn(styles.badge, styles[status])}>
      {status === 'calculating' ? <span className={styles.dot} aria-hidden="true" /> : null}
      {PLAN_STATUS_LABEL[status]}
    </span>
  );
}

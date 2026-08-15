import { ClipboardList } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatDateTime, formatDuration } from '@/shared/lib/format';
import type { CalculationPlan } from '../model/types';
import { PlanStatusBadge } from './PlanStatusBadge';
import styles from './PlansTable.module.css';

type PlansTableProps = {
  plans: CalculationPlan[];
  selectedId: string | null;
  onOpen: (plan: CalculationPlan) => void;
  onResult: (plan: CalculationPlan) => void;
};

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function PlansTable({ plans, selectedId, onOpen, onResult }: PlansTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Статус процесса</th>
            <th>Кто создал</th>
            <th>Когда создал</th>
            <th>Длительность</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr
              key={plan.id}
              tabIndex={0}
              className={cn(plan.id === selectedId && styles.selected)}
              onClick={() => onOpen(plan)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(plan);
                }
              }}
            >
              <td>
                <div className={styles.nameCell}>
                  <span className={styles.icon}>
                    <ClipboardList size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <div className={styles.title}>{plan.name}</div>
                    {plan.description ? <div className={styles.description}>{plan.description}</div> : null}
                  </div>
                </div>
              </td>
              <td>
                <PlanStatusBadge status={plan.status} />
              </td>
              <td>
                <div className={styles.author}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(plan.createdBy.name)}
                  </span>
                  <div>
                    <div className={styles.authorName}>{plan.createdBy.name}</div>
                    <div className={styles.authorRole}>{plan.createdBy.role}</div>
                  </div>
                </div>
              </td>
              <td>{formatDateTime(plan.createdAt)}</td>
              <td className={plan.durationSeconds == null ? styles.muted : undefined}>
                {plan.status === 'completed' && plan.durationSeconds != null
                  ? formatDuration(plan.durationSeconds)
                  : '—'}
              </td>
              <td>
                {plan.status === 'completed' ? (
                  <button
                    type="button"
                    className={styles.open}
                    onClick={(event) => {
                      event.stopPropagation();
                      onResult(plan);
                    }}
                  >
                    Результат
                  </button>
                ) : (
                  <span className={styles.muted}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

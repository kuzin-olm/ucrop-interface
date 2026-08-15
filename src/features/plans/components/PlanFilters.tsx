import { cn } from '@/shared/lib/cn';
import { PERIOD_FILTER_LABEL, PLAN_STATUS_LABEL } from '../model/labels';
import type { PeriodFilter, PlanAuthor, PlanFilters as PlanFiltersState, PlanStatus } from '../model/types';
import styles from './PlanFilters.module.css';

type PlanFiltersProps = {
  value: PlanFiltersState;
  authors: PlanAuthor[];
  canReset: boolean;
  onChange: (next: PlanFiltersState) => void;
  onReset: () => void;
};

const STATUSES: PlanStatus[] = ['draft', 'calculating', 'completed', 'error'];
const PERIODS: PeriodFilter[] = ['all', '7d', '30d', 'year'];

export function PlanFilters({ value, authors, canReset, onChange, onReset }: PlanFiltersProps) {
  return (
    <div className={styles.row}>
      <label className={styles.field}>
        <span className={styles.label}>Статус</span>
        <select
          className={cn(styles.select, value.status !== 'all' && styles.active)}
          value={value.status}
          onChange={(event) =>
            onChange({ ...value, status: event.target.value as PlanFiltersState['status'] })
          }
        >
          <option value="all">Все статусы</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {PLAN_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Кто создал</span>
        <select
          className={cn(styles.select, value.author !== 'all' && styles.active)}
          value={value.author}
          onChange={(event) => onChange({ ...value, author: event.target.value })}
        >
          <option value="all">Все авторы</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Период</span>
        <select
          className={cn(styles.select, value.period !== 'all' && styles.active)}
          value={value.period}
          onChange={(event) => onChange({ ...value, period: event.target.value as PeriodFilter })}
        >
          {PERIODS.map((period) => (
            <option key={period} value={period}>
              {PERIOD_FILTER_LABEL[period]}
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

import { PLAN_STATUS_LABEL } from '@/features/plans/model/labels';
import type { PlanStatus } from '@/features/plans/model/types';
import type { DashboardData } from '../model/types';
import styles from './StatusDonut.module.css';

const SEGMENTS: Array<{ key: PlanStatus; color: string }> = [
  { key: 'calculating', color: '#2E7D32' },
  { key: 'completed', color: '#81C784' },
  { key: 'draft', color: '#90A4AE' },
  { key: 'error', color: '#C62828' },
];

const RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonut({ data }: { data: DashboardData['plansByStatus'] }) {
  let offset = 0;

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Планы по статусам</h2>
      <div className={styles.chart}>
        <svg className={styles.svg} viewBox="0 0 180 180" role="img" aria-label="Распределение планов по статусам">
          <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#E8EFE4" strokeWidth="22" />
          {data.total === 0 ? null : (
            <g transform="rotate(-90 90 90)">
              {SEGMENTS.map((segment) => {
                const value = data[segment.key];
                if (value === 0) return null;
                const length = (value / data.total) * CIRCUMFERENCE;
                const circle = (
                  <circle
                    key={segment.key}
                    cx="90"
                    cy="90"
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="22"
                    strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += length;
                return circle;
              })}
            </g>
          )}
        </svg>
        <div className={styles.center}>
          <div className={styles.total}>{data.total}</div>
          <div className={styles.totalLabel}>всего</div>
        </div>
      </div>
      <ul className={styles.legend}>
        {SEGMENTS.map((segment) => {
          const value = data[segment.key];
          const percent = data.total === 0 ? 0 : Math.round((value / data.total) * 100);
          return (
            <li key={segment.key} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: segment.color }} />
              <span>{PLAN_STATUS_LABEL[segment.key]}</span>
              <span className={styles.count}>{value}</span>
              <span className={styles.percent}>{percent}%</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

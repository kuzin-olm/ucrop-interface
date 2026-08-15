import type { DashboardData } from '../model/types';
import styles from './TeamActivity.module.css';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function TeamActivity({ rows }: { rows: DashboardData['teamActivity'] }) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Активность команды</h2>
      {rows.length === 0 ? (
        <p className={styles.empty}>В этом сезоне планов ещё нет.</p>
      ) : (
        <div className={styles.list}>
          <div className={styles.row}>
            <span className={styles.head}>Сотрудник</span>
            <span className={`${styles.head} ${styles.metric}`}>Созд.</span>
            <span className={`${styles.head} ${styles.metric}`}>В работе</span>
            <span className={`${styles.head} ${styles.metric}`}>Готово</span>
            <span className={styles.head}>Доля готовых</span>
          </div>
          {rows.map((row) => {
            const ratio = row.created === 0 ? 0 : row.completed / row.created;
            return (
              <div key={row.userId} className={styles.row}>
                <div className={styles.person}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(row.name)}
                  </span>
                  <span className={styles.name}>{row.name}</span>
                </div>
                <span className={styles.metric}>{row.created}</span>
                <span className={styles.metric}>{row.inProgress}</span>
                <span className={styles.metric}>{row.completed}</span>
                <div
                  className={styles.bar}
                  role="meter"
                  aria-label={`Завершено ${row.completed} из ${row.created}`}
                  aria-valuemin={0}
                  aria-valuemax={row.created}
                  aria-valuenow={row.completed}
                >
                  <div className={styles.fill} style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

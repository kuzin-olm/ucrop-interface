import styles from './PlansStates.module.css';

export function PlansSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Загрузка планов">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.rowSkeleton} />
      ))}
    </div>
  );
}

import styles from './FieldsStates.module.css';

export function FieldsSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Загрузка полей">
      <div className={styles.mapSkeleton} />
      <div className={styles.tableSkeleton}>
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className={styles.rowSkeleton} />
        ))}
      </div>
    </div>
  );
}

import styles from './MaterialsStates.module.css';

export function MaterialsSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Загрузка материалов">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.rowSkeleton} />
      ))}
    </div>
  );
}

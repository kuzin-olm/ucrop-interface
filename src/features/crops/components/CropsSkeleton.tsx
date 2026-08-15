import styles from './CropsStates.module.css';

export function CropsSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Загрузка культур">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.skeleton} />
      ))}
    </div>
  );
}

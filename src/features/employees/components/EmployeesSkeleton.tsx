import styles from './EmployeesStates.module.css';

export function EmployeesSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Загрузка сотрудников">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={styles.rowSkeleton} />
      ))}
    </div>
  );
}

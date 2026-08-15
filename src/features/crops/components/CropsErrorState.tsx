import { CircleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './CropsStates.module.css';

type CropsErrorStateProps = {
  onRetry: () => void;
};

export function CropsErrorState({ onRetry }: CropsErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <CircleAlert className={styles.illustration} size={48} aria-hidden="true" />
      <h2 className={styles.title}>Не удалось загрузить культуры</h2>
      <p className={styles.text}>Проверьте соединение и попробуйте ещё раз.</p>
      <Button variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

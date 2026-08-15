import { CircleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './FieldsStates.module.css';

export function FieldsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.state} role="alert">
      <CircleAlert className={styles.illustration} size={48} aria-hidden="true" />
      <h2 className={styles.title}>Не удалось загрузить поля</h2>
      <p className={styles.text}>Проверьте соединение и попробуйте ещё раз.</p>
      <Button variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

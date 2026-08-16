import { Plus, Users } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './EmployeesStates.module.css';

type EmployeesEmptyStateProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  withPlus?: boolean;
};

export function EmployeesEmptyState({
  title,
  text,
  actionLabel,
  onAction,
  withPlus = false,
}: EmployeesEmptyStateProps) {
  return (
    <div className={styles.state}>
      <Users className={styles.illustration} size={48} aria-hidden="true" />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      {actionLabel && onAction ? (
        <Button icon={withPlus ? <Plus size={16} aria-hidden="true" /> : undefined} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

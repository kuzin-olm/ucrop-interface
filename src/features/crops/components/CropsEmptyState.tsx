import { Plus, Sprout } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './CropsStates.module.css';

type CropsEmptyStateProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function CropsEmptyState({ title, text, actionLabel, onAction }: CropsEmptyStateProps) {
  return (
    <div className={styles.state}>
      <Sprout className={styles.illustration} size={48} aria-hidden="true" />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      {actionLabel && onAction ? (
        <Button icon={<Plus size={16} aria-hidden="true" />} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

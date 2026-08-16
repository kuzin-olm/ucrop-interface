import { Package, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './MaterialsStates.module.css';

type MaterialsEmptyStateProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  withPlus?: boolean;
};

export function MaterialsEmptyState({
  title,
  text,
  actionLabel,
  onAction,
  withPlus = false,
}: MaterialsEmptyStateProps) {
  return (
    <div className={styles.state}>
      <Package className={styles.illustration} size={48} aria-hidden="true" />
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

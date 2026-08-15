import { cn } from '@/shared/lib/cn';
import { FIELD_STATUS_LABEL } from '../model/labels';
import type { FieldStatus } from '../model/types';
import styles from './FieldStatusBadge.module.css';

export function FieldStatusBadge({ status }: { status: FieldStatus }) {
  return <span className={cn(styles.badge, styles[status])}>{FIELD_STATUS_LABEL[status]}</span>;
}

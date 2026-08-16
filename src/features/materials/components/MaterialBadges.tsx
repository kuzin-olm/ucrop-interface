import { cn } from '@/shared/lib/cn';
import { MATERIAL_CATEGORY_LABEL, MATERIAL_STATUS_LABEL } from '../model/labels';
import type { MaterialCategory, MaterialStatus } from '../model/types';
import styles from './MaterialBadges.module.css';

export function MaterialCategoryBadge({ category }: { category: MaterialCategory }) {
  return <span className={cn(styles.badge, styles[category])}>{MATERIAL_CATEGORY_LABEL[category]}</span>;
}

export function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  return <span className={cn(styles.badge, styles[status])}>{MATERIAL_STATUS_LABEL[status]}</span>;
}

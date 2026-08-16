import { cn } from '@/shared/lib/cn';
import { MATERIAL_CATEGORY_LABEL } from '../model/labels';
import type { MaterialCategory, MaterialFilter } from '../model/types';
import styles from './MaterialFilters.module.css';

const TABS: Array<{ id: MaterialFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'seeds', label: MATERIAL_CATEGORY_LABEL.seeds },
  { id: 'fertilizer', label: MATERIAL_CATEGORY_LABEL.fertilizer },
  { id: 'ppp', label: MATERIAL_CATEGORY_LABEL.ppp },
  { id: 'fuel', label: MATERIAL_CATEGORY_LABEL.fuel },
];

type MaterialFiltersProps = {
  value: MaterialFilter;
  onChange: (value: MaterialFilter) => void;
};

export function MaterialFilters({ value, onChange }: MaterialFiltersProps) {
  return (
    <div className={styles.list} role="tablist" aria-label="Фильтр по категории">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(styles.tab, value === tab.id && styles.active)}
          onClick={() => onChange(tab.id as MaterialCategory | 'all')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

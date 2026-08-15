import { cn } from '@/shared/lib/cn';
import type { CropFilter } from '../model/types';
import styles from './CropFilters.module.css';

const TABS: Array<{ id: CropFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'grain', label: 'Зерновые' },
  { id: 'oilseed', label: 'Масличные' },
  { id: 'legume', label: 'Бобовые' },
];

type CropFiltersProps = {
  value: CropFilter;
  onChange: (value: CropFilter) => void;
};

export function CropFilters({ value, onChange }: CropFiltersProps) {
  return (
    <div className={styles.list} role="tablist" aria-label="Фильтр по категории">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(styles.tab, value === tab.id && styles.active)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

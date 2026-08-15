import { cn } from '@/shared/lib/cn';
import { AREA_FILTER_LABEL } from '../model/labels';
import type { AreaFilter, FieldFilters as FieldFiltersState } from '../model/types';
import styles from './FieldFilters.module.css';

type FieldFiltersProps = {
  value: FieldFiltersState;
  soils: string[];
  crops: string[];
  canReset: boolean;
  onChange: (next: FieldFiltersState) => void;
  onReset: () => void;
};

export function FieldFilters({ value, soils, crops, canReset, onChange, onReset }: FieldFiltersProps) {
  return (
    <div className={styles.row}>
      <label className={styles.field}>
        <span className={styles.label}>Почва</span>
        <select
          className={cn(styles.select, value.soil !== 'all' && styles.active)}
          value={value.soil}
          onChange={(event) => onChange({ ...value, soil: event.target.value })}
        >
          <option value="all">Все типы</option>
          {soils.map((soil) => (
            <option key={soil} value={soil}>
              {soil}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Предшествующая культура</span>
        <select
          className={cn(styles.select, value.previousCrop !== 'all' && styles.active)}
          value={value.previousCrop}
          onChange={(event) => onChange({ ...value, previousCrop: event.target.value })}
        >
          <option value="all">Все культуры</option>
          <option value="none">Нет предшественника</option>
          {crops.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Площадь</span>
        <select
          className={cn(styles.select, value.area !== 'all' && styles.active)}
          value={value.area}
          onChange={(event) => onChange({ ...value, area: event.target.value as AreaFilter })}
        >
          {(Object.keys(AREA_FILTER_LABEL) as AreaFilter[]).map((key) => (
            <option key={key} value={key}>
              {AREA_FILTER_LABEL[key]}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className={styles.reset} onClick={onReset} disabled={!canReset}>
        Сбросить фильтры
      </button>
    </div>
  );
}

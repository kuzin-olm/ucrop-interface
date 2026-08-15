import type { AreaFilter, FieldStatus } from './types';

export const FIELD_STATUS_LABEL: Record<FieldStatus, string> = {
  active: 'Активно',
  planned: 'Планируется',
  in_progress: 'В обработке',
  inactive: 'Не активно',
};

export const FIELD_STATUS_COLOR: Record<FieldStatus, string> = {
  active: '#2E7D32',
  planned: '#1565C0',
  in_progress: '#F9A825',
  inactive: '#90A4AE',
};

export const FIELD_SOIL_OPTIONS = [
  'Чернозём типичный',
  'Чернозём',
  'Каштановая',
  'Серая лесная',
  'Суглинок',
] as const;

export const AREA_FILTER_LABEL: Record<AreaFilter, string> = {
  all: 'Все диапазоны',
  lt50: '< 50 га',
  mid: '50–100 га',
  gt100: '> 100 га',
};

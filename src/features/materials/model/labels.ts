import type { MaterialCategory, MaterialStatus, MaterialUnit } from './types';

export const MATERIAL_CATEGORY_LABEL: Record<MaterialCategory, string> = {
  seeds: 'Семена',
  fertilizer: 'Удобрения',
  ppp: 'СЗР',
  fuel: 'ГСМ',
};

export const MATERIAL_UNIT_LABEL: Record<MaterialUnit, string> = {
  kg: 'кг',
  l: 'л',
  t: 'т',
  se: 'п.е.',
  pcs: 'шт',
};

export const MATERIAL_STATUS_LABEL: Record<MaterialStatus, string> = {
  active: 'Активен',
  inactive: 'Не используется',
};

export const MATERIAL_CATEGORIES: MaterialCategory[] = ['seeds', 'fertilizer', 'ppp', 'fuel'];
export const MATERIAL_UNITS: MaterialUnit[] = ['kg', 'l', 't', 'se', 'pcs'];

import type { CropCategory, CropStatus, MarginPotential } from './types';

export const STATUS_LABEL: Record<CropStatus, string> = {
  sowing_now: 'Сеем сейчас',
  planned: 'Планируем',
  history: 'История',
};

export const CATEGORY_LABEL: Record<CropCategory, string> = {
  grain: 'Зерновые',
  oilseed: 'Масличные',
  legume: 'Бобовые',
  other: 'Другое',
};

export const MARGIN_LABEL: Record<MarginPotential, string> = {
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая',
};

export const SOIL_OPTIONS = [
  'Чернозём',
  'Каштановая',
  'Серая лесная',
  'Дерново-подзолистая',
  'Суглинок',
] as const;

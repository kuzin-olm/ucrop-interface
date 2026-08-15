import type { PeriodFilter, PlanGoal, PlanStatus } from './types';

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Черновик',
  calculating: 'В расчёте',
  completed: 'Завершён',
  error: 'Ошибка',
};

export const PLAN_GOAL_LABEL: Record<PlanGoal, string> = {
  maximize_margin: 'Максимизация маржинальной прибыли',
};

export const PERIOD_FILTER_LABEL: Record<PeriodFilter, string> = {
  all: 'Весь период',
  '7d': '7 дней',
  '30d': '30 дней',
  year: 'Этот год',
};

export const UPCOMING_GOALS = [
  { id: 'minimize_risk', label: 'Минимизация рисков' },
  { id: 'maximize_yield', label: 'Максимизация урожайности' },
  { id: 'balance', label: 'Баланс прибыли и устойчивости' },
] as const;

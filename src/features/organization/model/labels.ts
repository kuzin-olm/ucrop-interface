import type { PaymentStatus, PlanId } from './types';

export const PLAN_LABEL: Record<PlanId, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const PLAN_DESCRIPTION: Record<PlanId, string> = {
  free: 'Подходит для знакомства с платформой',
  pro: 'Для хозяйств, которым нужно больше планов и сотрудников',
  enterprise: 'Для холдингов с несколькими организациями',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Оплачен',
  pending: 'Ожидает',
  cancelled: 'Отменён',
};

export const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: [
    'До 5 планов',
    'До 12 полей',
    'До 3 сотрудников',
    '1 одновременный расчёт',
    'Базовые агрономические инструменты',
    'Базовая поддержка',
  ],
  pro: [
    'До 40 планов',
    'До 80 полей',
    'До 20 сотрудников',
    '10 одновременных расчётов',
    'Приоритетная поддержка',
  ],
  enterprise: [
    'Расширенные лимиты по договорённости',
    'Несколько организаций',
    'Одновременные расчёты по договорённости',
    'Сопровождение внедрения',
  ],
};

export const FREE_FEATURES = PLAN_FEATURES.free;

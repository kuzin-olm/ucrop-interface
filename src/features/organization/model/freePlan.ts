import type { PlanId, Subscription } from './types';

export const PLAN_LIMITS: Record<PlanId, Subscription['limits']> = {
  free: {
    maxPlans: 5,
    maxFields: 12,
    maxEmployees: 3,
    maxConcurrentCalculations: 1,
  },
  pro: {
    maxPlans: 40,
    maxFields: 80,
    maxEmployees: 20,
    maxConcurrentCalculations: 10,
  },
  enterprise: {
    maxPlans: 200,
    maxFields: 400,
    maxEmployees: 100,
    maxConcurrentCalculations: 50,
  },
};

export const FREE_LIMITS = PLAN_LIMITS.free;

export const CONCURRENT_CALCULATION_LIMIT: Record<PlanId, number | null> = {
  free: 1,
  pro: 10,
  enterprise: null,
};

export function parsePlanId(value?: string): PlanId {
  if (value === 'pro' || value === 'enterprise') return value;
  return 'free';
}

export function buildSubscription(plan: PlanId, usage: Subscription['usage']): Subscription {
  return {
    plan,
    status: 'active',
    limits: PLAN_LIMITS[plan],
    usage,
  };
}

export function buildFreeSubscription(usage: Subscription['usage']): Subscription {
  return buildSubscription('free', usage);
}

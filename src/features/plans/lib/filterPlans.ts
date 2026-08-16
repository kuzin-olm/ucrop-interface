import type { PeriodFilter, PlanFilters, CalculationPlan } from '../model/types';

function matchesPeriod(iso: string, period: PeriodFilter): boolean {
  if (period === 'all') return true;
  const created = new Date(iso).getTime();
  const now = Date.now();
  if (period === '7d') return now - created <= 7 * 86_400_000;
  if (period === '30d') return now - created <= 30 * 86_400_000;
  return new Date(iso).getFullYear() === new Date().getFullYear();
}

export function filterPlans(
  plans: CalculationPlan[],
  filters: PlanFilters,
  currentUserId?: string,
): CalculationPlan[] {
  const query = filters.query.trim().toLowerCase();

  return plans.filter((plan) => {
    const matchesQuery =
      query.length === 0 ||
      plan.name.toLowerCase().includes(query) ||
      (plan.description ?? '').toLowerCase().includes(query);
    const matchesStatus = filters.status === 'all' || plan.status === filters.status;
    const matchesAuthor = filters.author === 'all' || plan.createdBy.id === filters.author;
    const matchesScope =
      filters.scope !== 'mine' || Boolean(currentUserId && plan.createdBy.id === currentUserId);
    return (
      matchesQuery &&
      matchesStatus &&
      matchesAuthor &&
      matchesScope &&
      matchesPeriod(plan.createdAt, filters.period)
    );
  });
}

export function hasActivePlanFilters(filters: PlanFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.status !== 'all' ||
    filters.author !== 'all' ||
    filters.period !== 'all'
  );
}

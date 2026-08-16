import type { CalculationPlan } from '@/features/plans/model/types';
import type { DashboardData } from '../model/types';

export function buildDashboard(
  plans: CalculationPlan[],
  seasonName: string,
  people: Array<{ id: string; name: string }> = [],
): DashboardData {
  const seasonal = plans;

  const plansByStatus = {
    calculating: seasonal.filter((plan) => plan.status === 'calculating').length,
    completed: seasonal.filter((plan) => plan.status === 'completed').length,
    draft: seasonal.filter((plan) => plan.status === 'draft').length,
    error: seasonal.filter((plan) => plan.status === 'error').length,
    total: seasonal.length,
  };

  const teamMap = new Map<
    string,
    { userId: string; name: string; created: number; inProgress: number; completed: number }
  >();
  people.forEach((person) => {
    teamMap.set(person.id, {
      userId: person.id,
      name: person.name,
      created: 0,
      inProgress: 0,
      completed: 0,
    });
  });
  seasonal.forEach((plan) => {
    const current = teamMap.get(plan.createdBy.id) ?? {
      userId: plan.createdBy.id,
      name: plan.createdBy.name,
      created: 0,
      inProgress: 0,
      completed: 0,
    };
    current.created += 1;
    if (plan.status === 'calculating') current.inProgress += 1;
    if (plan.status === 'completed') current.completed += 1;
    teamMap.set(plan.createdBy.id, current);
  });

  const teamActivity = Array.from(teamMap.values()).sort(
    (left, right) => right.created - left.created || right.completed - left.completed,
  );

  return { season: seasonName, plansByStatus, teamActivity };
}

import { useQuery } from '@tanstack/react-query';
import { useFields } from '@/features/fields/hooks/useFields';
import { planKeys } from '../api/queryKeys';
import { buildPlanResult } from '../lib/buildPlanResult';
import { usePlans } from './usePlans';

export function usePlanResult(planId: string | undefined) {
  const plansQuery = usePlans();
  const fieldsQuery = useFields();
  const plan = plansQuery.data?.find((item) => item.id === planId);

  const resultQuery = useQuery({
    queryKey: planId ? planKeys.result(planId) : ['plan-result', 'empty'],
    enabled: Boolean(planId && plan?.status === 'completed' && fieldsQuery.data),
    queryFn: () => {
      if (!plan || !fieldsQuery.data) {
        throw new Error('Нет данных для результата');
      }
      return Promise.resolve(buildPlanResult(plan, fieldsQuery.data));
    },
  });

  return {
    plan,
    result: resultQuery.data,
    isLoading: plansQuery.isLoading || fieldsQuery.isLoading || resultQuery.isLoading,
    isError: plansQuery.isError || fieldsQuery.isError || resultQuery.isError,
    refetch: () => {
      void plansQuery.refetch();
      void fieldsQuery.refetch();
      void resultQuery.refetch();
    },
  };
}

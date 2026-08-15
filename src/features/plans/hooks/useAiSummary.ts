import { useQuery } from '@tanstack/react-query';
import { planKeys } from '../api/queryKeys';
import { buildAiSummary } from '../lib/buildAiSummary';
import type { PlanResult } from '../model/resultTypes';

export function useAiSummary(result: PlanResult | undefined) {
  return useQuery({
    queryKey: result ? planKeys.aiSummary(result.planId) : ['plan-ai-summary', 'empty'],
    enabled: Boolean(result),
    staleTime: Infinity,
    queryFn: async () => {
      if (!result) throw new Error('Нет результата для сводки');
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });
      return buildAiSummary(result);
    },
  });
}

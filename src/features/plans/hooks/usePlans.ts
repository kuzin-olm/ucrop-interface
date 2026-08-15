import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useSeason } from '@/app/season';
import { planRepository } from '../api/planRepository';
import { planKeys } from '../api/queryKeys';
import type { CreatePlanInput } from '../model/types';

export function usePlans() {
  const { seasonId } = useSeason();
  return useQuery({
    queryKey: planKeys.all(seasonId),
    queryFn: () => planRepository.list(seasonId),
    refetchInterval: (query) => {
      const plans = query.state.data;
      return plans?.some((plan) => plan.status === 'calculating') ? 800 : false;
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<CreatePlanInput, 'seasonId'>) =>
      planRepository.create({
        ...input,
        seasonId,
        createdBy: user
          ? { id: user.id, name: user.name, role: user.role }
          : input.createdBy,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all(seasonId) });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: planRepository.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all(seasonId) });
    },
  });
}

export function useStartPlan() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: planRepository.start,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all(seasonId) });
    },
  });
}

export function useStopPlan() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: planRepository.stop,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all(seasonId) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: planRepository.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all(seasonId) });
    },
  });
}

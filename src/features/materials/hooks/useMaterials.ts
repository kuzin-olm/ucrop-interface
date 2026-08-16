import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSeason } from '@/app/season';
import { materialRepository } from '../api/materialRepository';
import { materialKeys } from '../api/queryKeys';
import type { CreateMaterialInput, UpdateMaterialInput } from '../model/types';

export function useMaterials() {
  const { seasonId } = useSeason();
  return useQuery({
    queryKey: materialKeys.all(seasonId),
    queryFn: () => materialRepository.list(seasonId),
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: (input: Omit<CreateMaterialInput, 'seasonId'>) =>
      materialRepository.create({ ...input, seasonId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.all(seasonId) });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: (input: UpdateMaterialInput) => materialRepository.update(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.all(seasonId) });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();
  return useMutation({
    mutationFn: materialRepository.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.all(seasonId) });
    },
  });
}

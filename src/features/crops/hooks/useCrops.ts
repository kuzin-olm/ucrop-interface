import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSeason } from '@/app/season';
import { cropRepository } from '../api/cropRepository';
import { cropKeys } from '../api/queryKeys';
import type { CreateCropInput } from '../model/types';

export function useCrops() {
  const { seasonId } = useSeason();
  return useQuery({
    queryKey: cropKeys.all(seasonId),
    queryFn: () => cropRepository.list(seasonId),
  });
}

export function useCreateCrop() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: (input: Omit<CreateCropInput, 'seasonId'>) =>
      cropRepository.create({ ...input, seasonId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cropKeys.all(seasonId) });
    },
  });
}

export function useUpdateCrop() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: cropRepository.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cropKeys.all(seasonId) });
    },
  });
}

export function useDeleteCrop() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: cropRepository.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cropKeys.all(seasonId) });
    },
  });
}

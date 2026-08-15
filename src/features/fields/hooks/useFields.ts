import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSeason } from '@/app/season';
import { fieldRepository } from '../api/fieldRepository';
import { fieldKeys } from '../api/queryKeys';
import type { CreateFieldInput } from '../model/types';

export function useFields() {
  const { seasonId } = useSeason();
  return useQuery({
    queryKey: fieldKeys.all(seasonId),
    queryFn: () => fieldRepository.list(seasonId),
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: (input: Omit<CreateFieldInput, 'seasonId'>) =>
      fieldRepository.create({ ...input, seasonId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fieldKeys.all(seasonId) });
    },
  });
}

export function useUpdateField() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: fieldRepository.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fieldKeys.all(seasonId) });
    },
  });
}

export function useDeleteField() {
  const queryClient = useQueryClient();
  const { seasonId } = useSeason();

  return useMutation({
    mutationFn: fieldRepository.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fieldKeys.all(seasonId) });
    },
  });
}

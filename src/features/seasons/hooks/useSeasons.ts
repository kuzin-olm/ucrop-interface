import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { seasonKeys } from '../api/queryKeys';
import { seasonRepository } from '../api/seasonRepository';

export function useSeasons() {
  const { organization } = useAuth();
  const organizationId = organization?.id ?? '';

  return useQuery({
    queryKey: seasonKeys.all(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => Promise.resolve(seasonRepository.list(organizationId)),
    staleTime: Infinity,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const organizationId = organization?.id ?? '';

  return useMutation({
    mutationFn: async (name: string) => seasonRepository.create(name, organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: seasonKeys.all(organizationId) });
    },
  });
}

export function useRenameSeason() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const organizationId = organization?.id ?? '';

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => seasonRepository.rename(id, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: seasonKeys.all(organizationId) });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const organizationId = organization?.id ?? '';

  return useMutation({
    mutationFn: async (id: string) => seasonRepository.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: seasonKeys.all(organizationId) });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { employeeRepository } from '../api/employeeRepository';
import { employeeKeys } from '../api/queryKeys';
import type { InviteEmployeeInput, UpdateEmployeeInput } from '../model/types';

export function useEmployees() {
  const { organization } = useAuth();
  const organizationId = organization?.id ?? '';
  return useQuery({
    queryKey: employeeKeys.all(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => employeeRepository.list(organizationId),
  });
}

export function useInviteEmployee() {
  const queryClient = useQueryClient();
  const { organization, refreshUser } = useAuth();
  const organizationId = organization?.id ?? '';

  return useMutation({
    mutationFn: (input: Omit<InviteEmployeeInput, 'organizationId'>) =>
      employeeRepository.invite({ ...input, organizationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all(organizationId) });
      refreshUser();
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { organization, refreshUser } = useAuth();
  const organizationId = organization?.id ?? '';

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeeRepository.update(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all(organizationId) });
      refreshUser();
    },
  });
}

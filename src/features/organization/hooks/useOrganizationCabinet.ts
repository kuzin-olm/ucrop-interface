import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { authRepository } from '@/features/auth/api/authRepository';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useFields } from '@/features/fields/hooks/useFields';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { paymentRepository } from '../api/paymentRepository';
import { organizationKeys } from '../api/queryKeys';
import { buildSubscription, parsePlanId } from '../model/freePlan';

export function useOrganizationCabinet() {
  const { organization, refreshUser } = useAuth();
  const organizationId = organization?.id ?? '';
  const plans = usePlans();
  const fields = useFields();
  const employees = useEmployees();
  const payments = useQuery({
    queryKey: organizationKeys.payments(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => paymentRepository.list(organizationId),
  });

  const subscription = buildSubscription(parsePlanId(organization?.plan), {
    plans: plans.data?.length ?? 0,
    fields: fields.data?.length ?? 0,
    employees: employees.data?.length ?? 0,
    concurrentCalculations: plans.data?.filter((plan) => plan.status === 'calculating').length ?? 0,
  });

  const updateOrganization = useMutation({
    mutationFn: (input: { name: string; inn?: string; region?: string }) => {
      if (!organizationId) throw new Error('Организация не найдена');
      return Promise.resolve(authRepository.updateOrganization({ id: organizationId, ...input }));
    },
    onSuccess: () => {
      refreshUser();
    },
  });

  const queryClient = useQueryClient();
  const refetch = () => {
    void plans.refetch();
    void fields.refetch();
    void employees.refetch();
    void queryClient.invalidateQueries({ queryKey: organizationKeys.payments(organizationId) });
  };

  return {
    organization,
    subscription,
    payments: payments.data ?? [],
    isLoading: plans.isLoading || fields.isLoading || employees.isLoading || payments.isLoading,
    isError: plans.isError || fields.isError || employees.isError || payments.isError,
    refetch,
    updateOrganization,
  };
}

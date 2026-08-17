export const organizationKeys = {
  payments: (organizationId: string) => ['organization', 'payments', organizationId] as const,
};
